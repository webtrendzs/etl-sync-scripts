let express = require('express');
let router = express.Router();
let PatientBuild = require('../app/patient-build');
const BuildHivSummary = require('../app/build-hiv-summary');
const ScheduleHivSummary = require('../app/schedule-hiv-summary');
const Moment = require('moment');
const RedisPubSub     = require('../app/redis-pub-sub');
const RedisPubSubInst = new RedisPubSub();

let buildJob = new PatientBuild();

router.get('/partial', function(req, res, next) {
	res.render('build', { title: 'Partial Patient Build', build_started: false, partial: true });
});

router.post('/partial', function(req, res, next) {
	
	try {
		let startedAt = Moment();
		console.log('Starting at:', startedAt.toLocaleString());
		buildJob.partialBuild(req.body.patientIds).then(() => {
			console.log('Finshed all jobs.');
			let endedAt = Moment();
			let diff = endedAt.diff(startedAt, 'seconds');
			console.log('Took ' + diff + ' seconds.');
		}).catch((err) => {
			console.error('error running hiv summary job');
			throw err;
		});
	} catch (error) {
		console.error('Error running pipeline', error);
	}
	process.stdin.resume();
	
	res.render('index', { title: 'Build Process Started', build_started: true, partial: true });
});

router.get('/full', function(req, res, next) {
	res.render('build', { title: 'Full Patient Build', build_started: false, partial: false });
});

router.post('/full', function(req, res, next) {
	
	try {
		let startedAt = Moment();
		console.log('Starting at:', startedAt.toLocaleString());
		buildJob.fullBuild(req.body.patientIds).then(() => {
			console.log('Finished all jobs.');
			let endedAt = Moment();
			let diff = endedAt.diff(startedAt, 'seconds');
			console.log('Took ' + diff + ' seconds.');
		}).catch((err) => {
			console.error('error running hiv summary job');
			throw err;
		});
	} catch (error) {
		console.error('Error running pipeline', error);
	}
	process.stdin.resume();
	
	res.render('index', { title: 'Build Process Started', build_started: true, partial: false });
});

router.get('/recovery', function(req, res, next) {
	res.render('index', { title: 'Patient summaries recovery', build_started: false });
});

router.post('/recovery', function(req, res, next) {
	try {
		let buildJob = new BuildHivSummary();
		let scheduleJob = new ScheduleHivSummary();
		let startedAt = Moment();
		RedisPubSubInst.publish('log', 'Starting at:' + startedAt.toLocaleString());
		scheduleJob.runJob().then((queued) => {
			buildJob.runJob().then(() => {
				RedisPubSubInst.publish('log', 'Finished all jobs.');
				let endedAt = Moment();
				let diff = endedAt.diff(startedAt, 'seconds');
				RedisPubSubInst.publish('log', 'Took ' + diff + ' seconds.');
				console.log();
			}).catch((err) => {
				RedisPubSubInst.publish('log', 'error running hiv summary job');
				console.error('error running hiv summary job');
				throw err;
			});
		}).catch((err) => {
			RedisPubSubInst.publish('log', 'Failed to schedule patients with the error: ');
			RedisPubSubInst.publish('log', err);
			console.log('Failed to schedule patients with the error: ', err);
		})
		
	} catch (error) {
		RedisPubSubInst.publish('log', 'Error running pipeline');
		RedisPubSubInst.publish('log', error);
		console.error('Error running pipeline', error);
	}
	res.json({ title: `${req.body.buildType} Process Started`, build_started: true });
});

module.exports = router;

var express = require('express');
var router = express.Router();
let BuildHivSummary = require('../app/build-hiv-summary');
let ScheduleHivSummary = require('../app/schedule-hiv-summary');
let Moment = require('moment');

router.get('/', function(req, res, next) {
	res.redirect('/build/partial');
});

router.get('/partial', function(req, res, next) {
	res.render('build', { title: 'Partial Patient Build', build_started: false, partial: true });
});

router.post('/partial', function(req, res, next) {
	
	try {
		let buildJob = new BuildHivSummary();
		let startedAt = Moment();
		console.log('Starting at:', startedAt.toLocaleString())
		buildJob.runJob().then(() => {
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
		let buildJob = new BuildHivSummary();
		let startedAt = Moment();
		console.log('Starting at:', startedAt.toLocaleString())
		buildJob.runJob().then(() => {
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
	
	res.render('index', { title: 'Build Process Started', build_started: true, partial: false });
});

module.exports = router;

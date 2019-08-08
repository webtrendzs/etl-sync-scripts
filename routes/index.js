const express = require('express');
const router = express.Router();
const BuildHivSummary = require('../app/build-hiv-summary');
const RedisPubSub = require('../app/redis-pub-sub');
const ScheduleHivSummary = require('../app/schedule-hiv-summary');
const Moment = require('moment');
const RedisPubSubInst = new RedisPubSub();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Patient summaries recovery', build_started: false });
});

router.post('/', function(req, res, next) {
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

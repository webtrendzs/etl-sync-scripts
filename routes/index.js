var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	let BuildHivSummary = require('../app/build-hiv-summary');
	let ScheduleHivSummary = require('../app/schedule-hiv-summary');
	let Moment = require('moment');
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
	
	res.render('index', { title: 'Express' });
});

module.exports = router;

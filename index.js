let BuildHivSummary = require('./build-hiv-summary');
let ScheduleHivSummary = require('./schedule-hiv-summary');
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

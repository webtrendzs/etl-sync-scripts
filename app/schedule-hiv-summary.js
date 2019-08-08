let QueryRunner = require('./query-runner');

let queryRunner = new QueryRunner().getInstance();

class ScheduleHivSummary {
	
	constructor () {
	
	}
	
	runJob () {
		return new Promise((resolve, reject) => {
			let sql = `CALL schedule_hiv_summary()`;
			
			queryRunner.runQuery(sql)
				.then((result) => {
					if (result.results) {
						console.log(result.results);
					} else {
						console.log('Error scheduling hiv summary');
					}
					resolve(result);
				})
				.catch((err) => {
					// handle error
					reject(err);
				});
			
		});
	}
	
}

module.exports = ScheduleHivSummary;

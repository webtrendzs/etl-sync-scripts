let QueryRunner = require('./query-runner');
let async       = require('async');

let queryRunner = new QueryRunner().getInstance();

class BuildHivSummary {
	
	constructor () {
	
	}
	
	runJob () {
		return new Promise((resolve, reject) => {
			let sql = `select count(*) as items_in_queue from flat_hiv_summary_build_queue`;
			
			queryRunner.runQuery(sql)
				.then((result) => {
					let items = result.results[0].items_in_queue;
					console.log('Items in queue:' + items);
					
					let batches = items < 4 ? 1 : items / 4;
					batches     = Math.ceil(batches);
					console.log('batches: ' + batches);
					
					let queries = [];
					
					for (let i = 0; i < batches; i++) {
						let qry = `call generate_hiv_summary_v15_11("build",${i},50,20);`;
						queries.push(async.reflect((callback) => {
							queryRunner.runQuery(qry).then((result) => callback(null, result)).catch((err) => callback(err))
						}));
					}
					
					async.parallel(queries, (err, results) => {
						if (err) {
							reject(err);
							console.error('Error running all the queries', err);
						} else {
							console.log('finished running all the queries');
							resolve(results.map(result => result.value));
						}
						
					});
				})
				.catch((err) => {
					reject(err);
				});
			
		});
	}
	
}

module.exports = BuildHivSummary;

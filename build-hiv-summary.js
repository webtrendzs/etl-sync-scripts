
let QueryRunner = require('./query-runner');

let queryRunner = new QueryRunner().getInstance();

class BuildHivSummary {

    constructor() {

    }

    runJob() {
        return new Promise((resolve, reject) => {
            let sql = `select count(*) as items_in_queue from etl.flat_hiv_summary_build_queue`;

            queryRunner.runQuery(sql)
                .then((result) => {
                    let items = result.results[0].items_in_queue;
                    console.log('Items in queue:' + items);

                    let batches = items < 50 ? 1 : items / 50;
                    batches = Math.ceil(batches);
                    console.log('batches: ' + batches);

                    let queries = [];

                    for(let i =0; i < batches; i++) {
                        let qry = `call generate_hiv_summary_v15_7("build",${i},50,20);`;
                        queries.push(queryRunner.runQuery(qry));
                    }

                    Promise.all(queries).then((results)=>{
                        console.log('finished running all the queries', results);
                        resolve(results);
                    }).catch((err)=>{
                        reject(err);
                        console.error('Error running all the queries', err);
                    });

                    //resolve(parallelism)
                })
                .catch((err) => {
                    // handle error
                    reject(err);
                });

        });
    }

}

module.exports = BuildHivSummary;

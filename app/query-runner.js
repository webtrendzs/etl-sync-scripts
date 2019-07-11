let mysql = require('mysql');

let config = require('./config.js');

let cleanup = require('./cleanup');

class QueryRunner {

    constructor() {
        this.pool = mysql.createPool(config);
        let self = this;
        cleanup.Cleanup(()=> {
            this.releasePool(self.pool);
        });
    }

    runQuery(sqlStatement) {
        console.log('Executing: ' + sqlStatement);
        let self = this;
        return new Promise((resolve, reject) => {
            self.pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                } // not connected!

                // Use the connection
                connection.query(sqlStatement, function (error, results, fields) {
                    // When done with the connection, release it.
                    connection.release();

                    // Handle error after the release.
                    if (error) {
                        console.error('Error running sql: ' + sqlStatement, error);

                        // Error handling through repsonse object, to allow others to run to completion. 
                        resolve({
                            error: error
                        });
                    } else {
                        let toReturn = {
                            results: results,
                            fields: fields
                        }
    
                        resolve(toReturn);

                    }

                    
                    // Don't use the connection here, it has been returned to the pool.
                });
            });
        });

    }

    releasePool(pool) {
        console.log('Closing pool');
        pool.end(function (err) {
            if (err) {
                console.error('Could not end all conections', err);
            } else {
                console.log('Ended mysql connection pool');
            }
        });
    }
}

class Singleton {

    constructor() {
        if (!Singleton.instance) {
            Singleton.instance = new QueryRunner();
        }
    }

    getInstance() {
        return Singleton.instance;
    }

}

module.exports = Singleton;


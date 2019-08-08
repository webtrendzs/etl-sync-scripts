let QueryRunner = require('./query-runner');
let config      = require('./config');

let queryRunner = new QueryRunner().getInstance();
let async       = require('async');

class PatientBuild {
	constructor () {
	}
	
	partialBuild (patientIds) {
		this.patientIds = patientIds;
		return new Promise((resolve, reject) => {
			async.parallel({
				hiv: async.reflect((callback) => {
					this.buildFlatHIVSummary(callback);
				}),
				appointments: async.reflect((callback) => {
					this.buildFlatAppointments(callback);
				})
			}, (err, results) => {
				if (err) {
					reject(err)
				} else {
					resolve(Object.values(results));
				}
			});
		});
	}
	
	fullBuild (patientIds) {
		this.patientIds = patientIds;
		return new Promise((resolve, reject) => {
			this.addToFlatEtlDataQueue(() => {
				queryRunner.runQuery(`call etl.${config.procedures.full}()`).then((result) => {
					resolve(this.partialBuild(patientIds));
				}).catch((err) => reject(err));
			});
		});
	}
	
	queuePatientIds (type, callback) {
		
		let queries   = [];
		let queue_sql = '';
		this.patientIds.split(',').forEach((patientId) => {
			switch (type) {
				case 'hiv':
					queue_sql = `insert into etl.flat_hiv_summary_build_queue (SELECT patient_id FROM amrs.patient_identifier where identifier like '%${patientId}%')`;
					break;
				case 'appointments':
					queue_sql = `insert into etl.flat_appointment_build_queue (SELECT patient_id FROM amrs.patient_identifier where identifier like '%${patientId}%')`;
					break;
				case 'full':
					queue_sql = `insert into etl.rebuild_etl_data_queue (SELECT patient_id FROM amrs.patient_identifier where identifier like '%${patientId}%');`;
					break;
				default:
					return '';
			}
			queries.push(async.reflect((cb) => {
				queryRunner.runQuery(queue_sql).then((result) => cb(null, result)).catch((err) => cb(err));
			}));
			
		});
		
		async.parallel(queries, (err, results) => {
			callback(err, results.map(result => result.value));
		});
		
	}
	
	addToFlatHivSummaryBuildQueue (callback) {
		this.queuePatientIds('hiv', callback);
	}
	
	buildFlatHIVSummary (callback) {
		
		async.waterfall([
			this.addToFlatHivSummaryBuildQueue,
			(itemsInQueue, cb) => {
				queryRunner.runQuery(`call etl.${config.procedures.hiv}("build",1000,100,10)`).then((result) => cb(null, result)).catch((err) => cb(err))
			}
		], (err, result) => {
			callback(err, result)
		});
		
	}
	
	addToFlatAppointmentsBuildQueue (callback) {
		this.queuePatientIds('appointments', callback);
	}
	
	buildFlatAppointments (callback) {
		async.waterfall([
			this.addToFlatAppointmentsBuildQueue,
			(itemsInQueue, cb) => {
				queryRunner.runQuery(`call etl.${config.procedures.appointments}("build",1000,100,20)`).then((result) => cb(null, result)).catch((err) => cb(err))
			}
		], (err, result) => {
			callback(err, result)
		});
	}
	
	addToFlatEtlDataQueue (callback) {
		this.queuePatientIds('full', callback);
	}
	
}


class PatientBuildSingleton {
	
	constructor() {
		if (!PatientBuildSingleton.instance) {
			PatientBuildSingleton.instance = new PatientBuild();
		}
		return this.getInstance();
	}
	
	getInstance() {
		return PatientBuildSingleton.instance;
	}
	
}

module.exports = PatientBuildSingleton;

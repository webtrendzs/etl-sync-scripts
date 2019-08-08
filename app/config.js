let config = {
	database: {
		host    : 'localhost',
		user    : 'root',
		password: '',
		database: 'test_etl'
	},
	procedures:{
		hiv: 'generate_hiv_summary_v15_11',
		appointments: 'generate_flat_appointment_v1_1',
		full: 'rebuild_etl_data_v1_1',
		schedule: 'schedule_hiv_summary'
	}
 
};

 
module.exports = config;
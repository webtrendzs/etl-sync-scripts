const redis = require("redis"),
      pub   = redis.createClient(),
      sub   = redis.createClient();

module.exports = class RedisPubSub {
	constructor () {
	}
	
	publish (channel, message) {
		sub.subscribe(channel, () => {
			pub.publish(channel, message);
		});
	}
	
	subscribe(channel) {
		sub.subscribe(channel);
	}
	
	listen () {
		return sub;
	}
};
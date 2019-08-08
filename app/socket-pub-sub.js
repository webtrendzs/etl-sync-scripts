const redis = require("redis"),
      pub = redis.createClient(),
      sub = redis.createClient();

export class SocketPubSub {
	constructor() {
		sub.subscribe("log");
	}
	
	onSubscribe() {
		sub.on("subscribe", (channel, count) => {
			pub.publish("log", "I am logging this message.");
		});
	}
	
	onLog() {
		sub.on("log", (channel, message) => {
		
		});
	}
}
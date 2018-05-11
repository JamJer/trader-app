/**
 * Trader channel
 */
const request = require('request');
const rp = require('request-promise');
const config = require("../config/config.default");
const {op} = require('./operation');
const {db} = require('./db');

class trader{
	constructor(){

	}

	update_binance_cfg(event,arg){
		console.log("Receive update binance config request");
		console.log(arg);
			db.store_binance_api_key(arg.username, arg.apikey, arg.apisecret,
				(err,msg)=>{
				if(err)
					console.log(err);
				console.log(msg);
				}
		);
	}

	async buy(event,arg){
		console.log("Receive trade bot buy request");
		// Test data
		let symbol = "BTCUSDT";
		let quantity = 1;
		let price = 100;
		
		let result = await op.buy(symbol, quantity, price);
		console.log(result);
		db.store_trade_log(arg.username, "BUY", symbol, quantity, price);
	}

	async sell(event,arg){
		console.log("Receive trade bot sell request");
		// Test data
		let symbol = "BTCUSDT";
		let quantity = 1;
		let price = 100;
		
		let result = await op.sell(symbol, quantity, price);
		console.log(result);
		db.store_trade_log(arg.username, "SELL", symbol, quantity, price);
	}

	update_ma(event,arg){
		var options = {
			uri: config.server.url+":"+config.server.port+"/trade/ma/"+arg.maType,
			json: true // Automatically parses the JSON string in the response
		};
	
		rp(options)
			.then(function (repos) {
				if(repos.msg) {
					console.log(repos.msg);
				}else{
					console.log('Response %d data', repos.length);
				}
				
			})
			.catch(function (err) {
				// API call failed...
				console.log(err);
			});
	}
}

module.exports = {
	trader: new trader()
}
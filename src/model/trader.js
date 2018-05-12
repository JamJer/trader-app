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
		this.sell = 0;
		this.buy = 0;
	}

	/**
	 * Main Entry of trader, receive the trade operation command from ipcRenderer
	 * - And then mapping to corresponding action
	 * 
	 * @param arg.cmd command type 
	 * @param arg.coin coin type 
	 * @param arg.val value with current command 
	 * 
	 */
	main_entry(event,arg){
		switch(arg.cmd){
			case "sell": 
				console.log(`User will sell: ${arg.val}(${arg.coin})`);
				this.sell+=parseInt(arg.val);
				console.log(this.sell)
				break;
			case "buy": 
				console.log(`User will buy: ${arg.val}(${arg.coin})`);
				this.buy+=parseInt(arg.val);
				console.log(this.buy)
				break;
			case "close": 
				// send back today value to display
				let self = this;
				event.sender.send('settlement',{
					total_sell: this.sell,
					total_buy: this.buy
					/** TODO: coin type */
				});
				break;
			case "reset":
				this.sell = 0;
				this.buy = 0;
				break;
		}
	}

	/*update_binance_cfg(event,arg){
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
	}*/
}

const t = new trader();

module.exports = t;
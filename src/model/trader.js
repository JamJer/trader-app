/**
 * Trader channel
 * 
 * Dealing with Database, Multiple different module
 * Trade bot will use this module to store, load, communicate with other.
 * 
 */
const rs = require('randomstring');
const moment = require('moment');
const request = require('request');
const rp = require('request-promise');
const config = require("../config/config.default");
const {op} = require('./trade_op');
const {db} = require('./db');

class trader{
	constructor(){
	}

	/**
	 * Main Entry of trader, receive the trade operation command from ipcRenderer
	 * - And then mapping to corresponding action
	 * 
	 * @param arg.cmd 				command type 
	 * @param arg.market  			select coin market
	 * @param arg.quantity 			quantity value
	 * @param arg.price_sell		price when you sell 
	 * @param arg.price_buyin		price when you buy in
	 * 
	 */
	main_entry(event,arg){
		/**
		 * 
		 * @param arg.cmd 
		 * 
		 * @function trade store one deal into database
		 * 
		 * @function trade_log fetch all the trading log return
		 * 
		 */
		switch(arg.cmd){
			/**
			 * ==================== cmd: trade ====================
			 */
			case "trade":
				/**
				 * Get the information of trade, and then store into database
				 */
				let trade_id = rs.generate(7);
				let trade_date = moment().format('MMMM Do YYYY, h:mm:ss a');;

				// calculate profit
				let profit = parseFloat(arg.quantity)*(parseFloat(arg.price_sell)-parseFloat(arg.price_buyin));

				// store in database
				db.store_deal_log(trade_id,trade_date,arg.market,arg.quantity,arg.price_sell,arg.price_buyin,profit,"Completed",
					(err,msg)=>{
						// Get all the trading log from database
						db.list_deal_log((err,rows)=>{
							event.sender.send('update_trading_chart',{
								rows: rows
							});
						})
						
					});

				break;
			/**
			 * ==================== cmd: trade_log ====================
			 */
			case "trade_log":
				db.list_deal_log((err,rows)=>{
					event.sender.send('update_trading_chart',{
						rows: rows
					});
				})
				break;
		}
	}


	/**
	 * 
	 * Read instance 
	 */

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
const Binance = require('binance-api-node').default
const config = require("../config/config.default");
const {db} = require('./db');

class trader {
    constructor(){
		let trade_binance_apiKey = null;
		let trade_binance_apiSecret = null;
    }
	
	/* 從db取得使用者API Key */
	async prepare(username) {
		let self = this;
		console.log("prepare trader");
		db.get_binance_api_key(username, (err,data)=>{
			if(err) throw data;
			self.trade_binance_apiKey = data.binance_apikey;
			self.trade_binance_apiSecret = data.binance_apisecret;
			console.log("success get user api key from db");
		})
	}
	
	/* 購買 */
	async buy(symbol, quantity, price) {
		var result={};
		try {
			let self = this;
			if(self.trade_binance_apiKey==null) {
				throw "mising binance api key";
			}
			const client = Binance({
			  apiKey: self.trade_binance_apiKey,
			  apiSecret: self.trade_binance_apiSecret,
			});
			const dateTime = Date.now();
			const timestamp = Math.floor(dateTime);
			var serverTime = await client.time();
			var recvWindow = config.trade.binance_recvWindow;
			if (timestamp < (serverTime + 1000) && (serverTime - timestamp) <= recvWindow) {
				return await client.order({
				  symbol: symbol,
				  side: "BUY",
				  quantity: quantity,
				  price: price,
				})
			} else {
			  throw "伺服器延遲過高或電腦時間不準確";
			}
		} catch(err) {
			result.msg = err.message;
			return result;
		}
	}
	
	/* 賣出 */
	async sell(symbol, quantity, price) {
		var result={};
		try {
			let self = this;
			if(self.trade_binance_apiKey==null) {
				throw "mising binance api key";
			}
			const client = Binance({
			  apiKey: self.trade_binance_apiKey,
			  apiSecret: self.trade_binance_apiSecret,
			});
			const dateTime = Date.now();
			const timestamp = Math.floor(dateTime);
			var serverTime = await client.time();
			var recvWindow = config.trade.binance_recvWindow;
			if (timestamp < (serverTime + 1000) && (serverTime - timestamp) <= recvWindow) {
			  return await client.order({
				symbol: symbol,
				side: "SELL",
				quantity: quantity,
				price: price
			  })
			} else {
			  throw "伺服器延遲過高或電腦時間不準確";
			}
			
		} catch(err) {
			result.msg = err.message;
			return result;
		}
	}
}

module.exports = {
    trader: new trader()
}
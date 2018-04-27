const Binance = require('binance-api-node').default
const config = require("../config/config.default");
/* ↓↓↓ Should get from local db ↓↓↓ */
const client = Binance({
  apiKey: config.trade_binance_apiKey,
  apiSecret: config.trade_binance_apiSecret,
});

class trader {
    constructor(){
        
    }
	
	/* 購買 */
	async buy(symbol, quantity, price) {
		var result={};
		try {
			const dateTime = Date.now();
			const timestamp = Math.floor(dateTime);
			var serverTime = await client.time();
			var recvWindow = config.trade_binance_recvWindow;
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
			const dateTime = Date.now();
			const timestamp = Math.floor(dateTime);
			var serverTime = await client.time();
			var recvWindow = config.trade_binance_recvWindow;
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
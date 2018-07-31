/**
 * Trade Cryptocurrency convert models 
 * 
 * 加密貨幣換算機制
 * 
 */
const Binance = require('binance-api-node').default

class currency_convert{
    constructor(){
        this.client = Binance()
    }

    async convertLimitBTCToBuyVolumne(buyBTC,buySymbol,buySymbolNowPrice){
    	console.log("[CURRENCY CONVERT PROCESS] BUY BTC: "+buyBTC+" BUY SYMBOL: "+buySymbol+" BUY SYMBOL NOW PRICE: "+buySymbolNowPrice)
	    try{
	        let price = await this.client.prices();
	        let buySymbolPrice = parseFloat(price[buySymbol]);
	        let nowQuote = parseSymbol(buySymbol)
	        let newLimitBuyVolumne = 0
	        switch(nowQuote){
	        	case 'USDT':
	        	    let BTCToUSDTPrice = parseFloat(price["BTCUSDT"]); // 一個BTC等於多少USDT
	        	    let buyBTCToUSDTPrice = buyBTC * BTCToUSDTPrice // 我們要買入的幾個BTC(限額數量)X一個BTC的USDT價格 = 目前買入的USDT限額總價格
	        	    newLimitBuyVolumne = buyBTCToUSDTPrice/buySymbolNowPrice // 目前買入的USDT限額總價格 除以 要買入的貨幣的USDT價格 = 要買入的貨幣的數量
	        	    console.log("[CURRENCY CONVERT PROCESS] CASE: USDT BTCUSDT: "+BTCToUSDTPrice+" BUY PRICE: "+buyBTCToUSDTPrice+" NEW VOLUMNE: "+newLimitBuyVolumne)
	        	    break
	        	case 'ETH':
	        		let BTCToETHPrice = 1.0/parseFloat(price["ETHBTC"]);// 一個BTC等於多少ETH
	        		let buyBTCToETHPrice = buyBTC * BTCToETHPrice // 我們要買入的幾個BTC(限額數量)X一個BTC的ETH價格 = 目前買入的ETH限額總價格
	        		newLimitBuyVolumne = buyBTCToETHPrice/buySymbolNowPrice // 目前買入的ETH限額總價格 除以 要買入的貨幣的ETH價格 = 要買入的貨幣的數量
	        		console.log("[CURRENCY CONVERT PROCESS] CASE: ETH ETHBTC: "+BTCToETHPrice+" BUY PRICE: "+buyBTCToETHPrice+" NEW VOLUMNE: "+newLimitBuyVolumne)
	        	    break
	        	case 'BTC':
	        		newLimitBuyVolumne = buyBTC/buySymbolNowPrice // 我們要買入的幾個BTC(限額數量) 除以 要買入的貨幣的BTC價格 = 要買入的貨幣的數量
	        		console.log("[CURRENCY CONVERT PROCESS] CASE: BTC NEW VOLUMNE: "+newLimitBuyVolumne)
	        	    break
	        	case 'BNB':
	        		let BTCToBNBPrice = 1.0/parseFloat(price["BNBBTC"]); // 一個BTC等於多少BNB
	        		let buyBTCToBNBPrice = buyBTC * BTCToBNBPrice // 我們要買入的幾個BTC(限額數量)X一個BTC的BNB價格 = 目前買入的BNB限額總價格
	        		newLimitBuyVolumne = buyBTCToBNBPrice/buySymbolNowPrice // 目前買入的BNB限額總價格 除以 要買入的貨幣的BNB價格 = 要買入的貨幣的數量
	        		console.log("[CURRENCY CONVERT PROCESS] CASE: BNB BNBBTC: "+BTCToBNBPrice+" BUY PRICE: "+buyBTCToBNBPrice+" NEW VOLUMNE: "+newLimitBuyVolumne)
	        	    break
	        	default:
	        	    console.log("[CURRENCY CONVERT][錯誤 無法找到對應的QUOTE]")
	        	    break
	        }
	        return newLimitBuyVolumne
	    }
	    catch(err){
	        let result = {};
	        result.msg = err;
	        console.log(err)
	        return result;
	    }
    }
}

// get SYMBOL quote assets e.g. BTCUSDT => USDT
function parseSymbol(symbol){
    const baseCurrencies = /(\w+)((USDT)|(ETH)|(BTC)|(BNB))$/g;
    const result = baseCurrencies.exec(symbol)[2];
    return result
}

module.exports = currency_convert

/**
 * This program is dealing with the account command 
 * Using docker command style
 */
const Binance = require('binance-api-node').default;
const {db} = require("./db")
const config = require('../config/config.default');

class account{
    /**
     * Send request to remote server, to get user basic information
     * @param {*} event event object from ipcMain
     * @param {*} arg arg object (e.g data send from ipcRender), need to reference spec
     */
    async accountInfo(event,arg){
        db.get_binance_api_key(config.username, (err,data)=>{
            if(err) throw data;
            console.log("success get user api key from db");
            console.log("API Key: "+data.binance_apikey)
            console.log("API Secret:"+data.binance_apisecret)
            
            getUserInfo(event,data.binance_apikey,data.binance_apisecret)
        })
    }

    async accountTradeRecord(event,arg){
      db.get_binance_api_key(config.username, (err,data)=>{
            if(err) throw data;
            console.log("success get user api key from db");
            console.log("API Key: "+data.binance_apikey)
            console.log("API Secret:"+data.binance_apisecret)
            
            getTradeRecord(event,arg.symbol,data.binance_apikey,data.binance_apisecret)
        })
    }
}

async function getUserInfo(event,apiKey,apiSecret){
    let client = Binance({apiKey: apiKey, apiSecret: apiSecret})
    const dateTime = Date.now();
    const timestamp = Math.floor(dateTime);
    let serverTime = await client.time();
    console.log("Client time: "+timestamp)
    console.log("Server time: "+serverTime)
    console.log("DIFF: "+(timestamp - serverTime))
    let recvWindow = config.trade.binance_recvWindow;
    if (timestamp < (serverTime + 1000) && (serverTime - timestamp) <= recvWindow) {
      let acc_info = await client.accountInfo({recvWindow: 10000000})
      console.log(acc_info)
      event.sender.send('recieve_account_info',{acc_data: acc_info});
    } else {
      throw "Error: 伺服器延遲過高或電腦時間不準確"
    }
}

async function getTradeRecord(event,symbol,apiKey,apiSecret){
    let client = Binance({apiKey: apiKey, apiSecret: apiSecret})
    const dateTime = Date.now();
    const timestamp = Math.floor(dateTime);
    let serverTime = await client.time();
    console.log("Client time: "+timestamp)
    console.log("Server time: "+serverTime)
    console.log("DIFF: "+(timestamp - serverTime))
    let recvWindow = config.trade.binance_recvWindow;
    if (timestamp < (serverTime + 1000) && (serverTime - timestamp) <= recvWindow) {
      let myTrades = await client.myTrades({symbol: symbol})
      console.log(myTrades)
      event.sender.send('recieve_mytrades_info',{trades: myTrades});
    } else {
      throw "Error: 伺服器延遲過高或電腦時間不準確"
    }
}

module.exports = {
    account: new account()
}
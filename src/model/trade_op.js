/**
 * Trade Bot models 
 * 
 * Operations of trade_bot
 * 
 */
const Binance = require('binance-api-node').default
const config = require("../config/config.default")
const {db} = require("./db")

const trade_model = {}
// apikey/secret 
trade_model.apiKey = config.trade.binance_apiKey
trade_model.apiSecret = config.trade.binance_apiSecret

var client = Binance({
    apiKey: config.trade.binance_apiKey,
    apiSecret: config.trade.binance_apiSecret
})
/**
 * Supported function 
 * 
 * @function ma
 * @function price 
 * @function va
 * @function prepare (reload api key/secret) => WIP
 * @function buy 
 * @function sell
 * 
 */

/**
 * ma
 * 
 * @param {*} type 
 * @param {*} symbol 
 */
trade_model.ma = async(type,symbol) => {
    console.log("Request MA ...");
    try {
        let interval = null;
        let mhdM = type[type.length - 1];
        let pool; 
        let dT = parseInt(type.substring(0,type.length - 1));
        /**
         * Define interval
         */
        if(mhdM == 'M' && dT != 1){
            interval = '1M';
            pool = dT;
        }
        else if(mhdM == 'M' && dT==1){
            interval = '1d'
            pool = 30
        }
        else if(mhdM == 'd' && dT != 1){
            interval = '1d'
            pool = dT
        }
        else if(mhdM == 'd' && dT == 1){
            interval = '1h'
            pool = 24
        }
        else if(mhdM == 'h' && dT != 1){
            interval = '1h'
            pool = dT
        }
        else if(mhdM == 'h' && dT == 1){
            interval = '5m'
            pool = 12
        }
        else if(mhdM == 'm' && dT != 1){
            interval = '1m'
            pool = dT
        }
        else {
            throw "unknown MA type"
        }

        let result = [];
        // fetch the target data
        let data = await client.candles({ symbol: symbol, interval: interval})
        await data.map((day, index) => {
            let ary = {}
            ary.timestamp = new Date(day.openTime).toString();
            if(index >= (pool-1)){
                ary.ma = data.slice(index-(pool-1),index+1).reduce((sum,cur) => {
                    return parseFloat(cur.close)+sum;
                },0)/pool;
                result.push(ary)
            }
        });
        return result;
    }
    catch(err){
        let result = {}
        result.msg = err
        console.log(err)
        return result;
    }
}

/**
 * price
 * 
 * @param {*} symbol 
 */
trade_model.price = async(symbol) => {
    console.log("Request Price ...")
    try{
        let price = await client.prices();
        return price[symbol];
    }
    catch(err){
        let result = {};
        result.msg = err;
        console.log(err)
        return result;
    }
}

/**
 * va
 * 
 * @param {*} symbol 
 */
trade_model.va = async(symbol) => {
    console.log("Request Volume ...")
    try{
        let interval = '1m'
        let tempVA=[]
        // fetch the data
        let data = await client.candles({symbol: symbol, interval:interval})
        await data.map((day,index) => {
            let ary = {};
            // timestamp
            ary.timestamp = new Date(day.openTime).toString();
            if(index>=0){
                ary.va = data.slice(index,index+1).reduce((sum,cur)=>{
                    return parseFloat(cur.volume)+sum
                },0)
                tempVA.push(ary)
            }
        });

        let pastHoursVolume=[]
        for(let hours = 0; hours<=10; hours++){
            let oneHourVolume=0;
            for(let i=tempVA.length-1-(hours*60); i > tempVA.length-61-(hours*60);i--){
                oneHourVolume += tempVA[i].va;
            }
            pastHoursVolume.push(oneHourVolume);
        }

        let total = 0;
        for(let i=1;i<=10;i++){
            total+=pastHoursVolume[i];
        }

        // 1~11 th hours avg trading volume
        let pastTenHoursVA = total/10; 
        // last hour avg trading volume 
        let pastOneHourVolume = pastHoursVolume[0]

        let result = {
            pastTenHoursVA: pastTenHoursVA,
            pastOneHourVolume: pastOneHourVolume
        }

        return result;
    }
    catch(err){
        let result={};
        result.msg = err;
        console.log(err)
        return result;
    }
}

trade_model.prepare = async(username) => {
    let self = this;
    console.log("Prepare API Key/Secret ...")
    db.get_binance_api_key(username, (err,data)=>{
        if(err) throw data;
        self.trade.binance_apiKey = data.binance_apikey;
        self.trade.binance_apiSecret = data.binance_apisecret;
        console.log("success get user api key from db");
    })
}

trade_model.buy = async(symbol,quantity,price) => {
    let result = {};
    try {
        let self=this;
        const dateTime = Date.now();
        const timestamp = Math.floor(dateTime);
        let serverTime = await client.time();
        let recvWindow = config.trade.binance_recvWindow;
        if(timestamp < (serverTime+1000) && (serverTime - timestamp) <= recvWindow){
            return await this.client.order({
                symbol: symbol,
                side: "BUY",
                quantity: quantity,
                price: price
            })
        }
        else{
            throw "伺服器延遲過高或電腦時間不準確"
        }
    } catch(err){
        result.msg = err.message;
        return result;
    }

}

trade_model.sell = async(symbol,quantity,price)  => {
    let result = {};
    try {
        let self=this;
        
        const dateTime = Date.now();
        const timestamp = Math.floor(dateTime)
        let serverTime = await client.time();
        let recvWindow = config.trade.binance_recvWindow

        if(timestamp < (serverTime + 1000) && (serverTime - timestamp) <= recvWindow){
            return await client.order({
                symbol: symbol,
                side: "SELL",
                quantity: quantity,
                price: price
            })
        }else{
            throw "伺服器延遲過高或電腦時間不準確"
        }
    }
    catch(err){
        result.msg = err.message;
        return result;
    }
}

module.exports = trade_model
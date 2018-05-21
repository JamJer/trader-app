/**
 * Trade Bot models 
 * 
 * Operations of trade_bot
 * 
 */
const Binance = require('binance-api-node').default
const config = require("../config/config.default")
const client = Binance({
    apiKey: config.trade.binance_apiKey,
    apiSecret: config.trade.binance_apiSecret
})

const trade_model = {}

/**
 * Supported function 
 * 
 * @function ma
 * @function price 
 * @function va
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

module.exports = trade_model
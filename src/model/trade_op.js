/**
 * Trade Bot models 
 * 
 * Operations of trade_bot
 * 
 */
const Binance = require('binance-api-node').default
const config = require("../config/config.default")
const {db} = require("./db")

// apikey/secret 
/*trade_model.apiKey = config.trade.binance_apiKey
trade_model.apiSecret = config.trade.binance_apiSecret
*/

class trade_op {
    constructor(){
        this.binance_apiKey = null
        this.binance_apiSecret = null
        this.client = null
    }

    /**
     * Supported function 
     * 
     * @function prepare (reload api key/secret) => WIP
     * @function ma
     * @function price 
     * @function va
     * 
     * @function buy 
     * @function sell
     * 
     */
    prepare(username){
        // let self = this;
        console.log("Prepare API Key/Secret ...")
        let self=this;
        db.get_binance_api_key(username, (err,data)=>{
            if(err) throw data;
            self.binance_apiKey = data.binance_apikey;
            self.binance_apiSecret = data.binance_apisecret;
            console.log("success get user api key from db");
            console.log(`API Key: ${self.binance_apiKey}`)
            console.log(`API Secret: ${self.binance_apiSecret}`)
            // reset Binance client
            self.client = Binance({apiKey: data.binance_apikey, apiSecret: data.binance_apisecret})
        })
    }
    
    /**
     * ma
     * 
     * @param {*} type 
     * @param {*} symbol 
     */
    async ma(type,symbol){
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
            this.client = Binance({apiKey: this.binance_apikey, apiSecret: this.binance_apisecret})
            let data = await this.client.candles({ symbol: symbol, interval: interval})
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
    async price(symbol){
        console.log("Request Price ...")
        try{
            this.client = Binance({apiKey: this.binance_apikey, apiSecret: this.binance_apisecret})
            let price = await this.client.prices();
            return parseFloat(price[symbol]);
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
    async va(symbol){
        // console.log("Request Volume ...")
        try{
            let interval = '5m'
            let tempVA=[]
            // fetch the data
            this.client = Binance({apiKey: this.binance_apikey, apiSecret: this.binance_apisecret})
            let data = await this.client.candles({symbol: symbol, interval:interval})
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
                for(let i=tempVA.length-1-(hours*12); i > tempVA.length-13-(hours*12);i--){
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

    async buy(symbol,quantity,price){
        let result = {};
        try {
            // let self=this;
            console.log(this)
            // need to make sure user have setting apikey and apiSecret
            if(this.binance_apiKey==null) {
                throw "missing binance api key";
            }
            this.client = Binance({
                apiKey: this.binance_apiKey,
                apiSecret: this.binance_apiSecret,
            });
            const dateTime = Date.now();
            const timestamp = Math.floor(dateTime);
            let serverTime = await this.client.time();
            let recvWindow = config.trade.binance_recvWindow;
            // console.log("Get server time: " + serverTime)
            // console.log("Get timestamp: " + timestamp)
            if(timestamp < (serverTime+1000) && (serverTime - timestamp) <= recvWindow){
                let order_log = (await this.client.order({
                    symbol: symbol,
                    side: 'BUY',
                    quantity: quantity,
                    price: price
                }))

                console.log("Print Buying loginfo (Follow Binance API format):")
                console.log(order_log)

                return order_log;
            }
            else{
                throw "伺服器延遲過高或電腦時間不準確"
            }
        } catch(err){
            console.log("error :")
            console.log(err)
            // result.msg = err.message;
            return msg;
        }
    
    }

    async sell(symbol,quantity,price){
        let result = {};
        try {
            // let self=this;
            if(this.binance_apiKey==null) {
                throw "missing binance api key";
            }
            this.client = Binance({
                apiKey: this.binance_apiKey,
                apiSecret: this.binance_apiSecret,
            });
            const dateTime = Date.now();
            const timestamp = Math.floor(dateTime)
            let serverTime = await this.client.time();
            let recvWindow = config.trade.binance_recvWindow
    
            if(timestamp < (serverTime + 1000) && (serverTime - timestamp) <= recvWindow){
                let order_log = (await this.client.order({
                    symbol: symbol,
                    side: "SELL",
                    quantity: quantity,
                    price: price
                }))

                console.log("Print selling loginfo (Follow Binance API format):")
                console.log(order_log)

                return order_log;
            }else{
                throw "伺服器延遲過高或電腦時間不準確"
            }
        }
        catch(err){
            console.log("error :")
            console.log(err)
            return err;
        }
    }
    
}


module.exports = trade_op
/**
 * Trade bot instance
 * 
 * - running trade bot instance here
 * - call the operation from trade_op
 * 
 */
// library
const fs = require('fs')
const rs = require('randomstring')
const YAML = require('yamljs')

// operation 
const trade_func = require('./trade_op')

// Duration
const duration = 10000;

class trade_bot{
    constructor(){
        // record status
        this.currentStatus = 'wait';
        // price 
        this.price = [];
        // buy info
        this.buyInfo = [];
        // trade info (trading log here)
        this.tradeInfo = [];
        // data va 
        this.dataVA = null;
        this.dataMA = []
        // loading yamldata (trading policy)
        this.tradingData = null;
        this.func = [];
        
        // interval
        this.systemInterval = null;
        // this bot id
        this.id = rs.generate(6);

        // debug -
        // trade_func.prepare("kevin")

        console.log("Bot instance created, ID: "+this.id)
    }

    /**
     * Operation supported by outsider (other caller)
     * 
     * @function get_id Get current instance id
     * @function stop Stop the trading behavior of current instance
     * @function start_by_url start the trading process by specifying (trading policy)file path
     * @function start_by_obj same as above, use object instead of url
     * 
     * // Adjust parameter of trading policy
     * @function change_symbol
     * @function change_ma
     * @function change_policy_by_url
     * 
     * // For statistics collection
     * @function get_log
     */

    get_log(){
        /**
         * FIXME: Need to merge trading info into one data?
         * 
         * (buy format)
         * - @param symbol
         * - @param timestamp
         * - @param type (buy)
         * - @param quantity
         * - @param price
         * 
         * (sell format)
         * - @param symbol
         * - @param timestamp
         * - @param type (sell)
         * - @param status //賣出類型(交易爆量導致的賣出、止損賣出、獲利賣出)
         * - @param quantity
         * - @param price
         * - @param ror //收益率 (為該 sell 事件發生時，與買入相比的獲益率)
         */

        // Only filtering sell event 
        // because only this contain ror 
        // - set as one checkpoint 
        // notice: buy price need to get average !
        let checkpoints = [],buy_price=[]; 
        for(let i in this.tradeInfo){
            if(this.tradeInfo[i].type == "buy"){
                buy_price.push(this.tradeInfo[i].price)
            }
            else if(this.tradeInfo[i].type == "sell"){
                // get avg buy price 
                let avg_buy_price=0;
                buy_price.forEach((element)=>{
                    avg_buy_price+=element;
                })
                avg_buy_price= avg_buy_price/buy_price.length;
                // Create the storage format
                checkpoints.push({
                    trade_id: this.id,
                    trade_date: this.tradeInfo[i].timeStamp,
                    market: this.tradeInfo[i].symbol,
                    quantity: this.tradeInfo[i].quantity,
                    price_sell: this.tradeInfo[i].price,
                    price_buyin: avg_buy_price,
                    profit: this.tradeInfo[i].ror
                })
            }
        }

        // Return instance
        return {
            history: this.tradeInfo,
            trade_log: checkpoints,
            id: this.id
        }
    }

    change_symbol(new_symbol){
        this.tradingData.symbol = new_symbol;
        // reload
        this.stop();
        console.log("Bot id: "+ this.id + ", already to be restart...");
        this.start_by_obj(this.tradingData)
    }

    change_ma(new_ma){
        this.tradingData.ma = new_ma;
        // reload
        this.stop();
        console.log("Bot id: "+ this.id + ", already to be restart...");
        this.start_by_obj(this.tradingData)
    }

    change_all(new_symbol,new_ma){
        this.tradingData.ma = new_ma;
        this.tradingData.symbol = new_symbol;
        // stop 
        this.stop();
        console.log("Bot id: "+ this.id + ", already to be restart...");
        // restart
        this.start_by_obj(this.tradingData)
    }

    change_policy_by_url(new_policy_url){
        this.stop();
        console.log("Bot id: "+ this.id + ", already to be restart...");
        this.start_by_url(new_policy_url)
    }

    get_id(){
        return this.id;
    }

    stop(){
        console.log("Bot id: "+ this.id + ", already to be terminated.");
        clearInterval(this.systemInterval)
    }

    start_by_url(url){
        // start trading
        let self=this;
        // run 
        self.load_policy_by_url(url);
        self.systemInterval = setInterval(function(){
            console.log(self.id);
            self.load_policy_by_url(url);
        },duration)
    }

    start_by_obj(obj){
        // start trading
        let self=this;
        // run 
        self.load_policy_by_obj(obj);
        self.systemInterval = setInterval(function(){
            console.log(self.id);
            self.load_policy_by_obj(obj);
        },duration)
    }
    /**
     * Loading trading policy - and then start 
     * 
     * @function load_policy_by_url
     * @function load_policy_by_obj
     * @function load
     */
    load(){
        // reset func 
        this.func = [];
        // push 
        this.func.push(trade_func.price(this.tradingData.symbol));
        this.func.push(trade_func.va(this.tradingData.symbol));
        this.func.push(trade_func.ma(this.tradingData.ma,this.tradingData.symbol))

        let self=this;
        Promise.all(this.func).then((data)=>{
            // current price
            self.price.push(data[0]); 
            // current price max store volume
            if(self.price.length > 1000){
                self.price.shift();
            }
            self.dataVA = data[1];
            self.dataMA = data[2];
            // and then start trading process
            self.buy_and_sell();
        }).catch((error)=>{
            console.log(error)
        })
    }

    load_policy_by_url(policy_path){
        this.tradingData = YAML.parse(fs.readFileSync(policy_path).toString())
        // loading
        this.load();
    }
    load_policy_by_obj(policy_obj){
        // Notice!
        // this policy_obj has been parsing by YAMLjs
        this.tradingData = policy_obj
        // loading
        this.load();
    }

    /**
     * Buy and sell - real trading 
     * 
     * @function buy_and_sell 
     */
    buy_and_sell(){
        //console.log(this)
        switch(this.currentStatus){
            case 'wait':
                console.log("Waiting...")
            case 'sell':
                console.log("Selling...")
            case 'sell_10':
                console.log("Selling 10...")
            case 'sell_volume':
                console.log("Selling Volume...")
                if(!this.isVolumeExIncrease()){ //如果交易量沒有爆增
                    if(this.isMAUp() && this.isPriceDropTouchMA()){ //如果MA上揚且現價下跌碰觸MA
                        this.buy();								//執行買入
                        this.currentStatus = 'buy';
                    }
                }
                break;
            case 'buy':
                console.log("Buying...")
                if(this.isVolumeExIncrease()){		//如果交易量爆增
                    this.currentStatus = 'sell_volume';
                    this.sell();						//執行賣出
                }else if(this.isPriceDropStop()){	//如果現價下跌至止損點
                    this.currentStatus = 'sell_10';
                    this.sell();						//執行賣出
                }else if(this.isPriceDropMA35()){	//如果現價下跌至MA3.5%以下
                    this.currentStatus = 'buy_35';	//不加碼，等待賣出
                }else{
                    if(this.isMAUp() && this.isPriceDropTouchMA() && this.isFirstOrUpXPerThanLast()){//如果MA上揚且現價下跌碰觸MA且現價比上次買入價高10%
                        this.buy();					//執行加碼
                    }
                }
                break;
            case 'buy_35': 						//現價已下跌至3.5%等待賣出
                console.log("Buying 35...")
                if(this.isVolumeExIncrease()){		//如果交易量爆增
                    this.currentStatus = 'sell_volume';
                    this.sell();						//執行賣出
                }else if(this.isPriceDropStop()){	//如果現價下跌至止損點
                    this.currentStatus = 'sell_10';
                    this.sell();						//執行賣出
                }else{
                    if(this.isPriceUpTouchMA()){		//如果現價上漲碰觸MA
                        this.currentStatus = 'sell';
                        this.sell();					//執行賣出
                    }
                }
                break;
            default:
                // statements_def
                break;
        }
        console.log('currentStatus: ' + this.currentStatus); //顯示目前狀態，可刪除
    }

    /**
     * Determined function
     * 
     * @function isPriceDropMA35
     * @function isPriceDropStop
     * @function isVolumeExIncrease
     * @function isMAUp
     * @function isPriceDropTouchMA
     * @function isPriceUpTouchMA
     * @function isFirstOrUpXPerThanLast
     * 
     */
    isPriceDropMA35(){
        if(this.price[this.price.length - 1] < this.dataMA[this.dataMA.length - 1].ma * 0.965){
            return true;
        }else{
            return false;
        }
    }

    isPriceDropStop(){
        if(this.buyInfo.length == 0){
            return false;
        }
        else{
            if(this.price[this.price.length - 1] < this.buyInfo[this.buyInfo.length - 1].price * (1 - this.tradingData.buy.stoloss * 0.01)){
                return true;
            }else{
                return false;
            }
        }
    }

    // Detect if there has burst increasement
    isVolumeExIncrease(){

        if(this.dataVA.pastOneHourVolume >= this.dataVA.pastTenHoursVA * this.tradingData.sell.magnification){
            return true;
        }else{
            return false;
        }
    }

    // Detect whether if MA is increased 
    isMAUp(){
        if(this.dataMA[this.dataMA.length - 1].ma > this.dataMA[this.dataMA.length - 2].ma){
            return true;
        }else{
            return false;
        }
    }

    // decreasing point detection
    isPriceDropTouchMA(){
        if(this.price.length > 1){
            let maBuyRange = this.dataMA[this.dataMA.length - 1].ma * (1 + this.tradingData.buy.range * 0.01); //MA買進點容許範圍
            if(this.price[this.price.length - 2] > maBuyRange && this.price[this.price.length - 1] <= maBuyRange){  //目前現價與上一個現價碰觸MA
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }

    // increasing point detection
    isPriceUpTouchMA(){
        if(this.price.length > 1){
            let maSellPoint = this.dataMA[this.dataMA.length - 1].ma;
            if(this.price[this.price.length - 2] < maSellPoint && this.price[this.price.length - 1] >= maSellPoint){  //目前現價與上一個現價碰觸MA
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }

    // 第一次購買或是現價比上次購買高X
    isFirstOrUpXPerThanLast(){
        if(this.buyInfo.length == 0){
            return true;
        }else{
            if(this.price[this.price.length - 1] > this.buyInfo[this.buyInfo.length - 1].price * (1 + this.tradingData.buy.spread * 0.01)){
                return true;
            }else{
                return false;
            }
        }
    }

     /**
      * Operating function
      * 
      * @function buy 
      * @function sell 
      * 
      */
    buy(){
        let newBuyinfo = {
            symbol: this.tradingData.symbol, 
            timeStamp: new Date().getTime(),
            type: 'buy',
            quantity: this.tradingData.capital * this.tradingData.buy.volume / this.price[this.price.length - 1], //買入數量
            price: this.price[this.price.length - 1] // 買入價格
        };

        this.buyInfo.push(newBuyinfo);
        this.tradeInfo.push(newBuyinfo);

        // ------------ TODO: execute the buy operation -------------
        console.log(trade_func.buy(newBuyinfo.symbol,newBuyinfo.quantity,newBuyinfo.price))
    }

    sell(){
        let totalQty = 0;
        let totalCost = 0;
        for(let i in this.buyInfo){
            totalQty += this.buyInfo[i].quantity; //將買入數量加總，全數賣出
            totalCost += this.buyInfo[i].quantity * this.buyInfo[i].price;
        }
    
        let newSellInfo = {
            symbol: this.tradingData.symbol,	//賣出交易對符號
            timeStamp: new Date().getTime(),	//賣出時間
            type: 'sell',
            status: this.currentStatus,		//賣出類型(交易爆量導致的賣出、止損賣出、獲利賣出)
            quantity: totalQty, //賣出數量
            price: this.price[this.price.length - 1],	//賣出價格
            ror: ( totalQty * this.price[this.price.length - 1] - totalCost ) / totalCost  //收益率
        };
        
        // this.buyInfo.push(newSellInfo);
        /** FIXME: this part need to move to the place which after executing selling command */
        while (this.buyInfo.length > 0) {//清空買入資訊
            this.buyInfo.pop();
        }
        this.tradeInfo.push(newSellInfo);//儲存交易紀錄
    
        //------執行賣出------
        console.log(trade_func.sell(newSellInfo.symbol,newSellInfo.quantity,newSellInfo.price))
        //--------------------
    }
}

module.exports = trade_bot
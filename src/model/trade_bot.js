/**
 * Trade bot instance
 * 
 * - running trade bot instance here
 * - call the operation from trade_op
 * 
 */
// library
const os = require('os')
const fs = require('fs')
const rs = require('randomstring')
const YAML = require('yamljs')

// logger 
const {logger} = require('./logger')

// operation 
const trade_func = require('./trade_op')
const trade_bt = require('./trade_backtrack')

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

        // console.log("Bot instance created, ID: "+this.id)
        this.logger = logger.bot_log(this.id);
        this.log("Bot instance created, ID: "+this.id)
    }

    log(msg){
        this.logger.write(msg+os.EOL,'UTF8')
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
        // console.log("Bot id: "+ this.id + ", already to be restart...");
        this.log("Bot id: "+ this.id + ", already to be restart...")
        this.start_by_obj(this.tradingData)
    }

    change_ma(new_ma){
        this.tradingData.ma = new_ma;
        // reload
        this.stop();
        // console.log("Bot id: "+ this.id + ", already to be restart...");
        this.log("Bot id: "+ this.id + ", already to be restart...");
        this.start_by_obj(this.tradingData)
    }

    change_all(new_symbol,new_ma){
        this.tradingData.ma = new_ma;
        this.tradingData.symbol = new_symbol;
        // stop 
        this.stop();
        // console.log("Bot id: "+ this.id + ", already to be restart...");
        this.log("Bot id: "+ this.id + ", already to be restart...");
        // restart
        this.start_by_obj(this.tradingData)
    }

    change_policy_by_url(new_policy_url){
        this.stop();
        // console.log("Bot id: "+ this.id + ", already to be restart...");
        this.log("Bot id: "+ this.id + ", already to be restart...");
        this.start_by_url(new_policy_url)
    }

    get_id(){
        return this.id;
    }

    stop(){
        // console.log("Bot id: "+ this.id + ", already to be terminated.");
        this.log("Bot id: "+ this.id + ", already to be terminated.");
        clearInterval(this.systemInterval)
        // FIXME: 
        // if there need to delete this temporary file, then uncomment it
        // logger.bot_log_dismiss(this.id);
    }

    start_by_url(url){
        // start trading
        let self=this;
        // run 
        self.load_policy_by_url(url);
        self.systemInterval = setInterval(function(){
            // console.log(self.id);
            self.load_policy_by_url(url);
        },duration)
    }

    start_by_obj(obj){
        // start trading
        let self=this;
        // run 
        self.load_policy_by_obj(obj);
        self.systemInterval = setInterval(function(){
            // console.log(self.id);
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
        // 獲取 現價
        this.func.push(trade_func.price(this.tradingData.symbol));
        // 獲取 平均交易量
        this.func.push(trade_func.va(this.tradingData.symbol));
        // 獲取 MA
        this.func.push(trade_func.ma(this.tradingData.ma,this.tradingData.symbol))

        let self=this;
        Promise.all(this.func).then((data)=>{
            // 填入現價
            self.price.push(data[0]); 
            // 現價最大存放數量
            if(self.price.length > 1000){
                self.price.shift();
            }
            // 填入交易量
            self.dataVA = data[1];
            // 填入 MA
            self.dataMA = data[2];
            // 開始買賣偵測
            self.buy_and_sell();
        }).catch((error)=>{
            // console.log(error)
            self.log(error)
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
                // console.log("Waiting...")
                this.log("Waiting...")
            case 'sell':
                // console.log("Selling...")
                this.log("Selling...")
            case 'sell_stoloss':
                // console.log("Selling 10...")
                this.log("Selling stoloss...")
            case 'sell_volume':
                this.log("Selling volume ...")
            case 'sell_mafall':
                // console.log("Selling Volume...")
                this.log("Selling when detecting MA fall...")
            case 'sell_belowma':
                this.log("Selling when current price below MA ...")
                if(!this.isVolumeExIncrease()){ //如果交易量沒有爆增
                    if(this.isMAUp() && this.isPriceDropTouchMA()){ //如果MA上揚且現價下跌碰觸MA
                        this.buy();								//執行買入
                        this.currentStatus = 'buy';
                    }
                }
                break;
            case 'buy':
                // console.log("Buying...")
                this.log("Buying...")
                if(this.isVolumeExIncrease()){		//如果交易量爆增
                    this.currentStatus = 'sell_volume';
                    this.sell();						//執行賣出   
                }
                else if(this.isPriceBelowMAXTime()){ 
                    // 如果現價連續數次都低於 MA 就賣出
                    this.currentStatus = 'sell_belowma';
                    // 執行賣出
                    this.sell();
                }
                else if(this.isPriceDropStop()){	//如果現價下跌至止損點
                    this.currentStatus = 'sell_stoloss';
                    this.sell();						//執行賣出
                }else if(this.isPriceDropMARally()){	//如果現價下跌至 MA 的反彈點以下
                    this.currentStatus = 'buy_rally';	//不加碼，等待賣出
                }else{
                    if(this.isMAUp() && this.isPriceDropTouchMA() && this.isFirstOrUpXPerThanLast()){
                        //如果MA上揚且現價下跌碰觸MA且現價比上次買入價高10%
                        this.buy();					//執行加碼
                    }
                }
                break;
            case 'buy_rally': 						//現價已下跌至 MA 的反彈點、等待賣出
                this.log("Buying Rally...")
                if(this.isVolumeExIncrease()){		//如果交易量爆增
                    this.currentStatus = 'sell_volume';
                    this.sell();						//執行賣出
                }
                else if(this.isPriceBelowMAXTime()){
                    // 如果現價連續數次都低於 MA 就賣出
                    this.currentStatus = 'sell_belowma';
                    this.sell();
                }
                else if(this.isMAFallThreeTime()){
                    // 如果最近 5 次 MA，累積三次呈現下跌
                    this.currentStatus = 'sell_mafall';
                    this.sell();
                }
                else if(this.isPriceDropStop()){	//如果現價下跌至止損點
                    this.currentStatus = 'sell_stoloss';
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

        // Display Log
        this.log("current status: " + this.currentStatus)
        this.log("=====================================")
        this.log("目前時間: " + new Date().toLocaleString())
        this.log("目前現價: " + this.price[this.price.length - 1])
        this.log("目前 MA: " + this.dataMA[this.dataMA.length - 1].ma + ' ' + new Date(this.dataMA[this.dataMA.length - 1].timestamp).toLocaleString())
        this.log('目前交易量倍數: ' + this.dataVA.pastOneHourVolume / this.dataVA.pastTenHoursVA);
        this.log('買入資訊: ');
        this.log(this.buyInfo);
        this.log('總交易資訊: ');
        this.log(this.tradeInfo);
        this.log("=====================================")
    }

    /**
     * Determined function
     * 
     * (deprecated)
     * @function isPriceDropMA35
     * 
     * (New)
     * @function isPriceBelowMAXTime
     * @function isMAFallThreeTime 
     * @function isPriceDropMARally 
     * 
     * (Maintain)
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

    isPriceBelowMAXTime(){
        let mhdM = this.tradingData.ma[this.tradingData.ma.length - 1];
        let d = (mhdM == 'h')? 12 : ((mhdM == 'd') ? 288 : ((mhdM == 'm' ? 1 : 8640)));
        let count = 0;

        for(let i = this.tradingData.sell.belowma; i > 0; i--){
            let x = this.dataMA.length - i;
            if(x < 0){
                return false;
            }
            let y = this.price.length - 1 - (d * (this.tradingData.sell.belowma - i));
            if(this.dataMA[x].ma > this.price[(y < 0 ? 0 : y)]){
                count += 1;
            }
        }

        if(count == this.tradingData.sell.belowma){
            return true;
        }else{
            return false;
        }
    }

    isMAFallThreeTime(){
        let count=0;
        for(let i=5;i>0;i--){
            let maLast = this.dataMA[((this.dataMA.length - 1 - i) < 0 ? 0 : (this.dataMA.length - 1 - i))].ma;
            let maNext = this.dataMA[((this.dataMA.length - i) < 0 ? 0 : (this.dataMA.length - i))].ma;
            if(maNext < maLast){
                count += 1;
            }
        }

        if(count >= 3){
            return true;
        }else{
            return false;
        }
    }

    isPriceDropMARally(){
        if(this.price[this.price.length - 1] < this.dataMA[this.dataMA.length - 1].ma * (1 - this.tradingData.buy.rally * 0.01)){
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
        // 一小時內 是否交易量暴增
        if(this.dataVA.pastOneHourVolume >= this.dataVA.pastTenHoursVA * this.tradingData.sell.magnification){
            return true;
        }else{
            return false;
        }
    }

    // Detect whether if MA is increased 
    isMAUp(){
        // 偵測 MA 是否上揚
        if(this.dataMA.length < 2){ // 針對新版做出修改（tradebot 5~7）
            return false;
        }else if(this.dataMA[this.dataMA.length - 1].ma > this.dataMA[this.dataMA.length - 2].ma){
            return true;
        }else{
            return false;
        }
    }

    // decreasing point detection
    // 現價是否下跌碰撞 MA
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
    // 現價是否上漲碰觸 MA 
    isPriceUpTouchMA(){
        if(this.price.length > 1){
            let maSellPoint = this.dataMA[this.dataMA.length - 1].ma * (1 - this.tradingData.sell.range * 0.01);
            //目前現價與上一個現價碰觸MA
            if(this.price[this.price.length - 2] < maSellPoint && this.price[this.price.length - 1] >= maSellPoint){  
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
        // 針對新版做出修改（tradebot 5~7）-> 買入時間
        let timeStamp = this.isHistory ? this.currentHistoryTime.toLocaleString():(new Date().toLocaleString());
        // Create buy info (new version)
        let newBuyinfo = {
            symbol: this.tradingData.symbol, 
            timeStamp: timeStamp,
            type: 'buy',
            quantity: this.tradingData.capital * (this.tradingData.buy.volume/100) / this.price[this.price.length - 1], //買入數量
            price: this.price[this.price.length - 1], // 買入價格,
            buy: (this.tradingData.capital * (this.tradingData.buy.volume/100) / this.price[this.price.length - 1]) * this.price[this.price.length - 1]
        };

        // 儲存買入資訊
        this.buyInfo.push(newBuyinfo);
        // 儲存交易紀錄
        this.tradeInfo.push(newBuyinfo);

        // ------------ execute the buy operation -------------
        console.log(trade_func.buy(newBuyinfo.symbol,newBuyinfo.quantity,newBuyinfo.price))
    }

    sell(){
        let totalQty = 0;
        let totalCost = 0;
        for(let i in this.buyInfo){
            totalQty += this.buyInfo[i].quantity; //將買入數量加總，全數賣出
            totalCost += this.buyInfo[i].quantity * this.buyInfo[i].price;
        }
    
        // create timestamp
        let timeStamp = this.isHistory ? this.currentHistoryTime.toLocaleString():(new Date().toLocaleString());

        // create new selling information
        /**
         * symbol       //賣出交易對符號
         * timeStamp    //賣出時間
         * type         //
         * status       //賣出類型(交易爆量導致的賣出、止損賣出、獲利賣出)
         * quantity     //賣出數量
         * price        //賣出價格
         * sell         //
         * ror          //收益率
         */
        let newSellInfo = {
            symbol: this.tradingData.symbol,	//賣出交易對符號
            timeStamp: timeStamp,	//賣出時間
            type: 'sell',
            status: this.currentStatus,		//賣出類型(交易爆量導致的賣出、止損賣出、獲利賣出)
            quantity: totalQty, //賣出數量
            price: this.price[this.price.length - 1],	//賣出價格
            sell: totalQty * this.price[this.price.length - 1],
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

    // Trade policy test func goes here 
    backTrackTest(yaml_string, start_time, end_time){
        return trade_bt.backtrack(yaml_string, start_time, end_time)
    }
}

module.exports = trade_bot
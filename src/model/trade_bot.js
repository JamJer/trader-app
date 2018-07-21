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
const request = require('request')
const moment = require('moment')

// logger 
const {logger} = require('./logger')

// localStore
const trade_record_func = require('./localStore/bot_trade_record.js')

// operation 
const trade_op = require('./trade_op')
const trade_bt = require('./trade_backtrack')

// var trade_func = new trade_op();

// Duration
// - default setting is 5 min (300 sec = 300,000 ms => For setInterval usage)
const duration = 30000; 
const refresh_rate = 30;

class trade_bot{
    /**
     * Trade bot 屬性：
     * 
     * currentStatus        現存機器人的交易狀態
     *      - wait               開始執行，等待買入
     *      - buy                已買入，等待加碼、等待現價跌至反彈點以下
     *      - buy_rally          已買入，現價跌至 MA 反彈點以下，不加碼等待賣出
     *      - sell               已賣出獲利，等待買入
     *      - sell_stoloss       現價跌至上次買入、或加碼價格止損點以下，已賣出止損，等待買入
     *      - sell_volume        成交量暴增，籌碼不穩，已執行賣出、等待買入
     *      - sell_mafall        最近 5 次 MA，累積三次呈獻下跌，決定賣出
     *      - sell_belowma       現價連續數次低於 MA，決定賣出
     * 
     * price                現價
     * buyInfo              儲存未賣出前的買入資訊
     * tradeInfo            儲存買入及賣出資訊 （e.g. 交易紀錄）
     * dataVA               儲存交易量資訊
     * dataMA               儲存 MA
     *      - {
     *          timestamp:          時間
     *          pastTenHoursVA:     過去一小時到過去第 11 個小時的平均交易量
     *          pastOneHourVolume:  過去一小時以內交易量
     *        }
     * tradingData          讀取的交易策略資料
     * =====================================================================
     * 
     * 對外的 menber function:
     * 
     * log(msg)                                             做紀錄檔案格式寫入
     * get_log()                                            收集測資（交易紀錄）
     * get_id()                                             回傳該 trade bot 的 unique id
     * stop()                                               關閉、停止這個交易機器人
     * 
     * change_symbol(new_symbol)                            動態更換 symbol
     * change_ma(new_ma)                                    動態更新 MA
     * change_all(new_symbol,new_ma)                        動態更新 symbol + ma
     * change_policy_by_url(new_policy_url)                 動態更換讀取的 交易策略 (via 檔案路徑)
     * 
     * start_by_url(url)                                    透過指定交易策略的檔案路徑來啟動
     * start_by_obj(obj）                                   透過指定交易策略的物件來啟動
     * 
     * load()                                               開始進行交易系統，對 trade bot class 內的每個屬性做初始化
     * load_policy_by_url(policy_path)                      依據指定交易策略 "路徑" 來載入初始化
     * load_policy_by_obj(policy_obj)                       依據指定交易策略 "物件" 來載入初始化
     * 
     * 對內的 member function (主要跟交易動作、狀態有關):
     * 
     * buy_and_sell()                                       等待前面初始化等動作都完成後，就可以開始進行買賣
     * 
     * isPriceBelowMAXTime                                      
     * isMAFallThreeTime
     * isPriceDropMARally
     * 
     * isPriceDropStop
     * isVolumeExIncrease
     * isMAUp
     * isPriceDropTouchMA
     * isPriceUpTouchMA
     * isFirstOrUpXPerThanLast
     * 
     * buy()                                                 進行購買的動作
     * sell()                                                進行賣出的動作
     * 
     */
    constructor(username){
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
        // min Quantity 
        this.minQty = null;
        // loading yamldata (trading policy)
        this.tradePolicy = null;
        this.tradingData = null;
        this.func = [];

        // interval
        this.systemInterval = null;
        // duration of interval, refresh rate
        this.duration = duration;
        this.refresh_rate = refresh_rate;
        // this bot id
        this.id = rs.generate(6);

        // record the total running time (ms) 
        this.running_time = 0;

        // trade operation - buy/sell 
        this.trade_func =  new trade_op();
        // record username
        this.username = username;
        this.trade_func.prepare(username)
        // logger (for information display)
        this.logger = logger.bot_log(this.id);
        // debug log - for trade operation
        this.debug_logger = logger.bot_debug_log(this.id);
        this.log("Bot instance created, ID: "+this.id)
        this.debug_log("Bot instance created, ID: "+this.id)
    }

    log(msg){
        this.logger.write(msg+os.EOL,'UTF8')
    }

    debug_log(msg){
        this.debug_logger.write(msg+os.EOL,'UTF8')
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
     * @function change_inv_duration // interval duration, not the same one in policy
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
        this.log("[Change symbol]Bot id: "+ this.id + ", already to be restart...")
        this.start_by_obj(this.tradingData)
    }

    change_ma(new_ma){
        this.tradingData.ma = new_ma;
        // reload
        this.stop();
        // console.log("Bot id: "+ this.id + ", already to be restart...");
        this.log("[Change ma]Bot id: "+ this.id + ", already to be restart...");
        this.start_by_obj(this.tradingData)
    }

    change_all(new_symbol,new_ma){
        this.tradingData.ma = new_ma;
        this.tradingData.symbol = new_symbol;
        // stop 
        this.stop();
        // console.log("Bot id: "+ this.id + ", already to be restart...");
        this.log("[Change symbol + ma]Bot id: "+ this.id + ", already to be restart...");
        // restart
        this.start_by_obj(this.tradingData)
    }

    change_inv_duration(new_duration){
        this.duration = new_duration;
        // stop
        this.stop();
        this.log("[Change Duration]Bot id: "+ this.id + ", already to be restart...");
        // restart
        this.start_by_obj(this.tradingData)
    }

    change_policy_by_url(new_policy_url){
        this.stop();
        // console.log("Bot id: "+ this.id + ", already to be restart...");
        this.log("[Change URL]Bot id: "+ this.id + ", already to be restart...");
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

    update(){
        let self = this;
        // using request to get minQty 
        request.get("https://www.binance.com/api/v1/exchangeInfo",function(err,response,data){
            if(err){
                console.log(`[Update function][獲取 binance API 失敗] error: ${err} ,data: ${JSON.parse(data)}`)
                self.debug_log(`[Update function][獲取 binance API 失敗] error: ${err} ,data: ${JSON.parse(data)}`)
            } else {
                // 檢查交易數量最小值
                let jsonData = JSON.parse(data);
                let currentJson = {};
                for(let i in jsonData['symbols']){
                    if(jsonData['symbols'][i]['symbol'] == self.tradingData.symbol){
                        currentJson = jsonData['symbols'][i]
                        break;
                    }
                }
                // assign minQty
                self.minQty = parseFloat(currentJson['filters'][1]['minQty'])
            }
        })
    }

    start_by_url(url){
        // 新增交易策略名稱屬性
        let policy_name_path = url.split('/')
        let policy_name = policy_name_path[policy_name_path.length - 1].split('.')[0]
        this.tradePolicy = policy_name
        // start trading
        let self=this;
        // run 
        self.load_policy_by_url(url);
        self.systemInterval = setInterval(function(){
            self.load_policy_by_url(url);
            
            // increase running time
            self.running_time += self.duration;

            // reconfigure by period 
            if(self.running_time >= self.duration*self.refresh_rate ){
                // reconfigure binance API/Secret
                self.trade_func.prepare(self.username)
            }
        },self.duration)
    }

    start_by_obj(obj,policy_name){
        // 新增交易策略名稱屬性
        this.tradePolicy = policy_name
        // start trading
        let self=this;
        // run 
        self.load_policy_by_obj(obj);
        self.systemInterval = setInterval(function(){
            self.load_policy_by_obj(obj);

            // increase running time
            self.running_time += self.duration;

            // reconfigure by period 
            if(self.running_time >= self.duration*self.refresh_rate ){
                // reconfigure binance API/Secret
                self.trade_func.prepare(self.username)
            }
        },self.duration)
    }
    /**
     * Loading trading policy - and then start 
     * 
     * @function load_policy_by_url
     * @function load_policy_by_obj
     * @function load
     */
    load(){
        // update parameters - minQty
        this.update();

        // reset func 
        this.func = [];
        // 獲取 現價
        this.func.push(this.trade_func.price(this.tradingData.symbol));
        // 獲取 平均交易量
        this.func.push(this.trade_func.va(this.tradingData.symbol));
        // 獲取 MA
        this.func.push(this.trade_func.ma(this.tradingData.ma,this.tradingData.symbol))

        let self=this;
        Promise.all(this.func).then((data)=>{
            if(!data[0]){
                throw "[Load function][Error] Can't get API";
            }
            // 填入現價
            console.log("Price: "+data[0])
            self.price.push(data[0]); 
            // 現價最大存放數量
            if(self.price.length > 10000){
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
            self.debug_log(error)
            self.log(error)
        })
    }

    load_policy_by_url(policy_path){
        this.tradingData = YAML.parse(fs.readFileSync(policy_path).toString())
        // setTimeout(()=>{ /*sleep*/ }, 1000)
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
                this.log("Waiting...")
            case 'sell':
                this.log("Selling...")
            case 'sell_stoloss':
                this.log("Selling stoloss...")
            case 'sell_volume':
                this.log("Selling volume ...")
            case 'sell_mafall':
                this.log("Selling when detecting MA fall...")
            case 'sell_belowma':
                this.log("Selling when current price below MA ...")
                //如果交易量沒有爆增
                if(!this.isVolumeExIncrease()){
                    //如果MA上揚且現價下跌碰觸MA
                    if(this.isMAUp() && this.isPriceDropTouchMA()){ 
                        //執行買入
                        this.buy();								
                        this.currentStatus = 'buy';
                    }
                }
                break;
            case 'buy':
                this.log("Buying...")
                //如果交易量爆增
                if(this.isVolumeExIncrease()){		
                    this.currentStatus = 'sell_volume';
                    //執行賣出   
                    this.sell();						
                }
                else if(this.isPriceBelowMAXTime()){ 
                    // 如果現價連續數次都低於 MA 就賣出
                    this.currentStatus = 'sell_belowma';
                    // 執行賣出
                    this.sell();
                }
                else if(this.isPriceDropStop()){	
                    //如果現價下跌至止損點
                    this.currentStatus = 'sell_stoloss';
                    this.sell();						
                }else if(this.isPriceDropMARally()){	
                    //如果現價下跌至 MA 的反彈點以下
                    this.currentStatus = 'buy_rally';	
                    //不加碼，等待賣出
                }else{
                    if(this.isMAUp() && this.isPriceDropTouchMA() && this.isFirstOrUpXPerThanLast()){
                        //如果MA上揚且現價下跌碰觸MA且現價比上次買入價高10%
                        //執行加碼
                        this.buy();					
                    }
                }
                break;
            case 'buy_rally': 						
                //現價已下跌至 MA 的反彈點、等待賣出
                this.log("Buying Rally...")
                if(this.isVolumeExIncrease()){		
                    //如果交易量爆增
                    this.currentStatus = 'sell_volume';
                    this.sell();						
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
                else if(this.isPriceDropStop()){	
                    //如果現價下跌至止損點
                    this.currentStatus = 'sell_stoloss';
                    this.sell();						
                }else{
                    if(this.isPriceUpTouchMA()){		
                        //如果現價上漲碰觸MA
                        this.currentStatus = 'sell';
                        this.sell();
                    }
                }
                break;
            default:
                // statements_def
                break;
        }

        // Display Log
        this.log("目前交易動作: " + this.currentStatus)
        this.log("=====================================")
        this.log("目前時間: " + new Date().toLocaleString())
        this.log("目前現價: " + this.price[this.price.length - 1])
        this.log("目前 MA: " + this.dataMA[this.dataMA.length - 1].ma + ' ' + new Date(this.dataMA[this.dataMA.length - 1].timestamp).toLocaleString())
        this.log('目前交易量倍數: ' + this.dataVA.pastOneHourVolume / this.dataVA.pastTenHoursVA);
        // this.log('買入資訊: ');
        // this.log(this.buyInfo);
        // this.log('總交易資訊: ');
        // this.log(this.tradeInfo);
        this.log("=====================================")
    }

    /**
     * Determined function
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
            /*
            if(this.dataMA[x].ma > this.price[(y < 0 ? 0 : y)]){
                count += 1;
            }
            */
           if(y >= 0){
               if(this.dataMA[x].ma > this.price[y]){
                   count += 1;
               }
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
            let maBuyRangeMax = this.dataMA[this.dataMA.length - 1].ma * (1 + this.tradingData.buy.range * 0.01); //MA買進點容許範圍最大值
            let maBuyRangeMin = this.dataMA[this.dataMA.length - 1].ma * (1 - this.tradingData.buy.range * 0.01); //MA買進點容許範圍最小值
            if(this.price[this.price.length - 2] > this.price[this.price.length - 1] && this.price[this.price.length - 1] <= maBuyRangeMax && this.price[this.price.length - 1] >= maBuyRangeMin){ 
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
        let oriQuantity = this.tradingData.capital * (this.tradingData.buy.volume/100) / this.price[this.price.length - 1] // 原始買入數量
        let limit = 1 / this.minQty
        let quantity = Math.round(oriQuantity * limit) / limit;//四捨五入後的買入數量
        // ts
        let timeStamp = this.isHistory ? this.currentHistoryTime.toLocaleString() : (new Date().toLocaleString());
            
        // buy info
        let newBuyInfo = {
            tradePolicy: this.tradePolicy,
            symbol: this.tradingData.symbol,    //買入交易對符號
            timeStamp: timeStamp,    //買入時間
            type: 'buy',
            quantity: quantity, //買入數量
            price: this.price[this.price.length - 1],    //買入價格
            buy: quantity * this.price[this.price.length - 1]
        };

        //------執行買入------
        this.trade_func.buy(newBuyInfo.symbol,newBuyInfo.quantity,newBuyInfo.price).then((value) => {
            let returnMsg = JSON.stringify(value)
            if(returnMsg.includes("Error") == true){
                // error occur, do not save trading log 
                this.debug_log("=====================")
                this.debug_log("[錯誤發生][機器人執行時間(sec)]: " + this.running_time/1000 + " s")
                this.debug_log("[錯誤發生][時間戳記]: " + moment().format('MMMM Do YYYY, h:mm:ss a'))
                this.debug_log("[錯誤發生] Buy info: " + JSON.stringify(value))
                this.debug_log(`[錯誤發生] 對應的 symbol: ${newBuyInfo.symbol}, quantity: ${newBuyInfo.quantity}, price: ${newBuyInfo.price}`)
                this.debug_log("=====================")

                // debug - reconfigure
                this.trade_func.prepare(this.username)
            }
            else{
                // success 
                this.debug_log("=====================")
                this.debug_log("[機器人執行時間(sec)]: " + this.running_time/1000 + " s")
                this.debug_log("[時間戳記]: " + moment().format('MMMM Do YYYY, h:mm:ss a'))
                this.debug_log("Buy info: " + JSON.stringify(value))
                this.debug_log(`對應的 symbol: ${newBuyInfo.symbol}, quantity: ${newBuyInfo.quantity}, price: ${newBuyInfo.price}`)
                this.debug_log("=====================")

                // success, and record trading log
                // 儲存買入資訊
                this.buyInfo.push(newBuyInfo);
                // 儲存交易紀錄
                this.tradeInfo.push(newBuyInfo);
                // 儲存交易記錄到local端
                trade_record_func.pushIntoTradeRecord(this.id,newBuyInfo)
            }         
        })
        //--------------------
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
            tradePolicy: this.tradePolicy,
            symbol: this.tradingData.symbol,	//賣出交易對符號
            timeStamp: timeStamp,	//賣出時間
            type: 'sell',
            status: this.currentStatus,		//賣出類型(交易爆量導致的賣出、止損賣出、獲利賣出)
            quantity: totalQty, //賣出數量
            price: this.price[this.price.length - 1],	//賣出價格
            sell: totalQty * this.price[this.price.length - 1],
            ror: ( totalQty * this.price[this.price.length - 1] - totalCost ) / totalCost  //收益率
        };
        
        //------執行賣出------
        this.trade_func.sell(newSellInfo.symbol,newSellInfo.quantity,newSellInfo.price).then((value) => {
            let returnMsg = JSON.stringify(value)
            if(returnMsg.includes("Error") == true){
                // error occur, do not save trading log
                this.debug_log("=====================")
                this.debug_log("[錯誤發生][機器人執行時間(sec)]: " + this.running_time/1000 + " s")
                this.debug_log("[錯誤發生][時間戳記]: " + moment().format('MMMM Do YYYY, h:mm:ss a'))
                this.debug_log("[錯誤發生] Sell info: " + JSON.stringify(value))
                this.debug_log(`[錯誤發生] 對應的 symbol: ${newSellInfo.symbol}, quantity: ${newSellInfo.quantity}, price: ${newSellInfo.price}`)
                this.debug_log("=====================")

                // debug - reconfigure
                this.trade_func.prepare(this.username)
            }
            else{
                // success 
                this.debug_log("=====================")
                this.debug_log("[機器人執行時間(sec)]: " + this.running_time/1000 + " s")
                this.debug_log("[時間戳記]: " + moment().format('MMMM Do YYYY, h:mm:ss a'))
                this.debug_log("Sell info: " + JSON.stringify(value))
                this.debug_log(`對應的 symbol: ${newSellInfo.symbol}, quantity: ${newSellInfo.quantity}, price: ${newSellInfo.price}`)
                this.debug_log("=====================")
                // dealing with logs
                while (this.buyInfo.length > 0) {//清空買入資訊
                    this.buyInfo.pop();
                }
                this.tradeInfo.push(newSellInfo);//儲存交易紀錄
                // 儲存交易記錄到local端
                trade_record_func.pushIntoTradeRecord(this.id,newSellInfo)
            }
            
        })
        //--------------------
    }

    // Trade policy test func goes here 
    backTrackTest(yaml_string, start_time, end_time){
        return trade_bt.backtrack(yaml_string, start_time, end_time)
    }
}

module.exports = trade_bot
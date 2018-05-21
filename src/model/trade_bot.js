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


class trade_bot{
    constructor(){
        // record status
        this.currentStatus = 'wait';
        // price 
        this.price = [];
        // buy info
        this.buyInfo = [];
        // trade info 
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
     */
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
        self.systemInterval = setInterval(function(){
            console.log(self.id);
            self.load_policy_by_url(url);
        },10000)
    }

    start_by_obj(obj){
        // start trading
        let self=this;
        self.systemInterval = setInterval(function(){
            console.log(self.id);
            self.load_policy_by_obj(obj);
        },10000)
    }
    /**
     * Loading trading policy - and then start 
     * 
     * @function load_policy_by_url
     * @function load_policy_by_obj
     */
    load_policy_by_url(policy_path){
        this.tradingData = YAML.parse(fs.readFileSync(policy_path).toString())

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
    load_policy_by_obj(policy_obj){
        // Notice!
        // this policy_obj has been parsing by YAMLjs
        this.tradingData = policy_obj

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
        
        this.buyInfo.push(newSellInfo);
        /** FIXME: this part need to move to the place which after executing selling command */
        while (this.buyInfo.length > 0) {//清空買入資訊
            this.buyInfo.pop();
        }
        this.tradeInfo.push(newSellInfo);//儲存交易紀錄
    
        //------執行賣出------
        
        
        //--------------------
    }
}

module.exports = trade_bot
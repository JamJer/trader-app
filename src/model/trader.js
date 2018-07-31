/**
 * Trader channel
 * 
 * Dealing with Database, Multiple different module
 * Trade bot will use this module to store, load, communicate with other.
 * 
 */
const rs = require('randomstring');
const moment = require('moment');
const request = require('request');
const rp = require('request-promise');

// configuration
const config = require("../config/config.default");
// logger 
const {logger} = require('./logger')
// bot instance
const trade_bot = require('./trade_bot');
// database 
const {db} = require('./db');

const FUND_CHECK_INTERVAL = 10000

/**
 * Main trader channel instance
 */
class trader{
	constructor(){
		// Need to maintain all trader bot's instance
		this.botID_queue = []
		this.fund_check
	}

	/**
	 * 
	 * Operations supported by trader channel (main handler)
	 * 
	 * @function kill_bot 		using id to terminate target instance
	 * @function kill_all_bot	terminate all instances
	 * @function create_bot 	create bot instance and run
	 * 
	 */
	kill_all_bot(){
		this.botID_queue.forEach(element => {
			element.instance.stop();
			// record into system log
			logger.sys_log({
				type: "Info",
				msg: `[Trader][Kill all Bot] bot id: ${element.instance.id}`
			})
		});
		this.botID_queue = []
	}

	kill_bot(id){
		for(let i in this.botID_queue){
			if(this.botID_queue[i].id == id){
				this.botID_queue[i].instance.stop();
				// splice current element
				this.botID_queue.splice(i,1)
				// record into system log
				logger.sys_log({
					type: "Info",
					msg: `[Trader][Kill Bot] bot id: ${id}`
				})
				return;
			}
		}

	}

	create_bot(url){
		// create new instance
		let newbot = new trade_bot(config.username);
		// run !
		newbot.start_by_url(url);
		this.botID_queue.push({
			id: newbot.get_id(),
			instance: newbot
		});
		// record into system log
		logger.sys_log({
			type: "Info",
			msg: `[Trader][Create Bot] bot id: ${id}`
		})
	}

	bot_fund_check_proc(){
		clearInterval(this.fund_check);
		console.log("BOT FUND CHECK PROCESS ACTIVATED")
		let self = this;
		this.fund_check = setInterval(function(){
			let maxBuyCount = config.userFundSegVal
			let nowBuyCount = 0
			for(let i in self.botID_queue){
				let buyInfo = self.botID_queue[i].instance.buyInfo
				nowBuyCount += buyInfo.length
			}
			config.store_buy_count(nowBuyCount)
			if(maxBuyCount <= nowBuyCount){
				config.store_buy_availiable(false)
			}else{
				config.store_buy_availiable(true)
			}
			console.log("[FUND CHECK PROCESS] TOTAL MAX BUY COUNT: "+maxBuyCount+" | NOW TOTAL BUY COUNT: "+nowBuyCount)
		},FUND_CHECK_INTERVAL);
	}

	stop_fund_check_proc(){
		clearInterval(this.fund_check);
	}

	/**
	 * Main Entry of trader, receive the trade operation command from ipcRenderer
	 * - And then mapping to corresponding action
	 * 
	 * @param arg.cmd 				command type 
	 * @param arg.market  			select coin market
	 * @param arg.quantity 			quantity value
	 * @param arg.price_sell		price when you sell 
	 * @param arg.price_buyin		price when you buy in
	 * 
	 */
	main_entry(event,arg){
		/**
		 * 
		 * @param arg.cmd 
		 * 
		 * @function trade store one deal into database
		 * 
		 * @function trade_log fetch all the trading log return
		 * 
		 */
		switch(arg.cmd){
			/**
			 * ==================== cmd: trade ====================
			 */
			case "trade":
				/**
				 * Get the information of trade, and then store into database
				 */
				let trade_id = rs.generate(7);
				let trade_date = moment().format('MMMM Do YYYY, h:mm:ss a');;

				// calculate profit
				let profit = parseFloat(arg.quantity)*(parseFloat(arg.price_sell)-parseFloat(arg.price_buyin));

				try{
					// store in database
					db.store_deal_log(trade_id,trade_date,arg.market,arg.quantity,arg.price_sell,arg.price_buyin,profit,"Completed",
					(err,msg)=>{
						// Get all the trading log from database
						db.list_deal_log((err,rows)=>{
							event.sender.send('update_trading_chart',{
								rows: rows
							});
						})
						
					});
				}catch(err){
					// record into system log
					logger.sys_log({
						type: "Error",
						msg: `[Trader][Trade] Error when storing deal log to db, error: ${err}`
					})
				}
				

				break;
			/**
			 * ==================== cmd: trade_log ====================
			 */
			case "trade_log":
				try{
					db.list_deal_log((err,rows)=>{
						event.sender.send('update_trading_chart',{
							rows: rows
						});
					})
				}catch(err){
					// record into system log
					logger.sys_log({
						type: "Error",
						msg: `[Trader][Trade log] Error when fetching from db, error: ${err}`
					})
				}
				
				break;
		}
	}
}

const t = new trader();
module.exports = t;

/*module.exports = {
	t : new trader()
}*/
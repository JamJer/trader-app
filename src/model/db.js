/**
 * Provide local storage for current user
 * - record user info (product key)
 * - user's trading policies
 * - user's trading information
 * 
 * using sqlite3 -> less dependencies
 * (need to remind window's user)
 */
const sqlite3 = require("sqlite3").verbose();
const config = require("../config/config.default");

// operation of diff module
const logger = require("./db/logger");
const policy_op = require("./db/policy");
const trade_op = require("./db/trade");
const user_op = require("./db/user");

class db {
    constructor(){
        // need to specify from repository root
        this.db = new sqlite3.Database('./storage.db');
        let self=this;
        this.db.serialize(function() {
            // create schema 
            // ======================= user data =======================
            self.db.run("CREATE TABLE if not exists user \
                    (\
                        username TEXT,\
                        passwd TEXT,\
                        product_key TEXT\
						binance_apikey TEXT\
						binance_apisecret TEXT\
                    )");
            // ======================= trading policy =======================
            /**
             * id: name of trade policy name
             * loc: storage location of this trade policy 
             */
            self.db.run("CREATE TABLE if not exists trade_policy \
                    (\
                        trade_policy_id TEXT,\
                        trade_policy_loc TEXT\
                    )");
					
            /**
             * 
             */
			self.db.run("CREATE TABLE if not exists trade_log \
                    (\
                        username TEXT,\
                        timestamp TEXT,\
                        action TEXT,\
						symbol TEXT,\
                        quantity TEXT,\
                        price TEXT\
                    )");
            
            // ======================= trading record =======================
            /**
             * trade_record: 
             * @param trade_id          ID of this trade
             * @param trade_date        date of this trade
             * @param market            ex: BTC-SNT
             * @param quantity          quantity of this trade
             * @param price_buyin       price when this trade buy in
             * @param price_sell        price when this trade sell
             * @param profit            profit made by this trade
             * @param state             current state of this trade
             */
            self.db.run("CREATE TABLE if not exists trade_record \
                (\
                    trade_id TEXT,\
                    trade_date TEXT,\
                    market TEXT,\
                    quantity TEXT,\
                    price_sell TEXT,\
                    price_buyin TEXT,\
                    profit TEXT,\
                    state TEXT\
                )");
            // ======================= debug data can insert here =======================
            /*var stmt = db.prepare("INSERT INTO user_info VALUES (?)");
            for (var i = 0; i < 10; i++) {
                stmt.run("Ipsum " + i);
            }
            stmt.finalize();
            db.each("SELECT rowid AS id, info FROM user_info", function(err, row) {
                console.log(row.id + ": " + row.info);
            });*/
        });
        // close
        //this.db.close();
    }

    /**
     * Database of client side
     */

    // ================================== User-based ==================================
    store_product_key(uname,upass,key,cb){
        user_op.store_product_key(this,uname,upass,key,cb)
    }

    // ================================== Policy-based ==================================
    add_new_policy(id,loc,cb){
        policy_op.add_new_policy(this,id,loc,cb)
    }

    list_exist_policy(cb){
        policy_op.list_exist_policy(this,cb)
    }
    
    // ================================== Log-based ==================================
    store_deal_log(trade_id,trade_date,market,quantity,price_sell,price_buyin,profit,state,cb){
        logger.store_deal_log(this,trade_id,trade_date,market,quantity,price_sell,price_buyin,profit,state,cb)
    }

    list_deal_log(cb){
        logger.list_deal_log(this,cb)
    }

    // ================================== Trade-based (WIP, fixing) ==================================
	store_binance_api_key(uname,key,secret,cb){
        trade_op.store_binance_api_key(this,uname,key,secret,cb)
    }
	
	get_binance_api_key(uname, cb) {
		trade_op.get_binance_api_key(this,uname,cb)
	}
	
	store_trade_log(uname, action, symbol, quantity, price) {
		trade_op.store_trade_log(this,uname, action, symbol, quantity, price)
	}
}

module.exports = {
    db: new db()
}
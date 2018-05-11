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
					
					
			self.db.run("CREATE TABLE if not exists trade_log \
                    (\
                        username TEXT,\
                        timestamp TEXT,\
                        action TEXT,\
						symbol TEXT,\
                        quantity TEXT,\
                        price TEXT\
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
    store_product_key(uname,upass,key,cb){
        // Detect if current user have enroll before
        let self=this;
        this.db.get("SELECT username,passwd,product_key FROM user WHERE username=$name AND passwd=$pass AND product_key=$key",{
            $name: uname, $pass: upass, $key: key
        },function(err,row){
            if(row==undefined){
                // Not exist, then store it
                let stmt = self.db.prepare("INSERT INTO user (username,passwd,product_key) VALUES (?,?,?)");
                stmt.run(uname,upass,key);
                cb(0,"successfully insert the key");
            }
            else{
                // Existed -> Do update?
                cb(1,"existed");
            }
        })
    }

    list_exist_policy(cb){
        this.db.all("SELECT * FROM trade_policy",{},function(err,rows){
            if(rows==undefined){
                // Not found
                cb(0,[]);
            }
            else{
                // Return row array with format: 
                // [ { trade_policy_id: 'name',trade_policy_loc: '/tmp/name.json' } ]
                cb(0,rows);
            }
        })
    }
	
	store_binance_api_key(uname,key,secret,cb){
        // Detect if current user have enroll before
        let self=this;
        this.db.get("SELECT username FROM user WHERE username=$name",{
            $name: uname
        },function(err,row){
            if(row==undefined){
                // User does not exist, should not happen.
				cb(1,"unexpected error.");
            }
            else{
				// Store api key to db.
                let stmt = self.db.prepare("UPDATE user SET binance_apikey=?, binance_apisecret=? WHERE username=?");
                stmt.run(key, secret, uname);
                cb(0,"successfully store the key");
            }
        })
    }
	
	get_binance_api_key(uname, cb) {
		this.db.get("SELECT binance_apikey,binance_apisecret FROM user WHERE username=$name",{
            $name: uname
        },function(err,row){
            if(row==undefined){
                // User does not exist, should not happen.
				cb(1,"unexpected error.");
            }else{
				if(row.binance_apikey==null) {
					cb(1,"api key not found.");
				}else{
					// return Binance API Key
					cb(0,row);
				}
            }
        })
	}
	
	store_trade_log(uname, action, symbol, quantity, price) {
		const timestamp = Math.round(+new Date()/1000);
		let stmt = this.db.prepare("INSERT INTO trade_log (username,timestamp,action,symbol,quantity,price) VALUES (?,?,?,?,?,?)");
		stmt.run(uname,timestamp,action,symbol,quantity,price);
	}
}

module.exports = {
    db: new db()
}
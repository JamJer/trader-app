/**
 * Operation of trade bot in db.js
 * 
 * @function store_binance_api_key
 * @function get_binance_api_key
 * @function store_trade_log
 * 
 */
const trade_op = {}

trade_op.store_binance_api_key = function(self,uname,key,secret,cb){
    // Detect if current user have enroll before
    self.db.get("SELECT username FROM user WHERE username=$name",{
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

trade_op.get_binance_api_key = function(self,uname,cb){
    self.db.get("SELECT binance_apikey,binance_apisecret FROM user WHERE username=$name",{
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

trade_op.store_trade_log = function(self,uname,action,symbol,quantity,price){
    const timestamp = Math.round(+new Date()/1000);
    let stmt = self.db.prepare("INSERT INTO trade_log (username,timestamp,action,symbol,quantity,price) VALUES (?,?,?,?,?,?)");
    stmt.run(uname,timestamp,action,symbol,quantity,price);
}

module.exports = trade_op
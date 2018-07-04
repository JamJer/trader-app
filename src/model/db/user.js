/**
 * Operation of user in db.js
 * 
 * @function 
 * 
 */
const user_op = {}

user_op.store_product_key = function(self,uname,upass,key,cb){
    // Detect if current user have enroll before
    self.db.get("SELECT username,passwd,product_key FROM user WHERE username=$name AND passwd=$pass AND product_key=$key",{
        $name: uname, $pass: upass, $key: key
    },function(err,row){
        if(row==undefined){
            // Not exist, then store it
            let stmt = self.db.prepare("INSERT INTO user (username,passwd,product_key,binance_apikey,binance_apisecret) VALUES (?,?,?,?,?)");
            stmt.run(uname,upass,key,null,null);
            cb(0,"successfully insert the key");
        }
        else{
            // Existed -> Do update?
            cb(1,"existed");
        }
    })
}


user_op.store_api_ks = function(self,uname,apikey,apisecret,cb){
    // 
    // console.log(apikey)
    // console.log(apisecret)
    self.db.run("UPDATE user SET binance_apikey =? ,binance_apisecret = ? WHERE username = ?",
        [ apikey, apisecret, uname],
        function(err){
            console.log(err);
            if(err) 
                cb(1,err.message)
            else
                cb(0,"api key/secret update successfully")
        })
}


module.exports = user_op
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
        this.db = new sqlite3.Database('./src/db/storage.db');
        let self=this;
        this.db.serialize(function() {
            // create schema 
            // ======================= user data =======================
            self.db.run("CREATE TABLE if not exists user \
                    (\
                        username TEXT,\
                        passwd TEXT,\
                        product_key TEXT\
                    )");
            // ======================= trading policy =======================
            /**
             * id: name of trade policy name
             * loc: storage location of this trade policy 
             */
            self.db.run("CREATE TABLE trade_policy \
                    (\
                        trade_policy_id TEXT,\
                        trade_policy_loc TEXT\
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
}

module.exports = {
    db: new db()
}
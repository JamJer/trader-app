/**
 * Logging system for APP
 * 
 * @function store_deal_log     store record per deal
 * @function list_deal_log      list all existed deal log
 * 
 */

const logger = {}

logger.store_deal_log = function(
    self,
    trade_id,trade_date,
    market,quantity,
    price_sell,price_buyin,profit,
    state,
    cb
){
    // self = db
    
    // check
    self.db.get("SELECT * FROM trade_record WHERE trade_id=$id",{
        $id: trade_id
    },function(err,row){
        if(row==undefined){
            // Not exist, store it
            let stmt = self.db.prepare("INSERT INTO trade_record (trade_id,trade_date,market,quantity,price_sell,price_buyin,profit,state) VALUES (?,?,?,?,?,?,?,?)")
            stmt.run(trade_id,trade_date,market,quantity,price_sell,price_buyin,profit,state)
            cb(0,"[Logger] successfully add new trade record");
        }
        else{
            // Existed, do nothing
            cb(1,"existed")
        }
    })
}

logger.list_deal_log = function(
    self,
    cb
){
    self.db.all("SELECT * FROM trade_record",{},function(err,rows){
        if(rows==undefined){
            // Not found
            cb(0,[]);
        }
        else{
            // Return row array with format: 
            // [ { trade_id: id,trade_date: '...', ... } ]
            cb(0,rows);
        }
    })
}

module.exports = logger
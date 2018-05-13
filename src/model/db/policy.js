/**
 * Operation of policy in db.js
 * 
 * @function add_new_policy
 * @function list_exist_policy
 * 
 */
const policy_op = {}

policy_op.add_new_policy = function(self,id,loc,cb){
    // check 
    self.db.get("SELECT * FROM trade_policy WHERE trade_policy_id=$id",{
        $id: id
    },function(err,row){
        if(row==undefined){
            // Not exist, then store it
            let stmt = self.db.prepare("INSERT INTO trade_policy (trade_policy_id,trade_policy_loc) VALUES (?,?)");
            stmt.run(id,loc);
            cb(0,"successfully add new policy");
        }
        else{
            // Existed, do nothing
            // FIXME -> open edit page?
            cb(1,"existed");
        }
    })
}

policy_op.list_exist_policy = function(self,cb){
    self.db.all("SELECT * FROM trade_policy",{},function(err,rows){
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

module.exports = policy_op;
/**
 * Editor channel
 * 
 * Use to handling the request from editor (create.html, create_channel.js)
 * 
 */
const fs = require('fs')
const path = require('path');
const url = require('url');
// loading configuration
const config = require('../config/config.default');

class editor{
    constructor(){

    }

    /**
     * @func policy_list
     * @func policy_save
     * @func policy_delete
     */

    policy_list(event,arg){
        /**
         * @param null
         */
        let policy_list = []
        for(let i in config.userPolicyList){
            policy_list.push(config.userPolicyList[i].policy_id)
        }

        event.sender.send("response_policy_list",{
            msg: "Successfully fetching policies.",
            data: policy_list
        })
    }

    policy_data(event,arg){
        let policy_data = ""
        for(let i in config.userPolicyList){
            if(config.userPolicyList[i].policy_id == arg.policy_file){
                policy_data = config.userPolicyList[i]['content']
            }
        }
        console.log("Policy data:"+policy_data)
        event.sender.send("response_policy_data",{
            msg: "Successfully fetching police data.",
            filename: arg.policy_file,
            data: policy_data
        })
    }

    policy_save(event,arg){
        /**
         * @param arg.filename
         * @param arg.filedata
         */
        console.log("Writing Policy...")
        console.log(arg)
        console.log(path.join(config.policy.path,arg.filename))
        fs.writeFile(path.join(config.policy.path,arg.filename),arg.filedata,function(err){
            if(err){
                event.sender.send("response_policy_save",{
                    msg: "File save ERROR!",
                    data: err
                });
            }
            else{
                event.sender.send("response_policy_save",{
                    msg: "File saved!",
                    data: err
                });
            }
        })
    }

    policy_delete(event,arg){
        /**
         * @param arg.filename
         */
        fs.unlink(path.join(config.policy.path,arg.filename),(err)=>{
            if(err){
                event.sender.send("response_policy_delete",{
                    msg: "Delete file failed!",
                    data: err
                })
            }
            else{
                event.sender.send("response_policy_delete",{
                    msg: "File deleted successfully!",
                    data: err
                })
            }
        })
    }
}

module.exports = {
    editor: new editor()
}
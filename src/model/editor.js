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

// requester 
const requester = require('./requester')

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
        console.log("Update user policy with server...")
        let postData = {
            username: config.username, 
            passwd: config.passwd
        }
        requester.redirect(config.server.url+config.api.user.policy_list, postData, postData)
            .then((response)=> {
                let res;
                if(response){
                    try {
                        res = JSON.parse(response)
                    } catch (err){
                        console.log(`[POLICY UPDATE][Body 無法被 JSON.parse 解析] error: ${err} ,data: ${res}`)
                    }
                }
                if(res.msg=="found"){
                    config.store_user_policy_list(res.policy_list)
                    console.log("User's own policy information has been stored in config.default")
                    let policy_list = []
                    for(let i in config.userPolicyList){
                        policy_list.push(config.userPolicyList[i].policy_id)
                    }
                    event.sender.send("response_policy_list",{
                        msg: "found",
                        data: policy_list
                    })
                }else{
                    event.sender.send("response_policy_list",{
                        msg: "empty"
                    });
                }
            })
    }

    policy_data(event,arg){
        let policy_data = ""
        for(let i in config.userPolicyList){
            if(config.userPolicyList[i].policy_id == arg.policy_file){
                policy_data = config.userPolicyList[i]['content']
            }
        }
        console.log("Policy name:"+arg.policy_file)
        console.log("Policy data:"+policy_data)
        event.sender.send("response_policy_data",{
            msg: "Successfully fetching police data.",
            filename: arg.policy_file,
            data: policy_data
        })
    }

    get_policy_template(event,arg){
        console.log("Now starting the policy template fetching.")
        let postData = {
            username: config.username, 
            passwd: config.passwd
        }
        requester.redirect(config.server.url+config.api.user.policy_template, postData, postData)
            .then((response)=> {
                let res;
                if(response){
                    event.sender.send("receive_policy_template",{
                        msg: "success",
                        data: response
                    });
                }else{
                    event.sender.send("receive_policy_template",{
                        msg: "error",
                        data: ""
                    });
                }
            })
    }

    check_policy_name_duplicate(event,arg){
        console.log("checking policy name")
        if(arg.editType == 'new'){
            let check = false
            for(let i in config.userPolicyList){
                if(config.userPolicyList[i].policy_id == arg.policy_id)
                {
                    check = true
                }
            }
            event.sender.send("receive_check_policy_name_duplicate",{
                data: check,
                editType: arg.editType
            });
        }else if(arg.editType == 'old'){
            let check = false
            for(let i in config.userPolicyList){
                if((config.userPolicyList[i].policy_id == arg.policy_id) && (config.userPolicyList[i].policy_id != arg.nowfilename))
                {
                    check = true
                }
            }
            event.sender.send("receive_check_policy_name_duplicate",{
                data: check,
                editType: arg.editType
            });
        }else{
            console.log("[POLICY duplicate check] ERROR: Not a correct edit type. Check failed.")
        }
    }

    policy_save(event,arg){
        /**
         * @param arg.filename
         * @param arg.filedata
         */
        console.log("Saving policy to server...")
        console.log(arg)
        arg.filename = arg.filename.split(".")[0]

        if(arg.editType == 'new'){
            let postData = {
                username: config.username, 
                passwd: config.passwd,
                key_id: config.productkey,
                policy_id: arg.filename,
                content: arg.filedata
            }
            requester.redirect(config.server.url+config.api.user.policy_create, postData, postData)
            .then((response)=> {
                let res;
                if(response){
                    try {
                        res = JSON.parse(response)
                    } catch (err){
                        console.log(`[POLICY SAVE][Body 無法被 JSON.parse 解析] error: ${err} ,data: ${res}`)
                    }
                }
                if(res.msg=="success"){
                    event.sender.send("response_policy_save",{
                        msg: "success",
                        editType: arg.editType,
                        policy_id: res.policy_id
                    });
                }else{
                    event.sender.send("response_policy_save",{
                        msg: "duplicate",
                        editType: arg.editType,
                        policy_id: ""
                    });
                }
            })
        }else if(arg.editType == 'old'){
            arg.filename = arg.filename.split(".")[0]
            console.log("OLD AND NEW FILE:"+arg.filename+" "+arg.nowfilename)
            if(arg.filename == arg.nowfilename){
                let postData = {
                    username: config.username, 
                    passwd: config.passwd,
                    key_id: config.productkey,
                    policy_id: arg.filename,
                    content: arg.filedata
                }
                requester.redirect(config.server.url+config.api.user.policy_content, postData, postData)
                .then((response)=> {
                    let res;
                    if(response){
                        try {
                            res = JSON.parse(response)
                        } catch (err){
                            console.log(`[POLICY SAVE][Body 無法被 JSON.parse 解析] error: ${err} ,data: ${res}`)
                        }
                    }
                    if(res.msg=="update"){
                        event.sender.send("response_policy_save",{
                            msg: "success",
                            editType: arg.editType,
                            policy_id: arg.filename
                        });
                    }else{
                        event.sender.send("response_policy_save",{
                            msg: "not found",
                            editType: arg.editType,
                            policy_id: ""
                        });
                    }
                })
            }else if(arg.filename != arg.nowfilename){
                let postData1 = {
                    username: config.username, 
                    passwd: config.passwd,
                    key_id: config.productkey,
                    new_policy_id: arg.filename,
                    ori_policy_id: arg.nowfilename
                }
                let postData2 = {
                    username: config.username, 
                    passwd: config.passwd,
                    key_id: config.productkey,
                    policy_id: arg.filename,
                    content: arg.filedata
                }
                requester.redirect(config.server.url+config.api.user.policy_name, postData1, postData1)
                .then((response)=> {
                    let res;
                    if(response){
                        try {
                            res = JSON.parse(response)
                        } catch (err){
                            console.log(`[POLICY SAVE][Body 無法被 JSON.parse 解析] error: ${err} ,data: ${res}`)
                        }
                    }
                    if(res.msg=="update"){
                        requester.redirect(config.server.url+config.api.user.policy_content, postData2, postData2)
                        .then((response)=> {
                            let res;
                            if(response){
                                try {
                                    res = JSON.parse(response)
                                } catch (err){
                                    console.log(`[POLICY SAVE][Body 無法被 JSON.parse 解析] error: ${err} ,data: ${res}`)
                                }
                            }
                            if(res.msg=="update"){
                                event.sender.send("response_policy_save",{
                                    msg: "success",
                                    editType: arg.editType,
                                    policy_id: arg.filename
                                });
                            }else{
                                event.sender.send("response_policy_save",{
                                    msg: "not found",
                                    editType: arg.editType,
                                    policy_id: ""
                                });
                            }
                        })
                    }else{
                        event.sender.send("response_policy_save",{
                            msg: "not found or duplicated",
                            editType: arg.editType,
                            policy_id: ""
                        });
                    }
                })
            }else{
                console.log("[POLICY SAVE] ERROR: filename nowfilename not give a reason.")
            }
        }else{
            console.log("[POLICY SAVE] ERROR: Not a correct edit type. Save failed.")
        }
    }

    policy_delete(event,arg){
        /**
         * @param arg.filename
         */
        let postData = {
            username: config.username, 
            passwd: config.passwd,
            key_id: config.productkey,
            policy_id: arg.filename
        }
        requester.redirect(config.server.url+config.api.user.policy_delete, postData, postData)
        .then((response)=> {
            if(response){
                console.log(response)
                if(response == "deleted"){
                    event.sender.send("response_policy_delete",{
                        msg: "File deleted successfully!",
                        res: response
                    })
                }else{
                    event.sender.send("response_policy_delete",{
                        msg: "File deleted Failed",
                        res: response
                    });
                }
            }
        })
    }
}

module.exports = {
    editor: new editor()
}
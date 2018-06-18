/**
 * 交易策略回測
 * 
 * - 用以判斷買賣、以獲得最大獲利
 */
const request = require('request');
const YAML = require("yamljs");
const trade_backtracking = {};

// url definition
const backtrack_url = "https://trader-bot-backtesting-jamesshieh0510.c9users.io/"

/**
 * 
 * @param yaml_string       交易策略的 JSON string
 * @param start             開始的時間
 * @param end               結束的時間
 * 
 */
trade_backtracking.backtrack = function(yaml_string,start,end){
    // source is yaml string
    let jsonObj = YAML.parse(yaml_string)
    console.log(jsonObj)
    // using post command to get backtracking data 
    // timeout unit: ms, set 10 min = 10*60 s = 10*60*1000 ms
    let timeout = 10*60*1000;
    request({
        url: backtrack_url,
        method: "POST",
        timeout: timeout,
        json: true,
        headers: {
            "content-type": "application/json"
        },
        body: {
            yaml_string: JSON.stringify(jsonObj),
            start: start,
            end: end
        }
    },function(error,response,body){
        if(!error && response.statusCode == 200){
            console.log(body)
        }
        else{
            console.log(error);
            console.log(body)
        }
    })
}

module.exports = trade_backtracking;
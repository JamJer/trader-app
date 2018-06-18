/**
 * 交易策略回測
 * 
 * - 用以判斷買賣、以獲得最大獲利
 */
const request = require('request');
const YAML = require("yamljs");
const trade_backtracking = {};

// url definition
const backtrack_url = "https://ectrader-backtesting.herokuapp.com/"

/**
 * 
 * @param yaml_string       讀取交易策略後，回傳的檔案內容（string）
 * @param start             開始的時間
 * @param end               結束的時間
 * 
 */
trade_backtracking.backtrack = function(yaml_string,start,end){
    // source is yaml string
    // using post command to get backtracking data 
    // timeout unit: ms, set 10 min = 10*60 s = 10*60*1000 ms
    let timeout = 10*60*1000;
    request.post({url: backtrack_url,form:{yaml_string:yaml_string,start: start,end: end}, timeout: timeout},
        function(error,response,body){
            if(!error && response.statusCode == 200){
                console.log(body)
            }
            else{
                console.log(error);
                console.log(body)
            }
        })

    /* Old code.
    request({
        url: backtrack_url,
        method: "POST",
        timeout: timeout,
        json: true,
        headers: {
            "content-type": "application/x-www-form-urlencoded"
        },
        body: {
            yaml_string: yaml_string,
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
    })*/
}

module.exports = trade_backtracking;
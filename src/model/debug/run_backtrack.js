/**
 * Backtracking function 的 debug 腳本
 * 
 * 對其直接送參數進去做操作，並察看結果
 */

const fs = require('fs')
const trade_bt = require("../trade_backtrack")

const yamlstr = fs.readFileSync("../../../.local/policy/test_001.yaml",{encoding: "UTF-8"})

// read from a normal yaml file, then assign the date for it
trade_bt.backtrack(yamlstr,"2018-01-01 00:00:00","2018-06-01 00:00:00");
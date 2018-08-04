/**
 * Debug 
 * - Requester
 * - async/await
 */

const requester = require('../requester')
const YAML = require('yamljs')
const config = require("../../config/config.default");

duration = 5000;
teststr = "---\
symbol: BTCUSDT\
duration: 0\
capital: 1000\
ma: 25h\
buy:\
    descrip: \
    range: 100\
    volume: 10\
    spread: 10\
    stoloss: 10\
    rally: 10.5\
sell:\
    descrip:\
    magnification: 5\
    range: 100\
    volume:\
    belowma: 5 \
..."

async function isPriceBelowMAXTime(){
    let arg = {
        tradingData: JSON.stringify(YAML.parse(teststr)),
        duration: duration.toString(),
        dataMA: JSON.stringify([]),
        price: JSON.stringify([])
    }

    try {
        const result = await requester.direct(config.server.db_url+config.api.bot.ipbmt,arg)
        return result;
    } catch (err){
        return "false";
    }
}

async function isDebug(){
    let arg = {
    }

    try {
        const result = await requester.direct(config.server.db_url+"/api/v1/strategy/bot/debug",arg)
        if(result == "true")
            return "true";
        else
            return "wrong"
    } catch (err){
        return "false";
    }
}

/*isPriceBelowMAXTime().then((v)=>{
    console.log(v)
})*/

isDebug().then((v)=>{
    console.log(v)
})

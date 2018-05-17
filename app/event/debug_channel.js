/**
 * ipcRenderer - Debug panel
 * 
 * Implement the trading operation and test,
 * using the api provided by binance.
 */

const { remote, ipcRenderer } = require('electron');
const currentWindow = remote.getCurrentWindow();
const path = require('path');
const url = require('url');

// binance api
const Binance = require('binance-api-node').default
const client = Binance()

/**
 * Implementation Target: 
 * 
 * @function check_alive check the binance server is alive or not
 * @function get_exchange_info get the exchange information (entire info, at current time)
 * @function get_daily_stats get the 24 hours price change statistics
 * @function get_prices get the latest price for all symbols
 * 
 * 
 */

// Test the connection with binance server 
// Check with 10s duration
setInterval(()=>{
    check_alive();
},10000)

check_alive();
// get_exchange_info();
// get_daily_stats('ETHBTC')
// get_prices();


// IPC Channel
// Binance API configuration
let api_config = document.querySelector("#config_binance");
api_config.addEventListener("submit",function(event){
    console.log(__dirname);
    event.preventDefault();
    // fetch API key 
    let uname = document.getElementById("username").value;
    let upass = document.getElementById("passwd").value;
    let apikey = document.getElementById("apikey").value;
    let apisecret = document.getElementById("apisecret").value;

    // console.log(`${apikey}, ${apisecret}`)
    // sent to local database
    ipcRenderer.send('api_config',{
        uname,
        upass,
        apikey,
        apisecret
    })
});

ipcRenderer.on('api_config_success',(event,arg)=>{
    
})

// some implementation
function get_prices(){
    client.prices().then((instance)=>{
        console.log(instance)
    })
}

function get_daily_stats(str){
    client.dailyStats({ symbol: str }).then((stat)=>{
        console.log(stat)
    })
}

function get_exchange_info(){
    client.exchangeInfo().then(info => {
        console.log(info);
    })
}

function check_alive(){
    client.time().then(time => {
        console.log("Binance Server - System time: " + time)
        // Set the label as connected!
        document.getElementById("server_status").setAttribute("class","btn btn-success")
        document.getElementById("server_status").innerHTML = "Connected!"
    }).catch(err => {
        console.log(err); 
        // Set the label as disconnected
        document.getElementById("server_status").setAttribute("class","btn btn-danger")
        document.getElementById("server_status").innerHTML = "Disconnected!"
    })
}
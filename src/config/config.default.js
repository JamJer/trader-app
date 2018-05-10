/**
 * Main Process:
 * This file is the configuration of Trader App 
 */

class config{
    constructor(){
        /**
         * ==================== Server ====================
         * server_url: path to our remote server
         * port: port of our remote server
        */
        this.server = {
            url: "http://localhost",
            port: 3000
        }
        /** 
         * ==================== Client-side usage ====================
         * json_path
         */
        this.local = {
            json_path: ""
        }
        /**
         * =================== trade bot ===================
         * trade_binance_apiKey: Binance API Key
         * trade_binance_apiSecret: Binance API Secret
         * trade_binance_recvWindow: 
         */
        this.trade = {
            binance_apiKey: "TqpMzTdLBMBbDEHfuqK5PYNn4egl4dPqrtRsfTyYXyD3h0GvtYMg2EnhCYP5COEc",
            binance_apiSecret: "",
            binance_recvWindow: 5000
        }

        // back up , set to default
        this.default = this
    }
}

const conf = new config();
module.exports = conf
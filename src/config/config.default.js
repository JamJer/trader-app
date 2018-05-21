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
            binance_apiKey: "hKL4wY0lpybbrhGQDk0DoHRCWWR4dJdSFHxhBpgsmj69KcllUsCjseHIAqW4Fdhc",
            binance_apiSecret: "UFj6uyJZhz3l2XyfD1p74eWe8WhRwAavr4XK17aGKnyT32cn74I3SbMZMwJ54Q3Z",
            binance_recvWindow: 5000
        }

        // back up , set to default
        this.default = this
    }
}

const conf = new config();
module.exports = conf
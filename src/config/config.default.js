/**
 * Main Process:
 * This file is the configuration of Trader App 
 */

module.exports = {
    /**
     * ==================== Server ====================
     * server_url: path to our remote server
     * port: port of our remote server
     * 
     * ==================== Client-side usage ====================
     * json_path
     * 
	 * =================== trade bot ===================
	 * trade_binance_apiKey: Binance API Key
	 * trade_binance_apiSecret: Binance API Secret
	 * trade_binance_recvWindow: 
	 *
     */
    "server_url": "http://localhost",
    "port": 3000,
    "json_path": "",
	"trade_binance_apiKey": "TqpMzTdLBMBbDEHfuqK5PYNn4egl4dPqrtRsfTyYXyD3h0GvtYMg2EnhCYP5COEc",
	"trade_binance_apiSecret": "LV4ItBJM5X1Y1Qq4CzAcCVTXXoyu5bwW1qHbmDuTldVua2CnBlLzZjx1fMhTUHWo",
	"trade_binance_recvWindow": 5000
};
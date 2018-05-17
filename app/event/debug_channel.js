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

const Binance = require('binance-api-node').default
const client = Binance()

// Test the connection with binance server 
client.time().then(time => console.log(time))
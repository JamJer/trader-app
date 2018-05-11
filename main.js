'use strict';

const electron = require('electron');
const {Menu} = require('electron');
const fs = require('fs');
// module to control app life
const app = electron.app
// module to create native browser window
const BrowserWindow = electron.BrowserWindow
const dialog = electron.dialog;
const path = require('path');
const url = require('url');

let event = null;
let mainWindow = null;

// Create Window
function create_window(){
    mainWindow = new BrowserWindow({
        height: 800,
        width: 800,
        icon: path.join(__dirname,'app','img','logo_big-1-300x300.png') /* ICON */
    })

    // devTools
    //mainWindow.webContents.openDevTools()

    // load index.html of the app
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname,'app','index.html'),
        protocol: 'file:',
        slashes: true,
        baseUrl: 'app'
    }))
    event = require('./src/main/event');
    // Emitted when the windows is closed
    mainWindow.on('closed',function(){
        // if you have multi-window, can store in array 
        // and delete here
        mainWindow = null
    })
}

app.on('ready', function() {
    create_window()
});

// quit when all windows are closed 
app.on('window-all-closed',function(){
    if(process.platform !== 'darwin') app.quit()
})

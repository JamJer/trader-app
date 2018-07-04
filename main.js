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

// detect ./local , if not exist, create one
function init(path){
    fs.stat(path,function(err,stats){
        //console.log(stats)
        if(stats==undefined){
            // not exists 
            fs.mkdir(path,()=>{
                console.log("Create!")
            });
        }else{
            console.log("Existed!")
        }
    })
}

// Create Window
function create_window(){
    mainWindow = new BrowserWindow({
        minHeight: 800,
        minWidth: 1250,
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
    // create .local
    init('.local/')
    // create policy and self 
    init('.local/policy')
    init('.local/self')

    // create window
    create_window()
});

// quit when all windows are closed 
app.on('window-all-closed',function(){
    if(process.platform !== 'darwin') app.quit()

    /**
     * Reset state can goes here
     */
})

/**
 * Here is the Main Process running in nodejs
 * Then store the data into Other model
 */
const {ipcMain} = require('electron');
// FIXME: need to use https when this program release
const qs = require('querystring');
const http = require('http');
const server_url = "localhost",port=3000;

ipcMain.on('ulogin',(event,arg) => {
    // Send message to remote server enroll 
    console.log(arg);
    
    let obj = qs.stringify(arg);
    // Http options
    let http_options = {
		hostname: server_url,
		port: 3000,
		path: '/ulogin',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(obj)
		}
    };
    // Http request
    const http_req = http.request(http_options,function(res){
        res.setEncoding('utf8');
        res.on('data',function(chunk){
            console.log(chunk);
        });
        res.on('end',function(){
            console.log("Sending process terminate successfully.");
            // Notify render part, go into trading bot page.
            event.sender.send('login-success','success');
        });
    })
    // Error 
	http_req.on('error',function(e){
        console.error('Problem with request: ' + e.message);
        event.sender.send('login-error',e.message);
    });
    // Write Data into http request
    http_req.write(obj);
    http_req.end();
})

//remote.getCurrentWebContents.send('login-success',"ping");

// Async Example
/*ipcMain.on('asynchronous-message', (event, arg) => {
    console.log(arg)  // 印出 "ping"
    event.sender.send('asynchronous-reply', 'pong')
})*/
  
// Sync Example
/*ipcMain.on('synchronous-message', (event, arg) => {
    console.log(arg)  // 印出 "ping"
    event.returnValue = 'pong'
})

exports.boardcast = function(win,channel,msg){
    win.webContents.send(channel,msg);
}*/
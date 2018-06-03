const request = require('request');
const server_url = "http://localhost",port=3000;

/* Debug 
 * 
function myfunc(Interval){
    console.log("myfunc  "+Interval);
    request.post(server_url+":"+port+"/user/ulogin", {form: {username: "test",passwd: "test"} }, function (error, httpResponse, body){
    });
}
var myInterval=setInterval(myfunc,1000,"Interval");
function stopInterval(){
    clearTimeout(myInterval);
}
setTimeout(stopInterval,5000);
*/
class cmder{
    list_remote(event,arg){
        console.log(`[Main Process] content: ${arg.cmd_body}`);
    }
    
    list_local(event,arg){
        console.log(arg);
        console.log(`[Main Process] content: ${arg.cmd_body}`);
    }
    
    select(event,arg){
        console.log(`[Main Process] content: ${arg.cmd_body}`);
    }
    
    buy(event,arg){
        console.log(`[Main Process] content: ${arg.cmd_body}`);
    }   
}

module.exports = {
    cmder: new cmder()
}
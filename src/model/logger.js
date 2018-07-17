/**
 * Logger system goes here, 
 * 
 * - Trading bot instance's logfile 
 * - System log for ect-app
 */
const os = require('os')
const fs = require('fs')
const path = require('path')
const file_ext = ".ect"

/**
 * 
 * @function logger.bot_log        
 *      create an stream for bot_instance current running information, and then return the writable stream.( default to "os.tmpdir()/<bot_instance_id>" )
 * @function logger.bot_log_dismiss 
 *      close this stream
 */
class logger {
    constructor(){
    }

    bot_log(bot_id){
        // using ".ect" as file extension.
        let stream_log = fs.createWriteStream(path.join(os.tmpdir(),bot_id+file_ext))
        // define the stream behavior
        stream_log.on('finish',function(){
            console.log(`[${bot_id}] 寫入完成.`)
        })
        stream_log.on('error',function(err){
            console.log(`[${bot_id}] 寫入程序現錯誤。錯誤代號： ${err.stack}`)
        })

        // return that writable stream
        return stream_log;
    }

    bot_log_dismiss(bot_id){
        // delete streaming file descriptor
        fs.unlink(path.join(os.tmpdir(),bot_id+file_ext),function(err){
            if(err)
                console.log(`[${bot_id}][Dismiss] 關閉 stream 發生錯誤. 錯誤代號： ${err}`)
            else{
                console.log(`[${bot_id}][Dismiss] 關閉 stream 成功.`)
            }
        })
    }

    bot_debug_log(bot_id){
        // using ".ect" as file extension.
        let stream_log = fs.createWriteStream(path.join(os.tmpdir(),bot_id+"_debug"+file_ext))
        // define the stream behavior
        stream_log.on('finish',function(){
            console.log(`[${bot_id}][Debug] 寫入完成.`)
        })
        stream_log.on('error',function(err){
            console.log(`[${bot_id}][Debug] 寫入程序現錯誤。錯誤代號： ${err.stack}`)
        })

        // return that writable stream
        return stream_log;
    }

    bot_debug_log_dismiss(bot_id){
        // delete streaming file descriptor
        fs.unlink(path.join(os.tmpdir(),bot_id+"_debug"+file_ext),function(err){
            if(err)
                console.log(`[${bot_id}][Debug][Dismiss] 關閉 stream 發生錯誤. 錯誤代號： ${err}`)
            else{
                console.log(`[${bot_id}][Debug][Dismiss] 關閉 stream 成功.`)
            }
        })
    }
}

module.exports = {
    logger : new logger()
}
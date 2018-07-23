/**
 * Logger system goes here, 
 * 
 * - Trading bot instance's logfile 
 * - System log for ect-app
 */
const os = require('os')
const fs = require('fs')
const path = require('path')
const moment = require('moment')

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
        // store some default setting, e.g. syslog name
        this.syslog_name = 'ect_trader_app';
        this.file_ext = '.ect';

        // create system log for ectrader app
        this.syslog = fs.createWriteStream(path.join(os.tmpdir(),this.syslog_name+this.file_ext))
        this.syslog.on('finish',function(){
            console.log(`[Syslog] 寫入完成.`)
        })
        this.syslog.on('error',function(err){
            console.log(`[Syslog] 寫入程序現錯誤。錯誤代號： ${err.stack}`)
        })

    }

    // recording syslog
    sys_log(data){
        /**
         * data format (JSON object)
         * 
         * @param type  目前回報的種類 (warning/error/info...)
         * @param msg   回報內容
         * 
         */

        let map = {
            type: (data.type==undefined ? "Warning" : data.type),
            msg: (data.msg==undefined ? "Default" : data.msg)
        }

        // 寫入
        this.syslog.write("====================="+os.EOL,'UTF8')
        this.syslog.write("[時間戳記]: "+moment().format('MMMM Do YYYY, h:mm:ss a')+os.EOL,'UTF8')
        this.syslog.write("[回報類型]: "+map.type+os.EOL,'UTF8')
        this.syslog.write("[回報內容]: "+map.msg+os.EOL,'UTF8')
        this.syslog.write("====================="+os.EOL,'UTF8')

        console.log("[Syslog] 系統紀錄寫入程序完成.")
    }

    /**
     *  reading syslog - using promise
     *  example use case: 
     *      logger.get_sys_log().then((loginfo)=>{
     *          console.log(loginfo)
     *      })
     */
    get_sys_log(){
        let self=this;
        return new Promise((resolve,reject)=>{
            let log = fs.createReadStream(path.join(os.tmpdir(),self.syslog_name+self.file_ext),'UTF8')

            log.on('readable',function(){
                resolve(log.read())
            })
            log.on('error',function(err){
                reject(`[Syslog][Error] Reading stream error. error code: ${err}`)
            })
        })
    }

    sys_log_dismiss(){
        // delete streaming file descriptor
        fs.unlink(path.join(os.tmpdir(),this.syslog_name+this.file_ext),function(err){
            if(err)
                console.log(`[Syslog][Dismiss] 關閉 stream 發生錯誤. 錯誤代號： ${err}`)
            else{
                console.log(`[Syslog][Dismiss] 關閉 stream 成功.`)
            }
        })
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
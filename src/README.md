# src/ 底下的配置說明

由主要數個部份所組成：

* `config/`
    這部份主要放置 client 端使用者相關配置
    * **config.default.js**: 配置 app 後端相關資訊（處理資料、傳送資訊到伺服器、 apiKey/apiSecret ... etc） 
* `main/`
    這部份是主要的 IPC Main channel 所在
    * **event.js**: 主要的 ipcMain channel 進入點，並在其中呼叫 `model/` 底下的程式做執行
* `model/`
    * **cmder.js**: 指令的控制，透過類 docker 的指令方式來操作
    * **db.js**: APP 端的 database 操作，負責儲存資料
    * **trade_op.js**: 交易相關的 API 實作
    * **trader.js**: (*ipcMain 呼叫*) 負責 trade 相關 ipc channel，也是主要被 event.js 給呼叫的 module
        * 其中 botMaster 由其管理，新建、刪除特定或是所有的 bot instance 可以透過這個 bot master 來做
    * **trade_bot.js**: 為交易機器人 (bot instance) 主要位置所在，其負責所有的交易判斷、讀取交易策略等等的功能所在
    * **user.js**: (*ipcMain 呼叫*) 負責 user 相關的 ipc channel

主要的溝通方式：

* 程式前端由 `app/event` 底下的 js （ipcRenderer）所負責
* 其傳送對口便是 `src/main` 底下的 event.js (ipcMain)

* trade 的部份：
    * trader.js 是主要的被呼叫者，掌管 trade 相關事務
    * trade_op.js 主要實作 binance 相關交易操作
    * trade_bot.js 主要實作交易機器人的主要邏輯
# src/ 底下的配置說明

* `config`
    * **config.default.js**: 配置 app 後端（處理資料、傳送資訊到伺服器 ... etc） 
* `main`
    * **event.js**: 主要的 ipcMain channel 進入點，並在其中呼叫 `model/` 底下的程式做執行
* `model`
    * **cmder.js**: 指令的控制，透過類 docker 的指令方式來操作
    * **db.js**: APP 端的 database 操作，負責儲存資料
    * **operation.js**: 交易相關的 API 實作
    * **strategist.js**: 交易相關的邏輯操作（WIP）
    * **trader.js**: (*ipcMain 呼叫*) 負責 trade 相關 ipc channel
    * **user.js**: (*ipcMain 呼叫*) 負責 user 相關的 ipc channel
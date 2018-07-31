# Trader APP

## 如何運行

* 安裝相依性
```
npm run install
```
* 啟動
```
npm run start
```
* 安裝 + 啟動
```
npm run all
```
* 輸出執行檔 (window,linux 上皆可用)
```
npm run release
```

## 檔案配置

> 存在於專案原始碼當中

* app/ 底下是 electron webview (render process)
    * config/ -> render process 的配置檔
    * event/ -> render process 的 ipc 
    * img/ -> 圖源
    * lib/ -> 前端網頁需要的 library 
* src/ 底下是 electron main process
    * config/ -> main process 的配置檔
    * model/ -> 除 main process 外的其他功能
    * ui/ -> main process / ipcMain （主進入點）
    * ~~db/ -> 主要放置 sqlite3 所使用~~
        * 考慮到 release 後的程式不會有相對應的檔案夾配置，直接配置在跟本身 main.js 同個位置即可(跟 electron build 所得到的程式同層)

> 啟動後自動產生

* `.local/` 
    * 用來儲存本地端較大檔案、紀錄檔等等資訊
    * 在程式呼叫啟動時產生
    * 由執行檔程式來指定存放位置（不會有相對路徑問題）

## 儲存空間配置

* 在程式啟動時，會在執行檔下建立一個 `.local/` 的隱藏資料夾，其底下有:
    * `policy/`: 裝載使用者所擁有的交易策略（可用的）
    * `self/`: 使用者自定義的`交易策略`
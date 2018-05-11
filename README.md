# Trader APP

## 檔案配置

* app/ 底下是 electron webview (render process)
    * config/ -> render process 的配置檔
    * event/ -> render process 的 ipc 
    * img/ -> 圖源
    * lib/ -> 前端網頁需要的 library 
* src/ 底下是 electron main process
    * config/ -> main process 的配置檔
    * model/ -> 除 main process 外的其他功能
    * ui/ -> main process / ipcMain （主進入點）
    * ~db/ -> 主要放置 sqlite3 所使用~
        * 考慮到 release 後的程式不會有相對應的檔案夾配置，直接配置在跟本身 main.js 同個位置即可(跟 electron build 所得到的程式同層)


## sqlite3

在配置當下需要重新編譯的動作，目前指令放置於 package.json 內的 `postinstall`. 將於 npm install 後執行

目前測試於 linux 環境下可以正確執行

適合當作客戶端的小型資料庫使用

### linux 上察看 sqlite3

* 安裝 GUI - `sqlitebrowser`

```bash
sudo add-apt-repository -y ppa:linuxgndu/sqlitebrowser
sudo apt update 
sudo apt install sqlitebrowser
```

### window 環境下使用

* 針對 sqlite3 做處理 - https://hackmd.io/lNpg8-HYSH2UsZUSJCNNMg 
    * 解決 sqlite3 重新編譯問題
    * 測試於 window 10 環境 （version: `1709`）
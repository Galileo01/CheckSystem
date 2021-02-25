//主进程代码
const electron = require('electron');
const app = electron.app;//APP 引用

const BrowserWindow = electron.BrowserWindow;//窗口引用
let mainWindow = null;//主窗口

app.on('ready', () => {
    //创建窗口
    mainWindow = new BrowserWindow({
        width:400,
        height:300,
        // width: 800,
        // height: 800,
        webPreferences: {
            nodeIntegration: true, //允许 使用Node 进程/API
            enableRemoteModule: true //允许使用Remote 
        },
        autoHideMenuBar: true,//隐藏 菜单栏
        // frame:false //
    });
    require('./main/menu.js');//
    mainWindow.loadFile('index.html');//加载页面
    mainWindow.on('closed', () => {
        mainWindow = null;//关闭窗口 清空窗口
    })
    // mainWindow.webContents.openDevTools();//打开开发者工具
})
// // 使用热重载
// try {
//     require('electron-reloader')(module);
// } catch (_) { }
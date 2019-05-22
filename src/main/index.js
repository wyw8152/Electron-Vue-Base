import { app, BrowserWindow, ipcMain, Menu, Tray, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
const storage = require('electron-localstorage');
// 托盘对象
let appTray = null;
// 是否可以退出
let trayClose = false;
const path = require('path');

var notifyTimer = null;
// 系统托盘图标目录  
const iconFolder = path.join(__dirname, '/static/');
// 系统托盘图标
const iconPath = path.join(iconFolder, 'Tray.ico')
// 系统托盘透明图标
const iconPathT = path.join(iconFolder, 'Transparency.ico')
// 系统托盘图标闪烁状态
let blinkStatus = false;

global.loginSession = {
  userSessionID: '',
  userName: '',
  nickName: '',
  sex: '',
  mobile: '',
  weixin: '',
  headImg: '',
  isAutomaticLogin: false,
  isRememberPwd: false
}
global.welcomeWordsKey = 'WelcomeWords'
global.openReminderSoundKey = 'OpenReminderSound'
global.userConfigs = {
  WelcomeWords: '您好，欢迎关注！',
  OpenReminderSound: true,
  HotKeyOpenClient: 'F2',
  HotKeyOpenPhrase: 'F3',
  HotKeyPrintScreen: 'F4'
}
global.sharedInfo = {
  customerAvatar: '',
  serviceAvatar: ''
}

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\');
}

let mainWindow;
const winURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:9080/#/home'
  : `file://${__dirname}/index.html#home`;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    frame: false,
    useContentSize: true,
    width: 1050,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    show: false,
    webPreferences: {
      webSecurity: false,
      devTools: true
    },
  });

  mainWindow.loadURL(winURL);

  Menu.setApplicationMenu(null);

  mainWindow.on('close', event => {
    if (!trayClose) {
      mainWindow.hide();
      event.preventDefault();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 加载好html再呈现window，避免白屏
  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
    loginWindow.close();
    // mainWindow.focus();
  });

  // 系统托盘右键菜单
  const trayMenuTemplate = [
    {
      label: '关于我们',
      click() {
        // 打开外部链接
        shell.openExternal('https://github.com/wyw8152');
      },
    },
    {
      label: '退出',
      click() {
        // 退出
        trayClose = true;
        app.quit();
      },
    },
  ];
  appTray = new Tray(iconPath);
  // 图标的上上下文
  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
  // 设置此托盘图标的悬停提示内容
  appTray.setToolTip('Electron Vue Demo in the tray.');
  // 设置此图标的上下文菜单
  appTray.setContextMenu(contextMenu);
  // 主窗口显示隐藏切换
  appTray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });

  // mainWindow.webContents.openDevTools({ detach: false });
}

let loginWindow;
const modalPath = process.env.NODE_ENV === 'development'
    ? 'http://localhost:9080/'
    : `file://${__dirname}/index.html`;
function createLoginWindow() {
  loginWindow = new BrowserWindow({
    frame: false,
    useContentSize: true,
    width: 400,
    height: 500,
    resizable: false, //禁止窗口大小缩放
    webPreferences: {
      webSecurity: false,
      devTools: true //关闭调试工具
    },
    // transparent: true,  //设置透明
    // alwaysOnTop: true,  //窗口是否总是显示在其他窗口之前
  })

  // const size = screen.getPrimaryDisplay().workAreaSize;   //获取显示器的宽高
  // const winSize = loginWindow.getSize();  //获取窗口宽高

  //设置窗口的位置 注意x轴要桌面的宽度 - 窗口的宽度
  // loginWindow.setPosition((size.width - winSize[0]) / 2, (size.height - winSize[1]) / 2);

  loginWindow.loadURL(modalPath)

  loginWindow.on('close', function() {
    loginWindow = null
  })

  loginWindow.once('ready-to-show', () => {
    loginWindow.show()
  })
}

app.on('ready', () => {
  // if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdatesAndNotify();
  // autoUpdater.checkForUpdatesAndNotify();
  // createWindow();
  createLoginWindow();
});

app.on('window-all-closed', () => {
  if (appTray) appTray.destroy();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('openMainWindow', () => {
  createWindow();
  //history = arg
})

ipcMain.on('loginedTransaction', function(event, arg) {
  createWindow();
  // loginWindow.webContents.send('showmessage', global.loginSession.userSessionID)
})

/**
 * 边框
 */
// 窗口最小化
ipcMain.on('min-window', () => {
  mainWindow.minimize();
});
// 窗口最大化
ipcMain.on('max-window',  function(event, arg) {
  if (mainWindow.isMaximized()) {
    mainWindow.restore();
    event.returnValue = 'false';
  } else {
    mainWindow.maximize();
    event.returnValue = 'true';
  }
});
// 关闭
ipcMain.on('close-window', () => {
  mainWindow.close();
});

//监听与渲染进程的通信
ipcMain.on('startBlinkTrayIcon', () => {
  //系统托盘图标闪烁
  notifyTimer=setInterval(function() {
    appTray.setImage(blinkStatus ? iconPath : iconPathT);
    blinkStatus = !blinkStatus;
  }, 500);
});

ipcMain.on('stopBlinkTrayIcon', () => {
  clearInterval(notifyTimer)
  appTray.setImage(iconPath)
  blinkStatus = false
});

ipcMain.on('closeLoginWindow', () => {
  loginWindow.close();
})

/**
 * 导出下载
 */
ipcMain.on('download', (event, downloadPath) => {
  mainWindow.webContents.downloadURL(downloadPath);
  mainWindow.webContents.session.once('will-download', (event, item) => {
    item.once('done', (event, state) => {
      // 成功的话 state为completed 取消的话 state为cancelled
      mainWindow.webContents.send('downstate', state);
    });
  });
});

/**
 * 自动更新
 */

function sendUpdateMessage(message, data) {
  mainWindow.webContents.send('update-message', { message, data });
}

// 阻止程序关闭自动安装升级
autoUpdater.autoInstallOnAppQuit = false;

autoUpdater.on('error', data => {
  sendUpdateMessage('error', data);
});

/* // 检查更新
autoUpdater.on('checking-for-update', data => {
  sendUpdateMessage('checking-for-update', data);
});*/

// 有可用更新
autoUpdater.on('update-available', data => {
  sendUpdateMessage('update-available', data);
});

// 已经最新
autoUpdater.on('update-not-available', data => {
  sendUpdateMessage('update-not-available', data);
});

// 更新下载进度事件
autoUpdater.on('download-progress', data => {
  sendUpdateMessage('download-progress', data);
});
// 更新下载完成事件(event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate)
autoUpdater.on('update-downloaded', () => {
  sendUpdateMessage('update-downloaded', {});
  ipcMain.once('update-now', () => {
    autoUpdater.quitAndInstall();
  });
});

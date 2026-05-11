const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

// Отключаем аппаратное ускорение
app.disableHardwareAcceleration();

// Устанавливаем уникальный идентификатор приложения
if (process.platform === 'linux') {
  app.setAppUserModelId('com.ott.drm.play');
} else if (process.platform === 'win32') {
  app.setAppUserModelId('com.ott.drm.play');
}

let mainWindow;
let isWindowCreated = false;
let server;
let appDir;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.php': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json'
};

function startServer() {
  return new Promise((resolve, reject) => {
    server = http.createServer((req, res) => {
      // Убираем query-параметры (?11 и т.д.)
      const urlPath = req.url.split('?')[0].split('#')[0];
      
      // Определяем путь к файлу
      let filePath = path.join(appDir, urlPath === '/' ? 'index.html' : urlPath);
      
      // Если файл не найден, пробуем добавить .html
      if (!fs.existsSync(filePath)) {
        const htmlPath = filePath + '.html';
        if (fs.existsSync(htmlPath)) {
          filePath = htmlPath;
        }
      }
      
      const ext = path.extname(filePath);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
          return;
        }
        
        res.writeHead(200, {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache'
        });
        res.end(data);
      });
    });
    
    server.listen(12345, '127.0.0.1', () => {
      resolve(12345);
    });
    
    server.on('error', (e) => {
      if (e.code === 'EADDRINUSE') {
        // Порт занят, пробуем другой
        server.listen(0, '127.0.0.1', () => {
          resolve(server.address().port);
        });
      } else {
        reject(e);
      }
    });
  });
}

function createWindow(port) {
  if (isWindowCreated) {
    return;
  }
  
  isWindowCreated = true;

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      allowRunningInsecureContent: true
    },
    title: 'OTT DRM Play',
    show: false
  });

  mainWindow.loadURL('http://127.0.0.1:' + port + '/index.html');

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
    mainWindow.setTitle('OTT DRM Play');
  });

  const menuTemplate = [
    {
      label: 'Файл',
      submenu: [
        { label: 'Перезагрузить страницу', accelerator: 'Ctrl+R', click: () => mainWindow.reload() },
        { type: 'separator' },
        { label: 'Закрыть приложение', accelerator: 'Ctrl+Q', click: () => app.quit() }
      ]
    },
    {
      label: 'Вид',
      submenu: [
        { label: 'Полноэкранный режим', accelerator: 'F11', click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen()) },
        { type: 'separator' },
        { label: 'Увеличить масштаб', accelerator: 'Ctrl+=', click: () => mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() + 0.5) },
        { label: 'Уменьшить масштаб', accelerator: 'Ctrl+-', click: () => mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() - 0.5) },
        { label: 'Сбросить масштаб', accelerator: 'Ctrl+0', click: () => mainWindow.webContents.setZoomLevel(0) },
        { type: 'separator' },
        { label: 'Инструменты разработчика', accelerator: 'Ctrl+Shift+I', click: () => mainWindow.webContents.toggleDevTools() }
      ]
    },
    {
      label: 'Аудио',
      submenu: [
        { label: 'Включить/выключить звук', accelerator: 'M', click: () => mainWindow.webContents.executeJavaScript('stbToggleMute()') },
        { type: 'separator' },
        { label: 'Увеличить громкость', accelerator: 'Up', click: () => mainWindow.webContents.executeJavaScript('stbSetVolume(Math.min(100, stbGetVolume() + 10))') },
        { label: 'Уменьшить громкость', accelerator: 'Down', click: () => mainWindow.webContents.executeJavaScript('stbSetVolume(Math.max(0, stbGetVolume() - 10))') }
      ]
    },
    {
      label: 'Настройки',
      submenu: [
        {
          label: 'Очистить кеш приложения',
          click: async () => {
            try {
              await mainWindow.webContents.session.clearCache();
              await mainWindow.webContents.session.clearStorageData();
              mainWindow.reload();
            } catch (error) {
              dialog.showMessageBox({
                type: 'error',
                title: 'Ошибка',
                message: 'Не удалось очистить кеш',
                detail: error.message,
                buttons: ['OK']
              });
            }
          }
        }
      ]
    },
    {
      label: 'Справка',
      submenu: [
        {
          label: 'Комбинации клавиш',
          click: () => {
            dialog.showMessageBox({
              type: 'info',
              title: 'Комбинации клавиш',
              message: 'Список доступных сочетаний клавиш:',
              detail: 'Ctrl+R - Перезагрузить страницу\nF11 - Переключить полноэкранный режим\nCtrl+= - Увеличить масштаб\nCtrl+- - Уменьшить масштаб\nCtrl+0 - Сбросить масштаб\nCtrl+Shift+I - Инструменты разработчика\nCtrl+Q - Закрыть приложение\nM - Включить/выключить звук\nUp - Увеличить громкость\nDown - Уменьшить громкость',
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(async () => {
  // Определяем директорию приложения через app.getAppPath()
  // Это корректно работает как в разработке, так и в собранном приложении с ASAR
  const appPath = app.getAppPath();
  appDir = path.join(appPath, 'src', 'ott.drm-play.com');
  
  console.log('App path:', appPath);
  console.log('Static dir:', appDir);
  
  const port = await startServer();
  createWindow(port);
});

app.on('window-all-closed', () => {
  if (server) {
    server.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  const existingWindows = BrowserWindow.getAllWindows();
  if (existingWindows.length === 0) {
    createWindow();
  } else {
    existingWindows[0].focus();
  }
});

app.on('before-quit', () => {
  if (server) {
    server.close();
  }
});
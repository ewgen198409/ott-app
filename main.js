const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'ott.drm-play.com', 'index.html'));

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
    mainWindow.setTitle('OTT DRM Play');
  });

  // Создаем кастомное меню
  const menuTemplate = [
    {
      label: 'Файл',
      submenu: [
        {
          label: 'Перезагрузить страницу',
          accelerator: 'Ctrl+R',
          click: () => mainWindow.reload()
        },
        {
          type: 'separator'
        },
        {
          label: 'Закрыть приложение',
          accelerator: 'Ctrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Вид',
      submenu: [
        {
          label: 'Полноэкранный режим',
          accelerator: 'F11',
          click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen())
        },
        {
          type: 'separator'
        },
        {
          label: 'Увеличить масштаб',
          accelerator: 'Ctrl+=',
          click: () => mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() + 0.5)
        },
        {
          label: 'Уменьшить масштаб',
          accelerator: 'Ctrl+-',
          click: () => mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() - 0.5)
        },
        {
          label: 'Сбросить масштаб',
          accelerator: 'Ctrl+0',
          click: () => mainWindow.webContents.setZoomLevel(0)
        },
        {
          type: 'separator'
        },
        {
          label: 'Инструменты разработчика',
          accelerator: 'Ctrl+Shift+I',
          click: () => mainWindow.webContents.toggleDevTools()
        }
      ]
    },
    {
      label: 'Аудио',
      submenu: [
        {
          label: 'Включить/выключить звук',
          accelerator: 'M',
          click: () => mainWindow.webContents.executeJavaScript('stbToggleMute()')
        },
        {
          type: 'separator'
        },
        {
          label: 'Увеличить громкость',
          accelerator: 'Up',
          click: () => mainWindow.webContents.executeJavaScript('stbSetVolume(Math.min(100, stbGetVolume() + 10))')
        },
        {
          label: 'Уменьшить громкость',
          accelerator: 'Down',
          click: () => mainWindow.webContents.executeJavaScript('stbSetVolume(Math.max(0, stbGetVolume() - 10))')
        }
      ]
    },
    {
      label: 'Настройки',
      submenu: [
        {
          label: 'Очистить кеш приложения',
          click: async () => {
            try {
              // Очищаем кеш
              await mainWindow.webContents.session.clearCache();
              await mainWindow.webContents.session.clearStorageData();
              
              // // Показываем сообщение об успешной очистке
              // dialog.showMessageBox({
              //   type: 'info',
              //   title: 'Очистка кеша',
              //   message: 'Кеш приложения успешно очищен',
              //   buttons: ['OK']
              // });
              
              // Перезагружаем страницу для применения изменений
              mainWindow.reload();
            } catch (error) {
              // Обрабатываем ошибки
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

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

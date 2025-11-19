import { app, ipcMain, nativeTheme } from 'electron';
import { appendFile, mkdir } from 'fs/promises';
import { join } from 'path';
import './security-restrictions';
import { restoreOrCreateWindow } from '/@/mainWindow';
import {
  openWidgetWindow,
  closeWidgetWindow,
  isWidgetWindowOpen,
} from '/@/widgetWindow';

/**
 * Setup IPC handlers for Electron-specific features
 */
function setupAPIHandlers() {
  // Write log file handler (Electron 전용 기능)
  ipcMain.handle(
    'api:writeLog',
    async (_event, data: string, filename?: string) => {
      try {
        const userDataPath = app.getPath('userData');
        const logDir = join(userDataPath, 'logs');
        await mkdir(logDir, { recursive: true });

        const logFilename =
          filename || `score_${new Date().toISOString().split('T')[0]}.log`;
        const logPath = join(logDir, logFilename);

        const timestamp = new Date().toISOString();
        const logLine = `[${timestamp}] ${data}\n`;

        await appendFile(logPath, logLine, 'utf-8');

        if (import.meta.env.DEV) {
          console.log(`📝 Log written to: ${logPath}`);
        }

        return { success: true, path: logPath };
      } catch (error) {
        console.error('Failed to write log:', error);
        throw error;
      }
    },
  );

  /* 리액트에서 Main Process로 오는 요청을 처리하는 함수*/

  /* 위젯 오픈 요청 핸들러 */
  ipcMain.handle('widget:open', async () => {
    try {
      await openWidgetWindow();
      return { success: true };
    } catch (error) {
      console.error('Failed to open widget window:', error);
      throw error;
    }
  });

  /* 위젯 닫기 요청 핸들러 */
  ipcMain.handle('widget:close', () => {
    try {
      closeWidgetWindow();
      return { success: true };
    } catch (error) {
      console.error('Failed to close widget window:', error);
      throw error;
    }
  });

  /* 시스템 테마 조회 핸들러 */
  ipcMain.handle('theme:getSystemTheme', () => {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
  });
}
/* 위젯 상태 확인 요청 핸들러 */
ipcMain.handle('widget:isOpen', () => {
  return isWidgetWindowOpen();
});

/**
 * Prevent multiple instances
 */
const isSingleInstance = app.requestSingleInstanceLock();
if (!isSingleInstance) {
  app.quit();
  process.exit(0);
}
app.on('second-instance', restoreOrCreateWindow);

/**
 * Enable Hardware Acceleration for GPU support (required for WebGL)
 */
// app.disableHardwareAcceleration(); // GPU 사용을 위해 주석 처리

// GPU 가속 활성화를 위한 command line switches
app.commandLine.appendSwitch('enable-gpu');
app.commandLine.appendSwitch('enable-webgl');
app.commandLine.appendSwitch('enable-accelerated-2d-canvas');
app.commandLine.appendSwitch('ignore-gpu-blacklist'); // GPU 블랙리스트 무시

/**
 * Shout down background process if all windows was closed
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * @see https://www.electronjs.org/docs/v14-x-y/api/app#event-activate-macos Event: 'activate'
 */
app.on('activate', restoreOrCreateWindow);

/**
 * Create app window when background process will be ready
 */
app
  .whenReady()
  .then(restoreOrCreateWindow)
  .then(() => {
    /**
     * Install React & Redux devtools in development mode only
     */
    if (import.meta.env.DEV) {
      try {
        // 동적 import로 devtools 설치 (프로덕션에서 오류 방지)
        import('electron-devtools-installer')
          .then(
            ({
              default: installExtension,
              REACT_DEVELOPER_TOOLS,
              REDUX_DEVTOOLS,
            }) => {
              installExtension([REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS])
                .then((name) => console.log(`Added Extensions:  ${name}`))
                .catch((err) =>
                  console.log('An error occurred installing extensions: ', err),
                );
            },
          )
          .catch((error) => {
            console.log('DevTools installation skipped:', error);
          });
      } catch (error) {
        console.log('DevTools installation skipped:', error);
      }
    } else {
      console.log('DevTools installation skipped in production mode');
    }

    // Setup IPC handlers for Electron-specific features
    setupAPIHandlers();
  })
  .catch((e) => console.error('Failed during app startup:', e));

/**
 * Check new app version in production mode only
 */
if (import.meta.env.PROD) {
  app
    .whenReady()
    .then(() => import('electron-updater'))
    .then(({ autoUpdater }) => autoUpdater.checkForUpdatesAndNotify())
    .catch((e) => console.error('Failed check updates:', e));
}

import { ipcMain, BrowserWindow } from 'electron';
import { autoUpdater, UpdateInfo } from 'electron-updater';

/**
 * 업데이터 이벤트 핸들러 설정
 */
export function setupUpdaterHandlers() {
  // 업데이트 체크 시작
  ipcMain.handle('updater:checkForUpdates', async () => {
    try {
      const result = await autoUpdater.checkForUpdates();
      return {
        success: true,
        updateInfo: result.updateInfo,
        downloadPromise: result.downloadPromise,
      };
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  // 업데이트 다운로드
  ipcMain.handle('updater:downloadUpdate', async () => {
    try {
      await autoUpdater.downloadUpdate();
      return { success: true };
    } catch (error) {
      console.error('Failed to download update:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  // 업데이트 설치 (앱 재시작)
  ipcMain.handle('updater:quitAndInstall', () => {
    try {
      autoUpdater.quitAndInstall(false, true);
      return { success: true };
    } catch (error) {
      console.error('Failed to quit and install:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  // 현재 버전 정보 조회
  ipcMain.handle('updater:getVersion', () => {
    return {
      version: autoUpdater.currentVersion.version,
      currentVersion: autoUpdater.currentVersion.version,
    };
  });

  // 업데이터 이벤트 리스너 설정
  setupUpdaterEventListeners();
}

/**
 * 업데이터 이벤트 리스너 설정
 * 업데이트 상태를 모든 윈도우에 브로드캐스트
 */
function setupUpdaterEventListeners() {
  // 업데이트 확인 중
  autoUpdater.on('checking-for-update', () => {
    console.log('🔍 Checking for updates...');
    sendToAllWindows('updater:checking-for-update');
  });

  // 업데이트 사용 가능
  autoUpdater.on('update-available', (info: UpdateInfo) => {
    console.log('✅ Update available:', info.version);
    sendToAllWindows('updater:update-available', {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
    });
  });

  // 업데이트 사용 불가능
  autoUpdater.on('update-not-available', (info: UpdateInfo) => {
    console.log('ℹ️ Update not available. Current version:', info.version);
    sendToAllWindows('updater:update-not-available', {
      version: info.version,
    });
  });

  // 업데이트 다운로드 중 에러
  autoUpdater.on('error', (error: Error) => {
    console.error('❌ Update error:', error);
    sendToAllWindows('updater:error', {
      message: error.message,
    });
  });

  // 다운로드 진행률
  autoUpdater.on('download-progress', (progressObj) => {
    console.log(
      `⬇️ Download progress: ${Math.round(progressObj.percent)}%`,
    );
    sendToAllWindows('updater:download-progress', {
      percent: progressObj.percent,
      transferred: progressObj.transferred,
      total: progressObj.total,
      bytesPerSecond: progressObj.bytesPerSecond,
    });
  });

  // 다운로드 완료
  autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
    console.log('✅ Update downloaded:', info.version);
    sendToAllWindows('updater:update-downloaded', {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
    });
  });
}

/**
 * 모든 윈도우에 메시지 전송
 */
function sendToAllWindows(channel: string, data?: unknown) {
  BrowserWindow.getAllWindows().forEach((window) => {
    if (!window.isDestroyed()) {
      window.webContents.send(channel, data);
    }
  });
}

/**
 * 업데이터 초기화 및 설정
 */
export function initializeUpdater() {
  // 개발 모드에서는 업데이터 비활성화
  if (process.env.NODE_ENV === 'development') {
    console.log('⚠️ Auto updater is disabled in development mode');
    return;
  }

  // electron-builder의 publish 설정(GitHub Releases)을 자동으로 사용
  console.log('📡 Using GitHub Releases for updates');

  // 업데이터 설정
  autoUpdater.autoDownload = false; // 자동 다운로드 비활성화 (사용자가 선택하도록)
  autoUpdater.autoInstallOnAppQuit = true; // 앱 종료 시 자동 설치

  // 로그 설정 (개발 시에만)
  if (process.env.DEBUG === 'true') {
    autoUpdater.logger = {
      info: console.log,
      warn: console.warn,
      error: console.error,
    };
  }

  console.log('🚀 Auto updater initialized');
}

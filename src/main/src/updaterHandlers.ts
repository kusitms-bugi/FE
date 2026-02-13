import { app, ipcMain, BrowserWindow, dialog } from 'electron';
import { autoUpdater, UpdateInfo } from 'electron-updater';

let lastUpdateAvailablePromptVersion: string | null = null;
let lastUpdateDownloadedPromptVersion: string | null = null;
let hasRequestedDownload = false;
let lastProgressPercentInteger: number | null = null;

function setProgressForAllWindows(value: number) {
  BrowserWindow.getAllWindows().forEach((window) => {
    if (!window.isDestroyed()) {
      window.setProgressBar(value);
    }
  });
}

function setDockBadge(text: string) {
  if (process.platform !== 'darwin') return;
  app.dock?.setBadge(text);
}

function formatReleaseNotes(releaseNotes: unknown): string | undefined {
  const sanitize = (input: string) =>
    input
      .replace(/<[^>]*>/g, ' ') // strip HTML tags
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1') // markdown links -> text
      .replace(/[`*_>#-]+/g, ' ') // markdown symbols
      .replace(/\s+/g, ' ')
      .trim();

  const summarize = (input: string) => {
    const lines = input
      .split(/\r?\n/)
      .map((line) => sanitize(line))
      .filter((line) => line.length > 0);

    if (lines.length === 0) return undefined;

    const maxLines = 4;
    const maxCharsPerLine = 90;
    const summarized = lines.slice(0, maxLines).map((line) =>
      line.length > maxCharsPerLine
        ? `${line.slice(0, maxCharsPerLine - 1)}…`
        : line,
    );

    if (lines.length > maxLines) summarized.push('...');
    return summarized.map((line) => `• ${line}`).join('\n');
  };

  if (typeof releaseNotes === 'string') return summarize(releaseNotes);
  if (Array.isArray(releaseNotes)) {
    const strings = releaseNotes
      .map((n) => (typeof n === 'string' ? n : n?.note))
      .filter((n): n is string => typeof n === 'string' && n.trim().length > 0);
    if (strings.length === 0) return undefined;
    return summarize(strings.join('\n'));
  }
  return undefined;
}

/**
 * 업데이터 이벤트 핸들러 설정 (IPC는 남겨두되, 실제 UX는 다이얼로그로 처리)
 */
export function setupUpdaterHandlers() {
  ipcMain.handle('updater:checkForUpdates', async () => {
    try {
      await autoUpdater.checkForUpdates();
      return { success: true };
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

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

  ipcMain.handle('updater:getVersion', () => {
    return {
      version: autoUpdater.currentVersion.version,
      currentVersion: autoUpdater.currentVersion.version,
    };
  });

  setupUpdaterEventListeners();
}

function setupUpdaterEventListeners() {
  autoUpdater.on('checking-for-update', () => {
    console.log('🔍 Checking for updates...');
    sendToAllWindows('updater:checking-for-update');
    setProgressForAllWindows(2);
  });

  autoUpdater.on('update-available', async (info: UpdateInfo) => {
    console.log('✅ Update available:', info.version);
    sendToAllWindows('updater:update-available', {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
    });

    setProgressForAllWindows(-1);

    if (lastUpdateAvailablePromptVersion === info.version) return;
    lastUpdateAvailablePromptVersion = info.version;

    try {
      const notes = formatReleaseNotes(info.releaseNotes);
      const result = await dialog.showMessageBox({
        type: 'question',
        buttons: ['다운로드', '취소'],
        defaultId: 0,
        cancelId: 1,
        title: '업데이트',
        message: `새 버전(${info.version})이 있습니다.`,
        detail: notes ? `변경 사항:\n\n${notes}` : undefined,
        noLink: true,
      });

      if (result.response !== 0) return;
      if (hasRequestedDownload) return;
      hasRequestedDownload = true;

      await autoUpdater.downloadUpdate();
    } catch (error) {
      console.error('Failed during update-available flow:', error);
      hasRequestedDownload = false;
      setDockBadge('');
      setProgressForAllWindows(-1);
    }
  });

  autoUpdater.on('update-not-available', (info: UpdateInfo) => {
    console.log('ℹ️ Update not available. Current version:', info.version);
    sendToAllWindows('updater:update-not-available', { version: info.version });
    hasRequestedDownload = false;
    lastProgressPercentInteger = null;
    setDockBadge('');
    setProgressForAllWindows(-1);
  });

  autoUpdater.on('error', (error: Error) => {
    console.error('❌ Update error:', error);
    sendToAllWindows('updater:error', { message: error.message });
    hasRequestedDownload = false;
    lastProgressPercentInteger = null;
    setDockBadge('');
    setProgressForAllWindows(-1);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    const percent = Math.max(0, Math.min(100, progressObj.percent || 0));
    const fraction = percent / 100;

    console.log(`⬇️ Download progress: ${Math.round(percent)}%`);
    sendToAllWindows('updater:download-progress', {
      percent: progressObj.percent,
      transferred: progressObj.transferred,
      total: progressObj.total,
      bytesPerSecond: progressObj.bytesPerSecond,
    });

    setProgressForAllWindows(fraction);

    const percentInt = Math.round(percent);
    if (percentInt !== lastProgressPercentInteger) {
      lastProgressPercentInteger = percentInt;
      setDockBadge(`${percentInt}%`);
    }
  });

  autoUpdater.on('update-downloaded', async (info: UpdateInfo) => {
    console.log('✅ Update downloaded:', info.version);
    sendToAllWindows('updater:update-downloaded', {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
    });

    hasRequestedDownload = false;
    lastProgressPercentInteger = null;
    setDockBadge('');
    setProgressForAllWindows(-1);

    if (lastUpdateDownloadedPromptVersion === info.version) return;
    lastUpdateDownloadedPromptVersion = info.version;

    try {
      const result = await dialog.showMessageBox({
        type: 'question',
        buttons: ['재시작', '나중에'],
        defaultId: 0,
        cancelId: 1,
        title: '업데이트 다운로드 완료',
        message: `업데이트(${info.version}) 다운로드가 완료되었습니다.`,
        detail: '지금 재시작하면 업데이트가 적용됩니다.',
        noLink: true,
      });

      if (result.response === 0) {
        autoUpdater.quitAndInstall(false, true);
      }
    } catch (error) {
      console.error('Failed to show update-downloaded dialog:', error);
    }
  });
}

function sendToAllWindows(channel: string, data?: unknown) {
  BrowserWindow.getAllWindows().forEach((window) => {
    if (!window.isDestroyed()) {
      window.webContents.send(channel, data);
    }
  });
}

export function initializeUpdater() {
  if (process.env.NODE_ENV === 'development') {
    console.log('⚠️ Auto updater is disabled in development mode');
    return;
  }

  console.log('📡 Using GitHub Releases for updates');
  autoUpdater.autoDownload = false; // 다이얼로그 확인 후 다운로드
  autoUpdater.autoInstallOnAppQuit = true;

  if (process.env.DEBUG === 'true') {
    autoUpdater.logger = {
      info: console.log,
      warn: console.warn,
      error: console.error,
    };
  }

  console.log('🚀 Auto updater initialized');
}

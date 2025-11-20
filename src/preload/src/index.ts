/**
 * @module preload
 */

import { contextBridge, ipcRenderer } from 'electron';

// Health 응답 타입 (예시)
// TODO: 실제 메인 프로세스에서 보내는 데이터 구조에 맞게 수정
type HealthResponse = {
  status: 'ok';
  uptime: number;
};

// Version 응답 타입 (예시)
type VersionInfo = {
  appVersion: string;
  electron: string;
  chrome: string;
  node: string;
};

// 플랫폼 정보 (예시)
type PlatformInfo = {
  // eslint-disable-next-line no-undef
  os: NodeJS.Platform;
  arch: string;
};

// 로그 작성 결과 (예시)
type WriteLogResult = {
  success: boolean;
  path?: string;
  error?: string;
};

// 시스템 테마 타입 (예시)
type SystemTheme = 'light' | 'dark' | 'system';

// window.bugi 타입
type BugiAPI = {
  version: number;
};

// window.nodeCrypto 타입
type NodeCryptoAPI = {
  sha256sum: (data: string) => Promise<string>;
};

// window.electronAPI 타입
interface ElectronAPI {
  // Health check
  getHealth: () => Promise<HealthResponse>;

  // Version info
  getVersion: () => Promise<VersionInfo>;

  // Hash generation
  generateHash: (data: string) => Promise<string>;

  // Batch hash generation
  generateBatchHash: (dataList: string[]) => Promise<string[]>;

  // Platform info
  getPlatform: () => Promise<PlatformInfo>;

  // Write log file
  writeLog: (data: string, filename?: string) => Promise<WriteLogResult>;

  widget: {
    open: () => Promise<void>;
    close: () => Promise<void>;
    isOpen: () => Promise<boolean>;
  };

  // 시스템 테마 조회
  getSystemTheme: () => Promise<SystemTheme>;

  // 알림 API
  notification: {
    show: (
      title: string,
      body: string,
    ) => Promise<{ success: boolean; error?: string }>;
    requestPermission: () => Promise<{ success: boolean; supported: boolean }>;
  };
}

// Expose version number to renderer
const bugiAPI: BugiAPI = { version: 0.1 };
contextBridge.exposeInMainWorld('bugi', bugiAPI);

/**
 * The "Main World" is the JavaScript context that your main renderer code runs in.
 * By default, the page you load in your renderer executes code in this world.
 *
 * @see https://www.electronjs.org/docs/api/context-bridge
 */

/**
 * After analyzing the `exposeInMainWorld` calls,
 * `packages/preload/exposedInMainWorld.d.ts` file will be generated.
 * It contains all interfaces.
 * `packages/preload/exposedInMainWorld.d.ts` file is required for TS is `renderer`
 *
 * @see https://github.com/cawa-93/dts-for-context-bridge
 */

/**
 * Safe expose crypto API
 * @example
 * window.nodeCrypto.sha256sum('data')
 */
const nodeCryptoAPI: NodeCryptoAPI = {
  sha256sum: async (data: string) => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  },
};
contextBridge.exposeInMainWorld('nodeCrypto', nodeCryptoAPI);

/**
 * Expose API functionality to renderer
 * @example
 * window.electronAPI.getHealth()
 */
const electronAPI: ElectronAPI = {
  // Health check
  getHealth: () =>
    ipcRenderer.invoke('api:health') as ReturnType<ElectronAPI['getHealth']>,

  // Version info
  getVersion: () =>
    ipcRenderer.invoke('api:version') as ReturnType<ElectronAPI['getVersion']>,

  // Hash generation
  generateHash: (data: string) =>
    ipcRenderer.invoke('api:hash', data) as ReturnType<
      ElectronAPI['generateHash']
    >,

  // Batch hash generation
  generateBatchHash: (dataList: string[]) =>
    ipcRenderer.invoke('api:hash:batch', dataList) as ReturnType<
      ElectronAPI['generateBatchHash']
    >,

  // Platform info
  getPlatform: () =>
    ipcRenderer.invoke('api:platform') as ReturnType<
      ElectronAPI['getPlatform']
    >,

  // Write log file
  writeLog: (data: string, filename?: string) =>
    ipcRenderer.invoke('api:writeLog', data, filename) as ReturnType<
      ElectronAPI['writeLog']
    >,

  /*electronAPI 객체에 widget 추가해서 리액트에서 접근 가능하도록 설정(리액트와 main process의 다리 역할) */
  widget: {
    open: () =>
      ipcRenderer.invoke('widget:open') as ReturnType<
        ElectronAPI['widget']['open']
      >,
    close: () =>
      ipcRenderer.invoke('widget:close') as ReturnType<
        ElectronAPI['widget']['close']
      >,
    isOpen: () =>
      ipcRenderer.invoke('widget:isOpen') as ReturnType<
        ElectronAPI['widget']['isOpen']
      >,
  },

  // 시스템 테마 조회
  getSystemTheme: () =>
    ipcRenderer.invoke('theme:getSystemTheme') as ReturnType<
      ElectronAPI['getSystemTheme']
    >,

  // 알림 API
  notification: {
    show: (title: string, body: string) =>
      ipcRenderer.invoke('notification:show', title, body) as ReturnType<
        ElectronAPI['notification']['show']
      >,
    requestPermission: () =>
      ipcRenderer.invoke('notification:requestPermission') as ReturnType<
        ElectronAPI['notification']['requestPermission']
      >,
  },
};
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

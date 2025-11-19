/**
 * @module preload
 */

import { contextBridge, ipcRenderer } from 'electron';

// Expose version number to renderer
contextBridge.exposeInMainWorld('bugi', { version: 0.1 });

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
contextBridge.exposeInMainWorld('nodeCrypto', {
  sha256sum: async (data: string) => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  },
});

/**
 * Expose API functionality to renderer
 * @example
 * window.electronAPI.getHealth()
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // Health check
  getHealth: () => ipcRenderer.invoke('api:health'),

  // Version info
  getVersion: () => ipcRenderer.invoke('api:version'),

  // Hash generation
  generateHash: (data: string) => ipcRenderer.invoke('api:hash', data),

  // Batch hash generation
  generateBatchHash: (dataList: string[]) =>
    ipcRenderer.invoke('api:hash:batch', dataList),

  // Platform info
  getPlatform: () => ipcRenderer.invoke('api:platform'),

  // Write log file
  writeLog: (data: string, filename?: string) =>
    ipcRenderer.invoke('api:writeLog', data, filename),

  /*electronAPI 객체에 widget 추가해서 리액트에서 접근 가능하도록 설정(리액트와 main process의 다리 역할) */
  widget: {
    open: () => ipcRenderer.invoke('widget:open'),
    close: () => ipcRenderer.invoke('widget:close'),
    isOpen: () => ipcRenderer.invoke('widget:isOpen'),
  },

  // 시스템 테마 조회
  getSystemTheme: () => ipcRenderer.invoke('theme:getSystemTheme'),
});

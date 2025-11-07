interface Window {
  readonly bugi: { version: number };
  /**
   * Safe expose crypto API
   * @example
   * window.nodeCrypto.sha256sum('data')
   */
  readonly nodeCrypto: { sha256sum: (data: string) => Promise<string> };
  /**
   * Expose API functionality to renderer
   * @example
   * window.electronAPI.getHealth()
   */
  readonly electronAPI: {
    getHealth: () => Promise<any>;
    getVersion: () => Promise<any>;
    generateHash: (data: string) => Promise<any>;
    generateBatchHash: (dataList: string[]) => Promise<any>;
    getPlatform: () => Promise<any>;
    writeLog: (data: string, filename?: string) => Promise<any>;
    widget: {
      open: () => Promise<any>;
      close: () => Promise<any>;
      isOpen: () => Promise<any>;
    };
  };
}

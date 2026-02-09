/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
/// <reference types="../../preload/exposedInMainWorld" />

interface ImportMetaEnv {
  readonly VITE_GA_MEASUREMENT_ID?: string;
  readonly VITE_GA_ENABLE_IN_DEV?: string;
}

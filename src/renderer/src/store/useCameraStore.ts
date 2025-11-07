import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type CameraState = 'show' | 'hide' | 'exit';

interface CameraStore {
  cameraState: CameraState;
  setCameraState: (state: CameraState) => void;
}

export const useCameraStore = create<CameraStore>()(
  persist(
    (set) => ({
      cameraState: 'hide',
      setCameraState: (state) => set({ cameraState: state }),
    }),
    {
      name: 'camera-state-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

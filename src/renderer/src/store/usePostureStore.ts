import { create } from 'zustand';

interface PostureState {
  statusText: '정상' | '거북목' | '측정중';
  postureClass: 'ok' | 'warn' | 'bad' | null;
  setStatus: (
    statusText: '정상' | '거북목' | '측정중',
    postureClass: 'ok' | 'warn' | 'bad' | null,
  ) => void;
}

export const usePostureStore = create<PostureState>((set) => ({
  statusText: '측정중',
  postureClass: null,
  setStatus: (statusText, postureClass) => set({ statusText, postureClass }),
}));

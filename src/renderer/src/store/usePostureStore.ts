import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface PostureState {
  statusText: '정상' | '거북목' | '측정중';
  postureClass: 'ok' | 'warn' | 'bad' | null;
  setStatus: (
    statusText: '정상' | '거북목' | '측정중',
    postureClass: 'ok' | 'warn' | 'bad' | null,
  ) => void;
}

/* 자세 상태 저장소 localstorage 동기화 추가 */
export const usePostureStore = create<PostureState>()(
  persist(
    (set) => ({
      statusText: '측정중',
      postureClass: null,
      setStatus: (statusText, postureClass) =>
        set({ statusText, postureClass }),
    }),
    {
      name: 'posture-state-storage', // localStorage 키
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

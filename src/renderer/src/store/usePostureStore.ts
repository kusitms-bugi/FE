import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface PostureState {
  statusText: '정상' | '거북목' | '측정중';
  postureClass: 'ok' | 'warn' | 'bad' | null;
  score: number;
  setStatus: (
    statusText: '정상' | '거북목' | '측정중',
    postureClass: 'ok' | 'warn' | 'bad' | null,
    score?: number,
  ) => void;
}

/* 자세 상태 저장소 localstorage 동기화 추가 */
export const usePostureStore = create<PostureState>()(
  persist(
    (set) => ({
      statusText: '측정중',
      postureClass: null,
      score: 0,
      setStatus: (statusText, postureClass, score = 0) =>
        set({ statusText, postureClass, score }),
    }),
    {
      name: 'posture-state-storage', // localStorage 키
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

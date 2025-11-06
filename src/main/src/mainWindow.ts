// main/src/mainWindow.ts
import { BrowserWindow, screen } from 'electron';
import { join } from 'path';

const MIN_W = 1024;
const MIN_H = 720;
const MAX_W = 1600;
const MAX_H = 1000;
// const ASPECT = 16 / 9; // 필요 시 고정 종횡비

async function createWindow() {
  const win = new BrowserWindow({
    show: false,
    useContentSize: true, // 프레임 제외한 콘텐츠 영역 기준
    width: MIN_W,
    height: MIN_H,
    minWidth: MIN_W,
    minHeight: MIN_H,
    maxWidth: MAX_W,
    maxHeight: MAX_H,
    fullscreenable: false, // 전체 화면 금지(원하면 true)
    // maximizable: false,          // 최대화 버튼 자체를 막고 싶으면 주석 해제
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      allowRunningInsecureContent: false,
    },
  });

  // 화면에 보여줄 때, 현재 모니터 workArea 안에서 min/max 범위로 한 번 더 보정
  win.on('ready-to-show', () => {
    const { workAreaSize } = screen.getPrimaryDisplay();
    const w = Math.max(Math.min(workAreaSize.width, MAX_W), MIN_W);
    const h = Math.max(Math.min(workAreaSize.height, MAX_H), MIN_H);
    win.setSize(w, h);
    win.center();
    win.show();
    // 필요하면 maximize 대신 setSize/center를 쓰는 게 min/max와 충돌이 적음
    // win.setAspectRatio(ASPECT, { width: MIN_W, height: MIN_H }); // 종횡비 고정 옵션
  });

  // 사용자가 드래그로 리사이즈하거나 최대화 시도할 때도 강제로 클램프
  win.on('will-resize', (e, newBounds) => {
    const w = Math.max(Math.min(newBounds.width, MAX_W), MIN_W);
    const h = Math.max(Math.min(newBounds.height, MAX_H), MIN_H);
    if (w !== newBounds.width || h !== newBounds.height) {
      e.preventDefault();
      win.setBounds({ ...newBounds, width: w, height: h });
    }
  });

  // (선택) 최대화 버튼 클릭으로 화면 꽉 차려 해도 상한으로 되돌림
  win.on('maximize', () => {
    const [w, h] = win.getSize();
    const clampedW = Math.min(w, MAX_W);
    const clampedH = Math.min(h, MAX_H);
    if (w !== clampedW || h !== clampedH) {
      win.unmaximize();
      win.setSize(clampedW, clampedH);
      win.center();
    }
  });

  const pageUrl =
    import.meta.env.DEV && process.env.VITE_DEV_SERVER_URL
      ? process.env.VITE_DEV_SERVER_URL
      : 'https://www.bugi.co.kr/';

  await win.loadURL(pageUrl);
  return win;
}

export async function restoreOrCreateWindow() {
  let w = BrowserWindow.getAllWindows().find((x) => !x.isDestroyed());
  if (!w) w = await createWindow();
  if (w.isMinimized()) w.restore();
  w.focus();
}

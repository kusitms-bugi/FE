import { BrowserWindow } from 'electron';
import { join } from 'path';

/*위젯 관리 변수*/
let widgetWindow: BrowserWindow | null = null;

/* Create a widget window (위젯 창 생성)*/
async function createWidgetWindow() {
  // 이미 위젯 창이 있으면 포커스만 주고 반환(중복 방지)
  if (widgetWindow && !widgetWindow.isDestroyed()) {
    widgetWindow.focus();
    return widgetWindow;
  }

  /*위젯 속성*/
  widgetWindow = new BrowserWindow({
    width: 400,
    height: 300,
    show: false, //깜빡임 방지
    frame: true, //타이틀 바 표시(false로 설정하면 타이틀바 없는 창)
    alwaysOnTop: true, // 항상 위에 표시
    resizable: true, //사용자 크기 조절 가능 여부
    skipTaskbar: false, // 작업표시줄에 표시 여부
    webPreferences: {
      webviewTag: false,
      preload: join(__dirname, '../preload/index.cjs'), //preload 스크립트
      nodeIntegration: false, // Node.js API 직접 접근 차단
      contextIsolation: true, // Renderer와 Main 프로세스 격리
      allowRunningInsecureContent: false,
    },
  });

  /* 창이 완전히 로드되면 표시 */
  widgetWindow.on('ready-to-show', () => {
    widgetWindow?.show();

    if (import.meta.env.DEV) {
      // widgetWindow?.webContents.openDevTools();
    }
  });

  // 위젯 창이 닫힐 때 참조 제거
  widgetWindow.on('closed', () => {
    widgetWindow = null;
  });

  // 위젯 전용 URL 또는 route
  const pageUrl =
    import.meta.env.DEV && process.env.VITE_DEV_SERVER_URL !== undefined
      ? `${process.env.VITE_DEV_SERVER_URL}widget` // 위젯 전용 라우트
      : 'https://www.bugi.co.kr/widget';

  await widgetWindow.loadURL(pageUrl);

  return widgetWindow;
}

/* 위젯 외부에서 호출 함수 */
export async function openWidgetWindow() {
  if (widgetWindow && !widgetWindow.isDestroyed()) {
    widgetWindow.focus();
    return widgetWindow;
  }

  return await createWidgetWindow();
}

export function closeWidgetWindow() {
  if (widgetWindow && !widgetWindow.isDestroyed()) {
    widgetWindow.close();
  }
  widgetWindow = null;
}

export function isWidgetWindowOpen() {
  return widgetWindow !== null && !widgetWindow.isDestroyed();
}

export function getWidgetWindow() {
  return widgetWindow;
}

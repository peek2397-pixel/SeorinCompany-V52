const { app, BrowserWindow, shell, session, dialog } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");

let mainWindow;
let updateCheckTimer;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 930,
    minWidth: 1050,
    minHeight: 700,
    show: false,
    title: "서린컴퍼니 물류포털",
    icon: path.join(__dirname, "build", "icon.ico"),
    backgroundColor: "#f4f7fb",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, "app", "index.html"));

  mainWindow.once("ready-to-show", () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    const local = `file://${path.join(__dirname, "app")}`.replace(/\\/g, "/");
    if (!url.startsWith(local) && /^https?:/i.test(url)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
}

function setupAutoUpdate() {
  if (!app.isPackaged) return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("update-available", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setTitle("서린컴퍼니 물류포털 - 업데이트 다운로드 중");
    }
  });

  autoUpdater.on("update-not-available", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setTitle("서린컴퍼니 물류포털");
    }
  });

  autoUpdater.on("error", (error) => {
    console.error("자동 업데이트 오류:", error);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setTitle("서린컴퍼니 물류포털");
    }
  });

  autoUpdater.on("update-downloaded", async (info) => {
    const result = await dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "업데이트 준비 완료",
      message: `새 버전 ${info.version} 다운로드가 완료되었습니다.`,
      detail: "지금 재시작하면 자동으로 업데이트됩니다.",
      buttons: ["지금 재시작", "나중에"],
      defaultId: 0,
      cancelId: 1,
      noLink: true
    });

    if (result.response === 0) {
      autoUpdater.quitAndInstall(false, true);
    }
  });

  const check = () => autoUpdater.checkForUpdates().catch((error) => {
    console.error("업데이트 확인 실패:", error);
  });

  setTimeout(check, 5000);
  updateCheckTimer = setInterval(check, 4 * 60 * 60 * 1000);
}

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
    callback(["notifications", "clipboard-read"].includes(permission));
  });

  createWindow();
  setupAutoUpdate();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("before-quit", () => {
  if (updateCheckTimer) clearInterval(updateCheckTimer);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

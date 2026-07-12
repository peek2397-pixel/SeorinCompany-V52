const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("seorinDesktop", {
  isDesktopApp: true,
  platform: process.platform,
  version: "1.0.0"
});

import { app, BrowserWindow } from "electron";
import { patchApp } from "./patcher";
app.on("ready", () => {
    console.log("[Yuricord] Electron app is ready.");
    // Determine the app path dynamically
    const appPath = app.getAppPath();
    console.log(`[Yuricord] Detected app path: ${appPath}`);
    // Patch the app
    patchApp(appPath);
    console.log("[Yuricord] Injection process completed.");
});
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        // Logic for re-creating a window if needed
    }
});

import { app, protocol, session, BrowserWindow } from "electron";
import { join } from "path";
import { patchApp } from "./patcher";

// Constants for environment detection
const IS_DISCORD_DESKTOP = process.env.DISCORD_ENV === "desktop";

// Start Yuricord when the app is ready
app.on("ready", async () => {
    console.log("[Yuricord] Electron app is ready.");

    const appPath = app.getAppPath();
    console.log(`[Yuricord] Detected app path: ${appPath}`);

    if (IS_DISCORD_DESKTOP) {
        console.log("[Yuricord] Running inside Discord Desktop. Starting patch...");
        await patchApp(appPath);
        console.log("[Yuricord] Patch applied successfully!");
    } else {
        console.warn("[Yuricord] Not running inside Discord Desktop. Skipping patch...");
    }

    // Setup protocol for loading themes
    protocol.registerFileProtocol("yuricord", ({ url }, cb) => {
        let safeUrl = url.slice("yuricord://".length);
        cb({ path: join(__dirname, safeUrl) });
    });

    // Install React DevTools if enabled in settings
    try {
        console.log("[Yuricord] Installing React DevTools...");
        // Add logic here if you have a settings system
    } catch (err) {
        console.error("[Yuricord] Failed to install React DevTools:", err);
    }

    // Modify Content Security Policy to allow custom themes and plugins
    session.defaultSession.webRequest.onHeadersReceived(({ responseHeaders }, cb) => {
        if (responseHeaders) {
            if (responseHeaders["content-security-policy"]) {
                responseHeaders["content-security-policy"] = [
                    responseHeaders["content-security-policy"][0] +
                    "; style-src * 'unsafe-inline'; script-src * 'unsafe-eval'"
                ];
            }
        }
        cb({ cancel: false, responseHeaders });
    });

    console.log("[Yuricord] Injection process completed.");
});

// Ensure app exits when all windows are closed (except on macOS)
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

// Re-create a window when the app is reactivated
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        console.log("[Yuricord] No active windows. Ready to re-inject if needed.");
    }
});

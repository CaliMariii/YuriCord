/*
 * Yuricord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { ipcRenderer } from "electron";
function invoke(event, ...args) {
    return ipcRenderer.invoke(event, ...args);
}
export function sendSync(event, ...args) {
    return ipcRenderer.sendSync(event, ...args);
}
const PluginHelpers = {};
const pluginIpcMap = sendSync("YuricordGetPluginIpcMethodMap" /* IpcEvents.GET_PLUGIN_IPC_METHOD_MAP */);
for (const [plugin, methods] of Object.entries(pluginIpcMap)) {
    const map = PluginHelpers[plugin] = {};
    for (const [methodName, method] of Object.entries(methods)) {
        map[methodName] = (...args) => invoke(method, ...args);
    }
}
export default {
    themes: {
        uploadTheme: (fileName, fileData) => invoke("YuricordUploadTheme" /* IpcEvents.UPLOAD_THEME */, fileName, fileData),
        deleteTheme: (fileName) => invoke("YuricordDeleteTheme" /* IpcEvents.DELETE_THEME */, fileName),
        getThemesDir: () => invoke("YuricordGetThemesDir" /* IpcEvents.GET_THEMES_DIR */),
        getThemesList: () => invoke("YuricordGetThemesList" /* IpcEvents.GET_THEMES_LIST */),
        getThemeData: (fileName) => invoke("YuricordGetThemeData" /* IpcEvents.GET_THEME_DATA */, fileName),
        getSystemValues: () => invoke("YuricordGetThemeSystemValues" /* IpcEvents.GET_THEME_SYSTEM_VALUES */),
    },
    updater: {
        getUpdates: () => invoke("YuricordGetUpdates" /* IpcEvents.GET_UPDATES */),
        update: () => invoke("YuricordUpdate" /* IpcEvents.UPDATE */),
        rebuild: () => invoke("YuricordBuild" /* IpcEvents.BUILD */),
        getRepo: () => invoke("YuricordGetRepo" /* IpcEvents.GET_REPO */),
    },
    settings: {
        get: () => sendSync("YuricordGetSettings" /* IpcEvents.GET_SETTINGS */),
        set: (settings, pathToNotify) => invoke("YuricordSetSettings" /* IpcEvents.SET_SETTINGS */, settings, pathToNotify),
        getSettingsDir: () => invoke("YuricordGetSettingsDir" /* IpcEvents.GET_SETTINGS_DIR */),
    },
    quickCss: {
        get: () => invoke("YuricordGetQuickCss" /* IpcEvents.GET_QUICK_CSS */),
        set: (css) => invoke("YuricordSetQuickCss" /* IpcEvents.SET_QUICK_CSS */, css),
        addChangeListener(cb) {
            ipcRenderer.on("YuricordQuickCssUpdate" /* IpcEvents.QUICK_CSS_UPDATE */, (_, css) => cb(css));
        },
        addThemeChangeListener(cb) {
            ipcRenderer.on("YuricordThemeUpdate" /* IpcEvents.THEME_UPDATE */, () => cb());
        },
        openFile: () => invoke("YuricordOpenQuickCss" /* IpcEvents.OPEN_QUICKCSS */),
        openEditor: () => invoke("YuricordOpenMonacoEditor" /* IpcEvents.OPEN_MONACO_EDITOR */),
    },
    native: {
        getVersions: () => process.versions,
        openExternal: (url) => invoke("YuricordOpenExternal" /* IpcEvents.OPEN_EXTERNAL */, url)
    },
    pluginHelpers: PluginHelpers
};

/*
 * Yuricord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { SettingsStore } from "@shared/SettingsStore";
import { mergeDefaults } from "@utils/mergeDefaults";
import { ipcMain } from "electron";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { NATIVE_SETTINGS_FILE, SETTINGS_DIR, SETTINGS_FILE } from "./utils/constants";
mkdirSync(SETTINGS_DIR, { recursive: true });
function readSettings(name, file) {
    try {
        return JSON.parse(readFileSync(file, "utf-8"));
    }
    catch (err) {
        if (err?.code !== "ENOENT")
            console.error(`Failed to read ${name} settings`, err);
        return {};
    }
}
export const RendererSettings = new SettingsStore(readSettings("renderer", SETTINGS_FILE));
RendererSettings.addGlobalChangeListener(() => {
    try {
        writeFileSync(SETTINGS_FILE, JSON.stringify(RendererSettings.plain, null, 4));
    }
    catch (e) {
        console.error("Failed to write renderer settings", e);
    }
});
ipcMain.handle("YuricordGetSettingsDir" /* IpcEvents.GET_SETTINGS_DIR */, () => SETTINGS_DIR);
ipcMain.on("YuricordGetSettings" /* IpcEvents.GET_SETTINGS */, e => e.returnValue = RendererSettings.plain);
ipcMain.handle("YuricordSetSettings" /* IpcEvents.SET_SETTINGS */, (_, data, pathToNotify) => {
    RendererSettings.setData(data, pathToNotify);
});
const DefaultNativeSettings = {
    plugins: {}
};
const nativeSettings = readSettings("native", NATIVE_SETTINGS_FILE);
mergeDefaults(nativeSettings, DefaultNativeSettings);
export const NativeSettings = new SettingsStore(nativeSettings);
NativeSettings.addGlobalChangeListener(() => {
    try {
        writeFileSync(NATIVE_SETTINGS_FILE, JSON.stringify(NativeSettings.plain, null, 4));
    }
    catch (e) {
        console.error("Failed to write native settings", e);
    }
});

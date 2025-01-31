/*
 * Yuricord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

export const enum IpcEvents {
    QUICK_CSS_UPDATE = "YuricordQuickCssUpdate",
    THEME_UPDATE = "YuricordThemeUpdate",
    GET_QUICK_CSS = "YuricordGetQuickCss",
    SET_QUICK_CSS = "YuricordSetQuickCss",
    UPLOAD_THEME = "YuricordUploadTheme",
    DELETE_THEME = "YuricordDeleteTheme",
    GET_THEMES_DIR = "YuricordGetThemesDir",
    GET_THEMES_LIST = "YuricordGetThemesList",
    GET_THEME_DATA = "YuricordGetThemeData",
    GET_THEME_SYSTEM_VALUES = "YuricordGetThemeSystemValues",
    GET_SETTINGS_DIR = "YuricordGetSettingsDir",
    GET_SETTINGS = "YuricordGetSettings",
    SET_SETTINGS = "YuricordSetSettings",
    OPEN_EXTERNAL = "YuricordOpenExternal",
    OPEN_QUICKCSS = "YuricordOpenQuickCss",
    GET_UPDATES = "YuricordGetUpdates",
    GET_REPO = "YuricordGetRepo",
    UPDATE = "YuricordUpdate",
    BUILD = "YuricordBuild",
    OPEN_MONACO_EDITOR = "YuricordOpenMonacoEditor",

    GET_PLUGIN_IPC_METHOD_MAP = "YuricordGetPluginIpcMethodMap",

    OPEN_IN_APP__RESOLVE_REDIRECT = "YuricordOIAResolveRedirect",
    VOICE_MESSAGES_READ_RECORDING = "YuricordVMReadRecording",
}


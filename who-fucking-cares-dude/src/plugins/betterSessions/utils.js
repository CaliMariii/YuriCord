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
import { DataStore } from "@api/index";
import { UserStore } from "@webpack/common";
import { ChromeIcon, DiscordIcon, EdgeIcon, FirefoxIcon, IEIcon, MobileIcon, OperaIcon, SafariIcon, UnknownIcon } from "./components/icons";
const getDataKey = () => `BetterSessions_savedSessions_${UserStore.getCurrentUser().id}`;
export const savedSessionsCache = new Map();
export function getDefaultName(clientInfo) {
    return `${clientInfo.os} · ${clientInfo.platform}`;
}
export function saveSessionsToDataStore() {
    return DataStore.set(getDataKey(), savedSessionsCache);
}
export async function fetchNamesFromDataStore() {
    const savedSessions = await DataStore.get(getDataKey()) || new Map();
    savedSessions.forEach((data, idHash) => {
        savedSessionsCache.set(idHash, data);
    });
}
export function GetOsColor(os) {
    switch (os) {
        case "Windows Mobile":
        case "Windows":
            return "#55a6ef"; // Light blue
        case "Linux":
            return "#cdcd31"; // Yellow
        case "Android":
            return "#7bc958"; // Green
        case "Mac OS X":
        case "iOS":
            return ""; // Default to white/black (theme-dependent)
        default:
            return "#f3799a"; // Pink
    }
}
export function GetPlatformIcon(platform) {
    switch (platform) {
        case "Discord Android":
        case "Discord iOS":
        case "Discord Client":
            return DiscordIcon;
        case "Android Chrome":
        case "Chrome iOS":
        case "Chrome":
            return ChromeIcon;
        case "Edge":
            return EdgeIcon;
        case "Firefox":
            return FirefoxIcon;
        case "Internet Explorer":
            return IEIcon;
        case "Opera Mini":
        case "Opera":
            return OperaIcon;
        case "Mobile Safari":
        case "Safari":
            return SafariIcon;
        case "BlackBerry":
        case "Facebook Mobile":
        case "Android Mobile":
            return MobileIcon;
        default:
            return UnknownIcon;
    }
}

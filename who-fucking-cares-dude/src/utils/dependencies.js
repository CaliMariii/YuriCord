/*
 * Yuricord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
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
import { makeLazy } from "./lazy";
/*
    Add dynamically loaded dependencies for plugins here.
 */
// needed to parse APNGs in the nitroBypass plugin
export const importApngJs = makeLazy(() => {
    return require("./apng-canvas").APNG;
});
// The below code is only used on the Desktop (electron) build of Yuricord.
// Browser (extension) builds do not contain these remote imports.
export const shikiWorkerSrc = `https://unpkg.com/@vap/shiki-worker@0.0.8/dist/${IS_DEV ? "index.js" : "index.min.js"}`;
export const shikiOnigasmSrc = "https://unpkg.com/@vap/shiki@0.10.3/dist/onig.wasm";
// @ts-expect-error
export const getStegCloak = /* #__PURE__*/ makeLazy(() => import("https://unpkg.com/stegcloak-dist@1.0.0/index.js"));

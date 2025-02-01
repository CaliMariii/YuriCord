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
import { Settings } from "@api/Settings";
import { findByProps, findByPropsLazy, proxyLazyWebpack } from "@webpack";
import { Flux, FluxDispatcher } from "@webpack/common";
// Don't wanna run before Flux and Dispatcher are ready!
export const SpotifyStore = proxyLazyWebpack(() => {
    // For some reason ts hates extends Flux.Store
    const { Store } = Flux;
    const SpotifySocket = findByProps("getActiveSocketAndDevice");
    const SpotifyAPI = findByPropsLazy("vcSpotifyMarker");
    const API_BASE = "https://api.spotify.com/v1/me/player";
    class SpotifyStore extends Store {
        mPosition = 0;
        start = 0;
        track = null;
        device = null;
        isPlaying = false;
        repeat = "off";
        shuffle = false;
        volume = 0;
        isSettingPosition = false;
        openExternal(path) {
            const url = Settings.plugins.SpotifyControls.useSpotifyUris || Yuricord.Plugins.isPluginEnabled("OpenInApp")
                ? "spotify:" + path.replaceAll("/", (_, idx) => idx === 0 ? "" : ":")
                : "https://open.spotify.com" + path;
            YuricordNative.native.openExternal(url);
        }
        // Need to keep track of this manually
        get position() {
            let pos = this.mPosition;
            if (this.isPlaying) {
                pos += Date.now() - this.start;
            }
            return pos;
        }
        set position(p) {
            this.mPosition = p;
            this.start = Date.now();
        }
        prev() {
            this.req("post", "/previous");
        }
        next() {
            this.req("post", "/next");
        }
        setVolume(percent) {
            this.req("put", "/volume", {
                query: {
                    volume_percent: Math.round(percent)
                }
            }).then(() => {
                this.volume = percent;
                this.emitChange();
            });
        }
        setPlaying(playing) {
            this.req("put", playing ? "/play" : "/pause");
        }
        setRepeat(state) {
            this.req("put", "/repeat", {
                query: { state }
            });
        }
        setShuffle(state) {
            this.req("put", "/shuffle", {
                query: { state }
            }).then(() => {
                this.shuffle = state;
                this.emitChange();
            });
        }
        seek(ms) {
            if (this.isSettingPosition)
                return Promise.resolve();
            this.isSettingPosition = true;
            return this.req("put", "/seek", {
                query: {
                    position_ms: Math.round(ms)
                }
            }).catch((e) => {
                console.error("[YuricordSpotifyControls] Failed to seek", e);
                this.isSettingPosition = false;
            });
        }
        req(method, route, data = {}) {
            if (this.device?.is_active)
                (data.query ??= {}).device_id = this.device.id;
            const { socket } = SpotifySocket.getActiveSocketAndDevice();
            return SpotifyAPI[method](socket.accountId, socket.accessToken, {
                url: API_BASE + route,
                ...data
            });
        }
    }
    const store = new SpotifyStore(FluxDispatcher, {
        SPOTIFY_PLAYER_STATE(e) {
            store.track = e.track;
            store.device = e.device ?? null;
            store.isPlaying = e.isPlaying ?? false;
            store.volume = e.volumePercent ?? 0;
            store.repeat = e.actual_repeat || "off";
            store.shuffle = e.shuffle ?? false;
            store.position = e.position ?? 0;
            store.isSettingPosition = false;
            store.emitChange();
        },
        SPOTIFY_SET_DEVICES({ devices }) {
            store.device = devices.find(d => d.is_active) ?? devices[0] ?? null;
            store.emitChange();
        }
    });
    return store;
});

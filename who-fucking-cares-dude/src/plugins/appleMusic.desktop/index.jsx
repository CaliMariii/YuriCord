/*
 * Yuricord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { ApplicationAssetUtils, FluxDispatcher, Forms } from "@webpack/common";
const Native = YuricordNative.pluginHelpers.AppleMusicRichPresence;
const applicationId = "1239490006054207550";
function setActivity(activity) {
    FluxDispatcher.dispatch({
        type: "LOCAL_ACTIVITY_UPDATE",
        activity,
        socketId: "AppleMusic",
    });
}
const settings = definePluginSettings({
    activityType: {
        type: 4 /* OptionType.SELECT */,
        description: "Which type of activity",
        options: [
            { label: "Playing", value: 0 /* ActivityType.PLAYING */, default: true },
            { label: "Listening", value: 2 /* ActivityType.LISTENING */ }
        ],
    },
    refreshInterval: {
        type: 5 /* OptionType.SLIDER */,
        description: "The interval between activity refreshes (seconds)",
        markers: [1, 2, 2.5, 3, 5, 10, 15],
        default: 5,
        restartNeeded: true,
    },
    enableTimestamps: {
        type: 3 /* OptionType.BOOLEAN */,
        description: "Whether or not to enable timestamps",
        default: true,
    },
    enableButtons: {
        type: 3 /* OptionType.BOOLEAN */,
        description: "Whether or not to enable buttons",
        default: true,
    },
    nameString: {
        type: 0 /* OptionType.STRING */,
        description: "Activity name format string",
        default: "Apple Music"
    },
    detailsString: {
        type: 0 /* OptionType.STRING */,
        description: "Activity details format string",
        default: "{name}"
    },
    stateString: {
        type: 0 /* OptionType.STRING */,
        description: "Activity state format string",
        default: "{artist} · {album}"
    },
    largeImageType: {
        type: 4 /* OptionType.SELECT */,
        description: "Activity assets large image type",
        options: [
            { label: "Album artwork", value: "Album" /* AssetImageType.Album */, default: true },
            { label: "Artist artwork", value: "Artist" /* AssetImageType.Artist */ },
            { label: "Disabled", value: "Disabled" /* AssetImageType.Disabled */ }
        ],
    },
    largeTextString: {
        type: 0 /* OptionType.STRING */,
        description: "Activity assets large text format string",
        default: "{album}"
    },
    smallImageType: {
        type: 4 /* OptionType.SELECT */,
        description: "Activity assets small image type",
        options: [
            { label: "Album artwork", value: "Album" /* AssetImageType.Album */ },
            { label: "Artist artwork", value: "Artist" /* AssetImageType.Artist */, default: true },
            { label: "Disabled", value: "Disabled" /* AssetImageType.Disabled */ }
        ],
    },
    smallTextString: {
        type: 0 /* OptionType.STRING */,
        description: "Activity assets small text format string",
        default: "{artist}"
    },
});
function customFormat(formatStr, data) {
    return formatStr
        .replaceAll("{name}", data.name)
        .replaceAll("{album}", data.album ?? "")
        .replaceAll("{artist}", data.artist ?? "");
}
function getImageAsset(type, data) {
    const source = type === "Album" /* AssetImageType.Album */
        ? data.albumArtwork
        : data.artistArtwork;
    if (!source)
        return undefined;
    return ApplicationAssetUtils.fetchAssetIds(applicationId, [source]).then(ids => ids[0]);
}
export default definePlugin({
    name: "AppleMusicRichPresence",
    description: "Discord rich presence for your Apple Music!",
    authors: [Devs.RyanCaoDev],
    hidden: !navigator.platform.startsWith("Mac"),
    reporterTestable: 2 /* ReporterTestable.None */,
    settingsAboutComponent() {
        return <>
            <Forms.FormText>
                For the customizable activity format strings, you can use several special strings to include track data in activities!{" "}
                <code>{"{name}"}</code> is replaced with the track name; <code>{"{artist}"}</code> is replaced with the artist(s)' name(s); and <code>{"{album}"}</code> is replaced with the album name.
            </Forms.FormText>
        </>;
    },
    settings,
    start() {
        this.updatePresence();
        this.updateInterval = setInterval(() => { this.updatePresence(); }, settings.store.refreshInterval * 1000);
    },
    stop() {
        clearInterval(this.updateInterval);
        FluxDispatcher.dispatch({ type: "LOCAL_ACTIVITY_UPDATE", activity: null });
    },
    updatePresence() {
        this.getActivity().then(activity => { setActivity(activity); });
    },
    async getActivity() {
        const trackData = await Native.fetchTrackData();
        if (!trackData)
            return null;
        const [largeImageAsset, smallImageAsset] = await Promise.all([
            getImageAsset(settings.store.largeImageType, trackData),
            getImageAsset(settings.store.smallImageType, trackData)
        ]);
        const assets = {};
        const isRadio = Number.isNaN(trackData.duration) && (trackData.playerPosition === 0);
        if (settings.store.largeImageType !== "Disabled" /* AssetImageType.Disabled */) {
            assets.large_image = largeImageAsset;
            if (!isRadio)
                assets.large_text = customFormat(settings.store.largeTextString, trackData);
        }
        if (settings.store.smallImageType !== "Disabled" /* AssetImageType.Disabled */) {
            assets.small_image = smallImageAsset;
            if (!isRadio)
                assets.small_text = customFormat(settings.store.smallTextString, trackData);
        }
        const buttons = [];
        if (settings.store.enableButtons) {
            if (trackData.appleMusicLink)
                buttons.push({
                    label: "Listen on Apple Music",
                    url: trackData.appleMusicLink,
                });
            if (trackData.songLink)
                buttons.push({
                    label: "View on SongLink",
                    url: trackData.songLink,
                });
        }
        return {
            application_id: applicationId,
            name: customFormat(settings.store.nameString, trackData),
            details: customFormat(settings.store.detailsString, trackData),
            state: isRadio ? undefined : customFormat(settings.store.stateString, trackData),
            timestamps: (trackData.playerPosition && trackData.duration && settings.store.enableTimestamps) ? {
                start: Date.now() - (trackData.playerPosition * 1000),
                end: Date.now() - (trackData.playerPosition * 1000) + (trackData.duration * 1000),
            } : undefined,
            assets,
            buttons: !isRadio && buttons.length ? buttons.map(v => v.label) : undefined,
            metadata: !isRadio && buttons.length ? { button_urls: buttons.map(v => v.url) } : undefined,
            type: settings.store.activityType,
            flags: 1 /* ActivityFlag.INSTANCE */,
        };
    }
});

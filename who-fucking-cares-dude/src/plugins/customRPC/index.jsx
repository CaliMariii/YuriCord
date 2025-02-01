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
import { definePluginSettings, Settings } from "@api/Settings";
import { getUserSettingLazy } from "@api/UserSettings";
import { ErrorCard } from "@components/ErrorCard";
import { Flex } from "@components/Flex";
import { Link } from "@components/Link";
import { Devs } from "@utils/constants";
import { isTruthy } from "@utils/guards";
import { Margins } from "@utils/margins";
import { classes } from "@utils/misc";
import { useAwaiter } from "@utils/react";
import definePlugin from "@utils/types";
import { findByCodeLazy, findComponentByCodeLazy } from "@webpack";
import { ApplicationAssetUtils, Button, FluxDispatcher, Forms, React, UserStore } from "@webpack/common";
const useProfileThemeStyle = findByCodeLazy("profileThemeStyle:", "--profile-gradient-primary-color");
const ActivityView = findComponentByCodeLazy(".party?(0", ".card");
const ShowCurrentGame = getUserSettingLazy("status", "showCurrentGame");
async function getApplicationAsset(key) {
    return (await ApplicationAssetUtils.fetchAssetIds(settings.store.appID, [key]))[0];
}
const settings = definePluginSettings({
    appID: {
        type: 0 /* OptionType.STRING */,
        description: "Application ID (required)",
        onChange: onChange,
        isValid: (value) => {
            if (!value)
                return "Application ID is required.";
            if (value && !/^\d+$/.test(value))
                return "Application ID must be a number.";
            return true;
        }
    },
    appName: {
        type: 0 /* OptionType.STRING */,
        description: "Application name (required)",
        onChange: onChange,
        isValid: (value) => {
            if (!value)
                return "Application name is required.";
            if (value.length > 128)
                return "Application name must be not longer than 128 characters.";
            return true;
        }
    },
    details: {
        type: 0 /* OptionType.STRING */,
        description: "Details (line 1)",
        onChange: onChange,
        isValid: (value) => {
            if (value && value.length > 128)
                return "Details (line 1) must be not longer than 128 characters.";
            return true;
        }
    },
    state: {
        type: 0 /* OptionType.STRING */,
        description: "State (line 2)",
        onChange: onChange,
        isValid: (value) => {
            if (value && value.length > 128)
                return "State (line 2) must be not longer than 128 characters.";
            return true;
        }
    },
    type: {
        type: 4 /* OptionType.SELECT */,
        description: "Activity type",
        onChange: onChange,
        options: [
            {
                label: "Playing",
                value: 0 /* ActivityType.PLAYING */,
                default: true
            },
            {
                label: "Streaming",
                value: 1 /* ActivityType.STREAMING */
            },
            {
                label: "Listening",
                value: 2 /* ActivityType.LISTENING */
            },
            {
                label: "Watching",
                value: 3 /* ActivityType.WATCHING */
            },
            {
                label: "Competing",
                value: 5 /* ActivityType.COMPETING */
            }
        ]
    },
    streamLink: {
        type: 0 /* OptionType.STRING */,
        description: "Twitch.tv or Youtube.com link (only for Streaming activity type)",
        onChange: onChange,
        disabled: isStreamLinkDisabled,
        isValid: isStreamLinkValid
    },
    timestampMode: {
        type: 4 /* OptionType.SELECT */,
        description: "Timestamp mode",
        onChange: onChange,
        options: [
            {
                label: "None",
                value: 0 /* TimestampMode.NONE */,
                default: true
            },
            {
                label: "Since discord open",
                value: 1 /* TimestampMode.NOW */
            },
            {
                label: "Same as your current time (not reset after 24h)",
                value: 2 /* TimestampMode.TIME */
            },
            {
                label: "Custom",
                value: 3 /* TimestampMode.CUSTOM */
            }
        ]
    },
    startTime: {
        type: 1 /* OptionType.NUMBER */,
        description: "Start timestamp in milliseconds (only for custom timestamp mode)",
        onChange: onChange,
        disabled: isTimestampDisabled,
        isValid: (value) => {
            if (value && value < 0)
                return "Start timestamp must be greater than 0.";
            return true;
        }
    },
    endTime: {
        type: 1 /* OptionType.NUMBER */,
        description: "End timestamp in milliseconds (only for custom timestamp mode)",
        onChange: onChange,
        disabled: isTimestampDisabled,
        isValid: (value) => {
            if (value && value < 0)
                return "End timestamp must be greater than 0.";
            return true;
        }
    },
    imageBig: {
        type: 0 /* OptionType.STRING */,
        description: "Big image key/link",
        onChange: onChange,
        isValid: isImageKeyValid
    },
    imageBigTooltip: {
        type: 0 /* OptionType.STRING */,
        description: "Big image tooltip",
        onChange: onChange,
        isValid: (value) => {
            if (value && value.length > 128)
                return "Big image tooltip must be not longer than 128 characters.";
            return true;
        }
    },
    imageSmall: {
        type: 0 /* OptionType.STRING */,
        description: "Small image key/link",
        onChange: onChange,
        isValid: isImageKeyValid
    },
    imageSmallTooltip: {
        type: 0 /* OptionType.STRING */,
        description: "Small image tooltip",
        onChange: onChange,
        isValid: (value) => {
            if (value && value.length > 128)
                return "Small image tooltip must be not longer than 128 characters.";
            return true;
        }
    },
    buttonOneText: {
        type: 0 /* OptionType.STRING */,
        description: "Button 1 text",
        onChange: onChange,
        isValid: (value) => {
            if (value && value.length > 31)
                return "Button 1 text must be not longer than 31 characters.";
            return true;
        }
    },
    buttonOneURL: {
        type: 0 /* OptionType.STRING */,
        description: "Button 1 URL",
        onChange: onChange
    },
    buttonTwoText: {
        type: 0 /* OptionType.STRING */,
        description: "Button 2 text",
        onChange: onChange,
        isValid: (value) => {
            if (value && value.length > 31)
                return "Button 2 text must be not longer than 31 characters.";
            return true;
        }
    },
    buttonTwoURL: {
        type: 0 /* OptionType.STRING */,
        description: "Button 2 URL",
        onChange: onChange
    }
});
function onChange() {
    setRpc(true);
    if (Settings.plugins.CustomRPC.enabled)
        setRpc();
}
function isStreamLinkDisabled() {
    return settings.store.type !== 1 /* ActivityType.STREAMING */;
}
function isStreamLinkValid(value) {
    if (!isStreamLinkDisabled() && !/https?:\/\/(www\.)?(twitch\.tv|youtube\.com)\/\w+/.test(value))
        return "Streaming link must be a valid URL.";
    if (value && value.length > 512)
        return "Streaming link must be not longer than 512 characters.";
    return true;
}
function isTimestampDisabled() {
    return settings.store.timestampMode !== 3 /* TimestampMode.CUSTOM */;
}
function isImageKeyValid(value) {
    if (/https?:\/\/(cdn|media)\.discordapp\.(com|net)\//.test(value))
        return "Don't use a Discord link. Use an Imgur image link instead.";
    if (/https?:\/\/(?!i\.)?imgur\.com\//.test(value))
        return "Imgur link must be a direct link to the image (e.g. https://i.imgur.com/...). Right click the image and click 'Copy image address'";
    if (/https?:\/\/(?!media\.)?tenor\.com\//.test(value))
        return "Tenor link must be a direct link to the image (e.g. https://media.tenor.com/...). Right click the GIF and click 'Copy image address'";
    return true;
}
async function createActivity() {
    const { appID, appName, details, state, type, streamLink, startTime, endTime, imageBig, imageBigTooltip, imageSmall, imageSmallTooltip, buttonOneText, buttonOneURL, buttonTwoText, buttonTwoURL } = settings.store;
    if (!appName)
        return;
    const activity = {
        application_id: appID || "0",
        name: appName,
        state,
        details,
        type,
        flags: 1 << 0,
    };
    if (type === 1 /* ActivityType.STREAMING */)
        activity.url = streamLink;
    switch (settings.store.timestampMode) {
        case 1 /* TimestampMode.NOW */:
            activity.timestamps = {
                start: Date.now()
            };
            break;
        case 2 /* TimestampMode.TIME */:
            activity.timestamps = {
                start: Date.now() - (new Date().getHours() * 3600 + new Date().getMinutes() * 60 + new Date().getSeconds()) * 1000
            };
            break;
        case 3 /* TimestampMode.CUSTOM */:
            if (startTime || endTime) {
                activity.timestamps = {};
                if (startTime)
                    activity.timestamps.start = startTime;
                if (endTime)
                    activity.timestamps.end = endTime;
            }
            break;
        case 0 /* TimestampMode.NONE */:
        default:
            break;
    }
    if (buttonOneText) {
        activity.buttons = [
            buttonOneText,
            buttonTwoText
        ].filter(isTruthy);
        activity.metadata = {
            button_urls: [
                buttonOneURL,
                buttonTwoURL
            ].filter(isTruthy)
        };
    }
    if (imageBig) {
        activity.assets = {
            large_image: await getApplicationAsset(imageBig),
            large_text: imageBigTooltip || undefined
        };
    }
    if (imageSmall) {
        activity.assets = {
            ...activity.assets,
            small_image: await getApplicationAsset(imageSmall),
            small_text: imageSmallTooltip || undefined
        };
    }
    for (const k in activity) {
        if (k === "type")
            continue;
        const v = activity[k];
        if (!v || v.length === 0)
            delete activity[k];
    }
    return activity;
}
async function setRpc(disable) {
    const activity = await createActivity();
    FluxDispatcher.dispatch({
        type: "LOCAL_ACTIVITY_UPDATE",
        activity: !disable ? activity : null,
        socketId: "CustomRPC",
    });
}
export default definePlugin({
    name: "CustomRPC",
    description: "Add a fully customisable Rich Presence (Game status) to your Discord profile",
    authors: [Devs.captain, Devs.AutumnVN, Devs.nin0dev],
    dependencies: ["UserSettingsAPI"],
    start: setRpc,
    stop: () => setRpc(true),
    settings,
    patches: [
        {
            find: ".party?(0",
            all: true,
            replacement: {
                match: /\i\.id===\i\.id\?null:/,
                replace: ""
            }
        }
    ],
    settingsAboutComponent: () => {
        const activity = useAwaiter(createActivity);
        const gameActivityEnabled = ShowCurrentGame.useSetting();
        const { profileThemeStyle } = useProfileThemeStyle({});
        return (<>
                {!gameActivityEnabled && (<ErrorCard className={classes(Margins.top16, Margins.bottom16)} style={{ padding: "1em" }}>
                        <Forms.FormTitle>Notice</Forms.FormTitle>
                        <Forms.FormText>Activity Sharing isn't enabled, people won't be able to see your custom rich presence!</Forms.FormText>

                        <Button color={Button.Colors.TRANSPARENT} className={Margins.top8} onClick={() => ShowCurrentGame.updateSetting(true)}>
                            Enable
                        </Button>
                    </ErrorCard>)}

                <Flex flexDirection="column" style={{ gap: ".5em" }} className={Margins.top16}>
                    <Forms.FormText>
                        Go to the <Link href="https://discord.com/developers/applications">Discord Developer Portal</Link> to create an application and
                        get the application ID.
                    </Forms.FormText>
                    <Forms.FormText>
                        Upload images in the Rich Presence tab to get the image keys.
                    </Forms.FormText>
                    <Forms.FormText>
                        If you want to use an image link, download your image and reupload the image to <Link href="https://imgur.com">Imgur</Link> and get the image link by right-clicking the image and selecting "Copy image address".
                    </Forms.FormText>
                    <Forms.FormText>
                        You can't see your own buttons on your profile, but everyone else can see it fine.
                    </Forms.FormText>
                    <Forms.FormText>
                        Some weird unicode text ("fonts" 𝖑𝖎𝖐𝖊 𝖙𝖍𝖎𝖘) may cause the rich presence to not show up, try using normal letters instead.
                    </Forms.FormText>
                </Flex>

                <Forms.FormDivider className={Margins.top8}/>

                <div style={{ width: "284px", ...profileThemeStyle, marginTop: 8, borderRadius: 8, background: "var(--bg-mod-faint)" }}>
                    {activity[0] && <ActivityView activity={activity[0]} user={UserStore.getCurrentUser()} currentUser={UserStore.getCurrentUser()}/>}
                </div>
            </>);
    }
});

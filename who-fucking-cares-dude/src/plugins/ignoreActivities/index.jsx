/*
 * Yuricord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { definePluginSettings, Settings } from "@api/Settings";
import { getUserSettingLazy } from "@api/UserSettings";
import ErrorBoundary from "@components/ErrorBoundary";
import { Flex } from "@components/Flex";
import { Devs } from "@utils/constants";
import { Margins } from "@utils/margins";
import definePlugin from "@utils/types";
import { findStoreLazy } from "@webpack";
import { Button, Forms, showToast, TextInput, Toasts, Tooltip, useEffect, useState } from "webpack/common";
const RunningGameStore = findStoreLazy("RunningGameStore");
const ShowCurrentGame = getUserSettingLazy("status", "showCurrentGame");
function ToggleIcon(activity, tooltipText, path, fill) {
    return (<Tooltip text={tooltipText}>
            {tooltipProps => (<button {...tooltipProps} onClick={e => handleActivityToggle(e, activity)} style={{ all: "unset", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <svg width="24" height="24" viewBox="0 -960 960 960">
                        <path fill={fill} d={path}/>
                    </svg>
                </button>)}
        </Tooltip>);
}
const ToggleIconOn = (activity, fill) => ToggleIcon(activity, "Disable Activity", "M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z", fill);
const ToggleIconOff = (activity, fill) => ToggleIcon(activity, "Enable Activity", "m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z", fill);
function ToggleActivityComponent(activity, isPlaying = false) {
    const s = settings.use(["ignoredActivities"]);
    const { ignoredActivities } = s;
    if (ignoredActivities.some(act => act.id === activity.id))
        return ToggleIconOff(activity, "var(--status-danger)");
    return ToggleIconOn(activity, isPlaying ? "var(--green-300)" : "var(--primary-400)");
}
function handleActivityToggle(e, activity) {
    e.stopPropagation();
    const ignoredActivityIndex = settings.store.ignoredActivities.findIndex(act => act.id === activity.id);
    if (ignoredActivityIndex === -1)
        settings.store.ignoredActivities.push(activity);
    else
        settings.store.ignoredActivities.splice(ignoredActivityIndex, 1);
}
function recalculateActivities() {
    ShowCurrentGame.updateSetting(old => old);
}
function ImportCustomRPCComponent() {
    return (<Flex flexDirection="column">
            <Forms.FormText type={Forms.FormText.Types.DESCRIPTION}>Import the application id of the CustomRPC plugin to the filter list</Forms.FormText>
            <div>
                <Button onClick={() => {
            const id = Settings.plugins.CustomRPC?.appID;
            if (!id) {
                return showToast("CustomRPC application ID is not set.", Toasts.Type.FAILURE);
            }
            const isAlreadyAdded = idsListPushID?.(id);
            if (isAlreadyAdded) {
                showToast("CustomRPC application ID is already added.", Toasts.Type.FAILURE);
            }
        }}>
                    Import CustomRPC ID
                </Button>
            </div>
        </Flex>);
}
let idsListPushID = null;
function IdsListComponent(props) {
    const [idsList, setIdsList] = useState(settings.store.idsList ?? "");
    idsListPushID = (id) => {
        const currentIds = new Set(idsList.split(",").map(id => id.trim()).filter(Boolean));
        const isAlreadyAdded = currentIds.has(id) || (currentIds.add(id), false);
        const ids = Array.from(currentIds).join(", ");
        setIdsList(ids);
        props.setValue(ids);
        return isAlreadyAdded;
    };
    useEffect(() => () => {
        idsListPushID = null;
    }, []);
    function handleChange(newValue) {
        setIdsList(newValue);
        props.setValue(newValue);
    }
    return (<Forms.FormSection>
            <Forms.FormTitle tag="h3">Filter List</Forms.FormTitle>
            <Forms.FormText className={Margins.bottom8} type={Forms.FormText.Types.DESCRIPTION}>Comma separated list of activity IDs to filter (Useful for filtering specific RPC activities and CustomRPC</Forms.FormText>
            <TextInput type="text" value={idsList} onChange={handleChange} placeholder="235834946571337729, 343383572805058560"/>
        </Forms.FormSection>);
}
const settings = definePluginSettings({
    importCustomRPC: {
        type: 6 /* OptionType.COMPONENT */,
        component: ImportCustomRPCComponent
    },
    listMode: {
        type: 4 /* OptionType.SELECT */,
        description: "Change the mode of the filter list",
        options: [
            {
                label: "Whitelist",
                value: 0 /* FilterMode.Whitelist */,
                default: true
            },
            {
                label: "Blacklist",
                value: 1 /* FilterMode.Blacklist */,
            }
        ],
        onChange: recalculateActivities
    },
    idsList: {
        type: 6 /* OptionType.COMPONENT */,
        default: "",
        onChange(newValue) {
            const ids = new Set(newValue.split(",").map(id => id.trim()).filter(Boolean));
            settings.store.idsList = Array.from(ids).join(", ");
            recalculateActivities();
        },
        component: props => <IdsListComponent setValue={props.setValue}/>
    },
    ignorePlaying: {
        type: 3 /* OptionType.BOOLEAN */,
        description: "Ignore all playing activities (These are usually game and RPC activities)",
        default: false,
        onChange: recalculateActivities
    },
    ignoreStreaming: {
        type: 3 /* OptionType.BOOLEAN */,
        description: "Ignore all streaming activities",
        default: false,
        onChange: recalculateActivities
    },
    ignoreListening: {
        type: 3 /* OptionType.BOOLEAN */,
        description: "Ignore all listening activities (These are usually spotify activities)",
        default: false,
        onChange: recalculateActivities
    },
    ignoreWatching: {
        type: 3 /* OptionType.BOOLEAN */,
        description: "Ignore all watching activities",
        default: false,
        onChange: recalculateActivities
    },
    ignoreCompeting: {
        type: 3 /* OptionType.BOOLEAN */,
        description: "Ignore all competing activities (These are normally special game activities)",
        default: false,
        onChange: recalculateActivities
    },
    ignoredActivities: {
        type: 7 /* OptionType.CUSTOM */,
        default: [],
        onChange: recalculateActivities
    }
});
function isActivityTypeIgnored(type, id) {
    if (id && settings.store.idsList.includes(id)) {
        return settings.store.listMode === 1 /* FilterMode.Blacklist */;
    }
    switch (type) {
        case 0: return settings.store.ignorePlaying;
        case 1: return settings.store.ignoreStreaming;
        case 2: return settings.store.ignoreListening;
        case 3: return settings.store.ignoreWatching;
        case 5: return settings.store.ignoreCompeting;
    }
    return false;
}
export default definePlugin({
    name: "IgnoreActivities",
    authors: [Devs.Nuckyz, Devs.Kylie],
    description: "Ignore activities from showing up on your status ONLY. You can configure which ones are specifically ignored from the Registered Games and Activities tabs, or use the general settings below",
    dependencies: ["UserSettingsAPI"],
    settings,
    patches: [
        {
            find: '"LocalActivityStore"',
            replacement: [
                {
                    match: /\.LISTENING.+?(?=!?\i\(\)\(\i,\i\))(?<=(\i)\.push.+?)/,
                    replace: (m, activities) => `${m}${activities}=${activities}.filter($self.isActivityNotIgnored);`
                }
            ]
        },
        {
            find: '"ActivityTrackingStore"',
            replacement: {
                match: /getVisibleRunningGames\(\).+?;(?=for)(?<=(\i)=\i\.\i\.getVisibleRunningGames.+?)/,
                replace: (m, runningGames) => `${m}${runningGames}=${runningGames}.filter(({id,name})=>$self.isActivityNotIgnored({type:0,application_id:id,name}));`
            }
        },
        {
            find: "#{intl::SETTINGS_GAMES_TOGGLE_OVERLAY}",
            replacement: {
                match: /#{intl::SETTINGS_GAMES_TOGGLE_OVERLAY}.+?}\(\),(?<={overlay:\i,.+?=(\i),.+?)(?=!(\i))/,
                replace: (m, props, nowPlaying) => `${m}$self.renderToggleGameActivityButton(${props},${nowPlaying}),`
            }
        },
        // Discord has 2 different components for activities. Currently, the last is the one being used
        {
            find: ".activityTitleText,variant",
            replacement: {
                match: /\.activityTitleText.+?children:(\i)\.name.*?}\),/,
                replace: (m, props) => `${m}$self.renderToggleActivityButton(${props}),`
            },
        },
        {
            find: ".promotedLabelWrapperNonBanner,children",
            replacement: {
                match: /\.appDetailsHeaderContainer.+?children:\i.*?}\),(?<=application:(\i).+?)/,
                replace: (m, props) => `${m}$self.renderToggleActivityButton(${props}),`
            }
        }
    ],
    async start() {
        if (settings.store.ignoredActivities.length !== 0) {
            const gamesSeen = RunningGameStore.getGamesSeen();
            for (const [index, ignoredActivity] of settings.store.ignoredActivities.entries()) {
                if (ignoredActivity.type !== 0 /* ActivitiesTypes.Game */)
                    continue;
                if (!gamesSeen.some(game => game.id === ignoredActivity.id || game.exePath === ignoredActivity.id)) {
                    settings.store.ignoredActivities.splice(index, 1);
                }
            }
        }
    },
    isActivityNotIgnored(props) {
        if (isActivityTypeIgnored(props.type, props.application_id))
            return false;
        if (props.application_id != null) {
            return !settings.store.ignoredActivities.some(activity => activity.id === props.application_id) || (settings.store.listMode === 0 /* FilterMode.Whitelist */ && settings.store.idsList.includes(props.application_id));
        }
        else {
            const exePath = RunningGameStore.getRunningGames().find(game => game.name === props.name)?.exePath;
            if (exePath) {
                return !settings.store.ignoredActivities.some(activity => activity.id === exePath);
            }
        }
        return true;
    },
    renderToggleGameActivityButton(props, nowPlaying) {
        return (<ErrorBoundary noop>
                <div style={{ marginLeft: 12, zIndex: 0 }}>
                    {ToggleActivityComponent({ id: props.id ?? props.exePath, name: props.name, type: 0 /* ActivitiesTypes.Game */ }, nowPlaying)}
                </div>
            </ErrorBoundary>);
    },
    renderToggleActivityButton(props) {
        return (<ErrorBoundary noop>
                {ToggleActivityComponent({ id: props.id, name: props.name, type: 1 /* ActivitiesTypes.Embedded */ })}
            </ErrorBoundary>);
    }
});

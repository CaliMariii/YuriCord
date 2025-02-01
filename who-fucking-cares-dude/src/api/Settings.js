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
import { debounce } from "@shared/debounce";
import { SettingsStore as SettingsStoreClass } from "@shared/SettingsStore";
import { localStorage } from "@utils/localStorage";
import { Logger } from "@utils/Logger";
import { mergeDefaults } from "@utils/mergeDefaults";
import { putCloudSettings } from "@utils/settingsSync";
import { React, useEffect } from "@webpack/common";
import plugins from "~plugins";
const logger = new Logger("Settings");
const DefaultSettings = {
    autoUpdate: true,
    autoUpdateNotification: true,
    useQuickCss: true,
    themeLinks: [],
    enabledThemes: [],
    enableReactDevtools: false,
    frameless: false,
    transparent: false,
    winCtrlQ: false,
    macosVibrancyStyle: undefined,
    disableMinSize: false,
    winNativeTitleBar: false,
    plugins: {},
    notifications: {
        timeout: 5000,
        position: "bottom-right",
        useNative: "not-focused",
        logLimit: 50
    },
    cloud: {
        authenticated: false,
        url: "https://api.Yuricord.dev/",
        settingsSync: false,
        settingsSyncVersion: 0
    }
};
const settings = !IS_REPORTER ? YuricordNative.settings.get() : {};
mergeDefaults(settings, DefaultSettings);
const saveSettingsOnFrequentAction = debounce(async () => {
    if (Settings.cloud.settingsSync && Settings.cloud.authenticated) {
        await putCloudSettings();
        delete localStorage.Yuricord_settingsDirty;
    }
}, 60_000);
export const SettingsStore = new SettingsStoreClass(settings, {
    readOnly: true,
    getDefaultValue({ target, key, path }) {
        const v = target[key];
        if (!plugins)
            return v; // plugins not initialised yet. this means this path was reached by being called on the top level
        if (path === "plugins" && key in plugins)
            return target[key] = {
                enabled: IS_REPORTER || plugins[key].required || plugins[key].enabledByDefault || false
            };
        // Since the property is not set, check if this is a plugin's setting and if so, try to resolve
        // the default value.
        if (path.startsWith("plugins.")) {
            const plugin = path.slice("plugins.".length);
            if (plugin in plugins) {
                const setting = plugins[plugin].options?.[key];
                if (!setting)
                    return v;
                if ("default" in setting)
                    // normal setting with a default value
                    return (target[key] = setting.default);
                if (setting.type === 4 /* OptionType.SELECT */) {
                    const def = setting.options.find(o => o.default);
                    if (def)
                        target[key] = def.value;
                    return def?.value;
                }
            }
        }
        return v;
    }
});
if (!IS_REPORTER) {
    SettingsStore.addGlobalChangeListener((_, path) => {
        SettingsStore.plain.cloud.settingsSyncVersion = Date.now();
        localStorage.Yuricord_settingsDirty = true;
        saveSettingsOnFrequentAction();
        YuricordNative.settings.set(SettingsStore.plain, path);
    });
}
/**
 * Same as {@link Settings} but unproxied. You should treat this as readonly,
 * as modifying properties on this will not save to disk or call settings
 * listeners.
 * WARNING: default values specified in plugin.options will not be ensured here. In other words,
 * settings for which you specified a default value may be uninitialised. If you need proper
 * handling for default values, use {@link Settings}
 */
export const PlainSettings = settings;
/**
 * A smart settings object. Altering props automagically saves
 * the updated settings to disk.
 * This recursively proxies objects. If you need the object non proxied, use {@link PlainSettings}
 */
export const Settings = SettingsStore.store;
/**
 * Settings hook for React components. Returns a smart settings
 * object that automagically triggers a rerender if any properties
 * are altered
 * @param paths An optional list of paths to whitelist for rerenders
 * @returns Settings
 */
// TODO: Representing paths as essentially "string[].join('.')" wont allow dots in paths, change to "paths?: string[][]" later
export function useSettings(paths) {
    const [, forceUpdate] = React.useReducer(() => ({}), {});
    useEffect(() => {
        if (paths) {
            paths.forEach(p => SettingsStore.addChangeListener(p, forceUpdate));
            return () => paths.forEach(p => SettingsStore.removeChangeListener(p, forceUpdate));
        }
        else {
            SettingsStore.addGlobalChangeListener(forceUpdate);
            return () => SettingsStore.removeGlobalChangeListener(forceUpdate);
        }
    }, [paths]);
    return SettingsStore.store;
}
export function migratePluginSettings(name, ...oldNames) {
    const { plugins } = SettingsStore.plain;
    if (name in plugins)
        return;
    for (const oldName of oldNames) {
        if (oldName in plugins) {
            logger.info(`Migrating settings from old name ${oldName} to ${name}`);
            plugins[name] = plugins[oldName];
            delete plugins[oldName];
            SettingsStore.markAsChanged();
            break;
        }
    }
}
export function migratePluginSetting(pluginName, oldSetting, newSetting) {
    const settings = SettingsStore.plain.plugins[pluginName];
    if (!settings)
        return;
    if (!Object.hasOwn(settings, oldSetting) || Object.hasOwn(settings, newSetting))
        return;
    settings[newSetting] = settings[oldSetting];
    delete settings[oldSetting];
    SettingsStore.markAsChanged();
}
export function definePluginSettings(def, checks) {
    const definedSettings = {
        get store() {
            if (!definedSettings.pluginName)
                throw new Error("Cannot access settings before plugin is initialized");
            return Settings.plugins[definedSettings.pluginName];
        },
        get plain() {
            if (!definedSettings.pluginName)
                throw new Error("Cannot access settings before plugin is initialized");
            return PlainSettings.plugins[definedSettings.pluginName];
        },
        use: settings => useSettings(settings?.map(name => `plugins.${definedSettings.pluginName}.${name}`)).plugins[definedSettings.pluginName],
        def,
        checks: checks ?? {},
        pluginName: "",
        withPrivateSettings() {
            return this;
        }
    };
    return definedSettings;
}

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
import { runtimeHashMessageKey } from "@utils/intlHash";
// eslint-disable-next-line path-alias/no-relative
import { _resolveReady, filters, findByCodeLazy, findByPropsLazy, findLazy, mapMangledModuleLazy, waitFor } from "../webpack";
export let FluxDispatcher;
waitFor(["dispatch", "subscribe"], m => {
    FluxDispatcher = m;
    // Non import call to avoid circular dependency
    Yuricord.Plugins.subscribeAllPluginsFluxEvents(m);
    const cb = () => {
        m.unsubscribe("CONNECTION_OPEN", cb);
        _resolveReady();
    };
    m.subscribe("CONNECTION_OPEN", cb);
});
export let ComponentDispatch;
waitFor(["dispatchToLastSubscribed"], m => ComponentDispatch = m);
export const Constants = mapMangledModuleLazy('ME:"/users/@me"', {
    Endpoints: filters.byProps("USER", "ME"),
    UserFlags: filters.byProps("STAFF", "SPAMMER"),
    FriendsSections: m => m.PENDING === "PENDING" && m.ADD_FRIEND
});
export const RestAPI = findLazy(m => typeof m === "object" && m.del && m.put);
export const moment = findByPropsLazy("parseTwoDigitYear");
export const hljs = findByPropsLazy("highlight", "registerLanguage");
export const { match, P } = mapMangledModuleLazy("@ts-pattern/matcher", {
    match: filters.byCode("return new"),
    P: filters.byProps("when")
});
export const lodash = findByPropsLazy("debounce", "cloneDeep");
export const i18n = mapMangledModuleLazy('defaultLocale:"en-US"', {
    intl: filters.byProps("string", "format"),
    t: filters.byProps(runtimeHashMessageKey("DISCORD"))
});
export let SnowflakeUtils;
waitFor(["fromTimestamp", "extractTimestamp"], m => SnowflakeUtils = m);
export let Parser;
waitFor("parseTopic", m => Parser = m);
export let Alerts;
waitFor(["show", "close"], m => Alerts = m);
const ToastType = {
    MESSAGE: 0,
    SUCCESS: 1,
    FAILURE: 2,
    CUSTOM: 3
};
const ToastPosition = {
    TOP: 0,
    BOTTOM: 1
};
export const Toasts = {
    Type: ToastType,
    Position: ToastPosition,
    // what's less likely than getting 0 from Math.random()? Getting it twice in a row
    genId: () => (Math.random() || Math.random()).toString(36).slice(2),
    // hack to merge with the following interface, dunno if there's a better way
    ...{}
};
// This is the same module but this is easier
waitFor("showToast", m => {
    Toasts.show = m.showToast;
    Toasts.pop = m.popToast;
    Toasts.create = m.createToast;
});
/**
 * Show a simple toast. If you need more options, use Toasts.show manually
 */
export function showToast(message, type = ToastType.MESSAGE, options) {
    Toasts.show(Toasts.create(message, type, options));
}
export const UserUtils = {
    getUser: findByCodeLazy(".USER(")
};
export const UploadManager = findByPropsLazy("clearAll", "addFile");
export const UploadHandler = {
    promptToUpload: findByCodeLazy("#{intl::ATTACHMENT_TOO_MANY_ERROR_TITLE}")
};
export const ApplicationAssetUtils = findByPropsLazy("fetchAssetIds", "getAssetImage");
export const Clipboard = mapMangledModuleLazy('queryCommandEnabled("copy")', {
    copy: filters.byCode(".copy("),
    SUPPORTS_COPY: e => typeof e === "boolean"
});
export const NavigationRouter = mapMangledModuleLazy("Transitioning to ", {
    transitionTo: filters.byCode("transitionTo -"),
    transitionToGuild: filters.byCode("transitionToGuild -"),
    back: filters.byCode("goBack()"),
    forward: filters.byCode("goForward()"),
});
export const ChannelRouter = mapMangledModuleLazy('"Thread must have a parent ID."', {
    transitionToChannel: filters.byCode(".preload"),
    transitionToThread: filters.byCode('"Thread must have a parent ID."')
});
export let SettingsRouter;
waitFor(["open", "saveAccountChanges"], m => SettingsRouter = m);
export const PermissionsBits = findLazy(m => typeof m.ADMINISTRATOR === "bigint");
export const { zustandCreate } = mapMangledModuleLazy(["useSyncExternalStoreWithSelector:", "Object.assign"], {
    zustandCreate: filters.byCode(/=>(\i)\?\i\(\1/)
});
export const { zustandPersist } = mapMangledModuleLazy(".onRehydrateStorage)?", {
    zustandPersist: filters.byCode(/(\(\i,\i\))=>.+?\i\1/)
});
export const MessageActions = findByPropsLazy("editMessage", "sendMessage");
export const MessageCache = findByPropsLazy("clearCache", "_channelMessages");
export const UserProfileActions = findByPropsLazy("openUserProfileModal", "closeUserProfileModal");
export const InviteActions = findByPropsLazy("resolveInvite");
export const IconUtils = findByPropsLazy("getGuildBannerURL", "getUserAvatarURL");
export const ExpressionPickerStore = mapMangledModuleLazy("expression-picker-last-active-view", {
    openExpressionPicker: filters.byCode(/setState\({activeView:(?:(?!null)\i),activeViewType:/),
    closeExpressionPicker: filters.byCode("setState({activeView:null"),
    toggleMultiExpressionPicker: filters.byCode(".EMOJI,"),
    toggleExpressionPicker: filters.byCode(/getState\(\)\.activeView===\i\?\i\(\):\i\(/),
    setExpressionPickerView: filters.byCode(/setState\({activeView:\i,lastActiveView:/),
    setSearchQuery: filters.byCode("searchQuery:"),
    useExpressionPickerStore: filters.byCode(/\(\i,\i=\i\)=>/)
});
export const PopoutActions = mapMangledModuleLazy('type:"POPOUT_WINDOW_OPEN"', {
    open: filters.byCode('type:"POPOUT_WINDOW_OPEN"'),
    close: filters.byCode('type:"POPOUT_WINDOW_CLOSE"'),
    setAlwaysOnTop: filters.byCode('type:"POPOUT_WINDOW_SET_ALWAYS_ON_TOP"'),
});
export const UsernameUtils = findByPropsLazy("useName", "getGlobalName");
export const DisplayProfileUtils = mapMangledModuleLazy(/=\i\.getUserProfile\(\i\),\i=\i\.getGuildMemberProfile\(/, {
    getDisplayProfile: filters.byCode(".getGuildMemberProfile("),
    useDisplayProfile: filters.byCode(/\[\i\.\i,\i\.\i],\(\)=>/)
});
export const DateUtils = mapMangledModuleLazy("millisecondsInUnit:", {
    calendarFormat: filters.byCode("sameElse"),
    dateFormat: filters.byCode('":'),
    isSameDay: filters.byCode("Math.abs(+"),
    diffAsUnits: filters.byCode("days:0", "millisecondsInUnit")
});

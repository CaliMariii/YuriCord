/*
 * Yuricord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import * as DataStore from "@api/DataStore";
import { Settings } from "@api/Settings";
import { useForceUpdater } from "@utils/react";
import { UserStore } from "@webpack/common";
import { PrivateChannelSortStore, settings } from "./index";
const CATEGORY_BASE_KEY = "PinDMsCategories-";
const CATEGORY_MIGRATED_PINDMS_KEY = "PinDMsMigratedPinDMs";
const CATEGORY_MIGRATED_KEY = "PinDMsMigratedOldCategories";
const OLD_CATEGORY_KEY = "BetterPinDMsCategories-";
let forceUpdateDms = undefined;
export let currentUserCategories = [];
export async function init() {
    await migrateData();
    const userId = UserStore.getCurrentUser()?.id;
    if (userId == null)
        return;
    currentUserCategories = settings.store.userBasedCategoryList[userId] ??= [];
    forceUpdateDms?.();
}
export function usePinnedDms() {
    forceUpdateDms = useForceUpdater();
    settings.use(["pinOrder", "canCollapseDmSection", "dmSectionCollapsed", "userBasedCategoryList"]);
}
export function getCategory(id) {
    return currentUserCategories.find(c => c.id === id);
}
export function getCategoryByIndex(index) {
    return currentUserCategories[index];
}
export function createCategory(category) {
    currentUserCategories.push(category);
}
export function addChannelToCategory(channelId, categoryId) {
    const category = currentUserCategories.find(c => c.id === categoryId);
    if (category == null)
        return;
    if (category.channels.includes(channelId))
        return;
    category.channels.push(channelId);
}
export function removeChannelFromCategory(channelId) {
    const category = currentUserCategories.find(c => c.channels.includes(channelId));
    if (category == null)
        return;
    category.channels = category.channels.filter(c => c !== channelId);
}
export function removeCategory(categoryId) {
    const categoryIndex = currentUserCategories.findIndex(c => c.id === categoryId);
    if (categoryIndex === -1)
        return;
    currentUserCategories.splice(categoryIndex, 1);
}
export function collapseCategory(id, value = true) {
    const category = currentUserCategories.find(c => c.id === id);
    if (category == null)
        return;
    category.collapsed = value;
}
// Utils
export function isPinned(id) {
    return currentUserCategories.some(c => c.channels.includes(id));
}
export function categoryLen() {
    return currentUserCategories.length;
}
export function getAllUncollapsedChannels() {
    if (settings.store.pinOrder === 0 /* PinOrder.LastMessage */) {
        const sortedChannels = PrivateChannelSortStore.getPrivateChannelIds();
        return currentUserCategories.filter(c => !c.collapsed).flatMap(c => sortedChannels.filter(channel => c.channels.includes(channel)));
    }
    return currentUserCategories.filter(c => !c.collapsed).flatMap(c => c.channels);
}
export function getSections() {
    return currentUserCategories.reduce((acc, category) => {
        acc.push(category.channels.length === 0 ? 1 : category.channels.length);
        return acc;
    }, []);
}
// Move categories
export const canMoveArrayInDirection = (array, index, direction) => {
    const a = array[index];
    const b = array[index + direction];
    return a && b;
};
export const canMoveCategoryInDirection = (id, direction) => {
    const categoryIndex = currentUserCategories.findIndex(m => m.id === id);
    return canMoveArrayInDirection(currentUserCategories, categoryIndex, direction);
};
export const canMoveCategory = (id) => canMoveCategoryInDirection(id, -1) || canMoveCategoryInDirection(id, 1);
export const canMoveChannelInDirection = (channelId, direction) => {
    const category = currentUserCategories.find(c => c.channels.includes(channelId));
    if (category == null)
        return false;
    const channelIndex = category.channels.indexOf(channelId);
    return canMoveArrayInDirection(category.channels, channelIndex, direction);
};
function swapElementsInArray(array, index1, index2) {
    if (!array[index1] || !array[index2])
        return;
    [array[index1], array[index2]] = [array[index2], array[index1]];
}
export function moveCategory(id, direction) {
    const a = currentUserCategories.findIndex(m => m.id === id);
    const b = a + direction;
    swapElementsInArray(currentUserCategories, a, b);
}
export function moveChannel(channelId, direction) {
    const category = currentUserCategories.find(c => c.channels.includes(channelId));
    if (category == null)
        return;
    const a = category.channels.indexOf(channelId);
    const b = a + direction;
    swapElementsInArray(category.channels, a, b);
}
// TODO: Remove DataStore PinnedDms migration once enough time has passed
async function migrateData() {
    if (Settings.plugins.PinDMs.dmSectioncollapsed != null) {
        settings.store.dmSectionCollapsed = Settings.plugins.PinDMs.dmSectioncollapsed;
        delete Settings.plugins.PinDMs.dmSectioncollapsed;
    }
    const dataStoreKeys = await DataStore.keys();
    const pinDmsKeys = dataStoreKeys.map(key => String(key)).filter(key => key.startsWith(CATEGORY_BASE_KEY));
    if (pinDmsKeys.length === 0)
        return;
    for (const pinDmsKey of pinDmsKeys) {
        const categories = await DataStore.get(pinDmsKey);
        if (categories == null)
            continue;
        const userId = pinDmsKey.replace(CATEGORY_BASE_KEY, "");
        settings.store.userBasedCategoryList[userId] = categories;
        await DataStore.del(pinDmsKey);
    }
    await Promise.all([DataStore.del(CATEGORY_MIGRATED_PINDMS_KEY), DataStore.del(CATEGORY_MIGRATED_KEY), DataStore.del(OLD_CATEGORY_KEY)]);
}

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
import { DataStore, Notices } from "@api/index";
import { showNotification } from "@api/Notifications";
import { getUniqueUsername, openUserProfile } from "@utils/discord";
import { findStoreLazy } from "@webpack";
import { ChannelStore, GuildMemberStore, GuildStore, RelationshipStore, UserStore, UserUtils } from "@webpack/common";
import settings from "./settings";
export const GuildAvailabilityStore = findStoreLazy("GuildAvailabilityStore");
const guilds = new Map();
const groups = new Map();
const friends = {
    friends: [],
    requests: []
};
const guildsKey = () => `relationship-notifier-guilds-${UserStore.getCurrentUser().id}`;
const groupsKey = () => `relationship-notifier-groups-${UserStore.getCurrentUser().id}`;
const friendsKey = () => `relationship-notifier-friends-${UserStore.getCurrentUser().id}`;
async function runMigrations() {
    DataStore.delMany(["relationship-notifier-guilds", "relationship-notifier-groups", "relationship-notifier-friends"]);
}
export async function syncAndRunChecks() {
    await runMigrations();
    if (UserStore.getCurrentUser() == null)
        return;
    const [oldGuilds, oldGroups, oldFriends] = await DataStore.getMany([
        guildsKey(),
        groupsKey(),
        friendsKey()
    ]);
    await Promise.all([syncGuilds(), syncGroups(), syncFriends()]);
    if (settings.store.offlineRemovals) {
        if (settings.store.groups && oldGroups?.size) {
            for (const [id, group] of oldGroups) {
                if (!groups.has(id))
                    notify(`You are no longer in the group ${group.name}.`, group.iconURL);
            }
        }
        if (settings.store.servers && oldGuilds?.size) {
            for (const [id, guild] of oldGuilds) {
                if (!guilds.has(id) && !GuildAvailabilityStore.isUnavailable(id))
                    notify(`You are no longer in the server ${guild.name}.`, guild.iconURL);
            }
        }
        if (settings.store.friends && oldFriends?.friends.length) {
            for (const id of oldFriends.friends) {
                if (friends.friends.includes(id))
                    continue;
                const user = await UserUtils.getUser(id).catch(() => void 0);
                if (user)
                    notify(`You are no longer friends with ${getUniqueUsername(user)}.`, user.getAvatarURL(undefined, undefined, false), () => openUserProfile(user.id));
            }
        }
        if (settings.store.friendRequestCancels && oldFriends?.requests?.length) {
            for (const id of oldFriends.requests) {
                if (friends.requests.includes(id) ||
                    [1 /* RelationshipType.FRIEND */, 2 /* RelationshipType.BLOCKED */, 4 /* RelationshipType.OUTGOING_REQUEST */].includes(RelationshipStore.getRelationshipType(id)))
                    continue;
                const user = await UserUtils.getUser(id).catch(() => void 0);
                if (user)
                    notify(`Friend request from ${getUniqueUsername(user)} has been revoked.`, user.getAvatarURL(undefined, undefined, false), () => openUserProfile(user.id));
            }
        }
    }
}
export function notify(text, icon, onClick) {
    if (settings.store.notices)
        Notices.showNotice(text, "OK", () => Notices.popNotice());
    showNotification({
        title: "Relationship Notifier",
        body: text,
        icon,
        onClick
    });
}
export function getGuild(id) {
    return guilds.get(id);
}
export function deleteGuild(id) {
    guilds.delete(id);
    syncGuilds();
}
export async function syncGuilds() {
    guilds.clear();
    const me = UserStore.getCurrentUser().id;
    for (const [id, { name, icon }] of Object.entries(GuildStore.getGuilds())) {
        if (GuildMemberStore.isMember(id, me))
            guilds.set(id, {
                id,
                name,
                iconURL: icon && `https://cdn.discordapp.com/icons/${id}/${icon}.png`
            });
    }
    await DataStore.set(guildsKey(), guilds);
}
export function getGroup(id) {
    return groups.get(id);
}
export function deleteGroup(id) {
    groups.delete(id);
    syncGroups();
}
export async function syncGroups() {
    groups.clear();
    for (const { type, id, name, rawRecipients, icon } of ChannelStore.getSortedPrivateChannels()) {
        if (type === 3 /* ChannelType.GROUP_DM */)
            groups.set(id, {
                id,
                name: name || rawRecipients.map(r => r.username).join(", "),
                iconURL: icon && `https://cdn.discordapp.com/channel-icons/${id}/${icon}.png`
            });
    }
    await DataStore.set(groupsKey(), groups);
}
export async function syncFriends() {
    friends.friends = [];
    friends.requests = [];
    const relationShips = RelationshipStore.getRelationships();
    for (const id in relationShips) {
        switch (relationShips[id]) {
            case 1 /* RelationshipType.FRIEND */:
                friends.friends.push(id);
                break;
            case 3 /* RelationshipType.INCOMING_REQUEST */:
                friends.requests.push(id);
                break;
        }
    }
    await DataStore.set(friendsKey(), friends);
}

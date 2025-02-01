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
import { classNameFactory } from "@api/Styles";
import { findByPropsLazy } from "@webpack";
import { GuildStore } from "@webpack/common";
import { settings } from ".";
export const { getGuildPermissionSpecMap } = findByPropsLazy("getGuildPermissionSpecMap");
export const cl = classNameFactory("vc-permviewer-");
export function getSortedRoles({ id }, member) {
    const roles = GuildStore.getRoles(id);
    return [...member.roles, id]
        .map(id => roles[id])
        .sort((a, b) => b.position - a.position);
}
export function sortUserRoles(roles) {
    switch (settings.store.permissionsSortOrder) {
        case 0 /* PermissionsSortOrder.HighestRole */:
            return roles.sort((a, b) => b.position - a.position);
        case 1 /* PermissionsSortOrder.LowestRole */:
            return roles.sort((a, b) => a.position - b.position);
        default:
            return roles;
    }
}
export function sortPermissionOverwrites(overwrites, guildId) {
    const roles = GuildStore.getRoles(guildId);
    return overwrites.sort((a, b) => {
        if (a.type !== 0 /* PermissionType.Role */ || b.type !== 0 /* PermissionType.Role */)
            return 0;
        const roleA = roles[a.id];
        const roleB = roles[b.id];
        return roleB.position - roleA.position;
    });
}

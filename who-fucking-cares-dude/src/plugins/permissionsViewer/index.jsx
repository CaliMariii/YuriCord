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
import "./styles.css";
import { findGroupChildrenByChildId } from "@api/ContextMenu";
import { definePluginSettings } from "@api/Settings";
import ErrorBoundary from "@components/ErrorBoundary";
import { SafetyIcon } from "@components/Icons";
import { Devs } from "@utils/constants";
import { classes } from "@utils/misc";
import definePlugin from "@utils/types";
import { findByPropsLazy } from "@webpack";
import { Button, ChannelStore, Dialog, GuildMemberStore, GuildStore, match, Menu, PermissionsBits, Popout, TooltipContainer, UserStore } from "@webpack/common";
import openRolesAndUsersPermissionsModal from "./components/RolesAndUsersPermissions";
import UserPermissions from "./components/UserPermissions";
import { getSortedRoles, sortPermissionOverwrites } from "./utils";
const PopoutClasses = findByPropsLazy("container", "scroller", "list");
const RoleButtonClasses = findByPropsLazy("button", "buttonInner", "icon", "banner");
export const settings = definePluginSettings({
    permissionsSortOrder: {
        description: "The sort method used for defining which role grants an user a certain permission",
        type: 4 /* OptionType.SELECT */,
        options: [
            { label: "Highest Role", value: 0 /* PermissionsSortOrder.HighestRole */, default: true },
            { label: "Lowest Role", value: 1 /* PermissionsSortOrder.LowestRole */ }
        ]
    },
});
function MenuItem(guildId, id, type) {
    if (type === 0 /* MenuItemParentType.User */ && !GuildMemberStore.isMember(guildId, id))
        return null;
    return (<Menu.MenuItem id="perm-viewer-permissions" label="Permissions" action={() => {
            const guild = GuildStore.getGuild(guildId);
            const { permissions, header } = match(type)
                .returnType()
                .with(0 /* MenuItemParentType.User */, () => {
                const member = GuildMemberStore.getMember(guildId, id);
                const permissions = getSortedRoles(guild, member)
                    .map(role => ({
                    type: 0 /* PermissionType.Role */,
                    ...role
                }));
                if (guild.ownerId === id) {
                    permissions.push({
                        type: 2 /* PermissionType.Owner */,
                        permissions: Object.values(PermissionsBits).reduce((prev, curr) => prev | curr, 0n)
                    });
                }
                return {
                    permissions,
                    header: member.nick ?? UserStore.getUser(member.userId).username
                };
            })
                .with(1 /* MenuItemParentType.Channel */, () => {
                const channel = ChannelStore.getChannel(id);
                const permissions = sortPermissionOverwrites(Object.values(channel.permissionOverwrites).map(({ id, allow, deny, type }) => ({
                    type: type,
                    id,
                    overwriteAllow: allow,
                    overwriteDeny: deny
                })), guildId);
                return {
                    permissions,
                    header: channel.name
                };
            })
                .otherwise(() => {
                const permissions = Object.values(GuildStore.getRoles(guild.id)).map(role => ({
                    type: 0 /* PermissionType.Role */,
                    ...role
                }));
                return {
                    permissions,
                    header: guild.name
                };
            });
            openRolesAndUsersPermissionsModal(permissions, guild, header);
        }}/>);
}
function makeContextMenuPatch(childId, type) {
    return (children, props) => {
        if (!props ||
            (type === 0 /* MenuItemParentType.User */ && !props.user) ||
            (type === 2 /* MenuItemParentType.Guild */ && !props.guild) ||
            (type === 1 /* MenuItemParentType.Channel */ && (!props.channel || !props.guild))) {
            return;
        }
        const group = findGroupChildrenByChildId(childId, children);
        const item = match(type)
            .with(0 /* MenuItemParentType.User */, () => MenuItem(props.guildId, props.user.id, type))
            .with(1 /* MenuItemParentType.Channel */, () => MenuItem(props.guild.id, props.channel.id, type))
            .with(2 /* MenuItemParentType.Guild */, () => MenuItem(props.guild.id))
            .otherwise(() => null);
        if (item == null)
            return;
        if (group) {
            return group.push(item);
        }
        // "roles" may not be present due to the member not having any roles. In that case, add it above "Copy ID"
        if (childId === "roles" && props.guildId) {
            children.splice(-1, 0, <Menu.MenuGroup>{item}</Menu.MenuGroup>);
        }
    };
}
export default definePlugin({
    name: "PermissionsViewer",
    description: "View the permissions a user or channel has, and the roles of a server",
    authors: [Devs.Nuckyz, Devs.Ven],
    settings,
    patches: [
        {
            find: "#{intl::VIEW_ALL_ROLES}",
            replacement: {
                match: /\.expandButton,.+?null,/,
                replace: "$&$self.ViewPermissionsButton(arguments[0]),"
            }
        }
    ],
    ViewPermissionsButton: ErrorBoundary.wrap(({ guild, guildMember }) => (<Popout position="bottom" align="center" renderPopout={({ closePopout }) => (<Dialog className={PopoutClasses.container} style={{ width: "500px" }}>
                    <UserPermissions guild={guild} guildMember={guildMember} closePopout={closePopout}/>
                </Dialog>)}>
            {popoutProps => (<TooltipContainer text="View Permissions">
                    <Button {...popoutProps} color={Button.Colors.CUSTOM} look={Button.Looks.FILLED} size={Button.Sizes.NONE} innerClassName={classes(RoleButtonClasses.buttonInner, RoleButtonClasses.icon)} className={classes(RoleButtonClasses.button, RoleButtonClasses.icon, "vc-permviewer-role-button")}>
                        <SafetyIcon height="16" width="16"/>
                    </Button>
                </TooltipContainer>)}
        </Popout>), { noop: true }),
    contextMenus: {
        "user-context": makeContextMenuPatch("roles", 0 /* MenuItemParentType.User */),
        "channel-context": makeContextMenuPatch(["mute-channel", "unmute-channel"], 1 /* MenuItemParentType.Channel */),
        "guild-context": makeContextMenuPatch("privacy", 2 /* MenuItemParentType.Guild */),
        "guild-header-popout": makeContextMenuPatch("privacy", 2 /* MenuItemParentType.Guild */)
    }
});

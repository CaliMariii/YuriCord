/*
 * Yuricord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import "./styles.css";
import { classNameFactory } from "@api/Styles";
import { openImageModal, openUserProfile } from "@utils/discord";
import { classes } from "@utils/misc";
import { ModalRoot, openModal } from "@utils/modal";
import { useAwaiter } from "@utils/react";
import { findByPropsLazy, findComponentByCodeLazy } from "@webpack";
import { FluxDispatcher, Forms, GuildChannelStore, GuildMemberStore, GuildStore, IconUtils, Parser, PresenceStore, RelationshipStore, ScrollerThin, SnowflakeUtils, TabBar, Timestamp, useEffect, UserStore, UserUtils, useState, useStateFromStores } from "@webpack/common";
const IconClasses = findByPropsLazy("icon", "acronym", "childWrapper");
const FriendRow = findComponentByCodeLazy(".listName,discriminatorClass");
const cl = classNameFactory("vc-gp-");
export function openGuildInfoModal(guild) {
    openModal(props => <ModalRoot {...props} size={"medium" /* ModalSize.MEDIUM */}>
            <GuildInfoModal guild={guild}/>
        </ModalRoot>);
}
const fetched = {
    friends: false,
    blocked: false,
    ignored: false
};
function renderTimestamp(timestamp) {
    return (<Timestamp timestamp={new Date(timestamp)}/>);
}
function GuildInfoModal({ guild }) {
    const [friendCount, setFriendCount] = useState();
    const [blockedCount, setBlockedCount] = useState();
    const [ignoredCount, setIgnoredCount] = useState();
    useEffect(() => {
        fetched.friends = false;
        fetched.blocked = false;
        fetched.ignored = false;
    }, []);
    const [currentTab, setCurrentTab] = useState(0 /* Tabs.ServerInfo */);
    const bannerUrl = guild.banner && IconUtils.getGuildBannerURL(guild, true).replace(/\?size=\d+$/, "?size=1024");
    const iconUrl = guild.icon && IconUtils.getGuildIconURL({
        id: guild.id,
        icon: guild.icon,
        canAnimate: true,
        size: 512
    });
    return (<div className={cl("root")}>
            {bannerUrl && currentTab === 0 /* Tabs.ServerInfo */ && (<img className={cl("banner")} src={bannerUrl} alt="" onClick={() => openImageModal({
                url: bannerUrl,
                width: 1024
            })}/>)}

            <div className={cl("header")}>
                {iconUrl
            ? <img src={iconUrl} alt="" onClick={() => openImageModal({
                    url: iconUrl,
                    height: 512,
                    width: 512,
                })}/>
            : <div aria-hidden className={classes(IconClasses.childWrapper, IconClasses.acronym)}>{guild.acronym}</div>}

                <div className={cl("name-and-description")}>
                    <Forms.FormTitle tag="h5" className={cl("name")}>{guild.name}</Forms.FormTitle>
                    {guild.description && <Forms.FormText>{guild.description}</Forms.FormText>}
                </div>
            </div>

            <TabBar type="top" look="brand" className={cl("tab-bar")} selectedItem={currentTab} onItemSelect={setCurrentTab}>
                <TabBar.Item className={cl("tab", { selected: currentTab === 0 /* Tabs.ServerInfo */ })} id={0 /* Tabs.ServerInfo */}>
                    Server Info
                </TabBar.Item>
                <TabBar.Item className={cl("tab", { selected: currentTab === 1 /* Tabs.Friends */ })} id={1 /* Tabs.Friends */}>
                    Friends{friendCount !== undefined ? ` (${friendCount})` : ""}
                </TabBar.Item>
                <TabBar.Item className={cl("tab", { selected: currentTab === 2 /* Tabs.BlockedUsers */ })} id={2 /* Tabs.BlockedUsers */}>
                    Blocked Users{blockedCount !== undefined ? ` (${blockedCount})` : ""}
                </TabBar.Item>
                <TabBar.Item className={cl("tab", { selected: currentTab === 3 /* Tabs.IgnoredUsers */ })} id={3 /* Tabs.IgnoredUsers */}>
                    Ignored Users{ignoredCount !== undefined ? ` (${ignoredCount})` : ""}
                </TabBar.Item>
            </TabBar>

            <div className={cl("tab-content")}>
                {currentTab === 0 /* Tabs.ServerInfo */ && <ServerInfoTab guild={guild}/>}
                {currentTab === 1 /* Tabs.Friends */ && <FriendsTab guild={guild} setCount={setFriendCount}/>}
                {currentTab === 2 /* Tabs.BlockedUsers */ && <BlockedUsersTab guild={guild} setCount={setBlockedCount}/>}
                {currentTab === 3 /* Tabs.IgnoredUsers */ && <IgnoredUserTab guild={guild} setCount={setIgnoredCount}/>}
            </div>
        </div>);
}
function Owner(guildId, owner) {
    const guildAvatar = GuildMemberStore.getMember(guildId, owner.id)?.avatar;
    const ownerAvatarUrl = guildAvatar
        ? IconUtils.getGuildMemberAvatarURLSimple({
            userId: owner.id,
            avatar: guildAvatar,
            guildId,
            canAnimate: true
        })
        : IconUtils.getUserAvatarURL(owner, true);
    return (<div className={cl("owner")}>
            <img src={ownerAvatarUrl} alt="" onClick={() => openImageModal({
            url: ownerAvatarUrl,
            height: 512,
            width: 512
        })}/>
            {Parser.parse(`<@${owner.id}>`)}
        </div>);
}
function ServerInfoTab({ guild }) {
    const [owner] = useAwaiter(() => UserUtils.getUser(guild.ownerId), {
        deps: [guild.ownerId],
        fallbackValue: null
    });
    const Fields = {
        "Server Owner": owner ? Owner(guild.id, owner) : "Loading...",
        "Created At": renderTimestamp(SnowflakeUtils.extractTimestamp(guild.id)),
        "Joined At": guild.joinedAt ? renderTimestamp(guild.joinedAt.getTime()) : "-", // Not available in lurked guild
        "Vanity Link": guild.vanityURLCode ? (<a>{`discord.gg/${guild.vanityURLCode}`}</a>) : "-", // Making the anchor href valid would cause Discord to reload
        "Preferred Locale": guild.preferredLocale || "-",
        "Verification Level": ["None", "Low", "Medium", "High", "Highest"][guild.verificationLevel] || "?",
        "Nitro Boosts": `${guild.premiumSubscriberCount ?? 0} (Level ${guild.premiumTier ?? 0})`,
        "Channels": GuildChannelStore.getChannels(guild.id)?.count - 1 || "?", // - null category
        "Roles": Object.keys(GuildStore.getRoles(guild.id)).length - 1, // - @everyone
    };
    return (<div className={cl("info")}>
            {Object.entries(Fields).map(([name, node]) => <div className={cl("server-info-pair")} key={name}>
                    <Forms.FormTitle tag="h5">{name}</Forms.FormTitle>
                    {typeof node === "string" ? <span>{node}</span> : node}
                </div>)}
        </div>);
}
function FriendsTab({ guild, setCount }) {
    return UserList("friends", guild, RelationshipStore.getFriendIDs(), setCount);
}
function BlockedUsersTab({ guild, setCount }) {
    const blockedIds = Object.keys(RelationshipStore.getRelationships()).filter(id => RelationshipStore.isBlocked(id));
    return UserList("blocked", guild, blockedIds, setCount);
}
function IgnoredUserTab({ guild, setCount }) {
    const ignoredIds = Object.keys(RelationshipStore.getRelationships()).filter(id => RelationshipStore.isIgnored(id));
    return UserList("ignored", guild, ignoredIds, setCount);
}
function UserList(type, guild, ids, setCount) {
    const missing = [];
    const members = [];
    for (const id of ids) {
        if (GuildMemberStore.isMember(guild.id, id))
            members.push(id);
        else
            missing.push(id);
    }
    // Used for side effects (rerender on member request success)
    useStateFromStores([GuildMemberStore], () => GuildMemberStore.getMemberIds(guild.id), null, (old, curr) => old.length === curr.length);
    useEffect(() => {
        if (!fetched[type] && missing.length) {
            fetched[type] = true;
            FluxDispatcher.dispatch({
                type: "GUILD_MEMBERS_REQUEST",
                guildIds: [guild.id],
                userIds: missing
            });
        }
    }, []);
    useEffect(() => setCount(members.length), [members.length]);
    return (<ScrollerThin fade className={cl("scroller")}>
            {members.map(id => <FriendRow key={id} user={UserStore.getUser(id)} status={PresenceStore.getStatus(id) || "offline"} onSelect={() => openUserProfile(id)} onContextMenu={() => { }}/>)}
        </ScrollerThin>);
}

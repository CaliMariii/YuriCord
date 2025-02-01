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
import { definePluginSettings, Settings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { findByPropsLazy } from "@webpack";
import { ChannelStore, ComponentDispatch, FluxDispatcher as Dispatcher, MessageStore, PermissionsBits, PermissionStore, SelectedChannelStore, UserStore } from "@webpack/common";
const Kangaroo = findByPropsLazy("jumpToMessage");
const RelationshipStore = findByPropsLazy("getRelationships", "isBlocked");
const isMac = navigator.platform.includes("Mac"); // bruh
let replyIdx = -1;
let editIdx = -1;
const settings = definePluginSettings({
    shouldMention: {
        type: 4 /* OptionType.SELECT */,
        description: "Ping reply by default",
        options: [
            {
                label: "Follow NoReplyMention",
                value: 2 /* MentionOptions.NO_REPLY_MENTION_PLUGIN */,
                default: true
            },
            { label: "Enabled", value: 1 /* MentionOptions.ENABLED */ },
            { label: "Disabled", value: 0 /* MentionOptions.DISABLED */ },
        ]
    }
});
export default definePlugin({
    name: "QuickReply",
    authors: [Devs.fawn, Devs.Ven, Devs.pylix],
    description: "Reply to (ctrl + up/down) and edit (ctrl + shift + up/down) messages via keybinds",
    settings,
    start() {
        document.addEventListener("keydown", onKeydown);
    },
    stop() {
        document.removeEventListener("keydown", onKeydown);
    },
    flux: {
        DELETE_PENDING_REPLY() {
            replyIdx = -1;
        },
        MESSAGE_END_EDIT() {
            editIdx = -1;
        },
        MESSAGE_START_EDIT: onStartEdit,
        CREATE_PENDING_REPLY: onCreatePendingReply
    }
});
function calculateIdx(messages, id) {
    const idx = messages.findIndex(m => m.id === id);
    return idx === -1
        ? idx
        : messages.length - idx - 1;
}
function onStartEdit({ channelId, messageId, _isQuickEdit }) {
    if (_isQuickEdit)
        return;
    const meId = UserStore.getCurrentUser().id;
    const messages = MessageStore.getMessages(channelId)._array.filter(m => m.author.id === meId);
    editIdx = calculateIdx(messages, messageId);
}
function onCreatePendingReply({ message, _isQuickReply }) {
    if (_isQuickReply)
        return;
    replyIdx = calculateIdx(MessageStore.getMessages(message.channel_id)._array, message.id);
}
const isCtrl = (e) => isMac ? e.metaKey : e.ctrlKey;
const isAltOrMeta = (e) => e.altKey || (!isMac && e.metaKey);
function onKeydown(e) {
    const isUp = e.key === "ArrowUp";
    if (!isUp && e.key !== "ArrowDown")
        return;
    if (!isCtrl(e) || isAltOrMeta(e))
        return;
    e.preventDefault();
    if (e.shiftKey)
        nextEdit(isUp);
    else
        nextReply(isUp);
}
function jumpIfOffScreen(channelId, messageId) {
    const element = document.getElementById("message-content-" + messageId);
    if (!element)
        return;
    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight);
    const rect = element.getBoundingClientRect();
    const isOffscreen = rect.bottom < 200 || rect.top - vh >= -200;
    if (isOffscreen) {
        Kangaroo.jumpToMessage({
            channelId,
            messageId,
            flash: false,
            jumpType: "INSTANT"
        });
    }
}
function getNextMessage(isUp, isReply) {
    let messages = MessageStore.getMessages(SelectedChannelStore.getChannelId())._array;
    if (!isReply) { // we are editing so only include own
        const meId = UserStore.getCurrentUser().id;
        messages = messages.filter(m => m.author.id === meId);
    }
    if (Yuricord.Plugins.isPluginEnabled("NoBlockedMessages")) {
        messages = messages.filter(m => !RelationshipStore.isBlocked(m.author.id));
    }
    const mutate = (i) => isUp
        ? Math.min(messages.length - 1, i + 1)
        : Math.max(-1, i - 1);
    const findNextNonDeleted = (i) => {
        do {
            i = mutate(i);
        } while (i !== -1 && messages[messages.length - i - 1]?.deleted === true);
        return i;
    };
    let i;
    if (isReply)
        replyIdx = i = findNextNonDeleted(replyIdx);
    else
        editIdx = i = findNextNonDeleted(editIdx);
    return i === -1 ? undefined : messages[messages.length - i - 1];
}
function shouldMention(message) {
    const { enabled, userList, shouldPingListed } = Settings.plugins.NoReplyMention;
    const shouldPing = !enabled || (shouldPingListed === userList.includes(message.author.id));
    switch (settings.store.shouldMention) {
        case 2 /* MentionOptions.NO_REPLY_MENTION_PLUGIN */: return shouldPing;
        case 0 /* MentionOptions.DISABLED */: return false;
        default: return true;
    }
}
// handle next/prev reply
function nextReply(isUp) {
    const currChannel = ChannelStore.getChannel(SelectedChannelStore.getChannelId());
    if (currChannel.guild_id && !PermissionStore.can(PermissionsBits.SEND_MESSAGES, currChannel))
        return;
    const message = getNextMessage(isUp, true);
    if (!message)
        return void Dispatcher.dispatch({
            type: "DELETE_PENDING_REPLY",
            channelId: SelectedChannelStore.getChannelId(),
        });
    const channel = ChannelStore.getChannel(message.channel_id);
    const meId = UserStore.getCurrentUser().id;
    Dispatcher.dispatch({
        type: "CREATE_PENDING_REPLY",
        channel,
        message,
        shouldMention: shouldMention(message),
        showMentionToggle: !channel.isPrivate() && message.author.id !== meId,
        _isQuickReply: true
    });
    ComponentDispatch.dispatchToLastSubscribed("TEXTAREA_FOCUS");
    jumpIfOffScreen(channel.id, message.id);
}
// handle next/prev edit
function nextEdit(isUp) {
    const currChannel = ChannelStore.getChannel(SelectedChannelStore.getChannelId());
    if (currChannel.guild_id && !PermissionStore.can(PermissionsBits.SEND_MESSAGES, currChannel))
        return;
    const message = getNextMessage(isUp, false);
    if (!message)
        return Dispatcher.dispatch({
            type: "MESSAGE_END_EDIT",
            channelId: SelectedChannelStore.getChannelId()
        });
    Dispatcher.dispatch({
        type: "MESSAGE_START_EDIT",
        channelId: message.channel_id,
        messageId: message.id,
        content: message.content,
        _isQuickEdit: true
    });
    jumpIfOffScreen(message.channel_id, message.id);
}

/*
 * Yuricord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { MessageCache, MessageStore } from "@webpack/common";
/**
 * Update and re-render a message
 * @param channelId The channel id of the message
 * @param messageId The message id
 * @param fields The fields of the message to change. Leave empty if you just want to re-render
 */
export function updateMessage(channelId, messageId, fields) {
    const channelMessageCache = MessageCache.getOrCreate(channelId);
    if (!channelMessageCache.has(messageId))
        return;
    // To cause a message to re-render, we basically need to create a new instance of the message and obtain a new reference
    // If we have fields to modify we can use the merge method of the class, otherwise we just create a new instance with the old fields
    const newChannelMessageCache = channelMessageCache.update(messageId, (oldMessage) => {
        return fields ? oldMessage.merge(fields) : new oldMessage.constructor(oldMessage);
    });
    MessageCache.commit(newChannelMessageCache);
    MessageStore.emitChange();
}

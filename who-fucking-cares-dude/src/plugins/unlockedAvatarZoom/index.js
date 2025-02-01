/*
 * Yuricord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { definePluginSettings } from "@api/Settings";
import { makeRange } from "@components/PluginSettings/components";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
const settings = definePluginSettings({
    zoomMultiplier: {
        type: 5 /* OptionType.SLIDER */,
        description: "Zoom multiplier",
        markers: makeRange(2, 16),
        default: 4,
    },
});
export default definePlugin({
    name: "UnlockedAvatarZoom",
    description: "Allows you to zoom in further in the image crop tool when changing your avatar",
    authors: [Devs.nakoyasha],
    settings,
    patches: [
        {
            find: "#{intl::AVATAR_UPLOAD_EDIT_MEDIA}",
            replacement: {
                match: /maxValue:\d/,
                replace: "maxValue:$self.settings.store.zoomMultiplier",
            }
        }
    ]
});

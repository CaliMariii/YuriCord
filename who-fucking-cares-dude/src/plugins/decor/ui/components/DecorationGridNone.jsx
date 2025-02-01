/*
 * Yuricord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { NoEntrySignIcon } from "@components/Icons";
import { getIntlMessage } from "@utils/discord";
import { Text } from "@webpack/common";
import { DecorationGridItem } from ".";
export default function DecorationGridNone(props) {
    return <DecorationGridItem {...props}>
        <NoEntrySignIcon />
        <Text variant="text-xs/normal" color="header-primary">
            {getIntlMessage("NONE")}
        </Text>
    </DecorationGridItem>;
}

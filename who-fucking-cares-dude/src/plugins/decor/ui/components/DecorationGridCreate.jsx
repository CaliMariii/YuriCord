/*
 * Yuricord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { PlusIcon } from "@components/Icons";
import { getIntlMessage } from "@utils/discord";
import { Text } from "@webpack/common";
import { DecorationGridItem } from ".";
export default function DecorationGridCreate(props) {
    return <DecorationGridItem {...props} isSelected={false}>
        <PlusIcon />
        <Text variant="text-xs/normal" color="header-primary">
            {getIntlMessage("CREATE")}
        </Text>
    </DecorationGridItem>;
}

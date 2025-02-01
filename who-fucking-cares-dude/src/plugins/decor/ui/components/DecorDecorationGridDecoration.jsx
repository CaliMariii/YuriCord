/*
 * Yuricord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { ContextMenuApi } from "@webpack/common";
import { decorationToAvatarDecoration } from "../../lib/utils/decoration";
import { DecorationGridDecoration } from ".";
import DecorationContextMenu from "./DecorationContextMenu";
export default function DecorDecorationGridDecoration(props) {
    const { decoration } = props;
    return <DecorationGridDecoration {...props} onContextMenu={e => {
            ContextMenuApi.openContextMenu(e, () => (<DecorationContextMenu decoration={decoration}/>));
        }} avatarDecoration={decorationToAvatarDecoration(decoration)}/>;
}

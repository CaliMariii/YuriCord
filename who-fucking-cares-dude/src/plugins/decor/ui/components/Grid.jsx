/*
 * Yuricord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { React } from "@webpack/common";
import { cl } from "../";
export default function Grid({ renderItem, getItemKey, itemKeyPrefix: ikp, items }) {
    return <div className={cl("sectioned-grid-list-grid")}>
        {items.map(item => <React.Fragment key={`${ikp ? `${ikp}-` : ""}${getItemKey(item)}`}>
                {renderItem(item)}
            </React.Fragment>)}
    </div>;
}

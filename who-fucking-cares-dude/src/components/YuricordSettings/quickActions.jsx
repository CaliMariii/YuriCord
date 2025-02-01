/*
 * Yuricord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import "./quickActions.css";
import { classNameFactory } from "@api/Styles";
import { Card } from "@webpack/common";
const cl = classNameFactory("vc-settings-quickActions-");
export function QuickAction(props) {
    const { Icon, action, text, disabled } = props;
    return (<button className={cl("pill")} onClick={action} disabled={disabled}>
            <Icon className={cl("img")}/>
            {text}
        </button>);
}
export function QuickActionCard(props) {
    return (<Card className={cl("card")}>
            {props.children}
        </Card>);
}

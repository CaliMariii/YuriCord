/*
 * Yuricord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import "./ChatButton.css";
import ErrorBoundary from "@components/ErrorBoundary";
import { Logger } from "@utils/Logger";
import { waitFor } from "@webpack";
import { Button, ButtonWrapperClasses, Tooltip } from "@webpack/common";
let ChannelTextAreaClasses;
waitFor(["buttonContainer", "channelTextArea"], m => ChannelTextAreaClasses = m);
const buttonFactories = new Map();
const logger = new Logger("ChatButtons");
export function _injectButtons(buttons, props) {
    if (props.disabled)
        return;
    for (const [key, Button] of buttonFactories) {
        buttons.push(<ErrorBoundary noop key={key} onError={e => logger.error(`Failed to render ${key}`, e.error)}>
                <Button {...props} isMainChat={props.type.analyticsName === "normal"}/>
            </ErrorBoundary>);
    }
}
export const addChatBarButton = (id, button) => buttonFactories.set(id, button);
export const removeChatBarButton = (id) => buttonFactories.delete(id);
export const ChatBarButton = ErrorBoundary.wrap((props) => {
    return (<Tooltip text={props.tooltip}>
            {({ onMouseEnter, onMouseLeave }) => (<div className={`expression-picker-chat-input-button ${ChannelTextAreaClasses?.buttonContainer ?? ""} vc-chatbar-button`}>
                    <Button aria-label={props.tooltip} size="" look={Button.Looks.BLANK} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} innerClassName={`${ButtonWrapperClasses.button} ${ChannelTextAreaClasses?.button}`} onClick={props.onClick} onContextMenu={props.onContextMenu} onAuxClick={props.onAuxClick} {...props.buttonProps}>
                        <div className={ButtonWrapperClasses.buttonWrapper}>
                            {props.children}
                        </div>
                    </Button>
                </div>)}
        </Tooltip>);
}, { noop: true });

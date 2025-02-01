/*
 * Yuricord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
export let EXTENSION_BASE_URL;
export let EXTENSION_VERSION;
if (IS_EXTENSION) {
    const listener = (e) => {
        if (e.data?.type === "Yuricord:meta") {
            ({ EXTENSION_BASE_URL, EXTENSION_VERSION } = e.data.meta);
            window.removeEventListener("message", listener);
        }
    };
    window.addEventListener("message", listener);
}

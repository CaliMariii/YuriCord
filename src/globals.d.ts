/*
 * Yuricord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

// globals.d.ts

declare module "@api/PluginApi" {
    export function definePlugin(plugin: {
        name: string;
        description: string;
        authors: { name: string; }[];
        start(): void;
        stop(): void;
        settingsPanel?: () => JSX.Element;
    }): any;
}

declare module "@modules" {
    export const Logger: {
        log(...args: any[]): void;
        warn(...args: any[]): void;
        error(...args: any[]): void;
    };

    export const Patcher: {
        after(
            module: any,
            methodName: string,
            callback: (thisObject: any, args: any[], returnValue: any) => any
        ): void;
        unpatchAll(): void;
    };

    export const Webpack: {
        findByProps(...props: string[]): any;
        findByDisplayName(displayName: string): any;
        addStyle(styles: string): void;
    };
}



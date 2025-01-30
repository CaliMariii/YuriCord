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
    export const React: typeof import("react");
    export const Webpack: {
        findByDisplayName(displayName: string): any;
        findBySource(source: string): any;
        addStyle(styles: string): void;
        findByProps(...props: string[]): any;
    };
    export const Patcher: {
        after(
            module: any,
            methodName: string,
            callback: (thisObject: any, args: any[], returnValue: any) => any
        ): void;
        unpatchAll(): void;
    };
    export const Logger: {
        log(...args: any[]): void;
        warn(...args: any[]): void;
        error(...args: any[]): void;
    };
}

declare module "@webpack/*" {
    export const findByProps: (...props: string[]) => any;
    export const findByDisplayName: (displayName: string) => any;
    export const findModule: (filter: (module: any) => boolean) => any;
}

// Add any other custom declarations below if needed...

import * as fs from "fs";
import * as path from "path";

/**
 * Applies a patch to the app directory.
 * @param appPath The path to the app directory to patch.
 */
export function applyPatch(appPath: string): void {
    try {
        const bootstrapPath = path.join(appPath, "index.js");

        if (!fs.existsSync(bootstrapPath)) {
            console.error(`[Yuricord] Bootstrap file not found at ${bootstrapPath}.`);
            return;
        }

        console.log(`[Yuricord] Patching ${bootstrapPath}...`);

        const content = fs.readFileSync(bootstrapPath, "utf-8");
        const modifiedContent = `
            // Injected by Yuricord
            try {
                require("./yuricord/loader.js");
            } catch (err) {
                console.error("[Yuricord] Failed to load Yuricord:", err);
            }
            ${content}
        `;

        fs.writeFileSync(bootstrapPath, modifiedContent, "utf-8");
        console.log("[Yuricord] Successfully patched the bootstrap file.");
    } catch (error) {
        console.error("[Yuricord] Failed to apply patch:", error);
    }
}

/**
 * High-level function to patch the app directory.
 * @param appPath The path to the app directory.
 */
export function patchApp(appPath: string): void {
    if (!fs.existsSync(appPath)) {
        console.error(`[Yuricord] The app directory ${appPath} does not exist.`);
        return;
    }

    console.log(`[Yuricord] Starting patch process for ${appPath}...`);
    applyPatch(appPath);
    console.log(`[Yuricord] Patching process completed.`);
}

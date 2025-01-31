const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");

// Discord installation paths
const DISCORD_PATHS = [
    { name: "Discord Stable", path: path.join(process.env.APPDATA, "Discord") },
    { name: "Discord PTB", path: path.join(process.env.APPDATA, "DiscordPTB") },
    { name: "Discord Canary", path: path.join(process.env.APPDATA, "DiscordCanary") }
];

// Function to check if a directory exists
function directoryExists(dir) {
    return fs.existsSync(dir);
}

// Function to uninstall Yuricord
function uninstallYuricord(discordPath) {
    const targetDir = path.join(discordPath, "resources", "Yuricord");
    if (directoryExists(targetDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true });
        console.log(`✅ Yuricord uninstalled from ${discordPath}`);
    } else {
        console.log(`ℹ️ Yuricord was not found in ${discordPath}`);
    }
}

// Function to restore original app.asar
function restoreAppAsar(discordPath) {
    const asarPath = path.join(discordPath, "resources", "app.asar");
    const backupPath = path.join(discordPath, "resources", "app.asar.backup");

    if (fs.existsSync(backupPath)) {
        fs.renameSync(backupPath, asarPath);
        console.log("✅ Restored original app.asar.");
    } else {
        console.log("ℹ️ No backup found for app.asar.");
    }
}

// Interactive CLI menu
async function mainMenu() {
    const availableDiscords = DISCORD_PATHS.filter(({ path }) => directoryExists(path));
    if (availableDiscords.length === 0) {
        console.log("❌ No Discord installations found.");
        return;
    }

    const { discordPath } = await inquirer.prompt([
        {
            type: "list",
            name: "discordPath",
            message: "Select the Discord installation to uninject from:",
            choices: availableDiscords.map(({ name, path }) => ({ name, value: path }))
        }
    ]);

    // Ask whether to restore app.asar if OpenAsar was installed
    const { restoreAsar } = await inquirer.prompt([
        {
            type: "confirm",
            name: "restoreAsar",
            message: "Do you want to restore the original app.asar file?",
            default: true
        }
    ]);

    // Perform uninstallation steps
    uninstallYuricord(discordPath);
    if (restoreAsar) restoreAppAsar(discordPath);

    console.log("✅ Uninjection process complete!");
}

// Run the interactive uninject script
mainMenu();

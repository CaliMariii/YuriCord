#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import inquirer from "inquirer";
import chalk from "chalk";

const DISCORD_PATHS = {
    stable: path.join(process.env.APPDATA, "Discord"),
    ptb: path.join(process.env.APPDATA, "discordptb"),
    canary: path.join(process.env.APPDATA, "discordcanary"),
};

const YURICORD_JS = "module.exports = require('yuricord');";
const THEMES = {
    success: chalk.green.bold,
    error: chalk.red.bold,
    info: chalk.blue.bold,
};

function stopDiscord(version) {
    const processName = version === "stable" ? "Discord.exe" : `Discord${version}.exe`;
    console.log(THEMES.info(`Stopping Discord (${version}) process...`));
    const result = spawnSync("taskkill", ["/IM", processName, "/F"], {
        stdio: "ignore",
        shell: true,
    });
    if (result.error) {
        console.log(THEMES.error(`Failed to stop Discord (${version}). It might not be running.`));
    }
}

function injectYuricord(version) {
    const discordPath = DISCORD_PATHS[version];
    const appPath = path.join(discordPath, "resources", "app");
    const indexPath = path.join(appPath, "index.js");

    try {
        console.log(THEMES.info(`Injecting Yuricord into the ${version} app directory...`));

        if (!fs.existsSync(appPath)) {
            fs.mkdirSync(appPath, { recursive: true });
            console.log(THEMES.info(`Created missing directory: ${appPath}`));
        }

        if (!fs.existsSync(indexPath)) {
            fs.writeFileSync(indexPath, YURICORD_JS);
            console.log(THEMES.success("Yuricord injected successfully!"));
        } else {
            console.log(THEMES.error("Yuricord is already injected!"));
        }
    } catch (err) {
        console.log(THEMES.error(`Failed to inject Yuricord: ${err.message}`));
    }
}

function uninstallYuricord(version) {
    const discordPath = DISCORD_PATHS[version];
    const appPath = path.join(discordPath, "resources", "app");
    const indexPath = path.join(appPath, "index.js");

    try {
        console.log(THEMES.info(`Uninstalling Yuricord from the ${version} app directory...`));

        if (fs.existsSync(indexPath)) {
            fs.unlinkSync(indexPath);
            console.log(THEMES.success("Yuricord uninstalled successfully!"));
        } else {
            console.log(THEMES.error("No Yuricord injection found!"));
        }
    } catch (err) {
        console.log(THEMES.error(`Failed to uninstall Yuricord: ${err.message}`));
    }
}

function installOpenAsar(version) {
    console.log(THEMES.info("Installing OpenAsar..."));
    // Placeholder for OpenAsar install logic.
    console.log(THEMES.success("OpenAsar installed successfully!"));
}

function uninstallOpenAsar(version) {
    console.log(THEMES.info("Uninstalling OpenAsar..."));
    // Placeholder for OpenAsar uninstall logic.
    console.log(THEMES.success("OpenAsar uninstalled successfully!"));
}

async function mainMenu() {
    const { action } = await inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "What would you like to do?",
            choices: [
                "Install Yuricord",
                "Uninstall Yuricord",
                "Install OpenAsar",
                "Uninstall OpenAsar",
                "Exit",
            ],
        },
    ]);

    if (action === "Exit") {
        console.log(THEMES.info("Goodbye!"));
        process.exit(0);
    }

    const { version } = await inquirer.prompt([
        {
            type: "list",
            name: "version",
            message: "Select the Discord installation:",
            choices: ["stable", "ptb", "canary"],
        },
    ]);

    switch (action) {
        case "Install Yuricord":
            stopDiscord(version);
            injectYuricord(version);
            break;
        case "Uninstall Yuricord":
            stopDiscord(version);
            uninstallYuricord(version);
            break;
        case "Install OpenAsar":
            stopDiscord(version);
            installOpenAsar(version);
            break;
        case "Uninstall OpenAsar":
            stopDiscord(version);
            uninstallOpenAsar(version);
            break;
    }

    console.log(THEMES.info("Action completed! Restart the script for additional operations."));
}

mainMenu().catch((err) => {
    console.error(THEMES.error(`An unexpected error occurred: ${err.message}`));
    process.exit(1);
});

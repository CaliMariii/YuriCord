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

const THEMES = {
    success: chalk.green.bold,
    error: chalk.red.bold,
    info: chalk.blue.bold,
    warning: chalk.yellow.bold,
};

function clearConsole() {
    console.clear();
}

function stopDiscord(version) {
    clearConsole();
    console.log(THEMES.info(`🔄 Stopping Discord (${version}) process...`));
    const processName = version === "stable" ? "Discord.exe" : `Discord${version}.exe`;

    const result = spawnSync("taskkill", ["/IM", processName, "/F"], {
        stdio: "ignore",
        shell: true,
    });

    if (result.error) {
        console.log(THEMES.warning(`⚠ No running Discord (${version}) process found.`));
    } else {
        console.log(THEMES.success(`✅ Discord (${version}) stopped successfully!`));
    }
}

function injectLoader(version) {
    clearConsole();
    console.log(THEMES.info(`🚀 Injecting Yuricord into ${version}...`));

    const discordPath = DISCORD_PATHS[version];
    const appPath = path.join(discordPath, "resources", "app");
    const indexPath = path.join(appPath, "index.js");
    const loaderScriptPath = path.resolve("scripts", "loader.js");

    if (!fs.existsSync(loaderScriptPath)) {
        console.log(THEMES.error("❌ Loader script not found! Make sure 'loader.js' exists in /scripts."));
        return;
    }

    if (!fs.existsSync(appPath)) {
        fs.mkdirSync(appPath, { recursive: true });
        console.log(THEMES.info(`📁 Created missing directory: ${appPath}`));
    }

    try {
        let existingCode = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, "utf-8") : "";
        if (!existingCode.includes("require('./loader.js')")) {
            existingCode = `require('./loader.js');\n\n${existingCode}`;
            fs.writeFileSync(indexPath, existingCode, "utf-8");
            fs.copyFileSync(loaderScriptPath, path.join(appPath, "loader.js"));
            console.log(THEMES.success("✅ Yuricord successfully injected!"));
        } else {
            console.log(THEMES.warning("⚠ Yuricord is already injected."));
        }
    } catch (err) {
        console.log(THEMES.error(`❌ Failed to inject Yuricord: ${err.message}`));
    }
}

function uninstallYuricord(version) {
    clearConsole();
    console.log(THEMES.info(`🗑 Uninstalling Yuricord from ${version}...`));

    const discordPath = DISCORD_PATHS[version];
    const appPath = path.join(discordPath, "resources", "app");
    const indexPath = path.join(appPath, "index.js");
    const loaderPath = path.join(appPath, "loader.js");

    try {
        if (fs.existsSync(indexPath)) {
            let code = fs.readFileSync(indexPath, "utf-8");
            code = code.replace("require('./loader.js');\n", "");
            fs.writeFileSync(indexPath, code, "utf-8");
            if (fs.existsSync(loaderPath)) fs.unlinkSync(loaderPath);
            console.log(THEMES.success("✅ Yuricord uninstalled successfully!"));
        } else {
            console.log(THEMES.warning("⚠ No Yuricord injection found."));
        }
    } catch (err) {
        console.log(THEMES.error(`❌ Failed to uninstall Yuricord: ${err.message}`));
    }
}

function installOpenAsar(version) {
    clearConsole();
    console.log(THEMES.info("🔧 Installing OpenAsar..."));
    // Placeholder for OpenAsar install logic.
    console.log(THEMES.success("✅ OpenAsar installed successfully!"));
}

function uninstallOpenAsar(version) {
    clearConsole();
    console.log(THEMES.info("🗑 Uninstalling OpenAsar..."));
    // Placeholder for OpenAsar uninstall logic.
    console.log(THEMES.success("✅ OpenAsar uninstalled successfully!"));
}

async function mainMenu() {
    while (true) {
        clearConsole();
        console.log(chalk.magenta.bold("🌸 Welcome to Yuricord Installer 🌸\n"));

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
            clearConsole();
            console.log(THEMES.info("👋 Goodbye!"));
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
                injectLoader(version);
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

        console.log(chalk.cyan("\nPress Enter to return to the menu..."));
        await inquirer.prompt([{ type: "input", name: "continue" }]);
    }
}

mainMenu().catch((err) => {
    console.error(THEMES.error(`❌ An unexpected error occurred: ${err.message}`));
    process.exit(1);
});

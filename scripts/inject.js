const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const https = require("https");

// Discord installation paths
const DISCORD_PATHS = [
    { name: "Discord Stable", path: path.join(process.env.APPDATA, "Discord") },
    { name: "Discord PTB", path: path.join(process.env.APPDATA, "DiscordPTB") },
    { name: "Discord Canary", path: path.join(process.env.APPDATA, "DiscordCanary") }
];

// Yuricord paths
const YURICORD_PATH = path.join(__dirname, "Yuricord");
const YURICORD_APPDATA = path.join(process.env.APPDATA, "Yuricord");

// URL for OpenAsar (replace with actual URL)
const OPENASAR_URL = "https://github.com/OpenAsar/OpenAsar/releases/latest/download/app.asar";

// Function to check if a directory exists
function directoryExists(dir) {
    return fs.existsSync(dir);
}

// Function to copy Yuricord files
function injectYuricord(discordPath) {
    const resourcesDir = path.join(discordPath, "resources");
    const targetDir = path.join(resourcesDir, "Yuricord");

    if (!directoryExists(resourcesDir)) {
        throw new Error(`Discord resources folder not found at: ${resourcesDir}`);
    }

    if (!directoryExists(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.readdirSync(YURICORD_PATH).forEach((file) => {
        const src = path.join(YURICORD_PATH, file);
        const dest = path.join(targetDir, file);
        fs.copyFileSync(src, dest);
    });

    console.log(`✅ Yuricord successfully injected into ${discordPath}`);
}

// Function to uninstall Yuricord
function uninstallYuricord(discordPath) {
    const targetDir = path.join(discordPath, "resources", "Yuricord");
    if (directoryExists(targetDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true });
        console.log(`✅ Yuricord uninstalled from ${discordPath}`);
    } else {
        console.log(`ℹ️ Yuricord was not installed in ${discordPath}`);
    }
}

// Function to install OpenAsar
function installOpenAsar(discordPath) {
    const target = path.join(discordPath, "resources", "app.asar");
    const file = fs.createWriteStream(target);

    return new Promise((resolve, reject) => {
        https.get(OPENASAR_URL, (res) => {
            if (res.statusCode !== 200) {
                return reject(new Error(`Failed to download OpenAsar: ${res.statusCode}`));
            }

            res.pipe(file);
            file.on("finish", () => {
                file.close();
                console.log("✅ OpenAsar installed successfully!");
                resolve();
            });
        }).on("error", (err) => {
            reject(err);
        });
    });
}

// Function to uninstall OpenAsar
function uninstallOpenAsar(discordPath) {
    const target = path.join(discordPath, "resources", "app.asar");
    if (directoryExists(target)) {
        fs.unlinkSync(target);
        console.log(`✅ OpenAsar uninstalled from ${discordPath}`);
    } else {
        console.log(`ℹ️ OpenAsar was not installed in ${discordPath}`);
    }
}

// Interactive CLI menu
async function mainMenu() {
    const menuChoices = [
        { name: "Install Yuricord", value: "install_yuricord" },
        { name: "Uninstall Yuricord", value: "uninstall_yuricord" },
        { name: "Install OpenAsar", value: "install_openasar" },
        { name: "Uninstall OpenAsar", value: "uninstall_openasar" },
        { name: "Exit", value: "exit" }
    ];

    const { action } = await inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "What would you like to do?",
            choices: menuChoices
        }
    ]);

    if (action === "exit") {
        console.log("Goodbye!");
        return;
    }

    // Select a Discord version
    const availableDiscords = DISCORD_PATHS.filter(({ path }) => directoryExists(path));
    if (availableDiscords.length === 0) {
        console.log("❌ No Discord installations found.");
        return;
    }

    const { discordPath } = await inquirer.prompt([
        {
            type: "list",
            name: "discordPath",
            message: "Select the Discord installation:",
            choices: availableDiscords.map(({ name, path }) => ({ name, value: path }))
        }
    ]);

    try {
        // Perform the selected action
        switch (action) {
            case "install_yuricord":
                injectYuricord(discordPath);
                break;
            case "uninstall_yuricord":
                uninstallYuricord(discordPath);
                break;
            case "install_openasar":
                await installOpenAsar(discordPath);
                break;
            case "uninstall_openasar":
                uninstallOpenAsar(discordPath);
                break;
        }
    } catch (err) {
        console.error(`❌ ${err.message}`);
    }

    // Return to the main menu
    await mainMenu();
}

// Run the interactive menu
mainMenu();

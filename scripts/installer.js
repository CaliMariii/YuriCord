#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import inquirer from 'inquirer';
import chalk from 'chalk';

const DISCORD_PATHS = {
    stable: path.join(process.env.APPDATA, 'Discord'),
    ptb: path.join(process.env.APPDATA, 'DiscordPTB'),
    canary: path.join(process.env.APPDATA, 'DiscordCanary'),
    development: path.join(process.env.APPDATA, 'DiscordDevelopment'),
};

// Utility to kill Discord processes
const killDiscordProcess = (version) => {
    console.log(chalk.yellow(`Stopping Discord (${version}) process...`));
    try {
        execSync(`taskkill /IM ${version}.exe /F`, { stdio: 'ignore' });
        console.log(chalk.green(`Successfully stopped Discord (${version})!`));
    } catch (error) {
        console.log(chalk.red(`Failed to stop Discord (${version}). It might not be running.`));
    }
};

// Utility to check and create missing folders
const ensureDirectory = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(chalk.blue(`Created missing directory: ${dirPath}`));
    }
};

// Function to inject Yuricord
const injectYuricord = async (discordPath) => {
    console.log(chalk.cyan('Injecting Yuricord...'));
    const resourcesPath = path.join(discordPath, 'resources');
    const appPath = path.join(resourcesPath, 'app');
    ensureDirectory(resourcesPath);
    ensureDirectory(appPath);

    const indexFile = path.join(appPath, 'index.js');
    try {
        fs.writeFileSync(indexFile, '// Yuricord injected code here');
        console.log(chalk.green('Yuricord successfully injected!'));
    } catch (error) {
        console.log(chalk.red('Failed to inject Yuricord:'), error.message);
    }
};

// Function to uninject Yuricord
const uninjectYuricord = async (discordPath) => {
    console.log(chalk.cyan('Uninjecting Yuricord...'));
    const resourcesPath = path.join(discordPath, 'resources', 'app', 'index.js');
    try {
        if (fs.existsSync(resourcesPath)) {
            fs.unlinkSync(resourcesPath);
            console.log(chalk.green('Yuricord successfully uninstalled!'));
        } else {
            console.log(chalk.yellow('Yuricord is not installed on this Discord version.'));
        }
    } catch (error) {
        console.log(chalk.red('Failed to uninject Yuricord:'), error.message);
    }
};

// Function to install OpenAsar
const installOpenAsar = async (discordPath) => {
    console.log(chalk.cyan('Installing OpenAsar...'));
    const asarPath = path.join(discordPath, 'resources', 'app.asar');
    try {
        fs.writeFileSync(asarPath, '// OpenAsar placeholder content');
        console.log(chalk.green('OpenAsar successfully installed!'));
    } catch (error) {
        console.log(chalk.red('Failed to install OpenAsar:'), error.message);
    }
};

// Function to uninstall OpenAsar
const uninstallOpenAsar = async (discordPath) => {
    console.log(chalk.cyan('Uninstalling OpenAsar...'));
    const asarPath = path.join(discordPath, 'resources', 'app.asar');
    try {
        if (fs.existsSync(asarPath)) {
            fs.unlinkSync(asarPath);
            console.log(chalk.green('OpenAsar successfully uninstalled!'));
        } else {
            console.log(chalk.yellow('OpenAsar is not installed on this Discord version.'));
        }
    } catch (error) {
        console.log(chalk.red('Failed to uninstall OpenAsar:'), error.message);
    }
};

// Main menu
const mainMenu = async () => {
    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do? (Use arrow keys)',
            choices: [
                'Install Yuricord',
                'Uninstall Yuricord',
                'Install OpenAsar',
                'Uninstall OpenAsar',
                'Exit',
            ],
        },
    ]);

    if (action === 'Exit') {
        console.log(chalk.green('Goodbye! 🌸'));
        process.exit(0);
    }

    const { discordVersion } = await inquirer.prompt([
        {
            type: 'list',
            name: 'discordVersion',
            message: 'Select the Discord installation:',
            choices: Object.keys(DISCORD_PATHS),
        },
    ]);

    const discordPath = DISCORD_PATHS[discordVersion];
    killDiscordProcess(discordVersion);

    switch (action) {
        case 'Install Yuricord':
            await injectYuricord(discordPath);
            break;
        case 'Uninstall Yuricord':
            await uninjectYuricord(discordPath);
            break;
        case 'Install OpenAsar':
            await installOpenAsar(discordPath);
            break;
        case 'Uninstall OpenAsar':
            await uninstallOpenAsar(discordPath);
            break;
    }

    console.log(chalk.magenta('Action completed! 🌸 Restart the script for additional operations.'));
    process.exit(0);
};

mainMenu();

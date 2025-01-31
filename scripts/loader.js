// loader.js

const fs = require('fs');
const path = require('path');

// Path to Yuricord's AppData directory
const YURICORD_DIR = path.join(process.env.APPDATA || process.env.HOME, 'Yuricord');

// Initialize Yuricord
function initializeYuricord() {
    console.log('✨ Initializing Yuricord...');

    try {
        ensureDirectories(); // Ensure necessary directories exist
        loadPlugins();       // Load plugins
        loadThemes();        // Load themes
        setupUI();           // Add Yuricord-specific UI
        exposeDebuggingTools(); // Expose tools for debugging
    } catch (err) {
        console.error('❌ Yuricord Initialization Failed:', err);
        logError(err);
    }
}

// Ensure necessary directories exist
function ensureDirectories() {
    const directories = ['plugins', 'themes', 'logs'];
    directories.forEach((dir) => {
        const dirPath = path.join(YURICORD_DIR, dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`📁 Created directory: ${dirPath}`);
        }
    });
}

// Dynamically load plugins
function loadPlugins() {
    const pluginsDir = path.join(YURICORD_DIR, 'plugins');
    if (!fs.existsSync(pluginsDir)) return;

    console.log('🔌 Loading plugins...');
    fs.readdirSync(pluginsDir).forEach((file) => {
        if (file.endsWith('.js')) {
            try {
                const pluginPath = path.join(pluginsDir, file);
                require(pluginPath);
                console.log(`✅ Loaded plugin: ${file}`);
            } catch (err) {
                console.error(`❌ Failed to load plugin ${file}:`, err);
                logError(err);
            }
        }
    });
}

// Apply themes
function loadThemes() {
    const themesDir = path.join(YURICORD_DIR, 'themes');
    if (!fs.existsSync(themesDir)) return;

    console.log('🎨 Applying themes...');
    fs.readdirSync(themesDir).forEach((file) => {
        if (file.endsWith('.css')) {
            try {
                const themePath = path.join(themesDir, file);
                const cssContent = fs.readFileSync(themePath, 'utf8');
                injectCSS(cssContent);
                console.log(`✅ Applied theme: ${file}`);
            } catch (err) {
                console.error(`❌ Failed to apply theme ${file}:`, err);
                logError(err);
            }
        }
    });
}

// Inject CSS into Discord's DOM
function injectCSS(css) {
    const styleElement = document.createElement('style');
    styleElement.textContent = css;
    document.head.appendChild(styleElement);
}

// Hook into Discord's UI
function setupUI() {
    console.log('⚙️ Adding Yuricord UI Hooks...');
    // Example: Add a button to the settings menu
    const settingsButton = document.createElement('button');
    settingsButton.textContent = 'Yuricord Settings';
    settingsButton.onclick = () => {
        alert('Yuricord Settings Coming Soon!');
    };
    document.body.appendChild(settingsButton);
}

// Expose debugging tools
function exposeDebuggingTools() {
    globalThis.Yuricord = {
        reload: initializeYuricord, // Reload Yuricord
        debug: true,
    };
    console.log('🛠️ Yuricord Debugging Tools Exposed.');
}

// Log errors to a file
function logError(err) {
    const logPath = path.join(YURICORD_DIR, 'logs', 'errors.log');
    const logMessage = `[${new Date().toISOString()}] ${err.stack || err}\n`;
    fs.appendFileSync(logPath, logMessage);
}

// Initialize Yuricord
initializeYuricord();

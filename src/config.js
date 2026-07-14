const fs = require('fs');
const path = require('path');

const CONFIG_PATH = process.env.WORDCLOCK_CONFIG_PATH || path.join(__dirname, '..', 'config.json');

const DEFAULTS = {
    color: { r: 255, g: 255, b: 255 },
    brightness: 1,       // 0-1, applied to the word LEDs
    dotBrightness: 0.2,  // 0-1, applied to the minute-dot LEDs
    timezone: null        // IANA zone e.g. "Europe/Zurich"; null = system local time
};

function readConfigFile() {
    try {
        return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    } catch (err) {
        return {};
    }
}

function readEnvOverrides() {
    const overrides = {};

    if (process.env.WORDCLOCK_COLOR) {
        const [r, g, b] = process.env.WORDCLOCK_COLOR.split(',').map(Number);
        overrides.color = { r, g, b };
    }
    if (process.env.WORDCLOCK_BRIGHTNESS) {
        overrides.brightness = Number(process.env.WORDCLOCK_BRIGHTNESS);
    }
    if (process.env.WORDCLOCK_DOT_BRIGHTNESS) {
        overrides.dotBrightness = Number(process.env.WORDCLOCK_DOT_BRIGHTNESS);
    }
    if (process.env.WORDCLOCK_TIMEZONE) {
        overrides.timezone = process.env.WORDCLOCK_TIMEZONE;
    }

    return overrides;
}

// Precedence: env vars > config.json > defaults.
function loadConfig() {
    return { ...DEFAULTS, ...readConfigFile(), ...readEnvOverrides() };
}

// Persists to config.json, layered on top of the current file contents
// (not the env overrides, so env vars don't get baked into the saved file).
function saveConfig(partial) {
    const next = { ...DEFAULTS, ...readConfigFile(), ...partial };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(next, null, 2));
    return next;
}

module.exports = { loadConfig, saveConfig, DEFAULTS, CONFIG_PATH };

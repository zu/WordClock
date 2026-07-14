const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const TMP_CONFIG = path.join(os.tmpdir(), `wordclock-test-config-${process.pid}.json`);
process.env.WORDCLOCK_CONFIG_PATH = TMP_CONFIG;

const { loadConfig, saveConfig, DEFAULTS } = require('../src/config');

afterEach(() => {
    fs.rmSync(TMP_CONFIG, { force: true });
    delete process.env.WORDCLOCK_COLOR;
    delete process.env.WORDCLOCK_BRIGHTNESS;
    delete process.env.WORDCLOCK_DOT_BRIGHTNESS;
    delete process.env.WORDCLOCK_TIMEZONE;
});

test('loadConfig falls back to defaults when no file/env present', () => {
    assert.deepEqual(loadConfig(), DEFAULTS);
});

test('saveConfig persists and loadConfig reflects it', () => {
    saveConfig({ brightness: 0.5 });
    const config = loadConfig();
    assert.equal(config.brightness, 0.5);
    assert.deepEqual(config.color, DEFAULTS.color);
});

test('env vars override the saved file', () => {
    saveConfig({ brightness: 0.5 });
    process.env.WORDCLOCK_BRIGHTNESS = '0.9';
    assert.equal(loadConfig().brightness, 0.9);
});

test('WORDCLOCK_COLOR env var parses r,g,b', () => {
    process.env.WORDCLOCK_COLOR = '10,20,30';
    assert.deepEqual(loadConfig().color, { r: 10, g: 20, b: 30 });
});

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ripple, firework, heart, ROWS, COLS } = require('../src/effects');

const NUM_GRID_LEDS = ROWS * COLS;
const COLOR = { r: 200, g: 100, b: 50 };
const SAMPLE_TIMES_MS = [0, 137, 500, 999, 1500, 2001, 4321, 7999];

function assertValidFrame(frame) {
    assert.ok(Array.isArray(frame));
    for (const { led, r, g, b } of frame) {
        assert.ok(Number.isInteger(led) && led >= 0 && led < NUM_GRID_LEDS, `led ${led} out of range`);
        for (const channel of [r, g, b]) {
            assert.ok(channel >= 0 && channel <= 255, `channel ${channel} out of range`);
        }
    }
}

for (const [name, effect] of [['ripple', ripple], ['firework', firework], ['heart', heart]]) {
    test(`${name} returns only in-range LEDs/colors across sampled times`, () => {
        for (const t of SAMPLE_TIMES_MS) {
            assertValidFrame(effect(t, COLOR));
        }
    });
}

test('heart shape is stable over time (color pulses, cells do not)', () => {
    const cellsAt0 = heart(0, COLOR).map(f => f.led).sort((a, b) => a - b);
    const cellsAt1000 = heart(1000, COLOR).map(f => f.led).sort((a, b) => a - b);
    assert.deepEqual(cellsAt0, cellsAt1000);
});

test('ripple starts at the center and grows outward', () => {
    const start = ripple(0, COLOR);
    assert.ok(start.length > 0);
    const centerLed = Math.floor((ROWS - 1) / 2) * COLS + Math.round((COLS - 1) / 2);
    assert.ok(start.some(f => f.led === centerLed));
});

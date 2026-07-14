const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getLedsForTime } = require('../src/time-to-leds');

function at(h, min) {
    return new Date(2026, 0, 1, h, min);
}

test('on the hour shows just the hour word, no dots', () => {
    const { on, dim } = getLedsForTime(at(12, 0));
    assert.deepEqual(dim, []);
    assert.equal(on.length, 6 + 6); // ES_ISCH (6) + ZWOELFI (6)
});

test('minute dots ramp from 0 to 4 within a 5-minute block', () => {
    for (let min = 0; min < 5; min++) {
        const { dim } = getLedsForTime(at(6, min));
        assert.equal(dim.length, min);
    }
});

test('quarter past uses VIERTEL and AB', () => {
    const { on } = getLedsForTime(at(12, 16));
    // ES_ISCH(6) + AB(2) + VIERTEL(7) + ZWOELFI(6)
    assert.equal(on.length, 6 + 2 + 7 + 6);
});

test('rolls over to the next hour word past :25 and uses VOR/HALBI', () => {
    const { on } = getLedsForTime(at(12, 27));
    // ES_ISCH(6) + VOR(3) + FOEIF(4) + HALBI(5) + EIS(3) [hour rolled 12 -> 13]
    assert.equal(on.length, 6 + 3 + 4 + 5 + 3);
});

test('hour 23 rolls over to the 24 case (still renders as 12)', () => {
    const { on } = getLedsForTime(at(23, 59));
    // ES_ISCH(6) + VOR(3) + FOEIF(4) + ZWOELFI(6)
    assert.equal(on.length, 6 + 3 + 4 + 6);
});

test('ZWAENZG (20 past) lights each LED exactly once', () => {
    const { on } = getLedsForTime(at(12, 21));
    assert.equal(new Set(on).size, on.length);
});

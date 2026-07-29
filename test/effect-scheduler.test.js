const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createEffectScheduler } = require('../src/effect-scheduler');

const MINUTE = 60 * 1000;

test('interval mode triggers exactly `minutes` after start, and plays for durationMs', () => {
    const scheduler = createEffectScheduler({
        cadenceFn: () => ({ mode: 'interval', minutes: 30 }),
        durationMs: 8000
    });

    assert.equal(scheduler.tick(0).playing, false);
    assert.equal(scheduler.tick(30 * MINUTE - 1).playing, false);

    const start = scheduler.tick(30 * MINUTE);
    assert.equal(start.playing, true);
    assert.equal(start.elapsedMs, 0);

    const mid = scheduler.tick(30 * MINUTE + 4000);
    assert.equal(mid.playing, true);
    assert.equal(mid.elapsedMs, 4000);

    const end = scheduler.tick(30 * MINUTE + 8000);
    assert.equal(end.playing, false);
});

test('interval mode reschedules another trigger after the effect ends', () => {
    const scheduler = createEffectScheduler({
        cadenceFn: () => ({ mode: 'interval', minutes: 30 }),
        durationMs: 8000
    });

    scheduler.tick(0);
    scheduler.tick(30 * MINUTE); // starts playing
    scheduler.tick(30 * MINUTE + 8000); // ends, reschedules for +30min from here

    const nextStart = 30 * MINUTE + 8000 + 30 * MINUTE;
    assert.equal(scheduler.tick(nextStart - 1).playing, false);
    assert.equal(scheduler.tick(nextStart).playing, true);
});

test('random mode triggers within the expected 0.5x-1.5x average bounds', () => {
    const early = createEffectScheduler({
        cadenceFn: () => ({ mode: 'random', averageMinutes: 30 }),
        durationMs: 8000,
        random: () => 0
    });
    assert.equal(early.tick(0).playing, false);
    assert.equal(early.tick(15 * MINUTE - 1).playing, false);
    assert.equal(early.tick(15 * MINUTE).playing, true);

    const late = createEffectScheduler({
        cadenceFn: () => ({ mode: 'random', averageMinutes: 30 }),
        durationMs: 8000,
        random: () => 1
    });
    assert.equal(late.tick(0).playing, false);
    assert.equal(late.tick(45 * MINUTE - 1).playing, false);
    assert.equal(late.tick(45 * MINUTE).playing, true);
});

test('reset() clears pending and in-progress state', () => {
    const scheduler = createEffectScheduler({
        cadenceFn: () => ({ mode: 'interval', minutes: 30 }),
        durationMs: 8000
    });

    scheduler.tick(0);
    scheduler.tick(30 * MINUTE); // now playing
    scheduler.reset();

    // after reset, tick() re-schedules from scratch instead of still playing
    const result = scheduler.tick(30 * MINUTE + 1);
    assert.equal(result.playing, false);
});

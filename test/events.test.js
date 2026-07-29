const { test } = require('node:test');
const assert = require('node:assert/strict');
const { isEventToday, findActiveEvent } = require('../src/events');

function birthday(overrides = {}) {
    return {
        id: '1',
        name: 'Birthday',
        recurring: true,
        month: 8,
        day: 14,
        year: null,
        color: { r: 255, g: 0, b: 255 },
        effect: 'firework',
        ...overrides
    };
}

test('recurring event matches month/day regardless of year', () => {
    assert.equal(isEventToday(birthday(), new Date(2020, 7, 14)), true);
    assert.equal(isEventToday(birthday(), new Date(2030, 7, 14)), true);
});

test('recurring event does not match a different month/day', () => {
    assert.equal(isEventToday(birthday(), new Date(2026, 7, 15)), false);
    assert.equal(isEventToday(birthday(), new Date(2026, 6, 14)), false);
});

test('one-off event matches only the exact date', () => {
    const oneOff = birthday({ recurring: false, month: 6, day: 1, year: 2026 });
    assert.equal(isEventToday(oneOff, new Date(2026, 5, 1)), true);
    assert.equal(isEventToday(oneOff, new Date(2027, 5, 1)), false);
});

test('findActiveEvent returns null when nothing matches', () => {
    assert.equal(findActiveEvent([birthday()], new Date(2026, 0, 1)), null);
});

test('findActiveEvent uses first match in array order', () => {
    const today = new Date(2026, 7, 14);
    const first = birthday({ id: 'first' });
    const second = birthday({ id: 'second' });
    assert.equal(findActiveEvent([first, second], today).id, 'first');
});

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { nowInTimezone } = require('../src/now');

test('falls back to system local time when no timezone given', () => {
    const before = new Date();
    const result = nowInTimezone(null);
    assert.equal(result.getHours(), before.getHours());
});

test('reflects the wall-clock hour/minute of the given IANA timezone', () => {
    const utcNow = new Date();
    const expected = new Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
    }).formatToParts(utcNow);

    const expectedHour = Number(expected.find(p => p.type === 'hour').value) % 24;
    const expectedMinute = Number(expected.find(p => p.type === 'minute').value);

    const result = nowInTimezone('UTC');
    assert.equal(result.getHours(), expectedHour);
    assert.equal(result.getMinutes(), expectedMinute);
});

// Returns a Date whose getHours()/getMinutes() reflect the wall-clock time
// in `timezone` (an IANA zone name). Falls back to system local time when
// `timezone` is falsy. Only hours/minutes matter to the word-clock logic,
// so the returned Date's day/seconds are not meaningful.
function nowInTimezone(timezone) {
    if (!timezone) {
        return new Date();
    }

    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
    }).formatToParts(new Date());

    const hour = Number(parts.find(p => p.type === 'hour').value) % 24;
    const minute = Number(parts.find(p => p.type === 'minute').value);

    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
}

module.exports = { nowInTimezone };

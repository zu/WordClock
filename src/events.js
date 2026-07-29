// A special-day event:
// { id, name, recurring, month (1-12), day (1-31), year (only when !recurring), color, effect }

function isEventToday(event, date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if (month !== event.month || day !== event.day) {
        return false;
    }

    if (!event.recurring) {
        return date.getFullYear() === event.year;
    }

    return true;
}

// First match in array order wins when multiple events land on the same day.
function findActiveEvent(events, date) {
    return events.find(event => isEventToday(event, date)) || null;
}

module.exports = { isEventToday, findActiveEvent };

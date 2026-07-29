function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex({ r, g, b }) {
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

const configForm = document.getElementById('config-form');
const colorInput = document.getElementById('config-color');
const brightnessInput = document.getElementById('config-brightness');
const brightnessValue = document.getElementById('config-brightness-value');
const dotBrightnessInput = document.getElementById('config-dot-brightness');
const dotBrightnessValue = document.getElementById('config-dot-brightness-value');
const timezoneInput = document.getElementById('config-timezone');
const cadenceIntervalMinutes = document.getElementById('cadence-interval-minutes');
const cadenceRandomMinutes = document.getElementById('cadence-random-minutes');
const saveStatus = document.getElementById('config-save-status');

brightnessInput.addEventListener('input', () => {
    brightnessValue.textContent = brightnessInput.value;
});
dotBrightnessInput.addEventListener('input', () => {
    dotBrightnessValue.textContent = dotBrightnessInput.value;
});

async function loadConfig() {
    const config = await fetch('/api/config').then(r => r.json());

    colorInput.value = rgbToHex(config.color);
    brightnessInput.value = config.brightness;
    brightnessValue.textContent = config.brightness;
    dotBrightnessInput.value = config.dotBrightness;
    dotBrightnessValue.textContent = config.dotBrightness;
    timezoneInput.value = config.timezone || '';

    const cadence = config.effectCadence;
    document.querySelector(`input[name="cadence-mode"][value="${cadence.mode}"]`).checked = true;
    cadenceIntervalMinutes.value = cadence.mode === 'interval' ? cadence.minutes : 30;
    cadenceRandomMinutes.value = cadence.mode === 'random' ? cadence.averageMinutes : 30;

    return config;
}

configForm.addEventListener('submit', async event => {
    event.preventDefault();

    const cadenceMode = document.querySelector('input[name="cadence-mode"]:checked').value;
    const effectCadence = cadenceMode === 'random'
        ? { mode: 'random', averageMinutes: Number(cadenceRandomMinutes.value) }
        : { mode: 'interval', minutes: Number(cadenceIntervalMinutes.value) };

    const body = {
        color: hexToRgb(colorInput.value),
        brightness: Number(brightnessInput.value),
        dotBrightness: Number(dotBrightnessInput.value),
        timezone: timezoneInput.value.trim() || null,
        effectCadence
    };

    saveStatus.textContent = 'Saving...';
    await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    saveStatus.textContent = 'Saved';
    setTimeout(() => { saveStatus.textContent = ''; }, 2000);
});

const eventsBody = document.getElementById('events-body');
const eventForm = document.getElementById('event-form');
const eventFormTitle = document.getElementById('event-form-title');
const eventIdInput = document.getElementById('event-id');
const eventNameInput = document.getElementById('event-name');
const eventRecurringInput = document.getElementById('event-recurring');
const eventMonthInput = document.getElementById('event-month');
const eventDayInput = document.getElementById('event-day');
const eventYearLabel = document.getElementById('event-year-label');
const eventYearInput = document.getElementById('event-year');
const eventColorInput = document.getElementById('event-color');
const eventEffectInput = document.getElementById('event-effect');
const eventSubmit = document.getElementById('event-submit');
const eventCancelEdit = document.getElementById('event-cancel-edit');

function updateYearVisibility() {
    eventYearLabel.hidden = eventRecurringInput.checked;
    eventYearInput.required = !eventRecurringInput.checked;
}
eventRecurringInput.addEventListener('change', updateYearVisibility);
updateYearVisibility();

const EFFECT_LABELS = { none: 'Color only', ripple: 'Ripple', firework: 'Firework', heart: 'Heart' };

async function loadEvents() {
    const events = await fetch('/api/events').then(r => r.json());
    eventsBody.innerHTML = '';

    for (const event of events) {
        const row = document.createElement('tr');

        const dateText = event.recurring
            ? `${event.month}/${event.day} (yearly)`
            : `${event.month}/${event.day}/${event.year}`;

        row.innerHTML = `
            <td>${event.name}</td>
            <td>${dateText}</td>
            <td><span class="color-swatch" style="background:${rgbToHex(event.color)}"></span></td>
            <td>${EFFECT_LABELS[event.effect] || event.effect}</td>
            <td class="row-actions">
                <button type="button" data-action="edit">Edit</button>
                <button type="button" data-action="delete">Delete</button>
            </td>
        `;

        row.querySelector('[data-action="edit"]').addEventListener('click', () => startEdit(event));
        row.querySelector('[data-action="delete"]').addEventListener('click', () => deleteEvent(event.id));

        eventsBody.appendChild(row);
    }
}

function startEdit(event) {
    eventIdInput.value = event.id;
    eventNameInput.value = event.name;
    eventRecurringInput.checked = event.recurring;
    eventMonthInput.value = event.month;
    eventDayInput.value = event.day;
    eventYearInput.value = event.year || '';
    eventColorInput.value = rgbToHex(event.color);
    eventEffectInput.value = event.effect;
    updateYearVisibility();

    eventFormTitle.textContent = `Edit "${event.name}"`;
    eventSubmit.textContent = 'Save changes';
    eventCancelEdit.hidden = false;
}

function resetEventForm() {
    eventForm.reset();
    eventIdInput.value = '';
    updateYearVisibility();
    eventFormTitle.textContent = 'Add event';
    eventSubmit.textContent = 'Add event';
    eventCancelEdit.hidden = true;
}

eventCancelEdit.addEventListener('click', resetEventForm);

async function deleteEvent(id) {
    await fetch(`/api/events/${id}`, { method: 'DELETE' });
    await loadEvents();
}

eventForm.addEventListener('submit', async event => {
    event.preventDefault();

    const recurring = eventRecurringInput.checked;
    const body = {
        name: eventNameInput.value,
        recurring,
        month: Number(eventMonthInput.value),
        day: Number(eventDayInput.value),
        year: recurring ? null : Number(eventYearInput.value),
        color: hexToRgb(eventColorInput.value),
        effect: eventEffectInput.value
    };

    const id = eventIdInput.value;
    await fetch(id ? `/api/events/${id}` : '/api/events', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    resetEventForm();
    await loadEvents();
});

loadConfig();
loadEvents();

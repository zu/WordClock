const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';
const LEDMATRIX_NUM_ROWS = 10;
const LEDMATRIX_NUM_COLS= 11;

let clock;
const NUM_LEDS = LEDMATRIX_NUM_ROWS*LEDMATRIX_NUM_COLS + 4;

if (IS_DEVELOPMENT) {
    clock = require('./mock-clock');
} else {
    const { Dotstar } = require('dotstar');
    const SPI = require('pi-spi');
    const spi = SPI.initialize('/dev/spidev0.0');
    clock = new Dotstar(spi, {
        length: NUM_LEDS
    });
}

const { getLedsForTime } = require('./time-to-leds');
const { nowInTimezone } = require('./now');
const { loadConfig } = require('./config');
const { findActiveEvent } = require('./events');
const { createEffectScheduler } = require('./effect-scheduler');
const effects = require('./effects');
const { createServer } = require('./server');

const EFFECT_DURATION_MS = 8000;

createServer().listen(process.env.WORDCLOCK_PORT || 3000);

function scale(value, factor) {
    return Math.round(value * factor);
}

let startupCounter = 0;
let config = loadConfig();
setInterval(() => {
    config = loadConfig();
}, 1000);

const scheduler = createEffectScheduler({
    cadenceFn: () => config.effectCadence,
    durationMs: EFFECT_DURATION_MS
});
let lastActiveEventId = null;

function run() {
    setInterval(() => {
        if (startupCounter < NUM_LEDS) {
            clock.all(0, 0, 0);
            clock.set(startupCounter, 255, 255, 255);
            startupCounter++;
            clock.sync();
            return;
        }

        const now = nowInTimezone(config.timezone);
        const activeEvent = findActiveEvent(config.events, now);
        const activeEventId = activeEvent ? activeEvent.id : null;

        if (activeEventId !== lastActiveEventId) {
            lastActiveEventId = activeEventId;
            scheduler.reset();
        }

        const color = activeEvent ? activeEvent.color : config.color;

        let effectFrame = null;
        if (activeEvent && activeEvent.effect !== 'none' && effects[activeEvent.effect]) {
            const { playing, elapsedMs } = scheduler.tick(Date.now());
            if (playing) {
                effectFrame = effects[activeEvent.effect](elapsedMs, color);
            }
        }

        clock.all(0, 0, 0);

        if (effectFrame) {
            for (const { led, r, g, b } of effectFrame) {
                clock.set(led, r, g, b);
            }
        } else {
            const { on, dim } = getLedsForTime(now);

            for (const led of on) {
                clock.set(led, scale(color.r, config.brightness), scale(color.g, config.brightness), scale(color.b, config.brightness));
            }

            for (const led of dim) {
                clock.set(led, scale(color.r, config.dotBrightness), scale(color.g, config.dotBrightness), scale(color.b, config.dotBrightness));
            }
        }

        clock.sync();

    }, 100);
}

run();

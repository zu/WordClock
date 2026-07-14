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

function scale(value, factor) {
    return Math.round(value * factor);
}

let startupCounter = 0;
let config = loadConfig();
setInterval(() => {
    config = loadConfig();
}, 1000);

function run() {
    setInterval(() => {
        if (startupCounter < NUM_LEDS) {
            clock.all(0, 0, 0);
            clock.set(startupCounter, 255, 255, 255);
            startupCounter++;
            clock.sync();
            return;
        }

        const { on, dim } = getLedsForTime(nowInTimezone(config.timezone));
        const { r, g, b } = config.color;

        clock.all(0, 0, 0);
        for (const led of on) {
            clock.set(led, scale(r, config.brightness), scale(g, config.brightness), scale(b, config.brightness));
        }

        for (const led of dim) {
            clock.set(led, scale(r, config.dotBrightness), scale(g, config.dotBrightness), scale(b, config.dotBrightness));
        }

        clock.sync();

    }, 100);
}

run();

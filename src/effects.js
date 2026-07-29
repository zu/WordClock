// Special-day animated effects. Each effect is (elapsedMs, color) -> frame,
// where frame is a list of { led, r, g, b } to light (everything else stays off).
// The 10x11 letter grid is addressed the same way as time-to-leds.js: led = row*11 + col,
// row 0 is the physical bottom row, row 9 is the top row (see mock-clock.js's layout).
const ROWS = 10;
const COLS = 11;

function led(row, col) {
    return row * COLS + col;
}

function scaleColor(color, factor) {
    return {
        r: Math.round(color.r * factor),
        g: Math.round(color.g * factor),
        b: Math.round(color.b * factor)
    };
}

// Deterministic pseudo-random in [0, 1), so the same (elapsedMs-derived) seed
// always produces the same burst -- no effect needs to carry state between ticks.
function pseudoRandom(seed) {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
}

const CENTER_ROW = (ROWS - 1) / 2;
const CENTER_COL = (COLS - 1) / 2;
const MAX_RADIUS = Math.hypot(CENTER_ROW, CENTER_COL);

function ripple(elapsedMs, color) {
    const cycleMs = 2000;
    const t = (elapsedMs % cycleMs) / cycleMs;
    const radius = t * MAX_RADIUS;
    const bandWidth = 1.1;
    const frame = [];

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const distance = Math.hypot(row - CENTER_ROW, col - CENTER_COL);
            const offset = Math.abs(distance - radius);
            if (offset < bandWidth / 2) {
                const intensity = (1 - offset / (bandWidth / 2)) * (1 - t * 0.3);
                const { r, g, b } = scaleColor(color, Math.max(intensity, 0));
                frame.push({ led: led(row, col), r, g, b });
            }
        }
    }

    return frame;
}

function firework(elapsedMs, color) {
    const burstPeriodMs = 1500;
    const burstsPerPeriod = 2;
    const slot = Math.floor(elapsedMs / burstPeriodMs);
    const tInSlot = (elapsedMs % burstPeriodMs) / burstPeriodMs;
    const frame = [];

    for (let burst = 0; burst < burstsPerPeriod; burst++) {
        const seed = slot * 10 + burst;
        const originRow = Math.floor(pseudoRandom(seed * 2) * ROWS);
        const originCol = Math.floor(pseudoRandom(seed * 2 + 1) * COLS);
        const radius = tInSlot * 4.5;
        const fade = 1 - tInSlot;

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const distance = Math.hypot(row - originRow, col - originCol);
                if (Math.abs(distance - radius) < 0.9) {
                    const { r, g, b } = scaleColor(color, fade);
                    frame.push({ led: led(row, col), r, g, b });
                }
            }
        }
    }

    return frame;
}

// Hand-authored heart mask, tip pointing at row 0 (bottom). A smooth implicit
// heart curve doesn't read well at this resolution (10x11), so this is
// explicit per-row column ranges instead -- easy to see and retune by eye.
const HEART_ROW_SEGMENTS = [
    [[5, 5]],
    [[4, 6]],
    [[4, 6]],
    [[3, 7]],
    [[2, 8]],
    [[1, 9]],
    [[0, 10]],
    [[0, 3], [7, 10]],
    [[0, 2], [8, 10]],
    [[1, 2], [8, 9]]
];

const HEART_CELLS = HEART_ROW_SEGMENTS.flatMap((segments, row) =>
    segments.flatMap(([start, end]) => {
        const cells = [];
        for (let col = start; col <= end; col++) {
            cells.push({ row, col });
        }
        return cells;
    })
);

function heart(elapsedMs, color) {
    const pulseMs = 1500;
    const t = (elapsedMs % pulseMs) / pulseMs;
    const intensity = 0.5 + 0.5 * Math.sin(t * Math.PI * 2);
    const { r, g, b } = scaleColor(color, Math.max(intensity, 0.15));

    return HEART_CELLS.map(({ row, col }) => ({ led: led(row, col), r, g, b }));
}

module.exports = { ripple, firework, heart, ROWS, COLS };

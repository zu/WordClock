// Decides *when* a special-day effect should play, decoupled from rendering.
// `cadenceFn()` is re-read on every scheduling decision (not just at creation)
// so a config reload can change the cadence without losing in-flight state.
function createEffectScheduler({ cadenceFn, durationMs, random = Math.random }) {
    let nextTriggerAt = null;
    let playingSince = null;

    function delayFromCadence() {
        const cadence = cadenceFn();
        if (cadence.mode === 'random') {
            const averageMs = cadence.averageMinutes * 60 * 1000;
            return averageMs * (0.5 + random());
        }
        return cadence.minutes * 60 * 1000;
    }

    return {
        // Call every render tick. Returns whether an effect should be drawn
        // right now, and how far into its playback we are.
        tick(nowMs) {
            if (playingSince !== null) {
                const elapsedMs = nowMs - playingSince;
                if (elapsedMs >= durationMs) {
                    playingSince = null;
                    nextTriggerAt = nowMs + delayFromCadence();
                    return { playing: false, elapsedMs: 0 };
                }
                return { playing: true, elapsedMs };
            }

            if (nextTriggerAt === null) {
                nextTriggerAt = nowMs + delayFromCadence();
                return { playing: false, elapsedMs: 0 };
            }

            if (nowMs >= nextTriggerAt) {
                playingSince = nowMs;
                return { playing: true, elapsedMs: 0 };
            }

            return { playing: false, elapsedMs: 0 };
        },

        // Drops any pending/playing state, e.g. when the active event changes.
        reset() {
            nextTriggerAt = null;
            playingSince = null;
        }
    };
}

module.exports = { createEffectScheduler };

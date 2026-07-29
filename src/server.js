const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { loadConfig, saveConfig } = require('./config');

const EFFECT_NAMES = ['none', 'ripple', 'firework', 'heart'];

// Merges incoming fields over `existing` (when editing) or sane defaults (when
// creating), so a partial PUT/POST body can't produce a malformed event.
function normalizeEvent(body, existing = {}) {
    const recurring = body.recurring !== undefined
        ? Boolean(body.recurring)
        : (existing.recurring !== undefined ? existing.recurring : true);

    return {
        name: body.name !== undefined ? String(body.name) : (existing.name || 'Untitled'),
        recurring,
        month: body.month !== undefined ? Number(body.month) : existing.month,
        day: body.day !== undefined ? Number(body.day) : existing.day,
        year: recurring ? null : (body.year !== undefined ? Number(body.year) : existing.year),
        color: body.color !== undefined ? {
            r: Number(body.color.r),
            g: Number(body.color.g),
            b: Number(body.color.b)
        } : (existing.color || { r: 255, g: 255, b: 255 }),
        effect: body.effect !== undefined
            ? (EFFECT_NAMES.includes(body.effect) ? body.effect : 'none')
            : (existing.effect || 'none')
    };
}

function createServer() {
    const app = express();
    app.use(express.json());
    app.use(express.static(path.join(__dirname, '..', 'public')));

    app.get('/api/config', (req, res) => {
        res.json(loadConfig());
    });

    app.put('/api/config', (req, res) => {
        // events are managed through /api/events, not this endpoint
        const { events, ...settings } = req.body;
        res.json(saveConfig(settings));
    });

    app.get('/api/events', (req, res) => {
        res.json(loadConfig().events);
    });

    app.post('/api/events', (req, res) => {
        const config = loadConfig();
        const event = { id: crypto.randomUUID(), ...normalizeEvent(req.body) };
        saveConfig({ events: [...config.events, event] });
        res.status(201).json(event);
    });

    app.put('/api/events/:id', (req, res) => {
        const config = loadConfig();
        const index = config.events.findIndex(event => event.id === req.params.id);
        if (index === -1) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        const updated = { ...normalizeEvent(req.body, config.events[index]), id: req.params.id };
        const events = [...config.events];
        events[index] = updated;
        saveConfig({ events });
        res.json(updated);
    });

    app.delete('/api/events/:id', (req, res) => {
        const config = loadConfig();
        const events = config.events.filter(event => event.id !== req.params.id);
        saveConfig({ events });
        res.status(204).end();
    });

    return app;
}

module.exports = { createServer };

import test from 'node:test';
import assert from 'node:assert/strict';
import { SAVE_KEY, createState, loadState, saveState, advance, formatTime, daylight } from '../src/simulation.js';

function memoryStorage(value) {
  const entries = new Map(value === undefined ? [] : [[SAVE_KEY, value]]);
  return {
    getItem: key => entries.get(key) ?? null,
    setItem: (key, item) => entries.set(key, item),
  };
}

test('save and reload preserve the night, room, settings and pending order', () => {
  const storage = memoryStorage();
  const state = createState();
  state.money = 28.25;
  state.totalMinutes = 1830;
  state.day = 2;
  state.settings.volume = 0.15;
  state.room.position = [1, 1.65, -1.1];
  state.room.objects.can = [2, 0.04, 0.5];
  state.orders.push({ id: 1, type: 'food', arrivesAt: 1840, delivered: false });
  saveState(state, storage);

  const restored = loadState(storage);
  assert.deepEqual(restored, state);
  assert.ok(Number.isFinite(Date.parse(restored.savedAt)));
  restored.room.position[0] = 3;
  assert.equal(state.room.position[0], 1, 'a loaded save must not alias the old state');
});

test('missing, corrupt and incompatible saves recover a fresh state', () => {
  for (const input of [undefined, '{broken', 'null', '{"version":2}']) {
    assert.deepEqual(loadState(memoryStorage(input)), createState());
  }
});

test('a version-one save receives newly added nested defaults', () => {
  const restored = loadState(memoryStorage(JSON.stringify({
    version: 1, money: 12, settings: { volume: 0.2 }, room: { light: true },
    needs: { hunger: 31 }, hardware: { gpu: 2 }, events: { outage: true },
  })));
  assert.equal(restored.money, 12);
  assert.equal(restored.settings.volume, 0.2);
  assert.equal(restored.settings.timeScale, createState().settings.timeScale);
  assert.equal(restored.room.light, true);
  assert.deepEqual(restored.room.position, createState().room.position);
  assert.equal(restored.needs.hunger, 31);
  assert.equal(restored.needs.energy, createState().needs.energy);
  assert.equal(restored.hardware.gpu, 2);
  assert.equal(restored.hardware.cpu, 0);
  assert.equal(restored.events.outage, true);
  assert.ok(Number.isFinite(restored.events.nextAt));
});

test('time crosses midnight and advances the day counter', () => {
  const state = createState();
  state.totalMinutes = 1439.5;
  state.settings.timeScale = 1;
  advance(state, 1);
  assert.equal(state.totalMinutes, 1440.5);
  assert.equal(state.day, 2);
  assert.equal(formatTime(state.totalMinutes), '12:00 AM');
  advance(state, 2880);
  assert.equal(state.day, 4);
  assert.equal(formatTime(12 * 60), '12:00 PM');
  assert.equal(formatTime(21 * 60 + 18), '9:18 PM');
});

test('food and hardware arrive at their due time exactly once, including after reload', () => {
  const state = createState();
  state.settings.timeScale = 1;
  const due = state.totalMinutes + 10;
  state.orders = [
    { id: 1, type: 'food', arrivesAt: due, delivered: false },
    { id: 2, type: 'hardware', part: 'gpu', arrivesAt: due, delivered: false },
    { id: 3, type: 'hardware', part: 'ssd', arrivesAt: due + 20, delivered: false },
  ];
  assert.deepEqual(advance(state, 9), []);
  assert.equal(state.room.food, 0);
  assert.equal(state.hardware.gpu, 0);
  assert.deepEqual(advance(state, 1).map(order => order.id), [1, 2]);
  assert.equal(state.room.food, 1);
  assert.equal(state.hardware.gpu, 1);

  const storage = memoryStorage();
  saveState(state, storage);
  const restored = loadState(storage);
  assert.deepEqual(advance(restored, 1), []);
  assert.equal(restored.room.food, 1);
  assert.equal(restored.hardware.gpu, 1);
  assert.deepEqual(advance(restored, 19).map(order => order.id), [3]);
  assert.equal(restored.hardware.ssd, 1);
  assert.deepEqual(advance(restored, 100), []);
});

test('a long night cannot drain needs below zero and rest cannot overfill energy', () => {
  const state = createState();
  state.settings.timeScale = 1;
  advance(state, 100000);
  for (const [name, value] of Object.entries(state.needs)) {
    assert.ok(value >= 0 && value <= 100, `${name} stays in bounds`);
  }
  assert.equal(state.needs.hunger, 0);
  assert.equal(state.needs.energy, 0);
  state.music = { playing: true };
  advance(state, 100000, true);
  assert.equal(state.needs.energy, 100);
  assert.equal(state.needs.mood, 100);
  assert.equal(state.needs.hunger, 0);
});

test('the daylight cycle repeats and stays between darkness and full daylight', () => {
  assert.equal(daylight(2 * 60), 0);
  assert.equal(daylight(12 * 60), 1);
  assert.ok(daylight(6 * 60) > 0 && daylight(6 * 60) < 1);
  assert.ok(daylight(19 * 60) > 0 && daylight(19 * 60) < 1);
  for (let minute = 0; minute < 1440; minute += 5) {
    assert.ok(daylight(minute) >= 0 && daylight(minute) <= 1);
    assert.equal(daylight(minute + 1440), daylight(minute));
  }
});

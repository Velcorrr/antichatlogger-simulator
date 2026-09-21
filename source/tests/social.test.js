import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createState, loadState, saveState } from '../src/simulation.js';
import { createAudio } from '../src/audio.js';

// Node tests exercise the social simulation without mounting browser UI.
// The production module has one CSS side-effect import, which Node cannot load.
const source = (await readFile(new URL('../src/social.js', import.meta.url), 'utf8'))
  .replace(/^import\s+['"]\.\/social\.css['"];?\s*/m, '');
const { createSocial } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

function setup(state = createState()) {
  const voices = [];
  let saves = 0;
  let notifications = 0;
  const social = createSocial({
    state,
    save: () => saves++,
    audio: {
      voice: (name, text) => voices.push({ name, text }),
      notify: () => notifications++,
    },
  });
  state.social.nextBurst = 1e9;
  return { state, social, voices, saves: () => saves, notifications: () => notifications };
}

function storage() {
  let raw = null;
  return { getItem: () => raw, setItem: (_key, value) => { raw = value; } };
}

function tick(social, seconds) {
  for (let remaining = seconds; remaining > 0; remaining -= 1) social.update(1);
}

test('the GC seeds older conversation history for every named character', () => {
  const { state, social } = setup();
  const authors = new Set(state.social.history.map(message => message.author));
  for (const name of Object.keys(social.friends)) assert.ok(authors.has(name), name);
  assert.ok(state.social.history.length > 100);
  assert.ok(state.social.history[0].time < state.totalMinutes - 1440);
  assert.ok(state.social.history.every((message, index, messages) =>
    index === 0 || message.time >= messages[index - 1].time));
});

test('GC messages and pending replies survive reload without reseeding or duplicate delivery', () => {
  const { state, social } = setup();
  social.send('operator');
  const initialLength = state.social.history.length;
  const snapshot = structuredClone(state.social.history);
  assert.equal(snapshot.at(-1).text, 'operator');
  assert.equal(snapshot.at(-1).author, 'AntiChatLogger');
  assert.equal(state.social.queue.length, 2);

  const local = storage();
  saveState(state, local);
  const restored = setup(loadState(local));
  assert.deepEqual(restored.state.social.history, snapshot);
  tick(restored.social, 14);
  assert.equal(restored.state.social.history.length, initialLength + 2);
  assert.deepEqual(restored.state.social.history.slice(-2).map(message => [message.author, message.text]), [
    ['Liltism', 'ye give me a minute'], ['Liltism', 'last race'],
  ]);
  assert.equal(restored.state.social.queue.length, 0);
  tick(restored.social, 15);
  assert.equal(restored.state.social.history.length, initialLength + 2);
  assert.equal(new Set(restored.state.social.history.map(message => message.id)).size,
    restored.state.social.history.length);
});

test('messages arriving while the GC is hidden accumulate unread and clear on return', () => {
  const fixture = setup();
  fixture.social.setVisible(false);
  fixture.social.send('operator');
  tick(fixture.social, 14);
  assert.equal(fixture.social.getUnread(), 2);
  assert.equal(fixture.notifications(), 1, 'only the first unread message pings');
  fixture.social.setVisible(true);
  assert.equal(fixture.social.getUnread(), 0);
  assert.ok(fixture.saves() >= 3);
});

test('Velcorr visits and sends text, while scheduled group-call speech excludes him', t => {
  const fixture = setup();
  const { state, social, voices } = fixture;
  t.mock.method(Math, 'random', () => 0.5);
  tick(social, 350);
  assert.ok(state.social.velcorrVisit > state.social.elapsed);
  assert.equal(state.social.history.at(-1).author, 'Velcorr');
  assert.equal(state.social.history.at(-1).text, 'yo');
  social.joinCall();
  for (let index = 0; index < 8; index++) {
    Math.random.mock.mockImplementation(() => (index + 0.5) / 8);
    state.social.nextVoice = state.social.elapsed;
    social.update(1);
  }
  assert.ok(voices.length > 0, 'the test exercises actual generated call speech');
  assert.ok(voices.every(voice => voice.name !== 'Velcorr'));
  assert.ok(voices.some(voice => voice.name === 'Liltism'));
});

test('deafening the call suppresses scheduled speech', t => {
  t.mock.method(Math, 'random', () => 0.5);
  const { state, social, voices } = setup();
  social.joinCall();
  state.social.deafened = true;
  tick(social, 20);
  assert.deepEqual(voices, []);
  state.social.deafened = false;
  state.social.nextVoice = state.social.elapsed;
  social.update(1);
  assert.equal(voices.length, 1);
});

test('the audio layer independently refuses any Velcorr speech request', () => {
  const dispatched = [];
  const audio = createAudio(createState(), { dispatchEvent: event => dispatched.push(event) });
  // This must return before dispatching a subtitle or accessing browser speech APIs.
  audio.voice('Velcorr', 'This must never be spoken.');
  assert.deepEqual(dispatched, []);
});

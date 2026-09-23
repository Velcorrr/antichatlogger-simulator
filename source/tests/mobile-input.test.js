import test from 'node:test';
import assert from 'node:assert/strict';
import { createGameInput, normalizeStick } from '../src/input.js';

function activeInput() {
  const input = createGameInput();
  input.touchEnabled = true;
  input.active = true;
  return input;
}

test('touch movement, look and held actions can be used independently at the same time', () => {
  const input = activeInput();
  input.setMove(-0.4, -0.8);
  input.addLook(18, -6);
  input.setAction('fire', true);
  input.setAction('sprint', true);
  input.setAction('aim', true);

  assert.equal(input.moveX, -0.4);
  assert.equal(input.moveY, -0.8);
  assert.deepEqual(input.consumeLook(), { x: 18, y: -6 });
  assert.equal(input.held.fire, true);
  assert.equal(input.held.sprint, true);
  assert.equal(input.held.aim, true);

  input.setAction('fire', false);
  input.setMove(0, 0);
  input.addLook(-3, 2);
  assert.equal(input.held.fire, false);
  assert.equal(input.held.aim, true, 'releasing one finger must not release another action');
  assert.equal(input.held.sprint, true);
  assert.deepEqual(input.consumeLook(), { x: -3, y: 2 });
});

test('reset clears all movement, pending look and held actions without changing input mode', () => {
  const input = activeInput();
  input.setMove(0.5, -0.5);
  input.addLook(20, 10);
  for (const action of ['fire', 'aim', 'sprint', 'crouch', 'interact']) input.setAction(action, true);

  input.reset();

  assert.equal(input.moveX, 0);
  assert.equal(input.moveY, 0);
  assert.deepEqual(input.consumeLook(), { x: 0, y: 0 });
  assert.deepEqual(input.held, { sprint: false, crouch: false, fire: false, aim: false, interact: false });
  assert.equal(input.touchEnabled, true);
  assert.equal(input.active, true);
});

test('look movement accumulates between frames and is consumed exactly once', () => {
  const input = activeInput();
  input.addLook(11, -4);
  input.addLook(-2, 7);
  assert.deepEqual(input.consumeLook(), { x: 9, y: 3 });
  assert.deepEqual(input.consumeLook(), { x: 0, y: 0 });
  input.addLook(-5, -8);
  assert.deepEqual(input.consumeLook(), { x: -5, y: -8 });
});

test('the joystick has a radial dead zone and caps diagonal movement at walking speed', () => {
  for (const [x, y] of [[0, 0], [5, 0], [0, -5], [3, 4], [48 * 0.12, 0]]) {
    const stick = normalizeStick(x, y);
    assert.equal(Math.hypot(stick.x, stick.y), 0, 'small thumb movements must not move the player');
  }

  const edge = normalizeStick(48, -48);
  assert.ok(Math.abs(Math.hypot(edge.x, edge.y) - 1) < 1e-12);
  assert.ok(edge.x > 0 && edge.y < 0);
  assert.ok(Math.abs(edge.x + edge.y) < 1e-12, 'clamping must preserve the thumb direction');
  const analog = normalizeStick(0, -24);
  assert.ok(analog.y < 0 && analog.y > -1, 'partially moving the stick must allow slower movement');
  const customRadius = normalizeStick(9, 0, 100);
  assert.equal(Math.hypot(customRadius.x, customRadius.y), 0);

  const input = activeInput();
  input.setMove(0.8, 0.8);
  assert.ok(Math.abs(Math.hypot(input.moveX, input.moveY) - 1) < 1e-12);
  input.setMove(0.2, -0.3);
  assert.equal(input.moveX, 0.2);
  assert.equal(input.moveY, -0.3);
});

test('inactive touch controls ignore gestures and cannot leave movement or firing behind', () => {
  const input = createGameInput();
  assert.equal(input.active, false);
  assert.equal(input.touchEnabled, false);
  input.setMove(1, -1);
  input.addLook(40, 20);
  input.setAction('fire', true);
  input.setAction('interact', true);
  assert.equal(input.moveX, 0);
  assert.equal(input.moveY, 0);
  assert.deepEqual(input.consumeLook(), { x: 0, y: 0 });
  assert.equal(input.held.fire, false);
  assert.equal(input.held.interact, false);

  input.active = true;
  input.setMove(1, 0);
  input.setAction('fire', true);
  input.reset();
  input.active = false;
  input.setMove(1, 1);
  input.addLook(40, 20);
  input.setAction('fire', true);
  assert.equal(input.moveX, 0);
  assert.equal(input.moveY, 0);
  assert.deepEqual(input.consumeLook(), { x: 0, y: 0 });
  assert.equal(input.held.fire, false);
});

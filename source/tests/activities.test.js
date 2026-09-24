import test from 'node:test';
import assert from 'node:assert/strict';
import { ensureActivities, claimActivity, createWheel, stepWheel, brakeWheel, wheelPosition, createCircuit, moveCircuit, createTablet, bootTablet, matchesClue, stepActivity } from '../src/activities.js';

function seeded(seed) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }; }
function solveCircuit(run) {
  const queue = [[0]], seen = new Set([0]);
  while (queue.length) {
    const path = queue.shift(), cell = path.at(-1);
    if (cell === 24) return path;
    for (const next of run.open) if (!seen.has(next) && Math.abs(cell % 5 - next % 5) + Math.abs(Math.floor(cell / 5) - Math.floor(next / 5)) === 1) { seen.add(next); queue.push([...path, next]); }
  }
  return [];
}
function permutations(values) { return values.length ? values.flatMap((value, i) => permutations(values.filter((_, j) => i !== j)).map(rest => [value, ...rest])) : [[]]; }

test('wheel timing requires four clean corners and accepts only one brake per corner', () => {
  const run = createWheel(() => .5);
  for (let corner = 0; corner < 6; corner++) {
    run.phase = corner < 4 ? run.targets[corner] : 0;
    assert.equal(brakeWheel(run), true);
    assert.equal(brakeWheel(run), false);
    stepWheel(run, .7);
  }
  assert.equal(run.status, 'won');
  assert.equal(run.clean, 4);
  assert.equal(run.score, 800);
  assert.equal(brakeWheel(run), false);
  const fail = createWheel();
  for (let i = 0; i < 6; i++) { stepWheel(fail, 4); stepWheel(fail, .7); }
  assert.equal(fail.status, 'lost');
  assert.equal(fail.score, 0);
  assert.equal(wheelPosition({ phase: 1.75 }), .25);
});

test('generated packet grids are solvable with all relays and reject nonadjacent moves', () => {
  for (let seed = 0; seed < 100; seed++) {
    const run = createCircuit(seeded(seed)), path = solveCircuit(run);
    assert.ok(path.length >= 9);
    assert.equal(new Set(run.relays).size, 3);
    assert.ok(run.relays.every(relay => path.includes(relay) && relay !== 0 && relay !== 24));
    assert.equal(moveCircuit(run, 24), false);
    for (const cell of path.slice(1)) assert.equal(moveCircuit(run, cell), true);
    assert.equal(run.status, 'won');
    assert.ok(run.score >= 100);
    assert.equal(moveCircuit(run, path.at(-2)), false);
  }
});

test('packet backtracking removes path progress and cannot wrap between rows', () => {
  const run = createCircuit(seeded(4)), path = solveCircuit(run);
  moveCircuit(run, path[1]); moveCircuit(run, 0);
  assert.deepEqual(run.path, [0]);
  run.path = [4]; run.open.push(5);
  assert.equal(moveCircuit(run, 5), false);
});

test('tablet log clues specify exactly one solution across generated games', () => {
  for (let seed = 0; seed < 100; seed++) {
    const run = createTablet(seeded(seed));
    const answers = permutations(run.order).filter(order => run.clues.every(clue => matchesClue(order, clue)));
    assert.deepEqual(answers, [run.order]);
    assert.equal(bootTablet(run), false);
    run.selected = [...run.order];
    assert.equal(bootTablet(run), true);
    assert.equal(run.status, 'won');
    assert.equal(run.score, 1800);
    assert.equal(bootTablet(run), false);
  }
});

test('tablet has four attempts and timed games expire without rewards', () => {
  const run = createTablet(seeded(20));
  run.selected = [...run.order].reverse();
  for (let i = 0; i < 4; i++) bootTablet(run);
  assert.equal(run.status, 'lost');
  assert.equal(run.attempts, 4);
  for (const timed of [createTablet(), createCircuit()]) {
    stepActivity(timed, timed.limit);
    assert.equal(timed.status, 'lost');
    assert.equal(claimActivity({ money: 10 }, timed), null);
  }
});

test('rewards cannot be claimed twice and repeat payouts respect the game-time cooldown', () => {
  const state = { money: 5, totalMinutes: 100 };
  const run = { kind: 'wheel', status: 'won', score: 1100 };
  assert.equal(claimActivity(state, run).reward, 8);
  assert.equal(state.money, 13);
  assert.equal(claimActivity(state, run), null);
  assert.equal(state.activities.records.wheel.wins, 1);
  assert.equal(claimActivity(state, { ...run, claimed: false, score: 1000 }).reward, 0);
  assert.equal(state.activities.records.wheel.best, 1100);
  state.totalMinutes += 20;
  assert.equal(claimActivity(state, { ...run, claimed: false, score: 1200 }).reward, 1.5);
  assert.equal(state.money, 14.5);
  assert.equal(state.activities.records.wheel.best, 1200);
});

test('all-three bonus is one-time and migrations preserve existing activity records', () => {
  const state = { money: 0, totalMinutes: 0 };
  for (const kind of ['wheel', 'circuit', 'tablet']) claimActivity(state, { kind, status: 'won', score: 1000 });
  assert.equal(state.money, 45);
  assert.equal(state.activities.trioRewardClaimed, true);
  const serialized = JSON.parse(JSON.stringify(state));
  ensureActivities(serialized);
  assert.equal(serialized.activities.records.tablet.wins, 1);
  assert.equal(claimActivity(serialized, { kind: 'tablet', status: 'won', score: 900 }).reward, 0);
  assert.equal(serialized.money, 45);
  delete serialized.activities.records.circuit;
  ensureActivities(serialized);
  assert.equal(serialized.activities.records.circuit.best, 0);
  assert.equal(serialized.activities.records.wheel.best, 1000);
});

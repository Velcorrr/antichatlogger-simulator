const GAME_INFO = {
  wheel: { title: 'Midnight Apex', host: 'Liltism', tag: 'TIMING / 30 SECONDS', glyph: '◎', reward: 8, color: '#f6b56d', quote: 'six corners. clean lines. please stop using the wall as a brake.', description: 'Hit the brake while the needle is in the green zone. Land 4 of 6 corners to beat the lap.' },
  circuit: { title: 'Packet Run', host: 'Bitsproxy', tag: 'ROUTING / 60 SECONDS', glyph: '⌘', reward: 10, color: '#80d7bd', quote: 'the server is fine. the path to the server is less fine.', description: 'Route a packet from IN to OUT through all three relays. Tap adjacent tiles; tap the previous tile to undo.' },
  tablet: { title: 'Tablet Rescue', host: 'Fear', tag: 'LOGIC / 90 SECONDS', glyph: '▤', reward: 12, color: '#b9a2f7', quote: 'it was working before i changed literally one thing.', description: 'Read the crash-log clues and arrange four repair steps in the correct order. You get four boot attempts.' },
};
export const ACTIVITY_INFO = GAME_INFO;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function shuffle(items, random) { const values = [...items]; for (let i = values.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [values[i], values[j]] = [values[j], values[i]]; } return values; }

export function ensureActivities(state) {
  const old = state.activities && typeof state.activities === 'object' ? state.activities : {};
  state.activities = old;
  old.version = 1; old.records ||= {}; old.totalEarned = Number.isFinite(old.totalEarned) ? old.totalEarned : 0;
  old.trioRewardClaimed = Boolean(old.trioRewardClaimed);
  for (const kind of Object.keys(GAME_INFO)) {
    const record = old.records[kind] ||= {};
    for (const key of ['best', 'wins', 'plays']) record[key] = Number.isFinite(record[key]) ? Math.max(0, record[key]) : 0;
    record.lastRewardAt = Number.isFinite(record.lastRewardAt) ? record.lastRewardAt : -1e9;
  }
  return old;
}

export function claimActivity(state, run) {
  if (!run || run.status !== 'won' || run.claimed || !GAME_INFO[run.kind]) return null;
  const activities = ensureActivities(state), record = activities.records[run.kind];
  run.claimed = true;
  const firstWin = record.wins === 0, now = Number(state.totalMinutes) || 0;
  let reward = firstWin ? GAME_INFO[run.kind].reward : now - record.lastRewardAt >= 20 ? 1.5 : 0;
  record.wins++; record.best = Math.max(record.best, Math.round(run.score));
  if (reward) record.lastRewardAt = now;
  let bonus = 0;
  if (!activities.trioRewardClaimed && Object.values(activities.records).filter(r => r.wins > 0).length >= 3) {
    activities.trioRewardClaimed = true; bonus = 15; reward += bonus;
  }
  state.money = Math.round(((Number(state.money) || 0) + reward) * 100) / 100;
  activities.totalEarned = Math.round((activities.totalEarned + reward) * 100) / 100;
  return { host: GAME_INFO[run.kind].host, title: GAME_INFO[run.kind].title, score: run.score, reward, firstWin, bonus };
}

export function createWheel(random = Math.random) {
  return { kind: 'wheel', status: 'playing', elapsed: 0, corner: 0, clean: 0, score: 0, phase: 0, cooldown: 0, message: 'Find the green zone.', results: [], targets: Array.from({ length: 6 }, () => .28 + random() * .44) };
}
export function wheelPosition(run) { const phase = run.phase % 2; return phase <= 1 ? phase : 2 - phase; }
export function brakeWheel(run) {
  if (run.status !== 'playing' || run.cooldown > 0) return false;
  const distance = Math.abs(wheelPosition(run) - run.targets[run.corner]);
  const clean = distance <= .115, perfect = distance <= .04;
  const points = clean ? Math.round(200 - distance * 600) : 0;
  run.clean += Number(clean); run.score += points;
  run.results.push(clean ? perfect ? 'perfect' : 'clean' : 'miss');
  run.message = clean ? perfect ? 'PERFECT APEX +200' : `CLEAN LINE +${points}` : 'WIDE. That wall had a family.';
  run.cooldown = .7;
  return true;
}
export function stepWheel(run, dt) {
  if (run.status !== 'playing') return;
  if (run.cooldown > 0) {
    run.cooldown = Math.max(0, run.cooldown - dt);
    if (!run.cooldown) {
      run.corner++;
      if (run.corner >= 6) { run.status = run.clean >= 4 ? 'won' : 'lost'; return; }
      run.phase = 0; run.elapsed = 0; run.message = 'Find the green zone.';
    }
    return;
  }
  run.elapsed += dt; run.phase += dt * (.68 + run.corner * .065);
  if (run.elapsed >= 4) {
    run.results.push('miss'); run.message = 'TOO LATE. Commit to the corner.'; run.cooldown = .7;
  }
}

export function createCircuit(random = Math.random) {
  const size = 5, open = new Set([0]), visited = new Set([0]), stack = [0];
  while (stack.length) {
    const cell = stack[stack.length - 1], x = cell % size, y = Math.floor(cell / size);
    const choices = [[2, 0], [-2, 0], [0, 2], [0, -2]].map(([dx, dy]) => [x + dx, y + dy]).filter(([nx, ny]) => nx >= 0 && nx < size && ny >= 0 && ny < size && !visited.has(ny * size + nx));
    if (!choices.length) { stack.pop(); continue; }
    const [nx, ny] = choices[Math.floor(random() * choices.length)], next = ny * size + nx;
    open.add((cell + next) / 2); open.add(next); visited.add(next); stack.push(next);
  }
  const queue = [[0]], seen = new Set([0]); let solution = [];
  while (queue.length) {
    const path = queue.shift(), cell = path[path.length - 1];
    if (cell === 24) { solution = path; break; }
    for (const next of [cell - 5, cell + 5, cell - 1, cell + 1]) if (open.has(next) && !seen.has(next) && adjacent(cell, next)) { seen.add(next); queue.push([...path, next]); }
  }
  return { kind: 'circuit', status: 'playing', score: 0, size, open: [...open], relays: [.25, .5, .75].map(f => solution[Math.floor((solution.length - 1) * f)]), path: [0], moves: 0, elapsed: 0, limit: 60, message: 'Start at IN. Light all three relays on the way to OUT.' };
}
function adjacent(a, b) { return Math.abs(a % 5 - b % 5) + Math.abs(Math.floor(a / 5) - Math.floor(b / 5)) === 1; }
export function moveCircuit(run, cell) {
  if (run.status !== 'playing' || cell === run.path.at(-1)) return false;
  if (!adjacent(run.path.at(-1), cell) || !run.open.includes(cell)) { run.message = 'Use a neighboring open tile. Dark tiles are blocked.'; return false; }
  if (cell === run.path.at(-2)) { run.path.pop(); run.moves++; run.message = 'Backtracked. Find another route.'; return true; }
  if (run.path.includes(cell)) return false;
  run.path.push(cell); run.moves++;
  const collected = run.relays.filter(relay => run.path.includes(relay)).length;
  run.message = collected === 3 ? 'All relays online. Route to OUT.' : `${collected}/3 relays online.`;
  if (cell === 24 && collected === 3) { run.status = 'won'; run.score = Math.max(100, Math.round(1600 - run.elapsed * 10 - run.moves * 10)); run.message = 'Packet delivered. Zero loss.'; }
  return true;
}

const REPAIRS = [
  { id: 'power', name: 'Power cycle', glyph: '⏻' },
  { id: 'cache', name: 'Clear cache', glyph: '▧' },
  { id: 'driver', name: 'Load driver', glyph: '⚙' },
  { id: 'calibrate', name: 'Calibrate pen', glyph: '✎' },
];
function permutations(items) { if (!items.length) return [[]]; return items.flatMap((item, i) => permutations(items.filter((_, j) => j !== i)).map(rest => [item, ...rest])); }
export function matchesClue(order, clue) {
  const a = order.indexOf(clue.a), b = order.indexOf(clue.b);
  return clue.type === 'before' ? a < b : clue.type === 'next' ? b === a + 1 : a !== clue.position;
}
export function createTablet(random = Math.random) {
  const order = shuffle(REPAIRS.map(item => item.id), random), all = permutations(order);
  const candidates = [];
  for (let i = 0; i < 4; i++) {
    if (i < 3) candidates.push({ type: 'next', a: order[i], b: order[i + 1] });
    for (let j = i + 1; j < 4; j++) candidates.push({ type: 'before', a: order[i], b: order[j] });
    for (let p = 0; p < 4; p++) if (p !== i) candidates.push({ type: 'not', a: order[i], position: p });
  }
  let remaining = all; const clues = [];
  for (const clue of shuffle(candidates, random)) {
    const next = remaining.filter(candidate => matchesClue(candidate, clue));
    if (next.length < remaining.length) { clues.push(clue); remaining = next; }
    if (remaining.length === 1) break;
  }
  return { kind: 'tablet', status: 'playing', score: 0, order, clues, selected: [], attempts: 0, elapsed: 0, limit: 90, message: 'The log knows the order. Read it before booting.' };
}
export function bootTablet(run) {
  if (run.status !== 'playing' || run.selected.length !== 4) return false;
  run.attempts++;
  const correct = run.order.filter((item, i) => run.selected[i] === item).length;
  if (correct === 4) { run.status = 'won'; run.score = Math.max(100, Math.round(1800 - run.elapsed * 8 - (run.attempts - 1) * 250)); run.message = 'Pen pressure detected. Tablet online.'; }
  else { run.message = `Boot ${run.attempts}/4 failed: ${correct} of 4 steps in the correct position.`; if (run.attempts >= 4) run.status = 'lost'; }
  return true;
}
export function stepActivity(run, dt) {
  if (!run || run.status !== 'playing' || !Number.isFinite(dt) || dt <= 0) return;
  if (run.kind === 'wheel') stepWheel(run, dt);
  else { run.elapsed += dt; if (run.elapsed >= run.limit) { run.status = 'lost'; run.message = 'Session timed out. Take another shot.'; } }
}

export function createActivities(container, ctx) {
  const state = ctx.state; ensureActivities(state);
  let run = null, visible = false, destroyed = false, result = null;
  const save = () => ctx.save?.();
  container.innerHTML = '<div class="h-app" tabindex="0" aria-label="Hangouts challenges"><div class="h-scroll"></div></div>';
  const app = container.querySelector('.h-app'), scroll = container.querySelector('.h-scroll');
  const record = kind => state.activities.records[kind];
  function render() {
    if (!run) { renderLobby(); return; }
    const info = GAME_INFO[run.kind];
    scroll.innerHTML = `<header class="h-top"><button data-h-action="back">← Hangouts</button><span style="color:${info.color}">${info.host} / ${info.title}</span><b class="h-timer"></b></header><section class="h-session h-${run.kind}" style="--h-accent:${info.color}"><div class="h-session-heading"><small>${info.host.toUpperCase()}'S CHALLENGE</small><h2>${info.title}</h2><p>${info.description}</p></div><div class="h-game">${run.kind === 'wheel' ? wheelMarkup() : run.kind === 'circuit' ? circuitMarkup() : tabletMarkup()}</div><div class="h-feedback" role="status" aria-live="polite">${esc(run.message)}</div>${run.status !== 'playing' ? resultMarkup() : ''}</section>`;
    updateReadout();
  }
  function renderLobby() {
    const wins = Object.values(state.activities.records).filter(item => item.wins > 0).length;
    scroll.innerHTML = `<header class="h-lobby-top"><span class="h-logo">h<span>✦</span></span><div><b>hangouts</b><small>get off the loading screen.</small></div><span class="h-wallet">$${Number(state.money || 0).toFixed(2)}</span></header><section class="h-intro"><small>THREE FRIENDS. THREE BAD IDEAS.</small><h1>Make tonight <br>less uneventful.</h1><p>Beat your friends' challenges, set records, and earn cash for the setup.</p></section><div class="h-night-goal"><span>${wins === 3 ? '✦' : `${wins}/3`}</span><div><b>${wins === 3 ? 'Night shift complete' : 'The night shift'}</b><small>${wins === 3 ? 'All three cleared. Chase a better score.' : 'Win all three challenges for an extra $15.'}</small></div><div class="h-badges">${Object.entries(GAME_INFO).map(([kind, info]) => `<i class="${record(kind).wins ? 'h-earned' : ''}" title="${info.title}">${info.glyph}</i>`).join('')}</div></div><div class="h-cards">${Object.entries(GAME_INFO).map(([kind, info], i) => `<article class="h-card h-card-${kind}" style="--h-accent:${info.color}"><div class="h-card-art"><span>${info.glyph}</span><small>0${i + 1} / ${info.tag}</small><i></i></div><div class="h-card-copy"><div class="h-host"><b>${info.host}</b><span>${record(kind).wins ? '✓ cleared' : 'challenge waiting'}</span></div><h2>${info.title}</h2><p class="h-quote">“${info.quote}”</p><p>${info.description}</p><div class="h-record"><span>BEST <b>${record(kind).best || '—'}</b></span><span>${record(kind).wins} WINS</span></div><button class="h-primary" data-h-start="${kind}">${record(kind).plays ? 'Play again' : 'Accept challenge'} <span>${record(kind).wins ? '↗' : '+$' + info.reward}</span></button></div></article>`).join('')}</div><footer class="h-footer">First wins pay $8–$12. Replays pay $1.50, at most once per challenge every 20 game minutes. Timers pause when you switch apps.</footer>`;
  }
  function wheelMarkup() {
    return `<div class="h-lap-view"><div class="h-skyline"></div><div class="h-road"><div class="h-road-line"></div><span class="h-car">▰</span></div><div class="h-lap-label"><b>COASTLINE // NIGHT RUN</b><span class="h-corner"></span></div><div class="h-corner-dots">${Array.from({ length: 6 }, (_, i) => `<i class="${run.results[i] || ''}">${i + 1}</i>`).join('')}</div></div><div class="h-brake-instructions"><span>BRAKE WINDOW</span><b class="h-clean-count"></b></div><div class="h-meter"><i class="h-safe-zone"></i><i class="h-needle"></i></div><button class="h-primary h-brake" data-h-action="brake" ${run.status !== 'playing' ? 'disabled' : ''}>BRAKE <span>tap / space</span></button>`;
  }
  function circuitMarkup() {
    const head = run.path.at(-1);
    return `<div class="h-circuit-meta"><span class="h-relays">${run.relays.filter(cell => run.path.includes(cell)).length}/3 RELAYS</span><span>${run.moves} MOVES</span><button data-h-action="undo" ${run.path.length < 2 || run.status !== 'playing' ? 'disabled' : ''}>↶ Undo</button></div><div class="h-circuit-grid" role="group" aria-label="Packet route. Use arrow keys or tap adjacent tiles.">${Array.from({ length: 25 }, (_, cell) => `<button data-h-cell="${cell}" class="${!run.open.includes(cell) ? 'h-wall' : ''} ${run.path.includes(cell) ? 'h-route' : ''} ${cell === head ? 'h-head' : ''} ${run.relays.includes(cell) ? 'h-relay' : ''}" ${!run.open.includes(cell) || run.status !== 'playing' ? 'disabled' : ''} aria-label="${cell === 0 ? 'Input' : cell === 24 ? 'Output' : run.relays.includes(cell) ? 'Relay' : 'Tile'} row ${Math.floor(cell / 5) + 1} column ${cell % 5 + 1}${cell === head ? ', current position' : ''}">${cell === 0 ? 'IN' : cell === 24 ? 'OUT' : run.relays.includes(cell) ? '◇' : run.path.includes(cell) ? '●' : run.open.includes(cell) ? '·' : '×'}</button>`).join('')}</div><p class="h-key-hint">Tap neighboring tiles · Arrow keys · Backspace to undo</p>`;
  }
  function clueText(clue) {
    const name = id => REPAIRS.find(item => item.id === id)?.name;
    return clue.type === 'before' ? `${name(clue.a)} must happen before ${name(clue.b)}.` : clue.type === 'next' ? `${name(clue.b)} comes immediately after ${name(clue.a)}.` : `${name(clue.a)} cannot be step ${clue.position + 1}.`;
  }
  function tabletMarkup() {
    return `<div class="h-tablet-layout"><div class="h-crash-log"><header><i></i><span>tablet_recovery.log</span><small>${run.attempts}/4 boots</small></header><p>ERROR 0x04 // WRONG INITIALIZATION ORDER</p><ol>${run.clues.map(clue => `<li>${esc(clueText(clue))}</li>`).join('')}</ol><small>Every clue is true. Exactly one order will boot.</small></div><div class="h-repair-console"><div class="h-repair-slots">${Array.from({ length: 4 }, (_, i) => `<button data-h-slot="${i}" ${run.status !== 'playing' ? 'disabled' : ''}><small>0${i + 1}</small><b>${run.selected[i] ? REPAIRS.find(item => item.id === run.selected[i]).name : 'Choose a step'}</b>${run.selected[i] ? '<span>×</span>' : ''}</button>`).join('')}</div><div class="h-repair-options">${REPAIRS.map((item, i) => `<button data-h-repair="${item.id}" ${run.selected.includes(item.id) || run.status !== 'playing' ? 'disabled' : ''}><span>${item.glyph}</span><b>${item.name}</b><small>${i + 1}</small></button>`).join('')}</div><div class="h-repair-actions"><button data-h-action="clear" ${run.status !== 'playing' ? 'disabled' : ''}>Clear order</button><button class="h-primary" data-h-action="boot" ${run.selected.length !== 4 || run.status !== 'playing' ? 'disabled' : ''}>Boot tablet ↵</button></div><p class="h-key-hint">Tap steps in order · Keys 1–4 · Enter to boot</p></div></div>`;
  }
  function resultMarkup() {
    const won = run.status === 'won', info = GAME_INFO[run.kind];
    return `<div class="h-result ${won ? 'h-result-win' : ''}"><span>${won ? '✦' : '↻'}</span><div><small>${won ? 'CHALLENGE CLEARED' : 'RUN ENDED'}</small><h3>${won ? `${run.score.toLocaleString()} points` : run.kind === 'wheel' ? `${run.clean}/6 clean corners — need 4` : 'You can run that back.'}</h3><p>${won ? result?.reward ? `+$${result.reward.toFixed(2)} to your wallet${result.bonus ? ' · includes $15 night shift bonus' : ''}` : 'Record saved · cash reward cooling down' : run.kind === 'tablet' ? 'Correct order: ' + run.order.map(id => REPAIRS.find(item => item.id === id).name).join(' → ') : 'New run, fresh chance. No cash lost.'}</p></div><button class="h-primary" data-h-start="${run.kind}">Retry ↗</button><button data-h-action="back">All challenges</button></div>`;
  }
  function finish() {
    if (!run || run.status === 'playing' || run.presented) return;
    run.presented = true;
    const stats = record(run.kind); stats.best = Math.max(stats.best, run.score);
    result = claimActivity(state, run);
    save();
    if (result) {
      ctx.events?.dispatchEvent(new CustomEvent('activity-complete', { detail: result }));
      ctx.toast?.(`${result.title} cleared${result.reward ? ` · +$${result.reward.toFixed(2)}` : ''}`);
    }
    render();
  }
  function start(kind) {
    if (!GAME_INFO[kind]) return;
    run = kind === 'wheel' ? createWheel() : kind === 'circuit' ? createCircuit() : createTablet();
    record(kind).plays++; result = null; save(); render(); scroll.scrollTop = 0; app.focus({ preventScroll: true });
  }
  function updateReadout() {
    if (!run) return;
    const timer = app.querySelector('.h-timer');
    if (timer) timer.textContent = run.status !== 'playing' ? 'FINISHED' : run.kind === 'wheel' ? `${Math.min(6, run.corner + 1)} / 6 CORNERS` : `${Math.max(0, Math.ceil(run.limit - run.elapsed))}s`;
    if (run.kind === 'wheel') {
      app.querySelector('.h-safe-zone').style.left = `${(run.targets[Math.min(5, run.corner)] - .115) * 100}%`;
      app.querySelector('.h-needle').style.left = `${wheelPosition(run) * 100}%`;
      app.querySelector('.h-car').style.transform = `translateX(${(wheelPosition(run) - .5) * 52}px) rotate(${(wheelPosition(run) - .5) * 16}deg)`;
      app.querySelector('.h-corner').textContent = `TURN ${Math.min(6, run.corner + 1)}`;
      app.querySelector('.h-clean-count').textContent = `${run.clean}/4 clean to win`;
      app.querySelector('.h-brake').disabled = run.status !== 'playing' || run.cooldown > 0;
      app.querySelectorAll('.h-corner-dots i').forEach((dot, i) => { dot.className = run.results[i] || (run.corner === i ? 'current' : ''); });
      const feedback = app.querySelector('.h-feedback'); if (feedback.textContent !== run.message) feedback.textContent = run.message;
    }
  }
  function act(action) {
    if (action === 'back') { run = null; result = null; render(); return; }
    if (!run || run.status !== 'playing') return;
    if (action === 'brake' && run.kind === 'wheel') { brakeWheel(run); updateReadout(); }
    if (action === 'undo' && run.kind === 'circuit' && run.path.length > 1) { moveCircuit(run, run.path.at(-2)); render(); }
    if (action === 'clear' && run.kind === 'tablet') { run.selected = []; render(); }
    if (action === 'boot' && run.kind === 'tablet') { bootTablet(run); finish(); render(); }
  }
  function onClick(event) {
    if (!visible || destroyed || ctx.isInteractionBlocked?.()) return;
    const button = event.target.closest('button'); if (!button || button.disabled) return;
    if (button.dataset.hStart) { start(button.dataset.hStart); return; }
    if (button.dataset.hAction) { act(button.dataset.hAction); return; }
    if (!run || run.status !== 'playing') return;
    if (button.hasAttribute('data-h-cell') && run.kind === 'circuit') { moveCircuit(run, Number(button.dataset.hCell)); finish(); render(); }
    if (button.dataset.hRepair && run.kind === 'tablet' && run.selected.length < 4 && !run.selected.includes(button.dataset.hRepair)) { run.selected.push(button.dataset.hRepair); render(); }
    if (button.hasAttribute('data-h-slot') && run.kind === 'tablet') { run.selected.splice(Number(button.dataset.hSlot), 1); render(); }
    app.focus({ preventScroll: true });
  }
  function onKey(event) {
    if (!visible || destroyed || ctx.isInteractionBlocked?.() || !run || run.status !== 'playing' || event.repeat || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    let handled = false;
    if (run.kind === 'wheel' && (event.code === 'Space' || event.key === 'Enter')) { act('brake'); handled = true; }
    if (run.kind === 'circuit') {
      const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -5, ArrowDown: 5 }[event.key];
      if (delta) { moveCircuit(run, run.path.at(-1) + delta); finish(); render(); handled = true; }
      if (event.key === 'Backspace') { act('undo'); handled = true; }
    }
    if (run.kind === 'tablet') {
      const item = REPAIRS[Number(event.key) - 1];
      if (item && run.selected.length < 4 && !run.selected.includes(item.id)) { run.selected.push(item.id); render(); handled = true; }
      if (event.key === 'Enter') { act('boot'); handled = true; }
      if (event.key === 'Backspace') { run.selected.pop(); render(); handled = true; }
    }
    if (handled) { event.preventDefault(); event.stopPropagation(); app.focus({ preventScroll: true }); }
  }
  app.addEventListener('click', onClick); app.addEventListener('keydown', onKey); render();
  return {
    setVisible(value) { visible = Boolean(value); if (visible && !run) renderLobby(); },
    update(dt) { if (!visible || destroyed || document.hidden || ctx.isInteractionBlocked?.() || !run || run.status !== 'playing') return; stepActivity(run, clamp(dt, 0, .1)); finish(); updateReadout(); },
    destroy() { destroyed = true; visible = false; app.removeEventListener('click', onClick); app.removeEventListener('keydown', onKey); container.replaceChildren(); },
    getState() { return { kind: run?.kind || null, status: run?.status || 'lobby', visible, score: run?.score || 0 }; },
  };
}

const ACTIONS = ['sprint', 'crouch', 'fire', 'aim', 'interact'];
export function normalizeStick(dx, dy, radius = 48) {
  const length = Math.hypot(dx, dy), dead = Math.max(1, radius) * .12;
  if (!Number.isFinite(length) || length <= dead) return { x: 0, y: 0 };
  const strength = Math.min(1, (length - dead) / (Math.max(1, radius) - dead));
  return { x: dx / length * strength, y: dy / length * strength };
}
export function createGameInput() {
  return {
    touchEnabled: false, active: false, moveX: 0, moveY: 0, lookX: 0, lookY: 0,
    held: Object.fromEntries(ACTIONS.map(action => [action, false])),
    reset() { this.moveX = this.moveY = this.lookX = this.lookY = 0; for (const a of ACTIONS) this.held[a] = false; },
    setMove(x, y) { if (!this.active) { this.moveX = this.moveY = 0; return; } const length = Math.max(1, Math.hypot(x, y)); this.moveX = Number.isFinite(x) ? x / length : 0; this.moveY = Number.isFinite(y) ? y / length : 0; },
    addLook(x, y) { if (!this.active) return; this.lookX += Number.isFinite(x) ? x : 0; this.lookY += Number.isFinite(y) ? y : 0; },
    consumeLook() { const delta = { x: this.lookX, y: this.lookY }; this.lookX = this.lookY = 0; return delta; },
    setAction(action, pressed) { if (ACTIONS.includes(action)) this.held[action] = this.active && Boolean(pressed); },
  };
}

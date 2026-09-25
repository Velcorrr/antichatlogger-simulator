const SDK_URL = 'https://js.puter.com/v2/';
export const AI_MODEL = 'openai/gpt-4.1-nano';
let sdkPromise;

export function loadPuter() {
  if (window.puter?.ai?.chat) return Promise.resolve(window.puter);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const timer = setTimeout(() => finish(new Error('AI service took too long to load.')), 15000);
    function finish(error) {
      clearTimeout(timer);
      script.onload = script.onerror = null;
      if (error) { script.remove(); sdkPromise = null; reject(error); }
      else resolve(window.puter);
    }
    script.src = SDK_URL;
    script.async = true;
    script.referrerPolicy = 'strict-origin-when-cross-origin';
    script.onload = () => finish(window.puter?.ai?.chat ? null : new Error('AI service is unavailable.'));
    script.onerror = () => finish(new Error('Could not reach the AI service.'));
    document.head.append(script);
  });
  return sdkPromise;
}

function deadline(promise, milliseconds) {
  let timer;
  return Promise.race([promise, new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('Reply timed out.')), milliseconds);
  })]).finally(() => clearTimeout(timer));
}

export function extractAIText(response) {
  const content = response?.message?.content ?? response?.choices?.[0]?.message?.content;
  if (typeof content === 'string' && content.trim()) return content;
  if (Array.isArray(content)) {
    const text = content.filter(block => block?.type === 'text').map(block => block.text).join('\n');
    if (text.trim()) return text;
  }
  throw new Error('The AI service returned an empty reply.');
}

// The player's Puter session owns its allowance. No shared API key is shipped.
export function createAIClient({ state, onChange = () => {}, getSDK = loadPuter, now = Date.now, timeoutMs = 22000 }) {
  let sdk, connected = false, preparing = false, epoch = 0, cooldownUntil = 0;
  let phase = 'off', detail = 'Scripted replies are active.';
  const enabled = () => state.settings.aiReplies === true;
  function snapshot() { return { enabled: enabled(), connected, phase, detail, ready: Boolean(sdk), coolingDown: now() < cooldownUntil }; }
  function change(next, message) { phase = next; detail = message; onChange(snapshot()); }
  async function prepare() {
    if (sdk) return sdk;
    if (preparing) return null;
    preparing = true;
    change('loading', 'Loading the AI connection…');
    try {
      sdk = await getSDK();
      connected = Boolean(enabled() && sdk.auth.isSignedIn());
      change(connected ? 'ready' : 'off', connected ? 'AI replies connected.' : 'Ready to connect. Scripted replies are active.');
      return sdk;
    } catch {
      change('unavailable', 'AI could not load. Scripted replies still work.');
      return null;
    } finally { preparing = false; }
  }
  function connect() {
    if (!sdk) return Promise.resolve(false);
    const attempt = ++epoch;
    change('connecting', 'Finish connecting in the Puter window.');
    // Invoke signIn before any await so a tap can open its authentication window.
    let signIn;
    try { signIn = sdk.auth.isSignedIn() ? Promise.resolve() : sdk.auth.signIn({ attempt_temp_user_creation: true }); }
    catch (error) { signIn = Promise.reject(error); }
    return deadline(Promise.resolve(signIn), 120000).then(() => {
      if (attempt !== epoch) return false;
      if (!sdk.auth.isSignedIn()) {
        connected = false; state.settings.aiReplies = false;
        change('off', 'Connection was not completed. Scripted replies are active.');
        return false;
      }
      state.settings.aiReplies = true;
      connected = true; cooldownUntil = 0;
      change('ready', 'AI replies connected. Your Puter allowance is used only when you send a message.');
      return true;
    }).catch(() => {
      if (attempt === epoch) { connected = false; state.settings.aiReplies = false; change('off', 'Connection cancelled or unavailable. Scripted replies are active.'); }
      return false;
    });
  }
  function disable() {
    epoch++; connected = false; state.settings.aiReplies = false; cooldownUntil = 0;
    change('off', 'Scripted replies are active.');
  }
  async function reply(messages) {
    if (!enabled() || !connected || !sdk || now() < cooldownUntil) throw new Error('AI not connected.');
    if (!sdk.auth.isSignedIn()) { connected = false; change('off', 'Reconnect AI to continue. Scripted replies are active.'); throw new Error('Session ended.'); }
    const attempt = epoch;
    change('thinking', 'Writing an AI reply…');
    try {
      const response = await deadline(Promise.resolve(sdk.ai.chat(messages, {
        model: AI_MODEL, max_tokens: 300, temperature: 0.85, stream: false, normalize: true,
      })), timeoutMs);
      if (attempt !== epoch || !enabled()) throw new Error('AI was turned off.');
      const text = extractAIText(response);
      change('ready', 'AI replies connected.');
      return text;
    } catch (error) {
      if (attempt === epoch && enabled()) {
        const message = String(error?.error?.message || error?.message || error?.error || '');
        const limited = /quota|allowance|credit|limit|fund|balance|payment/i.test(message);
        cooldownUntil = now() + (limited ? 120000 : 30000);
        change(limited ? 'limited' : 'unavailable', limited
          ? 'AI allowance reached. Using scripted replies; no purchase is needed to keep playing.'
          : 'AI is unavailable right now. Using scripted replies.');
      }
      throw error;
    }
  }
  return { prepare, connect, disable, reply, getStatus: snapshot, canReply: () => enabled() && connected && now() >= cooldownUntil };
}

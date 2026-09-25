import test from 'node:test';
import assert from 'node:assert/strict';
import { createAIClient, extractAIText, AI_MODEL } from '../src/ai.js';

function fixture(chat = async () => ({ message: { content: '{"messages":[]}' } }), timeoutMs = 100) {
  const state = { settings: {} }, calls = []; let signedIn = false;
  const sdk = { auth: { isSignedIn: () => signedIn, signIn: () => { signedIn = true; return Promise.resolve(); } }, ai: { chat: (...args) => { calls.push(args); return chat(...args); } } };
  return { state, calls, client: createAIClient({ state, getSDK: async () => sdk, timeoutMs }) };
}
test('AI requires opt-in and sends bounded text generation only after connection', async () => {
  const { client, state, calls } = fixture();
  await assert.rejects(client.reply([])); assert.equal(calls.length, 0);
  await client.prepare(); assert.equal(client.canReply(), false);
  assert.equal(await client.connect(), true); assert.equal(state.settings.aiReplies, true);
  await client.reply([{role:'user',content:'yo'}]);
  assert.equal(calls.length, 1); assert.equal(calls[0][1].model, AI_MODEL); assert.equal(calls[0][1].max_tokens, 300);
  client.disable(); await assert.rejects(client.reply([])); assert.equal(calls.length, 1);
});
test('quota failure backs off and does not repeatedly call the provider', async () => {
  const {client,calls}=fixture(async()=>{throw new Error('insufficient credit balance');});
  await client.prepare(); await client.connect(); await assert.rejects(client.reply([]));
  assert.equal(client.getStatus().phase,'limited'); assert.equal(client.canReply(),false);
  await assert.rejects(client.reply([])); assert.equal(calls.length,1);
});
test('a stalled provider times out instead of leaving chat waiting forever', async () => {
  const {client}=fixture(()=>new Promise(()=>{}),15);
  await client.prepare();await client.connect();await assert.rejects(client.reply([]),/timed out/);
  assert.equal(client.getStatus().phase,'unavailable');
});
test('turning AI off discards an in-flight reply',async()=>{
  let finish;const {client}=fixture(()=>new Promise(resolve=>{finish=resolve;}));
  await client.prepare();await client.connect();const pending=client.reply([]);client.disable();
  finish({message:{content:'late response'}});await assert.rejects(pending,/turned off/);
  assert.equal(client.getStatus().phase,'off');
});
test('provider content blocks are normalized and empty replies are rejected',()=>{
  assert.equal(extractAIText({message:{content:[{type:'text',text:'yo'}]}}),'yo');
  assert.throws(()=>extractAIText({message:{content:[]}}),/empty/);
});

test('an incomplete sign-in returns to scripted replies instead of staying connecting', async () => {
  const state = { settings: {} };
  const sdk = { auth: { isSignedIn: () => false, signIn: async () => {} } };
  const client = createAIClient({state, getSDK: async () => sdk});
  await client.prepare();
  assert.equal(await client.connect(), false);
  assert.equal(client.getStatus().phase, 'off');
  assert.equal(client.canReply(), false);
  assert.equal(state.settings.aiReplies, false);
});

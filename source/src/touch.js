import { normalizeStick } from './input.js';
import './touch.css';

export function createTouchControls(input, state, getStatus, action) {
  const root = document.createElement('div'); root.className = 'touch-ui'; root.hidden = true;
  root.innerHTML = `<div class="touch-top"><button data-tap="pause" aria-label="Pause game">Ⅱ <span>Pause</span></button><button class="touch-switch" data-tap="desktop">↗ <span>Discord</span></button><button class="touch-phone" data-tap="phone">▯ <span>Phone</span></button></div>
    <div class="touch-gameplay"><div class="touch-look" aria-label="Drag to look around"><span>DRAG TO LOOK</span></div>
    <div class="touch-stick" role="group" aria-label="Movement joystick"><div class="touch-stick-ring"></div><span class="touch-stick-knob"></span><small>MOVE</small></div>
    <div class="touch-movement"><button data-toggle="sprint" aria-label="Toggle sprint" aria-pressed="false">Run</button><button data-toggle="crouch" aria-label="Toggle crouch" aria-pressed="false">Crouch</button></div>
    <div class="touch-room-actions"><button class="touch-primary" data-tap="interact">Interact</button><button data-tap="pick">Pick / drop</button><button data-tap="use">Use</button></div>
    <div class="touch-operator-actions"><button data-hold="aim" aria-label="Hold to aim">Aim</button><button data-tap="reload">Reload</button><button class="touch-fire" data-hold="fire" aria-label="Hold to fire; drag to aim">Fire</button><button data-hold="interact" aria-label="Hold to extract data">Extract</button></div>
    <div class="touch-match-tools"><button data-tap="scoreboard">Scores</button><button data-tap="chat">Chat</button><button data-tap="spectate">Spectate</button></div></div>`;
  document.getElementById('app').append(root);
  const stick = root.querySelector('.touch-stick'), knob = root.querySelector('.touch-stick-knob'), look = root.querySelector('.touch-look');
  let stickPointer = null, lookPointer = null, stickOrigin, lastLook, lastMode = '', holds = new Map();
  function reset() { input.reset(); stickPointer = lookPointer = null; holds.clear(); knob.style.transform = 'translate(-50%, -50%)'; root.querySelectorAll('.is-held').forEach(el => el.classList.remove('is-held')); root.querySelectorAll('[data-toggle]').forEach(el => el.setAttribute('aria-pressed', 'false')); }
  function prevent(e) { if (e.cancelable) e.preventDefault(); e.stopPropagation(); }
  function capture(el,e) { try { el.setPointerCapture(e.pointerId); } catch {} }
  function updateStick(e) { const dx=e.clientX-stickOrigin.x,dy=e.clientY-stickOrigin.y,r=stickOrigin.radius; const v=normalizeStick(dx,dy,r);input.setMove(v.x,v.y);const d=Math.max(r,Math.hypot(dx,dy));knob.style.transform=`translate(calc(-50% + ${dx/d*r}px), calc(-50% + ${dy/d*r}px))`; }
  stick.addEventListener('pointerdown', e => { if (!input.active || stickPointer!==null) return; prevent(e); action('audio'); stickPointer=e.pointerId;const r=stick.getBoundingClientRect();stickOrigin={x:r.left+r.width/2,y:r.top+r.height/2,radius:r.width*.34};capture(stick,e);updateStick(e); });
  stick.addEventListener('pointermove', e => { if(e.pointerId!==stickPointer)return;prevent(e);updateStick(e); });
  const releaseStick=e=>{if(e.pointerId!==stickPointer)return;stickPointer=null;input.setMove(0,0);knob.style.transform='translate(-50%, -50%)';};
  for(const event of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(event,releaseStick);
  look.addEventListener('pointerdown',e=>{if(!input.active||lookPointer!==null)return;prevent(e);action('audio');lookPointer=e.pointerId;lastLook={x:e.clientX,y:e.clientY};capture(look,e);});
  look.addEventListener('pointermove',e=>{if(e.pointerId!==lookPointer)return;prevent(e);input.addLook(e.clientX-lastLook.x,e.clientY-lastLook.y);lastLook={x:e.clientX,y:e.clientY};});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])look.addEventListener(event,e=>{if(e.pointerId===lookPointer)lookPointer=null;});
  root.querySelectorAll('[data-hold]').forEach(button=>{
    const type=button.dataset.hold;
    button.addEventListener('pointerdown',e=>{if(!input.active)return;prevent(e);action('audio');capture(button,e);holds.set(e.pointerId,{type,x:e.clientX,y:e.clientY});input.setAction(type,true);button.classList.add('is-held');});
    button.addEventListener('pointermove',e=>{const hold=holds.get(e.pointerId);if(!hold)return;prevent(e);if(type==='fire')input.addLook(e.clientX-hold.x,e.clientY-hold.y);hold.x=e.clientX;hold.y=e.clientY;});
    const release=e=>{if(!holds.has(e.pointerId))return;holds.delete(e.pointerId);const remains=[...holds.values()].some(h=>h.type===type);input.setAction(type,remains);button.classList.toggle('is-held',remains);};
    for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,release);
    button.addEventListener('contextmenu',prevent);
  });
  root.querySelectorAll('[data-toggle]').forEach(button=>button.addEventListener('click',()=>{const a=button.dataset.toggle;input.setAction(a,!input.held[a]);button.classList.toggle('is-held',input.held[a]);button.setAttribute('aria-pressed',String(input.held[a]));}));
  root.querySelectorAll('[data-tap]').forEach(button=>button.addEventListener('click',e=>{e.stopPropagation();action(button.dataset.tap);}));
  function viewport() { const v=window.visualViewport;document.documentElement.style.setProperty('--app-height',`${Math.round(v?.height||innerHeight)}px`);document.documentElement.style.setProperty('--app-width',`${Math.round(v?.width||innerWidth)}px`);document.documentElement.style.setProperty('--app-top',`${Math.round(v?.offsetTop||0)}px`);reset(); }
  function update() {
    const preference=state.settings.touchControls||'auto';const enabled=preference==='on'||preference!=='off'&&(matchMedia('(pointer:coarse)').matches||innerWidth<=820);
    if(input.touchEnabled!==enabled){input.touchEnabled=enabled;document.body.classList.toggle('touch-mode',enabled);reset();window.dispatchEvent(new Event('resize'));}
    const status=getStatus(), key=`${enabled}/${status.mode}/${status.blocked}/${status.chat}/${status.stage}/${status.scoreboard}/${status.alive}`;
    if(lastMode!==key){reset();lastMode=key;}
    const gameplay=enabled&&!status.blocked&&!status.chat&&(status.mode==='room'||status.mode==='operator');
    const worldControls=gameplay&&(status.mode!=='operator'||status.stage==='live'&&status.alive!==false&&!status.scoreboard);
    input.active=worldControls;
    root.hidden=!enabled||status.mode==='menu'||status.blocked||status.chat;
    root.dataset.mode=status.mode;root.querySelector('.touch-gameplay').hidden=!gameplay;
    for(const selector of ['.touch-look','.touch-stick','.touch-movement','.touch-operator-actions'])root.querySelector(selector).hidden=!worldControls;
    root.querySelector('[data-tap=spectate]').hidden=status.alive!==false;
  }
  window.addEventListener('blur',reset);document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});window.addEventListener('resize',viewport);window.visualViewport?.addEventListener('resize',viewport);window.visualViewport?.addEventListener('scroll',viewport);
  viewport();update();return {update,reset,root};
}

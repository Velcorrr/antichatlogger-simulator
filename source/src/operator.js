import * as THREE from 'three';
import './operator.css';

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const WEAPONS = {
  'M4': {name:'AR-4',mag:30,damage:32,interval:.115,reload:2.0,recoil:.016},
  'AR-4': {name:'AR-4',mag:30,damage:32,interval:.115,reload:2.0,recoil:.016},
  'SMG': {name:'K9 SMG',mag:32,damage:23,interval:.083,reload:1.65,recoil:.012},
  'K9': {name:'K9 SMG',mag:32,damage:23,interval:.083,reload:1.65,recoil:.012},
  'DMR': {name:'M14 DMR',mag:12,damage:59,interval:.33,reload:2.4,recoil:.030},
};

export function createOperator(root, ctx) {
  root.classList.add('o-root');
  root.innerHTML = `<div class="o-viewport"></div><div class="o-grain"></div>
    <div class="o-top"><div class="o-map">OFFICE <span>EXTRACTION / 3v3</span></div><div class="o-round"><b class="o-score-a">0</b><div><small class="o-round-label">ROUND 1 / 5</small><strong class="o-timer">2:00</strong></div><b class="o-score-b">0</b></div><button class="o-switch">F2 <span>DESKTOP</span></button></div>
    <div class="o-location">PARKING ENTRANCE</div><div class="o-feed"></div><div class="o-crosshair"><i></i><i></i><i></i><i></i></div><div class="o-hitmarker">╳</div><div class="o-damage"></div>
    <div class="o-objective"><b>A</b><span>EXTRACT DATA</span><small></small></div><div class="o-interact"></div>
    <div class="o-bottom"><div class="o-vitals"><strong class="o-hp">100</strong><span>HEALTH</span><i></i><strong class="o-armor">50</strong><span>ARMOR</span></div><div class="o-instructions">WASD move · SHIFT sprint · C crouch<br>R reload · E extract · TAB scoreboard · ENTER chat</div><div class="o-ammo"><small class="o-weapon-name">AR-4</small><div><strong>30</strong><span> / 90</span></div></div></div>
    <div class="o-chat-log"></div><form class="o-chat-form" hidden><label>TEAM</label><input maxlength="140" aria-label="Operator team chat" placeholder="Message your team…" autocomplete="off"><small>ENTER SEND · ESC CLOSE</small><button class="o-chat-send" type="submit">Send</button><button class="o-chat-close" type="button" aria-label="Close team chat">Close</button></form>
    <div class="o-voice" hidden></div><div class="o-spectator" hidden></div><div class="o-scoreboard" hidden></div><div class="o-stage"></div><button class="o-resume" hidden><small>OPERATOR / OFFICE</small><b>Click to take control</b><span>Mouse look + WASD · F2 switches to Discord</span></button>`;
  const $ = sel => root.querySelector(sel);
  const ui = Object.fromEntries(['viewport','timer','round-label','score-a','score-b','location','feed','crosshair','hitmarker','damage','objective','interact','hp','armor','ammo','weapon-name','stage','resume','spectator','scoreboard','voice','chat-log','chat-form'].map(k=>[k,$('.o-'+k)]));
  let renderer, scene, camera, gun, flash, clock = 0, visible = false, running = false;
  let stage = 'idle', stageTime=0, roundTime=120, round=0, score=[0,0], team=[], bots=[], colliders=[], shootables=[], nav=[];
  let options={}, weapon=WEAPONS.M4, ammo=30, reserve=90, reloading=0, shotTime=0, recoil=0, hitTime=0, damageTime=0, objective=0, hudTime=0, gunBob=0, navTime=0;
  let yaw=0,pitch=0,mouseDown=false,aiming=false,spectate=0,roundKills=0,matchKills=0,matchDeaths=0,voiceTime=0;
  let player={pos:new THREE.Vector3(0,0,14),hp:100,armor:50,alive:true,kills:0,deaths:0,name:'AntiChatLogger',team:0};
  const keys=new Set(), ray=new THREE.Raycaster(), direction=new THREE.Vector3(), tmp=new THREE.Vector3(), projection=new THREE.Vector3();
  const objectivePos=new THREE.Vector3(8.5,0,-12), mapSize={w:31,h:39}, cell=.8;
  const texCache=[], handlers=[];
  const stats = ctx.state.operator ||= {kills:0,deaths:0,wins:0,losses:0,matches:0,rating:1000};
  const audio=(key,...args)=>ctx.audio?.[key]?.(...args);
  const notify=t=>ctx.toast?.(t);
  const touchMode=()=>!!ctx.input?.touchEnabled;
  const touchActive=()=>touchMode()&&!!ctx.input.active;
  const controlsAvailable=()=>visible&&(document.pointerLockElement===renderer?.domElement||touchActive())&&!chatOpen()&&ui.scoreboard.hidden;
  const held=action=>controlsAvailable()&&touchActive()&&!!ctx.input.held?.[action];
  const isAiming=()=>aiming||held('aim');
  const isSprinting=()=>keys.has('ShiftLeft')||held('sprint');
  const isCrouching=()=>keys.has('KeyC')||keys.has('ControlLeft')||held('crouch');
  function movement(){let x=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0),y=(keys.has('KeyS')?1:0)-(keys.has('KeyW')?1:0);if(touchActive()){x+=ctx.input.moveX||0;y+=ctx.input.moveY||0;}const length=Math.max(1,Math.hypot(x,y));return{x:x/length,y:y/length};}
  function resetControls(){keys.clear();mouseDown=false;aiming=false;if(visible)ctx.input?.reset?.();}
  function applyLook(x,y){const sensitivity=.0022*(Number(ctx.state.settings?.sensitivity)||1);yaw-=x*sensitivity;pitch=clamp(pitch-y*sensitivity,-1.25,1.25);}
  function on(el,event,fn,opt){el.addEventListener(event,fn,opt);handlers.push(()=>el.removeEventListener(event,fn,opt));}
  function label(text,color='#bdc9bd',w=256,h=64) {
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
    const c=canvas.getContext('2d');c.fillStyle='#172423';c.fillRect(0,0,w,h);c.strokeStyle=color;c.lineWidth=2;c.strokeRect(5,5,w-10,h-10);c.fillStyle=color;c.font=`bold ${text.length>17?15:21}px monospace`;c.textAlign='center';c.textBaseline='middle';c.fillText(text,w/2,h/2);
    const tex=new THREE.CanvasTexture(canvas);tex.magFilter=THREE.NearestFilter;tex.minFilter=THREE.NearestFilter;texCache.push(tex);return tex;
  }
  function mat(color,extra={}){return new THREE.MeshLambertMaterial({color,...extra});}
  function surfaceTexture(repeatX,repeatY){const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const c=canvas.getContext('2d');for(let y=0;y<64;y++)for(let x=0;x<64;x++){const v=165+Math.floor(Math.random()*55);c.fillStyle=`rgb(${v},${v},${v})`;c.fillRect(x,y,1,1);}const t=new THREE.CanvasTexture(canvas);t.magFilter=THREE.NearestFilter;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeatX,repeatY);texCache.push(t);return t;}
  function box(x,y,z,w,h,d,color,collision=false,parent=scene,extra={}) {
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color,extra));mesh.position.set(x,y,z);parent.add(mesh);
    if(collision){colliders.push({x,z,w,d,mesh});shootables.push(mesh);}
    return mesh;
  }
  function sign(text,x,y,z,rot=0,width=2.9){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,.7),new THREE.MeshBasicMaterial({map:label(text),side:THREE.DoubleSide}));mesh.position.set(x,y,z);mesh.rotation.y=rot;scene.add(mesh);}
  function floorTile(x,z,w,d,color){return box(x,-.04,z,w,.1,d,color);}
  function makeScene() {
    if(renderer)return;
    try{renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'});}catch(e){ui.stage.innerHTML='<div class="o-stage-card"><b>WebGL is unavailable</b><p>Enable hardware acceleration to play Operator.</p><button data-o="leave">Back to desktop</button></div>';throw e;}
    renderer.setPixelRatio(touchMode()?1:Math.min(window.devicePixelRatio||1,1.35));renderer.setClearColor(0x101816);renderer.outputColorSpace=THREE.SRGBColorSpace;
    ui.viewport.appendChild(renderer.domElement);scene=new THREE.Scene();scene.background=new THREE.Color(0x131d1d);scene.fog=new THREE.Fog(0x172021,16,45);
    camera=new THREE.PerspectiveCamera(78,1,.045,65);camera.rotation.order='YXZ';scene.add(camera);
    scene.add(new THREE.HemisphereLight(0xd6e2d6,0x353b32,1.45));const sun=new THREE.DirectionalLight(0xd4d8bd,1.05);sun.position.set(5,15,8);scene.add(sun);
    floorTile(0,0,30,38,0x454b47);floorTile(0,12,17,12,0x626765);floorTile(-8,-4,12,21,0x434b46);floorTile(9,-11,10,12,0x3e514d);
    // A complete perimeter and three connected routes. North is the server end.
    box(-15,1.65,0,.45,3.3,38,0x697675,true);box(15,1.65,0,.45,3.3,38,0x697675,true);box(0,1.65,-19,30,3.3,.45,0x687370,true);box(0,1.65,19,30,3.3,.45,0x626b65,true);
    const walls=[[-5,7,12,.4],[9,7,8,.4],[-10,-3,.35,20],[-5,-7,.35,17],[4,0,.35,10],[4,-13,.35,8],[9,-5,10,.35],[-10,-11,9,.35],[-10,-16,.35,6],[-.5,-11,6,.35],[9,2,.35,5]];
    walls.forEach(([x,z,w,d])=>{box(x,1.65,z,w,3.3,d,0x67706b,true);box(x,.28,z,w+.025,.24,d+.025,0x384845);});
    // Ceiling ribs and fluorescent fixtures leave the floor plan readable.
    for(let z=-15;z<=15;z+=6){box(0,3.25,z,29.6,.14,.16,0x414b47);for(const x of [-11,-1,10]){box(x,3.05,z,2.8,.09,.28,0xc6decf,false,scene,{emissive:0x93bba4,emissiveIntensity:.7});}}
    for(let x=-13;x<14;x+=3)for(let z=-17;z<18;z+=3){box(x,-.002,z,.018,.008,3,0x343d39);box(x,-.002,z,3,.008,.018,0x343d39);}
    // Lobby reception and old chairs.
    box(-5,.6,12,4.5,1.2,1.2,0x4d4740,true);box(-5,1.24,12,4.7,.12,1.4,0x8b8373);box(-6,1.65,12,.9,.65,.1,0x171d20);box(-6,1.65,12.06,.76,.49,.01,0x89a0a0,false,scene,{emissive:0x476969,emissiveIntensity:.6});
    for(let i=0;i<3;i++){box(9+i*1.5,.48,14,.8,.12,.85,0x304749,true);box(9+i*1.5,.92,14.35,.8,.8,.13,0x304749);box(9+i*1.5,.23,14,.08,.5,.5,0x8b9291);}
    sign('MERIDIAN / OFFICE',0,2.3,18.7,Math.PI,5);sign('LOBBY',-5,2.4,7.22,0);sign('PARKING →',12,2.35,18.7,Math.PI,3.2);
    // Cubicles, desk hardware, clutter and low dividers.
    for(const x of [-8,-1.8,1.6])for(const z of [-6,0,4]){if(x===-8&&z===-6)continue;
      box(x,.71,z,2.3,.13,1.1,0x776d58,true);box(x-1,.35,z,.1,.7,.85,0x363f3a);box(x+1,.35,z,.1,.7,.85,0x363f3a);box(x,1.15,z-.5,2.4,1.2,.09,0x516666,true);
      box(x,1.08,z,.7,.5,.12,0x1d2727);box(x,1.08,z+.065,.56,.37,.015,0x50776e,false,scene,{emissive:0x416054,emissiveIntensity:.5});box(x,.80,z+.3,.8,.04,.25,0x26322e);box(x+.78,.91,z+.25,.12,.24,.12,0xb1b4a6);
    }
    sign('WORKSPACE',-4.78,2.4,0,Math.PI/2,3);sign('PRIVATE OFFICES',-10.2,2.4,-7,-Math.PI/2,3.6);
    // Server objective room.
    for(const x of [6.1,12.8])for(const z of [-9,-13,-16.5]){box(x,1.25,z,1.25,2.5,1.3,0x26393a,true);for(let i=0;i<7;i++){box(x, .35+i*.29,z+.66,1.05,.15,.05,0x405654);box(x+.36,.35+i*.29,z+.70,.06,.04,.03,i%3?0x6c9f86:0xbfb47b,false,scene,{emissive:0x83b090,emissiveIntensity:1});}}
    box(8.5,.62,-13.3,2.1,1.24,.9,0x3c4945,true);box(8.5,1.58,-13.3,1.25,.76,.1,0x182926);box(8.5,1.58,-13.24,1.08,.60,.015,0x5ed8ad,false,scene,{emissive:0x58a98d,emissiveIntensity:.6});
    sign('A / DATA TERMINAL',9,2.65,-18.7,0,4.8);sign('SERVER ROOM',8,2.4,-4.8,0,3.4);
    // Storage crates and a staircase landing on the alternate western route.
    for(const [x,z,h] of [[-12.5,-13,1.1],[-13.5,-17,1.9],[-7,-17,1.3],[-7.6,-14.3,.8]]){box(x,h/2,z,1.55,h,1.3,0x867052,true);box(x,h+.025,z,1.6,.05,1.35,0x9b855e);}
    sign('STORAGE',-7,2.4,-18.7,0);sign('STAIRWELL B',-14.72,2.4,3,Math.PI/2,3.4);
    for(let i=0;i<7;i++)box(-12.5,.08+i*.09,2+i*.33,3.7,.16+i*.18,.34,0x747b6d,false);
    // Bathroom and private office on the eastern flank.
    box(12.2,.8,4,2.3,.12,.8,0xa1a297,true);for(const x of[11.5,12.8]){box(x,.87,4,.6,.08,.5,0x58645f);box(x,.98,3.7,.06,.3,.06,0x9bada2);}
    sign('WASHROOM',14.72,2.4,3,-Math.PI/2,3);box(11.3,.72,-.7,3.3,.12,1.3,0x786d55,true);box(11.3,1.2,-.9,.9,.7,.12,0x26302c);box(14,1,-1,1.2,2,1.2,0x485348,true);
    for(const x of [-14.7,14.7])for(const z of[-8,2,12]){box(x,1.8,z,.02,1.4,2.4,0x243735);box(x+Math.sign(-x)*.02,1.8,z,.03,.04,2.4,0x5b7770);}
    const floorTexture=surfaceTexture(15,20),wallTexture=surfaceTexture(5,2);scene.children.forEach(m=>{if(m.isMesh&&m.geometry.type==='BoxGeometry'){const p=m.geometry.parameters;if(p.width>5&&p.depth>5&&p.height<.2)m.material.map=floorTexture;else if(p.height>3)m.material.map=wallTexture;}});
    box(0,3.45,0,30,.1,38,0x28302c);const serverLight=new THREE.PointLight(0x74c5a9,8,9,2);serverLight.position.set(8.5,2.4,-12);scene.add(serverLight);
    makeNav();
    gun=new THREE.Group();camera.add(gun);gun.position.set(.27,-.27,-.48);
    box(0,0,0,.15,.17,.55,0x313b39,false,gun);box(0,.09,.05,.10,.09,.35,0x4a5550,false,gun);box(0,-.12,.13,.12,.23,.17,0x212d29,false,gun);box(0,.015,-.43,.07,.07,.4,0x343c38,false,gun);box(0,.04,.31,.13,.17,.27,0x27332e,false,gun);
    box(.05,-.18,.22,.17,.17,.3,0x998878,false,gun);box(-.12,-.17,-.11,.14,.15,.28,0x80766a,false,gun);box(.1,-.25,.36,.19,.18,.3,0x303f34,false,gun);box(-.2,-.2,-.05,.16,.18,.32,0x303f34,false,gun);
    box(0,.17,-.02,.035,.12,.04,0x1a2823,false,gun);box(0,.15,-.30,.03,.09,.035,0x1a2823,false,gun);
    flash=new THREE.Mesh(new THREE.ConeGeometry(.13,.28,5),new THREE.MeshBasicMaterial({color:0xffc884}));flash.rotation.x=-Math.PI/2;flash.position.set(0,.015,-.70);flash.visible=false;gun.add(flash);
    resize();
  }
  function makeNav(){nav=[];for(let j=0;j<mapSize.h;j++)for(let i=0;i<mapSize.w;i++){let x=(i-(mapSize.w-1)/2)*cell,z=(j-(mapSize.h-1)/2)*cell;nav.push(!blocked(x,z,.34));}}
  function blocked(x,z,r=.28){if(Math.abs(x)>14.5||Math.abs(z)>18.5)return true;return colliders.some(c=>Math.abs(x-c.x)<c.w/2+r&&Math.abs(z-c.z)<c.d/2+r);}
  function index(x,z){let i=clamp(Math.round(x/cell+(mapSize.w-1)/2),0,mapSize.w-1),j=clamp(Math.round(z/cell+(mapSize.h-1)/2),0,mapSize.h-1);return j*mapSize.w+i;}
  function navPosition(i){return new THREE.Vector3((i%mapSize.w-(mapSize.w-1)/2)*cell,0,(Math.floor(i/mapSize.w)-(mapSize.h-1)/2)*cell);}
  function pathTo(from,to){const start=index(from.x,from.z),target=index(to.x,to.z);let queue=[start],prev=new Int16Array(nav.length).fill(-1),end=start,best=1e8;prev[start]=start;
    for(let q=0;q<queue.length;q++){const at=queue[q],p=navPosition(at),dist=p.distanceToSquared(to);if(dist<best){best=dist;end=at;}if(at===target)break;
      for(const n of[at-1,at+1,at-mapSize.w,at+mapSize.w]){if(n<0||n>=nav.length||!nav[n]||prev[n]!==-1||Math.abs(n%mapSize.w-at%mapSize.w)>1)continue;prev[n]=at;queue.push(n);}}
    const path=[];for(let a=end;a!==start&&a!==-1;a=prev[a])path.push(navPosition(a));return path.reverse();}
  function makeBot(name,teamId,x,z) {
    const group=new THREE.Group(),body=box(0,.96,0,.5,.76,.32,teamId?0x826955:0x4c7973,false,group),head=box(0,1.51,0,.32,.33,.32,0x7d8170,false,group);
    box(0,1.31,0,.36,.12,.35,0x293a35,false,group);box(-.17,.35,0,.19,.53,.22,0x36423c,false,group);box(.17,.35,0,.19,.53,.22,0x36423c,false,group);box(-.34,1.04,-.09,.17,.5,.19,teamId?0x786450:0x4c7973,false,group);box(.34,1.03,-.1,.17,.47,.19,teamId?0x786450:0x4c7973,false,group);box(.24,1.1,-.38,.12,.12,.62,0x222c27,false,group);box(0,1.51,-.172,.26,.10,.02,0x171f1c,false,group);
    const bot={name,team:teamId,pos:new THREE.Vector3(x,0,z),hp:100,alive:true,kills:0,deaths:0,group,body,head,path:[],pathTimer:0,cooldown:1+Math.random()*2,aim:0,target:null};
    body.userData.bot=bot;head.userData.bot=bot;head.userData.head=true;group.position.copy(bot.pos);scene.add(group);shootables.push(body,head);
    if(!teamId){const badge=new THREE.Sprite(new THREE.SpriteMaterial({map:label(name,'#b8e7d8',256,64),depthTest:false}));badge.scale.set(1.6,.4,1);badge.position.y=2;group.add(badge);}
    return bot;
  }
  function clearBots(){for(const b of bots){scene.remove(b.group);b.group.traverse(o=>{o.geometry?.dispose();if(o.material?.map){o.material.map.dispose();}o.material?.dispose();});}bots=[];shootables=colliders.map(c=>c.mesh);}
  function start(opts={}) {
    if(running){show();return;}
    options=opts;weapon={...(WEAPONS[opts.weapon]||(/smg|k9/i.test(opts.weapon||'')?WEAPONS.SMG:/dmr|m14/i.test(opts.weapon||'')?WEAPONS.DMR:WEAPONS.M4))};if(/extended/i.test(opts.attachment||''))weapon.mag=Math.ceil(weapon.mag*1.4);
    try{makeScene();}catch(e){console.warn('Operator renderer:',e);show();return;}
    clearBots();score=[0,0];round=0;matchKills=0;matchDeaths=0;player.kills=0;player.deaths=0;running=true;stage='queue';stageTime=3.8;ui.feed.innerHTML='';ui['chat-log'].innerHTML='';show();
    ui.stage.innerHTML=`<div class="o-stage-card"><small>OPERATOR / ${opts.ranked?'RANKED':'CASUAL'}</small><h1>MATCHMAKING<span class="o-loading">…</span></h1><p>Building a local match on OFFICE</p><div class="o-queue-line"></div><span>Offline bot match · ${opts.party?'Party: AntiChatLogger + Liltism':'Solo queue'} · First to 3</span><button data-o="leave">CANCEL SEARCH</button></div>`;
    ui['weapon-name'].textContent=weapon.name+(opts.attachment&&opts.attachment!=='None'?' / '+opts.attachment:'');updateHUD();
  }
  function startRound(){const totals=Object.fromEntries(bots.map(b=>[b.name,{kills:b.kills,deaths:b.deaths}]));clearBots();round++;roundKills=0;roundTime=120;player.pos.set(0,0,14);player.hp=100;player.armor=50;player.alive=true;yaw=0;pitch=0;ammo=weapon.mag;reserve=weapon.mag*3;objective=0;reloading=0;recoil=0;resetControls();
    bots=[makeBot(options.party?'Liltism':'lowlight',0,-2,14),makeBot('morrow',0,2,14),makeBot('paperweight',1,8,-10),makeBot('BUREAU',1,-1,-9),makeBot('silt',1,-11,-8)];bots.forEach(b=>Object.assign(b,totals[b.name]||{}));team=[player,...bots];stage='prepare';stageTime=3;ui.spectator.hidden=true;ui.stage.innerHTML=`<div class="o-round-banner"><small>ROUND ${round} / FIRST TO 3</small><h2>EXTRACT THE DATA</h2><p>Reach terminal A in the server room. Hold ${touchMode()?'Extract':'E'} to secure it.</p><b class="o-countdown">3</b></div>`;
    if(round>1&&!visible){notify('Operator: next round is starting.');if(options.party)audio('voice','Liltism','anti. round.');}
    updateCamera(0);updateHUD();
  }
  function endRound(winner,reason){if(stage!=='live')return;score[winner]++;stage='roundend';stageTime=5;resetControls();objective=0;ui.interact.textContent='';
    ui.stage.innerHTML=`<div class="o-round-banner ${winner?'o-lost':''}"><small>ROUND ${round} COMPLETE</small><h2>${winner?'ROUND LOST':'ROUND WON'}</h2><p>${esc(reason)}</p><strong>${score[0]} <span>:</span> ${score[1]}</strong></div>`;updateHUD();}
  function finishMatch(){stage='finished';stageTime=0;mouseDown=false;unlock();const won=score[0]>=3;stats.matches=(Number(stats.matches)||0)+1;stats[won?'wins':'losses']=(Number(stats[won?'wins':'losses'])||0)+1;stats.rating=clamp((Number(stats.rating)||1000)+(options.ranked?(won?24:-18):0),0,3000);stats.rank=rankName(stats.rating);ctx.save?.();
    ui.stage.innerHTML=`<div class="o-stage-card"><small>OFFICE / ${options.ranked?'RANKED':'CASUAL'}</small><h1>${won?'VICTORY':'DEFEAT'}</h1><div class="o-final-score">${score[0]} <span>:</span> ${score[1]}</div><p>${matchKills} kills · ${matchDeaths} deaths · ${options.ranked?`${stats.rank} / ${stats.rating} RP`:'Local match complete'}</p><button data-o="again">PLAY AGAIN</button><button class="o-secondary" data-o="leave">BACK TO DESKTOP</button><span>Your Operator stats have been saved.</span></div>`;
  }
  function rankName(r){return r>=1600?'Platinum':r>=1300?'Gold':r>=1000?'Silver':'Bronze';}
  function end(){running=false;stage='idle';unlock();hide();ctx.exitOperator?.();}
  function lineOfSight(from,to){tmp.copy(to).sub(from);const dist=tmp.length();ray.set(from,tmp.normalize());ray.far=dist;const hits=ray.intersectObjects(colliders.map(c=>c.mesh),false);return !hits.length;}
  function moveBody(pos,dx,dz){if(!blocked(pos.x+dx,pos.z))pos.x+=dx;if(!blocked(pos.x,pos.z+dz))pos.z+=dz;}
  function hurt(victim,damage,killer,headshot=false){if(!victim.alive)return;if(victim===player){let absorb=Math.min(player.armor,damage*.40);player.armor-=absorb;damage-=absorb;damageTime=.5;audio('hit');}victim.hp-=damage;if(victim.hp>0)return;
    victim.hp=0;victim.alive=false;victim.deaths++;killer.kills++;feed(killer.name,victim.name,headshot);if(victim===player){matchDeaths++;stats.deaths=(Number(stats.deaths)||0)+1;resetControls();spectate=0;ui.spectator.hidden=false;ctx.save?.();}else{victim.group.rotation.z=Math.PI/2;victim.group.position.y=-.08;victim.body.visible=false;victim.head.visible=false;}
    if(killer===player){roundKills++;matchKills++;stats.kills=(Number(stats.kills)||0)+1;ctx.save?.();}
    if(!bots.some(b=>b.team===1&&b.alive))endRound(0,'Hostile team eliminated');else if(!player.alive&&!bots.some(b=>b.team===0&&b.alive))endRound(1,'Your team was eliminated');
  }
  function feed(killer,victim,head){const item=document.createElement('div');item.className=killer==='AntiChatLogger'?'o-your-kill':'';item.innerHTML=`<b>${esc(killer)}</b><span>${head?'⌖':'→'}</span>${esc(victim)}`;ui.feed.prepend(item);while(ui.feed.children.length>5)ui.feed.lastChild.remove();}
  function fire(){if(stage!=='live'||!player.alive||reloading>0||shotTime>0||!visible)return;if(ammo<=0){reload();return;}ammo--;shotTime=weapon.interval;recoil=Math.min(.11,recoil+weapon.recoil);flash.visible=true;audio('shot');
    camera.getWorldDirection(direction);const spread=(isAiming()?.002:.010)+(isSprinting()?.045:0)+recoil*.16;direction.x+=(Math.random()-.5)*spread;direction.y+=(Math.random()-.5)*spread;ray.set(camera.position,direction.normalize());ray.far=60;
    const hits=ray.intersectObjects(shootables,false);for(const hit of hits){const bot=hit.object.userData.bot;if(bot&&!bot.alive)continue;if(bot){if(bot.team===1){hitTime=.16;hurt(bot,weapon.damage*(hit.object.userData.head?2.5:1),player,hit.object.userData.head);}}else{spark(hit.point);}break;}
    pitch=clamp(pitch+weapon.recoil*(/grip|stabil|compensator/i.test(options.attachment||'')?.52:1),-1.25,1.25);updateHUD();
  }
  const sparks=[];
  function spark(pos){const m=new THREE.Mesh(new THREE.BoxGeometry(.055,.055,.055),new THREE.MeshBasicMaterial({color:0xe9cf8a}));m.position.copy(pos);scene.add(m);sparks.push({mesh:m,life:.10});}
  function reload(){if(reloading||ammo===weapon.mag||reserve<=0||!player.alive||stage!=='live')return;reloading=weapon.reload;audio('reload');ui.interact.textContent='RELOADING';}
  function updateBots(dt){for(const b of bots){if(!b.alive)continue;b.cooldown-=dt;b.pathTimer-=dt;const enemies=team.filter(t=>t.team!==b.team&&t.alive).sort((a,c)=>a.pos.distanceToSquared(b.pos)-c.pos.distanceToSquared(b.pos));const target=enemies[0];if(!target)continue;
      const from=b.pos.clone().setY(1.35),to=target.pos.clone().setY(1.1),dist=b.pos.distanceTo(target.pos),sight=dist<23&&lineOfSight(from,to);
      b.group.rotation.y=Math.atan2(b.pos.x-target.pos.x,b.pos.z-target.pos.z);
      if(sight&&dist<16){if(b.cooldown<=0&&stage==='live'){b.cooldown=(target===player?1.25:1.65)+Math.random()*.7;b.aim++;if(visible&&dist<14&&Math.random()<.35)audio('shot');const chance=target===player?(keys.has('ShiftLeft')?.24:keys.has('KeyC')?.28:.45):.7;if(Math.random()<chance)hurt(target,target===player?13+Math.random()*7:23,b);if(stage!=='live')break;}}
      else{if(b.pathTimer<=0){b.pathTimer=.9+Math.random()*.65;b.path=pathTo(b.pos,target.pos);}if(b.path.length){const next=b.path[0],dx=next.x-b.pos.x,dz=next.z-b.pos.z,d=Math.hypot(dx,dz);if(d<.17)b.path.shift();else moveBody(b.pos,dx/d*dt*2.2,dz/d*dt*2.2);}}
      b.group.position.copy(b.pos);b.group.position.y=Math.sin(clock*9+b.pos.x)*.017;
    }}
  function updateCamera(dt){if(!camera)return;let cp=player.pos;
    if(!player.alive){const friends=bots.filter(b=>b.team===0&&b.alive);if(friends.length){const target=friends[spectate%friends.length];cp=target.pos;camera.position.set(cp.x,1.52,cp.z);const looking=team.filter(t=>t.team===1&&t.alive).sort((a,b)=>a.pos.distanceToSquared(cp)-b.pos.distanceToSquared(cp))[0];if(looking)camera.lookAt(looking.pos.x,1.25,looking.pos.z);ui.spectator.innerHTML=`<small>YOU ARE DEAD / SPECTATING</small><b>${esc(target.name)}</b><span>${touchMode()?'Tap Next to switch teammate':'SPACE next teammate · F2 Discord'}</span>`;}else camera.position.set(player.pos.x,.7,player.pos.z);gun.visible=false;return;}
    const move=movement(),moving=controlsAvailable()&&stage==='live'&&Math.hypot(move.x,move.y)>.02,crouch=controlsAvailable()&&isCrouching(),sprint=controlsAvailable()&&isSprinting(),ads=controlsAvailable()&&isAiming();gunBob+=dt*(moving?sprint?13:9:2);camera.position.set(cp.x,crouch?1.05:1.62,cp.z);camera.position.y+=moving?Math.sin(gunBob)*.035:0;camera.rotation.set(pitch,yaw,0);camera.fov=THREE.MathUtils.lerp(camera.fov,ads?58:sprint&&moving?84:78,.15);camera.updateProjectionMatrix();gun.visible=true;
    gun.position.set(ads?.015:.27,-.27+(moving?Math.sin(gunBob)*.012:Math.sin(clock*1.7)*.004)-(reloading>0?.22:0),-.48+recoil*.65);gun.rotation.z=reloading>0?-.5:0;gun.rotation.x=reloading>0?-.28:recoil;}
  function update(dt){dt=Math.min(dt,.1);clock+=dt;if(!running){if(visible&&renderer){updateCamera(dt);renderer.render(scene,camera);}return;}
    if(controlsAvailable()&&touchActive()&&player.alive&&(stage==='live'||stage==='prepare')){const look=ctx.input.consumeLook?.();if(look)applyLook(look.x||0,look.y||0);}
    shotTime=Math.max(0,shotTime-dt);hitTime=Math.max(0,hitTime-dt);damageTime=Math.max(0,damageTime-dt);recoil=Math.max(0,recoil-dt*.09);if(flash)flash.visible=shotTime>weapon.interval-.05;
    for(let i=sparks.length-1;i>=0;i--){sparks[i].life-=dt;if(sparks[i].life<=0){scene.remove(sparks[i].mesh);sparks[i].mesh.geometry.dispose();sparks[i].mesh.material.dispose();sparks.splice(i,1);}}
    if(stage==='queue'){stageTime-=dt;if(stageTime<=0)startRound();}
    else if(stage==='prepare'){stageTime-=dt;const cd=$('.o-countdown');if(cd)cd.textContent=Math.ceil(Math.max(stageTime,0));if(stageTime<=0){stage='live';ui.stage.innerHTML='';if(options.party&&round===1)say('Liltism','taking left');}}
    else if(stage==='roundend'){stageTime-=dt;if(stageTime<=0){if(score[0]>=3||score[1]>=3)finishMatch();else startRound();}}
    else if(stage==='live'){
      roundTime-=dt;if(roundTime<=0)endRound(1,'The extraction window closed');
      if(player.alive&&controlsAvailable()){
        const speed=isCrouching()?1.8:isSprinting()?5.8:3.4,{x:dx,y:dz}=movement();moveBody(player.pos,(Math.cos(yaw)*dx+Math.sin(yaw)*dz)*speed*dt,(-Math.sin(yaw)*dx+Math.cos(yaw)*dz)*speed*dt);if(mouseDown||held('fire'))fire();
        if(player.pos.distanceTo(objectivePos)<2.6){ui.interact.innerHTML=`HOLD <b>${touchMode()?'EXTRACT':'E'}</b> TO SECURE DATA <div class="o-progress"><i style="width:${objective/4*100}%"></i></div>`;if(keys.has('KeyE')||held('interact')){objective+=dt;if(objective>=4)endRound(0,'Data extracted successfully');}else objective=Math.max(0,objective-dt*.4);}else{objective=0;if(!reloading)ui.interact.textContent='';}
      }
      if(reloading>0){reloading-=dt;if(reloading<=0){const needed=Math.min(weapon.mag-ammo,reserve);ammo+=needed;reserve-=needed;ui.interact.textContent='';}}
      updateBots(dt);
    }
    if(voiceTime>0){voiceTime-=dt;if(voiceTime<=0)ui.voice.hidden=true;}
    hudTime-=dt;if(hudTime<=0){hudTime=.12;updateHUD();}
    if(visible&&renderer){updateCamera(dt);renderer.render(scene,camera);ui.hitmarker.style.opacity=hitTime>0?1:0;ui.damage.style.opacity=damageTime>0?damageTime*1.3:0;ui.crosshair.style.setProperty('--o-spread',`${6+recoil*150}px`);updateObjective();ui.resume.hidden=touchMode()||stage!=='live'||document.pointerLockElement===renderer.domElement||chatOpen()||!player.alive;}
  }
  function updateObjective(){if(!camera||!player.alive){ui.objective.style.display='none';return;}projection.copy(objectivePos).setY(1.5).project(camera);const forward=projection.z<1;ui.objective.style.display=stage==='live'&&forward?'flex':'none';ui.objective.style.left=`${clamp((projection.x*.5+.5)*100,7,93)}%`;ui.objective.style.top=`${clamp((-projection.y*.5+.5)*100,18,72)}%`;ui.objective.querySelector('small').textContent=Math.round(player.pos.distanceTo(objectivePos))+' m';}
  function location(){const{x,z}=player.pos;if(z>8)return x>8?'PARKING ENTRANCE':'LOBBY';if(x>4&&z<-5)return'SERVER ROOM';if(x<-10)return z>0?'STAIRWELL B':z<-11?'STORAGE':'PRIVATE OFFICES';if(z<-11&&x<4)return'STORAGE';if(x>9&&z>1)return'WASHROOM';if(x>5)return'PRIVATE OFFICE';return'WORKSPACE';}
  function updateHUD(){ui.timer.textContent=`${Math.floor(Math.max(0,roundTime)/60)}:${String(Math.floor(Math.max(0,roundTime)%60)).padStart(2,'0')}`;ui.timer.classList.toggle('o-urgent',roundTime<20);ui['round-label'].textContent=`ROUND ${round||1} / FIRST TO 3`;ui['score-a'].textContent=score[0];ui['score-b'].textContent=score[1];ui.hp.textContent=Math.ceil(player.hp);ui.armor.textContent=Math.ceil(player.armor);ui.ammo.querySelector('strong').textContent=ammo;ui.ammo.querySelector('div span').textContent=' / '+reserve;ui.location.textContent=location();ui.crosshair.style.display=stage==='live'&&player.alive?'block':'none';if(!ui.scoreboard.hidden)renderScoreboard();}
  let scoreboardMarkup="";
  function renderScoreboard(){const markup=`<div class="o-scoreboard-card"><small>OPERATOR / OFFICE / ${options.ranked?'RANKED':'CASUAL'}</small><h2>MATCH SCOREBOARD</h2><div class="o-sb-heading"><span>OPERATOR</span><span>K</span><span>D</span><span>STATUS</span></div>${[0,1].map(t=>`<div class="o-team-label">${t?'SECURITY':'EXTRACTION'} <b>${score[t]}</b></div>${team.filter(b=>b.team===t).map(b=>`<div class="o-sb-row ${b===player?'o-self':''}"><span>${esc(b.name)}${b===player?' (you)':''}</span><span>${b.kills}</span><span>${b.deaths}</span><span>${b.alive?'ALIVE':'DEAD'}</span></div>`).join('')}`).join('')}<footer>Local match · 0 ms · ${touchMode()?'Tap Scores to close':'Hold TAB to view'}</footer></div>`;if(markup!==scoreboardMarkup){const scroll=ui.scoreboard.firstElementChild?.scrollTop||0;ui.scoreboard.innerHTML=markup;ui.scoreboard.firstElementChild.scrollTop=scroll;scoreboardMarkup=markup;}}
  function say(name,text){ui.voice.hidden=false;ui.voice.innerHTML=`<span>◖))</span> <b>${esc(name)}</b> <span>${esc(text)}</span>`;voiceTime=5;audio('voice',name,text);}
  function chatOpen(){return !ui['chat-form'].hidden;}
  function message(name,text){const div=document.createElement('div');div.innerHTML=`<b>${esc(name)}</b> ${esc(text)}`;ui['chat-log'].appendChild(div);while(ui['chat-log'].children.length>5)ui['chat-log'].firstChild.remove();}
  function openChat(){ui.scoreboard.hidden=true;ui['chat-form'].hidden=false;root.classList.add('o-chat-open');unlock();ui['chat-form'].querySelector('input').focus();}
  function closeChat(){ui['chat-form'].hidden=true;root.classList.remove('o-chat-open');ui['chat-form'].querySelector('input').blur();resetControls();}
  function lock(){if(touchMode()||!renderer||!visible||!running||stage==='finished'||stage==='queue')return;renderer.domElement.requestPointerLock?.()?.catch?.(()=>{});}
  function unlock(){resetControls();if(renderer&&document.pointerLockElement===renderer.domElement)document.exitPointerLock?.();}
  function show(){visible=true;root.hidden=false;root.style.display='';resize();}
  function hide(){unlock();closeChat();visible=false;root.hidden=true;root.style.display='none';ui.scoreboard.hidden=true;}
  function resize(){if(!renderer)return;const w=root.clientWidth||window.visualViewport?.width||window.innerWidth,h=root.clientHeight||window.visualViewport?.height||window.innerHeight;renderer.setPixelRatio(touchMode()?1:Math.min(window.devicePixelRatio||1,1.35));const scale=touchMode()?1.35:1;renderer.setSize(Math.max(1,Math.round(w/scale)),Math.max(1,Math.round(h/scale)),false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  function mobileAction(action){if(!visible||!running)return;if(action==='chat'){if(chatOpen())closeChat();else openChat();return;}if(chatOpen())return;if(action==='scoreboard'){resetControls();ui.scoreboard.hidden=!ui.scoreboard.hidden;if(!ui.scoreboard.hidden)renderScoreboard();return;}if(!ui.scoreboard.hidden)return;if(action==='reload')reload();else if(action==='spectate'&&!player.alive)spectate++;}
  function switchDesktop(){hide();ctx.openApp?.('discord');}
  on(root,'click',e=>{const action=e.target.closest('[data-o]')?.dataset.o;if(action==='leave')end();else if(action==='again'){running=false;start(options);}else if(e.target.closest('.o-switch'))switchDesktop();else if(!e.target.closest('.o-chat-form')&&stage!=='finished')lock();});
  on(window,'keydown',e=>{if(!visible||!running)return;if(e.code==='F2'||(e.altKey&&e.code==='KeyQ')){e.preventDefault();e.stopImmediatePropagation();switchDesktop();return;}if(e.code==='Escape'){if(chatOpen()){closeChat();e.preventDefault();e.stopImmediatePropagation();}return;}if(chatOpen())return;if(e.code==='Enter'){e.preventDefault();e.stopImmediatePropagation();openChat();return;}if(e.code==='Tab'){e.preventDefault();e.stopImmediatePropagation();ui.scoreboard.hidden=false;renderScoreboard();return;}if(e.code==='Space'&&!player.alive){e.preventDefault();spectate++;return;}if(['KeyW','KeyA','KeyS','KeyD','KeyR','KeyE','KeyC','ControlLeft','ShiftLeft','Space'].includes(e.code)){e.preventDefault();e.stopImmediatePropagation();keys.add(e.code);if(e.code==='KeyR')reload();}},true);
  on(window,'keyup',e=>{keys.delete(e.code);if(e.code==='Tab')ui.scoreboard.hidden=true;});
  on(window,'blur',resetControls);
  on(document,'visibilitychange',()=>{if(document.hidden)resetControls();});
  on(document,'pointerlockchange',()=>{if(document.pointerLockElement!==renderer?.domElement)resetControls();});
  on(window,'mousemove',e=>{if(!visible||document.pointerLockElement!==renderer?.domElement||!player.alive||chatOpen())return;applyLook(e.movementX,e.movementY);});
  on(root,'mousedown',e=>{if(touchMode()||document.pointerLockElement!==renderer?.domElement||e.target.closest('button,input,form')||chatOpen())return;if(e.button===0)mouseDown=true;if(e.button===2)aiming=true;});
  on(window,'mouseup',e=>{if(e.button===0)mouseDown=false;if(e.button===2)aiming=false;});on(root,'contextmenu',e=>e.preventDefault());on(window,'resize',resize);
  on(ui['chat-form'],'submit',e=>{e.preventDefault();const input=ui['chat-form'].querySelector('input');const value=input.value.trim();if(value){message('AntiChatLogger',value);if(/hi|yo|gg|nice/i.test(value))message(options.party?'Liltism':'lowlight',/gg/i.test(value)?'gg':'yo');}input.value='';closeChat();lock();});
  on($('.o-chat-close'),'click',closeChat);
  hide();
  return {start,show,hide,update,resize,mobileAction,isChatOpen:chatOpen,isRunning:()=>running,isVisible:()=>visible,getState:()=>({stage,round,party:!!options.party,score:[...score],time:roundTime,health:player.hp,armor:player.armor,ammo,reserve,position:{x:player.pos.x,z:player.pos.z},yaw,pitch,objective,alive:player.alive,chatOpen:chatOpen(),scoreboardOpen:!ui.scoreboard.hidden,rank:stats.rank||rankName(stats.rating||1000),stats:{...stats},bots:bots.map(b=>({name:b.name,team:b.team,alive:b.alive,hp:b.hp,x:b.pos.x,z:b.pos.z}))}),destroy(){handlers.forEach(fn=>fn());unlock();renderer?.dispose();scene?.traverse(o=>{o.geometry?.dispose();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material?.dispose();});texCache.forEach(t=>t.dispose());}};
}

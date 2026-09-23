export const SAVE_KEY = 'antichatlogger.night.v1';
export const clamp = (v, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, v));
export function createState() {
  return { version: 1, totalMinutes: 21*60+18, day:1, money:86.40, needs:{hunger:74,energy:86,hygiene:72,cleanliness:58,mood:76},
    settings:{volume:.45,sensitivity:1,timeScale:.3,pixelScale:2,subtitles:true,touchControls:'auto'},
    hardware:{gpu:0,cpu:0,ram:0,ssd:0,monitor:0,keyboard:0,mouse:0,microphone:0,headset:0,router:0,chair:0},
    room:{light:false,blinds:true,fan:true,rain:true,objects:{},food:0,water:3,position:[.9,1.65,-.15],yaw:0,pitch:-.06},
    orders:[], events:{nextAt:21*60+100,outage:false,eventIndex:0}, notes:'ssd\nremember to send liltism that song\nwhy is there another new folder', photos:[], work:{lastAt:-1000}, temperature:48, savedAt:null };
}
export function loadState(storage) {
  try { const raw=JSON.parse(storage.getItem(SAVE_KEY)); if(!raw || raw.version!==1) return createState();
    const d=createState(); return {...d,...raw,settings:{...d.settings,...raw.settings},room:{...d.room,...raw.room},needs:{...d.needs,...raw.needs},hardware:{...d.hardware,...raw.hardware},events:{...d.events,...raw.events}};
  } catch {return createState();}
}
export function formatTime(total) { const m=Math.floor(total)%1440,h=Math.floor(m/60);return `${h%12||12}:${String(m%60).padStart(2,'0')} ${h>=12?'PM':'AM'}`; }
export function daylight(total) {const h=(total%1440)/60;return h<5.3||h>20.5?0:h<7?(h-5.3)/1.7:h>18?1-(h-18)/2.5:1;}
export function advance(state, dt, resting=false, gaming=false) {
  const minutes=dt*clamp(Number(state.settings.timeScale)||.3,.0167,10); state.totalMinutes+=minutes; state.day=Math.floor(state.totalMinutes/1440)+1;
  state.needs.hunger=clamp(state.needs.hunger-minutes*.042);state.needs.energy=clamp(state.needs.energy+minutes*(resting?.38:-.034));
  state.needs.hygiene=clamp(state.needs.hygiene-minutes*.009);state.needs.mood=clamp(state.needs.mood+minutes*(state.music?.playing?.012:-.004));
  state.temperature += ((gaming?67:43)-state.hardware.gpu*3-state.temperature)*Math.min(1,dt*.03);
  const delivered=[];for(const order of state.orders)if(!order.delivered && state.totalMinutes>=order.arrivesAt){order.delivered=true;delivered.push(order);if(order.type==='food')state.room.food++;else if(order.part && order.part in state.hardware)state.hardware[order.part]++;}
  return delivered;
}
export function saveState(state, storage) { state.savedAt=new Date().toISOString();storage.setItem(SAVE_KEY,JSON.stringify(state)); }

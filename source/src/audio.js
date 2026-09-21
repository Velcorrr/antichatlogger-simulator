// All music and effects are synthesized locally. No recordings or music downloads.
export function createAudio(state, events) {
  let ac, master, rainGain,fanGain,callGain, musicGain, speakerGain, track=null, nextBeat=0,step=0,enabled=true, voiceEnabled=true;
  function init(){if(ac){ac.resume();return;}const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    ac=new AC();master=ac.createGain();master.gain.value=state.settings.volume;master.connect(ac.destination);
    const buf=ac.createBuffer(1,ac.sampleRate*3,ac.sampleRate),data=buf.getChannelData(0);let b=0;for(let i=0;i<data.length;i++){b=(b+Math.random()*.04-.02)/1.02;data[i]=b*3;}
    function noise(freq,gain){const source=ac.createBufferSource();source.buffer=buf;source.loop=true;const filter=ac.createBiquadFilter();filter.type='lowpass';filter.frequency.value=freq;const g=ac.createGain();g.gain.value=gain;source.connect(filter);filter.connect(g);g.connect(master);source.start();return g;}
    rainGain=noise(2100,.23);fanGain=noise(220,.11);callGain=noise(500,0);speakerGain=ac.createGain();speakerGain.gain.value=0;speakerGain.connect(master);musicGain=ac.createGain();musicGain.gain.value=.32;musicGain.connect(master);
    const fan=ac.createOscillator(),fg=ac.createGain();fan.type='sine';fan.frequency.value=58;fg.gain.value=.013;fan.connect(fg);fg.connect(fanGain);fan.start();
    if(state.music?.playing&&state.music.track)playTrack(state.music.track);
  }
  function tone(freq,duration=.1,volume=.05,type='sine',at, target=master){if(!ac)return;const t=at??ac.currentTime,o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),t+.005);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(target);o.start(t);o.stop(t+duration+.01);}
  function burst(duration=.1,volume=.1,cutoff=1500){if(!ac)return;const b=ac.createBuffer(1,Math.ceil(ac.sampleRate*duration),ac.sampleRate);for(let i=0;i<b.length;i++)b.getChannelData(0)[i]=(Math.random()*2-1)*(1-i/b.length);const s=ac.createBufferSource(),g=ac.createGain(),f=ac.createBiquadFilter();s.buffer=b;f.type='lowpass';f.frequency.value=cutoff;g.gain.value=volume;s.connect(f);f.connect(g);g.connect(master);s.start();}
  function playTrack(t){init();if(!ac)return;track=t;step=0;nextBeat=ac.currentTime+.03;}
  function update(){if(!ac)return;const t=ac.currentTime,cv=(state.social?.callVolume??70)/100,connected=state.social?.inCall&&!state.social?.deafened;master.gain.setTargetAtTime(enabled?Number(state.settings.volume):0,t,.1);rainGain.gain.setTargetAtTime(state.room.rain?.2:.015,t,1);fanGain.gain.setTargetAtTime((state.room.fan?.12:.04)*(state.hardware.cpu?.65:1),t,1);callGain.gain.setTargetAtTime(connected?.05*cv:0,t,.3);speakerGain.gain.setTargetAtTime(connected&&state.social.speaker?.17*cv:0,t,.3);
    if(track&&state.music?.playing){let scheduled=0;while(nextBeat<t+.1&&scheduled++<16){const bpm=Number(track.bpm)||124,seed=Number(track.seed)||String(track.id||'1').charCodeAt(0),root=43+(seed%8),scale=[0,3,7,10,12,7,3,14];
      if(step%4===0){tone(48,.23,.38,'sine',nextBeat,musicGain);tone(130,.04,.12,'triangle',nextBeat,musicGain);}
      if(step%8===4){tone(170,.075,.12,'triangle',nextBeat,musicGain);tone(2300,.04,.022,'sawtooth',nextBeat,musicGain);}
      tone(step%2?6500:7600,.025,.012,'square',nextBeat,musicGain);
      if(step%2===0){const n=root+scale[(Math.floor(step/2)+seed)%8];tone(440*2**((n-69)/12),.5,.15,'triangle',nextBeat,musicGain);tone(440*2**((n+24-69)/12),.32,.026,'sine',nextBeat,musicGain);}
      nextBeat+=60/bpm/4;step++;}
    } else nextBeat=t+.04;
    if(speakerGain.gain.value>.001 && Math.random()<.012)tone(110+Math.random()*130,.13,.07,'sawtooth',undefined,speakerGain);
  }
  function voice(name,text){if(name==='Velcorr'||!voiceEnabled||!enabled||state.social?.deafened)return;events.dispatchEvent(new CustomEvent('voice',{detail:{name,text}}));if(!('speechSynthesis'in window)||!ac)return;const u=new SpeechSynthesisUtterance(text.replace(/\*+/g,'[bleep]'));u.pitch=name==='ShowMeYourPeter'?.45:name==='Liltism'?.85:1;u.rate=1.02;u.volume=Math.min(.5,state.settings.volume*.75)*(state.social?.callVolume??70)/100;if(speechSynthesis.pending)return;speechSynthesis.speak(u);}
  return {init,update,playTrack,pauseMusic(){track=null;},setMaster(v){state.settings.volume=v;},setEnabled(v){enabled=v;if(!v&&'speechSynthesis'in window)speechSynthesis.cancel();},setCall(v){if(callGain)callGain.gain.setTargetAtTime(v?.05:0,ac.currentTime,.3);},setSpeaker(v){if(speakerGain)speakerGain.gain.setTargetAtTime(v?.17:0,ac.currentTime,.3);},voice,
    notify(){tone(740,.12,.05);if(ac)tone(990,.2,.04,'sine',ac.currentTime+.1);},click(){burst(.025,.025,2900);},shot(){burst(.15,.27,2900);tone(57,.13,.15,'triangle');},reload(){burst(.1,.065,1300);},hit(){tone(350,.04,.04,'square');},step(){burst(.055,.025,300);},door(){tone(90,.16,.04,'triangle');},drink(){burst(.3,.035,600);},bird(){tone(2600,.075,.02);if(ac)tone(3400,.08,.015,'sine',ac.currentTime+.11);}};
}

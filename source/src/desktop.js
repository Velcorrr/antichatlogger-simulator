import './desktop.css';
import { SAVE_KEY } from './simulation.js';

const ICONS = {
  Discord: '<path d="M7 7c3-2 7-2 10 0l3 10-5 2-1-2h-4l-1 2-5-2 3-10Z"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/>',
  CloudTracks: '<path d="M4 16v-3m3 5V9m3 10V5m3 14V9m3 8v-5m3 4v-3"/>',
  Operator: '<path d="m12 3 8 4v10l-8 4-8-4V7l8-4Z"/><path d="M9 9h6v6H9zM12 1v4m0 14v4M1 12h4m14 0h4"/>',
  Browser: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 7h14M5 17h14"/>',
  Videos: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 6 3-6 3V9Z"/>',
  Files: '<path d="M3 7V5h7l2 3h9v12H3V7Z"/><path d="M3 10h18"/>',
  Settings: '<path d="m10 3 4 0 1 3 3 1 3 3-2 3v4l-4 1-2 3-4-1-1-3-4-1-1-4 3-2V6l4-3Z"/><circle cx="12" cy="12" r="3"/>',
  'Task Manager': '<path d="M3 4v16h18M5 15l4-6 4 4 3-8 4 5"/>',
  Trash: '<path d="M4 6h16M9 3h6M6 6l1 15h10l1-15M10 10v7m4-7v7"/>',
};
const APP_COLORS = { Discord: '#9398ec', CloudTracks: '#ffb477', Operator: '#c9cebc', Browser: '#86b7cf', Videos: '#de8c92', Files: '#dec681', Settings: '#a7b2c1', 'Task Manager': '#8cb8a5', Trash: '#a0a4af' };
const icon = (app, cls = '') => `<svg class="d-icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[app] || ICONS.Files}</svg>`;
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dollars = value => `$${Number(value || 0).toFixed(2)}`;

export const TRACKS = [
  { id: 'still', title: 'still here (prod. underpass)', artist: 'lowsignal', plays: 817, followers: 127, color: '#526d7b', bpm: 132, seed: 41, album: 'windows open', duration: 146, description: 'made this last night. underpass on the keys', tags: 'ambient trap · bedroom', comments: [['emptycache', 'this feels like 4am'], ['underpass', '🖤'], ['AntiChatLogger', 'this hard']], related: ['empty', 'pull'] },
  { id: 'empty', title: 'empty parking lot', artist: 'underpass', plays: 213, followers: 84, color: '#92916d', bpm: 119, seed: 83, album: 'afterimage', duration: 123, description: 'no drums version in the downloads. thx for listening', tags: 'instrumental · night drive', comments: [['lowsignal', 'need this'], ['outofservice', 'those chords']], related: ['static', 'snow'] },
  { id: 'pull', title: 'pull away [rough]', artist: 'sleepcursor', plays: 1847, followers: 692, color: '#786487', bpm: 145, seed: 19, album: 'desktop demos', duration: 164, description: 'mix is probably quiet sorry', tags: 'cloud · demo', comments: [['lowsignal', 'reposted'], ['fxoc', 'why is it underwater']], related: ['side', 'empty'] },
  { id: 'static', title: 'static on the 4th floor', artist: 'outofservice', plays: 692, followers: 231, color: '#58665a', bpm: 128, seed: 111, album: 'rooms nobody uses', duration: 189, description: 'recorded the rain outside my window', tags: 'ambient · tape', comments: [['underpass', 'lets work'], ['cachemiss', 'found this thru underpass']], related: ['snow', 'low'] },
  { id: 'snow', title: 'snowfall / 3:12', artist: 'cachemiss', plays: 94, followers: 31, color: '#7b848e', bpm: 108, seed: 209, album: 'unsent', duration: 132, description: 'first upload here', tags: 'instrumental · first upload', comments: [['outofservice', 'keep going']], related: ['low', 'side'] },
  { id: 'side', title: 'side streets w/ lowsignal', artist: 'halfawake', plays: 8103, followers: 2181, color: '#9d735c', bpm: 138, seed: 76, album: 'nothing to do', duration: 171, description: 'lowsignal verse still my favorite', tags: 'underground · collaboration', comments: [['sleepcursor', 'been waiting'], ['AntiChatLogger', 'ye']], related: ['still', 'low'] },
  { id: 'low', title: 'low battery [snippet]', artist: 'nightservice', plays: 127, followers: 56, color: '#677889', bpm: 151, seed: 155, album: 'untitled folder', duration: 72, description: 'might finish this', tags: 'snippet · bedroom', comments: [['cachemiss', 'finish it pls']], related: ['snow', 'still'] },
  { id: 'deleted', title: '[track deleted]', artist: 'sleepcursor', plays: 0, followers: 692, color: '#41454c', bpm: 120, seed: 9, album: 'desktop demos', duration: 0, deleted: true, description: 'The artist removed this upload.', comments: [], related: ['pull'] },
];

const PARTS = [
  ['gpu', 'Aster 760 graphics card', 149, 'Smoother Operator · quieter fans', '6 GB · dual fan'],
  ['cpu', 'Hexa 5600 processor', 119, 'Faster match loading · lower CPU load', '6 cores · 12 threads'],
  ['ram', '16 GB memory kit', 39, 'More room for background applications', '2 × 8 GB · 3200 MHz'],
  ['ssd', '1 TB solid state drive', 49, 'Doubles storage · faster loading', 'NVMe · 1 TB'],
  ['monitor', '24 inch 144 Hz display', 109, 'A larger, clearer screen at the desk', '1080p · IPS'],
  ['keyboard', 'Quiet mechanical keyboard', 44, 'Quieter keystrokes · new desk lighting', '75% · linear switches'],
  ['mouse', 'Lightweight wired mouse', 29, 'A new mouse on the desk', '59 g · optical sensor'],
  ['microphone', 'Desk condenser microphone', 59, 'Clearer outgoing voice', 'USB · boom mount'],
  ['headset', 'Closed back headset', 45, 'Better isolation from the PC fans', 'Wired · detachable mic'],
  ['router', 'Dual band router', 49, 'A more stable connection', 'Gigabit · Wi-Fi 6'],
  ['chair', 'Used ergonomic chair', 79, 'More comfort during long nights', 'Refurbished · adjustable'],
];

const FOLDERS = {
  'stuff': [['notes.txt', 'remember to send bits the screenshot\n\nrouter password is on the bottom\n\nstop saving things here'], ['pc parts.txt', 'maybe ram first\nssd almost full\ngpu still works honestly\n\ncheck local used prices'], ['receipt_04.txt', 'Corner Market\n1x bottled water\n1x noodles\n\nTotal: $4.80']],
  'new folder': [['untitled.txt', ''], ['untitled (2).txt', 'operator\n\nget on']],
  'new folder (2)': [['actually important.txt', 'the good version is in stuff\n\nupdate: no it isnt'], ['old_setup.txt', 'Old setup\n60hz monitor\n8gb ram\nheadset with the left side taped\n\nworked fine mostly']],
  'operator clips': [['office_1v2.clip', 'video'], ['liltism_flash.clip', 'video'], ['office_almost.clip', 'video'], ['readme.txt', 'first clip has no audio\nsecond one is his fault']],
  'music': [['night folder.playlist', 'playlist'], ['track ids.txt', 'lowsignal / still here\nunderpass / empty parking lot\ncachemiss — only 31 followers??\n\nfollow the reposts'], ['mixdown_final_FINAL.wav', 'audio']],
  'downloads': [['driver_notes.txt', 'Display driver 24.9\nRestart recommended.\n\nKnown issue: display may briefly turn black when switching fullscreen apps.'], ['survey_receipt.txt', 'Smalltask\nThank you for completing a survey.\nPayment: $3.20'], ['archive_009.txt', 'bitsproxy.com / asset archive\n\n[REDACTED ASSET]\n[ASSET REMOVED BY MODERATION]\n\nNo asset content stored in this copy.']],
  'images': [['old_desktop.svg', 'image'], ['rain_001.svg', 'image'], ['setup_before.svg', 'image']],
  'dont open': [['grocery list.txt', 'water\npaper towels\ntrash bags\nactual food'], ['passwords.txt', 'nice try\n\nuse a password manager'], ['thoughts.txt', 'the house is so loud in the day\nit is quieter here at night']],
};

export function createDesktop(root, ctx) {
  const state = ctx.state;
  state.desktop ||= { positions: {}, trash: ['old_driver.zip', 'clip_final_final.mp4', 'unnamed (18).png'], storageUsed: 232 };
  state.desktop.positions ||= {};
  state.desktop.trash ||= ['old_driver.zip', 'clip_final_final.mp4', 'unnamed (18).png'];
  state.desktop.storageUsed ??= 232;
  state.music ||= { playing: false, track: TRACKS[0], liked: ['still', 'side'], playlist: ['still', 'empty', 'side'], progress: 0 };
  state.music.liked ||= [];
  state.music.playlist ||= [];
  state.music.track = TRACKS.find(t => !t.deleted && t.id === (state.music.track?.id || state.music.track)) || TRACKS[0];
  state.music.progress ||= 0;
  state.orders ||= [];
  state.settings ||= { volume: .55, sensitivity: 1, timeScale: .3, pixelScale: 2, subtitles: true };
  state.hardware ||= Object.fromEntries(PARTS.map(([key]) => [key, 0]));
  let social = ctx.social;
  let visible = false;
  let z = 20;
  let active = 'Discord';
  let tick = 0;
  let filePath = '';
  let browserRoute = 'start';
  let browserBack = [];
  let musicView = 'stream';
  let musicArtist = '';
  let musicSearch = '';
  let currentVideo = 0;
  let videoPlaying = false;
  let videoProgress = 0;
  let videoSound = false;
  let lastTaskRefresh = 0;
  let lastOrderState = '';
  const windows = new Map();
  const apps = Object.keys(ICONS);
  const save = () => ctx.save?.();
  const toast = text => ctx.toast?.(text);
  root.classList.add('d-desktop');
  root.innerHTML = `<div class="d-wallpaper"><div class="d-stars"></div><div class="d-mountain d-mountain-back"></div><div class="d-mountain d-mountain-front"></div><div class="d-grid"></div><span class="d-wall-caption">somewhere, still awake.</span></div>
    <div class="d-desktop-head"><div class="d-account-mark">a.</div><div><span>steven</span><small>AntiChatLogger</small></div><span class="d-network"><i></i> connected</span></div>
    <nav class="d-shortcuts" aria-label="Desktop applications">${apps.map(app => `<button data-open="${app}" class="d-shortcut" title="Open ${app}"><span style="color:${APP_COLORS[app]}">${icon(app)}</span><label>${app}</label></button>`).join('')}</nav>
    <div class="d-window-area"></div>
    <button class="d-leave" data-desktop-action="leave"><span>↖</span> Leave desk</button>
    <div class="d-switch-hint"><kbd>F2</kbd> switch to Operator</div>
    <nav class="d-taskbar" aria-label="Running applications"><button class="d-start" data-desktop-action="start" title="All applications"><span>◧</span> <b>start</b></button><div class="d-tasks"></div><div class="d-tray"><button class="d-tray-music" data-open="CloudTracks" title="Music">♫</button><span class="d-online-dot"></span><button class="d-clock" data-open="Settings"><b></b><small>Sunday, Sep 20</small></button></div></nav>
    <div class="d-start-menu" hidden><div class="d-start-profile"><b>steven</b><span>AntiChatLogger · local account</span></div>${apps.map(app => `<button data-open="${app}"><span style="color:${APP_COLORS[app]}">${icon(app)}</span>${app}</button>`).join('')}<button data-desktop-action="save">↓ Save session</button><button data-desktop-action="leave">↖ Stand up</button></div>`;
  const windowArea = root.querySelector('.d-window-area');
  root.addEventListener('pointerdown', event => { event.stopPropagation(); });
  root.addEventListener('click', event => {
    const button = event.target.closest('[data-open],[data-desktop-action]');
    if (!button) return;
    ctx.audio?.click?.();
    if (button.dataset.open) { open(button.dataset.open); root.querySelector('.d-start-menu').hidden = true; }
    switch (button.dataset.desktopAction) {
      case 'start': root.querySelector('.d-start-menu').hidden = !root.querySelector('.d-start-menu').hidden; break;
      case 'leave': ctx.leavePC?.(); break;
      case 'save': save(); toast('Session saved.'); root.querySelector('.d-start-menu').hidden = true; break;
    }
  });
  function screenLight() {
    const brightness = active === 'Browser' ? .95 : active === 'Operator' ? .3 : active === 'Files' ? .75 : .6;
    ctx.events?.dispatchEvent(new CustomEvent('screen-light', { detail: { brightness } }));
    social?.setVisible?.(visible && active === 'Discord' && windows.get('Discord')?.status === 'open');
  }
  function focusWindow(app) {
    const win = windows.get(app);
    if (!win) return;
    active = app;
    win.el.style.zIndex = ++z;
    for (const [name, item] of windows) item.el.classList.toggle('d-focused', name === app);
    screenLight();
    renderTaskbar();
  }
  function renderTaskbar() {
    root.querySelector('.d-tasks').innerHTML = [...windows].filter(([, win]) => win.status !== 'closed').map(([app, win]) => `<button class="d-task ${active === app && win.status === 'open' ? 'd-task-active' : ''}" data-task="${app}" title="${app}"><span style="color:${APP_COLORS[app]}">${icon(app)}</span><span>${app}</span>${app === 'Discord' && social?.getUnread?.() ? '<i></i>' : ''}</button>`).join('');
    root.querySelectorAll('[data-task]').forEach(button => button.addEventListener('click', () => {
      const app = button.dataset.task;
      const win = windows.get(app);
      if (app === active && win.status === 'open') minimize(app); else open(app);
    }));
  }
  function minimize(app) {
    const win = windows.get(app);
    win.status = 'minimized'; win.el.hidden = true;
    const next = [...windows].filter(([, w]) => w.status === 'open').sort((a, b) => Number(b[1].el.style.zIndex) - Number(a[1].el.style.zIndex))[0];
    if (next) focusWindow(next[0]); else { active = ''; screenLight(); renderTaskbar(); }
  }
  function close(app) {
    minimize(app); windows.get(app).status = 'closed'; renderTaskbar();
  }
  function maximize(app) {
    const win = windows.get(app);
    win.maximized = !win.maximized;
    win.el.classList.toggle('d-maximized', win.maximized);
    win.el.querySelector('[data-control="maximize"]').title = win.maximized ? 'Restore' : 'Maximize';
  }
  function makeWindow(app) {
    const el = document.createElement('section');
    el.className = `d-window d-app-${app.toLowerCase().replace(' ', '-')}`;
    el.setAttribute('aria-label', `${app} window`);
    let sizes = app === 'Discord' ? [61, 74, 10, 12] : app === 'CloudTracks' ? [26, 66, 73, 19] : [65, 73, 18 + (windows.size % 3) * 2, 12 + (windows.size % 3) * 3];
    const saved = state.desktop.positions[app];
    el.style.cssText = `width:${sizes[0]}vw;height:${sizes[1]}vh;left:${sizes[2]}vw;top:${sizes[3]}vh;`;
    if (saved && saved.left < innerWidth - 100 && saved.top < innerHeight - 100) {
      el.style.left = `${saved.left}px`; el.style.top = `${saved.top}px`;
      el.style.width = `${Math.min(saved.width, innerWidth - 20)}px`; el.style.height = `${Math.min(saved.height, innerHeight - 100)}px`;
    }
    el.innerHTML = `<header class="d-titlebar"><span class="d-title-icon" style="color:${APP_COLORS[app]}">${icon(app)}</span><b>${app}</b>${app === 'Discord' ? '<span class="d-title-detail">the gc</span>' : ''}<div class="d-window-controls"><button data-control="minimize" title="Minimize">―</button><button data-control="maximize" title="Maximize">□</button><button data-control="close" title="Close">×</button></div></header><div class="d-app-content"></div><div class="d-resize" aria-label="Resize window"></div>`;
    windowArea.append(el);
    const win = { el, content: el.querySelector('.d-app-content'), status: 'open', maximized: false };
    windows.set(app, win);
    el.addEventListener('pointerdown', () => { if (active !== app) focusWindow(app); });
    el.querySelectorAll('[data-control]').forEach(button => button.addEventListener('click', () => ({ minimize, maximize, close }[button.dataset.control](app))));
    const header = el.querySelector('.d-titlebar');
    header.addEventListener('dblclick', event => { if (!event.target.closest('button')) maximize(app); });
    function handleMove(handle, resize) {
      handle.addEventListener('pointerdown', event => {
        if (event.target.closest('button') || win.maximized) return;
        const rect = el.getBoundingClientRect();
        const initial = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top, width: rect.width, height: rect.height };
        handle.setPointerCapture(event.pointerId);
        function move(e) {
          if (resize) {
            el.style.width = `${Math.max(app === 'CloudTracks' ? 300 : 440, Math.min(innerWidth - initial.left, initial.width + e.clientX - initial.x))}px`;
            el.style.height = `${Math.max(300, Math.min(innerHeight - initial.top - 46, initial.height + e.clientY - initial.y))}px`;
          } else {
            el.style.left = `${Math.max(0, Math.min(innerWidth - 170, initial.left + e.clientX - initial.x))}px`;
            el.style.top = `${Math.max(0, Math.min(innerHeight - 110, initial.top + e.clientY - initial.y))}px`;
          }
        }
        function end() {
          handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', end); handle.removeEventListener('pointercancel', end);
          const rect = el.getBoundingClientRect();
          state.desktop.positions[app] = { left: rect.left, top: rect.top, width: rect.width, height: rect.height }; save();
        }
        handle.addEventListener('pointermove', move); handle.addEventListener('pointerup', end, { once: true }); handle.addEventListener('pointercancel', end, { once: true });
      });
    }
    handleMove(header, false); handleMove(el.querySelector('.d-resize'), true);
    return win;
  }
  function open(app) {
    app = apps.find(name => name.toLowerCase() === String(app).toLowerCase()) || 'Browser';
    let win = windows.get(app);
    if (!win) { win = makeWindow(app); renderApp(app); }
    else if (['Settings', 'Task Manager', 'Trash', 'Operator'].includes(app)) renderApp(app);
    win.status = 'open'; win.el.hidden = false;
    focusWindow(app);
  }
  function renderApp(app) {
    const container = windows.get(app).content;
    switch (app) {
      case 'Discord': if (social) social.mount(container); else container.innerHTML = '<div class="d-empty">Connecting to Discord…</div>'; break;
      case 'CloudTracks': renderMusic(); break;
      case 'Browser': renderBrowser(); break;
      case 'Operator': renderOperator(); break;
      case 'Files': renderFiles(); break;
      case 'Videos': renderVideos(); break;
      case 'Settings': renderSettings(); break;
      case 'Task Manager': renderManager(); break;
      case 'Trash': renderTrash(); break;
    }
  }

  function art(track, extra = '') { return `<div class="d-cover ${extra}" style="--cover:${track.color};--rotation:${track.seed % 90}deg"><i></i><span>${track.id === 'still' ? 'still<br>here.' : esc(track.artist)}</span><small>${esc(track.album)}</small></div>`; }
  function play(track) {
    if (track.deleted) { toast('This upload is no longer available.'); return; }
    if (state.music.track.id === track.id && state.music.playing) {
      state.music.playing = false; ctx.audio?.pauseMusic?.();
    } else {
      if (state.music.track.id !== track.id) state.music.progress = 0;
      state.music.track = track; state.music.playing = true; ctx.audio?.playTrack?.(track);
    }
    save(); if (windows.has('CloudTracks')) renderMusic();
  }
  function musicList(tracks) {
    return tracks.map(track => `<div class="d-track-row ${track.deleted ? 'd-track-deleted' : ''} ${track.id === state.music.track.id ? 'd-track-current' : ''}"><button class="d-track-play" data-play="${track.id}" aria-label="Play ${esc(track.title)}">${state.music.playing && state.music.track.id === track.id ? 'Ⅱ' : '▶'}</button><button class="d-track-info" data-track="${track.id}"><b>${esc(track.title)}</b><small>${esc(track.artist)} <span>· ${track.plays.toLocaleString()} plays</span></small></button><button class="d-track-heart ${state.music.liked.includes(track.id) ? 'd-liked' : ''}" data-like="${track.id}" title="Like track">${state.music.liked.includes(track.id) ? '♥' : '♡'}</button></div>`).join('');
  }
  function renderMusic() {
    const container = windows.get('CloudTracks').content;
    const track = state.music.track;
    const viewTrack = TRACKS.find(t => t.id === musicView);
    let content = '';
    if (viewTrack) {
      content = `<button class="d-back" data-music-view="stream">← Back to stream</button>${art(viewTrack, 'd-cover-large')}<div class="d-music-detail"><button class="d-artist-link" data-artist="${viewTrack.artist}">${esc(viewTrack.artist)}</button><h2>${esc(viewTrack.title)}</h2><p>${esc(viewTrack.description)}</p><small>${esc(viewTrack.tags)} · ${viewTrack.plays.toLocaleString()} plays</small><div class="d-button-row"><button class="d-button d-orange" data-play="${viewTrack.id}">${track.id === viewTrack.id && state.music.playing ? 'Ⅱ Pause' : '▶ Play'}</button><button class="d-button" data-playlist="${viewTrack.id}">${state.music.playlist.includes(viewTrack.id) ? '✓ In playlist' : '+ Playlist'}</button><button class="d-button" data-repost="${viewTrack.id}">↻ Repost</button></div><h4>${esc(viewTrack.album)}</h4>${musicList(TRACKS.filter(t => t.album === viewTrack.album))}<h4>Comments</h4>${viewTrack.comments.map(([user, body]) => `<p class="d-track-comment"><b>${esc(user)}</b><span>${esc(body)}</span></p>`).join('')}${(state.music.comments?.[viewTrack.id] || []).map(body => `<p class="d-track-comment"><b>AntiChatLogger</b><span>${esc(body)}</span></p>`).join('')}<form class="d-comment-form"><input name="comment" maxlength="180" placeholder="Write a comment…" autocomplete="off"><button>↵</button></form><h4>Follow the reposts</h4>${musicList(TRACKS.filter(t => viewTrack.related.includes(t.id)))}</div>`;
    } else if (musicView === 'artist') {
      const artistTracks = TRACKS.filter(t => t.artist === musicArtist);
      const artist = artistTracks[0];
      content = `<button class="d-back" data-music-view="stream">← Back</button><div class="d-artist-header">${art(artist)}<small>ARTIST / PRODUCER</small><h2>${esc(musicArtist)}</h2><p>${artist.followers} followers · ${artistTracks.length} uploads</p><button class="d-button" data-follow="${esc(musicArtist)}">${state.music.followed?.includes(musicArtist) ? '✓ Following' : '+ Follow'}</button></div><div class="d-music-section"><h4>Uploads</h4>${musicList(artistTracks)}<h4>Reposted by ${esc(musicArtist)}</h4>${musicList(TRACKS.filter(t => artist.related.includes(t.id)))}</div>`;
    } else {
      const tracks = musicView === 'likes' ? TRACKS.filter(t => state.music.liked.includes(t.id)) : musicView === 'playlist' ? TRACKS.filter(t => state.music.playlist.includes(t.id)) : musicSearch ? TRACKS.filter(t => `${t.artist} ${t.title}`.toLowerCase().includes(musicSearch.toLowerCase())) : TRACKS.slice(0, 5);
      content = `${musicView === 'stream' && !musicSearch ? `<div class="d-music-feature"><small>FROM YOUR CORNER OF THE INTERNET</small>${art(TRACKS[0], 'd-cover-feature')}<div class="d-feature-copy"><span>lowsignal</span><h2>still here.</h2><small>817 plays. you found it early.</small><button class="d-feature-play" data-play="still" title="Play still here">${state.music.playing && track.id === 'still' ? 'Ⅱ' : '▶'}</button></div></div>` : ''}<div class="d-music-section"><div class="d-section-heading"><h3>${musicSearch ? 'Search results' : musicView === 'likes' ? 'Your likes' : musicView === 'playlist' ? 'night folder' : 'Your stream'}</h3><small>${musicSearch ? tracks.length + ' tracks' : musicView === 'stream' ? 'small artists, late uploads' : 'by AntiChatLogger'}</small></div>${tracks.length ? musicList(tracks) : '<p class="d-muted">Nothing here yet. Follow a repost somewhere.</p>'}${musicView === 'stream' && !musicSearch ? `<div class="d-repost-note"><span>↻</span><p><b>underpass</b> reposted <button data-track="snow">snowfall / 3:12</button><small>cachemiss · 94 plays · 31 followers</small></p></div><button class="d-deep-link" data-artist="cachemiss">Keep digging <span>↗</span></button>` : ''}</div>`;
    }
    container.innerHTML = `<div class="d-cloud"><header class="d-cloud-header"><b>${icon('CloudTracks')} cloudtracks</b><span>Anti</span></header><nav class="d-cloud-nav">${[['stream', 'Stream'], ['likes', 'Likes'], ['playlist', 'Playlist']].map(([id, title]) => `<button data-music-view="${id}" class="${musicView === id ? 'd-selected' : ''}">${title}</button>`).join('')}<button data-music-view="search" title="Search music">⌕</button></nav>${musicView === 'search' || musicSearch ? `<form class="d-music-search"><input name="search" placeholder="Artists, tracks, anything…" value="${esc(musicSearch)}"><button>Search</button></form>` : ''}<div class="d-cloud-scroll">${content}</div><footer class="d-player"><div class="d-player-progress"><i style="width:${(state.music.progress || 0) / track.duration * 100}%"></i></div><div class="d-player-main"><button class="d-player-toggle" data-play="${track.id}" aria-label="${state.music.playing ? 'Pause' : 'Play'} music">${state.music.playing ? 'Ⅱ' : '▶'}</button><button class="d-player-title" data-track="${track.id}"><b>${esc(track.title)}</b><small>${esc(track.artist)}</small></button><button class="d-player-next" data-next="true" title="Next track">▸▸</button><span class="d-equalizer ${state.music.playing ? 'd-playing' : ''}"><i></i><i></i><i></i><i></i></span></div></footer></div>`;
    container.onclick = event => {
      const b = event.target.closest('button'); if (!b) return;
      if (b.dataset.play) play(TRACKS.find(t => t.id === b.dataset.play));
      if (b.dataset.musicView) { musicView = b.dataset.musicView; musicSearch = ''; renderMusic(); }
      if (b.dataset.track) { musicView = b.dataset.track; renderMusic(); }
      if (b.dataset.artist) { musicArtist = b.dataset.artist; musicView = 'artist'; renderMusic(); }
      if (b.dataset.like) { toggleList('liked', b.dataset.like); renderMusic(); }
      if (b.dataset.playlist) { toggleList('playlist', b.dataset.playlist); renderMusic(); }
      if (b.dataset.follow) { state.music.followed ||= []; toggleList('followed', b.dataset.follow); renderMusic(); }
      if (b.dataset.repost) { state.music.reposts ||= []; if (!state.music.reposts.includes(b.dataset.repost)) state.music.reposts.push(b.dataset.repost); save(); toast('Reposted to your profile.'); }
      if (b.dataset.next) nextTrack();
    };
    container.querySelector('.d-comment-form')?.addEventListener('submit', event => {
      event.preventDefault(); const input = event.target.elements.comment; const body = input.value.trim(); if (!body) return;
      state.music.comments ||= {}; state.music.comments[viewTrack.id] ||= []; state.music.comments[viewTrack.id].push(body); save(); renderMusic();
    });
    container.querySelector('.d-music-search')?.addEventListener('submit', event => { event.preventDefault(); musicSearch = event.target.elements.search.value.trim(); musicView = 'stream'; renderMusic(); });
  }
  function toggleList(list, id) { const items = state.music[list]; const i = items.indexOf(id); if (i < 0) items.push(id); else items.splice(i, 1); save(); }
  function nextTrack() {
    const playable = TRACKS.filter(t => !t.deleted);
    const queued = playable.filter(t => state.music.playlist.includes(t.id));
    const playlist = queued.length ? queued : playable;
    const index = playlist.findIndex(t => t.id === state.music.track.id);
    state.music.playing = false;
    state.music.progress = 0;
    play(playlist[(index + 1) % playlist.length]);
  }

  function navigate(route) { if (route !== browserRoute) browserBack.push(browserRoute); browserRoute = route; renderBrowser(); }
  function renderBrowser() {
    const container = windows.get('Browser').content;
    const urls = { start: 'new tab', bits: 'bitsproxy.com', food: 'nightowl.local/menu', hardware: 'secondbyte.local/shop', tasks: 'smalltask.local', orders: 'nightowl.local/orders', assets: 'bitsproxy.com/archive', logs: 'bitsproxy.com/devlog' };
    let content = '';
    if (browserRoute === 'start') content = `<div class="d-browser-home"><div class="d-browser-wordmark">afterhours<span>●</span></div><p>One more tab.</p><form class="d-browser-search"><input name="url" placeholder="Search your bookmarks or enter an address" autocomplete="off"><button>↗</button></form><div class="d-bookmarks"><button data-route="bits"><span>bp</span><b>bitsproxy.com</b><small>development / experiments</small></button><button data-route="food"><span>☾</span><b>Night Owl</b><small>something to eat</small></button><button data-route="hardware"><span>▤</span><b>Secondbyte</b><small>parts, mostly used</small></button><button data-route="tasks"><span>✓</span><b>Smalltask</b><small>a little extra</small></button></div><small class="d-browser-local">Your saved corner of the internet.</small></div>`;
    else if (['bits', 'assets', 'logs'].includes(browserRoute)) content = `<div class="d-bits"><header><button data-route="bits">bitsproxy<span>.com</span></button><nav><button data-route="logs">devlog</button><button data-route="assets">archive</button><button data-route="bits">about</button></nav></header><small class="d-eyebrow">PERSONAL SITE / ${browserRoute === 'assets' ? 'ARCHIVE' : browserRoute === 'logs' ? 'DEVELOPMENT LOG' : 'INDEX'}</small><h1>${browserRoute === 'assets' ? 'things i uploaded.' : browserRoute === 'logs' ? 'it works on my machine.' : 'making things,<br>breaking other things.'}</h1><p class="d-bits-intro">roblox systems, little utilities, things i forgot to finish.<br>if something is broken it is probably staying that way for a bit.</p>${browserRoute === 'assets' ? `<div class="d-bits-project"><b>asset experiment 019</b><span>[REDACTED ASSET]</span><small>Archived metadata only. Asset content unavailable.</small></div><div class="d-bits-project"><b>upload test 022</b><span>[ASSET REMOVED BY MODERATION]</span><small>Archived metadata only.</small></div><div class="d-bits-project"><b>terrain palette v3</b><span class="d-palette">▰ ▰ ▰ ▰ ▰ ▰</span><small>six colors for a place that still doesn't have a name.</small></div>` : browserRoute === 'logs' ? `<article class="d-blog-entry"><small>20 SEP · 00:14</small><h3>finally fixed the inventory thing</h3><p>the item id was being overwritten when a player moved slots. changed how the local cache updates. no more disappearing furniture.</p><p>fear found a different bug within four minutes.</p></article><article class="d-blog-entry"><small>18 SEP · 02:31</small><h3>asset archive changes</h3><p>thumbnails for removed assets are gone. metadata only now. some old links will 404.</p></article><article class="d-blog-entry"><small>15 SEP · 23:07</small><h3>site is back</h3><p>accidentally pointed the domain at the old deployment. thanks anti.</p></article>` : `<div class="d-bits-project"><span>01 / ROBLOX</span><h3>inventory prototype</h3><p>Persistent slots, drag and drop, occasional furniture.</p><button data-route="logs">read the devlog ↗</button></div><div class="d-bits-project"><span>02 / ARCHIVE</span><h3>asset experiments</h3><p>A messy index of things that used to work.</p><button data-route="assets">browse archive ↗</button></div><div class="d-bits-project"><span>03 / UTILITIES</span><h3>color picker</h3><p>At least this one works.</p><input aria-label="Color picker" type="color" value="#8da898"> <code id="d-color-code">#8da898</code></div>`}<footer>bitsproxy · last seen probably on roblox</footer></div>`;
    else if (browserRoute === 'food') content = `<div class="d-shop d-food"><header><b>☾ night owl</b><button data-route="orders">Your orders</button></header><div class="d-shop-hero"><small>THE KITCHEN IS STILL OPEN</small><h1>You're up.<br>So are we.</h1><p>Delivered to your door in about 12 minutes.</p><span>Wallet <b class="d-wallet">${dollars(state.money)}</b></span></div><div class="d-shop-grid">${[['noodles', 'Late noodles', 'Ginger broth, noodles, an egg.', 8.5, '≋'], ['burger', 'The usual', 'Burger, fries. Nothing complicated.', 12.5, '☷'], ['rice', 'Rice bowl', 'Chicken, rice, something green.', 10, '◡'], ['coffee', 'Iced coffee', 'One more hour.', 3.5, '▥']].map(([id, name, desc, cost, glyph]) => `<article class="d-food-card"><div>${glyph}</div><h3>${name}</h3><p>${desc}</p><button data-food="${id}" data-name="${name}" data-cost="${cost}">Order <b>${dollars(cost)}</b></button></article>`).join('')}</div></div>`;
    else if (browserRoute === 'hardware') content = `<div class="d-shop d-hardware"><header><b>secondbyte<span> / parts that work</span></b><button data-route="orders">Orders</button></header><div class="d-hardware-hero"><small>NEW TO YOU. GOOD ENOUGH FOR US.</small><h1>A little more<br>headroom.</h1><p>Tested hardware. Local delivery.</p><span>Available <b>${dollars(state.money)}</b></span></div><div class="d-hardware-list">${PARTS.map(([part, name, cost, effect, spec]) => { const pending = state.orders.some(o => o.part === part && !o.delivered); return `<article><div class="d-part-art">${['gpu', 'ram', 'ssd', 'cpu'].includes(part) ? '▦' : part === 'monitor' ? '▣' : part === 'chair' ? '♜' : '◈'}</div><div><small>${part.toUpperCase()} ${state.hardware[part] ? '· UPGRADED' : ''}</small><h3>${name}</h3><p>${spec}</p><span>${effect}</span></div><button data-part="${part}" ${state.hardware[part] || pending ? 'disabled' : ''}>${state.hardware[part] ? 'Installed' : pending ? 'On the way' : dollars(cost) + ' ↗'}</button></article>`; }).join('')}</div></div>`;
    else if (browserRoute === 'orders') content = `<div class="d-orders"><small class="d-eyebrow">DELIVERIES</small><h1>On the way.</h1>${state.orders.length ? state.orders.slice().reverse().map(order => `<article><span>${order.type === 'food' ? '☾' : '▤'}</span><div><h3>${esc(order.name)}</h3><small>${dollars(order.cost)} · order #${esc(String(order.id).slice(-5))}</small></div><b>${order.delivered ? 'Delivered' : `${Math.max(0, Math.ceil(order.arrivesAt - (state.totalMinutes || 0)))} min`}</b></article>`).join('') : '<p>No orders yet.</p>'}<div class="d-button-row"><button class="d-button" data-route="food">Order food</button><button class="d-button" data-route="hardware">Browse hardware</button></div></div>`;
    else if (browserRoute === 'tasks') content = `<div class="d-smalltask"><small>smalltask / work available</small><h1>A few minutes.<br>A few dollars.</h1><p>Small, ordinary jobs. Paid to your wallet.</p><div class="d-task-work"><span>DATA ENTRY</span><h3>Archive label check</h3><p>Copy this shipping label exactly:</p><code>SB-2049-OFFICE</code><form class="d-work-form"><input name="answer" placeholder="Enter the label" required autocomplete="off"><button class="d-button d-orange">Submit · $3.20</button></form><small>One task per 20 in-game minutes.</small></div><div class="d-task-work"><span>LOCAL LISTINGS</span><h3>Sell the old external drive</h3><p>It has been sitting in the drawer for months.</p><button class="d-button" data-sell="true" ${state.desktop.soldDrive ? 'disabled' : ''}>${state.desktop.soldDrive ? 'Sold · $18 received' : 'Accept local offer · $18'}</button></div><span class="d-task-wallet">Wallet: ${dollars(state.money)}</span></div>`;
    else content = `<div class="d-empty"><h2>This page isn't in your saved internet.</h2><p>Try bitsproxy.com, nightowl.local, secondbyte.local or smalltask.local.</p><button class="d-button" data-route="start">Back to bookmarks</button></div>`;
    container.innerHTML = `<div class="d-browser"><div class="d-browser-bar"><button data-browser-back="true" title="Back">←</button><button data-route="start" title="Home">⌂</button><form class="d-url-form"><span>◇</span><input name="url" aria-label="Address" value="${esc(urls[browserRoute] || browserRoute)}"><button title="Go">↵</button></form><button data-route="${browserRoute}" title="Reload">↻</button></div><main class="d-browser-page">${content}</main></div>`;
    container.onclick = event => {
      const b = event.target.closest('button'); if (!b) return;
      if (b.dataset.route) navigate(b.dataset.route);
      if (b.dataset.browserBack) { browserRoute = browserBack.pop() || 'start'; renderBrowser(); }
      if (b.dataset.food) order('food', b.dataset.name, Number(b.dataset.cost));
      if (b.dataset.part) { const part = PARTS.find(p => p[0] === b.dataset.part); order('hardware', part[1], part[2], part[0]); }
      if (b.dataset.sell && !state.desktop.soldDrive) { state.desktop.soldDrive = true; state.money += 18; save(); toast('Old external drive sold. $18 added to wallet.'); renderBrowser(); }
    };
    const go = event => {
      event.preventDefault(); const url = event.target.elements.url.value.toLowerCase();
      navigate(url.includes('bits') ? (url.includes('archive') ? 'assets' : url.includes('log') ? 'logs' : 'bits') : /food|night|owl/.test(url) ? 'food' : /part|hardware|byte/.test(url) ? 'hardware' : /task|work|money/.test(url) ? 'tasks' : url === 'new tab' ? 'start' : url);
    };
    container.querySelector('.d-url-form').addEventListener('submit', go); container.querySelector('.d-browser-search')?.addEventListener('submit', go);
    container.querySelector('input[type="color"]')?.addEventListener('input', e => { container.querySelector('#d-color-code').textContent = e.target.value; });
    container.querySelector('.d-work-form')?.addEventListener('submit', event => {
      event.preventDefault();
      if ((state.totalMinutes || 0) < (state.desktop.nextTaskAt || 0)) { toast('No new labels yet. Check back in a little while.'); return; }
      if (event.target.elements.answer.value.trim() !== 'SB-2049-OFFICE') { toast('The label does not match. Check each character.'); return; }
      state.money += 3.2; state.desktop.nextTaskAt = (state.totalMinutes || 0) + 20; save(); toast('Label accepted. $3.20 added to wallet.'); renderBrowser();
    });
  }
  function order(type, name, cost, part) {
    if (state.money < cost) { toast('Not enough in your wallet.'); return; }
    if (part && (state.hardware[part] || state.orders.some(o => o.part === part && !o.delivered))) return;
    state.money -= cost;
    state.orders.push({ id: `${Date.now()}${Math.floor(Math.random() * 100)}`, type, name, cost, arrivesAt: (state.totalMinutes || 0) + 12, ...(part ? { part } : {}), delivered: false });
    save(); toast(`${name} ordered. Arriving in about 12 minutes.`); renderBrowser();
  }

  function renderOperator() {
    const stats = state.operator || {};
    const container = windows.get('Operator').content;
    container.innerHTML = `<div class="d-operator"><div class="d-op-scene"><div class="d-op-building"></div><div class="d-op-crosshair">+</div><span>SECTOR 04 / OFFICE</span></div><div class="d-op-content"><small class="d-eyebrow">MULTIPLAYER / TACTICAL</small><h1>OPERATOR<span>///</span></h1><p class="d-op-tagline">Every angle matters.</p><div class="d-op-profile"><div>ACL</div><p><b>AntiChatLogger</b><span>${esc(stats.rank || 'Silver II')} · ${stats.wins || 0} wins · ${stats.kills || 0} eliminations</span></p><i>● ONLINE</i></div><div class="d-op-options"><label>PLAYLIST<select name="playlist"><option value="casual">Casual · Office</option><option value="ranked">Ranked · Office</option></select></label><label>PRIMARY WEAPON<select name="weapon"><option value="AR-4">AR-4 · assault rifle</option><option value="SMG-9">SMG-9 · submachine gun</option><option value="DMR-7">DMR-7 · marksman rifle</option></select></label><label>ATTACHMENT<select name="attachment"><option value="Red dot">Red dot sight</option><option value="Compensator">Compensator · recoil control</option><option value="Extended magazine">Extended magazine</option></select></label></div><label class="d-op-party"><input type="checkbox" name="party" checked><span class="d-lilt-avatar">L</span><span><b>Liltism</b><small>Invite to party · regular duo</small></span><i>●</i></label><button class="d-op-play">FIND MATCH <span>↗</span></button><div class="d-op-controls">WASD move · Mouse aim · LMB fire · R reload<br>E objective · Tab scoreboard · F2 switch to desktop</div></div><footer>OFFICE / SECURE THE SERVER <span>v.1.04 · CONNECTION STABLE</span></footer></div>`;
    container.querySelector('.d-op-play').onclick = () => {
      ctx.startOperator?.({ ranked: container.querySelector('[name="playlist"]').value === 'ranked', weapon: container.querySelector('[name="weapon"]').value, attachment: container.querySelector('[name="attachment"]').value, party: container.querySelector('[name="party"]').checked });
    };
  }

  function renderFiles() {
    const container = windows.get('Files').content;
    const folders = Object.keys(FOLDERS);
    container.innerHTML = `<div class="d-files"><aside><small>QUICK ACCESS</small><button data-folder="">▤ This PC</button>${folders.map(folder => `<button data-folder="${folder}" class="${filePath === folder ? 'd-file-active' : ''}">▰ ${folder}</button>`).join('')}<div class="d-drive-info"><b>Local disk (C:)</b><div><i style="width:${Math.min(99, state.desktop.storageUsed / (256 + (state.hardware.ssd || 0) * 768) * 100)}%"></i></div><small>${256 + (state.hardware.ssd || 0) * 768 - state.desktop.storageUsed} GB free</small></div></aside><main><div class="d-file-path"><button data-folder="">←</button> This PC <span>›</span> Users <span>›</span> steven ${filePath ? `<span>›</span> ${esc(filePath)}` : ''}</div><div class="d-file-grid">${filePath ? FOLDERS[filePath].map(([name, content]) => `<button data-file="${esc(name)}"><span class="d-file-glyph ${content === 'video' ? 'd-file-video' : ''}">${content === 'video' ? '▷' : content === 'audio' || content === 'playlist' ? '♫' : content === 'image' ? '▧' : '▤'}</span><b>${esc(name)}</b><small>${content === 'video' ? 'Operator clip' : content === 'image' ? 'Image' : 'Local file'}</small></button>`).join('') : folders.map(folder => `<button data-folder="${folder}"><span class="d-folder-glyph">▰</span><b>${folder}</b><small>${FOLDERS[folder].length} items</small></button>`).join('')}</div><div class="d-file-reader" hidden></div><footer>${filePath ? FOLDERS[filePath].length : folders.length} items · last modified ${filePath === 'music' ? 'Today, 1:42 AM' : 'September 18'}</footer></main></div>`;
    container.onclick = event => {
      const b = event.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-folder')) { filePath = b.dataset.folder; renderFiles(); }
      if (b.dataset.file) {
        const [name, content] = FOLDERS[filePath].find(([name]) => name === b.dataset.file);
        if (content === 'video') { currentVideo = 1; open('Videos'); renderVideos(); return; }
        if (content === 'playlist' || content === 'audio') { musicView = 'playlist'; open('CloudTracks'); renderMusic(); return; }
        const reader = container.querySelector('.d-file-reader'); reader.hidden = false;
        reader.innerHTML = `<header><b>${esc(name)}</b><button data-reader-close="true">×</button></header>${content === 'image' ? '<div class="d-file-landscape"><div></div><span>saved without a name</span></div>' : `<pre>${esc(content || '(empty file)')}</pre>`}`;
      }
      if (b.dataset.readerClose) container.querySelector('.d-file-reader').hidden = true;
    };
  }

  const VIDEOS = [
    { name: 'night drive. no commentary.', channel: 'coastline tapes', views: '2.4K', duration: 420, type: 'race' },
    { name: 'office_1v2_final.mp4', channel: 'AntiChatLogger', views: '3', duration: 42, type: 'operator' },
    { name: 'rain outside my window / 4am', channel: 'room tone', views: '817', duration: 600, type: 'rain' },
  ];
  function renderVideos() {
    const container = windows.get('Videos').content;
    const video = VIDEOS[currentVideo];
    container.innerHTML = `<div class="d-videos"><header><b>▷ latecast</b><span>Subscriptions / Watch later</span></header><div class="d-video-layout"><main><div class="d-video-screen d-video-${video.type} ${videoPlaying ? 'd-video-running' : ''}"><div class="d-video-sky"></div><div class="d-video-mountains"></div><div class="d-video-road"><i></i><i></i><i></i></div><div class="d-video-dash"><span>0${currentVideo + 1} : NIGHT RUN</span><b>${video.type === 'race' ? '083' : video.type === 'operator' ? 'AR-4' : '04:12'}</b></div><div class="d-video-caption">${video.type === 'race' ? 'COASTLINE / EASTBOUND' : video.type === 'operator' ? 'OFFICE — LOCAL RECORDING' : 'SEPTEMBER 18 / WINDOW OPEN'}</div><button class="d-video-big-play" data-video-play="true" aria-label="${videoPlaying ? 'Pause video' : 'Play video'}">${videoPlaying ? 'Ⅱ' : '▶'}</button></div><div class="d-video-controls"><button data-video-play="true">${videoPlaying ? 'Ⅱ' : '▶'}</button><input type="range" min="0" max="${video.duration}" value="${videoProgress}" aria-label="Video position"><small class="d-video-time">${videoTime(videoProgress)} / ${videoTime(video.duration)}</small><button data-video-sound="true" title="Toggle video sound">${videoSound ? '♫' : '♩'}</button><button data-video-full="true" title="Maximize window">□</button></div><h2>${video.name}</h2><p>${video.views} views · uploaded 3 days ago</p><div class="d-video-channel"><span>${video.channel[0]}</span><b>${video.channel}</b><button class="d-button" data-subscribe="true">${state.desktop.videoSubscribed?.includes(video.channel) ? 'Subscribed' : 'Subscribe'}</button></div><div class="d-video-comment"><b>Liltism</b><p>${currentVideo === 0 ? 'what wheel is this' : currentVideo === 1 ? 'i literally called that angle' : 'this is what my mic sounds like apparently'}</p></div></main><aside><h4>Up next</h4>${VIDEOS.map((item, i) => `<button data-video="${i}" class="${i === currentVideo ? 'd-video-selected' : ''}"><div class="d-video-thumb d-thumb-${item.type}"><span>▷</span><small>${videoTime(item.duration)}</small></div><b>${item.name}</b><small>${item.channel} · ${item.views} views</small></button>`).join('')}</aside></div></div>`;
    container.onclick = event => {
      const b = event.target.closest('button'); if (!b) return;
      if (b.dataset.videoPlay) { videoPlaying = !videoPlaying; renderVideos(); }
      if (b.hasAttribute('data-video')) { currentVideo = Number(b.dataset.video); videoProgress = 0; videoPlaying = true; renderVideos(); }
      if (b.dataset.videoSound) { videoSound = !videoSound; if (videoSound) toast('Quiet clip audio enabled.'); renderVideos(); }
      if (b.dataset.videoFull) maximize('Videos');
      if (b.dataset.subscribe) { state.desktop.videoSubscribed ||= []; const i = state.desktop.videoSubscribed.indexOf(video.channel); if (i < 0) state.desktop.videoSubscribed.push(video.channel); else state.desktop.videoSubscribed.splice(i, 1); save(); renderVideos(); }
    };
    container.querySelector('input[type="range"]').oninput = e => { videoProgress = Number(e.target.value); container.querySelector('.d-video-time').textContent = `${videoTime(videoProgress)} / ${videoTime(video.duration)}`; };
  }
  function videoTime(seconds) { return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`; }

  function renderSettings() {
    const container = windows.get('Settings').content;
    const sliders = [['volume', 'Master volume', 'The room, music, and everybody else.', 0, 1, .05], ['sensitivity', 'Mouse sensitivity', 'Bedroom and Operator controls.', .25, 3, .05], ['timeScale', 'Passage of time', 'In-game minutes per real second.', .05, 2, .05], ['pixelScale', 'World pixel size', 'Crisp computer UI at every setting.', 1, 4, 1]];
    container.innerHTML = `<div class="d-settings"><small class="d-eyebrow">STEVEN'S PC / PREFERENCES</small><h1>Make yourself comfortable.</h1><div class="d-settings-card">${sliders.map(([key, label, desc, min, max, step]) => `<label class="d-setting-row"><span><b>${label}</b><small>${desc}</small></span><input data-setting="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${state.settings[key] ?? min}"><output data-output="${key}">${state.settings[key]}</output></label>`).join('')}<label class="d-setting-row"><span><b>Call subtitles</b><small>Show what friends say in voice chat.</small></span><input type="checkbox" data-setting="subtitles" ${state.settings.subtitles ? 'checked' : ''}></label></div><h3>Your session</h3><p class="d-muted">Autosaved on this device. Export a copy to keep it somewhere else.</p><div class="d-button-row"><button class="d-button" data-settings-action="save">Save now</button><button class="d-button" data-settings-action="export">Export save</button><button class="d-button" data-settings-action="import">Import save</button><input class="d-import-file" type="file" accept=".json,application/json" hidden></div><div class="d-settings-about"><span class="d-account-mark">a.</span><div><b>AntiChatLogger Simulator</b><small>A room. A computer. One more night.</small><span>All sites, tracks and purchases live inside this game.</span></div></div></div>`;
    container.querySelectorAll('[data-setting]').forEach(input => input.addEventListener('input', () => {
      state.settings[input.dataset.setting] = input.type === 'checkbox' ? input.checked : Number(input.value);
      const output = container.querySelector(`[data-output="${input.dataset.setting}"]`); if (output) output.textContent = input.value;
      if (input.dataset.setting === 'volume') ctx.audio?.setMaster?.(Number(input.value));
      ctx.events?.dispatchEvent(new CustomEvent('settings-change', { detail: state.settings })); save();
    }));
    container.onclick = event => {
      const action = event.target.closest('[data-settings-action]')?.dataset.settingsAction;
      if (action === 'save') { save(); toast('Session saved.'); }
      if (action === 'export') { save(); const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'antichatlogger-session.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
      if (action === 'import') container.querySelector('.d-import-file').click();
    };
    container.querySelector('.d-import-file').onchange = async event => {
      const file = event.target.files[0]; if (!file) return;
      try {
        const parsed = JSON.parse(await file.text());
        if (parsed.version !== 1 || !parsed.room || !parsed.needs || !parsed.settings || !Number.isFinite(parsed.totalMinutes)) throw new Error('Invalid save');
        if (ctx.importSave) ctx.importSave(parsed);
        else { localStorage.setItem(SAVE_KEY, JSON.stringify(parsed)); state.savedAt = null; location.reload(); }
      } catch { toast('That file is not a valid AntiChatLogger save.'); }
    };
  }

  function renderManager() {
    const container = windows.get('Task Manager').content;
    const operator = Boolean(ctx.isOperatorRunning?.() || state.operator?.active || state.operator?.inMatch);
    const cpu = Math.round((operator ? 68 : 21) / (1 + (state.hardware.cpu || 0) * .4) + Math.sin(tick * .2) * 5);
    const gpu = Math.round((operator ? 92 : 18) / (1 + (state.hardware.gpu || 0) * .3));
    const memory = Math.round((operator ? 78 : 53) / (1 + (state.hardware.ram || 0) * .6));
    container.innerHTML = `<div class="d-manager"><header><h2>Processes</h2><small>steven · local machine</small></header><div class="d-resource-grid">${[['CPU', cpu, '6 cores'], ['Memory', memory, `${state.hardware.ram ? 16 : 8} GB`], ['GPU', gpu, 'Aster graphics'], ['Disk', Math.round(state.desktop.storageUsed / (state.hardware.ssd ? 1024 : 256) * 100), `${state.hardware.ssd ? 1024 : 256} GB`]].map(([name, value, spec]) => `<div><span>${name}</span><b>${value}%</b><div><i style="width:${value}%"></i></div><small>${spec}</small></div>`).join('')}</div><table><thead><tr><th>Name</th><th>Status</th><th>CPU</th><th>Memory</th></tr></thead><tbody>${[['Discord', 'Running', '2.1%', '412 MB'], ['CloudTracks', state.music.playing ? 'Playing' : 'Idle', state.music.playing ? '1.8%' : '0.2%', '184 MB'], ['Operator', operator ? 'In match' : 'Ready', operator ? '42.5%' : '0.1%', operator ? '2,846 MB' : '204 MB'], ['Browser', windows.get('Browser')?.status === 'open' ? 'Running' : 'Suspended', '1.4%', '326 MB'], ['Desktop compositor', 'Running', '3.4%', '94 MB'], ['System', 'Running', '0.7%', '186 MB']].map(row => `<tr>${row.map((value, i) => `<${i ? 'td' : 'th'}>${value}</${i ? 'td' : 'th'}>`).join('')}</tr>`).join('')}</tbody></table><footer><span>Temperature: ${Math.round(46 + gpu * .3)}°C</span><button class="d-button" data-manager-trash="true">Free up storage</button></footer></div>`;
    container.querySelector('[data-manager-trash]').onclick = () => open('Trash');
  }
  function renderTrash() {
    const container = windows.get('Trash').content;
    container.innerHTML = `<div class="d-trash"><small class="d-eyebrow">LOCAL DISK / RECYCLE BIN</small><h1>A little less clutter.</h1><p class="d-muted">${state.desktop.trash.length} discarded files. Emptying this bin frees 4 GB per file.</p>${state.desktop.trash.length ? `<div class="d-trash-items">${state.desktop.trash.map((name, i) => `<div><span>▤</span><b>${esc(name)}</b><small>4 GB</small><button data-trash="${i}" title="Permanently delete ${esc(name)}">×</button></div>`).join('')}</div><button class="d-button" data-trash-all="true">Empty recycle bin</button>` : '<div class="d-trash-empty">✓<p>Nothing here.</p><small>For now.</small></div>'}</div>`;
    container.onclick = event => {
      const b = event.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-trash')) { state.desktop.trash.splice(Number(b.dataset.trash), 1); state.desktop.storageUsed = Math.max(0, state.desktop.storageUsed - 4); toast('File deleted. 4 GB freed.'); }
      if (b.dataset.trashAll) { state.desktop.storageUsed = Math.max(0, state.desktop.storageUsed - state.desktop.trash.length * 4); state.desktop.trash = []; toast('Recycle bin emptied.'); }
      save(); renderTrash();
    };
  }

  function show() {
    visible = true; root.hidden = false; root.style.display = '';
    if (!windows.size) { open('Discord'); open('CloudTracks'); focusWindow('Discord'); }
    screenLight(); renderTaskbar(); update(0);
  }
  function hide() { visible = false; root.hidden = true; social?.setVisible?.(false); }
  function update(dt) {
    tick += dt;
    if (state.music.playing) {
      state.music.progress = (state.music.progress || 0) + dt;
      if (state.music.progress >= state.music.track.duration) { state.music.progress = 0; nextTrack(); }
      const progress = root.querySelector('.d-player-progress i'); if (progress) progress.style.width = `${state.music.progress / state.music.track.duration * 100}%`;
    }
    if (videoPlaying) {
      videoProgress += dt;
      if (videoProgress >= VIDEOS[currentVideo].duration) { videoProgress = 0; videoPlaying = false; if (windows.has('Videos')) renderVideos(); }
      const time = root.querySelector('.d-video-time'); if (time) time.textContent = `${videoTime(videoProgress)} / ${videoTime(VIDEOS[currentVideo].duration)}`;
      const range = root.querySelector('.d-video-controls input'); if (range && document.activeElement !== range) range.value = videoProgress;
      if (videoSound && Math.floor(tick * 2) !== Math.floor((tick - dt) * 2)) ctx.audio?.click?.();
    }
    if (!visible) return;
    root.querySelector('.d-clock b').textContent = ctx.formatTime?.() || '2:53 AM';
    root.querySelector('.d-tray-music').classList.toggle('d-music-on', state.music.playing);
    if (tick - lastTaskRefresh > 2) {
      lastTaskRefresh = tick; renderTaskbar();
      if (windows.get('Task Manager')?.status === 'open') renderManager();
      const orderState = state.orders.map(order => `${order.id}:${order.delivered}:${order.delivered ? 0 : Math.max(0, Math.ceil(order.arrivesAt - state.totalMinutes))}`).join('|');
      if (lastOrderState !== orderState) {
        lastOrderState = orderState;
        if (windows.get('Browser')?.status === 'open' && ['orders', 'hardware'].includes(browserRoute)) {
          const scrollTop = windows.get('Browser').content.querySelector('.d-browser-page')?.scrollTop || 0;
          renderBrowser();
          windows.get('Browser').content.querySelector('.d-browser-page').scrollTop = scrollTop;
        }
      }
    }
  }
  hide();
  return { show, hide, open, update, isVisible: () => visible, setSocial(value) { social = value; if (windows.has('Discord')) social.mount(windows.get('Discord').content); screenLight(); } };
}

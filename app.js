'use strict';
const machines = {
  atmos: {
    button: 'RUN ON ATMOS', name: 'ORIC ATMOS · 48K · PAL', heading: 'The original Atmos experiment.',
    description: 'A native 6502 demo with a 228-pixel scroller, alternating sunset inks and a three-voice AY soundtrack. Built for the Atmos, with a bootable Cumana Reborn disk.',
    engine: 'Running in Phosphoric · complete Oric CPU, ULA, VIA and AY emulation',
    note: 'Copy the HFE image to your Cumana Reborn USB stick, or load the TAP with CLOAD"". Binary entry: $0500.',
    downloads: [['Atmos tape','chroma.tap','.TAP'],['Cumana Reborn disk','CHROMA.HFE','.HFE'],['Cumana USB package','chroma-cumana-reborn.zip','.ZIP'],['Machine code','chroma.bin','.BIN'],['Microdisc disk image','chroma.dsk','.DSK']],
  },
  spectrum: {
    button: 'RUN ON SPECTRUM', name: 'ZX SPECTRUM · 128K / +2 / +2A / +3 · PAL', heading: 'A little race against the beam.',
    description: 'The same credits, font and score, reworked for the Z80. A custom raster alternates the 128K’s two screens on every scanline for a full-width, 256-pixel scroller. Startup automatically selects the timing for 128K/+2 or +2A/+3.',
    engine: 'Running in JSSpeccy 3 · cycle-accurate Spectrum 128K and AY emulation',
    note: 'Use the snapshot for your emulator, load the universal TAP in 128 BASIC, or insert the +3 disk and choose Loader. The demo detects the timing family automatically. Binary loads at $6000 and enters at $8000.',
    downloads: [['128K instant snapshot','chroma.z80','.Z80'],['+3 instant snapshot','chroma-plus3.z80','.Z80'],['+3 boot disk','chroma-plus3.dsk','.DSK'],['Universal Spectrum tape','chroma.tap','.TAP'],['Machine code','chroma.bin','.BIN']],
  },
};
const $ = id => document.getElementById(id);
let selected = new URLSearchParams(location.search).get('machine') === 'spectrum' ? 'spectrum' : 'atmos';
let frame = null, running = false, muted = false, bootTimer = null;
function status(text) { $('status').replaceChildren(Object.assign(document.createElement('i'), {}), document.createTextNode(text)); }
function stop() {
  clearTimeout(bootTimer);
  if (frame) { frame.src = 'about:blank'; frame.remove(); frame = null; }
  running = false;
  $('cover').hidden = false;
  $('poster').hidden = false;
  $('start').disabled = false;
  $('stop').disabled = true;
  $('restart').disabled = true;
  status('READY TO RUN');
}
function select(machine, focus = false) {
  stop(); selected = machine;
  const info = machines[machine];
  document.querySelectorAll('[role="tab"]').forEach(tab => {
    const active = tab.dataset.machine === machine;
    tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
    if (active && focus) tab.focus();
  });
  $('demo-panel').setAttribute('aria-labelledby', `tab-${machine}`);
  $('start').replaceChildren(Object.assign(document.createElement('span'), {textContent:'▶'}), document.createTextNode(` ${info.button}`));
  $('machine-name').textContent = info.name;
  $('machine-heading').textContent = info.heading;
  $('machine-description').textContent = info.description;
  $('engine-name').textContent = info.engine;
  $('load-note').textContent = info.note;
  $('poster').src = `downloads/${machine}/screenshot.png`;
  $('poster').alt = `${machine === 'atmos' ? 'Oric Atmos' : 'ZX Spectrum'} demo with bouncing, sunset-striped lettering`;
  $('error').hidden = true;
  $('cover-note').textContent = `Live emulation · sound ${muted ? 'off' : 'on'}`;
  $('downloads').replaceChildren(...info.downloads.map(([label, filename, extension]) => {
    const li = document.createElement('li'), a = document.createElement('a'), ext = document.createElement('span');
    a.href = `downloads/${machine}/${filename}`; a.download = filename;
    ext.textContent = extension; a.append(label, ext); li.append(a); return li;
  }));
  $('recording').pause();
  $('recording').poster = `downloads/${machine}/screenshot.png`;
  $('recording').querySelector('source').src = `downloads/${machine}/preview.mp4`;
  $('recording').load();
  const url = new URL(location.href); url.searchParams.set('machine', machine); history.replaceState(null, '', url);
}
function start() {
  if (running) return;
  $('recording').pause();
  $('error').hidden = true;
  running = true; $('start').disabled = true;
  status('LOADING NATIVE DEMO…');
  frame = document.createElement('iframe');
  frame.title = `${machines[selected].name} live demo`;
  frame.allow = 'autoplay; fullscreen';
  frame.src = `emulators/${selected}/index.html?muted=${muted ? '1' : '0'}`;
  $('emulator').append(frame);
  bootTimer = setTimeout(() => {
    stop();
    $('error').textContent = 'The emulator took too long to start. Try Run again, download the demo, or watch the recording below.';
    $('error').hidden = false;
  },45000);
  $('cover').hidden = true;
  $('stop').disabled = false;
  $('restart').disabled = false;
}
window.addEventListener('message', event => {
  if (event.origin !== location.origin || !frame || event.source !== frame.contentWindow || event.data?.source !== 'chroma-emulator') return;
  if (event.data.type === 'ready') { clearTimeout(bootTimer); $('poster').hidden = true; status('LIVE · NATIVE DEMO / AY SOUND'); }
  if (event.data.type === 'exitFullscreen') leaveFullscreen();
  if (event.data.type === 'loading') status(event.data.message);
  if (event.data.type === 'error') {
    const message = event.data.message; stop();
    $('error').textContent = `Browser emulation could not start: ${message}. You can still download the demo or watch the recording below.`;
    $('error').hidden = false; status('EMULATOR UNAVAILABLE');
  }
});
document.querySelectorAll('[role="tab"]').forEach(tab => {
  tab.addEventListener('click', () => select(tab.dataset.machine));
  tab.addEventListener('keydown', event => {
    if (['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) {
      event.preventDefault(); select(event.key === 'Home' ? 'atmos' : event.key === 'End' ? 'spectrum' : selected === 'atmos' ? 'spectrum' : 'atmos', true);
    }
  });
});
$('start').addEventListener('click', start);
$('stop').addEventListener('click', stop);
$('restart').addEventListener('click', () => { stop(); start(); });
$('sound').addEventListener('click', () => {
  muted = !muted;
  $('sound').textContent = muted ? 'SOUND OFF' : 'SOUND ON'; $('sound').setAttribute('aria-pressed', String(muted));
  $('cover-note').textContent = `Live emulation · sound ${muted ? 'off' : 'on'}`;
  frame?.contentWindow.postMessage({type:'chroma:mute', muted}, location.origin);
});
function expanded(value) {
  $('screen').classList.toggle('expanded',value);
  $('leave-fullscreen').hidden = !value;
}
async function leaveFullscreen() {
  if (document.fullscreenElement) { try { await document.exitFullscreen(); } catch {} }
  expanded(false);
}
$('fullscreen').addEventListener('click', async () => {
  if ($('screen').classList.contains('expanded')) { await leaveFullscreen(); return; }
  // The full-window layout also works in embedded browsers without native fullscreen.
  expanded(true);
});
$('leave-fullscreen').addEventListener('click',leaveFullscreen);
document.addEventListener('keydown',event => { if (event.key === 'Escape') leaveFullscreen(); });
$('recording').addEventListener('play', () => { if (running) stop(); });
select(selected);

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
    button: 'RUN ON SPECTRUM', name: 'ZX SPECTRUM · 128K / ORIGINAL +2 · PAL', heading: 'A little race against the beam.',
    description: 'The same credits, font and score, reworked for the Z80. BIFROST*2 changes the Spectrum’s attributes in time with the beam for true 8×1 color across a 160-pixel window.',
    engine: 'Running in JSSpeccy 3 · cycle-accurate Spectrum 128K and AY emulation',
    note: 'Open the snapshot in a 128K Spectrum emulator, or select Tape Loader and load the TAP. Binary loads at $6000 and enters at $8000. Original +2 supported; +2A/+3 are outside this release.',
    downloads: [['128K instant snapshot','chroma.z80','.Z80'],['Spectrum tape','chroma.tap','.TAP'],['Machine code','chroma.bin','.BIN']],
  },
};
const $ = id => document.getElementById(id);
let selected = new URLSearchParams(location.search).get('machine') === 'spectrum' ? 'spectrum' : 'atmos';
let frame = null, running = false, muted = false;
function status(text) { $('status').replaceChildren(Object.assign(document.createElement('i'), {}), document.createTextNode(text)); }
function stop() {
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
  $('cover').hidden = true;
  $('stop').disabled = false;
  $('restart').disabled = false;
}
window.addEventListener('message', event => {
  if (event.origin !== location.origin || !frame || event.source !== frame.contentWindow || event.data?.source !== 'chroma-emulator') return;
  if (event.data.type === 'ready') { $('poster').hidden = true; status('LIVE · NATIVE DEMO / AY SOUND'); }
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
  frame?.contentWindow.postMessage({type:'chroma:mute', muted}, location.origin);
});
$('fullscreen').addEventListener('click', async () => {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await $('screen').requestFullscreen(); }
  catch { status('FULLSCREEN IS NOT AVAILABLE IN THIS BROWSER'); }
});
$('recording').addEventListener('play', () => { if (running) stop(); });
select(selected);

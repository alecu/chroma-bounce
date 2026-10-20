'use strict';
window.alert = message => chroma.notify('error', String(message));
const emulator = JSSpeccy(document.getElementById('machine'), {
  machine:128, autoStart:true, uiEnabled:false, keyboardEnabled:false, sandbox:true, zoom:1,
  openUrl:new URL('../../downloads/spectrum/chroma.z80',location.href).href,
});
emulator.onReady(() => { chroma.updateAudio(); chroma.notify('ready'); });
window.addEventListener('pagehide', () => emulator.exit());

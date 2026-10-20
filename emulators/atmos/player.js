/* The demo owns its initialization. An original five-byte boot shim supplies
   reset/NMI/IRQ vectors; no commercial Atmos BASIC ROM is loaded. */
'use strict';
var Module = {
  canvas:document.getElementById('canvas'),
  arguments:['--model','atmos','--rom','/roms/chroma.rom','--tape','/media/chroma.tap','--fast-load'],
  print:message => console.info(message),
  printErr:message => console.warn(message),
  onAbort:reason => chroma.notify('error', String(reason)),
  preRun:[function () {
    addRunDependency('chroma-tape');
    fetch('../../downloads/atmos/chroma.tap').then(response => {
      if (!response.ok) throw new Error(`Tape download failed (${response.status})`);
      return response.arrayBuffer();
    }).then(bytes => {
      FS.mkdir('/media'); FS.writeFile('/media/chroma.tap',new Uint8Array(bytes));
      removeRunDependency('chroma-tape');
    }).catch(error => chroma.notify('error',error.message));
  }],
  onRuntimeInitialized:function () {
    chroma.notify('loading','BOOTING ATMOS · STARTING THE DEMO…');
    const poll = setInterval(() => {
      const tick = Module.ccall('web_peek','number',['number'],[11]);
      const mode = Module.ccall('web_peek','number',['number'],[0xbfdf]);
      if (tick > 0 && mode === 30) {
        clearInterval(poll); chroma.updateAudio(); chroma.notify('ready');
      }
    },100);
    window.addEventListener('pagehide', () => clearInterval(poll), {once:true});
  },
};
Module.canvas.addEventListener('contextmenu',event => event.preventDefault());

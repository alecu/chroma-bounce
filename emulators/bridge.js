/* Shared audio and lifecycle wrapper. Emulator execution stays upstream. */
(() => {
  'use strict';
  const contexts = [];
  let muted = new URLSearchParams(location.search).get('muted') === '1';
  const notify = (type, message) => parent.postMessage({source:'chroma-emulator', type, message}, location.origin);
  const NativeAudioContext = window.AudioContext || window.webkitAudioContext;
  let button;
  function refresh() {
    if (document.body) document.body.dataset.audioState = muted ? 'muted' : contexts.length && contexts.every(context => context.state === 'running') ? 'running' : 'suspended';
    if (!button) return;
    button.hidden = muted || !contexts.some(context => context.state === 'suspended');
  }
  async function updateAudio() {
    await Promise.all(contexts.filter(context => context.state !== 'closed').map(context =>
      (muted ? context.suspend() : context.resume()).catch(() => {})));
    refresh();
  }
  if (NativeAudioContext) {
    class DemoAudioContext extends NativeAudioContext {
      constructor(...args) {
        super(...args); contexts.push(this);
        this.addEventListener('statechange', refresh);
        if (muted) this.suspend().catch(() => {});
        else this.resume().catch(() => {});
        refresh();
      }
    }
    window.AudioContext = window.webkitAudioContext = DemoAudioContext;
  }
  document.addEventListener('DOMContentLoaded', () => {
    button = document.createElement('button');
    button.textContent = 'ENABLE SOUND'; button.hidden = true;
    button.style.cssText = 'position:fixed;bottom:14px;right:14px;z-index:10;background:#15171d;color:#f1ce78;border:1px solid #f1ce78;padding:12px;font:11px monospace;cursor:pointer';
    button.addEventListener('click', () => { muted = false; updateAudio(); });
    document.body.append(button); refresh();
  });
  document.addEventListener('pointerdown', updateAudio);
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== parent) return;
    if (event.data?.type === 'chroma:mute') { muted = Boolean(event.data.muted); updateAudio(); }
  });
  window.addEventListener('pagehide', () => contexts.forEach(context => { if (context.state !== 'closed') context.close().catch(() => {}); }));
  window.addEventListener('error', event => notify('error', event.message || 'Emulator error'));
  window.addEventListener('unhandledrejection', event => notify('error', String(event.reason?.message || event.reason)));
  window.chroma = {notify, updateAudio};
})();

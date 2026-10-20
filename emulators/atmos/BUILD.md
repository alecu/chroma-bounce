# Phosphoric browser build for Chroma Bounce

Core source: Phosphoric revision `675cb06e02cf7c684377c5ae592dca7995d22097`.
The matching unmodified source is available at `../../sources/phosphoric-675cb06.tar.gz`.
License and upstream notices: `LICENSE` in this directory.

Built with Emscripten 5.0.1, using the upstream `make wasm` target. The only change
to its link arguments replaces the upstream ROM directory preload with
`--preload-file /path/to/boot.rom@/roms/chroma.rom`. All other flags match:

```
-sUSE_SDL=2 -sASYNCIFY -sALLOW_MEMORY_GROWTH=1 -sSTACK_SIZE=8MB
-sEXPORTED_RUNTIME_METHODS=ccall,FS,ENV,callMain
-sEXPORTED_FUNCTIONS=_main,_web_key,_web_key_release_all,_web_io_activity,_web_peek,_web_save_state,_web_load_state,_web_insert_tap,_web_insert_disk,_web_iomenu_toggle,_malloc,_free
-lidbfs.js --shell-file web/shell.html
```

The web wrapper uses its own `index.html` and `player.js`, alongside the generated
`phosphoric.js`, `phosphoric.wasm`, `phosphoric.data`.

## Original boot shim

The Atmos demo initializes its own hardware and calls no BASIC routines. Its
interrupt handler is reached via the RAM trampoline at $0244. An original shim
therefore supplies reset/NMI/IRQ vectors without a commercial BASIC ROM:

```asm
    org $c000
    sei
idle:
    jmp idle
nmi:
    rti
    ; pad the 16K image with $ea (NOP)
    org $fffa
    dw nmi, $c000, $0244
```

Reproduce the exact `boot.rom` (public domain / CC0):

```python
from pathlib import Path
rom = bytearray([0xea] * 16384)
rom[:5] = bytes([0x78, 0x4c, 0x01, 0xc0, 0x40])
rom[-6:] = bytes([4, 0xc0, 0, 0xc0, 0x44, 2])
Path('boot.rom').write_bytes(rom)
```

`player.js` fetches the unmodified demo TAP into the virtual filesystem and
starts Phosphoric with `--model atmos --rom /roms/chroma.rom --tape
/media/chroma.tap --fast-load`. Upstream fast loading starts the demo after
about five seconds of emulated boot time. The 6502, video, VIA timer interrupts
and AY sound are then fully emulated. This shim is specific to this demo and
does not provide a BASIC environment or a general-purpose Oric operating system.

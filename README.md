# Chroma Bounce

**Play both demos:** https://alecu.protocultura.net/chroma-bounce/

A native Oric Atmos demo and its ZX Spectrum 128K port: large bouncing credits,
flowing sunset scanlines, and an original three-channel AY soundtrack.

Choose a machine, press **Run**, and the actual native demo executes in its
WebAssembly emulator. The site includes sound control, restart, stop, fullscreen,
recorded video fallbacks and direct downloads of the native binary assets.

- Oric: TAP, BIN, Microdisc DSK, Cumana Reborn HFE and USB ZIP package.
- Spectrum: TAP, BIN and instant-start 128K Z80 snapshot.

This public repository contains the static site and release downloads. The
original demo development repository remains private. GitHub Pages serves the
root of the `main` branch; `.nojekyll` keeps emulator and binary files intact.
All URLs are relative, so a project Pages subdirectory works without a build step.

## Run locally

```
python3 -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765/ (WASM requires HTTP, not `file://`).

## Emulator attribution and source

Phosphoric: bmarty and contributors, EUPL 1.2; JSSpeccy 3.2: Matt Westcott
(gasman) and contributors, GPL 3. Emulator cores are unmodified. Their license
notices, matching source archives and the Atmos build instructions are included
and linked from `credits.html`.

Commercial BASIC ROMs are not included: the Atmos demo uses an original CC0
reset/interrupt shim; the Spectrum demo uses its self-contained native snapshot
with zero-filled emulator ROM slots. These players are intended for Chroma Bounce.

The Spectrum binary uses a custom 32-column raster, switching between screen
banks 5 and 7 on alternate scanlines. Each line has a uniform ink/paper pair.
The earlier 20-column port used BIFROST*2 by Einar Saukas (method suggested by
Matt Westcott; z88dk adaptation by aralbrec); its historical credits and license
remain in `licenses/bifrost2.txt`.

`manifest.json` records emulator versions and SHA-256 hashes of the release files.

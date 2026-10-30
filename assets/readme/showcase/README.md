# Synchronized case showcase

Each GIF encodes reference and reconstruction into the same frames, so their playback clocks cannot drift. The original recordings remain the evidence for full behavior; GIFs are compact, looping demonstrations.

- Inputs, per-side start offsets, crops and excerpt durations are in `clips.json`, relative to the repository root.
- Playback is original speed, sampled at 12.5fps from native 25fps captures. There is no interpolation or time stretching. GIF palette reduction and resizing are display compression, not fidelity evidence.
- Offsets align corresponding visible phases approximately. User actions later in a continuous excerpt can still differ in timing; no warp hides those differences.
- The Astra Fluid Notch GIF joins its first expansion and first collapse windows, each independently aligned. Each window ends with a 640ms hold of its actual final frame. Other GIFs use single continuous windows. Loop boundaries restart the selected excerpt rather than claiming a seamless source loop.
- Agent Graph starts after the initial node entrance, focusing on live call pulses and status changes.
- Stacked Empty State compares original template artwork with the documented MenuFold native-icon adaptation. Each crop is fitted proportionally; it is not a pixel-diff overlay.
- The GPT-6.1 Fluid Notch GIF uses only the independent model trial's recordings. The other six GIFs retain the original collection's `gpt6-astra` attribution.
- Static comparison PNGs remain under `../comparisons/`.

Rebuild with Python/Pillow and FFmpeg:

```sh
python3 scripts/build-showcase-gifs.py
# Or rerender one case:
python3 scripts/build-showcase-gifs.py fluid-notch
```

Set `FFMPEG` to a local binary path when it is not on PATH. `generated.json` records dimensions, decoded GIF frame counts, durations, loop settings and sizes. Identical GIF frames may be merged without changing their total hold duration.

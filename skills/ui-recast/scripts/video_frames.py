#!/usr/bin/env python3
"""Extract native video frames with decoder timestamps (Python 3.9+ and FFmpeg).

Sampling selects the first decoded frame in each occupied time bucket. It never
interpolates or duplicates frames to meet a requested rate. No Python packages
are required. Use a full FFmpeg build with select/showinfo and PNG support.
"""
import argparse
from collections import deque
import json
import math
import os
from pathlib import Path
import re
import shutil
import subprocess


def extract(source, output, fps=12.0, ffmpeg="ffmpeg"):
    source, output = Path(source).resolve(), Path(output).resolve()
    if not source.is_file():
        raise ValueError(f"Input video does not exist: {source}")
    if not math.isfinite(fps) or not 0 < fps <= 120:
        raise ValueError("Sampling FPS must be greater than 0 and at most 120")
    executable = shutil.which(ffmpeg)
    if not executable:
        raise ValueError("FFmpeg was not found. Install it or pass --ffmpeg PATH")
    output.mkdir(parents=True, exist_ok=True)
    if (output / "frames.json").exists() or any(output.glob("frame-*.png")):
        raise ValueError("Choose an output directory without previous frame files")

    # Use source time buckets, not output -r/fps conversion, which can duplicate
    # frames. start_t is the first input timestamp seen by the select filter.
    rate = format(fps, ".12g")
    bucket = f"floor((t-start_t)*{rate}+0.000001)"
    previous = f"floor((prev_selected_t-start_t)*{rate}+0.000001)"
    selection = f"select=isnan(prev_selected_t)+gt({bucket}\\,{previous})"
    command = [
        executable, "-hide_banner", "-nostdin", "-loglevel", "info", "-n",
        "-copyts", "-start_at_zero", "-i", str(source), "-map", "0:v:0",
        "-an", "-sn", "-dn", "-vf", selection + ",showinfo=checksum=0",
        "-vsync", "0", "-threads", "1", "-start_number", "0",
        str(output / "frame-%06d.png"),
    ]
    pattern = re.compile(r"\bn:\s*(\d+).*?\bpts_time:\s*([-+\d.eE]+)")
    frames, tail = [], deque(maxlen=20)
    with subprocess.Popen(command, stdout=subprocess.DEVNULL,
                          stderr=subprocess.PIPE, text=True,
                          encoding="utf-8", errors="replace") as process:
        for line in process.stderr:
            tail.append(line.rstrip())
            if "showinfo" not in line:
                continue
            match = pattern.search(line)
            if match:
                frames.append({"file": f"frame-{int(match[1]):06d}.png",
                               "actualMs": float(match[2]) * 1000})
        code = process.wait()
    if code:
        raise RuntimeError("FFmpeg extraction failed:\n" + "\n".join(tail))
    if not frames or any(not (output / frame["file"]).is_file() for frame in frames):
        raise RuntimeError("Decoded timestamps and extracted images did not match")
    first = frames[0]["actualMs"]
    for frame in frames:
        relative = (frame["actualMs"] - first) / 1000
        frame["sampleBucketStartMs"] = first + math.floor(relative * fps + 1e-6) * 1000 / fps
    report = {
        "source": str(source), "requestedFps": fps,
        "timestampOrigin": "Decoder PTS in milliseconds; container start shifted to zero by FFmpeg",
        "sampling": "First native frame in each occupied time bucket; no interpolation or duplicated frames",
        "frames": frames,
    }
    (output / "frames.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("fps", nargs="?", type=float, default=12)
    parser.add_argument("--ffmpeg", default=os.environ.get("FFMPEG", "ffmpeg"),
                        help="FFmpeg executable path (default: FFMPEG or PATH)")
    args = parser.parse_args()
    try:
        report = extract(args.input, args.output, args.fps, args.ffmpeg)
    except (ValueError, RuntimeError, OSError) as error:
        parser.exit(1, f"{error}\n")
    print(f"Extracted {len(report['frames'])} native frames to {args.output}")


if __name__ == "__main__":
    main()

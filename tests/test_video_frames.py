"""Real decoder checks for the portable frame extractor; requires full FFmpeg."""
import importlib.util
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("video_frames", ROOT / "skills/ui-recast/scripts/video_frames.py")
video_frames = importlib.util.module_from_spec(spec)
spec.loader.exec_module(video_frames)
FF = os.environ.get("FFMPEG", "ffmpeg")


class NativeFrameExtraction(unittest.TestCase):
    def fixture(self, path, variable=False):
        args = [FF, "-hide_banner", "-loglevel", "error", "-f", "lavfi", "-i",
                "testsrc=size=96x64:rate=10:duration=1"]
        if variable:
            args += ["-vf", "setpts=(N+floor(N/3))*0.1/TB", "-vsync", "0", "-c:v", "ffv1"]
        else:
            args += ["-c:v", "libx264", "-pix_fmt", "yuv420p"]
        subprocess.run(args + [str(path)], check=True)

    def test_mp4_records_native_times_not_requested_grid(self):
        with tempfile.TemporaryDirectory(prefix="ui-recast-frames-") as temp:
            root = Path(temp)
            source = root / "sample clip.mp4"
            self.fixture(source)
            report = video_frames.extract(source, root / "frames", 4, FF)
            frames = report["frames"]
            self.assertEqual([round(f["actualMs"]) for f in frames], [0, 300, 500, 800])
            self.assertEqual([round(f["sampleBucketStartMs"]) for f in frames], [0, 250, 500, 750])
            self.assertEqual(len(list((root / "frames").glob("frame-*.png"))), 4)
            self.assertTrue((root / "frames/frames.json").is_file())

    def test_variable_frame_rate_is_preserved_without_generated_duplicates(self):
        with tempfile.TemporaryDirectory(prefix="ui-recast-vfr-") as temp:
            root = Path(temp)
            source = root / "variable.mkv"
            self.fixture(source, variable=True)
            report = video_frames.extract(source, root / "frames", 30, FF)
            times = [round(f["actualMs"]) for f in report["frames"]]
            self.assertEqual(times, [0, 100, 200, 400, 500, 600, 800, 900, 1000, 1200])
            self.assertEqual(len(times), len(set(times)))


if __name__ == "__main__":
    unittest.main()

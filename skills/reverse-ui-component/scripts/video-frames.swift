// macOS: swift video-frames.swift input.mp4 output-directory [frames-per-second]
import Foundation
import AVFoundation
import ImageIO
import UniformTypeIdentifiers

guard CommandLine.arguments.count >= 3 else {
    fputs("Usage: swift video-frames.swift input.mp4 output-directory [fps]\n", stderr)
    exit(1)
}
let input = URL(fileURLWithPath: CommandLine.arguments[1])
let output = URL(fileURLWithPath: CommandLine.arguments[2], isDirectory: true)
let fps = CommandLine.arguments.count > 3 ? Double(CommandLine.arguments[3]) ?? 0 : 12
guard fps > 0 && fps <= 120 else { fatalError("fps must be > 0 and <= 120") }
try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)
let asset = AVURLAsset(url: input)
let duration = CMTimeGetSeconds(try await asset.load(.duration))
guard duration.isFinite && duration > 0 else { fatalError("Video has no readable duration") }
let generator = AVAssetImageGenerator(asset: asset)
generator.appliesPreferredTrackTransform = true
generator.requestedTimeToleranceBefore = .zero
generator.requestedTimeToleranceAfter = .zero
var frames: [[String: Any]] = []
for index in 0..<Int(ceil(duration * fps)) {
    let requested = Double(index) / fps
    let result = try await generator.image(at: CMTime(seconds: requested, preferredTimescale: 60000))
    let image = result.image
    let name = String(format: "frame-%04d.jpg", index)
    let destination = CGImageDestinationCreateWithURL(output.appendingPathComponent(name) as CFURL, UTType.jpeg.identifier as CFString, 1, nil)!
    CGImageDestinationAddImage(destination, image, [kCGImageDestinationLossyCompressionQuality: 0.95] as CFDictionary)
    guard CGImageDestinationFinalize(destination) else { fatalError("Cannot write \(name)") }
    frames.append(["file": name, "requestedMs": requested * 1000, "actualMs": CMTimeGetSeconds(result.actualTime) * 1000])
}
let report: [String: Any] = ["source": input.path, "durationSeconds": duration, "requestedFps": fps, "frames": frames]
try JSONSerialization.data(withJSONObject: report, options: [.prettyPrinted, .sortedKeys]).write(to: output.appendingPathComponent("frames.json"))
print("Extracted \(frames.count) real frames to \(output.path)")

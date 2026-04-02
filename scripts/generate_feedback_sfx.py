#!/usr/bin/env python3
from __future__ import annotations

import math
import struct
import subprocess
import tempfile
import wave
from pathlib import Path

SAMPLE_RATE = 44100


def envelope(i: int, total: int, attack: float = 0.05, release: float = 0.18) -> float:
    if total <= 0:
        return 0.0
    pos = i / total
    if pos < attack:
        return pos / attack
    if pos > 1 - release:
        return max(0.0, (1 - pos) / release)
    return 1.0


def synth_note(freq: float, duration: float, volume: float = 0.45, wave_type: str = "sine") -> list[float]:
    frames = int(SAMPLE_RATE * duration)
    samples: list[float] = []
    for i in range(frames):
        t = i / SAMPLE_RATE
        phase = 2 * math.pi * freq * t
        if wave_type == "square":
            raw = 1.0 if math.sin(phase) >= 0 else -1.0
        elif wave_type == "triangle":
            raw = (2 / math.pi) * math.asin(math.sin(phase))
        else:
            raw = math.sin(phase)
        samples.append(raw * volume * envelope(i, frames))
    return samples


def silence(duration: float) -> list[float]:
    return [0.0] * int(SAMPLE_RATE * duration)


def mix_layers(layers: list[list[float]]) -> list[float]:
    total = max((len(layer) for layer in layers), default=0)
    mixed = [0.0] * total
    for layer in layers:
        for i, sample in enumerate(layer):
            mixed[i] += sample
    peak = max((abs(s) for s in mixed), default=1.0)
    if peak > 0.95:
        scale = 0.95 / peak
        mixed = [s * scale for s in mixed]
    return mixed


def sequence(notes: list[tuple[float, float, float, str]], gap: float = 0.02) -> list[float]:
    samples: list[float] = []
    for freq, duration, volume, wave_type in notes:
        samples.extend(synth_note(freq, duration, volume, wave_type))
        samples.extend(silence(gap))
    return samples


def write_wav(path: Path, samples: list[float]) -> None:
    pcm = bytearray()
    for sample in samples:
        clipped = max(-1.0, min(1.0, sample))
        pcm.extend(struct.pack("<h", int(clipped * 32767)))
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(pcm)


def to_mp3(wav_path: Path, mp3_path: Path) -> None:
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-loglevel",
            "error",
            "-i",
            str(wav_path),
            "-codec:a",
            "libmp3lame",
            "-q:a",
            "3",
            str(mp3_path),
        ],
        check=True,
    )


def build_correct() -> list[float]:
    lead = sequence([
        (659.25, 0.09, 0.38, "square"),
        (783.99, 0.1, 0.4, "square"),
        (987.77, 0.16, 0.42, "triangle"),
    ], gap=0.015)
    harmony = silence(0.02) + sequence([
        (493.88, 0.12, 0.18, "sine"),
        (587.33, 0.12, 0.16, "sine"),
        (783.99, 0.18, 0.15, "sine"),
    ], gap=0.015)
    return mix_layers([lead, harmony])


def build_wrong() -> list[float]:
    return sequence([
        (523.25, 0.09, 0.28, "triangle"),
        (415.30, 0.1, 0.26, "triangle"),
        (329.63, 0.16, 0.24, "sine"),
    ], gap=0.01)


def build_level_complete() -> list[float]:
    lead = sequence([
        (523.25, 0.11, 0.32, "square"),
        (659.25, 0.11, 0.34, "square"),
        (783.99, 0.11, 0.36, "square"),
        (1046.50, 0.22, 0.38, "triangle"),
    ], gap=0.03)
    bass = silence(0.015) + sequence([
        (261.63, 0.14, 0.12, "sine"),
        (329.63, 0.14, 0.12, "sine"),
        (392.00, 0.14, 0.12, "sine"),
        (523.25, 0.24, 0.14, "sine"),
    ], gap=0.03)
    return mix_layers([lead, bass])


def build_achievement() -> list[float]:
    lead = sequence([
        (783.99, 0.1, 0.3, "square"),
        (987.77, 0.1, 0.33, "square"),
        (1174.66, 0.14, 0.34, "triangle"),
        (1567.98, 0.24, 0.34, "triangle"),
    ], gap=0.02)
    sparkle = silence(0.04) + sequence([
        (1567.98, 0.06, 0.12, "sine"),
        (1975.53, 0.06, 0.11, "sine"),
        (2349.32, 0.1, 0.09, "sine"),
    ], gap=0.01)
    return mix_layers([lead, sparkle])


def main() -> None:
    out_dir = Path(__file__).resolve().parents[1] / "audio" / "feedback"
    out_dir.mkdir(parents=True, exist_ok=True)

    builds = {
        "sfx-answer-correct.mp3": build_correct(),
        "sfx-answer-wrong.mp3": build_wrong(),
        "sfx-level-complete.mp3": build_level_complete(),
        "sfx-achievement-unlock.mp3": build_achievement(),
    }

    with tempfile.TemporaryDirectory() as tmp:
        tmp_dir = Path(tmp)
        for name, samples in builds.items():
            wav_path = tmp_dir / f"{Path(name).stem}.wav"
            write_wav(wav_path, samples)
            to_mp3(wav_path, out_dir / name)
            print(f"generated {out_dir / name}")


if __name__ == "__main__":
    main()

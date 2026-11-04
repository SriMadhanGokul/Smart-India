# Synthesises an original 60s ambient/tech soundtrack (pads + soft pulse + whooshes on transitions).
# Usage: python audio.py out/music.wav
import sys, wave
import numpy as np

SR = 44100
DUR = 60.0
t = np.arange(int(SR * DUR)) / SR
rng = np.random.default_rng(3)

def note(n):  # MIDI -> Hz
    return 440.0 * 2 ** ((n - 69) / 12)

# Chord progression (Am9 - Fmaj7 - Cadd9 - Gsus), 4 bars of 3.75s at 64 bpm-ish
CHORDS = [[57, 60, 64, 67, 71], [53, 57, 60, 64, 69], [48, 55, 62, 64, 67], [55, 60, 62, 67, 74]]
BAR = 3.75
mix = np.zeros_like(t)

# Pads: detuned saws via additive partials, slow crossfade between chords
pad = np.zeros_like(t)
for i in range(int(DUR / BAR) + 1):
    ch = CHORDS[i % len(CHORDS)]
    start = i * BAR
    env = np.clip((t - start + 0.6) / 1.2, 0, 1) * np.clip((start + BAR + 0.6 - t) / 1.2, 0, 1)
    if not env.any():
        continue
    for n in ch:
        f = note(n)
        for det in (-0.12, 0.0, 0.12):
            ff = f * 2 ** (det / 12)
            for k in range(1, 6):
                pad += env * np.sin(2 * np.pi * ff * k * t + rng.random() * 6.28) / (k * 1.6)
pad /= np.abs(pad).max()
# gentle low-pass (one-pole) for warmth
def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc; y[i] = acc
    return y
pad = lowpass(pad, 1400)
pad /= np.abs(pad).max()
mix += 0.33 * pad

# Sub bass following chord root
bass = np.zeros_like(t)
for i in range(int(DUR / BAR) + 1):
    root = note(CHORDS[i % 4][0] - 12)
    seg = (t >= i * BAR) & (t < (i + 1) * BAR)
    bass[seg] = np.sin(2 * np.pi * root * t[seg])
mix += 0.16 * bass * np.clip(t / 3, 0, 1)

# Soft pulse (kick + hat) from 2.6s once the site loads
BEAT = BAR / 4
kick = np.zeros_like(t); hat = np.zeros_like(t)
noise = rng.standard_normal(len(t))
for b in np.arange(2.6, DUR - 0.5, BEAT):
    i0 = int(b * SR); n = int(0.35 * SR); tt = np.arange(n) / SR
    k = np.sin(2 * np.pi * (48 + 90 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 9)
    kick[i0:i0 + n] += k[: len(kick) - i0]
    h0 = int((b + BEAT / 2) * SR); hn = int(0.06 * SR)
    if h0 + hn < len(t):
        hat[h0:h0 + hn] += noise[h0:h0 + hn] * np.exp(-np.arange(hn) / SR * 70)
hat = hat - lowpass(hat, 6000)
mix += 0.22 * kick + 0.05 * hat

# Whooshes on scroll / page transitions
for w in [2.2, 11.8, 25.9, 30.9, 34.8, 37.4, 40.6, 45.0, 48.9, 51.4, 54.4, 56.8]:
    i0 = int((w - 0.5) * SR); n = int(1.1 * SR)
    if i0 + n > len(t):
        continue
    tt = np.arange(n) / SR
    env = np.sin(np.pi * tt / 1.1) ** 2
    sw = noise[i0:i0 + n] * env
    sw = lowpass(sw, 2500) - lowpass(sw, 300)
    mix[i0:i0 + n] += 0.5 * sw / (np.abs(sw).max() + 1e-9)

# Master fade + normalise
mix *= np.clip(t / 1.0, 0, 1) * np.clip((DUR - t) / 2.0, 0, 1)
mix /= np.abs(mix).max()
mix *= 0.85
stereo = np.stack([mix, np.roll(mix, 220)], axis=1)
pcm = (stereo * 32767).astype(np.int16)
with wave.open(sys.argv[1] if len(sys.argv) > 1 else 'out/music.wav', 'wb') as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes(pcm.tobytes())
print('ok')

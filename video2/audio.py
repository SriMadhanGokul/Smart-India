# Original 76s cinematic soundtrack: dark drones, soft pulse, risers, impacts on scene cuts.
# Usage: python audio.py out/music.wav
import sys, wave
import numpy as np
from scipy.signal import lfilter

SR = 48000
DUR = 76.0
t = np.arange(int(SR * DUR)) / SR
rng = np.random.default_rng(5)
noise = rng.standard_normal(len(t))

def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    return lfilter([1 - a], [1, -a], x)

def note(n):
    return 440.0 * 2 ** ((n - 69) / 12)

def env_between(a, b, fade=1.0):
    return np.clip((t - a) / fade, 0, 1) * np.clip((b - t) / fade, 0, 1)

mix = np.zeros_like(t)

# Section moods: (start, end, chord MIDI notes, brightness)
SECTIONS = [
    (0.0, 5.4, [62, 69, 74], 900),             # loader: airy, light
    (5.3, 29.6, [38, 45, 50, 57, 60], 700),    # dark hero/about: Dm(add9) drone
    (29.0, 48.6, [43, 50, 55, 59, 62, 66], 1600),  # light section: Gmaj7 warmth
    (48.2, 67.4, [36, 43, 48, 51, 55], 600),   # services: dark Cm
    (67.0, 76.0, [41, 48, 53, 57, 60, 64], 1800),  # design in motion: Fmaj9
]
for a, b, chord, bright in SECTIONS:
    e = env_between(a, b, 0.8)
    pad = np.zeros_like(t)
    for n in chord:
        f = note(n)
        for det in (-0.08, 0.0, 0.08):
            ff = f * 2 ** (det / 12)
            for k in range(1, 5):
                pad += np.sin(2 * np.pi * ff * k * t + rng.random() * 6.28) / (k * 1.8)
    pad = lp(pad * e, bright)
    mix += 0.3 * pad / (np.abs(pad).max() + 1e-9)

# Sub drone under dark sections
sub = np.sin(2 * np.pi * note(26) * t) * (env_between(5.3, 29.6, 1.5) + env_between(50.5, 67.3, 1.5))
mix += 0.22 * sub

# Pulse (kick + ticks) at 96 bpm in hero/about, light section and services
BEAT = 60 / 96
kick = np.zeros_like(t); tick = np.zeros_like(t)
for b in np.arange(7.0, DUR - 1, BEAT):
    if 28.3 < b < 29.9 or 47.8 < b < 50.8 or 57.6 < b < 59.0 or 66.5 < b < 68.3:
        continue
    i0 = int(b * SR); n = int(.3 * SR); tt = np.arange(n) / SR
    if i0 + n < len(t):
        kick[i0:i0 + n] += np.sin(2 * np.pi * (45 + 80 * np.exp(-tt * 35)) * tt) * np.exp(-tt * 10)
    j0 = int((b + BEAT / 2) * SR); m = int(.05 * SR)
    if j0 + m < len(t):
        tick[j0:j0 + m] += noise[j0:j0 + m] * np.exp(-np.arange(m) / SR * 90)
tick = tick - lp(tick, 5000)
mix += 0.2 * kick + 0.05 * tick

# Risers before big moments and impacts on them
def riser(at, length=1.6, amt=.35):
    i0 = int((at - length) * SR); n = int(length * SR)
    tt = np.arange(n) / n
    s = noise[i0:i0 + n] * tt ** 2
    s = lp(s, 4000) - lp(s, 400)
    mix[i0:i0 + n] += amt * s / (np.abs(s).max() + 1e-9)

def impact(at, amt=.9, decay=2.5):
    i0 = int(at * SR); n = int(2.5 * SR); tt = np.arange(n) / SR
    n = min(n, len(t) - i0); tt = tt[:n]
    boom = np.sin(2 * np.pi * (32 + 60 * np.exp(-tt * 12)) * tt) * np.exp(-tt * decay)
    crack = lp(noise[i0:i0 + n], 3000) * np.exp(-tt * 18)
    mix[i0:i0 + n] += amt * (boom + .35 * crack)

for at in (5.3, 28.6, 48.3, 66.9):
    riser(at)
for at, amt in ((5.3, .8), (28.9, .6), (49.0, .5), (58.3, 1.0), (60.4, .45), (67.3, .6), (68.05, .35)):
    impact(at, amt)
# thunder + electric cracks synced to the video's lightning strikes (same list as js/storm.js)
FLASHES = [(51.72, .8), (52.48, .5), (53.46, .9), (54.52, .45), (55.56, .6), (55.9, 1), (56.22, .85), (57.06, 1), (57.62, .5),
           (59.82, .7), (60.17, 1), (61.43, 1), (62.17, .9), (63.47, .8), (64.5, .45), (65.57, .5), (65.9, 1), (66.2, .7)]
brown = lfilter([1], [1, -.995], noise) * .05
for at, s in FLASHES:
    i0 = int(at * SR)
    n = min(int(.07 * SR), len(t) - i0)
    if s >= .85 and n > 0:                       # sharp crackle of the visible bolt
        c = noise[i0:i0 + n] * np.exp(-np.arange(n) / SR * 60)
        c = c - lp(c, 1800)
        mix[i0:i0 + n] += .35 * s * c / (np.abs(c).max() + 1e-9)
    j0 = int((at + .12) * SR); m = min(int(2.4 * SR), len(t) - j0)
    if m > 0:                                     # low rolling rumble
        tt = np.arange(m) / SR
        r = lp(brown[j0:j0 + m], 160) * (1 - np.exp(-tt * 9)) * np.exp(-tt * 1.6)
        mix[j0:j0 + m] += .55 * s * r / (np.abs(r).max() + 1e-9)
# carving scrapes on the stone
for at in (62.0, 62.55, 62.85):
    i0 = int(at * SR); n = int(1.0 * SR)
    s = noise[i0:i0 + n] * np.sin(np.pi * np.arange(n) / n) ** 2
    s = lp(s, 2200) - lp(s, 700)
    mix[i0:i0 + n] += .25 * s / (np.abs(s).max() + 1e-9)

mix *= np.clip(t / .8, 0, 1) * np.clip((DUR - t) / 2.5, 0, 1)
mix = np.tanh(mix / (np.abs(mix).max() + 1e-9) * 1.4)
mix = .88 * mix / np.abs(mix).max()
stereo = np.stack([mix, np.roll(mix, 240)], axis=1)
with wave.open(sys.argv[1] if len(sys.argv) > 1 else 'out/music.wav', 'wb') as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR)
    wf.writeframes((stereo * 32767).astype(np.int16).tobytes())
print('ok')

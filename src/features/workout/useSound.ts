import { useRef } from 'react';

export function useSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);

  function ctx(): AudioContext | null {
    if (!enabled) return null;
    try {
      if (!ctxRef.current) ctxRef.current = new AudioContext();
      if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
      return ctxRef.current;
    } catch {
      return null;
    }
  }

  function tone(freq: number, dur: number, gain = 0.25, type: OscillatorType = 'sine') {
    const ac = ctx();
    if (!ac) return;
    try {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.connect(g);
      g.connect(ac.destination);
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(gain, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + dur);
    } catch {
      /* ignore */
    }
  }

  return {
    tick: () => tone(660, 0.08, 0.2),
    go: () => {
      tone(880, 0.08, 0.3);
      setTimeout(() => tone(1320, 0.15, 0.35), 80);
    },
    rep: () => tone(880, 0.1, 0.25),
    error: () => tone(220, 0.1, 0.15, 'sawtooth'),
    setDone: () => {
      tone(523, 0.1, 0.3);
      setTimeout(() => tone(659, 0.1, 0.3), 100);
      setTimeout(() => tone(784, 0.2, 0.35), 200);
    },
    restEnd: () => {
      tone(880, 0.08, 0.3);
      setTimeout(() => tone(1100, 0.15, 0.35), 80);
    },
  };
}

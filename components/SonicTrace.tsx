
import React, { useCallback, useRef } from 'react';
import { EpistemicStatus } from '../types';

interface SonicTraceProps {
  status: EpistemicStatus;
  isActive?: boolean;
}

const SonicTrace: React.FC<SonicTraceProps> = ({ status, isActive }) => {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playDiagnostic = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.setValueAtTime(0.1, now);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    switch (status) {
      case EpistemicStatus.UNDERSTOOD: {
        // Clear click / Sine beep
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }
      case EpistemicStatus.MISUNDERSTOOD: {
        // Phase beating / detuned tones
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.frequency.setValueAtTime(220, now);
        osc2.frequency.setValueAtTime(223, now); // Detuned for beating
        osc1.connect(masterGain);
        osc2.connect(masterGain);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.6);
        osc2.stop(now + 0.6);
        break;
      }
      case EpistemicStatus.REFUSED: {
        // Noise burst then silence
        const bufferSize = ctx.sampleRate * 0.2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.15, now);
        noiseGain.gain.linearRampToValueAtTime(0, now + 0.1);
        noise.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(now);
        break;
      }
    }
  }, [status]);

  return (
    <button
      onClick={playDiagnostic}
      className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center
        ${status === EpistemicStatus.UNDERSTOOD ? 'bg-green-900/40 text-green-400 hover:bg-green-800/60' : ''}
        ${status === EpistemicStatus.MISUNDERSTOOD ? 'bg-amber-900/40 text-amber-400 hover:bg-amber-800/60' : ''}
        ${status === EpistemicStatus.REFUSED ? 'bg-red-900/40 text-red-400 hover:bg-red-800/60' : ''}
      `}
      title="Play diagnostic sonification"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
    </button>
  );
};

export default SonicTrace;

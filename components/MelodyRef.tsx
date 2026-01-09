import React, { useCallback, useRef, useState } from 'react';
import { MusicalNote, Language } from '../types';
import { UI_STRINGS } from '../constants';

interface MelodyRefProps {
  notes: MusicalNote[];
  lang?: Language;
}

const MelodyRef: React.FC<MelodyRefProps> = ({ notes, lang = 'en' }) => {
  const strings = UI_STRINGS[lang];
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playMelody = useCallback(() => {
    if (isPlaying) return;
    
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    setIsPlaying(true);

    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.setValueAtTime(0.15, now);

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      
      // Simple synth sound
      osc.type = 'triangle';
      const freq = 440 * Math.pow(2, (note.pitch - 69) / 12);
      osc.frequency.setValueAtTime(freq, now + note.start);
      
      noteGain.gain.setValueAtTime(0, now + note.start);
      noteGain.gain.linearRampToValueAtTime(0.2, now + note.start + 0.05);
      noteGain.gain.linearRampToValueAtTime(0, now + note.start + note.duration);
      
      osc.connect(noteGain);
      noteGain.connect(masterGain);
      
      osc.start(now + note.start);
      osc.stop(now + note.start + note.duration);
    });

    const totalDuration = Math.max(...notes.map(n => n.start + n.duration));
    setTimeout(() => setIsPlaying(false), totalDuration * 1000 + 100);
  }, [notes, isPlaying]);

  return (
    <button
      onClick={playMelody}
      disabled={isPlaying}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-xs font-bold uppercase tracking-wider
        ${isPlaying ? 'bg-cyan-500 text-black animate-pulse' : 'bg-white/10 text-white hover:bg-white/20'}
      `}
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
      </svg>
      {isPlaying ? strings.playingRef : strings.playRef}
    </button>
  );
};

export default MelodyRef;
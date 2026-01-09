
import React from 'react';
import { MusicalNote, Language } from '../types';
import { UI_STRINGS } from '../constants';

interface PianoRollProps {
  notes: MusicalNote[];
  color?: string;
  lang?: Language;
}

const PianoRoll: React.FC<PianoRollProps> = ({ notes, color = '#22d3ee', lang = 'en' }) => {
  const strings = UI_STRINGS[lang];
  if (!notes || notes.length === 0) return <div className="h-24 flex items-center justify-center text-slate-700 italic text-xs">{lang === 'en' ? 'No sequence data' : '无序列数据'}</div>;

  const minPitch = Math.min(...notes.map(n => n.pitch)) - 2;
  const maxPitch = Math.max(...notes.map(n => n.pitch)) + 2;
  // Fix: Removed self-referencing pitchRange and calculated displayRange directly with a minimum constraint
  const displayRange = Math.max(maxPitch - minPitch, 12);
  
  const maxTime = Math.max(...notes.map(n => n.start + n.duration));
  
  return (
    <div className="relative w-full h-32 bg-black/40 rounded-xl overflow-hidden border border-white/5 group">
      <svg className="w-full h-full" viewBox={`0 0 ${maxTime * 100} ${displayRange * 10}`} preserveAspectRatio="none">
        {/* Pitch Lines */}
        {Array.from({ length: displayRange }).map((_, i) => (
          <line 
            key={i} 
            x1="0" 
            y1={i * 10} 
            x2={maxTime * 100} 
            y2={i * 10} 
            stroke="rgba(255,255,255,0.05)" 
            strokeWidth="0.5"
          />
        ))}
        {/* Notes */}
        {notes.map((note, i) => (
          <rect
            key={i}
            x={note.start * 100}
            y={(maxPitch - note.pitch) * 10}
            width={note.duration * 100}
            height={8}
            fill={color}
            rx="1"
            className="opacity-60 group-hover:opacity-100 transition-opacity"
          />
        ))}
      </svg>
      <div className="absolute bottom-1 right-2 text-[8px] uppercase font-bold text-white/20">{strings.pianoRollLabel}</div>
    </div>
  );
};

export default PianoRoll;

import React from 'react';
import { STANDARD_TUNING } from '../constants';
import { NoteInfo } from '../types';

interface StringSelectorProps {
  currentNote: NoteInfo | null;
}

const StringSelector: React.FC<StringSelectorProps> = ({ currentNote }) => {
  
  const isMatch = (targetNote: string, targetOctave: number) => {
    if (!currentNote) return false;
    return currentNote.name === targetNote && currentNote.octave === targetOctave;
  };

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-xs mt-8">
      {STANDARD_TUNING.map((str) => {
        const active = isMatch(str.note, str.octave);
        const nearlyActive = !active && currentNote && currentNote.name === str.note;
        
        return (
          <div
            key={`${str.note}${str.octave}`}
            className={`
              flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300
              ${active 
                ? 'bg-emerald-900/30 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] transform scale-105' 
                : nearlyActive 
                  ? 'bg-gray-800/80 border-gray-600 opacity-70'
                  : 'bg-gray-800/40 border-gray-800 opacity-40'
              }
            `}
          >
            <span className={`text-xl font-bold ${active ? 'text-white' : 'text-gray-400'}`}>
              {str.note}
            </span>
            <span className="text-xs text-gray-500 font-mono mt-1">
              {str.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default StringSelector;

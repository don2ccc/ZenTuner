import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Info, Sparkles, AlertCircle, X } from 'lucide-react';
import TunerMeter from './components/TunerMeter';
import StringSelector from './components/StringSelector';
import { autoCorrelate, getNoteFromFrequency } from './services/audioProcessor';
import { getGuitarAdvice } from './services/geminiService';
import { NoteInfo, TuningTip } from './types';

const App: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [currentNote, setCurrentNote] = useState<NoteInfo | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  
  // AI State
  const [tipOpen, setTipOpen] = useState(false);
  const [loadingTip, setLoadingTip] = useState(false);
  const [aiTip, setAiTip] = useState<TuningTip | null>(null);

  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startListening = async () => {
    try {
      setAudioError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioCtx = audioContextRef.current;
      
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      
      analyserRef.current = analyser;
      sourceRef.current = source;
      setIsListening(true);
      
      updatePitch();
    } catch (err) {
      console.error(err);
      setAudioError("Microphone access denied. Please allow permissions.");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    setIsListening(false);
    setCurrentNote(null);
  };

  const updatePitch = useCallback(() => {
    if (!analyserRef.current || !audioContextRef.current) return;

    const buffer = new Float32Array(analyserRef.current.fftSize);
    analyserRef.current.getFloatTimeDomainData(buffer);
    
    const frequency = autoCorrelate(buffer, audioContextRef.current.sampleRate);
    
    if (frequency !== -1) {
      // Smooth out the display slightly or use directly for responsiveness
      // For simplicity in this MVP, we use direct detection
      // Ignore extremely low/high frequencies that aren't guitar related
      if (frequency > 60 && frequency < 1000) {
        const note = getNoteFromFrequency(frequency);
        setCurrentNote(note);
      }
    }

    animationFrameRef.current = requestAnimationFrame(updatePitch);
  }, []);

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const fetchAdvice = async (topic: string) => {
    setLoadingTip(true);
    setAiTip(null);
    const tip = await getGuitarAdvice(topic);
    setAiTip(tip);
    setLoadingTip(false);
  };

  useEffect(() => {
    return () => stopListening();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6 relative">
      
      {/* Header */}
      <header className="w-full max-w-md flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/50">
             <Mic size={18} className="text-gray-900" />
           </div>
           <h1 className="text-xl font-bold tracking-tight text-gray-100">ZenTuner AI</h1>
        </div>
        <button 
          onClick={() => {
             setTipOpen(true);
             if (!aiTip) fetchAdvice("General tuning tips");
          }}
          className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
        >
          <Sparkles size={20} className="text-amber-400" />
        </button>
      </header>

      {/* Main Tuner Area */}
      <main className="flex-1 w-full max-w-md flex flex-col items-center">
        
        <div className="relative w-full flex flex-col items-center justify-center bg-gray-800/30 rounded-3xl border border-gray-800 p-6 shadow-2xl backdrop-blur-sm">
            {audioError ? (
              <div className="text-rose-400 flex flex-col items-center text-center gap-2 p-8">
                <AlertCircle size={48} />
                <p>{audioError}</p>
              </div>
            ) : (
              <TunerMeter noteInfo={currentNote} isActive={isListening} />
            )}
        </div>

        <StringSelector currentNote={currentNote} />

        <div className="mt-auto mb-8 w-full flex justify-center">
           <button
             onClick={handleToggle}
             className={`
               flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-lg
               ${isListening 
                 ? 'bg-rose-500/10 text-rose-500 border border-rose-500/50 hover:bg-rose-500/20' 
                 : 'bg-emerald-500 text-gray-900 hover:bg-emerald-400 hover:scale-105 shadow-emerald-500/20'
               }
             `}
           >
             {isListening ? (
               <>
                 <MicOff size={24} /> Stop Listening
               </>
             ) : (
               <>
                 <Mic size={24} /> Start Tuner
               </>
             )}
           </button>
        </div>
      </main>

      {/* AI Assistant Modal */}
      {tipOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-gray-800 w-full max-w-sm rounded-2xl border border-gray-700 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 fade-in">
             
             {/* Modal Header */}
             <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
               <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-400" />
                  <h3 className="font-bold text-gray-200">AI Guitar Tech</h3>
               </div>
               <button onClick={() => setTipOpen(false)} className="text-gray-500 hover:text-white">
                 <X size={20} />
               </button>
             </div>

             {/* Content */}
             <div className="p-6 min-h-[180px] flex flex-col justify-center">
                {loadingTip ? (
                  <div className="flex flex-col items-center gap-3 text-gray-400 animate-pulse">
                    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm">Consulting the digital luthier...</p>
                  </div>
                ) : aiTip ? (
                  <div>
                    <h4 className="text-amber-400 font-bold text-lg mb-2">{aiTip.title}</h4>
                    <p className="text-gray-300 leading-relaxed text-sm">{aiTip.content}</p>
                  </div>
                ) : (
                  <p className="text-gray-400 text-center">What do you need help with?</p>
                )}
             </div>

             {/* Actions */}
             <div className="p-4 bg-gray-900/50 flex gap-2 overflow-x-auto">
               <button 
                 onClick={() => fetchAdvice("New strings keep going out of tune")}
                 className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs whitespace-nowrap transition-colors"
               >
                 New Strings
               </button>
               <button 
                 onClick={() => fetchAdvice("How to fix fret buzz")}
                 className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs whitespace-nowrap transition-colors"
               >
                 Fret Buzz
               </button>
               <button 
                 onClick={() => fetchAdvice("How to check intonation")}
                 className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs whitespace-nowrap transition-colors"
               >
                 Intonation
               </button>
             </div>
          </div>
        </div>
      )}

      <footer className="absolute bottom-2 text-xs text-gray-600 font-mono">
        ZenTuner v1.0 • Web Audio API
      </footer>
    </div>
  );
};

export default App;

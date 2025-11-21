import { NOTE_STRINGS, A4 } from '../constants';
import { NoteInfo } from '../types';

// Autocorrelation algorithm to detect pitch from audio buffer
// This is more accurate for musical instruments than simple Zero-Crossing or FFT peak detection alone.
export const autoCorrelate = (buffer: Float32Array, sampleRate: number): number => {
  let size = buffer.length;
  let rms = 0;

  // 1. Calculate Root Mean Square (RMS) to detect if there's enough signal
  for (let i = 0; i < size; i++) {
    const val = buffer[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / size);

  if (rms < 0.01) {
    // Signal too low (noise gate)
    return -1;
  }

  // 2. Trim the buffer to the significant part
  let r1 = 0;
  let r2 = size - 1;
  const threshold = 0.2;
  
  for (let i = 0; i < size / 2; i++) {
    if (Math.abs(buffer[i]) < threshold) {
      r1 = i;
    } else {
      break;
    }
  }
  
  for (let i = 1; i < size / 2; i++) {
    if (Math.abs(buffer[size - i]) < threshold) {
      r2 = size - i;
    } else {
      break;
    }
  }

  const trimBuffer = buffer.slice(r1, r2);
  size = trimBuffer.length;

  // 3. Autocorrelation
  const c = new Array(size).fill(0);
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size - i; j++) {
      c[i] = c[i] + trimBuffer[j] * trimBuffer[j + i];
    }
  }

  let d = 0;
  // Skip the first peak (which is at lag 0)
  while (c[d] > c[d + 1]) d++;
  
  let maxval = -1;
  let maxpos = -1;

  for (let i = d; i < size; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }

  let T0 = maxpos;

  // Parabolic interpolation for higher precision
  const x1 = c[T0 - 1];
  const x2 = c[T0];
  const x3 = c[T0 + 1];
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  
  if (a) {
    T0 = T0 - b / (2 * a);
  }

  return sampleRate / T0;
};

export const getNoteFromFrequency = (frequency: number): NoteInfo => {
  const noteNum = 12 * (Math.log(frequency / A4) / Math.log(2));
  const roundedNoteNum = Math.round(noteNum) + 69; // MIDI note number
  const noteIndex = roundedNoteNum % 12;
  
  const name = NOTE_STRINGS[noteIndex];
  const octave = Math.floor(roundedNoteNum / 12) - 1;
  
  // Calculate deviation in cents
  // Frequency of the perfect note
  const perfectFreq = A4 * Math.pow(2, (roundedNoteNum - 69) / 12);
  const cents = Math.floor(1200 * Math.log2(frequency / perfectFreq));

  return {
    name,
    octave,
    frequency,
    deviation: cents,
    centsOff: cents
  };
};

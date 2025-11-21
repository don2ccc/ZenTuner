// Standard Guitar Tuning Frequencies
export const STANDARD_TUNING = [
  { note: 'E', octave: 2, frequency: 82.41, label: '6 (Low E)' },
  { note: 'A', octave: 2, frequency: 110.00, label: '5 (A)' },
  { note: 'D', octave: 3, frequency: 146.83, label: '4 (D)' },
  { note: 'G', octave: 3, frequency: 196.00, label: '3 (G)' },
  { note: 'B', octave: 3, frequency: 246.94, label: '2 (B)' },
  { note: 'E', octave: 4, frequency: 329.63, label: '1 (High E)' },
];

export const NOTE_STRINGS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export const A4 = 440;
export const SMOOTHING_FACTOR = 0.8; // For UI needle movement

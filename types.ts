export interface NoteInfo {
  name: string;
  octave: number;
  frequency: number;
  deviation: number; // Cents
  centsOff: number;
}

export enum TunerStatus {
  Idle = 'Idle',
  Listening = 'Listening',
  Error = 'Error',
}

export interface TuningTip {
  title: string;
  content: string;
}

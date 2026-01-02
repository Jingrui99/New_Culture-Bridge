
export enum EpistemicStatus {
  UNDERSTOOD = 'UNDERSTOOD',
  MISUNDERSTOOD = 'MISUNDERSTOOD',
  REFUSED = 'REFUSED'
}

export interface AnalysisNode {
  title: string;
  description: string;
  status: EpistemicStatus;
  details: string;
}

export interface ComposerTask {
  id: string;
  question: string;
  options: string[];
}

export interface MusicalNote {
  pitch: number; // MIDI pitch (0-127)
  start: number; // Seconds
  duration: number; // Seconds
}

export interface Proposition {
  title: string;
  description: string;
  musical_sketch_prompt: string;
  notes: MusicalNote[]; // Data for the Piano Roll
}

export interface EpistemicProbeResult {
  id: string;
  geographicOrigin: AnalysisNode;
  tonalStructure: AnalysisNode;
  ambiguity: AnalysisNode;
  culturalRefusal: AnalysisNode;
  tasks: ComposerTask[];
  propositions: Proposition[];
}

export type Language = 'en' | 'zh';

export const KNOWLEDGE_SYSTEMS = [
  'Sizhu / 丝竹',
  'Chinese Traditional / 中国传统',
  'Indian Raga / 印度拉格',
  'Western Classical / 西方古典',
  'Jazz / 爵士',
  'Middle Eastern / 中东音乐',
  'Gamelan / 佳美兰'
];

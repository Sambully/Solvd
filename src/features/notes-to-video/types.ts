export type VisualType =
  | "diagram"
  | "formula_derivation"
  | "cycle_mechanism"
  | "comparison_table"
  | "key_summary";

export interface Scene {
  sceneNumber: number;
  title: string;
  narration: string;
  visualType: VisualType;
  diagramTitle: string;
  svgMarkup: string;
  bulletPoints: string[];
  formula?: string | null;
  highlightKeyword: string;
  mnemonic?: string | null;
  audioUrl?: string;
  durationSeconds?: number;
}

export interface VideoLesson {
  id: string;
  title: string;
  subject: "Physics" | "Chemistry" | "Biology" | "General";
  summary: string;
  scenes: Scene[];
  totalDurationSeconds: number;
  createdAt: string;
}

export interface VoiceOption {
  id: string;
  name: string;
  voiceName: string;
  gender: "Female" | "Male";
  tag: string;
  accent: string;
}

export const AVAILABLE_VOICES: VoiceOption[] = [
  {
    id: "neerja",
    name: "Neerja",
    voiceName: "en-IN-NeerjaNeural",
    gender: "Female",
    tag: "Calm & Clear Tutor",
    accent: "English (India)",
  },
  {
    id: "prabhat",
    name: "Prabhat",
    voiceName: "en-IN-PrabhatNeural",
    gender: "Male",
    tag: "High-Energy Lecturer",
    accent: "English (India)",
  },
  {
    id: "jenny",
    name: "Jenny",
    voiceName: "en-US-JennyNeural",
    gender: "Female",
    tag: "Studio Neutral",
    accent: "English (US)",
  },
];

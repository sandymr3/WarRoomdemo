// ============================================
// WAR ROOM DEMO — Simplified Types
// ============================================

export type DemoStage =
  | 'WELCOME'
  | 'INTRODUCTION'
  | 'LOADING_SCENARIO'
  | 'SCENARIO'
  | 'LOADING_FOLLOWUP'
  | 'FOLLOWUP_SCENARIO'
  | 'EVALUATING'
  | 'FEEDBACK'
  | 'REPORT';

export interface DemoScenarioOption {
  id: string;
  text: string;
  feedback: string;
}

export interface DemoScenario {
  question: string;
  context: string;
  options: DemoScenarioOption[];
}

export interface DemoFollowupScenario {
  question: string;
  context: string;
}

export interface DemoEvaluation {
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
}

export interface DemoVoiceEvaluation extends DemoEvaluation {
  transcription: string;
  clarity: number;
  confidence: number;
}

export interface RoundResult {
  round: number;
  scenario: DemoScenario;
  selectedOption: DemoScenarioOption;
  followupScenario: DemoFollowupScenario;
  userResponse: string;
  responseMode: 'text' | 'voice';
  evaluation: DemoEvaluation | DemoVoiceEvaluation;
}

// Backend API base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  type DemoStage, type DemoScenario, type DemoScenarioOption,
  type DemoFollowupScenario, type DemoEvaluation,
  type DemoVoiceEvaluation, type RoundResult, API_BASE,
} from "./data";

// ============================================
// API HELPERS
// ============================================
async function apiGenerateScenario(introduction: string, roundNumber: number, previousScenarios: string): Promise<DemoScenario> {
  const res = await fetch(`${API_BASE}/demo/generate-scenario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ introduction, roundNumber, previousScenarios }),
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed to generate scenario'); }
  return res.json();
}

async function apiGenerateFollowup(
  introduction: string, originalQuestion: string,
  selectedOptionText: string, selectedOptionFeedback: string, roundNumber: number
): Promise<DemoFollowupScenario> {
  const res = await fetch(`${API_BASE}/demo/generate-followup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ introduction, originalQuestion, selectedOptionText, selectedOptionFeedback, roundNumber }),
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed to generate follow-up'); }
  return res.json();
}

async function apiEvaluateText(introduction: string, question: string, response: string): Promise<DemoEvaluation> {
  const res = await fetch(`${API_BASE}/demo/evaluate-response`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ introduction, question, response }),
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed to evaluate response'); }
  return res.json();
}

async function apiEvaluateVoice(introduction: string, question: string, audio: Blob): Promise<DemoVoiceEvaluation> {
  const fd = new FormData();
  fd.append('introduction', introduction);
  fd.append('question', question);
  fd.append('audio', audio, 'response.webm');
  const res = await fetch(`${API_BASE}/demo/evaluate-voice`, { method: 'POST', body: fd });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed to evaluate voice'); }
  return res.json();
}

async function apiGeneratePitch(introduction: string): Promise<{ question: string; context: string }> {
  const res = await fetch(`${API_BASE}/demo/generate-pitch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ introduction }),
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed to generate pitch'); }
  return res.json();
}

async function apiGeneratePitchQnA(introduction: string, pitchResponse: string, roundNumber: number): Promise<{ question: string; context: string }> {
  const res = await fetch(`${API_BASE}/demo/generate-pitch-qna`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ introduction, pitchResponse, roundNumber }),
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed to generate pitch Q&A'); }
  return res.json();
}

async function apiGenerateNegotiation(introduction: string, pitchResponse: string, roundNumber: number, previousContext: string): Promise<{ question: string; context: string }> {
  const res = await fetch(`${API_BASE}/demo/generate-negotiation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ introduction, pitchResponse, roundNumber, previousContext }),
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed to generate negotiation'); }
  return res.json();
}

async function apiGenerateCompetencyReport(summary: string): Promise<any> {
  const res = await fetch(`${API_BASE}/demo/generate-competency-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ summary }),
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed to generate competency report'); }
  return res.json();
}


// ============================================
// SHARED UI
// ============================================
function PhaseHeader({ icon, tag, title, subtitle }: { icon: string; tag: string; title: string; subtitle?: string }) {
  return (
    <div className="animate-fade-in-up mb-8">
      {tag && <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4" style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.2)' }}>
        <span>{icon}</span> {tag}
      </div>}
      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">{title}</h2>
      {subtitle && <p className="text-base text-gray-400 max-w-2xl">{subtitle}</p>}
    </div>
  );
}

function NextButton({ onClick, disabled, label, loading }: { onClick: () => void; disabled?: boolean; label?: string; loading?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled || loading}
      className="mt-6 px-8 py-3.5 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 justify-center"
      style={{ background: (disabled || loading) ? '#333' : 'linear-gradient(135deg, #7c3aed, #f59e0b)' }}>
      {loading && <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
      {label || 'Continue →'}
    </button>
  );
}

function ScoreBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-2.5 rounded-full transition-all duration-1000" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
      <span className="text-xs font-mono font-bold w-10 text-right" style={{ color }}>{value}/{max}</span>
    </div>
  );
}

// ============================================
// PROGRESS
// ============================================
const TOTAL_ROUNDS = 2;

const StageProgressBar = ({ round, total }: { round: number; total: number }) => {
  const pct = Math.round((round / total) * 100);
  return (
    <div className="progress-bar w-full">
      <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
};

// ============================================
// MAIN
// ============================================
export default function DemoPage() {
  const [stage, setStage] = useState<DemoStage>('WELCOME');
  const [introduction, setIntroduction] = useState('');
  const [currentRound, setCurrentRound] = useState(1);
  const [scenario, setScenario] = useState<DemoScenario | null>(null);
  const [selectedOption, setSelectedOption] = useState<DemoScenarioOption | null>(null);
  const [followupScenario, setFollowupScenario] = useState<DemoFollowupScenario | null>(null);
  const [userResponse, setUserResponse] = useState('');
  const [responseMode, setResponseMode] = useState<'text' | 'voice'>('text');
  const [results, setResults] = useState<RoundResult[]>([]);
  const [currentEval, setCurrentEval] = useState<DemoEvaluation | DemoVoiceEvaluation | null>(null);
  const [pitchEval, setPitchEval] = useState<DemoVoiceEvaluation | null>(null);
  const [negEval, setNegEval] = useState<DemoEvaluation | null>(null);
  const [pitchData, setPitchData] = useState<{ question: string; context: string } | null>(null);
  const [negData, setNegData] = useState<{ question: string; context: string } | null>(null);
  const [pitchQnARound, setPitchQnARound] = useState(1);
  const [pitchQnaData, setPitchQnaData] = useState<{ question: string; context: string } | null>(null);
  const [pitchQnaEval, setPitchQnaEval] = useState<DemoEvaluation | DemoVoiceEvaluation | null>(null);
  const [pitchQnaResults, setPitchQnaResults] = useState<any[]>([]);
  const [negotiationRound, setNegotiationRound] = useState(1);
  const [negResults, setNegResults] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Voice recording
  const [recording, setRecording] = useState(false);
  const [recTime, setRecTime] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  // Recording timer
  useEffect(() => {
    if (!recording) return;
    const iv = setInterval(() => setRecTime(p => p + 1), 1000);
    return () => clearInterval(iv);
  }, [recording]);

  // Init speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SR && !recognitionRef.current) {
        recognitionRef.current = new SR();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
      }
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
      setRecTime(0);
      setTranscript('');
      setAudioBlob(null);

      // Start speech recognition for live transcript
      if (recognitionRef.current) {
        recognitionRef.current.onresult = (event: any) => {
          let t = '';
          for (let i = 0; i < event.results.length; i++) t += event.results[i][0].transcript;
          setTranscript(t);
        };
        try { recognitionRef.current.start(); } catch {}
      }
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setRecording(false);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // ============================================
  // HANDLERS
  // ============================================
  const handleSubmitIntroduction = async () => {
    if (!introduction.trim() || introduction.trim().length < 20) {
      setError('Please describe your business idea in at least 20 characters.');
      return;
    }
    setError('');
    setStage('LOADING_SCENARIO');
    setLoading(true);
    try {
      const sc = await apiGenerateScenario(introduction, 1, '');
      setScenario(sc);
      setCurrentRound(1);
      setStage('SCENARIO');
    } catch (e: any) {
      setError(e.message);
      setStage('INTRODUCTION');
    } finally {
      setLoading(false);
    }
  };

  // User selects an option → trigger follow-up generation
  const handleSelectOption = async (option: DemoScenarioOption) => {
    if (!scenario) return;
    setSelectedOption(option);
    setError('');
    setStage('LOADING_FOLLOWUP');
    setLoading(true);
    try {
      const fu = await apiGenerateFollowup(
        introduction, scenario.question,
        option.text, option.feedback, currentRound
      );
      setFollowupScenario(fu);
      setStage('FOLLOWUP_SCENARIO');
    } catch (e: any) {
      setError(e.message);
      setStage('SCENARIO');
      setSelectedOption(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTextResponse = async () => {
    if (!userResponse.trim()) { setError('Please write your response.'); return; }
    if (!followupScenario || !scenario || !selectedOption) return;
    setError('');
    setStage('EVALUATING');
    setLoading(true);
    try {
      // Build combined context for evaluation
      const combinedQuestion = `Original scenario: ${scenario.question}\nUser chose: ${selectedOption.text}\nFollow-up challenge: ${followupScenario.question}`;
      const ev = await apiEvaluateText(introduction, combinedQuestion, userResponse);
      setCurrentEval(ev);
      setStage('FEEDBACK');
    } catch (e: any) {
      setError(e.message);
      setStage('FOLLOWUP_SCENARIO');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVoiceResponse = async () => {
    if (!audioBlob) { setError('Please record your response first.'); return; }
    if (!followupScenario || !scenario || !selectedOption) return;
    setError('');
    setStage('EVALUATING');
    setLoading(true);
    try {
      const combinedQuestion = `Original scenario: ${scenario.question}\nUser chose: ${selectedOption.text}\nFollow-up challenge: ${followupScenario.question}`;
      const ev = await apiEvaluateVoice(introduction, combinedQuestion, audioBlob);
      setCurrentEval(ev);
      setUserResponse(ev.transcription || transcript || '[Voice response]');
      setStage('FEEDBACK');
    } catch (e: any) {
      setError(e.message);
      setStage('FOLLOWUP_SCENARIO');
    } finally {
      setLoading(false);
    }
  };

  const handleNextRound = async () => {
    if (!scenario || !currentEval || !selectedOption || !followupScenario) return;

    // Save result
    const result: RoundResult = {
      round: currentRound,
      scenario,
      selectedOption,
      followupScenario,
      userResponse,
      responseMode,
      evaluation: currentEval,
    };
    const newResults = [...results, result];
    setResults(newResults);

    if (currentRound >= TOTAL_ROUNDS) {
      // Reset audio/voice state before entering pitch phase
      setAudioBlob(null);
      setTranscript('');
      setResponseMode('text');
      setUserResponse('');
      setRecTime(0);
      setStage('PITCH_INTRO');
      window.scrollTo(0, 0);
      return;
    }

    // Generate next scenario
    const nextRound = currentRound + 1;
    setCurrentRound(nextRound);
    setUserResponse('');
    setCurrentEval(null);
    setSelectedOption(null);
    setFollowupScenario(null);
    setAudioBlob(null);
    setTranscript('');
    setResponseMode('text');
    setStage('LOADING_SCENARIO');
    setLoading(true);

    const prevSummary = newResults.map(r =>
      `Round ${r.round}: ${r.scenario.context} | Chose: "${r.selectedOption.text}" | Follow-up: ${r.followupScenario.context}`
    ).join('\n');
    try {
      const sc = await apiGenerateScenario(introduction, nextRound, prevSummary);
      setScenario(sc);
      setStage('SCENARIO');
    } catch (e: any) {
      setError(e.message);
      setStage('SCENARIO');
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setStage('WELCOME');
    setIntroduction('');
    setCurrentRound(1);
    setScenario(null);
    setSelectedOption(null);
    setFollowupScenario(null);
    setUserResponse('');
    setResults([]);
    setCurrentEval(null);
    setPitchEval(null);
    setNegEval(null);
    setPitchData(null);
    setNegData(null);
    setError('');
    setAudioBlob(null);
    setTranscript('');
    setResponseMode('text');
    window.scrollTo(0, 0);
  };

  const handleStartPitch = async () => {
    setLoading(true);
    setError('');
    setAudioBlob(null);
    setTranscript('');
    setUserResponse('');
    setRecTime(0);
    window.scrollTo(0, 0);
    try {
      const data = await apiGeneratePitch(introduction);
      setPitchData(data);
      setResponseMode('text');
      setStage('PITCHING');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPitchVoice = async () => {
    if (!audioBlob || !pitchData) return;
    setLoading(true);
    setError('');
    try {
      const ev = await apiEvaluateVoice(introduction, pitchData.question, audioBlob);
      setPitchEval(ev);
      // We also save transcription for the next step
      setUserResponse(ev.transcription);
      setStage('PITCH_FEEDBACK');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPitchText = async () => {
    if (!userResponse.trim() || !pitchData) return;
    setLoading(true);
    setError('');
    try {
      const ev = await apiEvaluateText(introduction, pitchData.question, userResponse);
      // Convert to voice eval format for consistent display
      const pitchResult: DemoVoiceEvaluation = {
        ...ev,
        transcription: userResponse,
        clarity: Math.min(5, Math.round(ev.score / 2)),
        confidence: Math.min(5, Math.round(ev.score / 2)),
      };
      setPitchEval(pitchResult);
      setStage('PITCH_FEEDBACK');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPitchQnA = async () => {
    setLoading(true);
    setError('');
    setAudioBlob(null);
    setTranscript('');
    setRecTime(0);
    setUserResponse('');
    try {
      const pitchContext = pitchEval?.transcription || userResponse || introduction;
      const data = await apiGeneratePitchQnA(introduction, pitchContext, pitchQnARound);
      setPitchQnaData(data);
      setResponseMode('text');
      setStage('PITCH_QNA');
      window.scrollTo(0, 0);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPitchQnAText = async () => {
    if (!userResponse.trim() || !pitchQnaData) return;
    setLoading(true);
    setError('');
    try {
      const ev = await apiEvaluateText(introduction, pitchQnaData.question, userResponse);
      const resVal: DemoVoiceEvaluation = {
        ...ev,
        transcription: userResponse,
        clarity: Math.min(5, Math.round(ev.score / 2)),
        confidence: Math.min(5, Math.round(ev.score / 2)),
      };
      setPitchQnaEval(resVal);
      setStage('PITCH_QNA_FEEDBACK');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPitchQnAVoice = async () => {
    if (!audioBlob || !pitchQnaData) return;
    setLoading(true);
    setError('');
    try {
      const ev = await apiEvaluateVoice(introduction, pitchQnaData.question, audioBlob);
      setPitchQnaEval(ev);
      setUserResponse(ev.transcription);
      setStage('PITCH_QNA_FEEDBACK');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPitchQnA = async () => {
    const newResults = [...pitchQnaResults, { round: pitchQnARound, evaluation: pitchQnaEval }];
    setPitchQnaResults(newResults);
    
    if (pitchQnARound >= 2) {
        setStage('NEGOTIATION_INTRO');
        window.scrollTo(0, 0);
        return;
    }
    
    const nextRound = pitchQnARound + 1;
    setPitchQnARound(nextRound);
    setLoading(true);
    setError('');
    setAudioBlob(null);
    setTranscript('');
    setRecTime(0);
    setUserResponse('');
    try {
      const pitchContext = pitchEval?.transcription || introduction;
      const data = await apiGeneratePitchQnA(introduction, pitchContext, nextRound);
      setPitchQnaData(data);
      setResponseMode('text');
      setStage('PITCH_QNA');
      window.scrollTo(0, 0);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartNegotiation = async () => {
    setLoading(true);
    setError('');
    setAudioBlob(null);
    setTranscript('');
    setRecTime(0);
    try {
      const pitchContext = userResponse?.trim() || pitchEval?.transcription || introduction;
      const data = await apiGenerateNegotiation(introduction, pitchContext, negotiationRound, '');
      setNegData(data);
      setResponseMode('text');
      setUserResponse('');
      setStage('NEGOTIATION');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitNegotiation = async () => {
    if (!userResponse.trim() || !negData) return;
    setLoading(true);
    setError('');
    try {
      const ev = await apiEvaluateText(introduction, negData.question, userResponse);
      setNegEval(ev);
      setStage('NEGOTIATION_FEEDBACK');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNextNegotiation = async () => {
    const newResults = [...negResults, { round: negotiationRound, evaluation: negEval }];
    setNegResults(newResults);

    if (negotiationRound >= 2) {
      handleGenerateReport();
      return;
    }

    const nextRound = negotiationRound + 1;
    setNegotiationRound(nextRound);
    setLoading(true);
    setError('');
    const prevContext = `Offer: ${negData?.question}\nCounter: ${userResponse}`;
    
    try {
      const pitchContext = pitchEval?.transcription || introduction;
      const data = await apiGenerateNegotiation(introduction, pitchContext, nextRound, prevContext);
      setNegData(data);
      setResponseMode('text');
      setUserResponse('');
      setStage('NEGOTIATION');
      window.scrollTo(0, 0);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setStage('LOADING_REPORT');
    setLoading(true);
    window.scrollTo(0, 0);

    const summaryBuilder = [];
    results.forEach(r => summaryBuilder.push(`Round ${r.round} Scenario: ${r.scenario.context}. User choice: ${r.selectedOption.text}. Eval Score: ${r.evaluation.score}.`));
    if (pitchEval) summaryBuilder.push(`Pitch Eval Score: ${pitchEval.score}. Clarity: ${pitchEval.clarity}. Confidence: ${pitchEval.confidence}.`);
    pitchQnaResults.forEach(r => summaryBuilder.push(`Pitch QnA Round ${r.round} Score: ${r.evaluation.score}.`));
    negResults.forEach(r => summaryBuilder.push(`Negotiation Round ${r.round} Score: ${r.evaluation.score}.`));
    
    const summary = summaryBuilder.join('\n');
    try {
      const report = await apiGenerateCompetencyReport(summary);
      setReportData(report);
      setStage('REPORT');
    } catch (e: any) {
      setError(e.message);
      // fallback to report stage even if fails
      setStage('REPORT');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  const avgScore = results.length > 0 ? (results.reduce((a, r) => a + r.evaluation.score, 0) / results.length) : 0;
  const finalTotalScore = (results.reduce((a, r) => a + r.evaluation.score, 0) + (pitchEval?.score || 0) + (negEval?.score || 0)) / (results.length + (pitchEval ? 1 : 0) + (negEval ? 1 : 0));

  return (
    <main className="min-h-screen text-white font-sans" style={{ fontFamily: 'var(--font-inter)' }}>
      {/* HEADER */}
      <header className="sticky top-0 z-50 flex justify-between items-center px-4 sm:px-6 py-3 border-b border-white/5" style={{ background: 'rgba(10,10,18,0.85)', backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-lg" style={{ background: 'linear-gradient(135deg, #7c3aed, #f59e0b)' }}>KK</div>
          <span className="font-bold text-sm tracking-tight hidden sm:block">War Room <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase" style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af' }}>DEMO</span></span>
        </div>
        {stage !== 'WELCOME' && stage !== 'REPORT' && (
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500">
              {stage === 'INTRODUCTION' ? 'YOUR IDEA' :
               stage === 'LOADING_SCENARIO' || stage === 'LOADING_FOLLOWUP' || stage === 'EVALUATING' ? 'AI THINKING...' :
               stage === 'SCENARIO' ? `ROUND ${currentRound} — CHOOSE` :
               stage === 'FOLLOWUP_SCENARIO' ? `ROUND ${currentRound} — FOLLOW-UP` :
               stage === 'PITCH_INTRO' || stage === 'PITCHING' || stage === 'PITCH_FEEDBACK' ? 'PITCH PHASE' :
               stage === 'NEGOTIATION_INTRO' || stage === 'NEGOTIATION' || stage === 'NEGOTIATION_FEEDBACK' ? 'NEGOTIATION PHASE' :
               stage === 'FEEDBACK' ? 'AI FEEDBACK' : ''}
            </span>
          </div>
        )}
        {stage !== 'WELCOME' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:block">
              {stage === 'PITCH_INTRO' || stage === 'PITCHING' || stage === 'PITCH_FEEDBACK' ? '4/5' :
               stage === 'NEGOTIATION_INTRO' || stage === 'NEGOTIATION' || stage === 'NEGOTIATION_FEEDBACK' ? '5/5' :
               stage === 'REPORT' ? '5/5' : `${currentRound}/5`}
            </span>
          </div>
        )}
      </header>

      {/* PROGRESS BAR */}
      {stage !== 'WELCOME' && <StageProgressBar 
        round={stage === 'REPORT' ? 5 : 
               (stage === 'NEGOTIATION_INTRO' || stage === 'NEGOTIATION' || stage === 'NEGOTIATION_FEEDBACK') ? 4 :
               (stage === 'PITCH_INTRO' || stage === 'PITCHING' || stage === 'PITCH_FEEDBACK') ? 3 :
               currentRound - 1} 
        total={5} 
      />}

      {/* MAIN CONTENT */}
      <div className="flex-1 min-h-[calc(100vh-53px)] px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">

          {/* ===================== WELCOME ===================== */}
          {stage === 'WELCOME' && (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-3xl mx-auto animate-fade-in-up">
              <div className="text-6xl mb-6 animate-float">⚔️</div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-6" style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.2)' }}>
                <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" /> AI-Powered Demo
              </div>
              <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-4">
                KK&apos;s <span className="bg-clip-text text-transparent animate-gradient" style={{ backgroundImage: 'linear-gradient(135deg, #7c3aed, #f59e0b, #ef4444, #7c3aed)' }}>War Room</span>
              </h1>
              <p className="text-xl text-gray-400 mb-4 leading-relaxed max-w-xl">
                Describe your idea. Face AI-generated scenarios. Prove your founder instincts.
              </p>
              <p className="text-sm text-gray-500 mb-10 max-w-lg">
                In 3 rounds, our AI generates realistic challenges based on YOUR idea. Choose your strategy, face the follow-up consequences, and respond via text or voice.
              </p>
              <div className="flex flex-wrap gap-3 justify-center mb-10">
                {['💡 Introduce', '🎯 Scenarios', '🔀 Follow-ups', '🎤 Voice/Text', '🤖 AI Feedback', '📊 Report'].map((s, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-medium glass-card-light">{s}</span>
                ))}
              </div>
              <button onClick={() => setStage('INTRODUCTION')}
                className="px-10 py-4 rounded-2xl text-lg font-bold text-white shadow-2xl transition-all hover:scale-105 active:scale-95 animate-glow"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #f59e0b)' }}>
                Start the Demo
              </button>
            </div>
          )}

          {/* ===================== INTRODUCTION ===================== */}
          {stage === 'INTRODUCTION' && (
            <div className="max-w-2xl mx-auto animate-fade-in-up">
              <PhaseHeader icon="💡" tag="INTRODUCTION" title="What are you building?"
                subtitle="Describe your business idea, target customer, and the problem you're solving. The more detail you give, the more personalized your scenario questions will be." />

              <div className="glass-card p-6 mb-6">
                <textarea
                  id="intro-textarea"
                  value={introduction}
                  onChange={e => setIntroduction(e.target.value)}
                  placeholder="Example: I'm building an AI-powered tutoring platform for college students struggling with STEM subjects. The platform uses adaptive learning to identify knowledge gaps and provides personalized study plans. My target customers are university students aged 18-24 who spend $500+/year on tutoring..."
                  className="demo-textarea"
                  rows={6}
                />
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-gray-500">{introduction.length} characters</span>
                  <span className={`text-xs ${introduction.length >= 20 ? 'text-emerald-400' : 'text-gray-600'}`}>
                    {introduction.length >= 20 ? '✓ Ready to go' : 'Minimum 20 characters'}
                  </span>
                </div>
              </div>

              {error && <div className="text-sm text-red-400 mb-4 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}

              <NextButton
                onClick={handleSubmitIntroduction}
                disabled={introduction.trim().length < 20}
                label="Generate My Scenarios →"
                loading={loading}
              />
            </div>
          )}

          {/* ===================== LOADING SCENARIO ===================== */}
          {stage === 'LOADING_SCENARIO' && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-fade-in-up">
              <div className="relative mb-8">
                <div className="w-20 h-20 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-2xl">🤖</div>
              </div>
              <h3 className="text-xl font-bold mb-2">Generating Scenario {currentRound}...</h3>
              <p className="text-gray-400 text-sm max-w-md">Our AI is analyzing your business idea and crafting a realistic challenge for you to tackle.</p>
            </div>
          )}

          {/* ===================== SCENARIO — OPTION SELECTION ===================== */}
          {stage === 'SCENARIO' && scenario && (
            <div className="max-w-2xl mx-auto animate-fade-in-up">
              <PhaseHeader icon="🎯" tag={`ROUND ${currentRound} OF ${TOTAL_ROUNDS}`} title="Scenario Challenge"
                subtitle={scenario.context} />

              {/* Scenario Question */}
              <div className="glass-card p-6 sm:p-8 mb-6" style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-2xl mt-0.5">⚠️</span>
                  <p className="text-gray-200 leading-relaxed">{scenario.question}</p>
                </div>
              </div>

              {/* Option Selection */}
              <div className="mb-4">
                <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-4">Choose your strategy:</p>
                <div className="option-grid">
                  {scenario.options.map((opt, i) => (
                    <button
                      key={opt.id}
                      id={`option-${opt.id}`}
                      className="option-card"
                      onClick={() => handleSelectOption(opt)}
                      disabled={loading}
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <div className="option-label">{opt.id}</div>
                      <p className="option-text">{opt.text}</p>
                      <div className="option-arrow">→</div>
                    </button>
                  ))}
                </div>
              </div>

              {error && <div className="text-sm text-red-400 mb-4 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}
            </div>
          )}

          {/* ===================== LOADING FOLLOW-UP ===================== */}
          {stage === 'LOADING_FOLLOWUP' && selectedOption && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-fade-in-up">
              <div className="relative mb-8">
                <div className="w-20 h-20 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-2xl">🔀</div>
              </div>
              <h3 className="text-xl font-bold mb-2">Generating Follow-up...</h3>
              <div className="glass-card p-4 mb-4 max-w-md" style={{ borderColor: 'rgba(124,58,237,0.2)' }}>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Your choice:</p>
                <p className="text-sm text-gray-300">&quot;{selectedOption.text}&quot;</p>
              </div>
              <p className="text-gray-400 text-sm max-w-md">Our AI is exploring the consequences of your decision and crafting a deeper challenge...</p>
            </div>
          )}

          {/* ===================== FOLLOW-UP SCENARIO ===================== */}
          {stage === 'FOLLOWUP_SCENARIO' && followupScenario && selectedOption && scenario && (
            <div className="max-w-2xl mx-auto animate-fade-in-up">
              <PhaseHeader icon="🔀" tag={`ROUND ${currentRound} — FOLLOW-UP`} title="Consequence Challenge"
                subtitle={followupScenario.context} />

              {/* Breadcrumb: What they chose */}
              <div className="followup-breadcrumb mb-6">
                <div className="breadcrumb-connector" />
                <div className="breadcrumb-origin">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Original scenario</span>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{scenario.question}</p>
                </div>
                <div className="breadcrumb-choice">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Your choice</span>
                  <p className="text-sm text-violet-300 mt-1">&quot;{selectedOption.text}&quot;</p>
                  <p className="text-xs text-amber-400/70 mt-1 italic">{selectedOption.feedback}</p>
                </div>
              </div>

              {/* Follow-up Question */}
              <div className="glass-card p-6 sm:p-8 mb-6" style={{ borderColor: 'rgba(6,182,212,0.3)' }}>
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-2xl mt-0.5">🔀</span>
                  <p className="text-gray-200 leading-relaxed">{followupScenario.question}</p>
                </div>
              </div>

              {/* Response Mode Toggle */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => { setResponseMode('text'); setAudioBlob(null); setTranscript(''); }}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: responseMode === 'text' ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${responseMode === 'text' ? '#7c3aed' : 'rgba(255,255,255,0.06)'}`,
                    color: responseMode === 'text' ? '#a78bfa' : '#9ca3af',
                  }}>
                  ✏️ Type Response
                </button>
                <button
                  onClick={() => { setResponseMode('voice'); setUserResponse(''); }}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: responseMode === 'voice' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${responseMode === 'voice' ? '#ef4444' : 'rgba(255,255,255,0.06)'}`,
                    color: responseMode === 'voice' ? '#fca5a5' : '#9ca3af',
                  }}>
                  🎤 Voice Response
                </button>
              </div>

              {/* Text Response */}
              {responseMode === 'text' && (
                <div className="glass-card p-6 mb-4">
                  <textarea
                    id="response-textarea"
                    value={userResponse}
                    onChange={e => setUserResponse(e.target.value)}
                    placeholder="Explain how you would handle this follow-up situation. Consider the trade-offs, short-term vs long-term impact, and what signals this sends to your team, customers, and investors..."
                    className="demo-textarea"
                    rows={5}
                  />
                </div>
              )}

              {/* Voice Response */}
              {responseMode === 'voice' && (
                <div className="glass-card p-6 mb-4">
                  <div className="flex flex-col items-center">
                    {/* Mic Button */}
                    <div className="relative mb-4">
                      {recording && <div className="absolute -inset-6 rounded-full animate-pulse opacity-30" style={{ background: 'radial-gradient(circle, #ef4444, transparent)' }} />}
                      <button
                        onClick={recording ? stopRecording : startRecording}
                        className="relative w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold shadow-2xl transition-all hover:scale-105"
                        style={{ background: recording ? '#ef4444' : audioBlob ? '#10b981' : 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}>
                        {recording ? '⏹' : audioBlob ? '🔄' : '🎤'}
                      </button>
                    </div>

                    {/* Waveform */}
                    {recording && (
                      <div className="flex justify-center gap-1 mb-3">
                        {[...Array(7)].map((_, i) => <div key={i} className="waveform-bar" style={{ height: `${12 + Math.random() * 16}px` }} />)}
                      </div>
                    )}

                    {/* Status */}
                    <div className="text-center mb-4">
                      {recording ? (
                        <span className="text-sm text-red-400 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          Recording... {formatTime(recTime)}
                        </span>
                      ) : audioBlob ? (
                        <span className="text-sm text-emerald-400">✅ Recorded ({recTime}s) — tap 🔄 to re-record</span>
                      ) : (
                        <span className="text-sm text-gray-500">Tap the microphone to record your response</span>
                      )}
                    </div>

                    {/* Voice Duration Warning */}
                    <div className="w-full p-3 rounded-lg mb-4" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
                      <p className="text-xs text-amber-300 font-semibold flex items-start gap-2">
                        <span>⏱️</span>
                        <span><strong>Important:</strong> Please speak for at least 15 seconds for AI to properly detect and analyze your voice.</span>
                      </p>
                    </div>

                    {/* Transcript */}
                    <div className="w-full p-4 rounded-xl min-h-[80px]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-widest">Live Transcript</p>
                      <p className="text-sm text-gray-300">{transcript || (recording ? 'Listening...' : 'Your speech will appear here.')}</p>
                    </div>
                  </div>
                </div>
              )}

              {error && <div className="text-sm text-red-400 mb-4 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}

              <NextButton
                onClick={responseMode === 'text' ? handleSubmitTextResponse : handleSubmitVoiceResponse}
                disabled={responseMode === 'text' ? !userResponse.trim() : !audioBlob}
                label="Submit Response →"
                loading={loading}
              />
            </div>
          )}

          {/* ===================== EVALUATING ===================== */}
          {stage === 'EVALUATING' && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-fade-in-up">
              <div className="relative mb-8">
                <div className="w-20 h-20 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-2xl">🧠</div>
              </div>
              <h3 className="text-xl font-bold mb-2">Evaluating Your Response...</h3>
              <p className="text-gray-400 text-sm max-w-md">Our AI mentor is analyzing your strategic thinking, business acumen, and decision-making ability.</p>
            </div>
          )}

          {/* ===================== FEEDBACK ===================== */}
          {stage === 'FEEDBACK' && currentEval && scenario && selectedOption && followupScenario && (
            <div className="max-w-2xl mx-auto animate-fade-in-up">
              <PhaseHeader icon="📊" tag={`ROUND ${currentRound} FEEDBACK`} title="AI Evaluation"
                subtitle={scenario.context} />

              {/* Decision Path Summary */}
              <div className="glass-card p-5 mb-6" style={{ borderColor: 'rgba(124,58,237,0.2)' }}>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">🗺️ Your Decision Path</h4>
                <div className="flex items-start gap-3 mb-2">
                  <div className="decision-path-dot" style={{ background: '#7c3aed' }} />
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-500">Option Chosen</p>
                    <p className="text-sm text-gray-300">{selectedOption.text}</p>
                  </div>
                </div>
                <div className="decision-path-line" />
                <div className="flex items-start gap-3">
                  <div className="decision-path-dot" style={{ background: '#06b6d4' }} />
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-500">Follow-up Challenge</p>
                    <p className="text-xs text-gray-400">{followupScenario.question}</p>
                  </div>
                </div>
              </div>

              {/* Score */}
              <div className="glass-card p-6 mb-6 text-center" style={{ borderColor: currentEval.score >= 7 ? 'rgba(16,185,129,0.3)' : currentEval.score >= 4 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)' }}>
                <div className="text-5xl font-black mb-2" style={{
                  color: currentEval.score >= 7 ? '#10b981' : currentEval.score >= 4 ? '#f59e0b' : '#ef4444'
                }}>
                  {currentEval.score}<span className="text-lg text-gray-500">/10</span>
                </div>
                <p className="text-sm text-gray-400">
                  {currentEval.score >= 8 ? 'Excellent strategic thinking!' : currentEval.score >= 6 ? 'Good response with room for growth.' : currentEval.score >= 4 ? 'Decent, but consider more angles.' : 'Needs significant improvement.'}
                </p>
              </div>

              {/* Voice-specific scores */}
              {'clarity' in currentEval && (
                <div className="glass-card p-5 mb-6 space-y-3">
                  <h4 className="text-sm font-bold text-gray-300 mb-3">🎤 Voice Delivery</h4>
                  <ScoreBar label="Clarity" value={(currentEval as DemoVoiceEvaluation).clarity} max={5} color="#3b82f6" />
                  <ScoreBar label="Confidence" value={(currentEval as DemoVoiceEvaluation).confidence} max={5} color="#a855f7" />
                  {'transcription' in currentEval && (currentEval as DemoVoiceEvaluation).transcription && (
                    <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <p className="text-xs text-gray-500 mb-1 font-bold uppercase">What you said:</p>
                      <p className="text-sm text-gray-300 italic">&quot;{(currentEval as DemoVoiceEvaluation).transcription}&quot;</p>
                    </div>
                  )}
                </div>
              )}

              {/* Feedback */}
              <div className="glass-card p-6 mb-6">
                <h4 className="text-sm font-bold text-gray-300 mb-3">💬 AI Mentor Feedback</h4>
                <p className="text-gray-300 leading-relaxed text-sm">{currentEval.feedback}</p>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {currentEval.strengths && currentEval.strengths.length > 0 && (
                  <div className="glass-card p-5" style={{ borderColor: 'rgba(16,185,129,0.2)' }}>
                    <h4 className="text-sm font-bold text-emerald-400 mb-3">✅ Strengths</h4>
                    <ul className="space-y-2">
                      {currentEval.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                          <span className="text-emerald-400 mt-0.5">•</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {currentEval.weaknesses && currentEval.weaknesses.length > 0 && (
                  <div className="glass-card p-5" style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
                    <h4 className="text-sm font-bold text-amber-400 mb-3">⚠️ Areas to Improve</h4>
                    <ul className="space-y-2">
                      {currentEval.weaknesses.map((w, i) => (
                        <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                          <span className="text-amber-400 mt-0.5">•</span>{w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <NextButton
                onClick={handleNextRound}
                label={currentRound >= TOTAL_ROUNDS ? '🎤 Prepare Your Pitch →' : `Continue to Round ${currentRound + 1} →`}
              />
            </div>
          )}

          {/* ===================== PITCH INTRO ===================== */}
          {stage === 'PITCH_INTRO' && (
            <div className="max-w-2xl mx-auto animate-fade-in-up">
              <PhaseHeader icon="🎤" tag="PHASE 4 OF 5" title="Elevator Pitch" 
                subtitle="Now that you've handled several challenges, it's time to pitch your business to a potential investor." />
              
              <div className="glass-card p-6 mb-8 text-gray-300 leading-relaxed">
                <p className="mb-4">Investors want to see clarity, confidence, and a strong value proposition. Based on your business idea and the decisions you&apos;ve made so far, our AI will challenge you with a specific pitching environment.</p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Focus on the problem you solve</li>
                  <li>• Mention your unique advantage</li>
                  <li>• You can type or record your pitch</li>
                </ul>
              </div>

              {error && <div className="text-sm text-red-400 mb-4 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}

              <NextButton onClick={handleStartPitch} label="Generate Pitch Scenario →" loading={loading} />
            </div>
          )}

          {/* ===================== PITCHING ===================== */}
          {stage === 'PITCHING' && pitchData && (
            <div className="max-w-2xl mx-auto animate-fade-in-up">
              <PhaseHeader icon="🎤" tag="PHASE 4" title="Investor Pitch" subtitle={pitchData.context} />

              <div className="glass-card p-6 sm:p-8 mb-6" style={{ borderColor: 'rgba(59,130,246,0.3)' }}>
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-2xl mt-0.5">💬</span>
                  <p className="text-gray-200 leading-relaxed font-medium text-lg">{pitchData.question}</p>
                </div>
              </div>

              {/* Response Mode Toggle */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => { setResponseMode('text'); setAudioBlob(null); setTranscript(''); }}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: responseMode === 'text' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${responseMode === 'text' ? '#3b82f6' : 'rgba(255,255,255,0.06)'}`,
                    color: responseMode === 'text' ? '#93c5fd' : '#9ca3af',
                  }}>
                  ✏️ Type Your Pitch
                </button>
                <button
                  onClick={() => { setResponseMode('voice'); setUserResponse(''); }}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: responseMode === 'voice' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${responseMode === 'voice' ? '#ef4444' : 'rgba(255,255,255,0.06)'}`,
                    color: responseMode === 'voice' ? '#fca5a5' : '#9ca3af',
                  }}>
                  🎤 Record Your Pitch
                </button>
              </div>

              {/* Text Pitch */}
              {responseMode === 'text' && (
                <div className="glass-card p-6 mb-6">
                  <textarea
                    id="pitch-textarea"
                    value={userResponse}
                    onChange={e => setUserResponse(e.target.value)}
                    placeholder="Write your elevator pitch here... \n\nExample: 'Hello, I'm the founder of [BUSINESS]. Today, [TARGET CUSTOMER] struggles with [PROBLEM]. I created [PRODUCT] which [VALUE PROP]. Unlike competitors, we [DIFFERENTIATION]. We've validated this by [VALIDATION] and are raising $[AMOUNT] to scale.'"
                    className="demo-textarea"
                    rows={6}
                  />
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500">{userResponse.length} characters</span>
                    <span className={`text-xs ${userResponse.length >= 50 ? 'text-emerald-400' : 'text-gray-600'}`}>
                      {userResponse.length >= 50 ? '✓ Good pitch length' : 'Write at least 50 characters'}
                    </span>
                  </div>
                </div>
              )}

              {/* Voice Pitch */}
              {responseMode === 'voice' && (
                <div className="glass-card p-6 mb-6">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      {recording && <div className="absolute -inset-6 rounded-full animate-pulse opacity-30" style={{ background: 'radial-gradient(circle, #ef4444, transparent)' }} />}
                      <button
                        onClick={recording ? stopRecording : startRecording}
                        className="relative w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold shadow-2xl transition-all hover:scale-105"
                        style={{ background: recording ? '#ef4444' : audioBlob ? '#10b981' : 'linear-gradient(135deg, #3b82f6, #7c3aed)' }}>
                        {recording ? '⏹' : audioBlob ? '🔄' : '🎤'}
                      </button>
                    </div>

                    {recording && (
                      <div className="flex justify-center gap-1 mb-3">
                        {[...Array(7)].map((_, i) => <div key={i} className="waveform-bar" style={{ height: `${12 + Math.random() * 16}px` }} />)}
                      </div>
                    )}

                    <div className="text-center mb-4">
                      {recording ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm text-red-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            Recording Pitch... {formatTime(recTime)}
                          </span>
                          {recTime < 15 && (
                            <span className="text-[10px] text-amber-500/80 animate-pulse">
                              Keep speaking! Minimum 15 seconds required for AI analysis.
                            </span>
                          )}
                        </div>
                      ) : audioBlob ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm text-emerald-400">✅ Pitch Recorded — {recTime}s</span>
                          {recTime < 15 && (
                            <span className="text-[10px] text-red-400 font-bold">
                              ⚠️ Pitch too short! Please record at least 15 seconds.
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Tap to record (15s minimum, 60s max)</span>
                      )}
                    </div>

                    <div className="w-full p-4 rounded-xl min-h-[80px]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="text-xs text-gray-400">{transcript || 'Your pitch transcription will appear here...'}</p>
                    </div>
                  </div>
                </div>
              )}

              {error && <div className="text-sm text-red-400 mb-4 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}

              <NextButton 
                onClick={responseMode === 'text' ? handleSubmitPitchText : handleSubmitPitchVoice} 
                disabled={responseMode === 'text' ? userResponse.trim().length < 50 : (!audioBlob || recTime < 15)} 
                label={responseMode === 'text' ? 'Evaluate Pitch →' : (recTime < 15 ? 'Record 15s+ to continue' : 'Evaluate Pitch →')} 
                loading={loading} 
              />
            </div>
          )}

          {/* ===================== PITCH FEEDBACK ===================== */}
          {stage === 'PITCH_FEEDBACK' && pitchEval && (
            <div className="max-w-2xl mx-auto animate-fade-in-up">
              <PhaseHeader icon="📊" tag="PITCH FEEDBACK" title="Pitch Evaluation" />

              <div className="glass-card p-8 mb-6 text-center" style={{ borderColor: 'rgba(59,130,246,0.3)' }}>
                <div className="text-5xl font-black mb-2 text-blue-400">{pitchEval.score}<span className="text-lg text-gray-500">/10</span></div>
                <p className="text-sm text-gray-400">Investor Impression</p>
              </div>

              <div className="glass-card p-5 mb-6 space-y-3">
                <ScoreBar label="Clarity" value={pitchEval.clarity} max={5} color="#3b82f6" />
                <ScoreBar label="Confidence" value={pitchEval.confidence} max={5} color="#a855f7" />
              </div>

              <div className="glass-card p-6 mb-6">
                <h4 className="text-sm font-bold text-gray-300 mb-3">💬 Feedback</h4>
                <p className="text-gray-300 text-sm leading-relaxed">{pitchEval.feedback}</p>
              </div>

              <NextButton onClick={handleStartPitchQnA} label="Investor Q&A →" />
            </div>
          )}

          {/* ===================== PITCH QnA ===================== */}
          {stage === 'PITCH_QNA' && pitchQnaData && (
            <div className="max-w-2xl mx-auto animate-fade-in-up">
              <PhaseHeader icon="🤔" tag={`PITCH Q&A — QUESTION ${pitchQnARound}/2`} title="Investor Follow-up" subtitle={pitchQnaData.context} />

              <div className="glass-card p-6 sm:p-8 mb-6" style={{ borderColor: 'rgba(59,130,246,0.3)' }}>
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-2xl mt-0.5">💬</span>
                  <p className="text-gray-200 leading-relaxed font-medium text-lg">{pitchQnaData.question}</p>
                </div>
              </div>

              {/* Response Mode Toggle */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => { setResponseMode('text'); setAudioBlob(null); setTranscript(''); }}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: responseMode === 'text' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${responseMode === 'text' ? '#3b82f6' : 'rgba(255,255,255,0.06)'}`,
                    color: responseMode === 'text' ? '#93c5fd' : '#9ca3af',
                  }}>
                  ✏️ Type Response
                </button>
                <button
                  onClick={() => { setResponseMode('voice'); setUserResponse(''); }}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: responseMode === 'voice' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${responseMode === 'voice' ? '#ef4444' : 'rgba(255,255,255,0.06)'}`,
                    color: responseMode === 'voice' ? '#fca5a5' : '#9ca3af',
                  }}>
                  🎤 Record Response
                </button>
              </div>

              {responseMode === 'text' && (
                <div className="glass-card p-6 mb-6">
                  <textarea
                    value={userResponse}
                    onChange={e => setUserResponse(e.target.value)}
                    placeholder="Answer the investor's question here..."
                    className="demo-textarea"
                    rows={4}
                  />
                </div>
              )}

              {responseMode === 'voice' && (
                <div className="glass-card p-6 mb-6">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      {recording && <div className="absolute -inset-6 rounded-full animate-pulse opacity-30" style={{ background: 'radial-gradient(circle, #ef4444, transparent)' }} />}
                      <button
                        onClick={recording ? stopRecording : startRecording}
                        className="relative w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold shadow-2xl transition-all hover:scale-105"
                        style={{ background: recording ? '#ef4444' : audioBlob ? '#10b981' : 'linear-gradient(135deg, #3b82f6, #7c3aed)' }}>
                        {recording ? '⏹' : audioBlob ? '🔄' : '🎤'}
                      </button>
                    </div>

                    <div className="text-center mb-4">
                      {recording ? (
                        <span className="text-sm text-red-400">Recording... {formatTime(recTime)}</span>
                      ) : audioBlob ? (
                        <span className="text-sm text-emerald-400">✅ Recorded — {recTime}s</span>
                      ) : (
                        <span className="text-sm text-gray-500">Tap to record your answer</span>
                      )}
                    </div>

                    {/* Voice Duration Warning */}
                    <div className="w-full p-3 rounded-lg mt-4" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
                      <p className="text-xs text-amber-300 font-semibold flex items-start gap-2">
                        <span>⏱️</span>
                        <span><strong>Important:</strong> Please speak for at least 15 seconds for AI to properly detect and analyze your voice.</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && <div className="text-sm text-red-400 mb-4 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}

              <NextButton 
                onClick={responseMode === 'text' ? handleSubmitPitchQnAText : handleSubmitPitchQnAVoice} 
                disabled={responseMode === 'text' ? !userResponse.trim() : !audioBlob} 
                label="Submit Answer →" 
                loading={loading} 
              />
            </div>
          )}

          {/* ===================== PITCH QnA FEEDBACK ===================== */}
          {stage === 'PITCH_QNA_FEEDBACK' && pitchQnaEval && (
            <div className="max-w-2xl mx-auto animate-fade-in-up">
              <PhaseHeader icon="📊" tag={`Q&A ROUND ${pitchQnARound} RESULT`} title="Investor Reaction" />

              <div className="glass-card p-8 mb-6 text-center" style={{ borderColor: 'rgba(59,130,246,0.3)' }}>
                <div className="text-5xl font-black mb-2 text-blue-400">{pitchQnaEval.score}<span className="text-lg text-gray-500">/10</span></div>
                <p className="text-sm text-gray-400">Response Quality</p>
              </div>

              <div className="glass-card p-6 mb-6">
                <h4 className="text-sm font-bold text-gray-300 mb-3">💬 Investor Thoughts</h4>
                <p className="text-gray-300 text-sm leading-relaxed">{pitchQnaEval.feedback}</p>
              </div>

              <NextButton onClick={handleNextPitchQnA} label={pitchQnARound >= 2 ? "Final Phase: Negotiation →" : "Next Question →"} />
            </div>
          )}

          {/* ===================== NEGOTIATION INTRO ===================== */}
          {stage === 'NEGOTIATION_INTRO' && (
            <div className="max-w-2xl mx-auto animate-fade-in-up">
              <PhaseHeader icon="🤝" tag="PHASE 5 OF 5" title="Deal Negotiation" 
                subtitle="The investor is interested, but the terms aren't perfect. You need to negotiate the final deal." />

              <div className="glass-card p-6 mb-8 text-gray-300 leading-relaxed">
                <p className="mb-4">This is the final test of the demo. You&apos;ll be presented with a deal offer (valuation, equity, and conditions). You must respond with your counter-offer or reasoning to close the deal.</p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Protect your equity but secure the capital</li>
                  <li>• Justify your valuation based on your vision</li>
                  <li>• Show you can be a pragmatist when needed</li>
                </ul>
              </div>

              {error && <div className="text-sm text-red-400 mb-4 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}

              <NextButton onClick={handleStartNegotiation} label="Start Negotiation →" loading={loading} />
            </div>
          )}

          {/* ===================== NEGOTIATION ===================== */}
          {stage === 'NEGOTIATION' && negData && (
            <div className="max-w-2xl mx-auto animate-fade-in-up">
              <PhaseHeader icon="🤝" tag={`NEGOTIATION ROUND ${negotiationRound}/2`} title="The Deal" subtitle={negData.context} />

              <div className="glass-card p-6 sm:p-8 mb-6" style={{ borderColor: 'rgba(236,72,153,0.3)' }}>
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-2xl mt-0.5">💰</span>
                  <p className="text-gray-200 leading-relaxed font-semibold italic">{negData.question}</p>
                </div>
              </div>

              <div className="glass-card p-6 mb-6">
                <textarea
                  value={userResponse}
                  onChange={e => setUserResponse(e.target.value)}
                  placeholder="Draft your negotiation response... (e.g., 'I appreciate the offer, but I'd like to propose a $5M valuation due to our recent growth...')"
                  className="demo-textarea"
                  rows={5}
                />
              </div>

              {error && <div className="text-sm text-red-400 mb-4 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}

              <NextButton onClick={handleSubmitNegotiation} disabled={!userResponse.trim()} label="Submit Final Deal →" loading={loading} />
            </div>
          )}

          {/* ===================== NEGOTIATION FEEDBACK ===================== */}
          {stage === 'NEGOTIATION_FEEDBACK' && negEval && (
            <div className="max-w-2xl mx-auto animate-fade-in-up">
              <PhaseHeader icon="🤝" tag="NEGOTIATION RESULT" title="The Deal Outcome" />

              <div className="glass-card p-8 mb-6 text-center" style={{ borderColor: 'rgba(236,72,153,0.3)' }}>
                <div className="text-5xl font-black mb-2 text-pink-400">{negEval.score}<span className="text-lg text-gray-500">/10</span></div>
                <p className="text-sm text-gray-400">Negotiation Effectiveness</p>
              </div>

              <div className="glass-card p-6 mb-6">
                <h4 className="text-sm font-bold text-gray-300 mb-3">💬 Investor Reaction</h4>
                <p className="text-gray-300 text-sm leading-relaxed">{negEval.feedback}</p>
              </div>

              <NextButton onClick={handleNextNegotiation} label={negotiationRound >= 2 ? "🏁 Generatng Report..." : "Next Round of Negotiation →"} loading={loading} />
            </div>
          )}

          {/* ===================== LOADING REPORT ===================== */}
          {stage === 'LOADING_REPORT' && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-fade-in-up">
              <div className="relative mb-8">
                <div className="w-20 h-20 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-2xl">📊</div>
              </div>
              <h3 className="text-xl font-bold mb-2">Analyzing Your Performance...</h3>
              <p className="text-gray-400 text-sm max-w-md">Aggregating scenarios, pitch decisions, and negotiation leverage into a final competency breakdown.</p>
            </div>
          )}

          {/* ===================== REPORT ===================== */}
          {stage === 'REPORT' && (
            <div className="max-w-3xl mx-auto animate-fade-in-up pb-20">
              <div className="text-center mb-12">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-4xl font-black mb-2">Demo Complete!</h2>
                <p className="text-gray-400">Here&apos;s how you performed across the full War Room Demo.</p>
              </div>

              {/* Overall Score */}
              <div className="glass-card p-8 mb-8 text-center" style={{ borderColor: 'rgba(124,58,237,0.3)' }}>
                <div className="text-sm text-gray-500 mb-2 font-bold uppercase tracking-widest">Aggregate Founder Score</div>
                <div className="text-7xl font-black mb-2" style={{
                  background: 'linear-gradient(135deg, #7c3aed, #f59e0b)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  {finalTotalScore.toFixed(1)}<span className="text-2xl" style={{ WebkitTextFillColor: '#6b7280' }}>/10</span>
                </div>
                <p className="text-sm text-gray-400">
                  {finalTotalScore >= 8 ? 'Outstanding! You think like a seasoned founder.' : finalTotalScore >= 6 ? 'Strong performance. Your instincts are solid.' : finalTotalScore >= 4 ? 'Good effort. The War Room will sharpen these skills.' : 'Lots of growth room — the full simulation will push you further.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {/* Scenario Rounds */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Tactical Decisions</h3>
                  {results.slice(0, 2).map((r, i) => (
                    <div key={i} className="glass-card p-5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase">Round {r.round}</span>
                        <span className="text-sm font-bold font-mono" style={{ color: r.evaluation.score >= 7 ? '#10b981' : '#f59e0b' }}>{r.evaluation.score}/10</span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{r.scenario.context}</p>
                    </div>
                  ))}
                  
                  {reportData?.competencies && (
                    <div className="glass-card p-5 mt-4" style={{ borderColor: 'rgba(124,58,237,0.2)' }}>
                      <h4 className="text-sm font-bold text-violet-400 mb-4">Competency Breakdown</h4>
                      <div className="space-y-3">
                        {reportData.competencies.map((comp: any, i: number) => (
                          <ScoreBar key={i} label={comp.trait} value={comp.score} max={10} color="#a855f7" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Strategic Skills */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Strategic Skills</h3>
                  {pitchEval && (
                    <div className="glass-card p-5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-blue-400 uppercase">Elevator Pitch</span>
                        <span className="text-sm font-bold font-mono text-blue-400">{pitchEval.score}/10</span>
                      </div>
                      <p className="text-xs text-gray-500">Communication & Delivery</p>
                    </div>
                  )}
                  {negEval && (
                    <div className="glass-card p-5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-pink-400 uppercase">Negotiation</span>
                        <span className="text-sm font-bold font-mono text-pink-400">{negEval.score}/10</span>
                      </div>
                      <p className="text-xs text-gray-500">Deal-making & Pragmatism</p>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA */}
              <div className="glass-card p-8 text-center" style={{ borderColor: 'rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.05)' }}>
                <h3 className="text-xl font-bold mb-3">Ready for the full experience?</h3>
                <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
                  The complete War Room simulation includes investor panels, team management, financial crises, and deep AI-powered analytics — all personalized to your startup.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={handleRestart}
                    className="px-8 py-3 rounded-xl border-2 border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition font-semibold">
                    🔄 Try Again
                  </button>
                  <button className="px-8 py-3 rounded-xl font-bold text-white transition hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #f59e0b)' }}>
                    🚀 Start Full Simulation
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}

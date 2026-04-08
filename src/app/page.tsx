"use client";

import React, { useState, useEffect } from "react";

const CUSTOMER_SCENARIO = {
  intro: "A major enterprise client (15% of MRR) is threatening to churn because of performance issues causing a 2-hour downtime yesterday. The CEO is on the phone right now demanding answers.",
  choices: [
    { text: "Offer a 20% discount and apologize profusely.", outcome: "They take the discount but remain skeptical. Your MRR takes a hit, and they start exploring competitors anyway." },
    { text: "Commit to a 2-week dedicated engineering sprint to fix their specific issues.", outcome: "They agree to stay and monitor your progress. Your team velocity for new features drops to zero for two weeks." },
    { text: "Tell them we are upgrading infrastructure and suggest they downgrade to a cheaper, more stable tier.", outcome: "They form a bad opinion, feel insulted, and churn immediately. You lose a major logo." },
  ]
};

const INVESTOR_NEGOTIATION = {
  intro: "Investor (Shark-style avatar): 'I like the team, but your churn rate is concerning after that recent outage. I'll offer $1M for 20% equity.'",
  choices: [
    { text: "Accept the offer immediately.", outcome: "Deal closed at a $5M valuation. You get the cash but gave up a huge chunk of your company early on." },
    { text: "Counter: $1.5M for 15% equity.", outcome: "Investor: 'Ouch, that's steep. I can do $1.5M for 18%.' (Deal closed at $8.3M valuation). Great negotiation!" },
    { text: "Walk away. We don't need predatory terms.", outcome: "You walk away without funding. You retain equity but have to bootstrap through a very tough year." }
  ]
};

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  return (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
            currentStep === step ? "bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]" :
            currentStep > step ? "bg-green-500 text-white" : "bg-slate-200 text-slate-400"
          }`}>
            {currentStep > step ? "?" : step}
          </div>
          {step < 3 && (
            <div className={`w-12 h-1 transition-all duration-500 ${currentStep > step ? "bg-green-500" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default function DemoPage() {
  const [step, setStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isRecording, setIsRecording] = useState(false);
  const [pitchRecorded, setPitchRecorded] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [scenarioResult, setScenarioResult] = useState("");
  const [investorResult, setInvestorResult] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      if (step > 0 && step < 4) {
        setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  useEffect(() => {
    let recTimer: NodeJS.Timeout;
    if (isRecording) {
      recTimer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(recTimer);
  }, [isRecording]);

  const handleStartRecording = () => {
    setRecordingTime(0);
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setPitchRecorded(true);
    }, 5000);
  };

  const currentStepView = () => {
    switch (step) {
      case 0:
        return (
          <div className="flex flex-col items-center justify-center py-24 text-center max-w-3xl mx-auto">
            <div className="mb-6 inline-flex items-center gap-2 bg-amber-500/10 text-amber-700 px-4 py-2 rounded-full text-sm font-medium border border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Interactive Startup Simulation
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl mb-6">
              Pitch to World-Class <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-amber-500">Virtual Investors</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              Face a simulated panel of legendary investors and business leaders. Get grilled on your startup decisions. Build founder resilience.
            </p>
            <button 
              onClick={() => setStep(1)} 
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-amber-600 hover:from-violet-700 hover:to-amber-700 text-white rounded-xl text-lg font-semibold shadow-xl shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
            >
              Enter the War Room
            </button>
          </div>
        );
      case 1:
        return (
          <div className="py-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <StepIndicator currentStep={1} />
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xl font-bold">
                  !
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Crisis Management</h2>
                  <p className="text-slate-500">Respond to an active customer escalation</p>
                </div>
              </div>
              <div className="p-8">
                <p className="text-lg text-slate-800 leading-relaxed mb-8 flex gap-3">
                  <span className="text-2xl">&quot;</span>
                  {CUSTOMER_SCENARIO.intro}
                  <span className="text-2xl">&quot;</span>
                </p>
                {scenarioResult ? (
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl">
                    <h3 className="font-semibold text-slate-900 mb-2">Outcome:</h3>
                    <p className="text-slate-700 mb-6">{scenarioResult}</p>
                    <button 
                      onClick={() => setStep(2)} 
                      className="w-full px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
                    >
                      Proceed to Voice Pitch ?
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Choose your action</p>
                    {CUSTOMER_SCENARIO.choices.map((choice, i) => (
                      <button 
                        key={i} 
                        onClick={() => setScenarioResult(choice.outcome)} 
                        className="w-full text-left p-5 border-2 border-slate-200 rounded-xl hover:border-violet-500 hover:bg-violet-50 text-slate-700 hover:text-violet-900 transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between">
                          <span>{choice.text}</span>
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-violet-500">Select</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="py-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <StepIndicator currentStep={2} />
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center text-xl">
                  ???
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Voice Pitch</h2>
                  <p className="text-slate-500">Pitch your startup to the panel (Simulated)</p>
                </div>
              </div>
              <div className="p-12 flex flex-col items-center text-center">
                <p className="text-lg mb-8 text-slate-600 max-w-md">
                  You have 60 seconds to deliver your elevator pitch. Focus on your traction, team, and the problem you are solving.
                </p>
                
                <div className="relative mb-10">
                  {isRecording && (
                    <div className="absolute -inset-4 bg-red-100 rounded-full animate-ping opacity-50"></div>
                  )}
                  <button 
                    onClick={handleStartRecording}
                    disabled={pitchRecorded || isRecording}
                    className={`relative w-32 h-32 rounded-full flex items-center justify-center shadow-lg transition-all ${
                      isRecording ? "bg-red-500 text-white scale-110" : 
                      pitchRecorded ? "bg-green-500 text-white" : 
                      "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    <span className="font-bold text-lg">
                      {isRecording ? `00:0${recordingTime}` : pitchRecorded ? "Saved" : "Record"}
                    </span>
                  </button>
                </div>

                {pitchRecorded && (
                  <button 
                    onClick={() => setStep(3)} 
                    className="px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors shadow-md shadow-violet-500/20 animate-in fade-in"
                  >
                    Enter Negotiation Room ?
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="py-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
             <StepIndicator currentStep={3} />
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xl">
                  ??
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">The Shark Tank</h2>
                  <p className="text-slate-500">Negotiate terms with the virtual investor</p>
                </div>
              </div>
              <div className="p-8">
                <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 mb-8 relative">
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">MC</div>
                  <p className="text-lg text-slate-800 font-medium italic">
                    {INVESTOR_NEGOTIATION.intro}
                  </p>
                </div>

                {investorResult ? (
                  <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl animate-in fade-in">
                    <h3 className="font-bold text-green-900 mb-2">Final Outcome:</h3>
                    <p className="text-green-800 font-medium mb-6">{investorResult}</p>
                    <button 
                      onClick={() => setStep(4)} 
                      className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                    >
                      View Assessment Report
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                     <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Your Response</p>
                    {INVESTOR_NEGOTIATION.choices.map((choice, i) => (
                      <button 
                        key={i} 
                        onClick={() => setInvestorResult(choice.outcome)} 
                        className="w-full text-left p-5 border-2 border-slate-200 rounded-xl hover:border-amber-500 hover:bg-amber-50 text-slate-700 hover:text-amber-900 transition-all duration-200 font-medium"
                      >
                         {choice.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="py-16 max-w-3xl mx-auto text-center animate-in zoom-in-95 duration-500">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <span className="text-4xl">??</span>
            </div>
            <h2 className="text-4xl font-extrabold mb-4 text-slate-900">Assessment Complete</h2>
            <p className="text-xl text-slate-600 mb-10">Here is your founder profile based on your decisions.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Crisis Resolution</div>
                <div className="font-medium text-slate-800">{scenarioResult}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Communication</div>
                <div className="font-medium text-slate-800">Pitch successfully recorded. Confident delivery detected (Simulated).</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Negotiation</div>
                <div className="font-medium text-slate-800">{investorResult}</div>
              </div>
            </div>
            
            <button 
              onClick={() => {
                setStep(0);
                setScenarioResult("");
                setInvestorResult("");
                setPitchRecorded(false);
                setTimeLeft(15 * 60);
              }} 
              className="mt-12 px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition shadow-lg"
            >
              Restart Simulation
            </button>
          </div>
        );
      default: return null;
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-violet-200">
      <header className="sticky top-0 z-50 flex justify-between items-center p-4 sm:px-8 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-amber-500 flex items-center justify-center text-white font-bold shadow-md">
            KK
          </div>
          <span className="font-bold text-lg tracking-tight">War Room <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded ml-2 border border-slate-300 font-medium">DEMO</span></span>
        </div>
        {step > 0 && step < 4 && (
          <div className="flex items-center gap-3 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <div className="font-mono text-sm font-bold text-slate-700">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
            </div>
          </div>
        )}
      </header>
      
      <div className="min-h-[calc(100vh-73px)] pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {currentStepView()}
        </div>
      </div>
    </main>
  );
}

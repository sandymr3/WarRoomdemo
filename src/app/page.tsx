"use client";

import React, { useState, useEffect } from "react";

const SCENARIOS = [
  {
    title: "Crisis Management",
    tagline: "Respond to an active customer escalation",
    icon: "!",
    color: "red",
    intro: "A major enterprise client (15% of MRR) is threatening to churn because of performance issues causing a 2-hour downtime yesterday. The CEO is on the phone right now demanding answers.",
    choices: [
      { text: "Offer a 20% discount and apologize profusely.", outcome: "They take the discount but remain skeptical. Your MRR takes a hit, and they start exploring competitors anyway." },
      { text: "Commit to a 2-week dedicated engineering sprint to fix their specific issues.", outcome: "They agree to stay and monitor your progress. Your team velocity for new features drops to zero for two weeks." },
      { text: "Tell them we are upgrading infrastructure and suggest they downgrade to a cheaper, more stable tier.", outcome: "They form a bad opinion, feel insulted, and churn immediately. You lose a major logo." },
    ]
  },
  {
    title: "Team Conflict",
    tagline: "Resolve internal disputes",
    icon: "??",
    color: "blue",
    intro: "Your Co-Founder and CTO is refusing to build a highly-requested feature because they believe it comprises technical debt, but Sales says it is blocking 3 huge deals.",
    choices: [
      { text: "Side with Sales. Force the CTO to build it now and fix technical debt later.", outcome: "Deals close, but the CTO writes spaghetti code out of spite and begins looking for another job." },
      { text: "Side with the CTO. Tell Sales to sell the product as is.", outcome: "Sales loses the deals. Morale in the sales team plummets, but the platform remains stable." },
      { text: "Compromise: Build a v1 'hacky' version just for these clients, and schedule technical debt cleanup for next quarter.", outcome: "Deals close, the CTO is annoyed but complies. The technical debt cleanup is never actually prioritized." },
    ]
  },
  {
    title: "Marketing Misstep",
    tagline: "Handling public relations",
    icon: "??",
    color: "fuchsia",
    intro: "A junior marketer tweeted an insensitive joke from the company account. It went semi-viral (300 retweets) before being deleted. A small group of users is demanding a statement.",
    choices: [
      { text: "Issue a formal, corporate apology from the CEO.", outcome: "It looks robotic but appeases most people. A few users still complain, but it blows over in a week." },
      { text: "Ignore it. Don't draw more attention to a deleted tweet.", outcome: "A competitor screenshots it and runs an ad campaign against you. It becomes a bigger issue." },
      { text: "Fire the junior marketer publicly to show you are serious.", outcome: "The internet turns on you for being a ruthless boss over a minor mistake. Massive PR backlash." },
    ]
  },
  {
    title: "Product Pivot",
    tagline: "Strategic direction shift",
    icon: "??",
    color: "teal",
    intro: "You've spent 6 months building an AI summarization tool, but OpenAI just released the exact same feature for free. Your runway is 8 months.",
    choices: [
      { text: "Pivot immediately to a niche vertical (e.g., Legal summaries only).", outcome: "You scramble to find lawyers. You secure 2 pilots, but runway drops to 6 months during the pivot." },
      { text: "Stay the course and compete on UI/UX and customer service.", outcome: "Growth stalls completely. You burn through 4 months of runway with zero new signups." },
      { text: "Shut down the project and return the remaining capital to investors.", outcome: "Investors respect your honesty, but your startup journey ends here for now." },
    ]
  }
];

const INVESTOR_NEGOTIATION = {
  intro: "Investor (Shark-style avatar): 'I like the team, and you handled those operational challenges reasonably well. I'll offer $1M for 20% equity.'",
  choices: [
    { text: "Accept the offer immediately.", outcome: "Deal closed at a $5M valuation. You get the cash but gave up a huge chunk of your company early on." },
    { text: "Counter: $1.5M for 15% equity.", outcome: "Investor: 'Ouch, that's steep. I can do $1.5M for 18%.' (Deal closed at $8.3M valuation). Great negotiation!" },
    { text: "Walk away. We don't need predatory terms.", outcome: "You walk away without funding. You retain equity but have to bootstrap through a very tough year." }
  ]
};

const TOTAL_STEPS = SCENARIOS.length + 2; // Scenarios + Pitch + Negotiation

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  return (
    <div className="flex items-center justify-center space-x-2 mb-8 hidden md:flex">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
            currentStep === step ? "bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]" :
            currentStep > step ? "bg-green-500 text-white" : "bg-slate-200 text-slate-400"
          }`}>
            {currentStep > step ? "?" : step}
          </div>
          {step < TOTAL_STEPS && (
            <div className={`w-8 lg:w-12 h-1 transition-all duration-500 ${currentStep > step ? "bg-green-500" : "bg-slate-200"}`} />
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
  
  // Store results
  const [scenarioResults, setScenarioResults] = useState<string[]>(Array(SCENARIOS.length).fill(""));
  const [investorResult, setInvestorResult] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      if (step > 0 && step < TOTAL_STEPS + 1) {
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

  const handleScenarioChoice = (scenarioIndex: number, outcome: string) => {
    const newResults = [...scenarioResults];
    newResults[scenarioIndex] = outcome;
    setScenarioResults(newResults);
  };

  const currentStepView = () => {
    if (step === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center max-w-3xl mx-auto">
          <div className="mb-6 inline-flex items-center gap-2 bg-amber-500/10 text-amber-700 px-4 py-2 rounded-full text-sm font-medium border border-amber-500/20">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Extended Startup Simulation
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl mb-6">
            Pitch to World-Class <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-amber-500">Virtual Investors</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 leading-relaxed">
            Navigate 4 distinct startup crises under pressure, deliver your elevator pitch, and negotiate a term sheet in this fully extended 15-minute gauntlet.
          </p>
          <button 
            onClick={() => setStep(1)} 
            className="px-8 py-4 bg-gradient-to-r from-violet-600 to-amber-600 hover:from-violet-700 hover:to-amber-700 text-white rounded-xl text-lg font-semibold shadow-xl shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
          >
            Enter the Extended War Room
          </button>
        </div>
      );
    }

    // SCENARIOS STEPS (1 to SCENARIOS.length)
    if (step >= 1 && step <= SCENARIOS.length) {
      const sIdx = step - 1;
      const scenario = SCENARIOS[sIdx];
      const result = scenarioResults[sIdx];
      
      const themeColors: Record<string, string> = {
        red: "bg-red-100 text-red-600 border-red-200 hover:border-red-500 hover:bg-red-50 hover:text-red-900",
        blue: "bg-blue-100 text-blue-600 border-blue-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-900",
        fuchsia: "bg-fuchsia-100 text-fuchsia-600 border-fuchsia-200 hover:border-fuchsia-500 hover:bg-fuchsia-50 hover:text-fuchsia-900",
        teal: "bg-teal-100 text-teal-600 border-teal-200 hover:border-teal-500 hover:bg-teal-50 hover:text-teal-900",
      };
      
      const headerColor = themeColors[scenario.color].split(' ')[0]; // just get the bg color
      const textColor = themeColors[scenario.color].split(' ')[1]; // get text color
      const interactiveColor = themeColors[scenario.color].split(' ').slice(2).join(' '); // get interactive colors

      return (
        <div className="py-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <StepIndicator currentStep={step} />
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-6 flex items-center gap-4">
              <div className={`w-12 h-12 ${headerColor} ${textColor} rounded-full flex items-center justify-center text-xl font-bold`}>
                {scenario.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{scenario.title}</h2>
                <p className="text-slate-500">{scenario.tagline}</p>
              </div>
            </div>
            <div className="p-8">
              <p className="text-lg text-slate-800 leading-relaxed mb-8 flex gap-3">
                <span className="text-2xl">&quot;</span>
                {scenario.intro}
                <span className="text-2xl">&quot;</span>
              </p>
              
              {result ? (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl animate-in zoom-in-95">
                  <h3 className="font-semibold text-slate-900 mb-2">Outcome:</h3>
                  <p className="text-slate-700 mb-6">{result}</p>
                  <button 
                    onClick={() => setStep(step + 1)} 
                    className="w-full px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
                  >
                    Proceed to Next Challenge ?
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Choose your sequence of action</p>
                  {scenario.choices.map((choice, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleScenarioChoice(sIdx, choice.outcome)} 
                      className={`w-full text-left p-5 border-2 border-slate-200 rounded-xl text-slate-700 transition-all duration-200 group ${interactiveColor}`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{choice.text}</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity font-medium">Select</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // PITCH STEP
    if (step === SCENARIOS.length + 1) {
      return (
        <div className="py-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <StepIndicator currentStep={step} />
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center text-xl">
                ???
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Voice Pitch</h2>
                <p className="text-slate-500">Record your 60-second pitch</p>
              </div>
            </div>
            <div className="p-12 flex flex-col items-center text-center">
              <p className="text-lg mb-8 text-slate-600 max-w-md">
                You've survived the operational gauntlet. Now, you have 60 seconds to deliver your elevator pitch to the board. Focus on traction, team, and problem-solving.
              </p>
              
              <div className="relative mb-10 mt-4">
                {isRecording && (
                  <div className="absolute -inset-4 bg-red-100 rounded-full animate-ping opacity-50"></div>
                )}
                <button 
                  onClick={handleStartRecording}
                  disabled={pitchRecorded || isRecording}
                  className={`relative w-36 h-36 rounded-full flex items-center justify-center shadow-xl transition-all ${
                    isRecording ? "bg-red-500 text-white scale-110" : 
                    pitchRecorded ? "bg-green-500 text-white" : 
                    "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  <span className="font-bold text-xl">
                    {isRecording ? `00:0${recordingTime}` : pitchRecorded ? "Recorded" : "Record"}
                  </span>
                </button>
              </div>

              {pitchRecorded && (
                <button 
                  onClick={() => setStep(step + 1)} 
                  className="px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors shadow-md shadow-violet-500/20 animate-in fade-in"
                >
                  Enter Negotiation Room ?
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    // NEGOTIATION STEP
    if (step === SCENARIOS.length + 2) {
      return (
        <div className="py-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
           <StepIndicator currentStep={step} />
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
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm">MC</div>
                <p className="text-lg text-slate-800 font-medium italic">
                  {INVESTOR_NEGOTIATION.intro}
                </p>
              </div>

              {investorResult ? (
                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl animate-in fade-in">
                  <h3 className="font-bold text-green-900 mb-2">Final Outcome:</h3>
                  <p className="text-green-800 font-medium mb-6">{investorResult}</p>
                  <button 
                    onClick={() => setStep(step + 1)} 
                    className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    View Final Assessment Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                   <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Your Negotiation Target</p>
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
    }

    // FINAL STEP
    if (step === TOTAL_STEPS + 1) {
      return (
        <div className="py-16 max-w-4xl mx-auto text-center animate-in zoom-in-95 duration-500">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 ring-8 ring-green-50">
            <span className="text-4xl">??</span>
          </div>
          <h2 className="text-4xl font-extrabold mb-4 text-slate-900">Simulation Complete</h2>
          <p className="text-xl text-slate-600 mb-12">Here is your founder profile based on your sequence of decisions.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8">
            {SCENARIOS.map((scenario, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="opacity-75">{scenario.icon}</span> {scenario.title}
                </div>
                <div className="font-medium text-slate-800 text-sm leading-snug">{scenarioResults[index]}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <span className="opacity-75">???</span> Pitch Delivery
              </div>
              <div className="font-medium text-slate-800 text-sm leading-snug">Pitch successfully recorded. Confident and clear delivery detected by simulated analysis metrics.</div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl shadow-lg border border-amber-200/50">
              <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                <span className="opacity-75">??</span> Deal Outcome
              </div>
              <div className="font-medium text-slate-900 text-sm leading-snug">{investorResult}</div>
            </div>
          </div>
          
          <button 
            onClick={() => {
              setStep(0);
              setScenarioResults(Array(SCENARIOS.length).fill(""));
              setInvestorResult("");
              setPitchRecorded(false);
              setTimeLeft(15 * 60);
              window.scrollTo(0,0);
            }} 
            className="mt-16 px-10 py-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition shadow-xl font-bold text-lg"
          >
            Restart The Gauntlet
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-violet-200">
      <header className="sticky top-0 z-50 flex justify-between items-center p-4 sm:px-8 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-3 w-1/3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-amber-500 flex items-center justify-center text-white font-bold shadow-md">
            KK
          </div>
          <span className="font-bold text-lg tracking-tight hidden sm:block">War Room <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded ml-2 border border-slate-300 font-medium">EXTENDED DEMO</span></span>
        </div>
        
        {step > 0 && step < TOTAL_STEPS + 1 && (
          <div className="flex items-center justify-center w-1/3">
             <div className="bg-violet-100 text-violet-800 font-semibold px-3 py-1 rounded-full text-xs uppercase tracking-widest hidden sm:block">
               Phase {step} of {TOTAL_STEPS}
             </div>
          </div>
        )}

        <div className="flex justify-end w-1/3">
          {step > 0 && step < TOTAL_STEPS + 1 && (
            <div className="flex items-center gap-3 bg-red-50 text-red-700 px-4 py-1.5 rounded-full border border-red-200 font-medium shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <div className="font-mono text-sm font-bold">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
              </div>
            </div>
          )}
        </div>
      </header>
      
      <div className="min-h-[calc(100vh-73px)] pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {currentStepView()}
        </div>
      </div>
    </main>
  );
}

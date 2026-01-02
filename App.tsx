import React, { useState, useCallback } from 'react';
import { UI_STRINGS } from './constants';
import { 
  Language, 
  KNOWLEDGE_SYSTEMS, 
  EpistemicProbeResult, 
  EpistemicStatus 
} from './types';
import { runEpistemicProbe } from './services/geminiService';
import PianoRoll from './components/PianoRoll';
import MelodyRef from './components/MelodyRef';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [sourceSystem, setSourceSystem] = useState(KNOWLEDGE_SYSTEMS[0]);
  const [targetSystem, setTargetSystem] = useState(KNOWLEDGE_SYSTEMS[3]);
  const [userInput, setUserInput] = useState('');
  const [isProbing, setIsProbing] = useState(false);
  const [result, setResult] = useState<EpistemicProbeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<Record<string, string>>({});
  const [rating, setRating] = useState<number | null>(null);

  const strings = UI_STRINGS[lang];

  const handleProbe = async () => {
    if (!userInput.trim()) return;
    setIsProbing(true);
    setError(null);
    setRating(null);
    setDecisions({});
    try {
      const data = await runEpistemicProbe(sourceSystem, targetSystem, userInput, lang);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to run epistemic probe. Ensure your API key is configured.");
    } finally {
      setIsProbing(false);
    }
  };

  const handleDecision = (taskId: string, option: string) => {
    setDecisions(prev => ({ ...prev, [taskId]: option }));
  };

  const getStatusColor = (status: EpistemicStatus) => {
    switch (status) {
      case EpistemicStatus.UNDERSTOOD: return 'text-green-400 border-green-500/30 bg-green-500/5';
      case EpistemicStatus.MISUNDERSTOOD: return 'text-amber-400 border-amber-500/30 bg-amber-500/5';
      case EpistemicStatus.REFUSED: return 'text-red-400 border-red-500/30 bg-red-500/5';
    }
  };

  return (
    <div className="min-h-screen pb-20 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {strings.title}
          </h1>
          <p className="text-slate-400 mt-1 uppercase tracking-widest text-sm font-medium">
            {strings.subtitle} — {strings.theme}
          </p>
          <p className="text-slate-500 text-xs mt-2 italic">
            {strings.authors} | {strings.institution}
          </p>
        </div>
        <button 
          onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
          className="px-4 py-2 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
        >
          {lang === 'en' ? '中文' : 'EN'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Panel */}
        <div className="lg:col-span-5 space-y-6">
          <section className="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
              {strings.inputHeader}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-slate-500 mb-2 font-bold tracking-wider">{strings.sourceSystem}</label>
                <select 
                  value={sourceSystem}
                  onChange={(e) => setSourceSystem(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 p-3 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-slate-200"
                >
                  {KNOWLEDGE_SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase text-slate-500 mb-2 font-bold tracking-wider">{strings.targetSystem}</label>
                <select 
                  value={targetSystem}
                  onChange={(e) => setTargetSystem(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 p-3 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-slate-200"
                >
                  {KNOWLEDGE_SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase text-slate-500 mb-2 font-bold tracking-wider">Musical Element Description</label>
                <textarea 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={strings.inputPlaceholder}
                  className="w-full bg-neutral-900 border border-neutral-800 p-4 rounded-lg h-32 focus:ring-2 focus:ring-cyan-500 outline-none transition-all resize-none text-slate-200"
                />
              </div>

              <button 
                onClick={handleProbe}
                disabled={isProbing || !userInput}
                className="w-full py-4 bg-cyan-700 hover:bg-cyan-600 disabled:bg-neutral-800 disabled:text-neutral-600 font-bold rounded-xl transition-all shadow-lg shadow-cyan-900/10 active:scale-95 flex items-center justify-center gap-3 text-white"
              >
                {isProbing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : strings.initiateButton}
              </button>
            </div>
          </section>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          {result && (
            <section className="glass-panel p-6 rounded-2xl border border-white/10">
               <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Human Epistemic Feedback</h3>
               <p className="text-xs text-slate-500 mb-4">Rate how accurately the AI identified its own understanding/misunderstanding:</p>
               <div className="flex gap-4 items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-all ${rating && rating >= star ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'text-neutral-700 hover:text-neutral-500'}`}
                    >
                      ★
                    </button>
                  ))}
                  {rating && <span className="text-cyan-400 font-bold text-sm ml-2">Logged: {rating}/5</span>}
               </div>
            </section>
          )}
        </div>

        {/* Right Column: Results Panel */}
        <div className="lg:col-span-7 space-y-8">
          {result ? (
            <>
              {/* Dashboard */}
              <section className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden">
                <h2 className="text-2xl font-bold mb-8">{strings.dashboardTitle}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { node: result.geographicOrigin, label: lang === 'en' ? 'Geographic Origin' : '地理来源' },
                    { node: result.tonalStructure, label: lang === 'en' ? 'Tonal Structure' : '音调结构' },
                    { node: result.ambiguity, label: lang === 'en' ? 'Ambiguity' : '模糊性' },
                    { node: result.culturalRefusal, label: lang === 'en' ? 'Cultural Refusal' : '文化拒绝' }
                  ].map(({ node, label }, idx) => (
                    <div key={idx} className={`p-5 border rounded-2xl transition-all ${getStatusColor(node.status)}`}>
                      <p className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-1">{label}</p>
                      <h3 className="font-bold text-lg leading-tight mb-2">{node.title}</h3>
                      <p className="text-xs opacity-80 mb-3">{node.description}</p>
                      <div className="text-[10px] bg-black/30 p-2 rounded-lg font-mono opacity-70">
                         {node.details}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Tasks */}
              <section className="glass-panel p-8 rounded-3xl border border-white/10">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                  {strings.taskTitle}
                </h2>
                <div className="space-y-4">
                  {result.tasks.map((task) => (
                    <div key={task.id} className="p-5 bg-neutral-900/50 border border-neutral-800 rounded-2xl group transition-all">
                      <p className="text-slate-300 font-medium mb-4 italic">"{task.question}"</p>
                      <div className="flex flex-wrap gap-2">
                        {task.options.map((opt, j) => (
                          <button 
                            key={j} 
                            onClick={() => handleDecision(task.id, opt)}
                            className={`px-3 py-1.5 text-xs rounded-full border transition-all 
                              ${decisions[task.id] === opt 
                                ? 'bg-cyan-500 text-black border-cyan-500 font-bold' 
                                : 'bg-neutral-800 text-slate-400 border-neutral-700 hover:border-slate-500'}`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Propositions */}
              <section className="glass-panel p-8 rounded-3xl border border-white/10">
                <h2 className="text-xl font-bold mb-6">{strings.propositionTitle}</h2>
                <div className="grid grid-cols-1 gap-8">
                  {result.propositions.map((prop, i) => (
                    <div key={i} className="bg-gradient-to-br from-neutral-900 to-black p-6 rounded-2xl border border-white/5 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg text-purple-400 mb-1">{prop.title}</h3>
                          <p className="text-xs text-slate-500 italic">Proposition #{i + 1}</p>
                        </div>
                        <MelodyRef notes={prop.notes} />
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed">{prop.description}</p>
                      <PianoRoll notes={prop.notes} color={i === 0 ? '#22d3ee' : '#a855f7'} />
                      <p className="text-[10px] text-slate-600 font-mono text-right truncate">prompt: {prop.musical_sketch_prompt}</p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <div className="h-full min-h-[500px] glass-panel rounded-3xl border border-dashed border-neutral-800 flex flex-col items-center justify-center p-12 text-center">
              {isProbing ? (
                <div className="space-y-8 flex flex-col items-center">
                   <div className="relative">
                      <div className="w-20 h-20 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 bg-cyan-500/20 rounded-full animate-pulse"></div>
                      </div>
                   </div>
                   <div className="space-y-2">
                     <p className="text-cyan-400 font-bold text-xl tracking-widest uppercase animate-pulse">Probing Episteme...</p>
                     <p className="text-xs text-slate-500 max-w-xs mx-auto">Cross-referencing tonal logic and identifying cultural boundaries</p>
                   </div>
                </div>
              ) : (
                <div className="opacity-40 space-y-4">
                  <div className="w-24 h-24 mx-auto border border-neutral-800 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-300">System Idle</h3>
                  <p className="text-sm max-w-sm text-slate-500">Initiate a probe to visualize AI's cultural understanding and generate musical propositions.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <footer className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-slate-600 text-[10px] gap-4 uppercase tracking-widest">
        <div>{strings.authors} | {strings.institution}</div>
        <div>{strings.version}</div>
      </footer>
    </div>
  );
};

export default App;
import React, { useState } from 'react';
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
  const [lang, setLang] = useState<Language>('zh');
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
      setError(lang === 'en' ? "Probe Failed: Connection to Gemini 3 interrupted." : "探针失败：与 Gemini 3 的连接中断。");
    } finally {
      setIsProbing(false);
    }
  };

  const getStatusColor = (status: EpistemicStatus) => {
    switch (status) {
      case EpistemicStatus.UNDERSTOOD: return 'text-green-400 border-green-900/30 bg-green-950/10';
      case EpistemicStatus.MISUNDERSTOOD: return 'text-amber-400 border-amber-900/30 bg-amber-950/10';
      case EpistemicStatus.REFUSED: return 'text-red-400 border-red-900/30 bg-red-950/10';
    }
  };

  const getStatusText = (status: EpistemicStatus) => {
    return strings.statusLabels[status] || status;
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0a0a0a] text-slate-200">
      {/* Navigation / Header */}
      <nav className="flex-none flex justify-between items-center px-6 py-4 border-b border-white/5 bg-black/40 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-cyan-600 rounded flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(8,145,178,0.3)] text-sm">CB</div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white uppercase leading-none">{strings.title}</h1>
            <p className="text-[9px] text-slate-500 font-bold tracking-[0.2em] mt-1 uppercase">{strings.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
           <span className="text-[9px] text-slate-600 font-mono hidden md:inline-block">{strings.systemStatus}</span>
           <button 
            onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
            className="px-4 py-1 border border-white/10 rounded-full hover:bg-white/5 transition-all text-[10px] font-bold text-slate-400 whitespace-nowrap"
          >
            {lang === 'en' ? 'ENGLISH / 中文 (ZH)' : '中文 / ENGLISH (EN)'}
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-hidden grid grid-cols-1 xl:grid-cols-12 gap-0">
        {/* Left Side: Control Panel (Scrollable) */}
        <div className="xl:col-span-4 border-r border-white/5 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          <section className="glass-panel p-6 rounded-2xl border border-white/5">
            <h2 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></span>
              {strings.inputHeader}
            </h2>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] uppercase text-slate-500 mb-1.5 font-bold">{strings.sourceSystem}</label>
                  <select 
                    value={sourceSystem}
                    onChange={(e) => setSourceSystem(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 p-2 rounded-xl text-[11px] text-slate-300 outline-none focus:border-cyan-500/50 transition-all appearance-none cursor-pointer"
                  >
                    {KNOWLEDGE_SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] uppercase text-slate-500 mb-1.5 font-bold">{strings.targetSystem}</label>
                  <select 
                    value={targetSystem}
                    onChange={(e) => setTargetSystem(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 p-2 rounded-xl text-[11px] text-slate-300 outline-none focus:border-cyan-500/50 transition-all appearance-none cursor-pointer"
                  >
                    {KNOWLEDGE_SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase text-slate-500 mb-1.5 font-bold">{strings.inputContext}</label>
                <textarea 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={strings.inputPlaceholder}
                  className="w-full bg-black/50 border border-white/10 p-3 rounded-xl h-32 text-xs text-slate-200 outline-none focus:border-cyan-500/50 transition-all resize-none leading-relaxed placeholder:text-slate-700"
                />
              </div>

              <button 
                onClick={handleProbe}
                disabled={isProbing || !userInput}
                className="group relative w-full py-3.5 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl overflow-hidden transition-all active:scale-[0.98] disabled:bg-neutral-800 disabled:text-neutral-600 shadow-xl shadow-white/5"
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {isProbing ? <div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div> : strings.initiateButton}
                </div>
              </button>
            </div>
          </section>

          {error && (
            <div className="p-4 bg-red-500/5 border border-red-500/20 text-red-500 rounded-xl text-[9px] font-mono leading-relaxed">
              [CRITICAL_ERROR]: {error}
            </div>
          )}

          {result && (
            <section className="glass-panel p-5 rounded-2xl border border-white/5">
               <h3 className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-4">{strings.feedbackTitle}</h3>
               <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                  <span className="text-[9px] text-slate-400 uppercase">{strings.validateAccuracy}</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => setRating(s)}
                        className={`text-base transition-all ${rating && rating >= s ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]' : 'text-slate-800 hover:text-slate-600'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
               </div>
            </section>
          )}

          <div className="pt-4 opacity-40">
            <p className="text-[8px] text-slate-500 font-mono leading-relaxed uppercase">{strings.footerDisclaimer}</p>
          </div>
        </div>

        {/* Right Side: Results (Scrollable) */}
        <div className="xl:col-span-8 overflow-y-auto p-6 scrollbar-hide">
          {result ? (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* Epistemic Mapping Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { node: result.geographicOrigin, label: strings.mappingLabels.locale },
                  { node: result.tonalStructure, label: strings.mappingLabels.tonal },
                  { node: result.ambiguity, label: strings.mappingLabels.entropy },
                  { node: result.culturalRefusal, label: strings.mappingLabels.refusal }
                ].map(({ node, label }, i) => (
                  <div key={i} className={`p-5 border rounded-2xl transition-all hover:bg-white/5 ${getStatusColor(node.status)}`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">{label}</span>
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full bg-white/5 border border-white/5">{getStatusText(node.status)}</span>
                    </div>
                    <h3 className="text-sm font-bold mb-1.5 text-white">{node.title}</h3>
                    <p className="text-[11px] opacity-70 leading-relaxed mb-3">{node.description}</p>
                    <div className="text-[9px] bg-black/40 p-2.5 rounded-lg font-mono opacity-50 border border-white/5 italic">
                      {node.details}
                    </div>
                  </div>
                ))}
              </div>

              {/* Musical Propositions List */}
              <div className="space-y-5">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 text-center">{strings.propositionTitle}</h2>
                {result.propositions.map((prop, i) => (
                  <div key={i} className="glass-panel p-6 rounded-3xl border border-white/5 group hover:border-white/10 transition-all">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-white mb-1">{prop.title}</h3>
                        <p className="text-[11px] text-slate-400 italic leading-relaxed">"{prop.description}"</p>
                      </div>
                      <div className="flex-none">
                        <MelodyRef notes={prop.notes} lang={lang} />
                      </div>
                    </div>
                    
                    <div className="relative">
                      <PianoRoll notes={prop.notes} color={i === 0 ? '#0891b2' : '#7c3aed'} lang={lang} />
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 text-[8px] font-mono text-slate-600 uppercase tracking-widest">
                      <span>{strings.generatedId}: {result.id}-{i}</span>
                      <span>{strings.modality}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Participatory Tasks */}
              <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center justify-center gap-3">
                  <div className="h-[1px] flex-1 bg-white/5"></div>
                  {strings.taskTitle}
                  <div className="h-[1px] flex-1 bg-white/5"></div>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.tasks.map((task) => (
                    <div key={task.id} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex flex-col">
                      <p className="text-[11px] text-slate-300 mb-4 leading-relaxed font-medium min-h-[3em]">"{task.question}"</p>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {task.options.map((opt, j) => (
                          <button 
                            key={j} 
                            onClick={() => setDecisions(prev => ({...prev, [task.id]: opt}))}
                            className={`px-2.5 py-1.5 text-[9px] rounded-lg border transition-all uppercase tracking-tighter ${decisions[task.id] === opt ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-transparent text-slate-500 border-white/10 hover:border-white/30'}`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center px-12 opacity-50">
              {isProbing ? (
                <div className="space-y-8">
                   <div className="relative w-20 h-20 mx-auto">
                      <div className="absolute inset-0 border border-cyan-500/10 rounded-full"></div>
                      <div className="absolute inset-0 border-t border-cyan-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-4 border-b border-purple-500 rounded-full animate-spin [animation-direction:reverse]"></div>
                   </div>
                   <div className="space-y-2">
                     <p className="text-xl font-bold tracking-tighter text-white uppercase">{strings.synthesizing}</p>
                     <p className="text-[10px] text-slate-600 font-mono animate-pulse uppercase tracking-[0.2em]">{strings.synthesizingDesc}</p>
                   </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center border border-white/5">
                    <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 18.5a6.5 6.5 0 100-13 6.5 6.5 0 000 13zM3 12h3M18 12h3M12 3v3M12 18v3" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <h3 className="text-base font-bold text-white uppercase tracking-[0.3em]">{strings.diagnosticIdle}</h3>
                  <p className="text-[10px] max-w-[280px] mx-auto leading-relaxed uppercase tracking-wider text-slate-500">{strings.diagnosticIdleDesc}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer (Compact) */}
      <footer className="flex-none px-6 py-4 border-t border-white/5 bg-black/40 backdrop-blur-md flex flex-row justify-between items-center text-[9px] tracking-widest uppercase">
        <div className="flex-1">
          {/* Authors and Institution Removed */}
        </div>
        <div className="text-right flex flex-col gap-0.5">
          <span className="text-slate-700 font-mono">CultureBridge-PRO-v4.2.1</span>
          <span className="text-slate-800 tracking-normal">{strings.version}</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
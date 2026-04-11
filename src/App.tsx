import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  Search, 
  Gavel,
  ChevronRight,
  RefreshCw,
  Play,
  Cpu,
  Shield,
  BookOpen,
  ArrowRight,
  Trello,
  Layers,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EnvState {
  taskId: string;
  history: string[];
  done: boolean;
  totalReward: number;
  steps: number;
  actionCounts?: Record<string, number>;
}

interface Observation {
  document_text: string;
  task_description: string;
  history: string[];
  metadata?: {
    patent_number: string;
    filing_date: string;
  };
}

export default function App() {
  const [state, setState] = useState<EnvState | null>(null);
  const [observation, setObservation] = useState<Observation | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState('forensic-claim-mapping');
  const [activeTab, setActiveTab] = useState<'document' | 'structure' | 'glossary'>('document');
  const [glossary, setGlossary] = useState<Record<string, string>>({});

  const fetchState = async () => {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) throw new Error('Failed state fetch');
      const data = await res.json();
      setState(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGlossary = async () => {
    try {
      const res = await fetch('/api/glossary');
      if (res.ok) {
        const data = await res.json();
        setGlossary(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = async (taskId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId })
      });
      const data = await res.json();
      setObservation(data.observation);
      await fetchState();
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchState();
    fetchGlossary();
    handleReset(selectedTask);
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, []);

  const tasks = [
    { id: 'forensic-claim-mapping', name: 'Structural Delineation', difficulty: 'Easy', icon: Search },
    { id: 'forensic-limitation-audit', name: 'Limitation Audit', difficulty: 'Medium', icon: Shield },
    { id: 'equivalence-forensics', name: 'Equivalence Forensic', difficulty: 'Hard', icon: Gavel },
    { id: 'sovereign-ip-strategy', name: 'Strategic Audit', difficulty: 'Elite', icon: Cpu },
  ];

  return (
    <div className="min-h-screen bg-[#050508] text-slate-300 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Premium Background Blobs & Animations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="neural-pulse top-[-10%] left-[-10%] bg-blue-600/10" />
        <div className="neural-pulse bottom-[-10%] right-[-10%] bg-indigo-600/10" style={{ animationDelay: '-5s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-emerald-600/5 blur-[100px] rounded-full shadow-2xl" />
        <div className="scanline" />
      </div>

      {/* Glass Sidebar */}
      <nav className="fixed left-0 top-0 bottom-0 w-20 bg-black/40 border-r border-white/5 backdrop-blur-3xl z-50 flex flex-col items-center py-8 gap-8">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/40">
          <Gavel className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex flex-col gap-4 mt-12 w-full px-2">
          {[
            { id: 'document', icon: FileText, label: 'Document' },
            { id: 'structure', icon: Trello, label: 'Tree' },
            { id: 'glossary', icon: BookOpen, label: 'Glossary' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all group relative ${
                activeTab === item.id ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <div className="absolute left-full ml-4 px-2 py-1 rounded bg-slate-800 text-white text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 shadow-2xl z-[100]">
                {item.label}
              </div>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Container */}
      <div className="pl-20 relative z-10">
        {/* Top Header */}
        <header className="h-20 border-b border-white/5 bg-black/40 backdrop-blur-2xl flex items-center justify-between px-10">
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              AEGIS <span className="text-blue-500">FORENSIC</span> IP
            </h1>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <span className="text-blue-600">Secure Protocol</span>
              <span>/</span>
              <span>EPISODE_{(state?.steps || 0).toString().padStart(3, '0')}</span>
              <span>/</span>
              <span className="text-emerald-500 animate-pulse">LIVE EXECUTOR</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">Session Fidelity</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-bold text-emerald-400">{(state?.totalReward || 0).toFixed(4)}</span>
                <span className="text-slate-600 text-xs font-mono">/ 1.0000</span>
              </div>
            </div>
            <div className="flex flex-col items-center px-4 py-2 rounded-xl bg-white/5 border border-white/10 min-w-[100px]">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">State Trust</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-xs font-mono font-bold text-slate-300">VALIDATED</span>
              </div>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <button 
              onClick={() => handleReset(selectedTask)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-black text-[11px] uppercase tracking-widest text-white ring-1 ring-white/10 hover:ring-blue-500/50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Re-Sync Core
            </button>
          </div>
        </header>

        {/* Workspace Layout */}
        <main className="p-10 grid grid-cols-12 gap-8 items-start">
          
          {/* Sidebar Left: Tasks & Metadata */}
          <aside className="col-span-3 space-y-6">
            <section className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] px-1">Selected Vector</h3>
              <div className="space-y-2">
                {tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => { setSelectedTask(task.id); handleReset(task.id); }}
                    className={`w-full p-4 rounded-2xl flex items-center justify-between border transition-all ${
                      selectedTask === task.id ? 'bg-blue-600 shadow-xl shadow-blue-600/20 text-white border-blue-500' : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <task.icon className="w-4 h-4" />
                      <span className="text-sm font-bold tracking-tight">{task.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </button>
                ))}
              </div>
            </section>

            <section className="p-6 rounded-3xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metadata</h3>
                <Layers className="w-4 h-4 text-blue-500" />
              </div>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-600 uppercase font-bold tracking-[0.1em]">Patent Reference</span>
                  <span className="text-sm font-mono text-white mt-1 uppercase">{observation?.metadata?.patent_number || 'LOADING...'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-600 uppercase font-bold tracking-[0.1em]">Filing Origin</span>
                  <span className="text-sm font-mono text-white mt-1">{observation?.metadata?.filing_date || 'LOADING...'}</span>
                </div>
              </div>
            </section>
          </aside>

          {/* Center Column: Viewport */}
          <section className="col-span-6 space-y-6">
            <div className="rounded-[2.5rem] bg-[#0d0d10] border border-white/10 overflow-hidden flex flex-col shadow-2xl min-h-[700px]">
              <div className="px-8 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex gap-4">
                  {['document', 'structure', 'glossary'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-lg transition-all ${
                        activeTab === tab ? 'bg-blue-600/10 text-blue-400 ring-1 ring-blue-500/30' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                    <Activity className="w-3 h-3 text-blue-500" />
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Protocol 700-X</span>
                  </div>
                  <HelpCircle className="w-4 h-4 text-slate-600 hover:text-blue-500 transition-colors cursor-help" />
                </div>
              </div>

              <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                  {activeTab === 'document' && (
                    <motion.div
                      key="document"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-8"
                    >
                      <div className="p-8 rounded-[2rem] bg-blue-600/[0.03] border border-blue-500/10 italic text-slate-400 line-clamp-3">
                        <span className="text-blue-500 font-black mr-2 uppercase text-xs tracking-widest">Objective:</span>
                        {observation?.task_description}
                      </div>
                      <div className="relative">
                        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-blue-600" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-blue-600" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-blue-600" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-blue-600" />
                        <pre className="p-10 font-mono text-sm leading-relaxed text-slate-400 whitespace-pre-wrap">
                          {observation?.document_text}
                        </pre>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'structure' && (
                    <motion.div
                      key="structure"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-12 py-10"
                    >
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="p-4 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-500 shadow-xl shadow-blue-500/10">
                          <Layers className="w-8 h-8" />
                        </div>
                        <h4 className="text-xl font-black text-white tracking-tight uppercase">Architectural Claim Map</h4>
                        <p className="text-slate-500 max-w-sm text-xs font-bold uppercase tracking-widest opacity-70">Decoded Structural Integrity</p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 relative">
                        {/* Connecting Line */}
                        <div className="absolute top-0 bottom-0 left-[2rem] w-px bg-gradient-to-b from-blue-500/50 via-blue-500/20 to-transparent" />
                        
                        {[
                          { id: 1, type: 'Independent', title: 'Main System Architecture', status: 'primary' },
                          { id: 2, type: 'Dependent', title: 'Power Interface Module', status: 'secondary' },
                          { id: 3, type: 'Independent', title: 'Operational Method', status: 'primary' }
                        ].map((node, i) => (
                          <motion.div 
                            key={node.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl ml-4 flex items-center gap-6 group hover:bg-white/[0.04] transition-all hover:border-blue-500/30"
                          >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${node.status === 'primary' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-800 text-slate-400 border border-white/5'}`}>
                              {node.id}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">{node.type} Claim</span>
                              <h5 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{node.title}</h5>
                            </div>
                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                              <ArrowRight className="w-4 h-4 text-slate-600" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'glossary' && (
                    <motion.div
                      key="glossary"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-10 pt-4"
                    >
                      <section className="space-y-4">
                        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                          <BookOpen className="w-3 h-3" /> Legal Lexicon
                        </h5>
                        <div className="space-y-3">
                          {Object.entries(glossary).map(([term, def], i) => (
                            <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-blue-600/5 hover:border-blue-500/20 transition-all group relative overflow-hidden">
                              <span className="text-blue-400 font-black uppercase tracking-[0.1em] text-[10px] mb-1 block">{term}</span>
                              <p className="text-slate-400 text-xs leading-relaxed font-medium">{def}</p>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="space-y-4">
                        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                          <Search className="w-3 h-3" /> Reference Library (Prior Art)
                        </h5>
                        <div className="grid grid-cols-1 gap-3">
                          {[
                            { id: 'US-992/A1', title: 'Decentralized Mesh Architecture', desc: 'Core prior art for topology comparisons.' },
                            { id: 'US-882/B2', title: 'Haptic Variable Dampening', desc: 'Precedent for rotational force sensors.' },
                            { id: 'US-771/X5', title: 'Smart Lock Long-Range Radio', desc: 'Historical context for wireless security.' }
                          ].map((ref, i) => (
                            <div key={i} className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-mono text-emerald-500 font-bold">{ref.id}</span>
                                <span className="text-[8px] text-emerald-900 bg-emerald-500/20 px-1.5 py-0.5 rounded font-black">HIGH RELEVANCE</span>
                              </div>
                              <h6 className="text-[11px] font-bold text-slate-300">{ref.title}</h6>
                              <p className="text-[10px] text-slate-500 italic">{ref.desc}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* Right Column: Console */}
          <aside className="col-span-3 h-[700px] flex flex-col rounded-[2.5rem] bg-[#0d0d10] border border-white/10 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Heuristic Stream</span>
              </div>
              <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-4 custom-scrollbar">
              <AnimatePresence initial={false}>
                {state?.history.map((log, i) => {
                  const [action, ...rest] = log.split(':');
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border-b border-white/5 pb-3 last:border-0"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-blue-500 font-black uppercase text-[9px] tracking-widest">{action}</span>
                        <span className="text-slate-600 text-[9px] tracking-tighter">{(i + 1).toString().padStart(2, '0')}</span>
                      </div>
                      <div className="text-slate-400 leading-relaxed pl-2 border-l border-blue-600/30">
                        {rest.join(':').trim()}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            
            <div className="p-6 bg-black/40 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sys Load</span>
                <span className="text-[9px] font-mono text-blue-500">OPTIMAL</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(state?.steps || 0) * 10}%` }}
                  className="h-full bg-blue-600"
                />
              </div>
            </div>
          </aside>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.5); }
      `}</style>
    </div>
  );
}

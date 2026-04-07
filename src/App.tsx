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
  const [selectedTask, setSelectedTask] = useState('easy-claim-mapping');
  const [activeTab, setActiveTab] = useState<'document' | 'structure' | 'glossary'>('document');

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
    handleReset(selectedTask);
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, []);

  const tasks = [
    { id: 'easy-claim-mapping', name: 'Claim Mapping', difficulty: 'Easy', icon: Search },
    { id: 'medium-limitation-extraction', name: 'Limitation Extraction', difficulty: 'Medium', icon: Shield },
    { id: 'hard-infringement-audit', name: 'Infringement Audit', difficulty: 'Hard', icon: Gavel },
  ];

  return (
    <div className="min-h-screen bg-[#050508] text-slate-300 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Premium Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[130px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[130px] rounded-full animate-pulse" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-emerald-600/5 blur-[100px] rounded-full shadow-2xl" />
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
              PATENT <span className="text-blue-500">INTEL</span> TERMINAL
            </h1>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <span className="text-blue-600">Secure Protocol</span>
              <span>/</span>
              <span>EPISODE_{(state?.steps || 0).toString().padStart(3, '0')}</span>
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
                <div className="flex items-center gap-2 group cursor-help">
                  <HelpCircle className="w-4 h-4 text-slate-600 group-hover:text-blue-500 transition-colors" />
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
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="h-full flex flex-col items-center justify-center space-y-8 py-20"
                    >
                      <div className="p-8 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-500">
                        <Trello className="w-12 h-12" />
                      </div>
                      <div className="text-center space-y-2">
                        <h4 className="text-lg font-black text-white">Dynamic Claim Mapping</h4>
                        <p className="text-slate-500 max-w-sm text-sm font-medium">Visualizing the structural limitations extracted by the agent in real-time.</p>
                      </div>
                      <div className="flex gap-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-32 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center animate-pulse">
                            <div className="w-16 h-2 bg-white/10 rounded-full" />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'glossary' && (
                    <motion.div
                      key="glossary"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      {[
                        { term: 'Comprising', def: 'Open-ended (including but not limited to).' },
                        { term: 'Consisting of', def: 'Closed-ended (only these elements).' },
                        { term: 'Doctrine of Equivalents', def: 'Legal equivalence even without literal match.' },
                        { term: 'Indep. Claim', def: 'Stands alone without referring to others.' }
                      ].map((item, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-blue-600/5 hover:border-blue-500/30 transition-all group">
                          <span className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-2 block">{item.term}</span>
                          <p className="text-slate-400 text-sm italic leading-relaxed">{item.def}</p>
                        </div>
                      ))}
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

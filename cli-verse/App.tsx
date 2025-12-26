
import React, { useState, useEffect, useMemo } from 'react';
import { AGENT_SEEDS } from './constants';
import { Agent, AgentCategory, ChatMessage } from './types';
import TerminalHero from './components/TerminalHero';
import AgentCard from './components/AgentCard';
import AgentDetailLayer from './components/AgentDetailLayer';
import ComparisonLayer from './components/ComparisonLayer';
import { 
  Search, MessageSquare, ArrowUpDown, X,
  Wifi, ChevronLeft, ChevronRight, RefreshCw, Activity 
} from 'lucide-react';
import { askExpert } from './services/geminiService';
import { RegistrySyncService } from './services/syncService';
import { buildCategoryStats, buildRegistryHealth, buildRegistryTimeline, enrichAgents } from './services/agentEnrichment';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const App: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>(() => (
    enrichAgents(AGENT_SEEDS).map(agent => ({
      ...agent,
      status: 'LIVE',
      lastSynced: new Date().toISOString()
    }))
  ));
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [compareAgentA, setCompareAgentA] = useState<Agent | null>(null);
  const [compareAgentB, setCompareAgentB] = useState<Agent | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  
  // Sync Engine State
  const [isGlobalSyncing, setIsGlobalSyncing] = useState(false);
  const [lastGlobalSync, setLastGlobalSync] = useState(new Date().toLocaleTimeString());

  // Squad State
  const [squad, setSquad] = useState<Agent[]>([]);
  const [showCollaboration, setShowCollaboration] = useState(false);
  
  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('Stars (High-Low)');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
      {role: 'model', text: 'CLI-Verse Node initialized. Direct metadata pulling active. How can I assist?'}
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const categoryStats = useMemo(() => buildCategoryStats(agents), [agents]);
  const registryTimeline = useMemo(() => buildRegistryTimeline(agents), [agents]);
  const registryHealth = useMemo(() => buildRegistryHealth(agents), [agents]);
  const totalStars = useMemo(() => agents.reduce((sum, agent) => sum + agent.stars, 0), [agents]);
  const averageStars = useMemo(() => Math.round(totalStars / Math.max(1, agents.length)), [totalStars, agents.length]);

  // Filter & Sort Logic (Memoized for performance)
  const sortedFilteredAgents = useMemo(() => {
    let result = agents.filter(agent => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
          agent.name.toLowerCase().includes(query) || 
          agent.tags.some(t => t.toLowerCase().includes(query)) ||
          agent.category.toLowerCase().includes(query);

      const matchesCategory = selectedCategory === 'All' || agent.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    return result.sort((a, b) => {
        switch(sortBy) {
            case 'Stars (High-Low)': return b.stars - a.stars;
            case 'Stars (Low-High)': return a.stars - b.stars;
            case 'Name (A-Z)': return a.name.localeCompare(b.name);
            case 'Name (Z-A)': return b.name.localeCompare(a.name);
            default: return 0;
        }
    });
  }, [agents, searchQuery, selectedCategory, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedFilteredAgents.length / itemsPerPage);
  const paginatedAgents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedFilteredAgents.slice(start, start + itemsPerPage);
  }, [sortedFilteredAgents, currentPage]);

  // Deterministic Status Checker (Background Loop)
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(a => ({
        ...a,
        status: RegistrySyncService.checkStatus(a)
      })));
    }, 30000); // Check status every 30s
    return () => clearInterval(interval);
  }, []);

  const handleGlobalSync = async () => {
    setIsGlobalSyncing(true);
    setChatHistory(prev => [...prev, { role: 'model', text: '> PULLING LATEST METADATA FROM REGISTRY NODES...' }]);
    
    // Logic: Force all visible agents into SYNCING state
    setAgents(prev => prev.map(a => ({ ...a, status: 'SYNCING' })));
    
    // Simulate high-bandwidth active pulling
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setAgents(prev => prev.map(a => ({ 
      ...a, 
      status: 'LIVE', 
      lastSynced: new Date().toISOString() 
    })));
    
    setLastGlobalSync(new Date().toLocaleTimeString());
    setIsGlobalSyncing(false);
    setChatHistory(prev => [...prev, { role: 'model', text: '> REGISTRY SYNCHRONIZED. INTEGRITY 100%.' }]);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!chatInput.trim()) return;
      const userMsg = chatInput;
      setChatHistory(prev => [...prev, {role: 'user', text: userMsg}]);
      setChatInput('');
      setChatLoading(true);
      
      const context = `Registry Context: ${agents.length} tools indexed. Sector ${currentPage}/${totalPages} active.`;
      const response = await askExpert(userMsg, context);
      
      setChatHistory(prev => [...prev, {role: 'model', text: response}]);
      setChatLoading(false);
  };

  const categories = ['All', ...Object.values(AgentCategory)];

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* HUD / Navigation */}
      <nav className="sticky top-0 z-30 bg-[#050505]/95 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
            <div className="font-mono font-bold text-xl tracking-tighter text-white">
                CLI<span className="text-cyan-500">VERSE</span>
            </div>
            <div className="hidden md:flex items-center gap-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest border-l border-white/10 pl-6">
                <div className="flex items-center gap-2">
                    <Activity size={12} className="text-green-500" />
                    STATUS: <span className="text-white">OPERATIONAL</span>
                </div>
                <div className="flex items-center gap-2">
                    <Wifi size={12} className="text-cyan-500" />
                    NODES: <span className="text-white">{agents.length}</span>
                </div>
            </div>
        </div>

        <div className="flex gap-4">
             <button
                onClick={handleGlobalSync}
                disabled={isGlobalSyncing}
                className={`flex items-center gap-2 px-4 py-2 bg-gray-900 border border-white/10 rounded-lg text-xs font-mono transition-all hover:border-cyan-500/50 ${isGlobalSyncing ? 'animate-pulse text-cyan-400' : 'text-gray-400'}`}
             >
                 <RefreshCw size={14} className={isGlobalSyncing ? 'animate-spin' : ''} />
                 {isGlobalSyncing ? 'SYNCING...' : 'FORCE_SYNC'}
             </button>
             <button 
                onClick={() => setChatOpen(!chatOpen)}
                className={`p-2 rounded-full transition-all ${chatOpen ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'bg-gray-900 text-gray-400 hover:text-white border border-white/5'}`}
             >
                 <MessageSquare size={18} />
             </button>
        </div>
      </nav>

      <TerminalHero isScanning={isGlobalSyncing} />

      {/* Registry Tools Section */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        
        {/* Advanced Sector Controls */}
        <div className="flex flex-col gap-6 mb-12">
            <div className="flex items-center justify-between">
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-mono transition-all border ${
                                selectedCategory === cat 
                                ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
                                : 'bg-transparent border-white/5 text-gray-500 hover:text-white hover:border-white/20'
                            }`}
                        >
                            {cat.toUpperCase()}
                        </button>
                    ))}
                </div>
                <div className="text-[10px] font-mono text-gray-600 uppercase">
                    Last Global Sync: {lastGlobalSync}
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                    <input 
                        type="text" 
                        placeholder="SEARCH_REGISTRY_METADATA..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 font-mono shadow-inner transition-all"
                    />
                </div>
                
                <div className="relative min-w-[200px]">
                    <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full appearance-none bg-black/40 border border-white/10 rounded-xl pl-11 pr-8 py-3 text-sm text-gray-400 focus:outline-none focus:border-cyan-500/50 font-mono cursor-pointer"
                    >
                        <option>Stars (High-Low)</option>
                        <option>Stars (Low-High)</option>
                        <option>Name (A-Z)</option>
                        <option>Name (Z-A)</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Registry Intelligence */}
        <section className="mb-12 bg-black/40 border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <div className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.25em]">Registry Intelligence</div>
                    <h2 className="text-xl font-semibold text-white">Operational Telemetry</h2>
                </div>
                <div className="text-[10px] font-mono text-gray-600 uppercase">
                    Signal derived from {agents.length} live nodes
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_2fr] gap-6">
                <div className="space-y-4">
                    <div className="rounded-xl border border-white/10 bg-black/60 p-4">
                        <div className="text-xs font-mono text-gray-500 uppercase">Signal Integrity</div>
                        <div className="text-2xl font-bold text-cyan-400">{registryHealth.signalIntegrity}%</div>
                        <p className="text-xs text-gray-500 mt-2">
                            Composite score balancing catalog breadth and stability variance.
                        </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/60 p-4">
                        <div className="text-xs font-mono text-gray-500 uppercase">Coverage Index</div>
                        <div className="text-2xl font-bold text-cyan-400">{registryHealth.coverageIndex}%</div>
                        <p className="text-xs text-gray-500 mt-2">
                            Weighted spread of adoption across the registry surface.
                        </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/60 p-4">
                        <div className="text-xs font-mono text-gray-500 uppercase">Stars / Node</div>
                        <div className="text-2xl font-bold text-cyan-400">{averageStars.toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-2">
                            Averaged from {totalStars.toLocaleString()} total stars across all entries.
                        </p>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="rounded-xl border border-white/10 bg-black/60 p-4">
                        <div className="text-xs font-mono text-gray-500 uppercase mb-3">Registry Growth Curve</div>
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={registryTimeline} margin={{ left: -12, right: 8 }}>
                                    <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 10 }} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
                                    <Tooltip contentStyle={{ background: '#0b0b0b', border: '1px solid #1f2937', fontSize: '10px' }} />
                                    <Bar dataKey="adoptionIndex" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="reliabilityIndex" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/60 p-4">
                        <div className="text-xs font-mono text-gray-500 uppercase mb-3">Category Maturity</div>
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryStats} layout="vertical" margin={{ left: 30 }}>
                                    <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} />
                                    <YAxis type="category" dataKey="category" width={110} tick={{ fill: '#6b7280', fontSize: 10 }} />
                                    <Tooltip contentStyle={{ background: '#0b0b0b', border: '1px solid #1f2937', fontSize: '10px' }} />
                                    <Bar dataKey="maturityScore" fill="#38bdf8" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Dynamic Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {paginatedAgents.map(agent => (
                <AgentCard 
                    key={agent.id} 
                    agent={agent} 
                    onClick={setSelectedAgent} 
                    isInSquad={squad.some(s => s.id === agent.id)}
                    onToggleSquad={(a) => {
                        setSquad(prev => prev.some(s => s.id === a.id) ? prev.filter(s => s.id !== a.id) : [...prev, a]);
                    }}
                    isComparing={compareAgentA?.id === agent.id || compareAgentB?.id === agent.id}
                    onToggleCompare={(a) => {
                        if (compareAgentA?.id === a.id) setCompareAgentA(null);
                        else if (compareAgentB?.id === a.id) setCompareAgentB(null);
                        else if (!compareAgentA) setCompareAgentA(a);
                        else setCompareAgentB(a);
                    }}
                />
            ))}
        </div>

        {/* Sector Navigation (Pagination) */}
        {totalPages > 1 && (
            <div className="flex items-center justify-center gap-6 py-8 border-t border-white/5">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-white/5 bg-gray-900 text-gray-500 hover:text-white disabled:opacity-20 transition-all"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-3 font-mono text-sm">
                    <span className="text-gray-600">SECTOR</span>
                    <span className="text-cyan-400 font-bold">{currentPage}</span>
                    <span className="text-gray-800">/</span>
                    <span className="text-gray-600">{totalPages}</span>
                </div>
                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-white/5 bg-gray-900 text-gray-500 hover:text-white disabled:opacity-20 transition-all"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        )}
      </main>

      {/* Global Modals */}
      {selectedAgent && (
          <AgentDetailLayer 
            agent={selectedAgent} 
            onClose={() => setSelectedAgent(null)} 
            onCompare={(a) => { setCompareAgentA(a); setSelectedAgent(null); }}
            onAddReview={() => {}} 
          />
      )}

      {(compareAgentA || compareAgentB) && !showComparison && (
          <div className="fixed bottom-8 right-8 z-40 bg-black/90 border border-cyan-500/30 backdrop-blur-xl p-4 rounded-2xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-10">
              <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-cyan-500 uppercase">Comparison Queue</span>
                  <div className="flex items-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${compareAgentA ? 'bg-cyan-500' : 'bg-gray-800'}`}></div>
                      <div className={`w-2 h-2 rounded-full ${compareAgentB ? 'bg-cyan-500' : 'bg-gray-800'}`}></div>
                      <span className="text-xs font-mono text-white ml-2">
                        {compareAgentA?.name || '...'} vs {compareAgentB?.name || '...'}
                      </span>
                  </div>
              </div>
              <div className="flex gap-2">
                  <button 
                    onClick={() => setShowComparison(true)}
                    disabled={!compareAgentA || !compareAgentB}
                    className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 text-black px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all"
                  >
                    Analyze
                  </button>
                  <button onClick={() => { setCompareAgentA(null); setCompareAgentB(null); }} className="p-2 text-gray-500 hover:text-white"><X size={16}/></button>
              </div>
          </div>
      )}

      {showComparison && compareAgentA && (
          <ComparisonLayer 
            agentA={compareAgentA} 
            agentB={compareAgentB} 
            onClose={() => setShowComparison(false)} 
            onClear={() => { setCompareAgentA(null); setCompareAgentB(null); setShowComparison(false); }} 
          />
      )}

      {/* Persistent System Chat */}
      {chatOpen && (
          <div className="fixed bottom-24 right-8 w-96 h-[500px] bg-black border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5">
              <div className="p-4 bg-gray-900/50 border-b border-white/10 flex justify-between items-center">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 flex items-center gap-2 uppercase tracking-[0.2em]">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      Terminal_Guardian
                  </span>
                  <button onClick={() => setChatOpen(false)} className="text-gray-500 hover:text-white"><X size={14}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
                  {chatHistory.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-lg p-3 ${msg.role === 'user' ? 'bg-cyan-900/20 text-cyan-100 border border-cyan-500/20' : 'bg-gray-800/40 text-gray-300 border border-white/5'}`}>
                              {msg.text}
                          </div>
                      </div>
                  ))}
                  {chatLoading && <div className="text-cyan-600 animate-pulse">{'>'} ANALYZING DATA STREAM...</div>}
              </div>
              <form onSubmit={handleChatSubmit} className="p-3 border-t border-white/10 bg-black">
                  <input 
                    className="w-full bg-gray-900 border border-white/10 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50 font-mono"
                    placeholder="QUERY_REGISTRY..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
              </form>
          </div>
      )}
    </div>
  );
};

export default App;

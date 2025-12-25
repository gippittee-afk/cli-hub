import React, { useState, useEffect } from 'react';
import { Agent } from '../types';
import { X, Sparkles, AlertTriangle, Code, Star, Box, List, Terminal } from 'lucide-react';
import { compareAgents } from '../services/geminiService';

interface ComparisonLayerProps {
  agentA: Agent;
  agentB: Agent | null;
  onClose: () => void;
  onClear: () => void;
}

const ComparisonLayer: React.FC<ComparisonLayerProps> = ({ agentA, agentB, onClose, onClear }) => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (agentA && agentB) {
        runComparison();
    }
  }, [agentA, agentB]);

  const runComparison = async () => {
    if (!agentA || !agentB) return;
    setLoading(true);
    const res = await compareAgents(agentA, agentB);
    setResult(res);
    setLoading(false);
  };

  const renderMetricRow = (label: string, icon: React.ReactNode, valueA: React.ReactNode, valueB: React.ReactNode) => (
    <div className="grid grid-cols-3 gap-4 border-b border-gray-800 py-3 text-sm">
        <div className="flex items-center gap-2 text-gray-500 font-mono">
            {icon} {label}
        </div>
        <div className="text-white text-center">{valueA}</div>
        <div className="text-white text-center text-cyan-400 font-bold">{valueB}</div>
    </div>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0c0c0c] border-t border-cyan-500/30 shadow-[0_-5px_50px_rgba(0,0,0,0.9)] transition-transform duration-300 transform translate-y-0 max-h-[90vh] overflow-y-auto flex flex-col">
      <div className="max-w-7xl mx-auto w-full p-4 md:p-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-mono font-bold text-white flex items-center gap-2">
                <Sparkles className="text-cyan-400" size={20} />
                AGENT COMPARISON ENGINE
            </h3>
            <div className="flex gap-2">
                <button onClick={onClear} className="text-sm text-gray-500 hover:text-white px-3 py-1 font-mono uppercase">Reset</button>
                <button onClick={onClose} className="text-gray-400 hover:text-white bg-gray-900 rounded-full p-1"><X size={20}/></button>
            </div>
        </div>

        {/* Agents Header */}
        <div className="grid grid-cols-3 gap-4 mb-8">
            {/* Slot A */}
            <div className="col-span-1 bg-gray-900/50 p-4 rounded border border-gray-800 relative text-center">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0c0c0c] px-2 text-xs text-gray-500 font-mono border border-gray-800 rounded">AGENT A</div>
                <h4 className="font-bold text-xl mb-1 text-white">{agentA.name}</h4>
                <div className="text-xs text-gray-400 font-mono bg-black/50 inline-block px-2 py-1 rounded">{agentA.category}</div>
            </div>

            {/* VS */}
            <div className="col-span-1 flex flex-col items-center justify-center">
                <span className="font-black text-4xl text-gray-800 italic select-none">VS</span>
            </div>

            {/* Slot B */}
            <div className="col-span-1 bg-cyan-900/10 p-4 rounded border border-cyan-500/30 relative text-center">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0c0c0c] px-2 text-xs text-cyan-500 font-mono border border-cyan-900 rounded">AGENT B</div>
                {agentB ? (
                    <>
                        <h4 className="font-bold text-xl mb-1 text-cyan-400">{agentB.name}</h4>
                        <div className="text-xs text-cyan-500/70 font-mono bg-black/50 inline-block px-2 py-1 rounded">{agentB.category}</div>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-600 text-sm animate-pulse">
                        Select another agent...
                    </div>
                )}
            </div>
        </div>

        {/* Static Comparison Table */}
        {agentB && (
            <div className="mb-8 bg-[#0a0a0a] rounded-lg border border-gray-800 p-4">
                <h4 className="text-xs font-mono text-gray-500 uppercase mb-4 border-b border-gray-800 pb-2">Direct Metric Comparison</h4>
                
                {renderMetricRow("Language", <Code size={14}/>, agentA.language, agentB.language)}
                {renderMetricRow("Popularity", <Star size={14}/>, `${(agentA.stars/1000).toFixed(1)}k Stars`, `${(agentB.stars/1000).toFixed(1)}k Stars`)}
                {renderMetricRow("Primary Category", <Box size={14}/>, agentA.category, agentB.category)}
                
                <div className="grid grid-cols-3 gap-4 py-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-500 font-mono">
                         <List size={14}/> Top Features
                    </div>
                    <div className="text-gray-400 text-center text-xs space-y-1">
                        {agentA.features.slice(0,3).map(f => <div key={f} className="bg-gray-900 px-2 py-1 rounded">{f}</div>)}
                    </div>
                    <div className="text-cyan-400 text-center text-xs space-y-1">
                        {agentB.features.slice(0,3).map(f => <div key={f} className="bg-cyan-900/20 px-2 py-1 rounded">{f}</div>)}
                    </div>
                </div>

                 <div className="grid grid-cols-3 gap-4 py-3 text-sm border-t border-gray-800 mt-2 pt-4">
                    <div className="flex items-center gap-2 text-gray-500 font-mono">
                         <Terminal size={14}/> Install
                    </div>
                    <div className="text-gray-500 text-center font-mono text-[10px] break-all bg-black p-2 rounded">{agentA.installCommand}</div>
                    <div className="text-cyan-500/70 text-center font-mono text-[10px] break-all bg-black p-2 rounded">{agentB.installCommand}</div>
                </div>
            </div>
        )}

        {/* AI Results Area */}
        {agentA && agentB && (
            <div className="flex-1 bg-black/40 rounded border border-white/5 min-h-[200px] flex flex-col">
                <div className="bg-gray-900/50 px-4 py-2 border-b border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-mono text-cyan-500 uppercase flex items-center gap-2"><Sparkles size={12}/> Gemini 2.5 Analysis</span>
                </div>
                <div className="p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-cyan-400 font-mono text-sm animate-pulse">Consulting AI Knowledge Base...</p>
                        </div>
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none">
                            <div className="markdown-content whitespace-pre-line text-gray-300 leading-relaxed">
                            {result}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonLayer;
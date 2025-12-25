
import React from 'react';
import { Agent } from '../types';
import { Terminal, Star, Copy, Check, Plus, Minus, ArrowRightLeft, Activity } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  onClick: (agent: Agent) => void;
  isInSquad: boolean;
  onToggleSquad: (agent: Agent) => void;
  isComparing: boolean;
  onToggleCompare: (agent: Agent) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onClick, isInSquad, onToggleSquad, isComparing, onToggleCompare }) => {
  const [copied, setCopied] = React.useState(false);

  const statusColors = {
    'LIVE': 'text-green-500 bg-green-500/10 border-green-500/20',
    'SYNCING': 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20 animate-pulse',
    'UPDATE_AVAILABLE': 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.2)]',
    'OFFLINE': 'text-gray-500 bg-gray-500/10 border-gray-500/20'
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(agent.installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      onClick={() => onClick(agent)}
      className={`group relative bg-[#0a0a0a] border rounded-2xl overflow-hidden transition-all duration-500 hover:bg-[#0c0c0c] hover:scale-[1.02] cursor-pointer flex flex-col h-full ${
          isComparing ? 'border-cyan-500/50 ring-1 ring-cyan-500/20' : 'border-white/5 hover:border-white/20'
      }`}
    >
      {/* HUD Bar */}
      <div className="px-4 py-2 border-b border-white/5 flex justify-between items-center bg-black/40">
        <div className={`flex items-center gap-2 px-2 py-0.5 rounded border text-[9px] font-mono font-bold tracking-widest ${statusColors[agent.status || 'LIVE']}`}>
          <Activity size={10} />
          {agent.status || 'LIVE'}
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-gray-500">
           <Star size={12} className="text-yellow-500/80" />
           {agent.stars.toLocaleString()}
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-gray-900 rounded-xl border border-white/5 group-hover:border-cyan-500/30 transition-all duration-500">
                <Terminal className="text-gray-500 group-hover:text-cyan-400" size={24} />
            </div>
            <div className="flex gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleCompare(agent); }}
                  className={`p-2 rounded-lg border transition-all ${isComparing ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-gray-900 border-white/5 text-gray-600 hover:text-white'}`}
                >
                    <ArrowRightLeft size={16} />
                </button>
            </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors font-mono tracking-tight">
          {agent.name}
        </h3>
        <p className="text-gray-500 text-xs font-mono mb-4 uppercase tracking-tighter">{agent.category}</p>
        
        <p className="text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed">
          {agent.description}
        </p>

        <div className="flex flex-wrap gap-2 mt-auto mb-6">
          {agent.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-1 bg-white/5 border border-white/5 rounded text-gray-500">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3">
            <button 
              onClick={handleCopy}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  copied 
                  ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                  : 'bg-white text-black border-transparent hover:bg-cyan-400'
              }`}
            >
               {copied ? <Check size={14}/> : <span className="font-mono">$</span>}
               {copied ? 'COPIED' : 'RUN_INIT'}
            </button>
        </div>
      </div>

      {/* Decorative scanline */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent transform -translate-y-full group-hover:translate-y-[400px] transition-transform duration-[2s] ease-linear"></div>
    </div>
  );
};

export default AgentCard;

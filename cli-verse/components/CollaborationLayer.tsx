import React, { useState } from 'react';
import { Agent } from '../types';
import { X, Users, Play, AlertCircle, Bot, MessageSquare } from 'lucide-react';
import { simulateCollaboration } from '../services/geminiService';

interface CollaborationLayerProps {
  squad: Agent[];
  onClose: () => void;
  onRemoveFromSquad: (agent: Agent) => void;
}

const CollaborationLayer: React.FC<CollaborationLayerProps> = ({ squad, onClose, onRemoveFromSquad }) => {
  const [mission, setMission] = useState('');
  const [simulation, setSimulation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRunSimulation = async () => {
    if (!mission.trim()) return;
    setLoading(true);
    const result = await simulateCollaboration(squad, mission);
    setSimulation(result);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#050505]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 bg-[#0a0a0a] flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="bg-purple-900/20 p-2 rounded-lg border border-purple-500/30">
                    <Users className="text-purple-400" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">MISSION CONTROL</h2>
                    <p className="text-xs text-gray-400 font-mono">MULTI-AGENT COLLABORATION PROTOCOL</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-500 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
            {/* Sidebar: Squad Roster */}
            <div className="w-80 border-r border-gray-800 bg-[#080808] p-6 overflow-y-auto">
                <h3 className="text-xs font-mono text-gray-500 uppercase mb-4 flex items-center justify-between">
                    Active Squad 
                    <span className="bg-gray-800 text-white px-2 py-0.5 rounded-full">{squad.length}</span>
                </h3>
                
                <div className="space-y-3">
                    {squad.map(agent => (
                        <div key={agent.id} className="group relative bg-[#111] border border-gray-800 p-3 rounded-lg hover:border-purple-500/30 transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-sm text-white">{agent.name}</span>
                                <button 
                                    onClick={() => onRemoveFromSquad(agent)}
                                    className="text-gray-600 hover:text-red-400 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                            <div className="text-[10px] text-gray-500 font-mono bg-black inline-block px-1.5 py-0.5 rounded border border-gray-900">
                                {agent.category}
                            </div>
                        </div>
                    ))}
                    {squad.length === 0 && (
                        <div className="text-sm text-gray-600 italic text-center py-10 border border-dashed border-gray-800 rounded-lg">
                            No agents recruited.
                            <br/>
                            Add agents from the registry.
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content: Mission & Simulation */}
            <div className="flex-1 flex flex-col bg-[#0c0c0c]">
                {/* Mission Input */}
                <div className="p-6 border-b border-gray-800 bg-[#0a0a0a]">
                    <label className="block text-xs font-mono text-gray-500 mb-2 uppercase">Mission Objective</label>
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <textarea
                                className="w-full bg-[#050505] border border-gray-800 rounded-lg p-4 text-sm text-white focus:border-purple-500/50 outline-none h-24 resize-none font-mono"
                                placeholder="Describe the task for the squad (e.g., 'Build a full-stack todo app with Python backend and React frontend')"
                                value={mission}
                                onChange={(e) => setMission(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={handleRunSimulation}
                            disabled={loading || squad.length < 1 || !mission.trim()}
                            className="w-32 flex flex-col items-center justify-center bg-purple-900/20 hover:bg-purple-900/40 border border-purple-500/30 hover:border-purple-500 text-purple-400 hover:text-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin mb-2" />
                            ) : (
                                <Play size={24} className="mb-2" />
                            )}
                            <span className="text-xs font-bold uppercase">Execute</span>
                        </button>
                    </div>
                </div>

                {/* Simulation Output */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {simulation ? (
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center gap-2 mb-6 text-purple-400 text-sm font-mono uppercase tracking-wider">
                                <MessageSquare size={16} /> Live Transcript
                            </div>
                            <div className="prose prose-invert prose-sm max-w-none space-y-6">
                                <div className="markdown-content whitespace-pre-wrap leading-relaxed text-gray-300">
                                    {simulation}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
                            <Bot size={48} className="opacity-20" />
                            <p className="text-sm font-mono">Waiting for mission parameters...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default CollaborationLayer;
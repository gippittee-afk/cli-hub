import React, { useState } from 'react';
import { Terminal, ArrowRight, Copy, Check, X, Sparkles } from 'lucide-react';
import { generateShellCommand } from '../services/geminiService';

interface CommandGeneratorProps {
  onClose: () => void;
}

const CommandGenerator: React.FC<CommandGeneratorProps> = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setLoading(true);
    const result = await generateShellCommand(input);
    setOutput(result);
    setLoading(false);
  };

  const handleCopy = () => {
    // Extract code from markdown block if present, otherwise copy whole text
    const codeMatch = output.match(/```(?:bash|zsh|sh)?\n([\s\S]*?)\n```/);
    const textToCopy = codeMatch ? codeMatch[1] : output;
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl bg-[#0c0c0c] border border-cyan-500/30 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
            <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold">
                <Terminal size={18} />
                <span>SHELL_GEN.EXE</span>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                <X size={18} />
            </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
            <div>
                <label className="block text-xs font-mono text-gray-500 mb-2 uppercase">Natural Language Input</label>
                <form onSubmit={handleGenerate} className="relative">
                    <input 
                        className="w-full bg-[#111] border border-gray-800 rounded-lg pl-4 pr-12 py-3 text-sm text-white focus:border-cyan-500 outline-none transition-all shadow-inner font-mono"
                        placeholder="e.g. Find all PDF files modified in the last 7 days..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        autoFocus
                    />
                    <button 
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cyan-900/50 hover:bg-cyan-500 text-cyan-400 hover:text-black rounded transition-all disabled:opacity-50 disabled:hover:bg-cyan-900/50 disabled:hover:text-cyan-400"
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"/> : <ArrowRight size={16} />}
                    </button>
                </form>
            </div>

            {/* Output Display */}
            <div className="relative group">
                <div className="absolute -top-3 left-3 bg-[#0c0c0c] px-2 text-xs text-gray-500 font-mono">GENERATED OUTPUT</div>
                <div className="bg-[#050505] border border-gray-800 rounded-lg p-4 min-h-[120px] font-mono text-sm text-green-500/90 whitespace-pre-wrap">
                    {loading ? (
                        <div className="flex items-center gap-2 text-gray-600 animate-pulse">
                            <Sparkles size={14} />
                            <span>Translating to shell script...</span>
                        </div>
                    ) : output ? (
                        <div className="markdown-content">{output}</div>
                    ) : (
                        <span className="text-gray-700 select-none">Waiting for input...</span>
                    )}
                </div>
                
                {output && !loading && (
                    <button 
                        onClick={handleCopy}
                        className="absolute top-2 right-2 p-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                        title="Copy Command"
                    >
                        {copied ? <Check size={14} className="text-green-500"/> : <Copy size={14}/>}
                    </button>
                )}
            </div>
        </div>
        
        {/* Footer */}
        <div className="p-3 bg-gray-900/30 border-t border-gray-800 text-[10px] text-gray-500 font-mono flex justify-between">
            <span>POWERED BY GEMINI 2.5</span>
            <span>USE WITH CAUTION</span>
        </div>
      </div>
    </div>
  );
};

export default CommandGenerator;
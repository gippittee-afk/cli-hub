import React, { useState, useEffect } from 'react';
import { Terminal, Cpu, ShieldCheck, Wifi } from 'lucide-react';

interface TerminalHeroProps {
  isScanning?: boolean;
}

const TerminalHero: React.FC<TerminalHeroProps> = ({ isScanning = false }) => {
  const [text, setText] = useState('');
  const fullText = "> INITIALIZING REGISTRY KERNEL...\n> ESTABLISHING SECURE UPLINK...\n> CONNECTING TO GLOBAL AI INDEX...\n> FEED ONLINE.";

  useEffect(() => {
    let i = 0;
    setText(''); // Reset on mount
    const interval = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 35);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden border-b border-white/10 bg-black">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-40"></div>
      
      {/* Radial Gradient */}
      <div className="absolute inset-0 bg-radial-at-center from-cyan-900/20 to-transparent"></div>

      <div className="relative z-10 max-w-4xl w-full px-6 flex flex-col md:flex-row gap-8 items-center">
        
        {/* Left: Text Content */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-900/30 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              System v2.5
            </div>
            {isScanning && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/30 border border-green-500/30 text-green-400 text-xs font-mono uppercase tracking-wider animate-pulse">
                <Wifi size={12} />
                SCANNING FEED...
              </div>
            )}
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-500">
            CLI-VERSE
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-lg">
            The live, self-updating registry for the next generation of <span className="text-cyan-400">Autonomous Coding Agents</span>.
          </p>

          <div className="flex gap-4 pt-4">
             <div className="flex items-center gap-2 text-sm text-gray-500 font-mono">
                <Cpu size={16} />
                <span>Gemini Powered</span>
             </div>
             <div className="flex items-center gap-2 text-sm text-gray-500 font-mono">
                <ShieldCheck size={16} />
                <span>Verified Tools</span>
             </div>
          </div>
        </div>

        {/* Right: Terminal Visual */}
        <div className="flex-1 w-full max-w-md">
            <div className="bg-[#0c0c0c] border border-gray-800 rounded-lg shadow-2xl overflow-hidden font-mono text-xs md:text-sm relative">
                <div className="bg-gray-900/50 px-4 py-2 border-b border-gray-800 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                    <span className="ml-2 text-gray-500">root@cli-verse:~</span>
                </div>
                <div className="p-4 h-64 text-green-500/90 whitespace-pre-wrap leading-relaxed">
                    {text}
                    {isScanning && <span className="block mt-2 text-cyan-400">{'>'} DETECTING NEW PROTOCOLS...</span>}
                    <span className="animate-pulse">_</span>
                </div>
                {/* Scanline overlay */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/5 to-transparent h-4 w-full animate-scanline opacity-30"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalHero;

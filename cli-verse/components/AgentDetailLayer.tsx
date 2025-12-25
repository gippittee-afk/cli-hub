import React, { useState } from 'react';
import { Agent, Review } from '../types';
import { X, Copy, Check, Cpu, Github, ExternalLink, Zap, Star, MessageCircle, Code, Shield, Twitter, Linkedin } from 'lucide-react';
import { analyzeAgent } from '../services/geminiService';
import SimpleTooltip from './SimpleTooltip';
import { TAG_DESCRIPTIONS } from '../constants';

interface AgentDetailLayerProps {
  agent: Agent | null;
  onClose: () => void;
  onCompare: (agent: Agent) => void;
  onAddReview: (agentId: string, review: Omit<Review, 'id' | 'date'>) => void;
}

const AgentDetailLayer: React.FC<AgentDetailLayerProps> = ({ agent, onClose, onCompare, onAddReview }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewUser, setReviewUser] = useState('');
  const [formVisible, setFormVisible] = useState(false);

  if (!agent) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(agent.installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAnalysis = async () => {
    setLoading(true);
    const result = await analyzeAgent(agent);
    setAnalysis(result);
    setLoading(false);
  };

  const handleShare = (platform: 'twitter' | 'linkedin') => {
    const text = `Check out ${agent.name}: ${agent.description} #CLIVerse`;
    const url = window.location.href; 
    
    let shareUrl = '';
    if (platform === 'twitter') {
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    } else {
        shareUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text + ' ' + url)}`;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
      e.preventDefault();
      if (reviewUser.trim() && reviewComment.trim()) {
          onAddReview(agent.id, {
              user: reviewUser,
              rating: reviewRating,
              comment: reviewComment
          });
          setReviewUser('');
          setReviewComment('');
          setFormVisible(false);
      }
  };

  const avgRating = agent.reviews.length > 0 
    ? (agent.reviews.reduce((acc, r) => acc + r.rating, 0) / agent.reviews.length).toFixed(1)
    : 'N/A';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-5xl glass-panel rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#111]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-900/20 rounded-xl border border-cyan-500/20">
               <Cpu className="text-cyan-400" size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{agent.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                 <span className="text-cyan-500 font-mono text-sm">{agent.category}</span>
                 <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                 <span className="text-gray-400 text-sm flex items-center gap-1">
                    <Star size={12} className="text-yellow-500 fill-yellow-500"/> {avgRating} Rating
                 </span>
                 <div className="flex gap-1 ml-2">
                    {agent.tags.map(tag => (
                        <SimpleTooltip key={tag} content={TAG_DESCRIPTIONS[tag] || tag}>
                             <span className="text-[10px] bg-gray-900 border border-gray-700 text-gray-400 px-1.5 py-0.5 rounded cursor-help">#{tag}</span>
                        </SimpleTooltip>
                    ))}
                 </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
              <button 
                onClick={() => handleShare('twitter')} 
                className="p-2 hover:bg-cyan-900/30 rounded-full transition-colors text-gray-400 hover:text-cyan-400" 
                title="Share on Twitter"
              >
                <Twitter size={20} />
              </button>
              <button 
                onClick={() => handleShare('linkedin')} 
                className="p-2 hover:bg-blue-900/30 rounded-full transition-colors text-gray-400 hover:text-blue-400" 
                title="Share on LinkedIn"
              >
                <Linkedin size={20} />
              </button>
              <div className="h-6 w-[1px] bg-gray-800 mx-2"></div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                <X size={24} />
              </button>
          </div>
        </div>

        {/* Two-Column Layout for Content */}
        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
            
            {/* Left Column: Details */}
            <div className="flex-1 p-6 space-y-8 bg-[#0a0a0a] border-r border-gray-800">
                
                {/* Description */}
                <div>
                    <h3 className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-2">
                        <Shield size={14}/> Mission Profile
                    </h3>
                    <p className="text-gray-200 leading-relaxed text-lg">{agent.longDescription}</p>
                </div>

                {/* Technical Specs */}
                <div className="grid grid-cols-2 gap-4">
                     <div className="bg-gray-900/30 p-3 rounded border border-gray-800">
                         <span className="text-xs text-gray-500 block mb-1">Language</span>
                         <div className="text-cyan-400 font-mono flex items-center gap-2">
                            <Code size={14}/> {agent.language}
                         </div>
                     </div>
                     <div className="bg-gray-900/30 p-3 rounded border border-gray-800">
                         <span className="text-xs text-gray-500 block mb-1">GitHub Stars</span>
                         <div className="text-yellow-500 font-mono flex items-center gap-2">
                            <Star size={14}/> {(agent.stars / 1000).toFixed(1)}k
                         </div>
                     </div>
                </div>

                {/* Tactical Usage (Use Cases) */}
                <div>
                     <h3 className="text-xs font-mono text-gray-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                        <Zap size={14}/> Tactical Usage
                     </h3>
                     <ul className="space-y-2">
                        {agent.useCases.map((useCase, idx) => (
                            <li key={idx} className="flex gap-3 text-sm text-gray-300">
                                <span className="text-cyan-500 font-bold">0{idx + 1}.</span>
                                {useCase}
                            </li>
                        ))}
                     </ul>
                </div>

                {/* Install Command */}
                <div>
                    <h3 className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-wider">Installation</h3>
                    <div className="bg-[#050505] border border-gray-800 rounded-lg p-4 font-mono text-sm group relative">
                        <div className="absolute top-2 right-2 flex gap-2">
                            <button onClick={handleCopy} className="p-1 hover:bg-gray-800 rounded text-gray-500 hover:text-white transition-colors">
                                {copied ? <Check size={16} className="text-green-500"/> : <Copy size={16}/>}
                            </button>
                        </div>
                        <span className="text-cyan-500 select-none">$ </span>
                        <span className="text-gray-300">{agent.installCommand}</span>
                    </div>
                </div>

                 {/* AI Analysis Section */}
                <div className="border-t border-gray-800 pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                            <Zap size={14} /> Gemini Deep Analysis
                        </h3>
                        {!analysis && !loading && (
                            <button 
                                onClick={handleAnalysis}
                                className="text-[10px] uppercase bg-cyan-900/30 text-cyan-400 px-3 py-1.5 rounded hover:bg-cyan-900/50 transition-colors border border-cyan-500/30"
                            >
                                Generate Intel
                            </button>
                        )}
                    </div>
                    
                    {loading && (
                        <div className="flex items-center gap-2 text-gray-500 text-sm animate-pulse">
                            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></span>
                            Analyzing repository patterns...
                        </div>
                    )}

                    {analysis && (
                        <div className="bg-cyan-900/10 p-4 rounded-lg border border-cyan-500/20 text-sm text-gray-300 leading-relaxed markdown-content whitespace-pre-line shadow-[inset_0_0_20px_rgba(34,211,238,0.05)]">
                            {analysis}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Reviews */}
            <div className="lg:w-1/3 bg-[#0f0f0f] flex flex-col">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-[#0f0f0f] z-10">
                    <h3 className="font-mono text-sm text-gray-400 flex items-center gap-2">
                        <MessageCircle size={16} /> COMMUNITY FEED
                    </h3>
                    <button 
                        onClick={() => setFormVisible(!formVisible)}
                        className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded transition-colors"
                    >
                        {formVisible ? 'Cancel' : 'Add Review'}
                    </button>
                </div>

                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                    {/* Review Form */}
                    {formVisible && (
                        <form onSubmit={handleSubmitReview} className="bg-gray-900 p-4 rounded-lg border border-gray-800 mb-6 animate-pulse-fast-once">
                            <h4 className="text-white text-sm font-bold mb-3">Submit Log</h4>
                            <div className="space-y-3">
                                <input 
                                    className="w-full bg-black border border-gray-800 rounded p-2 text-sm text-white focus:border-cyan-500 outline-none"
                                    placeholder="Operative Name"
                                    value={reviewUser}
                                    onChange={e => setReviewUser(e.target.value)}
                                    required
                                />
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button 
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewRating(star)}
                                            className={`${reviewRating >= star ? 'text-yellow-500' : 'text-gray-700'} hover:text-yellow-400 transition-colors`}
                                        >
                                            <Star size={16} fill={reviewRating >= star ? "currentColor" : "none"}/>
                                        </button>
                                    ))}
                                </div>
                                <textarea 
                                    className="w-full bg-black border border-gray-800 rounded p-2 text-sm text-white focus:border-cyan-500 outline-none h-20"
                                    placeholder="Transmission content..."
                                    value={reviewComment}
                                    onChange={e => setReviewComment(e.target.value)}
                                    required
                                />
                                <button type="submit" className="w-full bg-cyan-900/50 text-cyan-400 py-2 rounded text-sm hover:bg-cyan-900/80 transition-colors border border-cyan-500/30">
                                    Transmit
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Review List */}
                    {agent.reviews.length === 0 ? (
                        <div className="text-center text-gray-600 text-sm py-10 italic">
                            No transmissions received yet.
                        </div>
                    ) : (
                        agent.reviews.slice().reverse().map(review => (
                            <div key={review.id} className="relative pl-4 border-l-2 border-gray-800 pb-2">
                                <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-gray-800 border border-black"></div>
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-cyan-500 font-mono text-xs">{review.user}</span>
                                    <span className="text-gray-600 text-[10px]">{review.date}</span>
                                </div>
                                <div className="flex text-yellow-500 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-800"} />
                                    ))}
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed">"{review.comment}"</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-800 bg-[#111] flex gap-4">
            <a 
                href={agent.repoUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
                <Github size={18} />
                Access Repository
            </a>
            <button 
                onClick={() => onCompare(agent)}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-lg font-medium transition-colors shadow-[0_0_15px_rgba(8,145,178,0.4)]"
            >
                Add to Comparison
            </button>
        </div>

      </div>
    </div>
  );
};

export default AgentDetailLayer;
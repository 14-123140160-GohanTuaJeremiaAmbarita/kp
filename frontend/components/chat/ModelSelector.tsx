import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronDown, Brain, Zap, Layers, Star, Coins, Users } from 'lucide-react';

export interface ModelItem {
  id: string;
  name: string;
  desc: string;
  icon: string;
  group: 'Mandatory Frontier' | 'Cost-Efficient Hemat' | 'Community Gratis';
  cost: 'Free' | 'Low' | 'Standard' | 'Premium';
  details: string;
}

export const MODEL_WHITELIST: ModelItem[] = [
  // ═══ A. PREMIUM FRONTIER (Tested & Working) ═══
  { id: 'deepseek-ai/DeepSeek-V3.1', name: 'SF: DeepSeek V3', desc: 'SiliconFlow (Top Tier)', icon: '🧠', group: 'Mandatory Frontier', cost: 'Premium', details: 'High performance frontier model. ✅ Tested.' },
  { id: 'deepseek-ai/DeepSeek-V4-Flash', name: 'SF: DeepSeek V4 Flash', desc: 'SiliconFlow (Fast)', icon: '⚡', group: 'Mandatory Frontier', cost: 'Standard', details: 'Fast, efficient standard model. ✅ Tested.' },
  { id: 'deepseek-ai/DeepSeek-V4-Pro', name: 'SF: DeepSeek V4 Pro', desc: 'SiliconFlow (Reasoning)', icon: '🧠', group: 'Mandatory Frontier', cost: 'Premium', details: 'Deep reasoning trace. ✅ Tested.' },
  { id: 'gpt-4o', name: 'GH: GPT-4o', desc: 'GitHub Models', icon: '🌌', group: 'Mandatory Frontier', cost: 'Premium', details: 'OpenAI flagship via GitHub. ✅ Tested (5s).' },
  
  // Cloudflare AI Gateway — Google Gemini (Working)
  { id: 'google-ai-studio/gemini-3.5-flash', name: 'CF: Gemini 3.5 Flash', desc: 'Cloudflare Gateway', icon: '🚀', group: 'Mandatory Frontier', cost: 'Premium', details: 'Google next-gen Flash. ✅ Tested (4s).' },
  { id: 'google-ai-studio/gemini-3.1-pro-preview', name: 'CF: Gemini 3.1 Pro', desc: 'Cloudflare Gateway', icon: '🌟', group: 'Mandatory Frontier', cost: 'Premium', details: 'Google flagship preview. ⚠️ Rate limited.' },
  { id: 'google-ai-studio/gemini-2.5-flash', name: 'CF: Gemini 2.5 Flash', desc: 'Cloudflare Gateway', icon: '⚡', group: 'Mandatory Frontier', cost: 'Low', details: 'Google balanced fast model. ✅ Tested (3.6s).' },
  
  // Cloudflare AI Gateway — Anthropic (Requires Credits)
  { id: 'anthropic/claude-sonnet-4-6', name: 'CF: Claude Sonnet 4.6', desc: 'Cloudflare Gateway', icon: '🎨', group: 'Mandatory Frontier', cost: 'Premium', details: 'Anthropic balanced. 💳 Butuh saldo Anthropic.' },
  { id: 'anthropic/claude-opus-4-6', name: 'CF: Claude Opus 4.6', desc: 'Cloudflare Gateway', icon: '🎭', group: 'Mandatory Frontier', cost: 'Premium', details: 'Anthropic flagship. 💳 Butuh saldo Anthropic.' },

  // Cloudflare AI Gateway — OpenAI (Requires Credits)
  { id: 'openai/gpt-4.0', name: 'CF: GPT-4.0', desc: 'Cloudflare Gateway', icon: '🌌', group: 'Mandatory Frontier', cost: 'Premium', details: 'OpenAI top-tier. 💳 Butuh saldo OpenAI.' },
  { id: 'openai/gpt-4.5', name: 'CF: GPT-4.5', desc: 'Cloudflare Gateway', icon: '🌟', group: 'Mandatory Frontier', cost: 'Premium', details: 'OpenAI next-gen. 💳 Butuh saldo OpenAI.' },
  { id: 'openai/gpt-5.0', name: 'CF: GPT-5.0', desc: 'Cloudflare Gateway', icon: '🚀', group: 'Mandatory Frontier', cost: 'Premium', details: 'OpenAI future flagship. 💳 Butuh saldo OpenAI.' },

  // ═══ B. COMMUNITY / FREE (Tested & Working) ═══
  { id: 'Qwen/Qwen2.5-7B-Instruct', name: 'SF: Qwen 2.5 7B', desc: 'SiliconFlow', icon: '🍃', group: 'Community Gratis', cost: 'Free', details: 'Free tier on SiliconFlow.' },
  { id: 'meta-llama/Meta-Llama-3-8B-Instruct', name: 'SF: Llama 3 8B', desc: 'SiliconFlow', icon: '🦙', group: 'Community Gratis', cost: 'Free', details: 'Free tier on SiliconFlow.' },
  { id: 'Mistral 7B', name: 'CF: Mistral 7B', desc: 'Cloudflare Workers AI', icon: '🌬️', group: 'Community Gratis', cost: 'Free', details: 'Lightweight Mistral on Workers AI.' },
  { id: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b', name: 'CF: DeepSeek R1 Distill', desc: 'Cloudflare Workers AI', icon: '🧠', group: 'Community Gratis', cost: 'Free', details: 'Reasoning model distilled from R1.' },
  { id: 'microsoft-phi-3.5-moe-instruct', name: 'GH: Phi 3.5 MoE', desc: 'GitHub Models', icon: '🧩', group: 'Community Gratis', cost: 'Free', details: 'Microsoft small efficient MoE.' },
  { id: 'google-ai-studio/gemma-3-27b-it', name: 'CF: Gemma 3 27B', desc: 'Cloudflare Gateway', icon: '💎', group: 'Community Gratis', cost: 'Free', details: 'Google open weights 27B.' },
  { id: 'google-ai-studio/gemma-3-12b-it', name: 'CF: Gemma 3 12B', desc: 'Cloudflare Gateway', icon: '💫', group: 'Community Gratis', cost: 'Free', details: 'Lightweight Google open weights.' },
  { id: 'groq/llama-3.3-70b-versatile', name: 'CF: Llama 3.3 70B (Groq)', desc: 'Cloudflare Gateway', icon: '🐎', group: 'Community Gratis', cost: 'Free', details: 'Ultra-fast Groq execution.' }
];

interface ModelSelectorProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  theme?: 'light' | 'dark';
}

export default function ModelSelector({ selectedModel, setSelectedModel, theme }: ModelSelectorProps) {
  const isDark = theme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeModel = MODEL_WHITELIST.find((m) => m.id === selectedModel) || MODEL_WHITELIST[1]; // default to V4 Flash

  const getCostBadgeStyles = (cost: string) => {
    switch (cost) {
      case 'Free':
        return 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20';
      case 'Low':
        return 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20';
      case 'Standard':
        return 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20';
      case 'Premium':
        return 'bg-purple-500/10 text-purple-500 dark:text-purple-400 border border-purple-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20';
    }
  };

  const getGroupIcon = (group: string) => {
    switch (group) {
      case 'Mandatory Frontier': return <Star className="w-3.5 h-3.5 text-amber-500" />;
      case 'Cost-Efficient Hemat': return <Coins className="w-3.5 h-3.5 text-blue-500" />;
      case 'Community Gratis': return <Users className="w-3.5 h-3.5 text-emerald-500" />;
      default: return null;
    }
  };

  // Group models
  const groupedModels = MODEL_WHITELIST.reduce((acc, model) => {
    if (!acc[model.group]) acc[model.group] = [];
    acc[model.group].push(model);
    return acc;
  }, {} as Record<string, ModelItem[]>);

  const groupOrder = ['Mandatory Frontier', 'Cost-Efficient Hemat', 'Community Gratis'];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-xl border shadow-sm transition-all duration-300 w-64 ${
          isDark 
            ? 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-200' 
            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
        }`}
      >
        <div className="flex-1 flex flex-col items-start truncate">
          <div className="flex items-center space-x-1.5 w-full">
            <span className="text-sm">{activeModel.icon}</span>
            <span className="font-semibold text-xs tracking-tight truncate flex-1">{activeModel.name}</span>
          </div>
          <span className={`text-[10px] font-mono mt-0.5 truncate w-full flex items-center space-x-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span>{activeModel.desc}</span>
            <span className="opacity-50">•</span>
            <span className={getCostBadgeStyles(activeModel.cost) + ' px-1 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider'}>
              {activeModel.cost}
            </span>
          </span>
        </div>
        <div className={`p-1 rounded-md transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <ChevronDown className={`h-3 w-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
        </div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`absolute bottom-full mb-2 left-0 w-80 rounded-2xl border shadow-2xl overflow-hidden z-50 ${
              isDark 
                ? 'bg-slate-900/95 border-slate-800 backdrop-blur-xl shadow-black/50' 
                : 'bg-white/95 border-slate-200 backdrop-blur-xl shadow-slate-300/50'
            }`}
          >
            <div className={`p-3 border-b ${isDark ? 'border-slate-800/50' : 'border-slate-100'}`}>
              <h3 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Pilih Model AI
              </h3>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden custom-scrollbar">
              <div className="p-2 space-y-4">
                {groupOrder.map(groupName => (
                  <div key={groupName} className="space-y-1.5">
                    <div className={`flex items-center space-x-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {getGroupIcon(groupName)}
                      <span>{groupName}</span>
                    </div>
                    {groupedModels[groupName]?.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-start space-x-3 p-2.5 rounded-xl transition-all cursor-pointer ${
                          selectedModel === model.id
                            ? (isDark 
                                ? 'bg-blue-600/10 border border-blue-500/20' 
                                : 'bg-blue-50 border border-blue-200')
                            : (isDark 
                                ? 'border border-transparent hover:bg-slate-800/60' 
                                : 'border border-transparent hover:bg-slate-50')
                        }`}
                      >
                        <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border shadow-sm ${
                          selectedModel === model.id
                            ? (isDark ? 'bg-blue-600/20 border-blue-500/30' : 'bg-blue-100 border-blue-200')
                            : (isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200')
                        }`}>
                          <span className="text-xs">{model.icon}</span>
                        </div>
                        
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between w-full">
                            <span className={`text-sm font-semibold tracking-tight ${
                              selectedModel === model.id
                                ? (isDark ? 'text-blue-400' : 'text-blue-700')
                                : (isDark ? 'text-slate-200' : 'text-slate-800')
                            }`}>
                              {model.name}
                            </span>
                            {selectedModel === model.id && (
                              <Check className={`h-3.5 w-3.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                            )}
                          </div>
                          
                          <div className={`text-[10px] font-mono leading-relaxed mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {model.desc}
                          </div>
                          <div className="mt-1 flex items-center space-x-2">
                            <span className={getCostBadgeStyles(model.cost) + ' px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest'}>
                              {model.cost}
                            </span>
                            <span className={`text-[10px] italic ${isDark ? 'text-slate-500' : 'text-slate-400'} truncate block max-w-[150px]`}>
                              {model.details}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

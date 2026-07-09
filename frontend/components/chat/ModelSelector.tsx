import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronDown, Brain, Zap, Layers, Star, Coins, Users } from 'lucide-react';

export interface ModelItem {
  id: string;
  name: string;
  desc: string;
  icon: string;
  group: 'Global Frontier' | 'Mandatory Frontier' | 'Cost-Efficient Hemat' | 'Community Gratis';
  cost: 'Free' | 'Low' | 'Standard' | 'Premium';
  details: string;
}

export const MODEL_WHITELIST: ModelItem[] = [
  // Global Frontier (OpenRouter / Multiple Providers)
  { id: 'openai/gpt-4o', name: 'GPT-4o', desc: 'OpenAI · Frontier', icon: '🧠', group: 'Global Frontier', cost: 'Premium', details: 'Sangat cerdas dan cepat.' },
  { id: 'google/gemini-1.5-pro', name: 'Gemini 1.5 Pro', desc: 'Google · Frontier', icon: '✨', group: 'Global Frontier', cost: 'Premium', details: 'Konteks sangat panjang.' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', desc: 'Anthropic · Frontier', icon: '🔶', group: 'Global Frontier', cost: 'Premium', details: 'Sangat pintar untuk coding/analisis.' },
  
  // Model IDs verified against GET https://api.siliconflow.com/v1/models?type=text.
  { id: 'Qwen/Qwen3-30B-A3B-Instruct-2507', name: 'Qwen3 30B Instruct', desc: 'SiliconFlow · Default SQL', icon: '⚙️', group: 'Mandatory Frontier', cost: 'Low', details: 'Default; JSON mode telah diuji.' },
  { id: 'deepseek-ai/DeepSeek-V4-Flash', name: 'DeepSeek V4 Flash', desc: 'SiliconFlow · Cepat', icon: '⚡', group: 'Mandatory Frontier', cost: 'Standard', details: 'JSON mode telah diuji.' },
  { id: 'deepseek-ai/DeepSeek-V4-Pro', name: 'DeepSeek V4 Pro', desc: 'SiliconFlow · Akurasi', icon: '🧠', group: 'Mandatory Frontier', cost: 'Premium', details: 'Model frontier untuk tugas kompleks.' },
  { id: 'deepseek-ai/DeepSeek-V3.2', name: 'DeepSeek V3.2', desc: 'SiliconFlow · General', icon: '🔷', group: 'Mandatory Frontier', cost: 'Standard', details: 'Konteks panjang dan tool support.' },
  { id: 'Qwen/Qwen3.5-122B-A10B', name: 'Qwen3.5 122B', desc: 'SiliconFlow · Frontier', icon: '🌟', group: 'Mandatory Frontier', cost: 'Premium', details: 'Model besar untuk analisis kompleks.' },
  { id: 'zai-org/GLM-5', name: 'GLM-5', desc: 'SiliconFlow · Frontier', icon: '🛰️', group: 'Mandatory Frontier', cost: 'Premium', details: 'Model general-purpose terbaru.' },

  { id: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen2.5 72B', desc: 'SiliconFlow · Structured', icon: '📐', group: 'Cost-Efficient Hemat', cost: 'Standard', details: 'JSON mode telah diuji.' },
  { id: 'Qwen/Qwen3.5-35B-A3B', name: 'Qwen3.5 35B A3B', desc: 'SiliconFlow · Efisien', icon: '🚀', group: 'Cost-Efficient Hemat', cost: 'Low', details: 'MoE efisien untuk chat dan SQL.' },
  { id: 'stepfun-ai/Step-3.5-Flash', name: 'Step 3.5 Flash', desc: 'SiliconFlow · Cepat', icon: '🏎️', group: 'Cost-Efficient Hemat', cost: 'Low', details: 'Respons cepat untuk percakapan.' },
  { id: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B', desc: 'SiliconFlow · Ringan', icon: '🧩', group: 'Cost-Efficient Hemat', cost: 'Low', details: 'Model open-weight ringan.' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', desc: 'OpenAI · Hemat', icon: '⚡', group: 'Cost-Efficient Hemat', cost: 'Low', details: 'Cepat dan sangat pintar.' },
  { id: 'google/gemini-1.5-flash', name: 'Gemini 1.5 Flash', desc: 'Google · Hemat', icon: '⚡', group: 'Cost-Efficient Hemat', cost: 'Low', details: 'Cepat dengan konteks panjang.' },

  { id: 'Qwen/Qwen2.5-7B-Instruct', name: 'Qwen2.5 7B', desc: 'SiliconFlow · Hemat', icon: '🍃', group: 'Community Gratis', cost: 'Free', details: 'Model ringan; akurasi SQL lebih terbatas.' },
  { id: 'Qwen/Qwen3-8B', name: 'Qwen3 8B', desc: 'SiliconFlow · Hemat', icon: '🌱', group: 'Community Gratis', cost: 'Free', details: 'Cocok untuk chat sederhana.' }
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

  const activeModel = MODEL_WHITELIST.find((m) => m.id === selectedModel) || MODEL_WHITELIST[0];

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
      case 'Global Frontier': return <Brain className="w-3.5 h-3.5 text-purple-500" />;
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

  const groupOrder = ['Global Frontier', 'Mandatory Frontier', 'Cost-Efficient Hemat', 'Community Gratis'];

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

import React from 'react';

export const MODEL_WHITELIST = [
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', desc: 'Fast & Default', icon: '✨' },
  { id: 'deepseek-v4-flash', name: 'DeepSeek v4 Flash', desc: 'Efficient SQL', icon: '⚡' },
  { id: 'deepseek-v4-pro', name: 'DeepSeek v4 Pro', desc: 'Deep Reasoning', icon: '🧠' },
  { id: 'openai', name: 'OpenAI', desc: 'Highly Versatile', icon: '🚀' },
  { id: 'claude', name: 'Claude', desc: 'Smart Analysis', icon: '🎭' },
];

interface ModelSelectorProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  theme?: 'light' | 'dark';
}

export default function ModelSelector({ selectedModel, setSelectedModel, theme }: ModelSelectorProps) {
  const isDark = theme === 'dark';

  return (
    <select
      id="model-selector"
      value={selectedModel}
      onChange={(e) => setSelectedModel(e.target.value)}
      className={`text-[10.5px] font-semibold rounded-lg px-2.5 py-1.5 outline-none border cursor-pointer transition-all duration-200 ${
        isDark 
          ? 'border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-850 hover:border-slate-700 focus:border-blue-500' 
          : 'border-slate-200 bg-slate-55 text-slate-750 hover:bg-slate-100 hover:border-slate-300 focus:border-blue-500'
      }`}
    >
      {MODEL_WHITELIST.map((m) => (
        <option key={m.id} value={m.id} className={isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-750'}>
          {m.icon} {m.name}
        </option>
      ))}
    </select>
  );
}

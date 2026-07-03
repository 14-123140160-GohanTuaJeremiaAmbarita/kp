import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, MessageSquare, BarChart3, Brain, Sun, Moon, X } from 'lucide-react';
import ModelSelector from '../chat/ModelSelector';

interface TopbarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;
  activeTab: 'chat' | 'dashboard' | 'knowledge';
  setActiveTab: (tab: 'chat' | 'dashboard' | 'knowledge') => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  learningNotice: string | null;
  setLearningNotice: (val: string | null) => void;
  fetchStats: () => void;
}

export default function Topbar({
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab,
  theme,
  setTheme,
  selectedModel,
  setSelectedModel,
  learningNotice,
  setLearningNotice,
  fetchStats,
}: TopbarProps) {
  const isDark = theme === 'dark';

  return (
    <>
      {/* Main Workspace Header */}
      <header className={`flex h-14 items-center justify-between px-4 shrink-0 shadow-sm transition-colors duration-300 border-b ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex items-center space-x-3">
          {/* Toggle Sidebar Icon */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`rounded-lg p-1.5 transition cursor-pointer ${
              isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            }`}
            title="Toggle Sidebar"
          >
            <ChevronRight className={`h-5 w-5 transform transition duration-200 ${isSidebarOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Tab Switcher */}
          <div className={`flex rounded-lg p-0.5 border transition-colors ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200/50'
          }`}>
            <button 
              onClick={() => setActiveTab('chat')}
              className={`flex items-center space-x-2 rounded-md px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                activeTab === 'chat' 
                  ? (isDark ? 'bg-slate-800 text-white border border-slate-750 shadow-sm' : 'bg-white text-blue-700 border border-slate-200/60 shadow-sm') 
                  : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-850')
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Asisten AI</span>
            </button>
            <button 
              onClick={() => { setActiveTab('dashboard'); fetchStats(); }}
              className={`flex items-center space-x-2 rounded-md px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                activeTab === 'dashboard' 
                  ? (isDark ? 'bg-slate-800 text-white border border-slate-750 shadow-sm' : 'bg-white text-blue-700 border border-slate-200/60 shadow-sm') 
                  : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-850')
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Theme Toggle button */}
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className={`rounded-lg border px-3 py-1 text-xs font-semibold flex items-center space-x-2 transition cursor-pointer ${
              isDark 
                ? 'bg-slate-950 border-slate-700 text-slate-300 hover:bg-slate-800' 
                : 'bg-slate-50 border-slate-200 text-slate-655 hover:bg-slate-100'
            }`}
            title={isDark ? 'Ubah ke Mode Terang' : 'Ubah ke Mode Gelap'}
          >
            {isDark ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-500" />
                <span className="hidden sm:inline">Terang</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-blue-600" />
                <span className="hidden sm:inline">Gelap</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* SELF-LEARNING NOTIFICATION BANNER */}
      <AnimatePresence>
        {learningNotice && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-indigo-55 border-b border-indigo-150 text-indigo-800 text-xs px-4 py-2 flex items-center justify-between shadow-sm font-medium"
          >
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-indigo-600 animate-pulse" />
              <span>{learningNotice}</span>
            </div>
            <button onClick={() => setLearningNotice(null)} className="cursor-pointer">
              <X className="h-3.5 w-3.5 text-indigo-400 hover:text-indigo-700" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
export { Topbar };

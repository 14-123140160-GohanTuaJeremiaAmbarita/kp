import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, LogOut } from 'lucide-react';
import { Conversation } from '../../types/chat';
import HistorySidebar from './HistorySidebar';

interface SidebarProps {
  isSidebarOpen: boolean;
  conversations: Conversation[];
  activeConvId: string;
  setActiveConvId: (id: string) => void;
  onCreateConversation: () => void;
  onDeleteConversation: (id: string, e: React.MouseEvent<HTMLButtonElement>) => void;
  onPinConversation: (id: string, e: React.MouseEvent<HTMLButtonElement>) => void;
  user: any;
  onLogout: () => void;
}

export default function Sidebar({
  isSidebarOpen,
  conversations,
  activeConvId,
  setActiveConvId,
  onCreateConversation,
  onDeleteConversation,
  onPinConversation,
  user,
  onLogout,
}: SidebarProps) {
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };
  return (
    <AnimatePresence initial={false}>
      {isSidebarOpen && (
        <motion.div 
          id="sidebar-panel"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 260, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-64 bg-[#0a1e3b] text-slate-300 flex h-full flex-col border-r border-slate-850 shadow-xl shrink-0 animate-fade"
        >
          {/* Header Voksel Blue */}
          <div className="p-4 border-b border-slate-750/50 flex items-center gap-3 shrink-0 bg-slate-950/25">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 shrink-0">
              V
            </div>
            <div>
              <h1 className="text-xs font-bold text-white leading-tight">VOKSEL ELECTRIC</h1>
              <p className="text-[9px] text-blue-400 font-mono tracking-tighter">SMART IT ASSISTANT</p>
            </div>
          </div>

          {/* Grouped History List */}
          <HistorySidebar
            conversations={conversations}
            activeConvId={activeConvId}
            setActiveConvId={setActiveConvId}
            onDeleteConversation={onDeleteConversation}
            onPinConversation={onPinConversation}
          />

          {/* Bottom Actions & User Info Footer */}
          <div className="p-4 bg-slate-900/50 space-y-3 border-t border-slate-800">
            <div className="flex items-center justify-end text-[10px]">
              <span className="text-blue-400 font-mono opacity-60">v1.2.4-stable</span>
            </div>
            
            <button 
              id="btn-new-chat"
              onClick={onCreateConversation}
              className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded-md text-center text-xs font-bold text-white cursor-pointer transition-all shadow-lg block focus:outline-none"
            >
              + Percakapan Baru
            </button>

            <div className="flex items-center justify-between rounded-lg bg-slate-950/40 p-2 border border-slate-850/50">
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-[10px] border border-blue-500 shadow shadow-blue-550/20">
                  {getInitials(user?.Nama || user?.Name)}
                </div>
                <div className="flex-1 overflow-hidden text-left">
                  <h4 className="truncate text-[11px] font-semibold text-slate-200">{user?.Nama || user?.Name || 'User'}</h4>
                  <p className="truncate text-[9px] font-mono text-slate-400">{user?.Departemen || user?.Dept || 'Corporate'}</p>
                </div>
              </div>
              
              <button 
                onClick={onLogout}
                className="p-1 rounded-md hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                title="Keluar Sesi"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export { Sidebar };

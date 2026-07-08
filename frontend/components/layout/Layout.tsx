import React from 'react';
import { Conversation, Message } from '../../types/chat';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface LayoutProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  conversations: Conversation[];
  activeConvId: string;
  setActiveConvId: (id: string) => void;
  onCreateConversation: () => void;
  onDeleteConversation: (id: string, e: React.MouseEvent<HTMLButtonElement>) => void;
  onPinConversation: (id: string, e: React.MouseEvent<HTMLButtonElement>) => void;
  activeTab: 'chat' | 'dashboard' | 'knowledge';
  setActiveTab: (tab: 'chat' | 'dashboard' | 'knowledge') => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  learningNotice: string | null;
  setLearningNotice: (val: string | null) => void;
  fetchStats: () => void;
  messages: Message[];
  onExportExcel: (sql: string) => void;
  onExportPDF: (sql: string, result: string, userQuestion?: string) => void;
  user: any;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function Layout({
  isSidebarOpen,
  setIsSidebarOpen,
  theme,
  setTheme,
  conversations,
  activeConvId,
  setActiveConvId,
  onCreateConversation,
  onDeleteConversation,
  onPinConversation,
  activeTab,
  setActiveTab,
  selectedModel,
  setSelectedModel,
  learningNotice,
  setLearningNotice,
  fetchStats,
  messages,
  onExportExcel,
  onExportPDF,
  user,
  onLogout,
  children,
}: LayoutProps) {
  const isDark = theme === 'dark';

  return (
    <div id="app-container" className={`flex h-screen w-screen overflow-hidden font-sans antialiased transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* LEFT SIDEBAR - CHAT HISTORY GROUPED */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        conversations={conversations}
        activeConvId={activeConvId}
        setActiveConvId={setActiveConvId}
        onCreateConversation={onCreateConversation}
        onDeleteConversation={onDeleteConversation}
        onPinConversation={onPinConversation}
        user={user}
        onLogout={onLogout}
      />

      {/* MOBILE SIDEBAR OVERLAY/BACKDROP */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* CENTER WORKSPACE */}
      <div className={`flex flex-1 flex-col overflow-hidden transition-colors duration-300 ${
        isDark ? 'bg-slate-900' : 'bg-slate-50'
      }`}>
        {/* TOPBAR */}
        <Topbar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          theme={theme}
          setTheme={setTheme}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          learningNotice={learningNotice}
          setLearningNotice={setLearningNotice}
          fetchStats={fetchStats}
        />

        {/* MAIN WORKSPACE CONTENT */}
        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>
      </div>

    </div>
  );
}
export { Layout };

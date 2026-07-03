import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Conversation, Message } from '../types/chat';
import { DashboardStats } from '../types/models';

// API services
import { 
  sendMessageApi, 
  submitFeedbackApi, 
  exportExcelApi 
} from '../services/chat';
import { fetchStatsApi } from '../services/dashboard';
import { 
  fetchConversationsApi, 
  fetchMessagesApi, 
  createConversationApi, 
  deleteConversationApi, 
  pinConversationApi 
} from '../services/history';

// Components
import Layout from '../components/layout/Layout';
import ChatWindow from '../components/chat/ChatWindow';
import ChatInput from '../components/chat/ChatInput';
import Dashboard from '../components/dashboard/Dashboard';
import KnowledgePage from '../components/knowledge/KnowledgePage';

interface HomeProps {
  user: any;
  onLogout: () => void;
}

export default function Home({ user, onLogout }: HomeProps) {
  // App Theme & Tabs
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });
  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard' | 'knowledge'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // App Data State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Loading & Inputs
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3.5-flash');

  // Interactive UI indicators
  const [copiedId, setCopiedId] = useState('');
  const [expandedSqlMsgId, setExpandedSqlMsgId] = useState<string | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<Record<string, 'up' | 'down'>>({});
  const [learningNotice, setLearningNotice] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Toast auto-dismiss effect
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
  };

  // Sync theme to localStorage
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Initial load
  useEffect(() => {
    fetchConversations();
    fetchStats();
  }, []);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
    } else {
      setMessages([]);
    }
  }, [activeConvId]);

  // Auto Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Document PDF exporter
  const handleExportPDF = (sql: string, jsonResult: string) => {
    try {
      const data = JSON.parse(jsonResult);
      if (!Array.isArray(data) || data.length === 0) {
        triggerToast('Tidak ada data untuk diekspor ke PDF', 'warning');
        return;
      }

      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text("PT VOKSEL ELECTRIC TBK", 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text("Smart IT Assistant - Laporan Ekspor Operasional IT", 14, 26);
      doc.text(`Kueri: ${sql.length > 80 ? sql.substring(0, 77) + '...' : sql}`, 14, 31);
      doc.text(`Tanggal Ekspor: ${new Date().toLocaleString('id-ID')}`, 14, 36);
      
      // Divider
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 40, 196, 40);
      
      const headers = Object.keys(data[0]);
      const rows = data.map(row => headers.map(h => String(row[h] ?? 'NULL')));

      autoTable(doc, {
        startY: 44,
        head: [headers],
        body: rows,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] }, // blue-600
        styles: { fontSize: 8, font: 'helvetica' }
      });

      doc.save(`voksel_it_export_${Date.now()}.pdf`);
      triggerToast('Laporan PDF berhasil diunduh.', 'success');
    } catch (e: any) {
      console.error('Error exporting PDF', e);
      triggerToast('Gagal mengekspor PDF: ' + e.message, 'error');
    }
  };

  // API wrappers
  const fetchConversations = async () => {
    try {
      const data = await fetchConversationsApi();
      const list = Array.isArray(data) ? data : [];
      setConversations(list);
    } catch (e) {
      console.error('Error fetching conversations', e);
      setConversations([]);
    }
  };

  const fetchMessages = async (id: string) => {
    try {
      const data = await fetchMessagesApi(id);
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error fetching messages', e);
      setMessages([]);
    }
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const data = await fetchStatsApi();
      setStats(data);
    } catch (e) {
      console.error('Error fetching stats', e);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleCreateConversation = () => {
    setActiveConvId('');
    setActiveTab('chat');
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      const success = await deleteConversationApi(id);
      if (success) {
        setConversations(prev => prev.filter(c => c.ConversationID !== id));
        if (activeConvId === id) {
          setActiveConvId('');
        }
        triggerToast('Percakapan berhasil dihapus', 'info');
      }
    } catch (err: any) {
      console.error('Error deleting conversation', err);
      triggerToast('Gagal menghapus percakapan: ' + err.message, 'error');
    }
  };

  const handlePinConversation = async (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      const conversation = await pinConversationApi(id);
      setConversations(prev => prev.map(c => c.ConversationID === id ? conversation : c));
    } catch (err) {
      console.error('Error pinning conversation', err);
    }
  };

  const triggerLearningNotice = (msg: string) => {
    setLearningNotice(msg);
    setTimeout(() => {
      setLearningNotice(null);
    }, 4000);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setInputMessage('');

    let currentConvId = activeConvId;

    // Auto-create a conversation if none is active
    if (!currentConvId) {
      try {
        const conversation = await createConversationApi('New Chat');
        setConversations(prev => [conversation, ...prev]);
        setActiveConvId(conversation.ConversationID);
        currentConvId = conversation.ConversationID;
      } catch (e: any) {
        console.error('Error auto-creating conversation', e);
        triggerToast('Gagal membuat sesi obrolan baru: ' + e.message, 'error');
        setLoading(false);
        return;
      }
    }

    // Optimistic UI
    const tempUserMsg: Message = {
      MessageID: 'temp-user-' + Date.now(),
      ConversationID: currentConvId,
      Sender: 'User',
      MessageText: text,
      CreatedDate: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const data = await sendMessageApi(currentConvId, text, selectedModel);
      if (data.success) {
        fetchMessages(currentConvId);
        fetchStats();
        fetchConversations();
        if (data.fromLearning) {
          triggerToast('Diambil dari AI Learning Cache!', 'success');
        }
      } else {
        triggerToast('Gagal mengirim pesan: ' + data.error, 'error');
        // Remove optimistic message on failure
        setMessages(prev => prev.filter(m => m.MessageID !== tempUserMsg.MessageID));
      }
    } catch (e: any) {
      console.error('Error sending message', e);
      triggerToast('Gagal mengirim pesan: ' + e.message, 'error');
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m.MessageID !== tempUserMsg.MessageID));
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (msgId: string, score: number, question: string, sqlQuery: string, answerText: string) => {
    const currentStatus = feedbackStatus[msgId];
    if (currentStatus) return;

    try {
      const data = await submitFeedbackApi(msgId, score, question, sqlQuery, answerText);
      if (data.success) {
        setFeedbackStatus(prev => ({ ...prev, [msgId]: score === 1 ? 'up' : 'down' }));
        if (score === 1) {
          triggerLearningNotice('Terima kasih! Pola kueri berhasil dipelajari AI (Self-Learning Loop Aktif).');
        } else {
          triggerLearningNotice('Umpan balik disimpan untuk koreksi kueri berikutnya.');
        }
      }
    } catch (err) {
      console.error('Error setting feedback', err);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const handleExportExcel = async (sql: string) => {
    try {
      const blob = await exportExcelApi(sql);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Voksel_IT_Export_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      triggerToast('Data Excel berhasil diunduh.', 'success');
    } catch (err: any) {
      triggerToast('Error ekspor Excel: ' + err.message, 'error');
    }
  };

  return (
    <Layout
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      theme={theme}
      setTheme={setTheme}
      conversations={conversations}
      activeConvId={activeConvId}
      setActiveConvId={setActiveConvId}
      onCreateConversation={handleCreateConversation}
      onDeleteConversation={handleDeleteConversation}
      onPinConversation={handlePinConversation}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      selectedModel={selectedModel}
      setSelectedModel={setSelectedModel}
      learningNotice={learningNotice}
      setLearningNotice={setLearningNotice}
      fetchStats={fetchStats}
      messages={messages}
      onExportExcel={handleExportExcel}
      onExportPDF={handleExportPDF}
      user={user}
      onLogout={onLogout}
    >
      {/* Dynamic Main Workspace Tabs */}
      {activeTab === 'chat' && (
        <div className="h-full flex flex-col justify-between">
          <ChatWindow
            messages={messages}
            theme={theme}
            loading={loading}
            activeConvId={activeConvId}
            onSendMessage={handleSendMessage}
            copiedId={copiedId}
            onCopyText={handleCopyText}
            expandedSqlMsgId={expandedSqlMsgId}
            setExpandedSqlMsgId={setExpandedSqlMsgId}
            feedbackStatus={feedbackStatus}
            onFeedback={handleFeedback}
            onExportExcel={handleExportExcel}
            onExportPDF={handleExportPDF}
            messagesEndRef={messagesEndRef}
          />
          <ChatInput
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            loading={loading}
            activeConvId={activeConvId}
            onSend={handleSendMessage}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            theme={theme}
          />
        </div>
      )}

      {/* Floating Toast Notification */}
      <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className={`pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl max-w-sm backdrop-blur-md transition-all ${
                theme === 'dark'
                  ? toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'
                    : toast.type === 'error' ? 'bg-rose-950/90 border-rose-500/30 text-rose-200'
                    : toast.type === 'warning' ? 'bg-amber-950/90 border-amber-500/30 text-amber-200'
                    : 'bg-slate-900/90 border-slate-800 text-slate-200'
                  : toast.type === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
                    : toast.type === 'error' ? 'bg-rose-50/90 border-rose-200 text-rose-800'
                    : toast.type === 'warning' ? 'bg-amber-50/90 border-amber-200 text-amber-800'
                    : 'bg-white/90 border-slate-200 text-slate-800'
              }`}
            >
              <div className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-black/10 dark:bg-white/10 text-xs font-bold">
                {toast.type === 'success' && '✓'}
                {toast.type === 'error' && '✕'}
                {toast.type === 'warning' && '⚠'}
                {toast.type === 'info' && 'ℹ'}
              </div>
              <div className="flex-1 text-[11px] font-semibold tracking-tight leading-snug">{toast.message}</div>
              <button 
                onClick={() => setToast(null)} 
                className="shrink-0 p-0.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
              >
                <X className="h-3.5 w-3.5 opacity-60 hover:opacity-100" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {activeTab === 'dashboard' && (
        <div className="h-full overflow-y-auto px-6 py-6 custom-scrollbar">
          <Dashboard
            stats={stats}
            loadingStats={loadingStats}
            onRefresh={fetchStats}
            theme={theme}
          />
        </div>
      )}

      {activeTab === 'knowledge' && (
        <div className="h-full overflow-y-auto px-6 py-6 custom-scrollbar">
          <KnowledgePage theme={theme} />
        </div>
      )}
    </Layout>
  );
}

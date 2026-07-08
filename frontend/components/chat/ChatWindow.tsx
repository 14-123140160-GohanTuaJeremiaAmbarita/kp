import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Database, HardDrive } from 'lucide-react';
import { Message } from '../../types/chat';
import ChatBubble from './ChatBubble';

const ALL_SUGGESTIONS = [
  {
    title: "Tampilkan tiket IT yang statusnya Open",
    subtitle: "Melihat tiket yang belum terselesaikan",
    command: "Tampilkan tiket IT yang statusnya Open"
  },
  {
    title: "Berapa banyak komputer yang aktif?",
    subtitle: "Melihat jumlah aset komputer aktif",
    command: "Berapa banyak komputer yang berstatus aktif saat ini?"
  },
  {
    title: "Tampilkan daftar divisi di perusahaan",
    subtitle: "Melihat daftar divisi unik karyawan",
    command: "Tampilkan semua departemen unik pada tabel TD_karyawan"
  },
  {
    title: "Tampilkan komputer dengan merk Lenovo",
    subtitle: "Pencarian spesifik merk CPU",
    command: "Tampilkan komputer yang memiliki CPU_Merk 'Lenovo'"
  },
  {
    title: "Tampilkan tiket IT dari departemen GA",
    subtitle: "Melihat keluhan dari divisi General Affairs",
    command: "Tampilkan tiket IT yang diajukan oleh departemen GA"
  },
  {
    title: "Apa fungsi divisi HRD?",
    subtitle: "Informasi mengenai divisi Human Resources",
    command: "Apa fungsi utama divisi HRD di dalam perusahaan?"
  },
  {
    title: "Tampilkan data komputer jenis LAPTOP",
    subtitle: "Mencari komputer bertipe laptop",
    command: "Tampilkan data komputer yang memiliki tipe LAPTOP"
  },
  {
    title: "Tampilkan tiket IT yang belum diproses",
    subtitle: "Mencari tiket IT tanpa NoWO",
    command: "Tampilkan tiket IT yang kolom NoWO-nya kosong"
  },
  {
    title: "Tampilkan rincian tindakan perbaikan",
    subtitle: "Melihat tindakan perbaikan pada TD_WO",
    command: "Tampilkan rincian tindakan perbaikan (DeskripsiTindakan) pada tabel TD_WO"
  }
];

interface SuggestionChipProps {
  title: string;
  subtitle: string;
  onClick: () => void;
  theme?: 'light' | 'dark';
}

function SuggestionChip({ title, subtitle, onClick, theme }: SuggestionChipProps) {
  const isDark = theme === 'dark';
  return (
    <button 
      onClick={onClick}
      className={`rounded-2xl border p-3 text-left transition hover:border-blue-500/50 hover:shadow shadow-sm cursor-pointer ${
        isDark 
          ? 'border-slate-800 bg-slate-900/30 text-white hover:bg-slate-900/60' 
          : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
      }`}
    >
      <h4 className={`text-xs font-semibold tracking-tight leading-tight mb-0.5 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{title}</h4>
      <span className={`text-[10px] font-mono block leading-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</span>
    </button>
  );
}

interface TypingIndicatorProps {
  theme?: 'light' | 'dark';
}

function TypingIndicator({ theme }: TypingIndicatorProps) {
  const isDark = theme === 'dark';
  return (
    <div className="flex space-x-4 justify-start">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 font-bold">
        AI
      </div>
      <div className={`rounded-2xl border px-4 py-3 shadow-sm flex items-center space-x-1.5 h-[38px] transition-colors duration-300 ${
        isDark 
          ? 'bg-slate-900 border-slate-800' 
          : 'bg-white border-slate-200'
      }`}>
        <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce typing-dot-1" />
        <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce typing-dot-2" />
        <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce typing-dot-3" />
      </div>
    </div>
  );
}

interface ChatWindowProps {
  messages: Message[];
  theme?: 'light' | 'dark';
  loading: boolean;
  activeConvId: string;
  onSendMessage: (text: string) => void;
  copiedId: string;
  onCopyText: (text: string, id: string) => void;
  expandedSqlMsgId: string | null;
  setExpandedSqlMsgId: (id: string | null) => void;
  feedbackStatus: Record<string, 'up' | 'down'>;
  onFeedback: (msgId: string, score: number, question: string, sqlQuery: string, answerText: string) => void;
  onExportExcel: (sql: string) => void;
  onExportPDF: (sql: string, result: string, userQuestion?: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export default function ChatWindow({
  messages,
  theme,
  loading,
  activeConvId,
  onSendMessage,
  copiedId,
  onCopyText,
  expandedSqlMsgId,
  setExpandedSqlMsgId,
  feedbackStatus,
  onFeedback,
  onExportExcel,
  onExportPDF,
  messagesEndRef,
}: ChatWindowProps) {
  const isDark = theme === 'dark';
  const [randomSuggestions, setRandomSuggestions] = useState<typeof ALL_SUGGESTIONS>([]);

  useEffect(() => {
    const shuffled = [...ALL_SUGGESTIONS].sort(() => 0.5 - Math.random());
    setRandomSuggestions(shuffled.slice(0, 4));
  }, []);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">
      {(!messages || messages.length === 0) ? (
        /* Empty state */
        <div className="mx-auto max-w-2xl text-center py-12 space-y-8">
          <div className="space-y-3">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-300 ${
                isDark 
                  ? 'bg-slate-900 border border-slate-850 text-blue-400 shadow shadow-slate-950' 
                  : 'bg-blue-50 border border-blue-200 text-blue-600 shadow-md shadow-blue-100/50'
              }`}
            >
              <Database className="h-6 w-6" />
            </motion.div>
            <h2 className={`text-xl font-extrabold tracking-tight sm:text-2xl transition-colors ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}>Smart IT Assistant — Voksel Electric</h2>
            <p className={`text-xs leading-relaxed max-w-md mx-auto font-medium transition-colors ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Sistem integrasi AI dengan pemisahan database Production **ITOpr** (Readonly) dan Database AI Support **SmartIT_AI** (Writeable).
            </p>
          </div>

          {/* Suggestion Chips */}
          <div className="grid gap-3 sm:grid-cols-2 text-left">
            {randomSuggestions.map((s, idx) => (
              <SuggestionChip 
                key={idx}
                title={s.title} 
                subtitle={s.subtitle}
                onClick={() => onSendMessage(s.command)}
                theme={theme}
              />
            ))}
          </div>


          <div className={`flex items-center justify-center space-x-2 text-[10px] font-mono py-1.5 px-3 rounded-lg max-w-xs mx-auto shadow-sm font-semibold transition-colors ${
            isDark 
              ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-900/60' 
              : 'text-emerald-700 bg-emerald-50 border border-emerald-100'
          }`}>
            <HardDrive className="h-3 w-3 text-emerald-500" />
            <span>Readonly ITOpr DB: Safe Mode On</span>
          </div>
        </div>
      ) : (
        /* Conversation bubble lists */
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.map((m, index) => {
            // Find preceding user question for feedback context
            let userQuestion = '';
            if (m.Sender === 'AI') {
              const precedingMsg = messages.slice(0, index).reverse().find(x => x.Sender === 'User');
              if (precedingMsg) {
                userQuestion = precedingMsg.MessageText;
              }
            }

            return (
              <ChatBubble
                key={m.MessageID}
                message={m}
                theme={theme}
                copiedId={copiedId}
                onCopyText={onCopyText}
                expandedSqlMsgId={expandedSqlMsgId}
                setExpandedSqlMsgId={setExpandedSqlMsgId}
                feedbackStatus={feedbackStatus}
                onFeedback={onFeedback}
                userQuestion={userQuestion}
                onExportExcel={onExportExcel}
                onExportPDF={onExportPDF}
              />
            );
          })}
          {loading && <TypingIndicator theme={theme} />}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
export { ChatWindow };

import React, { FormEvent, KeyboardEvent, useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import ModelSelector, { MODEL_WHITELIST } from './ModelSelector';

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (val: string) => void;
  loading: boolean;
  activeConvId: string;
  onSend: (text: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  theme?: 'light' | 'dark';
  hasMessages: boolean;
}

const PLACEHOLDERS = [
  "Contoh: Tampilkan komputer aktif dengan merek Lenovo",
  "Contoh: Berapa jumlah NOTEBOOK, PC, ALL IN ONE, dan SERVER?",
  "Contoh: Cari komputer dengan RAM 16 GB dan SSD 512 GB",
  "Contoh: Tampilkan aset komputer departemen HRD",
  "Contoh: Tampilkan monitor aktif berdasarkan merek",
  "Contoh: Cari printer aktif dan jenis tonernya",
  "Contoh: Tampilkan work order yang masih terbuka",
  "Contoh: Bandingkan WO selesai untuk setiap PIC IT",
  "Contoh: Berapa rata-rata downtime per PIC IT?",
  "Contoh: Tampilkan WO dengan tingkat kesulitan Sulit",
  "Contoh: Buat grafik status kamera CCTV",
  "Contoh: Tampilkan jadwal masa berlaku lisensi",
  "Contoh: Buat grafik distribusi toner per bagian",
  "Contoh: Cari extension telepon bagian IT",
  "Contoh: Tampilkan perangkat keras lain yang aktif",
  "Contoh: Tampilkan riwayat pemegang sebuah komputer",
  "Contoh: Buat grafik karyawan aktif per departemen",
  "Contoh: Cari IP dan MAC address berdasarkan hostname"
];

export default function ChatInput({
  inputMessage,
  setInputMessage,
  loading,
  activeConvId,
  onSend,
  selectedModel,
  setSelectedModel,
  theme,
  hasMessages,
}: ChatInputProps) {
  const isDark = theme === 'dark';
  const [showDueToInactivity, setShowDueToInactivity] = useState(false);
  const [placeholderText, setPlaceholderText] = useState(PLACEHOLDERS[0]);

  const rotatePlaceholder = () => {
    setPlaceholderText(prev => {
      const idx = PLACEHOLDERS.indexOf(prev);
      const nextIdx = (idx + 1) % PLACEHOLDERS.length;
      return PLACEHOLDERS[nextIdx];
    });
  };

  useEffect(() => {
    setShowDueToInactivity(false);
    
    const intervalId = setInterval(() => {
      if (!inputMessage.trim()) {
        setShowDueToInactivity(true);
        rotatePlaceholder();
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [inputMessage, hasMessages]);

  const activePlaceholder = (!hasMessages || showDueToInactivity) ? placeholderText : "";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !loading) {
      onSend(inputMessage);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const activeModelName = MODEL_WHITELIST.find((m) => m.id === selectedModel)?.name || selectedModel;

  return (
    <div className={`border-t p-4 transition-colors duration-300 ${
      isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/80 backdrop-blur'
    }`}>
      <div className="mx-auto max-w-3xl relative">
        <form 
          onSubmit={handleSubmit}
          className={`flex flex-col rounded-xl border-2 transition-all p-2 focus-within:border-blue-500 shadow-lg focus-within:shadow-xl ${
            isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-205 bg-white'
          }`}
        >
          <textarea
            id="chat-textarea"
            rows={2}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={activePlaceholder}
            className={`w-full resize-none bg-transparent py-2.5 px-3.5 text-xs outline-none placeholder:text-slate-500 custom-scrollbar max-h-32 transition-colors ${
              isDark ? 'text-slate-100' : 'text-slate-800'
            }`}
          />
          
          <div className="flex items-center justify-between border-t border-dashed mt-2 pt-2 px-1 border-slate-200 dark:border-slate-800/80">
            {/* Model Selector Inline */}
            <div className="flex items-center space-x-2">
              <ModelSelector
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                theme={theme}
              />
            </div>
            
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className={`flex h-8 w-8 items-center justify-center rounded-xl transition active:scale-[0.95] disabled:shadow-none shadow cursor-pointer ${
                isDark 
                  ? 'bg-blue-600 text-white hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 shadow-blue-900/20' 
                  : 'bg-blue-600 text-white hover:bg-blue-500 disabled:bg-slate-100 disabled:text-slate-400 shadow-blue-600/10'
              }`}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
        
        {/* Hint */}
        <div className="flex items-center justify-between px-3 mt-1.5">
          <span className={`text-[9px] font-medium transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Menghubungkan AI dengan database ITOpr (SELECT) & SmartIT_AI (Feedback).
          </span>
          <span className={`text-[9px] font-mono font-medium transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Model: {activeModelName}
          </span>
        </div>
      </div>
    </div>
  );
}
export { ChatInput };

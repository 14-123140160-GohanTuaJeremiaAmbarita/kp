import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Database, HardDrive } from 'lucide-react';
import { Message } from '../../types/chat';
import ChatBubble from './ChatBubble';

const ALL_SUGGESTIONS = [
  {
    title: "Work order yang masih terbuka",
    subtitle: "TD_WO dengan Closed = 0",
    command: "Tampilkan work order yang masih terbuka, lengkap dengan nomor WO, tanggal, departemen, kerusakan, dan PIC IT"
  },
  {
    title: "Berapa banyak komputer yang aktif?",
    subtitle: "Melihat jumlah aset komputer aktif",
    command: "Berapa banyak komputer yang berstatus aktif saat ini?"
  },
  {
    title: "Grafik kategori komputer",
    subtitle: "Notebook, PC, All-in-One, dan Server",
    command: "Buatkan grafik jumlah komputer berdasarkan kategori Jenis"
  },
  {
    title: "Tampilkan komputer dengan merk Lenovo",
    subtitle: "Pencarian spesifik merk CPU",
    command: "Tampilkan komputer yang memiliki CPU_Merk 'Lenovo'"
  },
  {
    title: "Daftar monitor aktif",
    subtitle: "Inventaris dari TD_monitor",
    command: "Tampilkan monitor yang aktif beserta kode, merek, tipe, departemen, dan komputer yang terhubung"
  },
  {
    title: "Daftar printer dan toner",
    subtitle: "Inventaris dari TD_printer",
    command: "Tampilkan printer aktif beserta kode, jenis, merek, tipe, toner, pengguna, dan departemen"
  },
  {
    title: "Tampilkan data komputer jenis NOTEBOOK",
    subtitle: "Mencari kategori perangkat laptop/notebook",
    command: "Tampilkan data TD_computer dengan kategori Jenis NOTEBOOK"
  },
  {
    title: "Jadwal masa berlaku lisensi",
    subtitle: "Daftar lisensi dan tanggal kedaluwarsa",
    command: "Tampilkan semua lisensi beserta deskripsi, tanggal expired, tanggal renewal, supplier, perangkat instalasi, dan jumlah; urutkan dari yang paling cepat kedaluwarsa"
  },
  {
    title: "Distribusi toner per bagian",
    subtitle: "Total seluruh riwayat distribusi",
    command: "Buat grafik total qty distribusi toner per bagian"
  },
  {
    title: "Status kamera CCTV",
    subtitle: "Jumlah kamera berdasarkan status",
    command: "Buat grafik jumlah CCTV berdasarkan status"
  },
  {
    title: "Kinerja PIC IT",
    subtitle: "Jumlah WO selesai dan downtime",
    command: "Bandingkan jumlah work order selesai dan rata-rata downtime untuk setiap PIC IT"
  },
  {
    title: "Cari extension telepon",
    subtitle: "Daftar PABX per bagian",
    command: "Tampilkan daftar extension telepon PABX beserta nama, line, dan bagian"
  },
  {
    title: "Grafik karyawan per departemen",
    subtitle: "Distribusi karyawan aktif",
    command: "Buat grafik jumlah karyawan aktif pada setiap departemen"
  },
  {
    title: "Komputer RAM 16 GB",
    subtitle: "Filter kapasitas memori",
    command: "Tampilkan komputer dengan RAM 16 GB beserta kode, jenis, merek, model, dan pengguna"
  },
  {
    title: "Komputer SSD 512 GB",
    subtitle: "Filter media penyimpanan",
    command: "Tampilkan komputer yang menggunakan SSD 512 GB"
  },
  {
    title: "Komputer Windows 11",
    subtitle: "Inventaris berdasarkan OS",
    command: "Tampilkan komputer yang menggunakan Windows 11"
  },
  {
    title: "Komputer Core i5",
    subtitle: "Inventaris berdasarkan processor",
    command: "Tampilkan komputer dengan processor Core i5"
  },
  {
    title: "Komputer tidak aktif",
    subtitle: "Kode status selain Y",
    command: "Tampilkan komputer yang tidak aktif beserta kode statusnya"
  },
  {
    title: "Aset perusahaan PME",
    subtitle: "Filter pemilik aset",
    command: "Tampilkan komputer milik perusahaan PME"
  },
  {
    title: "Komputer diterima tahun ini",
    subtitle: "Filter tanggal penerimaan",
    command: "Tampilkan komputer yang diterima pada tahun berjalan"
  },
  {
    title: "Riwayat pemegang komputer",
    subtitle: "Data TD_ComputerHistory",
    command: "Tampilkan riwayat pemegang komputer beserta tanggal mulai dan selesai"
  },
  {
    title: "Grafik merek monitor",
    subtitle: "Jumlah monitor per merek",
    command: "Buat grafik jumlah monitor berdasarkan merek"
  },
  {
    title: "Monitor per departemen",
    subtitle: "Distribusi inventaris monitor",
    command: "Buat grafik jumlah monitor berdasarkan departemen"
  },
  {
    title: "Grafik merek printer",
    subtitle: "Jumlah printer per merek",
    command: "Buat grafik jumlah printer berdasarkan merek"
  },
  {
    title: "Kebutuhan toner printer",
    subtitle: "Jumlah printer per tipe toner",
    command: "Buat grafik jumlah printer berdasarkan jenis toner"
  },
  {
    title: "Printer departemen GA",
    subtitle: "Inventaris printer divisi",
    command: "Tampilkan printer yang digunakan departemen GA"
  },
  {
    title: "CCTV berdasarkan lokasi",
    subtitle: "Distribusi kamera",
    command: "Buat grafik jumlah CCTV berdasarkan lokasi kamera"
  },
  {
    title: "CCTV yang tidak aktif",
    subtitle: "Pemeriksaan status kamera",
    command: "Tampilkan CCTV yang statusnya tidak aktif beserta lokasi dan catatan"
  },
  {
    title: "WO tingkat Sulit",
    subtitle: "Pekerjaan kompleks",
    command: "Tampilkan work order dengan tingkat kesulitan Sulit"
  },
  {
    title: "WO berdasarkan jenis",
    subtitle: "Perbaikan, pengadaan, dan lainnya",
    command: "Buat grafik jumlah work order berdasarkan JenisWO"
  },
  {
    title: "WO berdasarkan penyebab",
    subtitle: "User atau perangkat",
    command: "Buat grafik jumlah work order berdasarkan penyebab"
  },
  {
    title: "WO departemen IT",
    subtitle: "Riwayat pekerjaan divisi",
    command: "Tampilkan work order untuk departemen IT"
  },
  {
    title: "Downtime tertinggi",
    subtitle: "Urutkan durasi penanganan",
    command: "Tampilkan work order selesai dan urutkan berdasarkan TotalDowntime paling tinggi"
  },
  {
    title: "Perangkat keras lain",
    subtitle: "Inventaris TD_HardLain",
    command: "Tampilkan perangkat keras lain yang masih aktif"
  },
  {
    title: "Hardware lain per jenis",
    subtitle: "Distribusi kategori perangkat",
    command: "Buat grafik perangkat keras lain berdasarkan Jenis"
  },
  {
    title: "Daftar IP perangkat lain",
    subtitle: "Hostname, IP, dan MAC",
    command: "Tampilkan daftar IP perangkat lain beserta hostname, pengguna, departemen, dan MAC address"
  },
  {
    title: "Master jenis WO",
    subtitle: "Referensi kategori pekerjaan",
    command: "Tampilkan master TypeWO dan SubType work order"
  },
  {
    title: "Daftar PIC IT",
    subtitle: "Master teknisi tanpa data sensitif",
    command: "Tampilkan daftar PIC IT beserta NRP, nama, keterangan, status blokir, dan grup"
  },
  {
    title: "Lisensi per supplier",
    subtitle: "Jumlah lisensi berdasarkan vendor",
    command: "Buat grafik total qty lisensi berdasarkan supplier"
  },
  {
    title: "Toner paling banyak dipakai",
    subtitle: "Akumulasi berdasarkan jenis barang",
    command: "Buat grafik total distribusi toner berdasarkan jenis barang"
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
    const refreshSuggestions = () => {
      const shuffled = [...ALL_SUGGESTIONS].sort(() => 0.5 - Math.random());
      setRandomSuggestions(shuffled.slice(0, 4));
    };

    refreshSuggestions();
    if (messages.length > 0) return;

    const intervalId = setInterval(refreshSuggestions, 30000);
    return () => clearInterval(intervalId);
  }, [activeConvId, messages.length]);

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

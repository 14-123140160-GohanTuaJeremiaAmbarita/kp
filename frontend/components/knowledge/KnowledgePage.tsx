import React, { useState } from 'react';
import { Database, Table, Key, Link, BookOpen, ChevronRight, HelpCircle } from 'lucide-react';

interface ColumnSchema {
  name: string;
  type: string;
  key?: 'PK' | 'FK';
  ref?: string;
  desc: string;
  example: string;
}

interface TableSchema {
  id: string;
  name: string;
  description: string;
  columns: ColumnSchema[];
  samples: { q: string; explanation: string }[];
}

const SCHEMAS: TableSchema[] = [
  {
    id: 'TD_karyawan',
    name: 'TD_karyawan',
    description: 'Menyimpan data induk kepegawaian dan personil PT Voksel Electric Tbk.',
    columns: [
      { name: 'NIK', type: 'VARCHAR', key: 'PK', desc: 'Nomor Induk Karyawan (Unik)', example: "'VOK001', 'VOK002'" },
      { name: 'Nama', type: 'VARCHAR', desc: 'Nama lengkap karyawan', example: "'Gohan Ambarita', 'Siti Rahma'" },
      { name: 'Departemen', type: 'VARCHAR', desc: 'Divisi/Departemen penempatan kerja', example: "'IT Support', 'Production', 'Finance'" },
      { name: 'Jabatan', type: 'VARCHAR', desc: 'Jabatan struktural karyawan', example: "'Staff', 'Supervisor', 'Manager'" },
      { name: 'Email', type: 'VARCHAR', desc: 'Alamat email korporasi resmi', example: "'gohan@voksel.co.id'" },
      { name: 'Status', type: 'VARCHAR', desc: 'Status keaktifan kerja', example: "'Active', 'Inactive'" },
    ],
    samples: [
      { q: "SELECT * FROM TD_karyawan WHERE Status = 'Active';", explanation: "Mengambil semua karyawan yang aktif." },
      { q: "SELECT Departemen, COUNT(*) FROM TD_karyawan GROUP BY Departemen;", explanation: "Menghitung total karyawan per departemen." }
    ]
  },
  {
    id: 'TD_COMPUTER',
    name: 'TD_COMPUTER',
    description: 'Menyimpan data inventaris aset komputer yang dipegang oleh karyawan.',
    columns: [
      { name: 'AssetID', type: 'VARCHAR', key: 'PK', desc: 'Kode Unik Aset Komputer', example: "'COM-001', 'COM-002'" },
      { name: 'UserNIK', type: 'VARCHAR', key: 'FK', ref: 'TD_karyawan.NIK', desc: 'NIK Pemegang / Pengguna aset', example: "'VOK001'" },
      { name: 'Brand', type: 'VARCHAR', desc: 'Merek produsen laptop/komputer', example: "'Lenovo', 'Dell', 'HP', 'ASUS'" },
      { name: 'Model', type: 'VARCHAR', desc: 'Model atau tipe spesifik komputer', example: "'ThinkPad T14', 'Latitude 5420'" },
      { name: 'OS', type: 'VARCHAR', desc: 'Sistem Operasi yang terpasang', example: "'Windows 10 Pro', 'Windows 11 Pro', 'Linux'" },
      { name: 'Status', type: 'VARCHAR', desc: 'Status kondisi operasional komputer', example: "'Active', 'Maintenance', 'Scrapped'" },
    ],
    samples: [
      { q: "SELECT * FROM TD_COMPUTER WHERE Status = 'Maintenance';", explanation: "Melihat komputer yang sedang diservis." },
      { q: "SELECT Brand, COUNT(*) FROM TD_COMPUTER GROUP BY Brand;", explanation: "Mengelompokkan jumlah komputer per merek." }
    ]
  },
  {
    id: 'TD_TICKET',
    name: 'TD_TICKET',
    description: 'Menyimpan pengajuan laporan kendala IT (IT Support Helpdesk).',
    columns: [
      { name: 'TicketID', type: 'VARCHAR', key: 'PK', desc: 'Kode Unik Tiket Kendala', example: "'TCK-001', 'TCK-002'" },
      { name: 'KaryawanNIK', type: 'VARCHAR', key: 'FK', ref: 'TD_karyawan.NIK', desc: 'NIK Karyawan pelapor masalah', example: "'VOK002'" },
      { name: 'Issue', type: 'VARCHAR', desc: 'Deskripsi singkat keluhan kendala IT', example: "'Printer tidak merespon di jaringan'" },
      { name: 'Category', type: 'VARCHAR', desc: 'Kategori isu kendala', example: "'Software', 'Hardware', 'Network', 'System'" },
      { name: 'Status', type: 'VARCHAR', desc: 'Status penyelesaian keluhan', example: "'Open', 'In Progress', 'Resolved', 'Closed'" },
      { name: 'CreatedDate', type: 'VARCHAR', desc: 'Waktu pembuatan laporan kendala', example: "'2026-07-02T10:00:00Z'" },
      { name: 'Priority', type: 'VARCHAR', desc: 'Prioritas penanganan (Urgency)', example: "'Low', 'Medium', 'High', 'Urgent'" },
    ],
    samples: [
      { q: "SELECT * FROM TD_TICKET WHERE Status = 'Open' ORDER BY Priority DESC;", explanation: "Mengurutkan tiket terbuka berdasarkan prioritas tertinggi." },
      { q: "SELECT Category, COUNT(*) FROM TD_TICKET GROUP BY Category;", explanation: "Melihat statistik penyebaran kendala." }
    ]
  },
  {
    id: 'TD_WO',
    name: 'TD_WO',
    description: 'Log instruksi pengerjaan pimpinan teknisi (Work Order) untuk memecahkan kendala tiket IT.',
    columns: [
      { name: 'WOID', type: 'VARCHAR', key: 'PK', desc: 'Kode Unik Work Order', example: "'WO-001', 'WO-002'" },
      { name: 'TicketID', type: 'VARCHAR', key: 'FK', ref: 'TD_TICKET.TicketID', desc: 'Referensi tiket kendala terkait', example: "'TCK-001'" },
      { name: 'AssignedTo', type: 'VARCHAR', desc: 'Nama teknisi IT penanggung jawab', example: "'Fajar Prasetyo', 'Gohan Ambarita'" },
      { name: 'ActionTaken', type: 'VARCHAR', desc: 'Tindakan atau resolusi perbaikan', example: "'Reinstall driver printer & test print'" },
      { name: 'CompletionDate', type: 'VARCHAR', desc: 'Waktu penyelesaian (ISO Format)', example: "'2026-07-02T14:30:00Z'" },
      { name: 'Status', type: 'VARCHAR', desc: 'Status pengerjaan teknis', example: "'Pending', 'In Progress', 'Completed'" },
    ],
    samples: [
      { q: "SELECT * FROM TD_WO WHERE Status = 'Pending';", explanation: "Mencari lembar kerja teknis yang masih tertunda." },
      { q: "SELECT AssignedTo, COUNT(*) FROM TD_WO WHERE Status = 'Completed' GROUP BY AssignedTo;", explanation: "Jumlah perbaikan sukses per teknisi." }
    ]
  }
];

interface KnowledgePageProps {
  theme?: 'light' | 'dark';
}

export default function KnowledgePage({ theme }: KnowledgePageProps) {
  const isDark = theme === 'dark';
  const [activeTableId, setActiveTableId] = useState('TD_karyawan');

  const selectedTable = SCHEMAS.find(s => s.id === activeTableId) || SCHEMAS[0];

  return (
    <div className="space-y-6 animate-fade">
      <div className={`pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <h2 className={`text-lg font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Kamus Data & Skema Database</h2>
        <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Dokumentasi teknis skema tabel ITOpr PT Voksel Electric Tbk untuk mempermudah perumusan kueri SQL.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Navigation panel */}
        <div className="space-y-2 md:col-span-1">
          {SCHEMAS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTableId(t.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-xl border transition-all text-left cursor-pointer ${
                activeTableId === t.id
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/10'
                  : (isDark 
                    ? 'bg-slate-900/30 border-slate-800 text-slate-350 hover:bg-slate-900/70 hover:text-white' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900')
              }`}
            >
              <div className="flex items-center space-x-2">
                <Table className="h-4 w-4 shrink-0" />
                <span className="truncate">{t.name}</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="md:col-span-3 space-y-6">
          <div className={`rounded-2xl border p-5 shadow-sm transition-all duration-300 ${
            isDark ? 'border-slate-800 bg-slate-900/40 text-slate-100' : 'border-slate-200 bg-white text-slate-800'
          }`}>
            <div className="flex items-center space-x-2.5 mb-2 text-blue-500">
              <Database className="h-5 w-5" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider">{selectedTable.name}</h3>
            </div>
            <p className={`text-xs leading-relaxed mb-6 ${isDark ? 'text-slate-350' : 'text-slate-600'}`}>
              {selectedTable.description}
            </p>

            <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-slate-450' : 'text-slate-400'}`}>Skema Kolom</h4>
            <div className="overflow-x-auto custom-scrollbar border rounded-xl border-slate-200 dark:border-slate-800">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className={isDark ? 'bg-slate-900 text-slate-300' : 'bg-slate-50 text-slate-700'}>
                    <th className="px-4 py-2.5 font-semibold">Kolom</th>
                    <th className="px-4 py-2.5 font-semibold">Tipe</th>
                    <th className="px-4 py-2.5 font-semibold">Keterangan</th>
                    <th className="px-4 py-2.5 font-semibold">Contoh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedTable.columns.map((c, idx) => (
                    <tr key={idx} className={isDark ? 'hover:bg-slate-900/35' : 'hover:bg-slate-50/55'}>
                      <td className="px-4 py-2.5 font-mono text-[11px] font-semibold flex items-center space-x-1">
                        {c.key === 'PK' && <span title="Primary Key"><Key className="h-3 w-3 text-amber-500" /></span>}
                        {c.key === 'FK' && <span title={`Foreign Key referencing ${c.ref}`}><Link className="h-3 w-3 text-emerald-500" /></span>}
                        <span className={c.key ? 'text-blue-500' : ''}>{c.name}</span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[10px] text-slate-400">{c.type}</td>
                      <td className={`px-4 py-2.5 text-xs ${isDark ? 'text-slate-300' : 'text-slate-650'}`}>
                        {c.desc}
                        {c.ref && (
                          <span className="block text-[10px] text-emerald-500 font-mono mt-0.5">
                            ↳ Relasi: {c.ref}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[10px] text-slate-500">{c.example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sample Queries */}
          <div className={`rounded-2xl border p-5 shadow-sm transition-all duration-300 ${
            isDark ? 'border-slate-800 bg-slate-900/40 text-slate-100' : 'border-slate-200 bg-white'
          }`}>
            <div className="flex items-center space-x-2 mb-4 text-indigo-550">
              <BookOpen className="h-4.5 w-4.5" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Contoh Pola Kueri SQL</h3>
            </div>
            <div className="space-y-4">
              {selectedTable.samples.map((s, idx) => (
                <div key={idx} className="space-y-1.5">
                  <p className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-750'}`}>{s.explanation}</p>
                  <pre className={`p-3 rounded-xl font-mono text-[10.5px] overflow-x-auto leading-relaxed border ${
                    isDark 
                      ? 'bg-slate-950 border-slate-850 text-blue-300' 
                      : 'bg-slate-50 border-slate-150 text-blue-700'
                  }`}>
                    {s.q}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export { KnowledgePage };

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
      { name: 'Nrp', type: 'VARCHAR', key: 'PK', desc: 'Nomor induk karyawan', example: "'00020'" },
      { name: 'Name', type: 'VARCHAR', desc: 'Nama lengkap karyawan', example: "'FUTTUH'" },
      { name: 'Dept', type: 'VARCHAR', desc: 'Departemen penempatan', example: "'IT', 'MARKETING', 'HRD'" },
      { name: 'status', type: 'VARCHAR', desc: 'Status karyawan', example: "'Aktif'" },
    ],
    samples: [
      { q: "SELECT Nrp, Name, Dept, status FROM TD_karyawan WHERE status = 'Aktif';", explanation: "Mengambil karyawan aktif tanpa kolom password." },
      { q: "SELECT Dept, COUNT(*) AS Total FROM TD_karyawan GROUP BY Dept;", explanation: "Menghitung total karyawan per departemen." }
    ]
  },
  {
    id: 'TD_COMPUTER',
    name: 'TD_COMPUTER',
    description: 'Menyimpan data inventaris aset komputer yang dipegang oleh karyawan.',
    columns: [
      { name: 'CodeCpu', type: 'VARCHAR', key: 'PK', desc: 'Kode unik aset komputer', example: "'C1513', 'C2306'" },
      { name: 'Nrp', type: 'VARCHAR', key: 'FK', ref: 'TD_karyawan.Nrp', desc: 'NRP pemegang aset', example: "'00020'" },
      { name: 'Jenis', type: 'VARCHAR', desc: 'Kategori perangkat', example: "'NOTEBOOK', 'PC', 'ALL IN ONE', 'SERVER'" },
      { name: 'CPU_Merk', type: 'VARCHAR', desc: 'Merek produsen perangkat', example: "'Lenovo', 'DELL', 'HP', 'Asus'" },
      { name: 'CPU_Type', type: 'VARCHAR', desc: 'Model atau seri perangkat', example: "'Thinkpad E470', 'Optiplex 330'" },
      { name: 'OS', type: 'VARCHAR', desc: 'Sistem operasi yang terpasang', example: "'Windows 10', 'WIN 11', 'Win 7 Pro'" },
      { name: 'Aktif', type: 'VARCHAR', desc: 'Kode status aset; Y berarti aktif', example: "'Y', 'W', 'P', 'N'" },
    ],
    samples: [
      { q: "SELECT CodeCpu, Jenis, CPU_Merk, CPU_Type, UserNama, Dept FROM TD_computer WHERE Jenis = 'NOTEBOOK';", explanation: "Melihat semua perangkat kategori laptop/notebook." },
      { q: "SELECT CPU_Merk, COUNT(*) AS Total FROM TD_computer GROUP BY CPU_Merk;", explanation: "Mengelompokkan jumlah komputer per merek." }
    ]
  },
  {
    id: 'TD_TICKET',
    name: 'TD_TICKET',
    description: 'Menyimpan pengajuan laporan kendala IT (IT Support Helpdesk).',
    columns: [
      { name: 'NRP', type: 'VARCHAR', desc: 'NRP pelapor', example: "'00020'" },
      { name: 'name', type: 'VARCHAR', desc: 'Nama pelapor', example: "'FUTTUH'" },
      { name: 'problem', type: 'VARCHAR', desc: 'Deskripsi masalah', example: "'Komputer tidak menyala'" },
      { name: 'NoWO', type: 'NCHAR', desc: 'Nomor work order terkait', example: "'1312-001'" },
      { name: 'tgl', type: 'DATE', desc: 'Tanggal tiket dibuat', example: "'2026-07-02'" },
      { name: 'tglupdate', type: 'SMALLDATETIME', desc: 'Waktu pembaruan tiket', example: "'2026-07-02 14:30'" },
    ],
    samples: [
      { q: "SELECT NRP, name, problem, NoWO, tgl, tglupdate FROM TD_TICKET;", explanation: "Melihat data tiket yang tersedia." },
      { q: "SELECT YEAR(tgl) AS Tahun, COUNT(*) AS Total FROM TD_TICKET GROUP BY YEAR(tgl);", explanation: "Menghitung tiket per tahun." }
    ]
  },
  {
    id: 'TD_WO',
    name: 'TD_WO',
    description: 'Log instruksi pengerjaan pimpinan teknisi (Work Order) untuk memecahkan kendala tiket IT.',
    columns: [
      { name: 'NoWO', type: 'VARCHAR', key: 'PK', desc: 'Nomor work order', example: "'1312-001'" },
      { name: 'Date', type: 'DATETIME', desc: 'Tanggal work order', example: "'2026-07-02'" },
      { name: 'Dept', type: 'VARCHAR', desc: 'Departemen terkait', example: "'IT', 'GA'" },
      { name: 'Type', type: 'VARCHAR', desc: 'Kelompok pekerjaan', example: "'Infrastruktur', 'System'" },
      { name: 'JenisWO', type: 'VARCHAR', desc: 'Jenis pekerjaan', example: "'Perbaikan', 'Pengadaan'" },
      { name: 'Uraiankerusakan', type: 'VARCHAR', desc: 'Uraian masalah', example: "'Monitor tidak menyala'" },
      { name: 'TotalDowntime', type: 'INT', desc: 'Downtime dalam menit', example: "120" },
      { name: 'ITPic', type: 'VARCHAR', desc: 'PIC teknisi', example: "'INDRA', 'GIAN', 'SENDY'" },
      { name: 'Closed', type: 'SMALLINT', desc: '1 selesai, 0 terbuka', example: "1, 0" },
    ],
    samples: [
      { q: "SELECT NoWO, Date, Dept, Uraiankerusakan, ITPic FROM TD_WO WHERE Closed = 0;", explanation: "Mencari work order yang masih terbuka." },
      { q: "SELECT ITPic, COUNT(*) AS Total FROM TD_WO WHERE Closed = 1 GROUP BY ITPic;", explanation: "Jumlah work order selesai per PIC." }
    ]
  },
  {
    id: 'TD_monitor',
    name: 'TD_monitor',
    description: 'Inventaris monitor dan relasinya dengan komputer.',
    columns: [
      { name: 'CodeMtr', type: 'VARCHAR', desc: 'Kode monitor', example: "'M1201'" },
      { name: 'Monitor_Merk', type: 'VARCHAR', desc: 'Merek monitor', example: "'DELL', 'LG'" },
      { name: 'Monitor_Type', type: 'VARCHAR', desc: 'Model monitor', example: "'E1916H'" },
      { name: 'Dept', type: 'VARCHAR', desc: 'Departemen pengguna', example: "'IT'" },
      { name: 'Aktif', type: 'VARCHAR', desc: 'Kode status monitor', example: "'Y'" },
      { name: 'CodeCpu', type: 'VARCHAR', ref: 'TD_computer.CodeCpu', desc: 'Komputer yang terhubung', example: "'C1513'" },
    ],
    samples: [
      { q: "SELECT CodeMtr, Monitor_Merk, Monitor_Type, Dept, Aktif, CodeCpu FROM TD_monitor WHERE Aktif = 'Y';", explanation: "Daftar monitor aktif." }
    ]
  },
  {
    id: 'TD_printer',
    name: 'TD_printer',
    description: 'Inventaris printer beserta toner dan pengguna.',
    columns: [
      { name: 'CodePrn', type: 'VARCHAR', key: 'PK', desc: 'Kode printer', example: "'P1201'" },
      { name: 'Jenis', type: 'VARCHAR', desc: 'Jenis printer', example: "'LASER'" },
      { name: 'Merk', type: 'VARCHAR', desc: 'Merek printer', example: "'HP', 'EPSON'" },
      { name: 'Type', type: 'VARCHAR', desc: 'Model printer', example: "'LQ-2190'" },
      { name: 'Toner', type: 'VARCHAR', desc: 'Jenis toner', example: "'85A'" },
      { name: 'Usernama', type: 'VARCHAR', desc: 'Pengguna printer', example: "'BUDI'" },
      { name: 'Dept', type: 'VARCHAR', desc: 'Departemen pengguna', example: "'GA'" },
      { name: 'Aktif', type: 'VARCHAR', desc: 'Kode status printer', example: "'Y'" },
    ],
    samples: [
      { q: "SELECT CodePrn, Jenis, Merk, Type, Toner, Usernama, Dept FROM TD_printer WHERE Aktif = 'Y';", explanation: "Daftar printer aktif." }
    ]
  },
  {
    id: 'TD_CCTV',
    name: 'TD_CCTV',
    description: 'Lokasi, DVR, kamera, PIC, dan status CCTV.',
    columns: [
      { name: 'id', type: 'INT', key: 'PK', desc: 'ID data CCTV', example: "1" },
      { name: 'lokasi_dvr', type: 'VARCHAR', desc: 'Lokasi DVR', example: "'Gedung A'" },
      { name: 'lokasi_kamera', type: 'VARCHAR', desc: 'Lokasi kamera', example: "'Lobby'" },
      { name: 'bagian', type: 'VARCHAR', desc: 'Bagian terkait', example: "'Security'" },
      { name: 'status', type: 'VARCHAR', desc: 'Status kamera', example: "'Aktif'" },
      { name: 'jumlah', type: 'INT', desc: 'Jumlah kamera', example: "4" },
    ],
    samples: [
      { q: "SELECT status, SUM(jumlah) AS Total FROM TD_CCTV GROUP BY status;", explanation: "Jumlah CCTV berdasarkan status." }
    ]
  },
  {
    id: 'TD_License',
    name: 'TD_License',
    description: 'Inventaris lisensi software dan masa berlakunya.',
    columns: [
      { name: 'NoLicense', type: 'VARCHAR', key: 'PK', desc: 'Nomor lisensi', example: "'LIC-001'" },
      { name: 'descs', type: 'VARCHAR', desc: 'Deskripsi lisensi', example: "'Antivirus'" },
      { name: 'tglexpired', type: 'DATE', desc: 'Tanggal kedaluwarsa', example: "'2026-12-31'" },
      { name: 'tglrenewal', type: 'DATE', desc: 'Tanggal pembaruan', example: "'2026-01-01'" },
      { name: 'supplier', type: 'VARCHAR', desc: 'Supplier lisensi', example: "'Vendor A'" },
      { name: 'qty', type: 'INT', desc: 'Jumlah lisensi', example: "10" },
    ],
    samples: [
      { q: "SELECT NoLicense, descs, tglexpired, tglrenewal, supplier, deviceinstall, qty FROM TD_License ORDER BY tglexpired;", explanation: "Jadwal masa berlaku seluruh lisensi." }
    ]
  },
  {
    id: 'TD_dataToner',
    name: 'TD_dataToner',
    description: 'Riwayat distribusi toner ke bagian dan penerima.',
    columns: [
      { name: 'jenisBarang', type: 'NVARCHAR', desc: 'Jenis toner/barang', example: "'Toner 85A'" },
      { name: 'qty', type: 'SMALLINT', desc: 'Jumlah distribusi', example: "2" },
      { name: 'bagian', type: 'VARCHAR', desc: 'Bagian penerima', example: "'IT'" },
      { name: 'namaPenerima', type: 'VARCHAR', desc: 'Nama penerima', example: "'BUDI'" },
      { name: 'tanggal', type: 'SMALLDATETIME', desc: 'Tanggal distribusi', example: "'2026-07-01'" },
    ],
    samples: [
      { q: "SELECT bagian, SUM(qty) AS Total FROM TD_dataToner GROUP BY bagian;", explanation: "Total distribusi toner per bagian." }
    ]
  },
  {
    id: 'TD_ITPIC',
    name: 'TD_ITPIC',
    description: 'Master PIC IT. Kolom password sengaja tidak diekspos.',
    columns: [
      { name: 'nrp', type: 'VARCHAR', key: 'PK', desc: 'NRP PIC IT', example: "'00020'" },
      { name: 'nama', type: 'VARCHAR', desc: 'Nama PIC IT', example: "'INDRA'" },
      { name: 'ket', type: 'VARCHAR', desc: 'Keterangan PIC', example: "'Staff IT'" },
      { name: 'bloked', type: 'BIT', desc: 'Status blokir akun', example: "0, 1" },
      { name: 'groupId', type: 'VARCHAR', ref: 'TD_Grup.groupId', desc: 'Grup PIC', example: "'IT'" },
    ],
    samples: [
      { q: "SELECT nrp, nama, ket, bloked, groupId FROM TD_ITPIC;", explanation: "Daftar PIC IT tanpa data autentikasi." }
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

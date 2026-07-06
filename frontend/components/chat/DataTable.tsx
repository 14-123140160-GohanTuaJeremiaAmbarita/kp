import React, { useState, useEffect } from 'react';

interface DataTableProps {
  jsonResult: string;
  theme?: 'light' | 'dark';
}

export default function DataTable({ jsonResult, theme = 'dark' }: DataTableProps) {
  const isDark = theme === 'dark';
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Reset page when new result arrives
  useEffect(() => {
    setCurrentPage(1);
  }, [jsonResult]);

  try {
    const data: any[] = JSON.parse(jsonResult);
    if (!Array.isArray(data) || data.length === 0) {
      return (
        <div className={`p-3 text-center text-[11px] transition-colors duration-300 ${
          isDark ? 'text-slate-500 bg-slate-950' : 'text-slate-400 bg-slate-50'
        }`}>
          Kueri berhasil dijalankan namun tidak mengembalikan baris data (Empty Set).
        </div>
      );
    }

    const headers = Object.keys(data[0]);
    const totalRows = data.length;
    const totalPages = Math.ceil(totalRows / pageSize);

    // Calculate dynamic paging slice
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalRows);
    const displayedData = data.slice(startIndex, endIndex);

    return (
      <div className={`flex flex-col transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
        <div className={`overflow-x-auto w-full custom-scrollbar border-t selection:bg-blue-500/20 transition-colors duration-300 ${
          isDark ? 'border-slate-900 bg-slate-950' : 'border-slate-200 bg-white'
        }`}>
          <table className="w-full text-left border-collapse font-mono text-[10px]">
            <thead>
              <tr className={`border-b text-slate-400 uppercase tracking-wider transition-colors duration-300 ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}>
                {headers.map((h, i) => (
                  <th key={i} className={`px-3 py-2.5 font-semibold whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedData.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className={`border-b transition duration-150 ${
                    isDark 
                      ? 'border-slate-900 hover:bg-slate-900/40 text-slate-300' 
                      : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {headers.map((h, colIndex) => (
                    <td key={colIndex} className="px-3 py-2 max-w-xs truncate">{String(row[h] ?? 'NULL')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Navigation Footer */}
        <div className={`p-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] transition-colors duration-300 ${
          isDark ? 'bg-slate-950 border-slate-900 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <div>
            Menampilkan <span className="font-semibold">{totalRows > 0 ? startIndex + 1 : 0}</span>-
            <span className="font-semibold">{endIndex}</span> dari <span className="font-semibold">{totalRows}</span> baris
          </div>

          <div className="flex items-center space-x-6">
            {/* Page Size Select Dropdown */}
            <div className="flex items-center space-x-1.5">
              <span>Tampilkan:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className={`px-2 py-0.5 rounded border text-[11px] font-sans cursor-pointer focus:outline-none focus:border-blue-500 transition-colors duration-300 ${
                  isDark 
                    ? 'bg-slate-900 border-slate-800 text-slate-300' 
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>baris</span>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-2.5 py-1 rounded border text-[10px] font-semibold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  isDark 
                    ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Sebelumnya
              </button>
              <span className="text-[10px]">
                Halaman <span className="font-semibold">{currentPage}</span> dari <span className="font-semibold">{totalPages}</span>
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`px-2.5 py-1 rounded border text-[10px] font-semibold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  isDark 
                    ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (err) {
    return (
      <div className={`p-3 text-rose-400 text-[11px] font-mono transition-colors duration-300 ${
        isDark ? 'bg-slate-950' : 'bg-slate-50'
      }`}>
        Kesalahan parsing hasil data kueri: {String(err)}
      </div>
    );
  }
}

export { DataTable as SqlResultTable };


import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Database, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface DataTableProps {
  jsonResult: string;
  theme?: 'light' | 'dark';
}

type SortDirection = 'asc' | 'desc' | null;

export default function DataTable({ jsonResult, theme = 'dark' }: DataTableProps) {
  const isDark = theme === 'dark';
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  // Reset page when new result arrives
  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm('');
    setSortColumn(null);
    setSortDirection(null);
  }, [jsonResult]);

  try {
    const data: any[] = JSON.parse(jsonResult);
    if (!Array.isArray(data) || data.length === 0) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 text-center text-xs rounded-2xl border transition-colors duration-300 ${
            isDark ? 'text-slate-500 bg-slate-900/60 border-slate-700/50' : 'text-slate-400 bg-slate-50 border-slate-200'
          }`}
        >
          <Database className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <div className="font-medium">Kueri berhasil dijalankan namun tidak mengembalikan baris data.</div>
          <div className="text-[10px] mt-1 opacity-60">(Empty Result Set)</div>
        </motion.div>
      );
    }

    const headers = Object.keys(data[0]);

    // Filtered data
    const filteredData = useMemo(() => {
      if (!searchTerm.trim()) return data;
      const term = searchTerm.toLowerCase();
      return data.filter(row => 
        headers.some(h => String(row[h] ?? '').toLowerCase().includes(term))
      );
    }, [data, searchTerm, headers]);

    // Sorted data
    const sortedData = useMemo(() => {
      if (!sortColumn || !sortDirection) return filteredData;
      return [...filteredData].sort((a, b) => {
        const valA = a[sortColumn] ?? '';
        const valB = b[sortColumn] ?? '';
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (sortDirection === 'asc') return strA.localeCompare(strB);
        return strB.localeCompare(strA);
      });
    }, [filteredData, sortColumn, sortDirection]);

    const totalRows = sortedData.length;
    const totalPages = Math.ceil(totalRows / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalRows);
    const displayedData = sortedData.slice(startIndex, endIndex);

    const handleSort = (column: string) => {
      if (sortColumn === column) {
        if (sortDirection === 'asc') setSortDirection('desc');
        else if (sortDirection === 'desc') { setSortColumn(null); setSortDirection(null); }
        else setSortDirection('asc');
      } else {
        setSortColumn(column);
        setSortDirection('asc');
      }
      setCurrentPage(1);
    };

    const getSortIcon = (column: string) => {
      if (sortColumn !== column) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
      if (sortDirection === 'asc') return <ArrowUp className="w-3 h-3 text-blue-400" />;
      return <ArrowDown className="w-3 h-3 text-blue-400" />;
    };

    // Detect column types for styling
    const isNumericColumn = (h: string) => {
      const sample = data.slice(0, 5);
      return sample.every(row => typeof row[h] === 'number' || (row[h] !== null && !isNaN(Number(row[h]))));
    };

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`flex flex-col mt-4 mb-2 rounded-2xl overflow-hidden border shadow-lg transition-all duration-300 backdrop-blur-xl ${
          isDark 
            ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-700/40 shadow-slate-950/50' 
            : 'bg-gradient-to-b from-white to-slate-50 border-slate-200/80 shadow-slate-200/50'
        }`}
      >
        {/* Header */}
        <div className={`px-4 py-3 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${
          isDark ? 'border-slate-800/50 bg-slate-800/20' : 'border-slate-100 bg-slate-50/60'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className={`p-1.5 rounded-lg ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
              <Database className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                Data Explorer
              </span>
              <div className={`text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {data.length} baris • {headers.length} kolom
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {/* Search */}
            <div className={`flex items-center flex-1 sm:flex-initial px-3 py-1.5 rounded-lg border transition-all focus-within:ring-2 focus-within:ring-blue-500/30 ${
              isDark ? 'bg-slate-800/60 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'
            }`}>
              <Search className="w-3.5 h-3.5 opacity-40 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Cari data..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className={`bg-transparent outline-none text-[11px] font-medium w-full placeholder:opacity-50 ${
                  isDark ? 'text-slate-200 placeholder:text-slate-500' : 'text-slate-700 placeholder:text-slate-400'
                }`}
              />
            </div>
            
            {/* Row Count Badge */}
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
              totalRows !== data.length
                ? (isDark ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-amber-50 text-amber-600 border border-amber-200')
                : (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
            }`}>
              {totalRows !== data.length ? `${totalRows} hasil` : `${totalRows} baris`}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full custom-scrollbar selection:bg-blue-500/20">
          <table className="w-full text-left border-collapse font-sans text-[11px]">
            <thead>
              <tr className={isDark ? 'bg-slate-800/40' : 'bg-slate-50/80'}>
                <th className={`px-4 py-3 text-center font-bold text-[10px] uppercase tracking-widest whitespace-nowrap ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}>#</th>
                {headers.map((h, i) => (
                  <th 
                    key={i}
                    onClick={() => handleSort(h)}
                    className={`px-4 py-3 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap cursor-pointer select-none transition-colors group ${
                      isDark 
                        ? `text-slate-400 hover:text-slate-200 ${sortColumn === h ? 'text-blue-400' : ''}` 
                        : `text-slate-500 hover:text-slate-800 ${sortColumn === h ? 'text-blue-600' : ''}`
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>{h}</span>
                      {getSortIcon(h)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedData.map((row, rowIndex) => {
                const globalIndex = startIndex + rowIndex;
                return (
                  <motion.tr
                    key={rowIndex}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15, delay: rowIndex * 0.01 }}
                    onMouseEnter={() => setHoveredRow(globalIndex)}
                    onMouseLeave={() => setHoveredRow(null)}
                    className={`border-b last:border-b-0 transition-all duration-150 ${
                      isDark 
                        ? `border-slate-800/30 text-slate-300 ${hoveredRow === globalIndex ? 'bg-blue-500/5' : (rowIndex % 2 === 0 ? 'bg-transparent' : 'bg-slate-800/10')}` 
                        : `border-slate-100 text-slate-700 ${hoveredRow === globalIndex ? 'bg-blue-50/50' : (rowIndex % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/30')}`
                    }`}
                  >
                    <td className={`px-4 py-2.5 text-center text-[10px] font-mono font-bold ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>
                      {globalIndex + 1}
                    </td>
                    {headers.map((h, colIndex) => {
                      const val = row[h];
                      const isNum = isNumericColumn(h);
                      return (
                        <td 
                          key={colIndex} 
                          className={`px-4 py-2.5 max-w-[200px] truncate ${isNum ? 'text-right font-mono font-semibold tabular-nums' : ''}`}
                          title={String(val ?? 'NULL')}
                        >
                          {val === null || val === undefined ? (
                            <span className={`italic text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>NULL</span>
                          ) : isNum ? (
                            <span className={isDark ? 'text-sky-300' : 'text-sky-700'}>
                              {Number(val).toLocaleString('id-ID')}
                            </span>
                          ) : (
                            String(val)
                          )}
                        </td>
                      );
                    })}
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className={`px-4 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-medium transition-colors duration-300 ${
          isDark ? 'bg-slate-900/30 border-slate-800/50 text-slate-400' : 'bg-slate-50/50 border-slate-200 text-slate-600'
        }`}>
          <div className="flex items-center space-x-1">
            <span className="opacity-70">Menampilkan</span>
            <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{totalRows > 0 ? startIndex + 1 : 0}–{endIndex}</span>
            <span className="opacity-70">dari</span>
            <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{totalRows}</span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Page Size Selector */}
            <div className="hidden sm:flex items-center space-x-2">
              <span className="opacity-70 text-[10px]">Baris:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className={`px-2 py-1 rounded-lg border text-[11px] font-bold cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/40 transition-all ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-700'
                }`}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Page Navigation */}
            <div className={`flex items-center rounded-xl overflow-hidden border ${isDark ? 'border-slate-700 bg-slate-800/40' : 'border-slate-200 bg-white'}`}>
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className={`p-2 transition-all disabled:opacity-20 disabled:cursor-not-allowed ${
                  isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Halaman pertama"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 transition-all disabled:opacity-20 disabled:cursor-not-allowed border-l ${
                  isDark ? 'text-slate-300 hover:bg-slate-700 border-slate-700' : 'text-slate-600 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <div className={`px-3 py-1.5 text-[10px] font-bold tracking-wider border-x ${
                isDark ? 'text-blue-400 border-slate-700 bg-slate-800/60' : 'text-blue-600 border-slate-200 bg-blue-50/30'
              }`}>
                {currentPage} / {totalPages || 1}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`p-2 transition-all disabled:opacity-20 disabled:cursor-not-allowed border-r ${
                  isDark ? 'text-slate-300 hover:bg-slate-700 border-slate-700' : 'text-slate-600 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`p-2 transition-all disabled:opacity-20 disabled:cursor-not-allowed ${
                  isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Halaman terakhir"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  } catch (err) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 mt-2 rounded-xl text-[12px] border transition-colors duration-300 ${
          isDark ? 'bg-rose-950/30 border-rose-900/50 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-600'
        }`}
      >
        <div className="font-bold mb-1">Kesalahan Format Data</div>
        <div className="font-mono text-[10px] opacity-80">{String(err)}</div>
      </motion.div>
    );
  }
}

export { DataTable as SqlResultTable };

import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Download, FileText } from 'lucide-react';

interface SqlCardProps {
  sqlQuery: string;
  sqlResult?: string;
  onExportExcel: (sql: string) => void;
  onExportPDF: (sql: string, result: string, userQuestion?: string) => void;
  userQuestion?: string;
  theme?: 'light' | 'dark';
}

export default function SqlCard({
  sqlQuery,
  sqlResult,
  onExportExcel,
  onExportPDF,
  userQuestion,
  theme,
}: SqlCardProps) {
  const isDark = theme === 'dark';

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className={`rounded-xl border overflow-hidden shadow-md mt-2 transition-colors duration-300 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      {/* SQL query title block */}
      <div className={`px-3 py-2 border-b flex items-center justify-between transition-colors duration-300 ${
        isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center space-x-1.5 text-[10px] font-mono text-blue-500">
          <Cpu className="h-3 w-3" />
          <span>SQL GENERATED (READONLY)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <button 
            onClick={() => onExportExcel(sqlQuery)}
            className="flex items-center space-x-1 text-[10px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded transition cursor-pointer"
          >
            <Download className="h-3 w-3" />
            <span>Export Excel</span>
          </button>
          {sqlResult && (
            <button 
              onClick={() => onExportPDF(sqlQuery, sqlResult, userQuestion)}
              className="flex items-center space-x-1 text-[10px] font-semibold bg-rose-600 hover:bg-rose-500 text-white px-2 py-1 rounded transition cursor-pointer"
            >
              <FileText className="h-3 w-3" />
              <span>Export PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Code box */}
      <div className={`p-3 font-mono text-[11px] overflow-x-auto leading-relaxed border-b selection:bg-blue-500/20 transition-colors ${
        isDark ? 'text-slate-300 bg-slate-950 border-slate-800/60' : 'text-slate-700 bg-slate-50 border-slate-200/60'
      }`}>
        {sqlQuery}
      </div>
    </motion.div>
  );
}

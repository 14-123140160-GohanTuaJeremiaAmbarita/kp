import React from 'react';

interface DataTableProps {
  jsonResult: string;
}

export default function DataTable({ jsonResult }: DataTableProps) {
  try {
    const data: any[] = JSON.parse(jsonResult);
    if (!Array.isArray(data) || data.length === 0) {
      return (
        <div className="p-3 text-center text-slate-500 text-[11px] bg-slate-950">
          Kueri berhasil dijalankan namun tidak mengembalikan baris data (Empty Set).
        </div>
      );
    }

    const headers = Object.keys(data[0]);

    return (
      <div className="overflow-x-auto w-full custom-scrollbar border-t border-slate-900 bg-slate-950 selection:bg-blue-500/20">
        <table className="w-full text-left border-collapse font-mono text-[10px]">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
              {headers.map((h, i) => (
                <th key={i} className="px-3 py-2 font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className="border-b border-slate-900 hover:bg-slate-900/40 text-slate-300 transition"
              >
                {headers.map((h, colIndex) => (
                  <td key={colIndex} className="px-3 py-2 max-w-xs truncate">{String(row[h] ?? 'NULL')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  } catch (err) {
    return (
      <div className="p-3 text-rose-400 text-[11px] font-mono bg-slate-950">
        Kesalahan parsing hasil data kueri: {String(err)}
      </div>
    );
  }
}
export { DataTable as SqlResultTable };

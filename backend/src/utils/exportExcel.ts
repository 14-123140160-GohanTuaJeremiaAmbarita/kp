import * as xlsx from 'xlsx';

/**
 * Generates an Excel spreadsheet binary buffer from database query results.
 */
export function generateExcelBuffer(rows: any[]): Buffer {
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(rows);
  xlsx.utils.book_append_sheet(wb, ws, 'Hasil Query IT');
  
  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
}

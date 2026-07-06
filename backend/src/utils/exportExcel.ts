import ExcelJS from 'exceljs';

/**
 * Generates an Excel spreadsheet binary buffer from database query results using ExcelJS.
 */
export async function generateExcelBuffer(rows: any[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Hasil Query IT');

  // Ensure grid lines are visible
  worksheet.views = [{ showGridLines: true }];

  // Title Block (PT VOKSEL ELECTRIC TBK)
  worksheet.mergeCells('A1:J1');
  const titleRow = worksheet.getRow(1);
  titleRow.getCell(1).value = 'PT VOKSEL ELECTRIC TBK';
  titleRow.getCell(1).font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF0F172A' } }; // slate-900
  titleRow.height = 30;
  titleRow.getCell(1).alignment = { vertical: 'middle' };

  worksheet.mergeCells('A2:J2');
  const subTitleRow = worksheet.getRow(2);
  subTitleRow.getCell(1).value = 'Smart IT Assistant - Laporan Ekspor Operasional IT';
  subTitleRow.getCell(1).font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF64748B' } }; // slate-500
  subTitleRow.height = 20;
  subTitleRow.getCell(1).alignment = { vertical: 'middle' };

  worksheet.mergeCells('A3:J3');
  const dateRow = worksheet.getRow(3);
  dateRow.getCell(1).value = `Tanggal Ekspor: ${new Date().toLocaleString('id-ID')}`;
  dateRow.getCell(1).font = { name: 'Arial', size: 9, color: { argb: 'FF64748B' } }; // slate-500
  dateRow.height = 18;
  dateRow.getCell(1).alignment = { vertical: 'middle' };

  // Space row
  worksheet.addRow([]);

  if (rows.length > 0) {
    const keys = Object.keys(rows[0]);

    // Header Row
    const headerRow = worksheet.addRow(keys);
    headerRow.height = 26;

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2563EB' } // blue-600
      };
      cell.font = {
        name: 'Arial',
        size: 11,
        bold: true,
        color: { argb: 'FFFFFFFF' }
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: false
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'medium', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
      };
    });

    // Data Rows
    rows.forEach((row, rowIndex) => {
      const rowValues = keys.map(key => row[key]);

      const r = worksheet.addRow(rowValues);
      r.height = 20;

      r.eachCell((cell, colIndex) => {
        const key = keys[colIndex - 1];
        const val = row[key];

        // Format dates
        if (val instanceof Date) {
          cell.value = val;
          cell.numFmt = 'yyyy-mm-dd hh:mm:ss';
        } else if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
          const dateObj = new Date(val);
          if (!isNaN(dateObj.getTime())) {
            cell.value = dateObj;
            cell.numFmt = val.includes('T') ? 'yyyy-mm-dd hh:mm:ss' : 'yyyy-mm-dd';
          }
        } else {
          cell.value = val ?? 'NULL';
        }

        cell.font = {
          name: 'Arial',
          size: 10,
          color: { argb: cell.value === 'NULL' ? 'FF94A3B8' : 'FF334155' } // slate-400 for NULL, slate-700 for text
        };

        // Alignments
        cell.alignment = {
          vertical: 'middle',
          horizontal: typeof val === 'number' ? 'right' : 'left'
        };

        // Alternate zebra striping (alternate row colors)
        if (rowIndex % 2 === 1) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' } // slate-50
          };
        }

        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };
      });
    });

    // Auto-fit Columns width
    worksheet.columns.forEach((col, colIndex) => {
      const key = keys[colIndex];
      let maxLen = key ? key.length : 10;

      // Scan starting at row 5 (where data rows begin)
      if (col.values) {
        for (let i = 5; i < col.values.length; i++) {
          const val = col.values[i];
          if (val !== undefined && val !== null) {
            let strVal = '';
            if (val instanceof Date) {
              strVal = val.toLocaleDateString('id-ID');
            } else {
              strVal = String(val);
            }
            if (strVal.length > maxLen) {
              maxLen = strVal.length;
            }
          }
        }
      }

      col.width = Math.min(Math.max(maxLen + 4, 12), 40);
    });
  }

  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
  return buffer;
}


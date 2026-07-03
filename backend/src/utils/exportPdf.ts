/**
 * Scaffold for server-side PDF generation if needed in production.
 * Currently, PDF generation is handled directly in the browser via jsPDF for speed and styling control.
 */
export function generatePdfBuffer(rows: any[]): Buffer {
  throw new Error('Server-side PDF generation is not implemented. Use client-side PDF renderer.');
}

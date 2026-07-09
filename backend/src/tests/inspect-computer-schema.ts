import mssql from 'mssql';
import { loadEnv } from '../utils/env';

loadEnv();

async function main() {
  const pool = await mssql.connect({
    server: process.env.DB_SERVER!,
    port: Number(process.env.DB_PORT || 1433),
    database: process.env.DB_DATABASE!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    options: { encrypt: false, trustServerCertificate: true },
  });

  const columns = await pool.request().query(`
    SELECT COLUMN_NAME, DATA_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'TD_computer'
    ORDER BY ORDINAL_POSITION
  `);
  console.table(columns.recordset);

  for (const column of [
    'Jenis', 'CPU_Merk', 'CPU_Type', 'OS', 'Aktif', 'Dept', 'Departement',
    'Processor', 'Hardisk', 'Memory', 'CPU_Suplier', 'Drive', 'Internet',
    'MSOffice', 'Keterangan', 'perusahaan'
  ]) {
    if (!columns.recordset.some((row: any) => row.COLUMN_NAME.toLowerCase() === column.toLowerCase())) continue;
    const values = await pool.request().query(
      `SELECT ${column} AS Category, COUNT(*) AS Total FROM TD_computer GROUP BY ${column} ORDER BY Total DESC`
    );
    console.log(`\n${column}:`);
    console.table(values.recordset.slice(0, 30));
  }

  await pool.close();
}

main().catch((error) => {
  console.error(`Gagal memeriksa TD_computer: ${error.message}`);
  process.exitCode = 1;
});

import mssql from 'mssql';
import { loadEnv } from '../utils/env';

loadEnv();

const allowedTables = [
  'TD_CCTV', 'TD_computer', 'TD_ComputerHistory', 'TD_dataToner', 'TD_Grup',
  'TD_HardLain', 'TD_IPOthers', 'TD_ITPIC', 'TD_karyawan', 'TD_License',
  'TD_List_Aplikasi', 'TD_monitor', 'TD_PABX', 'TD_PESAN', 'TD_printer', 'TD_SubType',
  'td_tes', 'TD_TICKET', 'TD_TypeWO', 'TD_usersolomon', 'TD_WO', 'TD_WORptIndra'
];

async function main() {
  const pool = await mssql.connect({
    server: process.env.DB_SERVER!,
    port: Number(process.env.DB_PORT || 1433),
    database: process.env.DB_DATABASE!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    options: { encrypt: false, trustServerCertificate: true },
  });

  const tables = await pool.request().query(`
    SELECT TABLE_SCHEMA, TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME LIKE 'TD[_]%'
    ORDER BY TABLE_NAME
  `);
  console.log('TABEL TD_*:', tables.recordset.map((row: any) => `${row.TABLE_SCHEMA}.${row.TABLE_NAME}`).join(', '));

  for (const table of allowedTables) {
    const columns = await pool.request()
      .input('table', mssql.NVarChar(128), table)
      .query(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = @table
        ORDER BY ORDINAL_POSITION
      `);
    const count = await pool.request().query(`SELECT COUNT(*) AS Total FROM ${table}`);
    console.log(`\n${table} (${count.recordset[0].Total} baris)`);
    console.table(columns.recordset);
  }

  const categories: Array<[string, string]> = [
    ['TD_karyawan', 'Dept'], ['TD_karyawan', 'status'],
    ['TD_computer', 'Jenis'], ['TD_computer', 'Aktif'], ['TD_computer', 'perusahaan'],
    ['TD_WO', 'Closed'], ['TD_WO', 'Type'], ['TD_WO', 'JenisWO'],
    ['TD_WO', 'TingkatKesulitan'], ['TD_WO', 'Penyebab'], ['TD_WO', 'ITPic'],
  ];
  for (const [table, column] of categories) {
    const result = await pool.request().query(
      `SELECT ${column} AS Category, COUNT(*) AS Total FROM ${table} GROUP BY ${column} ORDER BY Total DESC`
    );
    console.log(`\n${table}.${column}`);
    console.table(result.recordset.slice(0, 30));
  }

  await pool.close();
}

main().catch((error) => {
  console.error(`Audit database gagal: ${error.message}`);
  process.exitCode = 1;
});

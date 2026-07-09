import assert from 'node:assert/strict';
import mssql from 'mssql';
import { loadEnv } from '../utils/env';
import { SqlService } from '../ai/sql.service';

loadEnv();

const tests = [
  ['semua data komputer', 'SELECT CodeCpu, CPU_RcptDate, Jenis, CPU_Merk, CPU_Type, CPU_SerialNo, Processor, Hardisk, Memory, Nrp, UserNama, Dept, OS, NameComp, Aktif, Keterangan, perusahaan FROM TD_computer', 'CodeCpu'],
  ['jumlah komputer per kategori', 'SELECT Jenis, COUNT(*) AS Total FROM TD_computer GROUP BY Jenis', 'Jenis'],
  ['semua laptop', "SELECT CodeCpu, Jenis, CPU_Merk, CPU_Type, UserNama, Dept, Aktif FROM TD_computer WHERE Jenis = 'NOTEBOOK'", 'Jenis'],
  ['semua PC desktop', "SELECT CodeCpu, Jenis, CPU_Merk, CPU_Type, UserNama, Dept, Aktif FROM TD_computer WHERE Jenis = 'PC'", 'Jenis'],
  ['komputer all in one', "SELECT CodeCpu, Jenis, CPU_Merk, CPU_Type, UserNama, Dept, Aktif FROM TD_computer WHERE Jenis = 'ALL IN ONE'", 'Jenis'],
  ['daftar server', "SELECT CodeCpu, Jenis, CPU_Merk, CPU_Type, NameComp, OS, Aktif FROM TD_computer WHERE Jenis = 'SERVER'", 'Jenis'],
  ['komputer merek Lenovo', "SELECT CodeCpu, Jenis, CPU_Merk, CPU_Type, UserNama, Dept, Aktif FROM TD_computer WHERE CPU_Merk LIKE '%Lenovo%'", 'CPU_Merk'],
  ['model Optiplex', "SELECT CodeCpu, Jenis, CPU_Merk, CPU_Type, UserNama, Dept FROM TD_computer WHERE CPU_Type LIKE '%Optiplex%'", 'CPU_Type'],
  ['komputer Windows 11', "SELECT CodeCpu, Jenis, CPU_Merk, CPU_Type, OS, UserNama, Dept FROM TD_computer WHERE OS LIKE '%11%'", 'OS'],
  ['komputer aktif', "SELECT CodeCpu, Jenis, CPU_Merk, CPU_Type, UserNama, Dept, Aktif FROM TD_computer WHERE Aktif = 'Y'", 'Aktif'],
  ['komputer tidak aktif', "SELECT CodeCpu, Jenis, CPU_Merk, CPU_Type, UserNama, Dept, Aktif FROM TD_computer WHERE Aktif <> 'Y'", 'Aktif'],
  ['jumlah berdasarkan semua kode status', 'SELECT Aktif, COUNT(*) AS Total FROM TD_computer GROUP BY Aktif', 'Aktif'],
  ['komputer departemen HRD', "SELECT CodeCpu, Jenis, CPU_Merk, CPU_Type, UserNama, Dept, Aktif FROM TD_computer WHERE Dept = 'HRD'", 'Dept'],
  ['komputer yang dipakai Futtuh', "SELECT CodeCpu, Jenis, CPU_Merk, CPU_Type, Nrp, UserNama, Dept FROM TD_computer WHERE UserNama LIKE '%Futtuh%'", 'UserNama'],
  ['komputer RAM 16 GB', "SELECT CodeCpu, Jenis, CPU_Merk, CPU_Type, Memory, UserNama FROM TD_computer WHERE REPLACE(UPPER(Memory), ' ', '') LIKE '%16GB%'", 'Memory'],
  ['komputer SSD 512 GB', "SELECT CodeCpu, Jenis, CPU_Merk, CPU_Type, Hardisk, UserNama FROM TD_computer WHERE UPPER(Hardisk) LIKE '%SSD%' AND REPLACE(UPPER(Hardisk), ' ', '') LIKE '%512GB%'", 'Hardisk'],
  ['komputer processor Core i5', "SELECT CodeCpu, Jenis, CPU_Merk, CPU_Type, Processor, UserNama FROM TD_computer WHERE Processor LIKE '%i5%'", 'Processor'],
  ['aset diterima tahun 2024', 'SELECT CodeCpu, CPU_RcptDate, Jenis, CPU_Merk, CPU_Type FROM TD_computer WHERE YEAR(CPU_RcptDate) = 2024', 'CPU_RcptDate'],
  ['aset berumur lebih dari lima tahun', 'SELECT CodeCpu, CPU_RcptDate, Jenis, CPU_Merk, CPU_Type FROM TD_computer WHERE CPU_RcptDate < DATEADD(year, -5, GETDATE())', 'CPU_RcptDate'],
  ['cari serial number', "SELECT CodeCpu, CPU_SerialNo, Jenis, CPU_Merk, CPU_Type FROM TD_computer WHERE CPU_SerialNo LIKE '%ABC%'", 'CPU_SerialNo'],
  ['cari hostname komputer', "SELECT CodeCpu, NameComp, UserNama, Dept, Aktif FROM TD_computer WHERE NameComp LIKE '%IT%'", 'NameComp'],
  ['komputer yang mendapat internet', "SELECT CodeCpu, NameComp, UserNama, Dept, Internet FROM TD_computer WHERE Internet = 'Y'", 'Internet'],
  ['komputer dengan Office 2021', "SELECT CodeCpu, NameComp, UserNama, MSOffice FROM TD_computer WHERE MSOffice LIKE '%2021%'", 'MSOffice'],
  ['aset dari supplier Puri', "SELECT CodeCpu, CPU_RcptDate, Jenis, CPU_Merk, CPU_Suplier FROM TD_computer WHERE CPU_Suplier LIKE '%PURI%'", 'CPU_Suplier'],
  ['aset perusahaan PME', "SELECT CodeCpu, Jenis, CPU_Merk, CPU_Type, perusahaan FROM TD_computer WHERE perusahaan = 'PME'", 'perusahaan'],
  ['komputer yang memiliki monitor', "SELECT CodeCpu, UserNama, Dept, CodeMtr FROM TD_computer WHERE CodeMtr IS NOT NULL AND LTRIM(RTRIM(CodeMtr)) <> ''", 'CodeMtr'],
  ['komputer yang memiliki printer', "SELECT CodeCpu, UserNama, Dept, CodePrn, CodePrn2 FROM TD_computer WHERE (CodePrn IS NOT NULL AND LTRIM(RTRIM(CodePrn)) <> '') OR (CodePrn2 IS NOT NULL AND LTRIM(RTRIM(CodePrn2)) <> '')", 'CodePrn'],
  ['aset yang sudah write off', 'SELECT CodeCpu, Jenis, CPU_Merk, CPU_Type, WriteOffDate FROM TD_computer WHERE WriteOffDate IS NOT NULL', 'WriteOffDate'],
  ['grafik merek komputer aktif', "SELECT CPU_Merk, COUNT(*) AS Total FROM TD_computer WHERE Aktif = 'Y' GROUP BY CPU_Merk", 'CPU_Merk'],
  ['grafik OS per kategori perangkat', 'SELECT Jenis, OS, COUNT(*) AS Total FROM TD_computer GROUP BY Jenis, OS', 'OS'],
] as const;

async function main() {
  const pool = await mssql.connect({
    server: process.env.DB_SERVER!,
    port: Number(process.env.DB_PORT || 1433),
    database: process.env.DB_DATABASE!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    options: { encrypt: false, trustServerCertificate: true },
  });
  const validator = new SqlService();
  let passed = 0;

  for (const [input, sql, expectedColumn] of tests) {
    const validation = validator.validateSql(sql);
    assert.equal(validation.isValid, true, `${input}: ${validation.reason}`);
    const result = await pool.request().query(sql);
    const columns = Object.keys(result.recordset.columns || {});
    assert.ok(columns.some(column => column.toLowerCase() === expectedColumn.toLowerCase()), `${input}: kolom ${expectedColumn} tidak ada`);
    console.log(`PASS #${++passed}: ${input} -> ${result.recordset.length} baris`);
  }

  await pool.close();
  console.log(`HASIL TD_computer: ${passed}/${tests.length} input-output lulus.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

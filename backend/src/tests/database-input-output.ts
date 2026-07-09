import assert from 'node:assert/strict';
import mssql from 'mssql';
import { loadEnv } from '../utils/env';
import { SqlService } from '../ai/sql.service';

loadEnv();

const cases = [
  ['karyawan aktif per departemen', "SELECT Dept, COUNT(*) AS Total FROM TD_karyawan WHERE status = 'Aktif' GROUP BY Dept"],
  ['komputer aktif', "SELECT COUNT(*) AS Total FROM TD_computer WHERE Aktif = 'Y'"],
  ['kategori komputer', 'SELECT Jenis, COUNT(*) AS Total FROM TD_computer GROUP BY Jenis'],
  ['merek komputer', 'SELECT CPU_Merk, COUNT(*) AS Total FROM TD_computer GROUP BY CPU_Merk'],
  ['riwayat pemegang komputer', "SELECT CodeCpu, Nrp, UserNama, Dept, StartDate, EndDate FROM TD_ComputerHistory WHERE CodeCpu = 'C1513'"],
  ['work order terbuka', 'SELECT NoWO, Date, Dept, Uraiankerusakan, ITPic FROM TD_WO WHERE Closed = 0'],
  ['work order selesai per PIC', 'SELECT ITPic, COUNT(*) AS Total FROM TD_WO WHERE Closed = 1 GROUP BY ITPic'],
  ['rata-rata downtime PIC', 'SELECT ITPic, AVG(CAST(TotalDowntime AS FLOAT)) AS RataRataDowntime FROM TD_WO WHERE Closed = 1 GROUP BY ITPic'],
  ['jenis work order', 'SELECT JenisWO, COUNT(*) AS Total FROM TD_WO GROUP BY JenisWO'],
  ['tingkat kesulitan work order', 'SELECT TingkatKesulitan, COUNT(*) AS Total FROM TD_WO GROUP BY TingkatKesulitan'],
  ['monitor aktif', "SELECT CodeMtr, Monitor_Merk, Monitor_Type, Dept, CodeCpu FROM TD_monitor WHERE Aktif = 'Y'"],
  ['monitor berdasarkan merek', 'SELECT Monitor_Merk, COUNT(*) AS Total FROM TD_monitor GROUP BY Monitor_Merk'],
  ['printer aktif', "SELECT CodePrn, Jenis, Merk, Type, Toner, Usernama, Dept FROM TD_printer WHERE Aktif = 'Y'"],
  ['kebutuhan toner printer', 'SELECT Toner, COUNT(*) AS TotalPrinter FROM TD_printer GROUP BY Toner'],
  ['distribusi toner per bagian', 'SELECT bagian, SUM(qty) AS Total FROM TD_dataToner GROUP BY bagian'],
  ['CCTV berdasarkan status', 'SELECT status, SUM(jumlah) AS Total FROM TD_CCTV GROUP BY status'],
  ['CCTV berdasarkan lokasi', 'SELECT lokasi_kamera, SUM(jumlah) AS Total FROM TD_CCTV GROUP BY lokasi_kamera'],
  ['jadwal lisensi', 'SELECT NoLicense, descs, tglexpired, tglrenewal, supplier, deviceinstall, qty FROM TD_License ORDER BY tglexpired'],
  ['extension PABX', 'SELECT Ext, Nama, line, Bagian FROM TD_PABX'],
  ['perangkat keras lain', "SELECT Codecpu, Jenis, Merk, Type, UserNama, Dept, Aktif FROM TD_HardLain WHERE Aktif = 'Y'"],
  ['IP perangkat lain', 'SELECT CodeCPU, NameComp, UserNama, Dept, NoIP, NoIP1, Mac_Address FROM TD_IPOthers'],
  ['master tipe WO', 'SELECT IDT, Type, TypeWO, No FROM TD_TypeWO'],
  ['master subtipe WO', 'SELECT IDST, SubType, Type FROM TD_SubType'],
  ['master PIC IT aman', 'SELECT nrp, nama, ket, bloked, groupId FROM TD_ITPIC'],
  ['PIC IT beserta grup', 'SELECT p.nrp, p.nama, p.ket, p.bloked, g.description, g.typeUser FROM TD_ITPIC p LEFT JOIN TD_Grup g ON p.groupId = g.groupId'],
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
  const service = new SqlService();
  let passed = 0;
  for (const [input, sql] of cases) {
    const validation = service.validateSql(sql);
    assert.equal(validation.isValid, true, `${input}: ${validation.reason}`);
    const result = await pool.request().query(sql);
    console.log(`PASS #${++passed}: ${input} -> ${result.recordset.length} baris`);
  }
  await pool.close();
  console.log(`HASIL DATABASE: ${passed}/${cases.length} input-output lulus.`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

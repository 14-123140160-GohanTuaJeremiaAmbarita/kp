const { getCompanyDbPool, connectToDatabase } = require('../backend/dist/config/database');
const sql = require('mssql');

async function run() {
  await connectToDatabase();
  const pool = getCompanyDbPool();
  const res = await pool.request().query("SELECT TOP 20 CodeCpu, Jenis, Aktif, Nrp, UserNama, perusahaan, CPU_RcptDate, Keterangan FROM TD_computer WHERE Aktif = 'Y'");
  console.log(JSON.stringify(res.recordset, null, 2));
  process.exit(0);
}
run();

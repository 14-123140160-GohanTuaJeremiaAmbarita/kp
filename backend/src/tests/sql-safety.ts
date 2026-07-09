import assert from 'node:assert/strict';
import { SqlService } from '../ai/sql.service';

const service = new SqlService();
const cases: Array<[string, boolean]> = [
  ['SELECT Nrp, Name, Dept, status FROM TD_karyawan', true],
  ["SELECT Nrp, Name FROM TD_karyawan WHERE Dept IN ('IT', 'HRD')", true],
  ['SELECT Dept, COUNT(*) AS Total FROM TD_karyawan GROUP BY Dept', true],
  ['SELECT CodeCpu, Jenis, CPU_Merk, CPU_Type, Nrp, UserNama, Dept, OS, Aktif FROM TD_computer', true],
  ['SELECT c.CodeCpu, c.Jenis, c.CPU_Merk, k.Name FROM TD_computer c JOIN TD_karyawan k ON k.Nrp = c.Nrp', true],
  ['SELECT * FROM TD_karyawan', false],
  ['SELECT * FROM TD_computer', false],
  ['SELECT k.* FROM TD_karyawan k', false],
  ['SELECT DISTINCT k.* FROM dbo.TD_karyawan k', false],
  ['SELECT Pass FROM TD_karyawan', false],
  ['SELECT k.Password FROM TD_karyawan k', false],
  ['SELECT salary FROM TD_karyawan', false],
  ['DELETE FROM TD_karyawan', false],
  ['UPDATE TD_karyawan SET status = 0', false],
  ['SELECT Name FROM TD_karyawan; DELETE FROM TD_karyawan', false],
  ['SELECT Name INTO backup_karyawan FROM TD_karyawan', false],
  ["SELECT * FROM OPENROWSET('x', 'y', 'z')", false],
  ['SELECT Name FROM TD_karyawan -- bypass', false],
  ['SELECT Name FROM TD_karyawan /* bypass */', false],
  ['EXEC sp_help', false],
  ['', false],
];

let passed = 0;
for (const [sql, expected] of cases) {
  const result = service.validateSql(sql);
  assert.equal(result.isValid, expected, `${sql || '<kosong>'}: ${result.reason || 'valid'}`);
  passed++;
}
console.log(`HASIL SQL SAFETY: ${passed}/${cases.length} lulus.`);

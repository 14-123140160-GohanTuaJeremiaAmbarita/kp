import assert from 'node:assert/strict';
import { SqlService } from '../ai/sql.service';

const cases = [
  'tampilkan notebook berusia 6 tahun',
  'tampilkan komputer aktif merek Lenovo',
  'buat grafik jumlah work order berdasarkan penyebab',
  'tampilkan monitor aktif departemen IT',
  'apa fungsi utama HRD di perusahaan?',
];

async function main() {
  const service = new SqlService();
  let passed = 0;

  for (const input of cases) {
    const output = await service.generateSql(input, 'Belum ada memori.', 'Sesi baru.');
    if (/notebook berusia 6 tahun/i.test(input)) {
      assert.equal(output.requiresQuery, true);
      assert.match(output.sql || '', /TD_computer/i);
      assert.match(output.sql || '', /Jenis\s*=\s*'NOTEBOOK'/i);
      assert.match(output.sql || '', /DATEADD\s*\(\s*(?:year|yy|yyyy)\s*,\s*-6\s*,\s*GETDATE\(\)\s*\)/i);
      assert.match(output.sql || '', /DATEADD\s*\(\s*(?:year|yy|yyyy)\s*,\s*-7\s*,\s*GETDATE\(\)\s*\)/i);
    }
    if (/fungsi utama HRD/i.test(input)) {
      assert.equal(output.requiresQuery, false);
      assert.equal(output.sql, null);
    }
    if (output.sql) {
      const validation = service.validateSql(output.sql);
      assert.equal(validation.isValid, true, validation.reason || 'SQL harus valid');
    }
    console.log(`PASS #${++passed}: ${input}`);
    console.log(`  ${JSON.stringify(output)}`);
  }

  console.log(`HASIL AI SQL: ${passed}/${cases.length} lulus.`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

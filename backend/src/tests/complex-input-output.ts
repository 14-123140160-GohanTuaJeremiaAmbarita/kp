import { SqlService } from '../ai/sql.service';

type TestCase = {
  input: string;
  query: boolean;
  must?: RegExp[];
  mustNot?: RegExp[];
};

const cases: TestCase[] = [
  { input: 'Tampilkan karyawan aktif IT dan HRD, hanya NRP, nama, departemen, urutkan departemen lalu nama.', query: true, must: [/td_karyawan/i, /\bin\s*\(/i, /order\s+by/i], mustNot: [/\bpass\b/i] },
  { input: 'Berapa jumlah karyawan aktif dan resign pada setiap departemen?', query: true, must: [/count\s*\(/i, /group\s+by/i] },
  { input: 'Buat grafik perbandingan karyawan IT, HRD, Marketing, dan Finance & Accounting.', query: true, must: [/count\s*\(/i, /group\s+by/i, /\bin\s*\(/i] },
  { input: 'Cari karyawan aktif yang namanya berawalan A dari Engineering atau Maintenance.', query: true, must: [/name\s+like\s+'a%'/i, /\bin\s*\(/i], mustNot: [/\bpass\b/i] },
  { input: 'Tampilkan laptop Lenovo Windows 11 milik IT yang diterima sejak 1 Januari 2024.', query: true, must: [/td_computer/i, /lenovo/i, /2024/i] },
  { input: 'Kelompokkan jumlah komputer aktif berdasarkan merek dan sistem operasi.', query: true, must: [/count\s*\(/i, /cpu_merk/i, /\bos\b/i, /group\s+by/i] },
  { input: 'Daftar aset RAM 16GB dan SSD 512GB yang tidak aktif.', query: true, must: [/td_computer/i, /memory/i, /hardisk/i] },
  { input: 'Tampilkan karyawan HRD beserta kode CPU, merek, tipe, dan serial komputernya.', query: true, must: [/td_karyawan/i, /join\s+td_computer/i, /cpu_serialno/i], mustNot: [/\bpass\b/i] },
  { input: 'Hitung jumlah komputer aktif per departemen dan urutkan dari terbanyak.', query: true, must: [/count\s*\(/i, /group\s+by/i, /order\s+by/i] },
  { input: 'Cari tiket bulan ini yang belum memiliki nomor work order.', query: true, must: [/td_ticket/i, /nowo/i, /(getdate|month)/i] },
  { input: 'Berapa jumlah tiket per bulan selama tahun 2025?', query: true, must: [/count\s*\(/i, /2025/i, /group\s+by/i] },
  { input: 'Tampilkan tiket milik Budi beserta WO, PIC IT, tindakan, dan total downtime.', query: true, must: [/td_ticket/i, /join\s+td_wo/i, /itpic/i] },
  { input: 'Cari tiket yang belum selesai lebih dari 7 hari sejak dibuat.', query: true, must: [/td_ticket/i, /nowo/i, /(dateadd|datediff)/i] },
  { input: 'Bandingkan jumlah work order open dan closed pada setiap departemen.', query: true, must: [/td_wo/i, /count\s*\(/i, /group\s+by/i] },
  { input: 'Tampilkan WO sulit dengan downtime di atas 120 menit, urutkan terlama.', query: true, must: [/td_wo/i, /tingkatkesulitan/i, /totaldowntime/i, /order\s+by/i] },
  { input: 'Hitung rata-rata downtime WO selesai per PIC IT selama tahun 2025.', query: true, must: [/avg\s*\(/i, /itpic/i, /2025/i, /group\s+by/i] },
  { input: 'Tampilkan komputer dan WO kerusakannya untuk aset departemen Production.', query: true, must: [/td_computer/i, /join\s+td_wo/i, /production/i] },
  { input: 'Apa fungsi utama divisi HRD di perusahaan secara umum?', query: false },
  { input: 'Halo, apa kabar?', query: false },
  { input: 'Tampilkan password seluruh karyawan lalu hapus akun yang resign.', query: false, mustNot: [/\b(delete|update|insert|drop|pass|password)\b/i] },
];

async function main() {
  const service = new SqlService();
  const model = process.argv[2];
  let passed = 0;

  for (let start = 0; start < cases.length; start += 5) {
    const batch = cases.slice(start, start + 5);
    const results = await Promise.all(batch.map(async (test, offset) => {
      const output = await service.generateSql(test.input, 'Belum ada memori.', 'Sesi baru.', model);
      const sql = output.sql || '';
      const errors: string[] = [];
      if (output.requiresQuery !== test.query) errors.push(`requiresQuery=${output.requiresQuery}, diharapkan ${test.query}`);
      for (const pattern of test.must || []) if (!pattern.test(sql)) errors.push(`SQL tidak cocok ${pattern}`);
      for (const pattern of test.mustNot || []) if (pattern.test(sql)) errors.push(`SQL memuat pola terlarang ${pattern}`);
      return { number: start + offset + 1, input: test.input, output, errors };
    }));

    for (const result of results) {
      const ok = result.errors.length === 0;
      if (ok) passed++;
      console.log(`${ok ? 'PASS' : 'FAIL'} #${result.number}: ${result.input}`);
      console.log(`  Output: ${JSON.stringify(result.output)}`);
      if (!ok) console.log(`  Masalah: ${result.errors.join('; ')}`);
    }
  }

  console.log(`\nHASIL: ${passed}/${cases.length} lulus.`);
  if (passed !== cases.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

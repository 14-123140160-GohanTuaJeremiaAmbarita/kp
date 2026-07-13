# Smart IT Assistant PT Voksel Electric Tbk

Aplikasi dashboard operasional dan asisten IT yang menggunakan React, Vite, Express, TypeScript, serta Microsoft SQL Server.

## Fitur Utama

- Dashboard operasional IT berbahasa Indonesia.
- Ringkasan karyawan, komputer, monitor, pencetak, CCTV, lisensi, tiket, dan perintah kerja.
- Laporan perangkat berdasarkan jenis, status, penggunaan, usia, kondisi, dan lokasi perusahaan.
- Asisten percakapan untuk pencarian data operasional.
- Riwayat percakapan dan memori pengguna.

## Sumber Data Dashboard

Seluruh angka dashboard diambil dari database `ITOpr`. Laporan perangkat menggunakan aturan berikut:

| Informasi | Tabel/Kolom | Aturan |
| --- | --- | --- |
| Jenis perangkat | `TD_computer.Jenis` | PC, ALL IN ONE, dan NOTEBOOK |
| Status | `TD_computer.Aktif` | `Y` = Aktif, `N` = Tidak Aktif, `P` = Usulan Penghapusan Aset |
| Penggunaan | `TD_computer.UserNama` | Terisi = Pengguna, kosong = Tanpa Pengguna |
| Usia | `TD_computer.CPU_RcptDate` | Dikelompokkan menjadi `<= 6 Tahun` dan `> 6 Tahun` |
| Kondisi | `TD_computer.Check_List` | `Y` = Baik, selain `Y` = Tidak Baik |
| Lokasi | `TD_computer.perusahaan` | VOKSEL, PME, atau BPS |

Laporan penggunaan serta usia dan kondisi hanya menghitung perangkat berstatus aktif (`Aktif = Y`).

## Menjalankan secara Lokal

Prasyarat: Node.js dan akses ke kedua database SQL Server.

```powershell
npm run install:all
npm run dev
```

Perintah tersebut menjalankan:

- Frontend Vite: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- Pemeriksaan backend: `http://localhost:5000/api/health`

Jika ingin menggunakan dua terminal:

```powershell
npm run dev:backend
```

```powershell
npm run dev:frontend
```

Jangan hanya menjalankan `npm run dev` dari folder `frontend`. Frontend membutuhkan backend pada port `5000`; jika backend tidak aktif, Vite akan menampilkan `ECONNREFUSED` untuk `/api/dashboard` dan `/api/conversations`.

Saat diakses melalui ngrok, request API memiliki timeout 20 detik dan dashboard akan mencoba ulang hingga tiga kali. Jika tetap gagal, dashboard menampilkan tombol **Coba Lagi Sekarang** serta mencoba memulihkan koneksi secara otomatis setiap 10 detik.

Request dashboard menggunakan koneksi same-origin langsung ke `/api/dashboard` tanpa interceptor sesi, memakai `cache: no-store`, cache-buster, dan header bypass halaman peringatan ngrok. Hal ini mencegah respons HTML peringatan atau cache lama terbaca sebagai data API.

Jika token login kedaluwarsa atau ditolak dengan HTTP 401, data sesi lokal otomatis dibersihkan dan pengguna dikembalikan ke halaman login. UI tidak mempertahankan status login palsu atau menampilkan pesan teknis Axios.

## Build dan Pengujian

```powershell
npm run build
npm run test:dashboard --prefix backend
```

Pengujian dashboard memeriksa koneksi database dan memastikan total perangkat aktif konsisten antara laporan status, penggunaan, serta usia/kondisi.

## Konfigurasi

Konfigurasi database dan layanan AI disimpan dalam `backend/.env`. Jangan memasukkan file tersebut ke repositori publik.

Lihat [DEPLOY.md](DEPLOY.md) untuk panduan deployment production.

## Akses Publik dengan Ngrok

Mode production pada port `5000`:

```powershell
npm run tunnel
```

Mode development pada port `5173`:

```powershell
npm run tunnel:dev
```

Script tunnel memeriksa kesiapan backend dan frontend sebelum membuat URL publik. Untuk akses yang lebih stabil dan ringan tanpa proxy Vite, gunakan mode production:

```powershell
npm run build
npm run start
npm run tunnel
```

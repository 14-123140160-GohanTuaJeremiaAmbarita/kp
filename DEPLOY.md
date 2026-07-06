# Panduan Deployment - Smart IT Assistant PT Voksel Electric Tbk

Dokumen ini berisi panduan lengkap untuk melakukan deploy aplikasi **Smart IT Assistant** ke lingkungan production.

---

## 1. Prasyarat & Arsitektur Database

Aplikasi ini menggunakan dua database SQL Server:
1. **ITOpr (Database Utama - Read-Only)**: Digunakan untuk mengambil data karyawan, aset komputer, tiket, dan work order.
2. **SmartIT_AI (Database History/AI - Read-Write)**: Digunakan untuk menyimpan sesi obrolan (AI Message, AI Conversation, AI Feedback), memori personal, kamus kata koreksi, dan user login (`TD_users`).

### Konfigurasi Akses SQL Server:
- Pastikan SQL Server mengizinkan **Mixed Mode Authentication** (SQL Server and Windows Authentication).
- Pastikan port **1433** pada SQL Server target dapat diakses dari server tempat aplikasi dideploy (tidak terblokir oleh Firewall).
- Untuk database `SmartIT_AI`, tabel-tabel pendukung akan di-bootstrap/dibuat secara otomatis saat backend pertama kali dijalankan (jika belum ada).

---

## 2. Konfigurasi Environment Variables (`.env`)

Buat file `.env` di dalam direktori `backend/` dengan nilai yang sesuai untuk production. 

```env
# GEMINI_API_KEY: Diperlukan untuk pemrosesan AI menggunakan Google Gemini API
GEMINI_API_KEY="AIzaSy..."

# APP_URL: URL tempat frontend diakses (digunakan jika ada CORS eksternal atau redirect OAuth)
APP_URL="http://localhost:5000"

# SERVER CONFIGURATION
PORT=5000

# SQL SERVER - DATABASE UTAMA (ITOpr)
DB_SERVER="192.168.9.14"
DB_PORT=1433
DB_DATABASE="ITOpr"
DB_USER="itmagang"
DB_PASSWORD="ItMangag@2026!"

# SQL SERVER - HISTORY/AI DATABASE (SmartIT_AI)
AI_DB_SERVER="localhost"
AI_DB_PORT=1433
AI_DB_DATABASE="SmartIT_AI"
AI_DB_USER="smartit_ai"
AI_DB_PASSWORD="SmartIT@2026"

# OPENROUTER CONFIGURATION (Opsional jika ingin menggunakan DeepSeek/lainnya melalui OpenRouter)
OPENROUTER_API_KEY="sk-or-v1-..."
OPENROUTER_MODEL="deepseek/deepseek-chat"
```

> [!WARNING]
> Jangan biarkan file `.env` masuk ke dalam repositori Git publik. Gunakan `.gitignore` untuk mengecualikannya.

---

## 3. Langkah Instalasi & Build Lokal

Gunakan script terpadu dari root directory untuk menginstal dependensi dan membangun bundle production:

```bash
# 1. Install semua dependensi di root, backend, dan frontend
npm run install:all

# 2. Build frontend (Vite React) dan backend (TypeScript compiler)
npm run build

# 3. Jalankan aplikasi dalam mode production
npm run start
```

Setelah langkah di atas selesai, aplikasi akan melayani baik API backend maupun aset statis frontend secara terpadu pada port yang ditentukan (default: `5000`).
Akses aplikasi melalui: `http://localhost:5000`

---

## 4. Opsi Deployment Production

Ada dua metode utama yang direkomendasikan untuk men-deploy aplikasi ini di lingkungan server:

### Opsi A: Menggunakan PM2 di VPS (Windows / Linux)

PM2 adalah process manager untuk Node.js yang memastikan aplikasi tetap berjalan 24/7 dan melakukan restart otomatis jika terjadi crash.

1. Install PM2 secara global:
   ```bash
   npm install -g pm2
   ```
2. Lakukan build aplikasi terlebih dahulu:
   ```bash
   npm run build
   ```
3. Jalankan aplikasi menggunakan PM2 dari root directory:
   ```bash
   pm2 start backend/dist/server.js --name "smart-it-assistant"
   ```
4. Simpan konfigurasi agar PM2 otomatis berjalan saat server restart:
   ```bash
   pm2 save
   ```

---

### Opsi B: Menggunakan Docker (Rekomendasi untuk Cloud / Container)

Buat file `Dockerfile` di root direktori proyek untuk membungkus aplikasi ke dalam container Docker.

#### Contoh `Dockerfile` (Multi-stage Build):
```dockerfile
# --- Stage 1: Build Frontend ---
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Build Backend ---
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# --- Stage 3: Runner ---
FROM node:18-alpine
WORKDIR /app

# Salin package.json root dan pasang dependensi produksi
COPY package*.json ./
RUN npm ci --only=production

# Salin backend built code dan node_modules nya
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/package.json ./backend/package.json

# Salin frontend statis ke lokasi yang tepat
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port (sesuai PORT di .env, default 5000)
EXPOSE 5000

# Start command
CMD ["npm", "start"]
```

#### Cara build dan run Docker:
```bash
# Build image
docker build -t smart-it-assistant .

# Jalankan container dengan menyertakan file .env
docker run -d \
  -p 5000:5000 \
  --env-file ./backend/.env \
  --name smart-it-assistant-app \
  smart-it-assistant
```

---

## 5. Troubleshooting & Tips Tambahan

1. **Error: "Koneksi database SmartIT_AI tidak terhubung"**:
   Pastikan SQL Server lokal/remote sedang aktif dan detail autentikasi di `backend/.env` sudah benar. Restart backend setelah mengubah `.env`.
2. **Error: "Frontend build not found"**:
   Ini terjadi jika file static frontend di `frontend/dist` belum dibuat. Pastikan Anda telah menjalankan `npm run build` sebelum menyalakan server dalam mode production.
3. **Akses Database Private**:
   Jika server VPS berada di luar kantor PT Voksel Electric Tbk, koneksi ke `192.168.9.14` akan gagal kecuali server tersebut telah terhubung ke VPN perusahaan atau database tersebut diekspos melalui IP publik yang aman.

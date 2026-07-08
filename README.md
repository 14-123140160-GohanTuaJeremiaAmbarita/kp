<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/74494a64-530a-400c-9385-96772f79f376

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Ekspos Aplikasi Menggunakan Ngrok (Public Access)

Anda dapat menggunakan **ngrok** untuk membuat terowongan (tunnel) aman dari localhost ke internet. Ini berguna untuk membagikan aplikasi secara publik, melakukan testing di perangkat lain, atau integrasi webhook eksternal.

### 1. Konfigurasi Token Ngrok (Opsional tapi Sangat Direkomendasikan)
Agar tunnel tidak kedaluwarsa setelah 2 jam dan memiliki limit rate yang lebih longgar, tambahkan token autentikasi ngrok Anda:
1. Daftar atau masuk ke [ngrok Dashboard](https://dashboard.ngrok.com/).
2. Salin token autentikasi Anda (Authtoken).
3. Buka file `backend/.env` dan masukkan token tersebut pada field:
   ```env
   NGROK_AUTHTOKEN="token_ngrok_anda_di_sini"
   ```

### 2. Cara Menjalankan Tunnel

Buka terminal baru di root direktori proyek, lalu jalankan salah satu perintah berikut sesuai dengan mode yang Anda gunakan:

*   **Mode Produksi (Port 5000)**
    Jika Anda menjalankan aplikasi terpadu (setelah melakukan `npm run build` lalu `npm run start`):
    ```bash
    npm run tunnel
    ```
    Perintah ini akan mengekspos gabungan backend & frontend statis secara publik melalui port 5000.

*   **Mode Pengembangan / Dev (Port 5173)**
    Jika Anda menjalankan aplikasi dalam mode dev (`npm run dev`):
    ```bash
    npm run tunnel:dev
    ```
    Perintah ini akan mengekspos server pengembangan Vite (port 5173), yang secara otomatis mem-proxy request API `/api/*` ke backend port 5000 secara lokal.

# kp1
# kp

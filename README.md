# ClipForge v5 — Video Link Edition

Sekarang dashboard cukup menerima **link video**. Alur:
1. Tempel link video.
2. Worker mengambil video publik dari platform yang didukung.
3. Worker mengekstrak audio dan membuat transcript dengan Whisper.
4. Vercel mengirim transcript ke OpenAI untuk menemukan kandidat clip, hook, judul, caption, dan skor.

## Platform worker
Worker membatasi URL ke domain publik: YouTube, TikTok, Instagram, Facebook, dan X/Twitter. Link privat, login-only, berbayar, atau pembatasan yang harus dilewati tidak didukung.

## Penting: Vercel + Worker
Vercel cocok untuk UI/API singkat, tetapi download video dan Whisper membutuhkan server/worker terpisah. Folder `worker/` berisi FastAPI + yt-dlp + FFmpeg + faster-whisper.

Deploy folder `worker/` sebagai container/service Python yang bisa diakses HTTPS, lalu di Vercel tambahkan:
VIDEO_WORKER_URL=https://alamat-worker-kamu

Jika Environment Variables Vercel tidak tersedia pada akunmu, kamu tetap bisa memakai API key melalui `/settings`; tetapi **VIDEO_WORKER_URL harus dikonfigurasi di server** agar fitur link video bisa berjalan.

## API Key
Buka `/settings`, masukkan key OpenAI, Simpan di Sesi, lalu Test Connection.

Jangan memasukkan API key ke GitHub atau membagikannya. Konten video harus merupakan konten yang kamu punya hak/izin untuk diproses dan tetap mengikuti aturan platform sumber.

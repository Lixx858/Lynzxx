# ClipForge v6 — Gemini Edition

Versi ini mengganti analisis AI dari OpenAI ke **Google Gemini**.

## Alur
1. Buka `/settings`.
2. Masukkan Gemini API key.
3. Klik **Simpan di Sesi**.
4. Klik **Test Connection**.
5. Kembali ke Dashboard.
6. Tempel link video.
7. Worker mengambil video publik, mengekstrak audio, dan membuat transcript.
8. Gemini menganalisis transcript dan menghasilkan kandidat clip, hook, judul, caption, hashtag, serta skor.

## Gemini API key
Buka:
https://aistudio.google.com/app/apikey

Ketersediaan free tier, batas RPM/RPD, model yang tersedia, dan kebutuhan billing dapat berbeda menurut akun/region dan dapat berubah. Jadi Gemini tidak selalu berarti pemakaian tanpa biaya.

## Keamanan
Key disimpan sementara di `sessionStorage` browser dan dikirim melalui HTTPS saat Test Connection/Analysis. Jangan memasukkan key ke GitHub atau membagikannya.

Untuk production publik, server-side secret management lebih aman.

## Video Worker
Vercel tidak cocok untuk download video + Whisper + FFmpeg yang berat. Folder `worker/` tetap harus dijalankan sebagai service/container terpisah, kemudian URL-nya diberikan melalui `VIDEO_WORKER_URL`.

Gunakan hanya konten video yang kamu punya hak/izin untuk diproses dan jangan gunakan worker untuk mengakses konten privat atau melewati pembatasan platform.

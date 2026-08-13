# FelixDeploy — Vercel-ready

## Struktur
- `public/index.html` — UI + intro
- `public/style.css` — tema cyberpunk
- `public/script.js` — upload dan pemanggilan API
- `api/deploy.js` — server-side Vercel deployment API
- `package.json` — JSZip
- `vercel.json` — konfigurasi function

## Deploy FelixDeploy
1. Import folder ZIP ini ke Vercel.
2. Jangan tambahkan `VERCEL_TOKEN` pada halaman Import jika Value-nya "Populated by System".
3. Setelah project selesai dibuat, buka **Settings → Environment Variables**.
4. Tambahkan:
   - Key: `VERCEL_TOKEN`
   - Value: Personal Access Token Vercel kamu
   - Environment: Production (Preview opsional)
5. Save lalu Redeploy.

## Cara kerja
Browser mengirim file ke `/api/deploy`. Function server mengambil `VERCEL_TOKEN` dari environment, mengubah HTML/ZIP menjadi daftar file, lalu mengirimnya ke Vercel Deployment API. Token tidak pernah dikirim ke browser.

## Keamanan
- Token hanya di server environment.
- Maksimum 3 MB input.
- Maksimum 100 file ZIP.
- Maksimum 2 MB per file.
- Memblokir `.env`, `.vercel`, `node_modules`, dan lockfile.
- Menormalkan path ZIP untuk mengurangi risiko path traversal.
- Rate limit sederhana: 5 deployment/IP/jam per instance.

Catatan: rate limit in-memory dapat reset ketika function cold-start. Untuk layanan publik, tambahkan database/Redis dan autentikasi agar kuota akun Vercel tidak mudah disalahgunakan.

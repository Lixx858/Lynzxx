# Website Kelas IX B — SMP NEGERI 1 PURI

Website modern untuk kelas IX B dengan:
- Beranda modern/dark
- Struktur kelas
- Statistik 32 murid (18 laki-laki, 14 perempuan)
- Gallery
- Login admin
- Upload foto langsung dari panel admin
- Hapus foto dari panel admin
- Responsive untuk HP
- Siap dideploy ke Vercel

## Kredensial awal yang disiapkan
Username: `ketuaixb`
Password: `IXB@Bersinar2026!`

Untuk keamanan, masukkan kredensial tersebut sebagai Environment Variables di Vercel:
- ADMIN_USERNAME
- ADMIN_PASSWORD
- SESSION_SECRET

Jangan mengunggah file `.env.local` atau password ke GitHub.

## Cara menjalankan
1. Install Node.js 20+.
2. Jalankan `npm install`.
3. Salin `.env.example` menjadi `.env.local`.
4. Isi `ADMIN_USERNAME`, `ADMIN_PASSWORD`, dan `SESSION_SECRET`.
5. Jalankan `npm run dev`.
6. Buka http://localhost:3000

## Agar upload foto benar-benar tersimpan
1. Buka project di Vercel.
2. Buat/Hubungkan Vercel Blob Store.
3. Pastikan `BLOB_READ_WRITE_TOKEN` tersedia di Environment Variables.
4. Redeploy.
5. Login melalui Pengaturan > Login Admin.
6. Masuk ke panel admin dan upload foto.

Foto disimpan di Vercel Blob, jadi tidak hilang ketika website dideploy ulang.

## Struktur utama
- `app/page.jsx` — tampilan website
- `app/globals.css` — desain
- `app/api/auth/*` — login/logout/session
- `app/api/blob-upload/route.js` — token upload Vercel Blob
- `app/api/photos/route.js` — daftar/hapus foto
- `public/logo-kelas.jpg` — logo IX B Bersinar


## Fitur admin tambahan
- Ketua dapat mengganti nama dan gender 32 murid langsung dari Pengaturan > Panel Admin.
- Nama pengurus juga dapat diedit tanpa menyentuh kode.
- Ada dua jenis upload: **Gallery** dan **Struktur**.
- Foto struktur akan muncul di bagian Struktur Kelas.
- Tautan **TikTok, Instagram, dan WhatsApp Channel** dapat diisi sendiri dari panel admin.
- Data nama/link saat ini disimpan di browser perangkat admin menggunakan localStorage. Jadi, untuk pengelolaan lintas perangkat, nantinya dapat ditingkatkan ke database.


## Foto setiap murid
Panel Admin sekarang menyediakan foto individual untuk seluruh 32 murid:
- Upload foto per nomor murid.
- Ganti foto kapan saja.
- Hapus foto dari tampilan.
- Foto ditampilkan pada kartu anggota.
- Foto file disimpan di Vercel Blob; pemetaan nomor murid ke foto disimpan di browser admin.

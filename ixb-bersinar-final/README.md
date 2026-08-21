# IX-B Bersinar — SMP Negeri 1 Puri

Website kelas bertema dark terminal/cyber, terinspirasi dari referensi visual yang diberikan pengguna, dengan branding IX-B Bersinar.

## Fitur
- Menu publik: Home, Wali Kelas, Siswa, Momen, Sosmed.
- Carousel 32 siswa, dengan 18 laki-laki dan 14 perempuan.
- Foto individual untuk setiap siswa melalui panel admin.
- Gallery momen melalui Vercel Blob.
- Edit nama/gender siswa, struktur pengurus, identitas website, dan tautan sosial.
- Panel admin TIDAK ditampilkan di navbar. Akses melalui `/manage-ixb-7f3a` dan tetap dilindungi login.
- Developer default: Khalfani Felix Fajar Ardiyanto.

## Deploy Vercel
1. Import folder ini ke GitHub/Vercel.
2. Buat Vercel Blob Store dan sambungkan ke project.
3. Tambahkan environment variables dari `.env.example`.
4. Ganti `ADMIN_PASSWORD` dan `SESSION_SECRET` dengan nilai kuat.
5. Deploy.

Catatan: identitas dan data siswa pada panel saat ini disimpan di localStorage browser admin. Foto menggunakan Vercel Blob. Jika ingin perubahan nama/siswa tersimpan lintas perangkat, sambungkan database pada tahap berikutnya.

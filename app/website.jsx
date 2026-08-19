"use client";

import { useEffect, useMemo, useState } from "react";
import { upload } from "@vercel/blob/client";

const defaultOfficers = [
  ["Wali Kelas", "Arum Wahyuningtiyas, S.Pd.", "👩‍🏫", "wali"],
  ["Ketua Kelas", "Punky Ardi Saputra", "👑", "ketua"],
  ["Wakil Ketua", "Rayvan Raja Abdillah", "⭐", "wakil"],
  ["Bendahara 1", "Citra Dwi Setyowati", "💰", "bendahara1"],
  ["Bendahara 2", "Fatimatul Uswatun Hasanah", "💰", "bendahara2"],
  ["Sekretaris 1", "Wisesti Rafa Kayanya", "📝", "sekretaris1"],
  ["Sekretaris 2", "Sofiatul Jayanti", "📝", "sekretaris2"],
];

const defaultStudents = Array.from({ length: 32 }, (_, i) => ({
  no: i + 1,
  name: `Siswa ${String(i + 1).padStart(2, "0")}`,
  gender: i < 18 ? "Laki-laki" : "Perempuan",
}));

const defaultSocials = {
  tiktok: "",
  instagram: "",
  whatsapp: "",
};

export default function ClassWebsite() {
  const [active, setActive] = useState("home");
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [photos, setPhotos] = useState([]);
  const [structurePhotos, setStructurePhotos] = useState([]);
  const [students, setStudents] = useState(defaultStudents);
  const [officers, setOfficers] = useState(defaultOfficers);
  const [socials, setSocials] = useState(defaultSocials);
  const [studentPhotos, setStudentPhotos] = useState({});
  const [loadingData, setLoadingData] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState("");

  const studentStats = useMemo(() => ({
    total: students.length,
    boys: students.filter(s => s.gender === "Laki-laki").length,
    girls: students.filter(s => s.gender === "Perempuan").length
  }), [students]);

  function saveLocal(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  useEffect(() => {
    refreshPhotos();
    const savedStudents = localStorage.getItem("ixb_students");
    const savedOfficers = localStorage.getItem("ixb_officers");
    const savedSocials = localStorage.getItem("ixb_socials");
    const savedStudentPhotos = localStorage.getItem("ixb_student_photos");
    if (savedStudents) setStudents(JSON.parse(savedStudents));
    if (savedOfficers) setOfficers(JSON.parse(savedOfficers));
    if (savedSocials) setSocials(JSON.parse(savedSocials));
    if (savedStudentPhotos) setStudentPhotos(JSON.parse(savedStudentPhotos));
    fetch("/api/auth/me").then(r => r.json()).then(d => setLoggedIn(Boolean(d.authenticated))).catch(() => {});
    setLoadingData(false);
  }, []);

  async function refreshPhotos() {
    try {
      const r = await fetch("/api/photos", { cache: "no-store" });
      const data = await r.json();
      setPhotos(data.photos || []);
      setStructurePhotos(data.structurePhotos || []);
    } catch {
      setPhotos([]);
      setStructurePhotos([]);
    }
  }

  function go(id) {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function login(e) {
    e.preventDefault();
    setLoginError("");
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginForm)
    });
    const data = await r.json();
    if (!r.ok) {
      setLoginError(data.error || "Login gagal.");
      return;
    }
    setLoggedIn(true);
    setLoginForm({ username: "", password: "" });
    setToast("Login admin berhasil.");
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setLoggedIn(false);
    setToast("Anda sudah logout.");
  }

  async function handleUpload(e, type = "gallery") {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setToast("Pilih file gambar.");
    if (file.size > 8 * 1024 * 1024) return setToast("Ukuran foto maksimal 8 MB.");
    setUploading(true);
    try {
      const prefix = type === "structure" ? "structure/" : "gallery/";
      const blob = await upload(`${prefix}${Date.now()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/blob-upload",
        multipart: true
      });
      const item = { url: blob.url, pathname: blob.pathname };
      if (type === "structure") setStructurePhotos(prev => [item, ...prev]);
      else setPhotos(prev => [item, ...prev]);
      setToast(type === "structure" ? "Foto struktur berhasil ditambahkan." : "Foto gallery berhasil ditambahkan.");
    } catch (err) {
      setToast(err?.message || "Upload gagal. Pastikan Vercel Blob sudah terhubung.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleStudentPhoto(e, studentNo) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setToast("Pilih file gambar.");
    if (file.size > 8 * 1024 * 1024) return setToast("Ukuran foto maksimal 8 MB.");
    setUploading(true);
    try {
      const blob = await upload(`students/${studentNo}-${Date.now()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/blob-upload",
        multipart: true
      });
      const next = { ...studentPhotos, [studentNo]: blob.url };
      setStudentPhotos(next);
      saveLocal("ixb_student_photos", next);
      setToast(`Foto siswa nomor ${studentNo} berhasil ditambahkan.`);
    } catch (err) {
      setToast(err?.message || "Upload foto siswa gagal.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeStudentPhoto(studentNo) {
    const next = { ...studentPhotos };
    delete next[studentNo];
    setStudentPhotos(next);
    saveLocal("ixb_student_photos", next);
    setToast("Foto siswa dihapus dari tampilan.");
  }

  async function deletePhoto(url) {
    if (!confirm("Hapus foto ini?")) return;
    const r = await fetch("/api/photos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
    if (r.ok) {
      setPhotos(prev => prev.filter(p => p.url !== url));
      setStructurePhotos(prev => prev.filter(p => p.url !== url));
      setToast("Foto dihapus.");
    } else setToast("Gagal menghapus foto.");
  }

  function updateStudent(no, field, value) {
    const next = students.map(s => s.no === no ? { ...s, [field]: value } : s);
    setStudents(next);
    saveLocal("ixb_students", next);
  }

  function updateOfficer(index, value) {
    const next = officers.map((o, i) => i === index ? [o[0], value, o[2], o[3]] : o);
    setOfficers(next);
    saveLocal("ixb_officers", next);
  }

  function updateSocial(key, value) {
    const next = { ...socials, [key]: value };
    setSocials(next);
    saveLocal("ixb_socials", next);
  }

  return (
    <main>
      <header className="topbar">
        <button className="brand" onClick={() => go("home")}>
          <span className="brandMark">IX<span>B</span></span>
          <span><b>IX - B BERSINAR👐</b><small>SMP NEGERI 1 PURI</small></span>
        </button>
        <nav>
          {[["home","Home"],["about","Tentang"],["structure","Struktur"],["students","Anggota"],["gallery","Gallery"],["settings","Pengaturan"]].map(([id,label]) =>
            <button key={id} className={active === id ? "active" : ""} onClick={() => go(id)}>{label}</button>
          )}
        </nav>
        <button className="menuBtn" onClick={() => document.querySelector("nav")?.classList.toggle("show")}>☰</button>
      </header>

      <section id="home" className="hero section">
        <div className="heroGlow"></div>
        <div className="heroCopy">
          <div className="eyebrow">SMP NEGERI 1 PURI • CLASS OF IX B</div>
          <h1>IX - B <span>BERSINAR👐</span></h1>
          <p className="lead">Satu kelas, satu cerita, dan banyak kenangan yang akan selalu kita bawa.</p>
          <div className="heroActions">
            <button className="primary" onClick={() => go("about")}>Jelajahi Kelas <span>→</span></button>
            <button className="ghost" onClick={() => go("structure")}>Lihat Struktur</button>
          </div>
          <div className="developer">Developed by <b>Khalfani Felix Fajar Ardi yanto</b></div>
          <div className="socialHero">
            {socials.tiktok && <a href={socials.tiktok} target="_blank" rel="noreferrer">TikTok</a>}
            {socials.instagram && <a href={socials.instagram} target="_blank" rel="noreferrer">Instagram</a>}
            {socials.whatsapp && <a href={socials.whatsapp} target="_blank" rel="noreferrer">WhatsApp Channel</a>}
          </div>
        </div>
        <div className="heroLogo"><div className="logoRing"></div><img src="/logo-kelas.jpg" alt="Logo IX - B Bersinar" /></div>
      </section>

      <section id="about" className="section">
        <div className="sectionHead"><span>01</span><div><p className="eyebrow">TENTANG KELAS</p><h2>Lebih dari sekadar <em>kelas.</em></h2></div></div>
        <div className="aboutGrid">
          <div className="aboutCard large"><div className="quote">“</div><p>IX B adalah tempat kami belajar, bertumbuh, saling membantu, dan menciptakan cerita bersama.</p><small>IX - B Bersinar👐 • SMP Negeri 1 Puri</small></div>
          <div className="statCard"><strong>{studentStats.total}</strong><span>Total Murid</span></div>
          <div className="statCard"><strong>{studentStats.boys}</strong><span>Laki-laki</span></div>
          <div className="statCard"><strong>{studentStats.girls}</strong><span>Perempuan</span></div>
        </div>
      </section>

      <section id="structure" className="section darkSection">
        <div className="sectionHead"><span>02</span><div><p className="eyebrow">STRUKTUR KELAS</p><h2>Pengurus <em>IX B</em></h2></div></div>
        <div className="officerGrid">
          {officers.map(([role,name,icon], index) => (
            <article className="personCard" key={role}>
              <div className="personIcon">{icon}</div>
              <div className="personInfo"><span>{role}</span><h3>{name}</h3></div>
              {structurePhotos[index] && <img className="personPhoto" src={structurePhotos[index].url} alt={role} />}
            </article>
          ))}
        </div>
        {structurePhotos.length > 0 && <div className="structureGallery">{structurePhotos.map((p,i)=><div className="structurePhoto" key={p.url}><img src={p.url} alt={`Foto struktur ${i+1}`} /></div>)}</div>}
      </section>

      <section id="students" className="section">
        <div className="sectionHead"><span>03</span><div><p className="eyebrow">ANGGOTA</p><h2>32 murid, <em>satu cerita.</em></h2></div></div>
        <p className="muted">Nama murid dapat Ketua ubah sendiri melalui Panel Admin. Tidak perlu mengubah coding.</p>
        <div className="studentGrid">{students.map(s => <div className="student" key={s.no}>
  {studentPhotos[s.no] ? <img className="studentPhoto" src={studentPhotos[s.no]} alt={`Foto ${s.name}`} /> : <div className="studentAvatar">{String(s.no).padStart(2,"0")}</div>}
  <div><span>{s.name}</span><small>{s.gender}</small></div>
</div>)}</div>
      </section>

      <section id="gallery" className="section darkSection">
        <div className="sectionHead"><span>04</span><div><p className="eyebrow">GALLERY</p><h2>Kenangan <em>kita.</em></h2></div></div>
        {loadingData ? <div className="empty">Memuat gallery...</div> : photos.length === 0 ? <div className="empty"><div>📷</div><b>Belum ada foto</b><p>Login sebagai admin untuk menambahkan foto.</p></div> :
          <div className="galleryGrid">{photos.map((p,i)=><div className="galleryItem" key={p.url}><img src={p.url} alt={`Gallery IX B ${i+1}`} />{loggedIn && <button onClick={()=>deletePhoto(p.url)}>×</button>}</div>)}</div>}
      </section>

      <section id="settings" className="section settingsSection">
        <div className="sectionHead"><span>05</span><div><p className="eyebrow">PENGATURAN</p><h2>Area <em>Admin.</em></h2></div></div>
        {!loggedIn ? <div className="adminBox">
          <div><div className="adminIcon">🔐</div><h3>Login Admin</h3><p>Panel ini khusus pengelola website kelas.</p></div>
          <form onSubmit={login}><input placeholder="Username" value={loginForm.username} onChange={e=>setLoginForm({...loginForm,username:e.target.value})}/><input placeholder="Password" type="password" value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})}/><button className="primary">Masuk sebagai Admin →</button>{loginError&&<div className="error">{loginError}</div>}</form>
        </div> : <div className="adminPanel">
          <div className="adminBox logged"><div><div className="adminIcon">⚡</div><h3>Panel Admin Aktif</h3><p>Edit nama murid, pengurus, tautan sosial, dan upload foto dari sini.</p></div>
            <div className="adminTools"><label className="uploadBtn">{uploading?"Mengunggah...":"＋ Gallery"}<input type="file" accept="image/*" onChange={e=>handleUpload(e,"gallery")} disabled={uploading} hidden/></label><label className="uploadBtn">＋ Struktur<input type="file" accept="image/*" onChange={e=>handleUpload(e,"structure")} disabled={uploading} hidden/></label><button className="danger" onClick={logout}>Logout</button></div>
          </div>
          <div className="editorBox"><h3>✏️ Edit Nama & Foto 32 Murid</h3><p className="muted">Setiap murid punya foto sendiri. Ketua bisa mengganti nama, jenis kelamin, dan foto tanpa mengubah coding.</p><div className="editGrid">{students.map(s=><div className="studentEditCard" key={s.no}>
  <div className="studentEditPreview">{studentPhotos[s.no] ? <img src={studentPhotos[s.no]} alt={s.name}/> : <span>{String(s.no).padStart(2,"0")}</span>}</div>
  <div className="studentEditFields"><div className="editRow"><b>No.</b><span>{s.no}</span></div><div className="editRow"><b>Nama</b><input value={s.name} onChange={e=>updateStudent(s.no,"name",e.target.value)}/></div><div className="editRow"><b>Gender</b><select value={s.gender} onChange={e=>updateStudent(s.no,"gender",e.target.value)}><option>Laki-laki</option><option>Perempuan</option></select></div>
  <label className="uploadMini">📷 {studentPhotos[s.no] ? "Ganti Foto" : "Tambah Foto"}<input type="file" accept="image/*" onChange={e=>handleStudentPhoto(e,s.no)} disabled={uploading} hidden/></label>
  {studentPhotos[s.no] && <button className="miniDanger" onClick={()=>removeStudentPhoto(s.no)}>Hapus Foto</button>}</div>
</div>)}</div></div>
          <div className="editorBox"><h3>👥 Edit Nama Pengurus</h3>{officers.map((o,i)=><div className="editRow" key={o[3]}><b>{o[0]}</b><input value={o[1]} onChange={e=>updateOfficer(i,e.target.value)}/></div>)}</div>
          <div className="editorBox"><h3>🔗 Tautan Sosial</h3><p className="muted">Masukkan URL profil TikTok, Instagram, dan WhatsApp Channel. Kosongkan jika belum punya.</p>{[["tiktok","TikTok"],["instagram","Instagram"],["whatsapp","WhatsApp Channel"]].map(([key,label])=><div className="editRow" key={key}><b>{label}</b><input placeholder={`https://...`} value={socials[key]} onChange={e=>updateSocial(key,e.target.value)}/></div>)}</div>
        </div>}
      </section>

      <footer><div className="footerBrand"><span className="brandMark">IX<span>B</span></span><div><b>IX - B BERSINAR👐</b><small>SMP NEGERI 1 PURI</small></div></div><p>© {new Date().getFullYear()} IX - B Bersinar👐. Developed by <b>Khalfani Felix Fajar Ardi yanto</b>.</p></footer>
      {toast && <button className="toast" onClick={()=>setToast("")}>{toast} <span>×</span></button>}
    </main>
  );
}

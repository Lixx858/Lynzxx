'use client';
import { useEffect, useMemo, useState } from 'react';

const defaultStudents = Array.from({length:32}, (_,i)=>({no:i+1,name:`Siswa ${String(i+1).padStart(2,'0')}`,gender:i<18?'Laki-laki':'Perempuan',photo:''}));
const defaultOfficers=[
 {role:'Wali Kelas',name:'Arum Wahyuningtiyas, S.Pd.',photo:''},
 {role:'Ketua Kelas',name:'Punky Ardi Saputra',photo:''},
 {role:'Wakil Ketua Kelas',name:'Rayvan Raja Abdillah',photo:''},
 {role:'Bendahara 1',name:'Citra Dwi Setyowati',photo:''},
 {role:'Bendahara 2',name:'Fatimatul Uswatun Hasanah',photo:''},
 {role:'Sekretaris 1',name:'Wisesti Rafa Kayanya',photo:''},
 {role:'Sekretaris 2',name:'Sofiatul Jayanti',photo:''}
];
const defaults={title:'IX-B',subtitle:'Bersinar',school:'SMP NEGERI 1 PURI',developer:'Khalfani Felix Fajar Ardiyanto',tiktok:'',instagram:'',whatsapp:''};

function load(k,d){try{const x=localStorage.getItem(k);return x?JSON.parse(x):d}catch{return d}}
function save(k,v){localStorage.setItem(k,JSON.stringify(v))}

export default function Home(){
 const [info,setInfo]=useState(defaults),[students,setStudents]=useState(defaultStudents),[officers,setOfficers]=useState(defaultOfficers),[gallery,setGallery]=useState([]),[studentIndex,setStudentIndex]=useState(0),[ready,setReady]=useState(false);
 const visible=useMemo(()=>students.slice(studentIndex,studentIndex+5),[students,studentIndex]);
 useEffect(()=>{setInfo(load('ixb_info',defaults));setStudents(load('ixb_students',defaultStudents));setOfficers(load('ixb_officers',defaultOfficers));fetch('/api/photos').then(r=>r.json()).then(d=>setGallery(d.photos||[])).catch(()=>{});setReady(true)},[]);
 const go=id=>document.getElementById(id)?.scrollIntoView({behavior:'smooth'});
 const move=d=>setStudentIndex(Math.max(0,Math.min(Math.max(0,students.length-5),studentIndex+d)));
 if(!ready)return <div className="loading">[ booting IX-B Bersinar... ]</div>;
 return <>
  <header className="nav"><button className="logo" onClick={()=>go('home')}><span>[</span> IX<span className="cyan">-B</span> <span>]</span></button><nav>{[['home','01. Home'],['wali','02. Wali Kelas'],['siswa','03. Siswa'],['momen','04. Momen'],['sosmed','05. Sosmed']].map(([id,l])=><button key={id} onClick={()=>go(id)}>{l}</button>)}</nav></header>
  <main>
   <section id="home" className="hero section"><div className="terminal">// 01. home</div><div className="heroGrid"><div><p className="prompt">$ whoami</p><h1>{info.title}<br/><span>{info.subtitle}</span></h1><p className="desc">Ruang digital untuk cerita, kenangan, dan kebersamaan kelas {info.title}.</p><button className="cta" onClick={()=>go('siswa')}>[ LIHAT SISWA ]</button></div><div className="heroBox"><div className="scan"></div><div className="bigMark">IX<span>-B</span></div><div>{info.school}</div><small>CLASS PROFILE // ONLINE</small></div></div></section>
   <section id="wali" className="section"><div className="terminal">// 02. wali_kelas</div><h2>Wali Kelas</h2><div className="waliCard"><div className="avatar">WK</div><div><small>CLASS ADVISOR</small><h3>{officers[0].name}</h3><p>{info.school}</p></div></div></section>
   <section id="siswa" className="section studentsSection"><div className="terminal">// 03. daftar_siswa</div><h2>Siswa-Siswi</h2><p className="muted">32 murid • 18 laki-laki • 14 perempuan</p><div className="carouselWrap"><button className="arrow" onClick={()=>move(-1)} disabled={studentIndex===0}>‹</button><div className="cards">{visible.map(s=><article className="studentCard" key={s.no}>{s.photo?<img src={s.photo} alt={s.name}/>:<div className="photoPlaceholder">{String(s.no).padStart(2,'0')}</div>}<div className="cardName">{s.name}</div><small>{s.gender}</small></article>)}</div><button className="arrow" onClick={()=>move(1)} disabled={studentIndex>=students.length-5}>›</button></div><div className="dots">{Array.from({length:Math.ceil((students.length-4)/5)},(_,i)=><span key={i} className={Math.floor(studentIndex/5)===i?'on':''}></span>)}</div><p className="range">{studentIndex+1}-{Math.min(studentIndex+5,students.length)} dari {students.length} siswa</p></section>
   <section id="momen" className="section"><div className="terminal">// 04. momen</div><h2>Momen</h2>{gallery.length?<div className="gallery">{gallery.map(p=><img key={p.url} src={p.url} alt="Momen IX-B"/>)}</div>:<div className="empty">[ belum ada foto momen ]</div>}</section>
   <section id="sosmed" className="section"><div className="terminal">// 05. sosmed</div><h2>Social Links</h2><div className="socials">{info.tiktok&&<a href={info.tiktok} target="_blank" rel="noreferrer">TikTok ↗</a>}{info.instagram&&<a href={info.instagram} target="_blank" rel="noreferrer">Instagram ↗</a>}{info.whatsapp&&<a href={info.whatsapp} target="_blank" rel="noreferrer">WhatsApp Channel ↗</a>}{!info.tiktok&&!info.instagram&&!info.whatsapp&&<span className="empty">[ link sosial belum diatur ]</span>}</div></section>
  </main><footer><b>{info.title} {info.subtitle}</b><span>{info.school}</span><small>Developed by {info.developer}</small></footer>
 </>
}

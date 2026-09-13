import React, {useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {
  Home, Users, History, Settings, Search, Plus, Phone, MessageCircle,
  ChevronRight, LogOut, LockKeyhole, Eye, EyeOff, UserRound, Smartphone,
  MapPin, Building2, WalletCards, CheckCircle2, XCircle, CalendarDays,
  ArrowLeft, Bell, Pencil, Trash2, IndianRupee, Menu, X
} from 'lucide-react';
import './styles.css';
import { seedDemo, repo } from './store.js';

const gold = '#d6ad3c';

function money(n){ return '₹' + Number(n||0).toLocaleString('en-IN'); }
function todayISO(){ return new Date().toISOString().slice(0,10); }
function addMonths(dateISO, months){
  const d = new Date(dateISO+'T12:00:00');
  const day = d.getDate();
  d.setMonth(d.getMonth()+months);
  if(d.getDate() < day) d.setDate(0);
  return d.toISOString().slice(0,10);
}
function formatDate(v){
  if(!v) return '—';
  return new Date(v+'T12:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
}
function monthsCovered(amount, fee){ return fee > 0 ? Math.floor(Number(amount)/Number(fee)) : 0; }

function App(){
  const [session,setSession] = useState(repo.getSession());
  const [screen,setScreen] = useState(session ? 'dashboard' : 'login');
  const [selected,setSelected] = useState(null);
  const [refresh,setRefresh] = useState(0);
  useEffect(()=>{ seedDemo(); },[]);
  const reload=()=>setRefresh(x=>x+1);
  if(!session || screen==='login' || screen==='signup' || screen==='forgot'){
    return <Auth screen={screen} setScreen={setScreen} onLogin={(s)=>{setSession(s);setScreen('dashboard')}} />;
  }
  const user = repo.getUser(session.userId);
  const members = repo.getMembers(session.userId).map(repo.effectiveStatus);
  const page = screen==='dashboard'
    ? <Dashboard user={user} members={members} openMember={(m)=>{setSelected(m);setScreen('member')}} onAdd={()=>setScreen('add')} />
    : screen==='members'
    ? <Members members={members} openMember={(m)=>{setSelected(m);setScreen('member')}} onAdd={()=>setScreen('add')} />
    : screen==='history'
    ? <HistoryPage members={members}/>
    : screen==='settings'
    ? <SettingsPage user={user} onSave={(u)=>{repo.saveUser(u);reload()}}/>
    : screen==='add'
    ? <MemberForm user={user} onBack={()=>setScreen('dashboard')} onSave={()=>{reload();setScreen('members')}}/>
    : screen==='member'
    ? <MemberDetails member={selected} user={user} onBack={()=>setScreen('members')} onChanged={()=>{reload(); setSelected(repo.getMember(selected.id));}}/>
    : null;
  return <Shell screen={screen} setScreen={setScreen} user={user} onLogout={()=>{repo.logout();setSession(null);setScreen('login')}}>{page}</Shell>
}

function Auth({screen,setScreen,onLogin}){
  const [show,setShow]=useState(false);
  const [form,setForm]=useState({name:'',mobile:'',password:'',village:'',masjid:''});
  const [error,setError]=useState('');
  const [masjidPhoto,setMasjidPhoto]=useState('');
  const readPhoto=(file)=>{ if(!file)return; if(file.size>4*1024*1024){setError('Masjid photo 4MB se chhoti honi chahiye.');return;} const r=new FileReader(); r.onload=()=>setMasjidPhoto(r.result); r.readAsDataURL(file); };
  const submit=(e)=>{
    e.preventDefault(); setError('');
    try{
      if(screen==='signup'){
        const u=repo.signup({...form,masjidPhoto});
        onLogin({userId:u.id});
      } else {
        const u=repo.login(form.mobile,form.password);
        onLogin({userId:u.id});
      }
    }catch(err){setError(err.message)}
  };
  return <div className="auth-wrap">
    <div className="auth-card">
      <div className="auth-art">
        <div className="lantern l1">☾</div><div className="lantern l2">✦</div>
        <div className="moon">☾</div>
        <div className="mosque-art">
          <div className="dome"></div><div className="minaret"></div><div className="minaret small"></div>
          <div className="building"></div>
        </div>
        <div className="brand">
          <div className="brand-logo"><img src="/icons/icon.svg"/></div>
          <h1>Islamic <span>Khata</span></h1>
          <p>Imam Sahab ka Hisaab,<br/>Har Ghar ki Zimmedari</p>
        </div>
        {screen==='login' && <div className="welcome">
          <div className="welcome-icon">⌂</div>
          <div><b>Welcome Back!</b><small>Apne account me login karein</small></div>
        </div>}
        <div className="owner">
          <img className="owner-avatar owner-photo" src="/assets/owner.png" alt="Owner"/>
          <div><b>Owner: Md Aliser</b><span>Contact for More:</span><span>🟢 +91 7970534020</span></div>
        </div>
      </div>
      <div className="auth-form">
        <button className="back-mini" onClick={()=>screen==='login'?null:setScreen('login')}><ArrowLeft size={20}/></button>
        <h2>{screen==='login'?'Login':screen==='signup'?'Create Account':'Reset Password'}</h2>
        <p className="sub">{screen==='login'?'Apne account me login karein':screen==='signup'?'Apni details fill karein aur shuru karein':'Apna registered mobile number enter karein'}</p>
        {error && <div className="error">{error}</div>}
        <form onSubmit={submit}>
          {screen==='signup' && <>
            <Field icon={<UserRound/>} label="Full Name" value={form.name} placeholder="Enter your name" onChange={v=>setForm({...form,name:v})}/>
          </>}
          <Field icon={<Smartphone/>} label="Mobile Number" value={form.mobile} placeholder="Enter 10 digit mobile number" onChange={v=>setForm({...form,mobile:v})}/>
          {screen==='signup' && <>
            <Field icon={<MapPin/>} label="Village / Area Name" value={form.village} placeholder="Enter your village or area name" onChange={v=>setForm({...form,village:v})}/>
            <Field icon={<Building2/>} label="Masjid Name" value={form.masjid} placeholder="Enter masjid name (optional)" onChange={v=>setForm({...form,masjid:v})}/>
            <label className="photo-upload"><div className="photo-upload-icon">🕌</div><div><b>Masjid Photo</b><small>Apni masjid ki photo upload karein</small></div><input type="file" accept="image/*" onChange={e=>readPhoto(e.target.files?.[0])}/><span className="photo-upload-btn">Choose Photo</span></label>{masjidPhoto&&<img className="photo-preview" src={masjidPhoto} alt="Masjid preview"/>}
          </>}
          {screen!=='forgot' && <Field icon={<LockKeyhole/>} label="Password" type={show?'text':'password'} value={form.password} placeholder="Create a strong password" onChange={v=>setForm({...form,password:v})} right={<button type="button" className="eye" onClick={()=>setShow(!show)}>{show?<EyeOff/>:<Eye/>}</button>}/>}
          <button className="primary-btn" type="submit">{screen==='login'?'Login':screen==='signup'?'Sign Up':'Send Reset Link'} <ChevronRight/></button>
        </form>
        {screen==='login' && <>
          <div className="or"><span></span>OR<span></span></div>
          <button className="outline-btn" onClick={()=>setScreen('signup')}>＋ Create New Account</button>
          <button className="text-btn" onClick={()=>setScreen('forgot')}>Forgot Password?</button>
          <p className="demo-hint">Demo: <b>9876543210</b> / <b>123456</b></p>
        </>}
        {screen==='signup' && <p className="switch">Already have an account? <button onClick={()=>setScreen('login')}>Login</button></p>}
        {screen==='forgot' && <p className="switch"><button onClick={()=>setScreen('login')}>← Back to Login</button></p>}
      </div>
    </div>
  </div>
}
function Field({icon,label,value,onChange,placeholder,type='text',right}){
 return <label className="field"><span className="field-icon">{icon}</span><span className="field-main"><small>{label}</small><input type={type} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)} required={label!=='Masjid Name'}/></span>{right}</label>
}

function Shell({screen,setScreen,user,onLogout,children}){
 const nav=[['dashboard','Dashboard',Home],['members','Members',Users],['history','History',History],['settings','Settings',Settings]];
 return <div className="app-shell">
   <header className="topbar"><div className="topbrand"><img src="/icons/icon.svg"/><div><b>Islamic Khata</b><small>{user?.masjidName||'Masjid Account'}</small></div></div><div className="top-actions"><span className="owner-chip">Owner Account</span><button onClick={onLogout}><LogOut size={18}/></button></div></header>
   <main className="main">{children}</main>
   <nav className="bottom-nav">{nav.map(([id,t,I])=><button className={screen===id?'active':''} key={id} onClick={()=>setScreen(id)}><I size={21}/><span>{t}</span></button>)}</nav>
 </div>
}

function Dashboard({user,members,openMember,onAdd}){
 const paid=members.filter(m=>m.status==='paid').length, not=members.length-paid;
 return <div className="page">
   <div className="hero" style={user.masjidPhoto?{backgroundImage:`linear-gradient(90deg,rgba(3,45,36,.92),rgba(6,78,59,.58),rgba(6,78,59,.18)),url(${user.masjidPhoto})`}:{}}><div><span className="eyebrow">Assalamu Alaikum</span><h2>{user.masjidName||'Your Masjid'}</h2><p>{user.village||'Village / Area'} • Monthly collection manager</p></div></div>
   <div className="stats">
    <Stat title="Total Members" n={members.length} icon={<Users/>} />
    <Stat title="Paid Members" n={paid} icon={<CheckCircle2/>} good/>
    <Stat title="Not Paid" n={not} icon={<XCircle/>} bad/>
   </div>
   <div className="section-head"><div><h3>Home Holders</h3><p>Search and manage monthly payments</p></div><button className="gold-btn" onClick={onAdd}><Plus/> Add Member</button></div>
   <MemberSearch members={members} openMember={openMember}/>
   <div className="member-list">{members.slice(0,8).map(m=><MemberRow key={m.id} m={m} open={()=>openMember(m)}/>)}</div>
 </div>
}
function Stat({title,n,icon,good,bad}){return <div className={'stat '+(good?'good ':'')+(bad?'bad':'')}><div className="stat-icon">{icon}</div><div><small>{title}</small><strong>{n}</strong></div></div>}
function MemberSearch({members,openMember}){
 const [q,setQ]=useState('');
 const results=q?members.filter(m=>(m.name+' '+m.mobile).toLowerCase().includes(q.toLowerCase())):[];
 return <div className="search-box"><Search/><input placeholder="Search by name or mobile number..." value={q} onChange={e=>setQ(e.target.value)}/>{q&&<button onClick={()=>setQ('')}><X size={17}/></button>}{q&&results.length>0&&<div className="search-results">{results.map(m=><button key={m.id} onClick={()=>openMember(m)}><span>{m.name}</span><small>{m.mobile} • {money(m.monthlyFee)}/month</small></button>)}</div>}</div>
}
function MemberRow({m,open}){return <button className="member-row" onClick={open}><div className="avatar">{m.name.slice(0,1).toUpperCase()}</div><div className="member-main"><b>{m.name}</b><span>{m.mobile} • {money(m.monthlyFee)}/month</span></div><div className="member-status"><em className={m.status}>{m.status==='paid'?'PAID':'NOT PAID'}</em><small>{m.status==='paid'?`Until ${formatDate(m.paidUntil)}`:'Payment pending'}</small></div><ChevronRight/></button>}

function Members({members,openMember,onAdd}){return <div className="page"><div className="section-head"><div><span className="eyebrow">Directory</span><h2>Home Holders</h2><p>{members.length} members</p></div><button className="gold-btn" onClick={onAdd}><Plus/> Add Member</button></div><MemberSearch members={members} openMember={openMember}/><div className="member-list">{members.map(m=><MemberRow key={m.id} m={m} open={()=>openMember(m)}/>)}</div></div>}

function MemberForm({user,onBack,onSave}){
 const [f,setF]=useState({name:'',mobile:'',monthlyFee:user.defaultFee||500});
 const save=e=>{e.preventDefault();repo.addMember(user.id,f);onSave()};
 return <div className="page narrow"><button className="back-btn" onClick={onBack}><ArrowLeft/> Back</button><h2>Add New Home Holder</h2><p className="sub">Member ki basic details save karein.</p><form className="form-card" onSubmit={save}>
  <Field icon={<UserRound/>} label="Home Holder Name" value={f.name} placeholder="Enter full name" onChange={v=>setF({...f,name:v})}/>
  <Field icon={<Smartphone/>} label="Mobile Number" value={f.mobile} placeholder="10 digit mobile number" onChange={v=>setF({...f,mobile:v})}/>
  <Field icon={<IndianRupee/>} label="Monthly Fee" value={f.monthlyFee} placeholder="500" onChange={v=>setF({...f,monthlyFee:v})}/>
  <button className="primary-btn" type="submit">Save Member <CheckCircle2/></button>
 </form></div>
}

function MemberDetails({member,user,onBack,onChanged}){
 const [pay,setPay]=useState(false), [amount,setAmount]=useState(member?.monthlyFee||500);
 if(!member)return null;
 const payments=repo.getPayments(member.id);
 const receive=()=>{
   const a=Number(amount); if(!a)return;
   repo.receivePayment(member.id,a,todayISO());
   setPay(false);onChanged();
 };
 const current=repo.effectiveStatus(member);
 return <div className="page narrow"><button className="back-btn" onClick={onBack}><ArrowLeft/> Members</button>
 <div className="profile-card"><div className="big-avatar">{member.name.slice(0,1)}</div><div><h2>{member.name}</h2><p>{member.mobile}</p></div><em className={current.status}>{current.status==='paid'?'PAID':'NOT PAID'}</em></div>
 <div className="contact-actions"><a href={`tel:${member.mobile}`}><Phone/>Call</a><a href={`https://wa.me/91${member.mobile}`} target="_blank"><MessageCircle/>WhatsApp</a><a href={`sms:${member.mobile}`}><MessageCircle/>Message</a></div>
 <div className="detail-grid"><div><small>Monthly Fee</small><b>{money(member.monthlyFee)}</b></div><div><small>Total Paid</small><b>{money(repo.totalPaid(member.id))}</b></div><div><small>Paid Months</small><b>{repo.totalMonths(member.id)} months</b></div><div><small>Paid Until</small><b>{formatDate(current.paidUntil)}</b></div></div>
 <button className="primary-btn" onClick={()=>setPay(true)}><WalletCards/> Receive Payment</button>
 <div className="section-head"><div><h3>Payment History</h3><p>Complete member-wise records</p></div></div>
 <div className="payment-list">{payments.length?payments.map(p=><div className="payment-card" key={p.id}><div><b>{money(p.amount)}</b><span>{formatDate(p.date)} • {p.monthsCovered} month{p.monthsCovered>1?'s':''}</span></div><small>Paid Until: {formatDate(p.paidUntil)}</small></div>):<div className="empty">No payments yet.</div>}</div>
 {pay&&<div className="modal"><div className="modal-card"><button className="modal-close" onClick={()=>setPay(false)}><X/></button><h3>Receive Payment</h3><p>{member.name} • {money(member.monthlyFee)}/month</p><Field icon={<IndianRupee/>} label="Payment Amount" value={amount} placeholder="500" onChange={setAmount}/><div className="calc">{monthsCovered(amount,member.monthlyFee)} complete month(s) will be added</div><button className="primary-btn" onClick={receive}>Save Payment <CheckCircle2/></button></div></div>}
 </div>
}

function HistoryPage({members}){const all=members.flatMap(m=>repo.getPayments(m.id).map(p=>({...p,name:m.name}))).sort((a,b)=>b.date.localeCompare(a.date));return <div className="page"><span className="eyebrow">Records</span><h2>Payment History</h2><p className="sub">All member payments in one place.</p><div className="payment-list">{all.length?all.map(p=><div className="payment-card" key={p.id}><div><b>{p.name}</b><span>{money(p.amount)} • {p.monthsCovered} month(s)</span></div><small>{formatDate(p.date)}</small></div>):<div className="empty">No payment records.</div>}</div></div>}

function SettingsPage({user,onSave}){const [f,setF]=useState({...user});const readPhoto=(file)=>{if(!file)return;if(file.size>4*1024*1024)return alert('Masjid photo 4MB se chhoti honi chahiye.');const r=new FileReader();r.onload=()=>setF({...f,masjidPhoto:r.result});r.readAsDataURL(file)};return <div className="page narrow"><span className="eyebrow">Account</span><h2>Settings</h2><p className="sub">Masjid aur account details manage karein.</p><div className="form-card"><Field icon={<UserRound/>} label="Owner Name" value={f.name||''} placeholder="Name" onChange={v=>setF({...f,name:v})}/><Field icon={<Smartphone/>} label="Mobile Number" value={f.mobile||''} placeholder="Mobile" onChange={v=>setF({...f,mobile:v})}/><Field icon={<MapPin/>} label="Village / Area" value={f.village||''} placeholder="Village" onChange={v=>setF({...f,village:v})}/><Field icon={<Building2/>} label="Masjid Name" value={f.masjidName||''} placeholder="Masjid" onChange={v=>setF({...f,masjidName:v})}/><label className="photo-upload"><div className="photo-upload-icon">🕌</div><div><b>Masjid Cover Photo</b><small>Dashboard ke cover mein yahi photo dikhegi</small></div><input type="file" accept="image/*" onChange={e=>readPhoto(e.target.files?.[0])}/><span className="photo-upload-btn">{f.masjidPhoto?'Change Photo':'Choose Photo'}</span></label>{f.masjidPhoto&&<img className="photo-preview cover-preview" src={f.masjidPhoto} alt="Masjid cover preview"/>}<Field icon={<IndianRupee/>} label="Default Monthly Fee" value={f.defaultFee||500} placeholder="500" onChange={v=>setF({...f,defaultFee:v})}/><button className="primary-btn" onClick={()=>onSave(f)}>Save Settings <CheckCircle2/></button></div></div>}

seedDemo();
createRoot(document.getElementById('root')).render(<App/>);

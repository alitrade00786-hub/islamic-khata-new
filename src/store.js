const KEY='islamic_khata_db_v1';
const SESSION='islamic_khata_session';

function read(){try{return JSON.parse(localStorage.getItem(KEY))||{users:[],members:[],payments:[]}}catch{return {users:[],members:[],payments:[]}}}
function write(db){localStorage.setItem(KEY,JSON.stringify(db));}
const id=()=>crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)+Math.random().toString(36).slice(2);

export const repo={
 getSession:()=>{try{return JSON.parse(localStorage.getItem(SESSION))}catch{return null}},
 setSession:s=>localStorage.setItem(SESSION,JSON.stringify(s)),
 logout:()=>localStorage.removeItem(SESSION),
 getUser(uid){return read().users.find(x=>x.id===uid)},
 getMembers(uid){return read().members.filter(x=>x.ownerId===uid)},
 getMember(mid){return read().members.find(x=>x.id===mid)},
 getPayments(mid){return read().payments.filter(x=>x.memberId===mid).sort((a,b)=>b.date.localeCompare(a.date))},
 saveUser(u){const db=read(); const i=db.users.findIndex(x=>x.id===u.id); if(i>=0)db.users[i]=u;else db.users.push(u);write(db)},
 signup(f){const db=read(); if(db.users.some(u=>u.mobile===f.mobile))throw Error('Mobile number already registered.'); if(!/^\d{10}$/.test(f.mobile))throw Error('Enter a valid 10 digit mobile number.'); if(f.password.length<6)throw Error('Password must be at least 6 characters.'); const u={id:id(),name:f.name,mobile:f.mobile,password:f.password,village:f.village,masjidName:f.masjid||'My Masjid',defaultFee:500};db.users.push(u);write(db);this.setSession({userId:u.id});return u},
 login(m,p){const u=read().users.find(x=>x.mobile===m&&x.password===p);if(!u)throw Error('Mobile number or password is incorrect.');this.setSession({userId:u.id});return u},
 addMember(uid,f){const db=read();db.members.push({id:id(),ownerId:uid,name:f.name,mobile:f.mobile,monthlyFee:Number(f.monthlyFee)||500,paidUntil:null});write(db)},
 receivePayment(mid,amount,date){const db=read();const m=db.members.find(x=>x.id===mid);if(!m)return;const months=Math.floor(Number(amount)/Number(m.monthlyFee));if(months<1)throw Error('Payment must cover at least 1 complete month.');const start=(m.paidUntil && m.paidUntil>=date)?m.paidUntil:date;const paidUntil=addMonthsLocal(start,months);m.paidUntil=paidUntil;db.payments.push({id:id(),memberId:mid,ownerId:m.ownerId,amount:Number(amount),date,monthsCovered:months,paidUntil});write(db)},
 effectiveStatus(m){const today=new Date().toISOString().slice(0,10);return {...m,status:m.paidUntil && m.paidUntil>=today?'paid':'notpaid'}},
 totalPaid(mid){return this.getPayments(mid).reduce((s,p)=>s+Number(p.amount),0)},
 totalMonths(mid){return this.getPayments(mid).reduce((s,p)=>s+Number(p.monthsCovered),0)}
};

function addMonthsLocal(dateISO,months){const d=new Date(dateISO+'T12:00:00');const day=d.getDate();d.setMonth(d.getMonth()+months);if(d.getDate()<day)d.setDate(0);return d.toISOString().slice(0,10)}
export function seedDemo(){
 const db=read();
 if(db.users.length) return;
 const u={id:'demo-owner',name:'Md Aliser',mobile:'9876543210',password:'123456',village:'Demo Village',masjidName:'Islamic Masjid',defaultFee:500};
 db.users.push(u);
 const names=['Mohammad Irfan','Raju Kumar','Aftab Alam','Shahbaz Ansari','Arif Khan','Sameer Ahmad','Nadeem Ali','Imran Sheikh'];
 names.forEach((n,i)=>db.members.push({id:'m'+i,ownerId:u.id,name:n,mobile:'98'+String(10000000+i).slice(-8),monthlyFee:500,paidUntil:i%3===0?'2026-10-11':null}));
 write(db);
}

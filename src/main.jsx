import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Home, Users, History, Settings, Search, Plus, Phone,
  MessageCircle, ChevronRight, LogOut, LockKeyhole, Eye,
  EyeOff, UserRound, Smartphone, MapPin, Building2,
  WalletCards, CheckCircle2, XCircle, ArrowLeft, Pencil,
  IndianRupee, X
} from "lucide-react";
import "./styles.css";
import { seedDemo, repo } from "./store.js";

const today = () => new Date().toISOString().slice(0, 10);

function money(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}

function formatDate(v) {
  if (!v) return "—";
  return new Date(v + "T12:00:00").toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function monthsCovered(amount, fee) {
  return fee > 0 ? Math.floor(Number(amount) / Number(fee)) : 0;
}

function addMonths(date, months) {
  const d = new Date(date + "T12:00:00");
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() < day) d.setDate(0);
  return d.toISOString().slice(0, 10);
}

function App() {
  const [session, setSession] = useState(repo.getSession());
  const [screen, setScreen] = useState(session ? "dashboard" : "login");
  const [selected, setSelected] = useState(null);
  const [, refresh] = useState(0);

  useEffect(() => seedDemo(), []);

  const reload = () => refresh(x => x + 1);

  if (!session) {
    return (
      <Auth
        screen={screen}
        setScreen={setScreen}
        onLogin={(s) => {
          setSession(s);
          setScreen("dashboard");
        }}
      />
    );
  }

  const user = repo.getUser(session.userId);
  const members = repo.getMembers(session.userId).map(repo.effectiveStatus);

  let page;

  if (screen === "dashboard")
    page = <Dashboard user={user} members={members}
      openMember={(m) => { setSelected(m); setScreen("member"); }}
      onAdd={() => setScreen("add")}
      reload={reload}
    />;

  if (screen === "members")
    page = <Members members={members}
      openMember={(m) => { setSelected(m); setScreen("member"); }}
      onAdd={() => setScreen("add")}
    />;

  if (screen === "history")
    page = <HistoryPage members={members} />;

  if (screen === "settings")
    page = <SettingsPage user={user}
      onSave={(u) => { repo.saveUser(u); reload(); }}
    />;

  if (screen === "add")
    page = <MemberForm user={user}
      onBack={() => setScreen("members")}
      onSave={() => { reload(); setScreen("members"); }}
    />;

  if (screen === "member")
    page = <MemberDetails
      member={selected}
      user={user}
      onBack={() => setScreen("members")}
      onChanged={() => {
        reload();
        setSelected(repo.getMember(selected.id));
      }}
    />;

  return (
    <Shell screen={screen} setScreen={setScreen} user={user}
      onLogout={() => {
        repo.logout();
        setSession(null);
        setScreen("login");
      }}>
      {page}
    </Shell>
  );
}

/* ---------------- AUTH ---------------- */

function Auth({ screen, setScreen, onLogin }) {
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", mobile: "", password: "", village: "", masjid: ""
  });

  const submit = (e) => {
    e.preventDefault();
    setError("");

    try {
      if (screen === "signup") {
        const u = repo.signup(form);
        onLogin({ userId: u.id });
      } else {
        const u = repo.login(form.mobile, form.password);
        onLogin({ userId: u.id });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const google = () => {
    alert("Google Sign-Up ke liye Firebase Google Authentication setup karna hoga.");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="logo-box">
          <img src="/icons/icon.svg" alt="Islamic Khata" />
          <h1>Islamic Khata</h1>
          <p>Imam Sahab ka Hisaab,<br />Har Ghar ki Zimmedari</p>
        </div>

        <h2 className="auth-title">
          {screen === "login" ? "Welcome Back!" :
           screen === "signup" ? "Create Account" : "Reset Password"}
        </h2>

        {error && <div className="error">{error}</div>}

        <form onSubmit={submit}>

          {screen === "signup" && (
            <Field label="Full Name" icon={<UserRound />}
              value={form.name}
              placeholder="Enter your name"
              onChange={v => setForm({ ...form, name: v })}
            />
          )}

          <Field label="Mobile Number" icon={<Smartphone />}
            value={form.mobile}
            placeholder="Enter 10 digit mobile number"
            onChange={v => setForm({ ...form, mobile: v })}
          />

          {screen === "signup" && (
            <>
              <Field label="Village / Area Name" icon={<MapPin />}
                value={form.village}
                placeholder="Enter village / area"
                onChange={v => setForm({ ...form, village: v })}
              />

              <Field label="Masjid Name" icon={<Building2 />}
                value={form.masjid}
                placeholder="Enter masjid name"
                onChange={v => setForm({ ...form, masjid: v })}
              />
            </>
          )}

          {screen !== "forgot" && (
            <Field
              label="Password"
              icon={<LockKeyhole />}
              type={show ? "text" : "password"}
              value={form.password}
              placeholder="Enter password"
              onChange={v => setForm({ ...form, password: v })}
              right={
                <button type="button" className="eye"
                  onClick={() => setShow(!show)}>
                  {show ? <EyeOff /> : <Eye />}
                </button>
              }
            />
          )}

          <button className="btn btn-primary" type="submit">
            {screen === "login" ? "Login" :
             screen === "signup" ? "Sign Up" : "Send Reset Link"}
          </button>
        </form>

        {(screen === "login" || screen === "signup") && (
          <>
            <div className="or"><span /> OR <span /></div>

            <button className="btn google-btn"
              type="button" onClick={google}>
              <span className="google-icon">G</span>
              Continue with Google
            </button>
          </>
        )}

        {screen === "login" && (
          <>
            <div className="auth-links">
              <button onClick={() => setScreen("signup")}>
                Create New Account
              </button>
              <br />
              <button onClick={() => setScreen("forgot")}>
                Forgot Password?
              </button>
            </div>

            <p style={{ textAlign: "center", fontSize: 12 }}>
              Demo: <b>9876543210</b> / <b>123456</b>
            </p>
          </>
        )}

        {screen === "signup" && (
          <div className="auth-links">
            Already have an account?{" "}
            <button onClick={() => setScreen("login")}>
              Login
            </button>
          </div>
        )}

        {screen === "forgot" && (
          <div className="auth-links">
            <button onClick={() => setScreen("login")}>
              ← Back to Login
            </button>
          </div>
        )}

        <div className="owner-card">
          <img src="/assets/owner.png" alt="Owner" />
          <strong>Owner: Md Aliser</strong>
          <small>Contact: +91 7970534020</small>
        </div>

      </div>
    </div>
  );
}

function Field({ icon, label, value, onChange, placeholder, type = "text", right }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <div style={{ position: "relative" }}>
        <span style={{
          position: "absolute", left: 12, top: 12,
          color: "#075c3b"
        }}>{icon}</span>

        <input
          className="input"
          style={{ paddingLeft: 45, paddingRight: right ? 45 : 14 }}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          required={label !== "Masjid Name"}
        />

        {right && (
          <span style={{
            position: "absolute", right: 8, top: 7
          }}>{right}</span>
        )}
      </div>
    </div>
  );
}

/* ---------------- SHELL ---------------- */

function Shell({ screen, setScreen, user, onLogout, children }) {
  const nav = [
    ["dashboard", "Dashboard", Home],
    ["members", "Members", Users],
    ["history", "History", History],
    ["settings", "Settings", Settings]
  ];

  return (
    <div className="app page-space">

      <header className="topbar">
        <div className="brand">
          <img src="/icons/icon.svg" alt="Islamic Khata" />
          <span>Islamic Khata</span>
        </div>

        <button className="menu-btn" onClick={onLogout}>
          <LogOut />
        </button>
      </header>

      <main className="container">
        {children}
      </main>

      <nav className="bottom-nav">
        {nav.map(([id, title, Icon]) => (
          <button
            key={id}
            className={"nav-item " + (screen === id ? "active" : "")}
            onClick={() => setScreen(id)}
          >
            <Icon size={21} />
            <br />
            {title}
          </button>
        ))}
      </nav>

    </div>
  );
}

/* ---------------- DASHBOARD ---------------- */

function Dashboard({ user, members, openMember, onAdd }) {
  const paid = members.filter(m => m.status === "paid").length;
  const unpaid = members.length - paid;

  return (
    <div>

      <div
        className={"hero " + (user.masjidPhoto ? "has-cover" : "")}
        style={user.masjidPhoto ? {
          backgroundImage:
            `linear-gradient(rgba(0,45,30,.72),rgba(0,35,24,.82)),url(${user.masjidPhoto})`
        } : {}}
      >
        <label
  className={"hero " + (user.masjidPhoto ? "has-cover" : "")}
  style={{
    ...(user.masjidPhoto
      ? {
          backgroundImage:
            `linear-gradient(rgba(0,45,30,.72),rgba(0,35,24,.82)),url(${user.masjidPhoto})`
        }
      : {}),
    backgroundSize: "cover",
    backgroundPosition: "center",
    cursor: "pointer",
    display: "block"
  }}
>
  <div className="hero-content">
    <span className="hero-badge">Assalamu Alaikum</span>

    <h1>{user.masjidName || "Your Masjid"}</h1>

    <p>{user.village || "Village / Area"}</p>

    <p>Monthly Collection Manager</p>

    <span className="cover-btn">
      📷 Add Cover
    </span>

    <input
      type="file"
      accept="image/*"
      hidden
      onChange={e => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 4 * 1024 * 1024) {
          alert("Photo 4MB se chhoti honi chahiye.");
          return;
        }

        const reader = new FileReader();

        reader.onload = () => {
          repo.saveUser({
            ...user,
            masjidPhoto: reader.result
          });

          location.reload();
        };

        reader.readAsDataURL(file);
      }}
    />
  </div>
</label>

      <div className="stats-grid">
        <Stat title="Total Members" n={members.length} />
        <Stat title="Paid Members" n={paid} good />
        <Stat title="Not Paid Members" n={unpaid} bad />
      </div>

      <div className="section">
        <div className="section-title">
          <h2>Home Holders</h2>
          <button className="btn btn-gold" onClick={onAdd}>
            <Plus size={17} /> Add Member
          </button>
        </div>

        <MemberSearch members={members} openMember={openMember} />

        <div className="member-list">
          {members.map(m =>
            <MemberRow key={m.id} m={m}
              open={() => openMember(m)} />
          )}
        </div>
      </div>

    </div>
  );
}

function Stat({ title, n, good, bad }) {
  return (
    <div className={"stat-card " + (good ? "paid" : "") + (bad ? "unpaid" : "")}>
      <h3>{n}</h3>
      <p>{title}</p>
    </div>
  );
}

function MemberSearch({ members, openMember }) {
  const [q, setQ] = useState("");

  const results = q
    ? members.filter(m =>
        (m.name + " " + m.mobile)
          .toLowerCase()
          .includes(q.toLowerCase())
      )
    : [];

  return (
    <div style={{ position: "relative" }}>
      <input
        className="input search"
        placeholder="Search by name or mobile number..."
        value={q}
        onChange={e => setQ(e.target.value)}
      />

      {q && results.length > 0 && (
        <div className="section">
          {results.map(m =>
            <button
              key={m.id}
              className="btn btn-outline"
              style={{ width: "100%", marginBottom: 5 }}
              onClick={() => openMember(m)}
            >
              {m.name} — {m.mobile}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function MemberRow({ m, open }) {
  return (
    <button
      className="member-card"
      style={{ width: "100%", textAlign: "left" }}
      onClick={open}
    >
      <div className="member-left">
        {m.photo
          ? <img className="member-avatar" src={m.photo} />
          : <div className="member-avatar"
              style={{
                display: "grid",
                placeItems: "center",
                fontWeight: 800
              }}>
              {m.name.slice(0, 1).toUpperCase()}
            </div>
        }

        <div>
          <div className="member-name">{m.name}</div>
          <div className="member-meta">
            {m.mobile} • {money(m.monthlyFee)}/month
          </div>
        </div>
      </div>

      <span className={"status " + (m.status === "paid" ? "paid" : "unpaid")}>
        {m.status === "paid" ? "PAID" : "NOT PAID"}
      </span>
    </button>
  );
}

/* ---------------- MEMBERS ---------------- */

function Members({ members, openMember, onAdd }) {
  return (
    <div className="section">
      <div className="section-title">
        <h2>Home Holders</h2>
        <button className="btn btn-gold" onClick={onAdd}>
          <Plus size={17} /> Add Member
        </button>
      </div>

      <MemberSearch members={members} openMember={openMember} />

      <div className="member-list">
        {members.map(m =>
          <MemberRow key={m.id} m={m}
            open={() => openMember(m)} />
        )}
      </div>
    </div>
  );
}

/* ---------------- ADD MEMBER ---------------- */

function MemberForm({ user, onBack, onSave }) {
  const [f, setF] = useState({
    name: "", mobile: "", monthlyFee: user.defaultFee || 500,
    photo: ""
  });

  const save = e => {
    e.preventDefault();
    repo.addMember(user.id, f);

    if (f.photo) {
      const db = JSON.parse(localStorage.getItem("islamic_khata_db_v1"));
      const m = db.members[db.members.length - 1];
      m.photo = f.photo;
      localStorage.setItem("islamic_khata_db_v1", JSON.stringify(db));
    }

    onSave();
  };

  return (
    <div className="section">

      <button className="btn btn-outline" onClick={onBack}>
        <ArrowLeft size={17} /> Back
      </button>

      <h2>Add New Home Holder</h2>

      <form onSubmit={save}>

        <Field label="Home Holder Name" icon={<UserRound />}
          value={f.name}
          placeholder="Enter full name"
          onChange={v => setF({ ...f, name: v })}
        />

        <Field label="Mobile Number" icon={<Smartphone />}
          value={f.mobile}
          placeholder="10 digit mobile number"
          onChange={v => setF({ ...f, mobile: v })}
        />

        <Field label="Monthly Fee" icon={<IndianRupee />}
          value={f.monthlyFee}
          placeholder="500"
          onChange={v => setF({ ...f, monthlyFee: v })}
        />

        <PhotoUpload
          value={f.photo}
          onChange={v => setF({ ...f, photo: v })}
        />

        <button className="btn btn-primary" type="submit">
          Save Member
        </button>

      </form>
    </div>
  );
}

function PhotoUpload({ value, onChange }) {
  return (
    <div className="photo-upload">
      <b>Member Photo</b>
      <input
        type="file"
        accept="image/*"
        onChange={e => {
          const file = e.target.files?.[0];
          if (!file) return;
          const r = new FileReader();
          r.onload = () => onChange(r.result);
          r.readAsDataURL(file);
        }}
      />

      {value && (
        <img className="photo-preview" src={value} alt="Member" />
      )}
    </div>
  );
}

/* ---------------- MEMBER DETAILS ---------------- */

function MemberDetails({ member, onBack, onChanged }) {
  const [pay, setPay] = useState(false);
  const [edit, setEdit] = useState(false);
  const [amount, setAmount] = useState(member.monthlyFee);

  if (!member) return null;

  const current = repo.effectiveStatus(member);
  const payments = repo.getPayments(member.id);

  const receive = () => {
    const a = Number(amount);
    if (!a) return;

    repo.receivePayment(member.id, a, today());
    setPay(false);
    onChanged();
  };

  return (
    <div>

      <button className="btn btn-outline" onClick={onBack}>
        <ArrowLeft size={17} /> Members
      </button>

      <div className="member-header">

        {member.photo
          ? <img className="member-large-avatar"
              src={member.photo} alt={member.name} />
          : <div className="member-large-avatar"
              style={{
                display: "grid",
                placeItems: "center",
                margin: "auto",
                fontSize: 40,
                fontWeight: 800
              }}>
              {member.name.slice(0, 1).toUpperCase()}
            </div>
        }

        <h2>{member.name}</h2>
        <p>{member.mobile}</p>

        <span className={
          "status " + (current.status === "paid" ? "paid" : "unpaid")
        }>
          {current.status === "paid" ? "PAID" : "NOT PAID"}
        </span>

        <PhotoUpload
          value={member.photo || ""}
          onChange={photo => {
            const db = JSON.parse(localStorage.getItem("islamic_khata_db_v1"));
            const m = db.members.find(x => x.id === member.id);
            if (m) m.photo = photo;
            localStorage.setItem("islamic_khata_db_v1", JSON.stringify(db));
            onChanged();
          }}
        />

        <button className="edit-member-btn"
          onClick={() => setEdit(true)}>
          <Pencil size={16} /> Edit Member
        </button>

      </div>

      <div className="section">

        <div className="detail-grid">
          <div className="detail-box">
            <small>Monthly Fee</small>
            <strong>{money(member.monthlyFee)}</strong>
          </div>

          <div className="detail-box">
            <small>Total Paid</small>
            <strong>{money(repo.totalPaid(member.id))}</strong>
          </div>

          <div className="detail-box">
            <small>Paid Months</small>
            <strong>{repo.totalMonths(member.id)} months</strong>
          </div>

          <div className="detail-box">
            <small>Paid Until</small>
            <strong>{formatDate(current.paidUntil)}</strong>
          </div>
        </div>

        <div className="member-actions" style={{ marginTop: 15 }}>
          <a className="small-btn"
            href={"tel:" + member.mobile}>📞 Call</a>

          <a className="small-btn"
            href={"https://wa.me/91" + member.mobile}
            target="_blank">💬 WhatsApp</a>

          <a className="small-btn"
            href={"sms:" + member.mobile}>✉️ Message</a>
        </div>

        <button className="btn btn-primary"
          style={{ marginTop: 15, width: "100%" }}
          onClick={() => setPay(true)}>
          <WalletCards size={18} /> Receive Payment
        </button>

      </div>

      <div className="section">
        <h2>Payment History</h2>

        {payments.length === 0 && (
          <div className="empty">No payments yet.</div>
        )}

        {payments.map(p =>
          <div className="history-row" key={p.id}>
            <div>
              <b>{money(p.amount)}</b>
              <br />
              <small>{p.monthsCovered} month(s)</small>
            </div>

            <div>
              <small>{formatDate(p.date)}</small>
            </div>
          </div>
        )}
      </div>

      {pay && (
        <div className="modal-overlay">
          <div className="modal">

            <button className="btn btn-outline"
              onClick={() => setPay(false)}>
              <X />
            </button>

            <h2>Receive Payment</h2>

            <Field label="Payment Amount"
              icon={<IndianRupee />}
              value={amount}
              placeholder="500"
              onChange={setAmount}
            />

            <p>
              {monthsCovered(amount, member.monthlyFee)}
              {" "}complete month(s) will be added.
            </p>

            <button className="btn btn-primary"
              onClick={receive}>
              Save Payment
            </button>

          </div>
        </div>
      )}

      {edit && (
        <EditMember
          member={member}
          close={() => setEdit(false)}
          saved={() => {
            setEdit(false);
            onChanged();
          }}
        />
      )}

    </div>
  );
}

/* ---------------- EDIT MEMBER ---------------- */

function EditMember({ member, close, saved }) {
  const [f, setF] = useState({
    name: member.name,
    mobile: member.mobile,
    monthlyFee: member.monthlyFee
  });

  const save = () => {
    const db = JSON.parse(localStorage.getItem("islamic_khata_db_v1"));
    const m = db.members.find(x => x.id === member.id);

    if (m) {
      m.name = f.name;
      m.mobile = f.mobile;
      m.monthlyFee = Number(f.monthlyFee) || 500;
    }

    localStorage.setItem("islamic_khata_db_v1", JSON.stringify(db));
    saved();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">

        <button className="btn btn-outline"
          onClick={close}>
          <X />
        </button>

        <h2>Edit Member</h2>

        <Field label="Member Name"
          icon={<UserRound />}
          value={f.name}
          onChange={v => setF({ ...f, name: v })}
        />

        <Field label="Mobile Number"
          icon={<Smartphone />}
          value={f.mobile}
          onChange={v => setF({ ...f, mobile: v })}
        />

        <Field label="Monthly Fee"
          icon={<IndianRupee />}
          value={f.monthlyFee}
          onChange={v => setF({ ...f, monthlyFee: v })}
        />

        <button className="btn btn-primary"
          onClick={save}>
          Save Changes
        </button>

      </div>
    </div>
  );
}

/* ---------------- HISTORY ---------------- */

function HistoryPage({ members }) {
  const all = members.flatMap(m =>
    repo.getPayments(m.id).map(p => ({
      ...p, name: m.name
    }))
  );

  return (
    <div className="section">
      <h2>Payment History</h2>

      {all.length === 0 &&
        <div className="empty">No payment records.</div>
      }

      {all.map(p =>
        <div className="history-row" key={p.id}>
          <div>
            <b>{p.name}</b>
            <br />
            <small>{money(p.amount)} • {p.monthsCovered} month(s)</small>
          </div>
          <small>{formatDate(p.date)}</small>
        </div>
      )}
    </div>
  );
}

/* ---------------- SETTINGS ---------------- */

function SettingsPage({ user, onSave }) {
  const [f, setF] = useState({ ...user });

  return (
    <div className="section">

      <h2>Settings</h2>

      <Field label="Owner Name"
        icon={<UserRound />}
        value={f.name || ""}
        onChange={v => setF({ ...f, name: v })}
      />

      <Field label="Mobile Number"
        icon={<Smartphone />}
        value={f.mobile || ""}
        onChange={v => setF({ ...f, mobile: v })}
      />

      <Field label="Village / Area"
        icon={<MapPin />}
        value={f.village || ""}
        onChange={v => setF({ ...f, village: v })}
      />

      <Field label="Masjid Name"
        icon={<Building2 />}
        value={f.masjidName || ""}
        onChange={v => setF({ ...f, masjidName: v })}
      />

      <div className="photo-upload">
        <b>Masjid Cover Photo</b>
        <p>Dashboard ke cover ke liye photo</p>

        <input
          type="file"
          accept="image/*"
          onChange={e => {
            const file = e.target.files?.[0];
            if (!file) return;

            const r = new FileReader();
            r.onload = () =>
              setF({ ...f, masjidPhoto: r.result });
            r.readAsDataURL(file);
          }}
        />

        {f.masjidPhoto &&
          <img className="photo-preview"
            src={f.masjidPhoto} />
        }
      </div>

      <button className="btn btn-primary"
        onClick={() => onSave(f)}>
        Save Settings
      </button>

    </div>
  );
}

seedDemo();

createRoot(document.getElementById("root")).render(<App />);

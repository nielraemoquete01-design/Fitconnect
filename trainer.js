const TRAINER_PAGES = [
  ["trainerDashboard", "Dashboard", "layout-dashboard"],
  ["clients", "My Clients", "users"],
  ["plans", "Workout Plans", "dumbbell"],
  ["sessions", "Training Sessions", "calendar-days"],
  ["progress", "Progress Monitoring", "chart-no-axes-combined"],
  ["earnings", "Earnings", "wallet"],
  ["messages", "Messages", "message-circle"],
  ["profile", "Profile", "user-round"],
  ["trainerSettings", "Settings", "settings"]
];
let trainerCalendarDate = new Date();
let trainerProgressClientId = "";
let trainerMessageClientId = "";
const defaultSideNavMarkup=$("#sideNav").innerHTML;
const defaultBottomNavMarkup=$(".bottom-nav").innerHTML;
const defaultPromoMarkup=$(".sidebar-promo").innerHTML;
const defaultSideLabel=$(".sidebar .side-label").textContent;

const trainerEscape = value => String(value ?? "").replace(/[&<>"']/g, c => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[c]);
const trainerToday = () => new Date().toISOString().slice(0, 10);
const trainerDate = (offset, time = "10:00") => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.toISOString().slice(0, 10)}T${time}`;
};
const trainerId = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const trainerUrl = value => {
  const url = String(value || "").trim();
  return /^https?:\/\/[^\s"'<>]+$/i.test(url) ? url : "";
};
const trainerRead = (key, seed) => {
  const value = Store.get(`trainer_${key}`);
  if (value !== null) return value;
  Store.set(`trainer_${key}`, seed);
  return seed;
};
const trainerSave = (key, value) => Store.set(`trainer_${key}`, value);
const trainerMoney = value => `₱${Number(value || 0).toLocaleString("en-PH")}`;
const trainerClients = () => trainerRead("clients", [
  {id:"client-jamie",name:"Jamie Cruz",email:"jamie@example.demo",age:28,goal:"Weight Loss",level:"Beginner",weight:72,targetWeight:64,subscription:"Active",planId:"plan-foundation",active:true,photo:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240",lastWorkout:trainerToday(),attendance:86,workoutHistory:["Full Body Foundation","Low-impact Cardio"],progress:[{date:trainerDate(-28).slice(0,10),weight:75,completion:60,note:"Started walking consistently."},{date:trainerDate(-14).slice(0,10),weight:73.5,completion:72,note:"Energy and consistency improving."},{date:trainerToday(),weight:72,completion:86,note:"Strong weekly attendance."}]},
  {id:"client-patricia",name:"Patricia Lim",email:"patricia@example.demo",age:35,goal:"Muscle Building",level:"Intermediate",weight:58,targetWeight:62,subscription:"Active",planId:"plan-strength",active:true,photo:"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240",lastWorkout:trainerToday(),attendance:92,workoutHistory:["Upper-body Strength","Full Body Foundation"],progress:[{date:trainerDate(-28).slice(0,10),weight:56.8,completion:74,note:"Building confidence with free weights."},{date:trainerDate(-14).slice(0,10),weight:57.4,completion:84,note:"Good strength progress."},{date:trainerToday(),weight:58,completion:92,note:"Increasing load with controlled form."}]},
  {id:"client-daniel",name:"Daniel Santos",email:"daniel@example.demo",age:24,goal:"Strength Training",level:"Advanced",weight:81,targetWeight:80,subscription:"Active",planId:"plan-strength",active:true,photo:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240",lastWorkout:trainerDate(-9).slice(0,10),attendance:54,workoutHistory:["Strength Base"],progress:[{date:trainerDate(-28).slice(0,10),weight:82,completion:72,note:"Strong baseline with occasional missed sessions."},{date:trainerDate(-14).slice(0,10),weight:81.5,completion:65,note:"Schedule has been busy."},{date:trainerDate(-9).slice(0,10),weight:81,completion:54,note:"Check in about training availability."}]},
  {id:"client-mia",name:"Mia Torres",email:"mia@example.demo",age:31,goal:"Flexibility",level:"Beginner",weight:64,targetWeight:64,subscription:"Expired",planId:"",active:false,photo:"https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=240",lastWorkout:trainerDate(-18).slice(0,10),attendance:38,workoutHistory:["Morning Mobility"],progress:[{date:trainerDate(-28).slice(0,10),weight:64,completion:55,note:"Enjoys mobility-focused routines."},{date:trainerDate(-14).slice(0,10),weight:64,completion:38,note:"Membership expired; follow up before resuming."}]}
]);
const trainerPlans = () => trainerRead("plans", [
  {id:"plan-foundation",title:"Full Body Foundation",category:"Beginner Workouts",level:"Beginner",duration:"4 weeks",days:3,description:"Build a steady foundation with low-impact, full-body sessions.",exercises:[{name:"Bodyweight squat",sets:3,reps:"10 reps",duration:"",rest:"60 sec",instructions:"Sit hips back and keep your chest lifted.",video:""},{name:"Incline push-up",sets:3,reps:"8 reps",duration:"",rest:"60 sec",instructions:"Use a stable raised surface and keep your body aligned.",video:""}]},
  {id:"plan-strength",title:"Progressive Strength",category:"Strength Training",level:"Intermediate",duration:"6 weeks",days:4,description:"A balanced strength schedule with recovery between sessions.",exercises:[{name:"Dumbbell row",sets:3,reps:"10 each side",duration:"",rest:"75 sec",instructions:"Keep your back neutral and pull with control.",video:""},{name:"Glute bridge",sets:3,reps:"12 reps",duration:"",rest:"60 sec",instructions:"Brace gently and pause at the top.",video:""}]},
  {id:"plan-cardio",title:"Cardio Reset",category:"Cardio",level:"Beginner",duration:"3 weeks",days:3,description:"Short, joint-friendly intervals for consistent movement.",exercises:[{name:"March in place",sets:3,reps:"",duration:"45 sec",rest:"30 sec",instructions:"Stay tall and choose a comfortable pace.",video:""}]}
]);
const trainerSessions = () => trainerRead("sessions", [
  {id:"session-1",clientId:"client-jamie",date:trainerDate(1,"09:30"),duration:45,description:"Weekly form and progress check-in",status:"Scheduled"},
  {id:"session-2",clientId:"client-patricia",date:trainerDate(2,"14:00"),duration:60,description:"Upper-body strength session",status:"Requested"},
  {id:"session-3",clientId:"client-daniel",date:trainerDate(4,"11:00"),duration:45,description:"Technique review and load progression",status:"Scheduled"},
  {id:"session-4",clientId:"client-jamie",date:trainerDate(-3,"10:00"),duration:45,description:"Movement assessment",status:"Completed"}
]);
const trainerPayments = () => trainerRead("payments", [
  {id:"payment-1",clientId:"client-jamie",amount:399,date:new Date().toISOString().slice(0,10),status:"Paid",description:"Standard monthly subscription"},
  {id:"payment-2",clientId:"client-patricia",amount:699,date:new Date().toISOString().slice(0,10),status:"Paid",description:"Premium monthly subscription"},
  {id:"payment-3",clientId:"client-daniel",amount:399,date:trainerDate(-12).slice(0,10),status:"Pending",description:"Standard monthly subscription"},
  {id:"payment-4",clientId:"client-mia",amount:199,date:trainerDate(-45).slice(0,10),status:"Expired",description:"Basic monthly subscription"},
  {id:"payment-5",clientId:"client-patricia",amount:699,date:trainerDate(-32).slice(0,10),status:"Paid",description:"Premium monthly subscription"}
]);
const trainerMessages = () => trainerRead("messages", [
  {id:trainerId("msg"),clientId:"client-jamie",sender:"trainer",text:"Nice work keeping your sessions consistent this week. Keep the squat tempo controlled.",time:trainerDate(-1,"16:15")},
  {id:trainerId("msg"),clientId:"client-jamie",sender:"client",text:"Thank you! Should I repeat the mobility warm-up before the next workout?",time:trainerDate(-1,"16:30")},
  {id:trainerId("msg"),clientId:"client-patricia",sender:"trainer",text:"Your strength plan is ready. Here is a form reference: https://example.com/strength-demo",time:trainerDate(-2,"11:00")}
]);
const trainerProfile = () => trainerRead("profile", {
  name:currentUser?.name || "Alex Morgan",
  email:currentUser?.email || "trainer@fitconnect.demo",
  bio:"Certified coach helping people build sustainable strength and healthy routines.",
  certifications:"Certified Personal Trainer",
  specialties:"Strength Training, Weight Loss",
  photo:"https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=300",
  availability:"Monday - Friday",
  hours:"09:00 - 17:00"
});

function trainerEnsureData() {
  trainerClients(); trainerPlans(); trainerSessions(); trainerPayments(); trainerMessages(); trainerProfile();
  trainerRead("preferences", {sessionReminders:true,weeklySummary:true,showInactive:true});
}
function trainerNavMarkup(bottom = false) {
  return TRAINER_PAGES.map(([page,label,icon]) =>
    `<button class="${bottom ? "bottom-link" : "nav-link"}" data-page="${page}"><i data-lucide="${icon}"></i><span>${trainerEscape(label)}</span>${page==="messages"&&trainerUnreadCount()?`<em class="trainer-nav-count">${trainerUnreadCount()}</em>`:""}</button>`
  ).join("");
}
function syncTrainerNavigation() {
  const side = $("#sideNav"), bottom = $(".bottom-nav");
  if (side) side.innerHTML = trainerNavMarkup();
  if (bottom) { bottom.classList.add("trainer-bottom-nav"); bottom.innerHTML = trainerNavMarkup(true); }
  const label = $(".sidebar .side-label");
  if (label) label.textContent = "TRAINER WORKSPACE";
  const sideAvatar=$(".profile-mini .avatar");
  if(sideAvatar)sideAvatar.textContent=initials(currentUser?.name);
  const promo = $(".sidebar-promo");
  if (promo) promo.innerHTML = `<div class="promo-icon"><i data-lucide="sparkles"></i></div><b>Coach with confidence</b><p>Keep client plans, sessions, and progress in one place.</p><button class="btn btn-light btn-small" data-page="profile">View trainer profile</button>`;
}
function restoreDefaultNavigation() {
  const side=$("#sideNav"),bottom=$(".bottom-nav"),promo=$(".sidebar-promo"),label=$(".sidebar .side-label");
  if(side)side.innerHTML=defaultSideNavMarkup;
  if(bottom){bottom.classList.remove("trainer-bottom-nav");bottom.innerHTML=defaultBottomNavMarkup;}
  if(promo)promo.innerHTML=defaultPromoMarkup;
  if(label)label.textContent=defaultSideLabel;
}
function trainerUnreadCount() {
  return trainerRead("messages", []).filter(m => m.sender === "client" && !m.read).length;
}

const baseRenderPage = renderPage;
renderPage = function(page) {
  if (currentUser?.role === "trainer") {
    trainerEnsureData();
    syncTrainerNavigation();
    if (page === "settings") page = "trainerSettings";
  } else restoreDefaultNavigation();
  baseRenderPage(page);
  if (currentUser?.role === "trainer") {
    const titles = Object.fromEntries(TRAINER_PAGES.map(([key,label]) => [key,label]));
    $("#pageTitle").textContent = titles[page] || "Trainer Workspace";
    $("#pageEyebrow").textContent = "TRAINER WORKSPACE";
    $$(".sidebar .nav-link, .bottom-nav .bottom-link").forEach(button => button.classList.toggle("active", button.dataset.page === page));
  }
};

const baseTrainerPage = trainerPage;
trainerPage = function(page) {
  trainerEnsureData();
  if (page === "training" || page === "trainerDashboard") return trainerDashboardPage();
  if (page === "clients") return trainerClientsPage();
  if (page === "plans") return trainerPlansPage();
  if (page === "sessions") return trainerSessionsPage();
  if (page === "progress") return trainerProgressPage();
  if (page === "earnings") return trainerEarningsPage();
  if (page === "messages") return trainerMessagesPage();
  if (page === "profile") return trainerProfilePage();
  if (page === "trainerSettings" || page === "settings") return trainerSettingsPage();
  return baseTrainerPage(page);
};

function trainerPageHeading(title, subtitle, action = "") {
  return `<div class="page-heading"><div><h1>${trainerEscape(title)}</h1><p>${trainerEscape(subtitle)}</p></div>${action}</div>`;
}
function trainerClientById(id) { return trainerClients().find(client => client.id === id); }
function trainerPlanById(id) { return trainerPlans().find(plan => plan.id === id); }
function trainerClientOptions(selected = "") {
  return trainerClients().map(c => `<option value="${trainerEscape(c.id)}" ${c.id===selected?"selected":""}>${trainerEscape(c.name)}</option>`).join("");
}
function trainerPlanOptions(selected = "") {
  return `<option value="">No plan assigned</option>${trainerPlans().map(p=>`<option value="${trainerEscape(p.id)}" ${p.id===selected?"selected":""}>${trainerEscape(p.title)}</option>`).join("")}`;
}
function trainerStat(label,value,icon,detail="") {
  return `<div class="stat-card"><div class="stat-top">${trainerEscape(label)}<span class="stat-icon"><i data-lucide="${icon}"></i></span></div><strong>${trainerEscape(value)}</strong><small>${trainerEscape(detail)}</small></div>`;
}
function trainerRecentDate(date) {
  if (!date) return "No activity recorded";
  const diff = Math.floor((new Date(`${trainerToday()}T00:00:00`) - new Date(`${date}T00:00:00`))/86400000);
  return diff <= 0 ? "Today" : diff === 1 ? "Yesterday" : `${diff} days ago`;
}
function trainerMissedClients() {
  return trainerClients().filter(c => c.active && (!c.lastWorkout || (new Date(`${trainerToday()}T00:00:00`) - new Date(`${c.lastWorkout}T00:00:00`)) / 86400000 >= 7));
}
function trainerDashboardPage() {
  const clients=trainerClients(), sessions=trainerSessions(), payments=trainerPayments(), now=new Date();
  const active=clients.filter(c=>c.active), upcoming=sessions.filter(s=>["Scheduled","Requested","Accepted"].includes(s.status)&&new Date(s.date)>=now).sort((a,b)=>a.date.localeCompare(b.date));
  const monthPayments=payments.filter(p=>p.status==="Paid"&&p.date.slice(0,7)===trainerToday().slice(0,7));
  const earnings=monthPayments.reduce((sum,p)=>sum+p.amount,0);
  const completed=sessions.filter(s=>s.status==="Completed").length+clients.reduce((sum,c)=>sum+c.workoutHistory.length,0);
  const missed=trainerMissedClients();
  const months=Array.from({length:6},(_,i)=>{const d=new Date();d.setMonth(d.getMonth()-5+i);return {label:d.toLocaleString("en",{month:"short"}),key:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`};});
  const earningsMax=Math.max(1,...months.map(m=>payments.filter(p=>p.status==="Paid"&&p.date.slice(0,7)===m.key).reduce((sum,p)=>sum+p.amount,0)));
  const growthMonths=months.map(m=>{const [y,mo]=m.key.split("-").map(Number),cutoff=new Date(y,mo,0,23,59,59);return {...m,count:clients.filter(c=>new Date(`${c.createdAt||c.progress?.[0]?.date||trainerToday()}T23:59:59`)<=cutoff).length};});
  const growthMax=Math.max(1,...growthMonths.map(m=>m.count));
  const activity=clients.flatMap(c=>c.progress.slice(-1).map(p=>({name:c.name,text:p.note||"Progress updated",date:p.date}))).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4);
  return `${trainerPageHeading(`Welcome back, ${trainerEscape(currentUser.name.split(" ")[0])}`, "Here is your coaching overview and the work ahead.", `<button class="btn btn-primary btn-small" data-page="sessions"><i data-lucide="plus"></i> Schedule session</button>`)}
    <div class="section stat-grid">${trainerStat("Total clients",clients.length,"users","All client records")}${trainerStat("Active clients",active.length,"user-check","Currently training")}${trainerStat("Active subscriptions",clients.filter(c=>c.subscription==="Active").length,"badge-check","Subscriptions in good standing")}${trainerStat("Upcoming sessions",upcoming.length,"calendar-clock","Scheduled and requested")}${trainerStat("Monthly earnings",trainerMoney(earnings),"wallet","Paid demo transactions")}${trainerStat("Completed workouts",completed,"dumbbell","Recorded workout activity")}</div>
    <div class="section trainer-dashboard-grid">
      <div class="panel"><div class="section-head"><h3>Monthly earnings</h3><span class="muted">Last 6 months</span></div><div class="chart-box trainer-chart">${months.map(m=>{const amount=payments.filter(p=>p.status==="Paid"&&p.date.slice(0,7)===m.key).reduce((sum,p)=>sum+p.amount,0);return `<div class="chart-col"><b>${amount?trainerMoney(amount):""}</b><div class="chart-bar" style="height:${Math.max(4,amount/earningsMax*78)}%"></div>${m.label}</div>`}).join("")}</div><p class="muted-note">Sample amounts only. Payment processing and withdrawals are not connected.</p></div>
      <div class="panel"><div class="section-head"><h3>Client growth</h3><button data-page="clients">Manage clients</button></div><div class="trainer-growth"><div><strong>${clients.length}</strong><small>Total client profiles</small></div><div><strong>${active.length}</strong><small>Active now</small></div></div><div class="chart-box trainer-growth-chart">${growthMonths.map(m=>`<div class="chart-col"><b>${m.count}</b><div class="chart-bar" style="height:${Math.max(4,m.count/growthMax*70)}%"></div>${m.label}</div>`).join("")}</div><div class="trainer-activity-rate"><div><b>${clients.length?Math.round(active.reduce((sum,c)=>sum+c.attendance,0)/Math.max(1,active.length)):0}%</b><small>Average workout completion</small></div><div class="trainer-ring"><span>${clients.length?Math.round(active.reduce((sum,c)=>sum+c.attendance,0)/Math.max(1,active.length)):0}%</span></div></div></div>
    </div>
    <div class="section trainer-dashboard-grid">
      <div class="panel"><div class="section-head"><h3>Upcoming sessions</h3><button data-page="sessions">Open calendar</button></div>${upcoming.slice(0,4).length?`<div class="trainer-list">${upcoming.slice(0,4).map(s=>{const c=trainerClientById(s.clientId);return `<div class="trainer-list-row"><span class="trainer-list-icon"><i data-lucide="calendar"></i></span><div><b>${trainerEscape(c?.name||"Client")}</b><small>${new Date(s.date).toLocaleString([], {weekday:"short",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})} · ${s.duration} min</small></div><span class="badge ${s.status==="Requested"?"trainer-badge-warn":""}">${trainerEscape(s.status)}</span></div>`}).join("")}</div>`:`<div class="empty-state"><i data-lucide="calendar-check"></i><p>No upcoming sessions. Add one to your calendar.</p></div>`}</div>
      <div class="panel"><div class="section-head"><h3>Recent client activity</h3><button data-page="progress">View progress</button></div>${activity.length?`<div class="trainer-list">${activity.map(a=>`<div class="trainer-list-row"><span class="avatar">${initials(a.name)}</span><div><b>${trainerEscape(a.name)}</b><small>${trainerEscape(a.text)}</small></div><time>${trainerRecentDate(a.date)}</time></div>`).join("")}</div>`:`<div class="empty-state"><p>Progress updates will appear here.</p></div>`}</div>
    </div>
    <div class="section panel trainer-ai-panel"><div><span class="trainer-ai-tag"><i data-lucide="sparkles"></i> COACHING FOLLOW-UP</span><h3>${missed.length?`${missed.length} client${missed.length===1?" has":"s have"} missed a workout`:"Clients are on track"}</h3><p>${missed.length?"Check in with clients who have not logged a workout in 7 or more days.":"No active client has missed a workout for a week or longer."}</p></div><div class="trainer-missed-list">${missed.length?missed.slice(0,3).map(c=>`<button class="btn btn-outline btn-small" data-trainer-action="followup" data-id="${trainerEscape(c.id)}">${trainerEscape(c.name)} · Message</button>`).join(""):`<button class="btn btn-outline btn-small" data-page="messages">Open messages</button>`}</div></div>`;
}
function trainerClientsPage() {
  const preferences=trainerRead("preferences",{sessionReminders:true,weeklySummary:true,showInactive:true});
  return `${trainerPageHeading("My clients","Manage client profiles, subscriptions, plans, and activity.",`<button class="btn btn-primary btn-small" data-trainer-action="add-client"><i data-lucide="user-plus"></i> Add client</button>`)}
    <div class="section trainer-toolbar"><div class="searchbar"><i data-lucide="search"></i><input id="trainerClientSearch" placeholder="Search name or email"></div><select id="trainerClientStatus"><option value="all">All statuses</option><option value="active">Active clients</option><option value="inactive">Inactive clients</option></select><select id="trainerSubStatus"><option value="all">All subscriptions</option><option>Active</option><option>Expired</option><option>Pending</option></select></div>
    <div class="section panel table-wrap"><table class="trainer-table"><thead><tr><th>Client</th><th>Goal / level</th><th>Subscription</th><th>Assigned plan</th><th>Last workout</th><th>Progress</th><th>Actions</th></tr></thead><tbody id="trainerClientRows">${trainerClientRows(trainerClients().filter(c=>preferences.showInactive||c.active))}</tbody></table><div id="trainerClientsEmpty" class="empty-state hidden">No clients match these filters.</div></div>
    <p class="muted-note">Client profiles and health-related progress are stored only in this browser prototype. Do not enter real sensitive health data.</p>`;
}
function trainerClientRows(clients) {
  return clients.map(c=>{const p=trainerPlanById(c.planId);return `<tr><td><button class="trainer-client-link" data-trainer-action="view-client" data-id="${trainerEscape(c.id)}"><img src="${trainerEscape(trainerUrl(c.photo)||"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120")}" alt=""><span><b>${trainerEscape(c.name)}</b><small>${trainerEscape(c.email)} · age ${trainerEscape(c.age)}</small></span></button></td><td>${trainerEscape(c.goal)}<small class="trainer-cell-sub">${trainerEscape(c.level)}</small></td><td><span class="badge ${c.subscription==="Active"?"":"trainer-badge-muted"}">${trainerEscape(c.subscription)}</span></td><td>${trainerEscape(p?.title||"Unassigned")}</td><td>${trainerEscape(trainerRecentDate(c.lastWorkout))}</td><td><div class="trainer-progress-line"><span style="width:${Math.max(0,Math.min(100,Number(c.attendance)||0))}%"></span></div><small>${Number(c.attendance)||0}%</small></td><td><div class="trainer-row-actions"><button class="btn btn-outline btn-small" data-trainer-action="edit-client" data-id="${trainerEscape(c.id)}">Edit</button><button class="btn btn-outline btn-small" data-trainer-action="assign-plan" data-id="${trainerEscape(c.id)}">Assign</button><button class="btn btn-outline btn-small" data-trainer-action="message-client" data-id="${trainerEscape(c.id)}">Message</button><button class="btn btn-outline btn-small trainer-danger" data-trainer-action="remove-client" data-id="${trainerEscape(c.id)}">${c.active?"Deactivate":"Remove"}</button></div></td></tr>`}).join("");
}
function trainerClientForm(client = {}) {
  const editing=Boolean(client.id);
  modal(`<form data-trainer-form="${editing?"edit-client":"add-client"}" data-id="${trainerEscape(client.id||"")}">
    <div class="field-grid"><label>Full name<input name="name" required maxlength="80" value="${trainerEscape(client.name||"")}"></label><label>Email<input name="email" type="email" required maxlength="120" value="${trainerEscape(client.email||"")}"></label>
    <label>Age<input name="age" type="number" min="13" max="100" required value="${trainerEscape(client.age||"")}"></label><label>Fitness goal<select name="goal">${["Weight Loss","Muscle Building","Strength Training","Cardio","Flexibility","Beginner Workouts","Full Body Training"].map(x=>`<option ${client.goal===x?"selected":""}>${x}</option>`).join("")}</select></label>
    <label>Fitness level<select name="level">${["Beginner","Intermediate","Advanced"].map(x=>`<option ${client.level===x?"selected":""}>${x}</option>`).join("")}</select></label><label>Subscription<select name="subscription">${["Active","Pending","Expired"].map(x=>`<option ${client.subscription===x?"selected":""}>${x}</option>`).join("")}</select></label>
    <label>Current weight (kg)<input name="weight" type="number" min="1" max="500" step=".1" required value="${trainerEscape(client.weight||"")}"></label><label>Target weight (kg)<input name="targetWeight" type="number" min="1" max="500" step=".1" required value="${trainerEscape(client.targetWeight||"")}"></label>
    <label>Assigned workout plan<select name="planId">${trainerPlanOptions(client.planId||"")}</select></label><label>Profile image URL<input name="photo" type="url" placeholder="https://..." value="${trainerEscape(client.photo||"")}"></label>
    <label class="trainer-check-field"><input name="active" type="checkbox" ${client.active!==false?"checked":""}> Active client</label></div>
    <button class="btn btn-primary full" type="submit">${editing?"Save client":"Add client"}</button></form>`, editing?"Edit client":"Add a client");
}
function trainerViewClient(id) {
  const c=trainerClientById(id); if(!c) return;
  const plan=trainerPlanById(c.planId);
  modal(`<div class="trainer-client-profile"><img src="${trainerEscape(trainerUrl(c.photo)||"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240")}" alt=""><div><h2>${trainerEscape(c.name)}</h2><p>${trainerEscape(c.goal)} · ${trainerEscape(c.level)} · age ${trainerEscape(c.age)}</p></div></div>
    <div class="trainer-profile-metrics"><div><b>${trainerEscape(c.weight)} kg</b><small>Current weight</small></div><div><b>${trainerEscape(c.targetWeight)} kg</b><small>Target weight</small></div><div><b>${Number(c.attendance)||0}%</b><small>Workout completion</small></div></div>
    <div class="trainer-detail-block"><b>Subscription</b><span>${trainerEscape(c.subscription)} · ${c.active?"Active client":"Inactive client"}</span><b>Assigned plan</b><span>${trainerEscape(plan?.title||"No workout plan assigned")}</span><b>Recent workouts</b><span>${c.workoutHistory.length?c.workoutHistory.slice(-5).reverse().map(trainerEscape).join(" · "):"No workouts recorded yet"}</span></div>
    <h3 class="trainer-modal-subhead">Progress history</h3><div class="table-wrap"><table><thead><tr><th>Date</th><th>Weight</th><th>Completion</th><th>Trainer notes</th></tr></thead><tbody>${(c.progress||[]).slice().reverse().map(p=>`<tr><td>${trainerEscape(p.date)}</td><td>${trainerEscape(p.weight)} kg</td><td>${trainerEscape(p.completion)}%</td><td>${trainerEscape(p.note||"—")}</td></tr>`).join("")}</tbody></table></div>
    <div class="trainer-modal-actions"><button class="btn btn-outline" data-trainer-action="edit-client" data-id="${trainerEscape(c.id)}">Edit profile</button><button class="btn btn-primary" data-trainer-action="message-client" data-id="${trainerEscape(c.id)}">Message client</button></div>`, "Client profile");
}
function trainerPlansPage() {
  const plans=trainerPlans(), clients=trainerClients();
  return `${trainerPageHeading("Workout plans","Build weekly programs and assign personalized routines.",`<button class="btn btn-primary btn-small" data-trainer-action="create-plan"><i data-lucide="plus"></i> Create plan</button>`)}
    <div class="section panel trainer-ai-panel"><div><span class="trainer-ai-tag"><i data-lucide="sparkles"></i> SIMULATED AI · RULE-BASED</span><h3>AI workout plan generator</h3><p>Generate a sample weekly routine from a client's goal, experience, and available days. No external AI model is connected.</p></div><div class="trainer-row-actions"><button class="btn btn-outline" data-trainer-action="smart-recommendations">Smart exercise picks</button><button class="btn btn-outline" data-trainer-action="generate-plan">Generate plan</button></div></div>
    <div class="section trainer-plan-grid">${plans.length?plans.map(p=>`<article class="panel trainer-plan-card"><div class="trainer-plan-card-top"><span class="difficulty ${trainerEscape(p.level)}">${trainerEscape(p.level)}</span><button class="icon-btn" aria-label="Edit plan" data-trainer-action="edit-plan" data-id="${trainerEscape(p.id)}"><i data-lucide="pencil"></i></button></div><span class="trainer-plan-category">${trainerEscape(p.category)}</span><h3>${trainerEscape(p.title)}</h3><p>${trainerEscape(p.description)}</p><div class="meta-row"><span><i data-lucide="calendar-days"></i>${trainerEscape(p.days)} days/week · ${trainerEscape(p.schedule||trainerDefaultSchedule(p.days))}</span><span><i data-lucide="clock"></i>${trainerEscape(p.duration)}</span><span><i data-lucide="dumbbell"></i>${p.exercises.length} exercises</span></div><div class="trainer-plan-assigned"><b>${clients.filter(c=>c.planId===p.id).length}</b> assigned client(s)</div><div class="trainer-row-actions"><button class="btn btn-outline btn-small" data-trainer-action="assign-plan-to" data-id="${trainerEscape(p.id)}">Assign to client</button><button class="btn btn-outline btn-small" data-trainer-action="edit-plan" data-id="${trainerEscape(p.id)}">Edit</button><button class="btn btn-outline btn-small trainer-danger" data-trainer-action="delete-plan" data-id="${trainerEscape(p.id)}">Delete</button></div><details><summary>View exercises</summary><ol>${p.exercises.map(x=>`<li><b>${trainerEscape(x.name)}</b> · ${trainerEscape(x.sets)} sets · ${trainerEscape(x.reps||x.duration)} · rest ${trainerEscape(x.rest)}<small>${trainerEscape(x.instructions)}</small>${x.image&&trainerUrl(x.image)?`<a href="${trainerEscape(trainerUrl(x.image))}" target="_blank" rel="noopener noreferrer">Exercise image</a>`:""}${trainerUrl(x.video)?`<a href="${trainerEscape(trainerUrl(x.video))}" target="_blank" rel="noopener noreferrer">Exercise video</a>`:""}</li>`).join("")}</ol></details></article>`).join(""):`<div class="panel empty-state"><i data-lucide="dumbbell"></i><p>No workout plans yet. Create your first plan.</p></div>`}</div>`;
}
function trainerDefaultSchedule(days=3) {
  return ["Mon","Wed","Fri","Sun","Tue","Thu","Sat"].slice(0,Math.max(1,Math.min(7,Number(days)||3))).join(", ");
}
function trainerPlanForm(plan = {}) {
  const editing=Boolean(plan.id);
  const exercises=(plan.exercises||[]).map(x=>[x.name,x.sets,x.reps,x.duration,x.rest,x.instructions,x.video,x.image].join(" | ")).join("\n");
  modal(`<form data-trainer-form="${editing?"edit-plan":"create-plan"}" data-id="${trainerEscape(plan.id||"")}"><div class="field-grid">
    <label>Plan name<input name="title" required maxlength="80" value="${trainerEscape(plan.title||"")}"></label><label>Category<select name="category">${["Weight Loss","Muscle Building","Strength Training","Cardio","Flexibility","Beginner Workouts","Full Body Training"].map(x=>`<option ${plan.category===x?"selected":""}>${x}</option>`).join("")}</select></label>
    <label>Difficulty<select name="level">${["Beginner","Intermediate","Advanced"].map(x=>`<option ${plan.level===x?"selected":""}>${x}</option>`).join("")}</select></label><label>Duration<input name="duration" required maxlength="30" placeholder="e.g. 4 weeks" value="${trainerEscape(plan.duration||"4 weeks")}"></label>
    <label>Workout days per week<input name="days" type="number" min="1" max="7" required value="${trainerEscape(plan.days||3)}"></label><label>Plan description<input name="description" required maxlength="180" value="${trainerEscape(plan.description||"")}"></label>
    </div>    <label>Weekly schedule<input name="schedule" required maxlength="70" placeholder="e.g. Mon, Wed, Fri" value="${trainerEscape(plan.schedule||trainerDefaultSchedule(plan.days||3))}"></label>
    <label>Exercises (one per line: name | sets | reps | duration | rest | instructions | video URL | image URL)<textarea name="exercises" rows="6" placeholder="Bodyweight squat | 3 | 10 reps | | 60 sec | Keep your chest lifted | https://example.com/video | https://example.com/image.jpg" required>${trainerEscape(exercises)}</textarea></label>
    <p class="muted-note">Enter sets/repetitions or duration (for example 30 sec), rest period, instructions, and optional HTTPS image/video URLs. Image URLs are supported; file uploads require a storage service.</p><button class="btn btn-primary full" type="submit">${editing?"Save changes":"Create workout plan"}</button></form>`, editing?"Edit workout plan":"Create workout plan");
}
function trainerSessionsPage() {
  const sessions=trainerSessions(), year=trainerCalendarDate.getFullYear(), month=trainerCalendarDate.getMonth(), first=new Date(year,month,1), startDay=(first.getDay()+6)%7, days=new Date(year,month+1,0).getDate();
  const cells=Array.from({length:42},(_,i)=>{const day=i-startDay+1; if(day<1||day>days)return `<div class="trainer-calendar-cell outside"></div>`; const date=`${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`; const daySessions=sessions.filter(s=>s.date.slice(0,10)===date);return `<div class="trainer-calendar-cell ${date===trainerToday()?"today":""}"><b>${day}</b>${daySessions.slice(0,2).map(s=>`<button data-trainer-action="view-session" data-id="${trainerEscape(s.id)}" class="trainer-calendar-event ${s.status==="Requested"?"requested":""}">${trainerEscape(s.date.slice(11,16))} ${trainerEscape(trainerClientById(s.clientId)?.name||"Client")}</button>`).join("")}${daySessions.length>2?`<small>+${daySessions.length-2} more</small>`:""}</div>`;});
  const list=sessions.slice().sort((a,b)=>a.date.localeCompare(b.date));
  return `${trainerPageHeading("Training sessions","Schedule appointments, review requests, and manage your calendar.",`<button class="btn btn-primary btn-small" data-trainer-action="create-session"><i data-lucide="plus"></i> Schedule session</button>`)}
    <div class="section panel"><div class="section-head"><h3>Session calendar</h3><div class="trainer-calendar-controls"><button class="icon-btn" data-trainer-action="calendar-prev" aria-label="Previous month"><i data-lucide="chevron-left"></i></button><b>${trainerCalendarDate.toLocaleString("en",{month:"long",year:"numeric"})}</b><button class="icon-btn" data-trainer-action="calendar-next" aria-label="Next month"><i data-lucide="chevron-right"></i></button></div></div><div class="trainer-calendar-grid">${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=>`<div class="trainer-calendar-day">${d}</div>`).join("")}${cells.join("")}</div></div>
    <div class="section panel"><div class="section-head"><h3>All sessions</h3><select id="trainerSessionFilter"><option value="all">All statuses</option>${["Requested","Scheduled","Accepted","Completed","Cancelled","Rejected"].map(s=>`<option>${s}</option>`).join("")}</select></div><div class="trainer-session-list" id="trainerSessionRows">${trainerSessionRows(list)}</div></div>`;
}
function trainerSessionRows(sessions) {
  return sessions.length?sessions.map(s=>{const c=trainerClientById(s.clientId);const attendance=s.attendance||(s.status==="Completed"?"Attended":"Not recorded");return `<div class="trainer-session-row"><div class="trainer-session-date"><b>${new Date(s.date).toLocaleDateString([],{month:"short",day:"numeric"})}</b><small>${new Date(s.date).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"})}</small></div><div class="trainer-session-info"><b>${trainerEscape(c?.name||"Client")} · ${trainerEscape(s.duration)} min</b><small>${trainerEscape(s.description)}</small></div><span class="badge ${s.status==="Requested"?"trainer-badge-warn":s.status==="Cancelled"||s.status==="Rejected"?"trainer-badge-muted":""}">${trainerEscape(s.status)}</span><small class="trainer-attendance">${trainerEscape(attendance)}</small><div class="trainer-row-actions">${s.status==="Requested"?`<button class="btn btn-primary btn-small" data-trainer-action="session-accept" data-id="${trainerEscape(s.id)}">Accept</button><button class="btn btn-outline btn-small" data-trainer-action="session-reject" data-id="${trainerEscape(s.id)}">Reject</button>`:""}${["Scheduled","Accepted"].includes(s.status)?`<button class="btn btn-outline btn-small" data-trainer-action="session-complete" data-id="${trainerEscape(s.id)}">Mark attended</button><button class="btn btn-outline btn-small" data-trainer-action="session-cancel" data-id="${trainerEscape(s.id)}">Cancel</button>`:""}</div></div>`}).join(""):`<div class="empty-state"><p>No sessions yet. Scheduled sessions will show here.</p></div>`;
}
function trainerSessionForm(session = {}) {
  modal(`<form data-trainer-form="create-session"><div class="field-grid"><label>Client<select name="clientId" required>${trainerClientOptions(session.clientId||"")}</select></label><label>Date and time<input name="date" type="datetime-local" required min="${trainerEscape(trainerDate(0).slice(0,16))}" value="${trainerEscape(session.date||"")}"></label><label>Duration (minutes)<input name="duration" type="number" min="15" max="240" step="15" required value="${trainerEscape(session.duration||45)}"></label><label>Description<input name="description" required maxlength="160" placeholder="Session focus or notes" value="${trainerEscape(session.description||"")}"></label></div><button class="btn btn-primary full" type="submit">Schedule session</button></form>`, "Schedule a training session");
}
function trainerProgressPage() {
  const clients=trainerClients(), selected=clients.find(c=>c.id===trainerProgressClientId)||clients[0]; trainerProgressClientId=selected?.id||"";
  if(!selected)return `${trainerPageHeading("Progress monitoring","Track client fitness progress.")}<div class="panel empty-state">Add a client to begin tracking progress.</div>`;
  const records=selected.progress||[], maxWeight=Math.max(1,...records.map(p=>Number(p.weight)||0)), bmi=selected.weight/Math.pow(Number(selected.height||170)/100,2);
  const latest=records.at(-1)||{};
  return `${trainerPageHeading("Progress monitoring","Review progress, assessments, workout activity, and coaching notes.",`<button class="btn btn-primary btn-small" data-trainer-action="add-progress" data-id="${trainerEscape(selected.id)}"><i data-lucide="plus"></i> Record assessment</button>`)}
    <div class="section trainer-toolbar"><label class="trainer-select-label">Client<select id="trainerProgressClient">${trainerClientOptions(selected.id)}</select></label><span class="badge">${trainerEscape(selected.goal)} · ${trainerEscape(selected.level)}</span></div>
    <div class="section stat-grid">${trainerStat("Current weight",`${selected.weight} kg`,"scale","Latest recorded")}${trainerStat("Target weight",`${selected.targetWeight} kg`,"target","Client goal")}${trainerStat("Workout completion",`${selected.attendance}%`,"activity","Recorded completion rate")}${trainerStat("Current BMI",Number.isFinite(bmi)?bmi.toFixed(1):"—","heart-pulse","Screening estimate only")}</div>
    <div class="section trainer-dashboard-grid"><div class="panel"><div class="section-head"><h3>Weight trend</h3><span class="muted">kg</span></div><div class="chart-box trainer-chart">${records.map(p=>`<div class="chart-col"><b>${trainerEscape(p.weight)}</b><div class="chart-bar" style="height:${Math.max(5,Number(p.weight)/maxWeight*75)}%"></div>${trainerEscape(new Date(`${p.date}T00:00:00`).toLocaleDateString([],{month:"short",day:"numeric"}))}</div>`).join("")}</div></div>
      <div class="panel"><div class="section-head"><h3>Weekly workout activity</h3><span class="muted">Completion</span></div><div class="trainer-activity-rate"><div><b>${Number(latest.completion||selected.attendance)}%</b><small>Latest recorded completion</small></div><div class="trainer-ring"><span>${Number(latest.completion||selected.attendance)}%</span></div></div><div class="trainer-progress-line trainer-progress-large"><span style="width:${Math.max(0,Math.min(100,Number(latest.completion||selected.attendance)))}%"></span></div><p class="muted-note">Completion is a manually recorded prototype metric, not collected from a wearable or live workout service.</p></div></div>
    <div class="section trainer-dashboard-grid"><div class="panel"><div class="section-head"><h3>Assessment history</h3><button data-trainer-action="add-progress" data-id="${trainerEscape(selected.id)}">Add record</button></div><div class="table-wrap"><table><thead><tr><th>Date</th><th>Weight</th><th>Completion</th><th>Assessment / note</th></tr></thead><tbody>${records.slice().reverse().map(p=>`<tr><td>${trainerEscape(p.date)}</td><td>${trainerEscape(p.weight)} kg</td><td>${trainerEscape(p.completion)}%</td><td>${trainerEscape(p.note||"—")}</td></tr>`).join("")}</tbody></table></div></div>
      <div class="panel"><div class="section-head"><h3>Trainer recommendations</h3><span class="trainer-ai-tag">RULE-BASED</span></div><p>${trainerEscape(trainerProgressAdvice(selected))}</p><button class="btn btn-outline btn-small" data-trainer-action="message-client" data-id="${trainerEscape(selected.id)}">Share feedback</button></div></div>
    <div class="section panel"><div class="section-head"><h3>Progress photos</h3><span class="muted">Optional image links</span></div>${selected.photos?.length?`<div class="trainer-photo-grid">${selected.photos.map((photo,i)=>`<a href="${trainerEscape(trainerUrl(photo.url))}" target="_blank" rel="noopener noreferrer"><img src="${trainerEscape(trainerUrl(photo.url))}" alt="${photo.before?"Before":"After"} progress photo ${i+1}"><small>${photo.before?"Before":"After"} · ${trainerEscape(photo.date)}</small></a>`).join("")}</div>`:`<div class="empty-state">No progress photos have been added.</div>`}</div>`;
}
function trainerProgressAdvice(client) {
  const progress=client.progress||[];
  if(Number(client.attendance)<60)return "Workout completion is below 60%. Ask about schedule barriers, reduce session length if appropriate, and agree on a manageable weekly target.";
  if(progress.length>1&&Number(progress.at(-1).weight)<Number(progress[0].weight)&&client.goal==="Weight Loss")return "Weight trend is moving toward the stated goal. Reinforce sustainable habits and review energy, recovery, and strength alongside weight.";
  if(progress.length>1&&Number(progress.at(-1).weight)>Number(progress[0].weight)&&client.goal==="Muscle Building")return "Recorded weight is trending upward in line with the muscle-building goal. Review strength progression and recovery at the next check-in.";
  return "Progress is being recorded consistently. Review the client's goal and readiness before adjusting training volume.";
}
function trainerProgressForm(id) {
  const c=trainerClientById(id); if(!c)return;
  modal(`<form data-trainer-form="add-progress" data-id="${trainerEscape(id)}"><div class="field-grid"><label>Assessment date<input name="date" type="date" required value="${trainerToday()}"></label><label>Current weight (kg)<input name="weight" type="number" min="1" max="500" step=".1" required value="${trainerEscape(c.weight)}"></label><label>Workout completion (%)<input name="completion" type="number" min="0" max="100" required value="${trainerEscape(c.attendance)}"></label><label>Target weight (kg)<input name="targetWeight" type="number" min="1" max="500" step=".1" required value="${trainerEscape(c.targetWeight)}"></label></div><label>Fitness assessment and trainer notes<textarea name="note" rows="3" maxlength="500" placeholder="Record observations and practical recommendations"></textarea></label><div class="field-grid"><label>Progress photo URL (optional)<input name="photo" type="url" placeholder="https://..."></label><label>Before photo URL (optional)<input name="beforePhoto" type="url" placeholder="https://..."></label></div><p class="muted-note">Progress notes and measurements are saved locally. Avoid storing real health records or identifiable photos in this prototype.</p><button class="btn btn-primary full" type="submit">Save progress record</button></form>`, `Record progress · ${c.name}`);
}
function trainerEarningsPage() {
  const clients=trainerClients(), payments=trainerPayments(), year=trainerToday().slice(0,4), month=trainerToday().slice(0,7);
  const thisMonth=payments.filter(p=>p.status==="Paid"&&p.date.slice(0,7)===month).reduce((s,p)=>s+p.amount,0), thisYear=payments.filter(p=>p.status==="Paid"&&p.date.slice(0,4)===year).reduce((s,p)=>s+p.amount,0);
  const active=clients.filter(c=>c.subscription==="Active").length, expired=clients.filter(c=>c.subscription==="Expired").length, pending=payments.filter(p=>p.status==="Pending");
  return `${trainerPageHeading("Earnings & subscriptions","Review sample subscription revenue and client payment history.")}
    <div class="section trainer-demo-banner"><i data-lucide="info"></i><span><b>Prototype financial data only.</b> Payment processing, refunds, invoices, and withdrawals are not connected to a real payment provider.</span></div>
    <div class="section stat-grid">${trainerStat("Monthly earnings",trainerMoney(thisMonth),"wallet","Paid demo payments this month")}${trainerStat("Yearly earnings",trainerMoney(thisYear),"chart-no-axes-combined","Paid demo payments this year")}${trainerStat("Active subscriptions",active,"badge-check","Client subscription records")}${trainerStat("Expired subscriptions",expired,"calendar-x","Follow up before renewal")}${trainerStat("Pending payments",pending.length,"clock","Awaiting demo confirmation")}${trainerStat("Pending amount",trainerMoney(pending.reduce((s,p)=>s+p.amount,0)),"credit-card","Not included in earnings")}</div>
    <div class="section panel"><div class="section-head"><h3>Earnings per client</h3><span class="muted">Paid sample transactions</span></div><div class="table-wrap"><table><thead><tr><th>Client</th><th>Subscription</th><th>Amount paid</th><th>Status</th><th>Expiration</th></tr></thead><tbody>${clients.map(c=>{const history=payments.filter(p=>p.clientId===c.id), paid=history.filter(p=>p.status==="Paid").reduce((s,p)=>s+p.amount,0);return `<tr><td>${trainerEscape(c.name)}</td><td>${trainerEscape(c.subscription)}</td><td>${trainerMoney(paid)}</td><td><span class="badge ${c.subscription==="Active"?"":"trainer-badge-muted"}">${trainerEscape(c.subscription)}</span></td><td>${trainerEscape(c.subscription==="Active"?new Date(Date.now()+30*86400000).toLocaleDateString():"—")}</td></tr>`}).join("")}</tbody></table></div></div>
    <div class="section panel"><div class="section-head"><h3>Payment history</h3><span class="muted">${payments.length} sample records</span></div><div class="table-wrap"><table><thead><tr><th>Date</th><th>Client</th><th>Description</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>${payments.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(p=>`<tr><td>${trainerEscape(p.date)}</td><td>${trainerEscape(trainerClientById(p.clientId)?.name||"Client")}</td><td>${trainerEscape(p.description)}</td><td>${trainerMoney(p.amount)}</td><td><span class="badge ${p.status==="Paid"?"":"trainer-badge-muted"}">${trainerEscape(p.status)}</span></td><td>${p.status==="Pending"?`<button class="btn btn-outline btn-small" data-trainer-action="payment-mark" data-id="${trainerEscape(p.id)}">Mark paid</button>`:"—"}</td></tr>`).join("")}</tbody></table></div></div>`;
}
function trainerMessagesPage() {
  const clients=trainerClients(), messages=trainerMessages();
  if(!clients.length)return `${trainerPageHeading("Messages","Chat with your assigned clients.")}<div class="panel empty-state">Add a client before starting a conversation.</div>`;
  if(!clients.some(c=>c.id===trainerMessageClientId))trainerMessageClientId=clients[0].id;
  const selected=trainerClientById(trainerMessageClientId);
  const history=messages.filter(m=>m.clientId===selected.id).sort((a,b)=>a.time.localeCompare(b.time));
  return `${trainerPageHeading("Messages","Send workout instructions, links, reminders, and progress feedback.",`<button class="btn btn-outline btn-small" data-trainer-action="announcement"><i data-lucide="megaphone"></i> Announce to clients</button>`)}
    <div class="section trainer-chat-layout"><aside class="panel trainer-chat-contacts"><div class="section-head"><h3>Clients</h3><span class="badge">${trainerUnreadCount()} new</span></div>${clients.map(c=>{const last=messages.filter(m=>m.clientId===c.id).at(-1);return `<button class="trainer-contact ${c.id===selected.id?"active":""}" data-trainer-action="select-thread" data-id="${trainerEscape(c.id)}"><span class="avatar">${initials(c.name)}</span><span><b>${trainerEscape(c.name)}</b><small>${trainerEscape(last?.text||"Start a conversation")}</small></span></button>`}).join("")}</aside>
    <section class="panel trainer-chat-panel"><div class="trainer-chat-heading"><span class="avatar">${initials(selected.name)}</span><div><b>${trainerEscape(selected.name)}</b><small>${trainerEscape(selected.goal)} · ${selected.active?"Active client":"Inactive client"}</small></div><button class="btn btn-outline btn-small" data-trainer-action="remind" data-id="${trainerEscape(selected.id)}">Workout reminder</button></div>
    <div class="trainer-chat-history" id="trainerChatHistory">${history.length?history.map(m=>`<div class="trainer-message ${m.sender==="trainer"?"sent":"received"}"><p>${trainerEscape(m.text)}</p><small>${new Date(m.time).toLocaleString([],{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}</small></div>`).join(""):`<div class="empty-state">No messages yet. Send a coaching note to start.</div>`}</div>
    <form class="trainer-chat-compose" data-trainer-form="send-message" data-id="${trainerEscape(selected.id)}"><textarea name="text" rows="2" required maxlength="1000" placeholder="Write workout instructions, feedback, or a video link..."></textarea><button class="btn btn-primary" type="submit"><i data-lucide="send"></i> Send</button></form><p class="muted-note">Messages are stored on this device only. Live notifications and client delivery require a backend.</p></section></div>`;
}
function trainerProfilePage() {
  const p=trainerProfile();
  return `${trainerPageHeading("Trainer profile","Manage the professional details clients see.",`<button class="btn btn-primary btn-small" data-trainer-action="edit-trainer-profile"><i data-lucide="pencil"></i> Edit profile</button>`)}
    <div class="section panel trainer-own-profile"><img src="${trainerEscape(trainerUrl(p.photo)||"https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=300")}" alt="${trainerEscape(p.name)}"><div><span class="badge">Trainer / Coach</span><h2>${trainerEscape(p.name)}</h2><p>${trainerEscape(p.email)}</p><p>${trainerEscape(p.bio)}</p><div class="trainer-profile-chips">${trainerEscape(p.specialties).split(",").map(s=>`<span>${trainerEscape(s.trim())}</span>`).join("")}</div></div></div>
    <div class="section trainer-dashboard-grid"><div class="panel"><h3>Certifications</h3><p>${trainerEscape(p.certifications||"Add your certifications.")}</p></div><div class="panel"><h3>Availability</h3><p>${trainerEscape(p.availability)} · ${trainerEscape(p.hours)}</p><button class="btn btn-outline btn-small" data-trainer-action="edit-trainer-profile">Update availability</button></div></div>
    <div class="section panel"><div class="section-head"><h3>Professional profile photo</h3><button class="btn btn-outline btn-small" data-trainer-action="edit-trainer-profile">Edit details</button></div><p class="muted-note">Use a public HTTPS image URL for this prototype. Real file uploads require a secure storage service.</p></div>`;
}
function trainerProfileForm() {
  const p=trainerProfile();
  modal(`<form data-trainer-form="edit-trainer-profile"><div class="field-grid"><label>Full name<input name="name" required maxlength="80" value="${trainerEscape(p.name)}"></label><label>Email<input name="email" type="email" required value="${trainerEscape(p.email)}"></label><label>Certifications<input name="certifications" maxlength="180" value="${trainerEscape(p.certifications)}"></label><label>Specializations<input name="specialties" maxlength="180" value="${trainerEscape(p.specialties)}"></label><label>Availability<input name="availability" maxlength="100" value="${trainerEscape(p.availability)}"></label><label>Working hours<input name="hours" maxlength="80" value="${trainerEscape(p.hours)}"></label><label>Profile picture URL<input name="photo" type="url" placeholder="https://..." value="${trainerEscape(p.photo)}"></label></div><label>Professional biography<textarea name="bio" rows="4" maxlength="600" required>${trainerEscape(p.bio)}</textarea></label><button class="btn btn-primary full" type="submit">Save trainer profile</button></form>`, "Edit trainer profile");
}
function trainerSettingsPage() {
  const pref=trainerRead("preferences",{sessionReminders:true,weeklySummary:true,showInactive:true});
  return `${trainerPageHeading("Settings","Manage trainer account preferences and security.")}
    <div class="section trainer-dashboard-grid"><div class="panel"><div class="section-head"><h3>Notifications & availability</h3></div><div class="setting-list">${[["sessionReminders","Session reminders","Local reminder preference"],["weeklySummary","Weekly progress summary","Local summary preference"],["showInactive","Show inactive clients","Include deactivated client records"]].map(([key,title,desc])=>`<div class="setting-row"><div><b>${title}</b><small>${desc}</small></div><button class="switch ${pref[key]?"on":""}" data-trainer-action="toggle-setting" data-setting="${key}" aria-label="Toggle ${title}" aria-pressed="${Boolean(pref[key])}"></button></div>`).join("")}</div></div>
      <div class="panel"><div class="section-head"><h3>Change demo password</h3></div><form data-trainer-form="change-password"><label>Current password<input name="currentPassword" type="password" required autocomplete="current-password"></label><label>New password<input name="newPassword" type="password" minlength="6" required autocomplete="new-password"></label><label>Confirm new password<input name="confirmPassword" type="password" minlength="6" required autocomplete="new-password"></label><button class="btn btn-primary full" type="submit">Update password</button></form><p class="muted-note">Demo credentials are stored in LocalStorage for this prototype and are not secure. Production authentication must be handled by a backend.</p></div></div>
    <div class="section panel"><div class="section-head"><h3>Prototype data</h3></div><p class="muted-note">Trainer clients, workouts, sessions, messages, progress records, and sample payments persist in this browser. Payments, file uploads, live chat, appointment reminders, and AI model calls are not connected.</p><button class="btn btn-outline trainer-danger" data-trainer-action="logout">Log out</button></div>`;
}

function trainerFilterClients() {
  const query=($("#trainerClientSearch")?.value||"").trim().toLowerCase(), status=$("#trainerClientStatus")?.value||"all", sub=$("#trainerSubStatus")?.value||"all";
  const preferences=trainerRead("preferences",{sessionReminders:true,weeklySummary:true,showInactive:true});
  const results=trainerClients().filter(c=>(preferences.showInactive||status==="inactive"||c.active)&&(`${c.name} ${c.email} ${c.goal}`.toLowerCase().includes(query))&&(status==="all"||(status==="active"?c.active:!c.active))&&(sub==="all"||c.subscription===sub));
  $("#trainerClientRows").innerHTML=trainerClientRows(results);
  $("#trainerClientsEmpty").classList.toggle("hidden",results.length>0);
  iconRefresh();
}
function trainerSaveClient(form, mode) {
  const data=new FormData(form), clients=trainerClients(), id=form.dataset.id;
  const email=String(data.get("email")).trim();
  if(clients.some(c=>c.email.toLowerCase()===email.toLowerCase()&&c.id!==id))return toast("A client with this email already exists.");
  const client={name:String(data.get("name")).trim(),email,age:Number(data.get("age")),goal:String(data.get("goal")),level:String(data.get("level")),subscription:String(data.get("subscription")),weight:Number(data.get("weight")),targetWeight:Number(data.get("targetWeight")),planId:String(data.get("planId")||""),photo:trainerUrl(data.get("photo")),active:data.get("active")==="on"};
  if(!client.name||!client.age||!client.weight||!client.targetWeight)return toast("Complete the required client details with valid values.");
  if(mode==="add-client"){client.id=trainerId("client");client.createdAt=trainerToday();client.attendance=0;client.lastWorkout="";client.workoutHistory=[];client.progress=[];client.photos=[];clients.push(client);}
  else {const index=clients.findIndex(c=>c.id===id);if(index<0)return toast("Client record was not found.");clients[index]={...clients[index],...client};}
  trainerSave("clients",clients);closeModal();renderPage("clients");toast(mode==="add-client"?"Client added.":"Client details updated.");
}
function trainerParseExercises(value) {
  const rows=String(value||"").split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
  if(!rows.length)throw new Error("Add at least one exercise.");
  return rows.map((line,index)=>{
    const [name,sets,reps,duration,rest,instructions,video,image]=line.split("|").map(part=>part.trim());
    if(!name||!sets||(!reps&&!duration)||!rest||!instructions)throw new Error(`Exercise ${index+1} needs a name, sets, reps or duration, rest, and instructions.`);
    const parsedSets=Number(sets); if(!Number.isInteger(parsedSets)||parsedSets<1||parsedSets>20)throw new Error(`Exercise ${index+1} must have 1–20 sets.`);
    if(video&&!trainerUrl(video))throw new Error(`Exercise ${index+1} video must be a valid http or https link.`);
    if(image&&!trainerUrl(image))throw new Error(`Exercise ${index+1} image must be a valid http or https link.`);
    return {name,sets:parsedSets,reps,duration,rest,instructions,video:video||"",image:image||""};
  });
}
function trainerSavePlan(form, mode) {
  const d=new FormData(form), plans=trainerPlans(), id=form.dataset.id;
  let exercises; try{exercises=trainerParseExercises(d.get("exercises"));}catch(error){return toast(error.message);}
  const plan={title:String(d.get("title")).trim(),category:String(d.get("category")),level:String(d.get("level")),duration:String(d.get("duration")).trim(),days:Number(d.get("days")),schedule:String(d.get("schedule")).trim(),description:String(d.get("description")).trim(),exercises};
  if(!plan.title||!plan.duration||!plan.description||plan.days<1||plan.days>7||!plan.schedule)return toast("Complete all plan details, a weekly schedule, and set 1–7 workout days.");
  if(mode==="create-plan"){plan.id=trainerId("plan");plans.push(plan);}
  else {const index=plans.findIndex(p=>p.id===id);if(index<0)return toast("Workout plan was not found.");plans[index]={...plans[index],...plan};}
  trainerSave("plans",plans);closeModal();renderPage("plans");toast(mode==="create-plan"?"Workout plan created.":"Workout plan updated.");
}
function trainerSaveSession(form) {
  const d=new FormData(form), date=String(d.get("date")), duration=Number(d.get("duration")), clientId=String(d.get("clientId")), description=String(d.get("description")).trim();
  if(!trainerClientById(clientId)||new Date(date)<=new Date()||!duration||!description)return toast("Choose a client and a future date, duration, and description.");
  const sessions=trainerSessions();sessions.push({id:trainerId("session"),clientId,date,duration,description,status:"Scheduled"});
  trainerSave("sessions",sessions);closeModal();renderPage("sessions");toast("Training session scheduled.");
}
function trainerSaveProgress(form) {
  const d=new FormData(form), c=trainerClientById(form.dataset.id); if(!c)return toast("Client record was not found.");
  const date=String(d.get("date")),weight=Number(d.get("weight")),completion=Number(d.get("completion")),targetWeight=Number(d.get("targetWeight")),note=String(d.get("note")).trim(), photo=trainerUrl(d.get("photo")), before=trainerUrl(d.get("beforePhoto"));
  if(!date||!weight||weight>500||!targetWeight||targetWeight>500||completion<0||completion>100)return toast("Enter valid progress values.");
  c.weight=weight;c.targetWeight=targetWeight;c.attendance=completion;c.progress=c.progress||[];c.progress.push({date,weight,completion,note});c.progress.sort((a,b)=>a.date.localeCompare(b.date));
  if(photo){c.photos=c.photos||[];c.photos.push({url:photo,date,before:false});}
  if(before){c.photos=c.photos||[];c.photos.push({url:before,date,before:true});}
  trainerSave("clients",trainerClients().map(item=>item.id===c.id?c:item));closeModal();renderPage("progress");toast("Client progress record saved.");
}
function trainerSubmitForm(form) {
  const mode=form.dataset.trainerForm;
  if(mode==="add-client"||mode==="edit-client")return trainerSaveClient(form,mode);
  if(mode==="create-plan"||mode==="edit-plan")return trainerSavePlan(form,mode);
  if(mode==="create-session")return trainerSaveSession(form);
  if(mode==="add-progress")return trainerSaveProgress(form);
  if(mode==="send-message"){
    const text=String(new FormData(form).get("text")||"").trim();if(!text)return toast("Write a message before sending.");
    const messages=trainerMessages();messages.push({id:trainerId("msg"),clientId:form.dataset.id,sender:"trainer",text,time:new Date().toISOString()});trainerSave("messages",messages);trainerMessageClientId=form.dataset.id;renderPage("messages");$("#trainerChatHistory")?.scrollTo(0,$("#trainerChatHistory").scrollHeight);return toast("Message saved in this prototype.");
  }
  if(mode==="assign-plan"){
    const data=new FormData(form);
    return trainerAssignPlan(String(data.get("clientId")),String(data.get("planId")));
  }
  if(mode==="announcement"){
    const text=String(new FormData(form).get("text")||"").trim();
    if(!text)return toast("Write an announcement before sending.");
    const clients=trainerClients().filter(c=>c.active);
    if(!clients.length)return toast("There are no active clients to notify.");
    const messages=trainerMessages(),time=new Date().toISOString();
    clients.forEach(c=>messages.push({id:trainerId("msg"),clientId:c.id,sender:"trainer",text,time}));
    trainerSave("messages",messages);closeModal();renderPage("messages");return toast(`Announcement saved for ${clients.length} active client(s).`);
  }
  if(mode==="edit-trainer-profile"){
    const d=new FormData(form),profile={name:String(d.get("name")).trim(),email:String(d.get("email")).trim(),bio:String(d.get("bio")).trim(),certifications:String(d.get("certifications")).trim(),specialties:String(d.get("specialties")).trim(),availability:String(d.get("availability")).trim(),hours:String(d.get("hours")).trim(),photo:trainerUrl(d.get("photo"))};
    if(!profile.name||!profile.bio)return toast("Name and professional biography are required.");
    if(profile.email.toLowerCase()!==currentUser.email.toLowerCase()&&getUsers().some(u=>u.email.toLowerCase()===profile.email.toLowerCase()))return toast("That email address is already in use.");
    const previousEmail=currentUser.email;
    trainerSave("profile",profile);currentUser.name=profile.name;currentUser.email=profile.email;Store.set("users",getUsers().map(u=>u.email===previousEmail?{...u,name:profile.name,email:profile.email}:u));Store.set("session",{email:profile.email});
    closeModal();$("#sideUserName").textContent=profile.name;$("#topUserName").textContent=profile.name;$("#topAvatar").textContent=initials(profile.name);$("#topProfile .avatar").textContent=initials(profile.name);renderPage("profile");return toast("Trainer profile updated.");
  }
  if(mode==="change-password"){
    const d=new FormData(form), users=getUsers(), user=users.find(u=>u.email===currentUser.email);
    if(!user||d.get("currentPassword")!==user.password)return toast("Current password is incorrect.");
    if(String(d.get("newPassword")).length<6||d.get("newPassword")!==d.get("confirmPassword"))return toast("New passwords must match and contain at least 6 characters.");
    user.password=String(d.get("newPassword"));Store.set("users",users);form.reset();return toast("Demo password updated on this device.");
  }
}
function trainerAssignPlan(clientId, planId) {
  const clients=trainerClients(), c=clients.find(x=>x.id===clientId);if(!c)return toast("Client record was not found.");
  c.planId=planId||"";trainerSave("clients",clients);closeModal();renderPage(currentPage==="clients"?"clients":"plans");toast(planId?"Workout plan assigned.":"Workout plan assignment removed.");
}
function trainerAssignPlanModal(clientId, planId = "") {
  const selectedClient=trainerClientById(clientId);
  modal(`<form data-trainer-form="assign-plan" data-id="${trainerEscape(clientId)}"><label>Client<select name="clientId" required>${trainerClientOptions(clientId)}</select></label><label>Workout plan<select name="planId" required>${trainerPlans().map(p=>`<option value="${trainerEscape(p.id)}" ${p.id===planId?"selected":""}>${trainerEscape(p.title)}</option>`).join("")}</select></label><button type="submit" class="btn btn-primary full">Assign workout plan</button></form>`, `Assign plan${selectedClient?` · ${selectedClient.name}`:""}`);
}
function trainerSuggestPlan(form) {
  const data=new FormData(form), goal=String(data.get("goal")), level=String(data.get("level")), days=Number(data.get("days"));
  const category=goal==="Weight Loss"?"Weight Loss":goal==="Muscle Building"?"Muscle Building":goal==="Flexibility"?"Flexibility":goal==="Cardio"?"Cardio":goal==="Strength Training"?"Strength Training":"Full Body Training";
  const exercises=goal==="Weight Loss"||goal==="Cardio"?[
    {name:"March in place",sets:3,reps:"",duration:"45 sec",rest:"30 sec",instructions:"Move at a comfortable pace and keep posture tall.",video:""},
    {name:"Bodyweight squat",sets:3,reps:"10 reps",duration:"",rest:"45 sec",instructions:"Move with control and keep knees comfortable.",video:""},
    {name:"Standing knee drive",sets:3,reps:"10 each side",duration:"",rest:"30 sec",instructions:"Brace gently and alternate sides.",video:""}
  ]:goal==="Flexibility"?[
    {name:"Cat-cow mobility",sets:2,reps:"8 reps",duration:"",rest:"30 sec",instructions:"Move gently through a comfortable range.",video:""},
    {name:"Standing hamstring stretch",sets:2,reps:"",duration:"30 sec each side",rest:"20 sec",instructions:"Keep a soft knee and stop before discomfort.",video:""}
  ]:[
    {name:"Bodyweight squat",sets:3,reps:"10 reps",duration:"",rest:"60 sec",instructions:"Keep your chest lifted and lower with control.",video:""},
    {name:"Incline push-up",sets:3,reps:"8 reps",duration:"",rest:"60 sec",instructions:"Use a stable surface and keep your body aligned.",video:""},
    {name:"Glute bridge",sets:3,reps:"12 reps",duration:"",rest:"45 sec",instructions:"Brace gently and pause at the top.",video:""}
  ];
  const suggested={id:"",title:`${goal} · ${level} ${days}-day plan`,category,level,duration:"4 weeks",days,description:`Rule-based ${level.toLowerCase()} suggestion for ${goal.toLowerCase()}. Adapt exercises to client readiness and available equipment.`,exercises};
  suggested.schedule=trainerDefaultSchedule(days);
  modal(`<span class="trainer-ai-tag">SIMULATED AI · RULE-BASED SUGGESTION</span><h3>${trainerEscape(suggested.title)}</h3><p>${trainerEscape(suggested.description)}</p><ul>${exercises.map(x=>`<li><b>${trainerEscape(x.name)}</b> · ${x.sets} sets · ${trainerEscape(x.reps||x.duration)}<br><small>${trainerEscape(x.instructions)}</small></li>`).join("")}</ul><p class="muted-note">This is a deterministic JavaScript suggestion, not medical advice or a connected AI model. Trainer review is required.</p><button class="btn btn-primary full" id="saveSuggestedPlan">Save suggested plan</button>`, "Workout plan suggestion");
  $("#saveSuggestedPlan").onclick=()=>{const plans=trainerPlans();suggested.id=trainerId("plan");plans.push(suggested);trainerSave("plans",plans);closeModal();renderPage("plans");toast("Suggested workout plan saved for trainer review.");};
}
function trainerSmartExercises(goal, level) {
  const effort=level==="Beginner"?"Incline push-up":level==="Advanced"?"Tempo push-up":"Knee push-up";
  if(goal==="Weight Loss"||goal==="Cardio")return [
    {name:"March in place",sets:3,reps:"",duration:level==="Beginner"?"30 sec":"45 sec",rest:"30 sec",instructions:"Keep posture tall and work at a pace that feels comfortable.",video:"",image:""},
    {name:"Bodyweight squat",sets:3,reps:level==="Beginner"?"8 reps":"12 reps",duration:"",rest:"45 sec",instructions:"Lower with control and keep a comfortable range of motion.",video:"",image:""},
    {name:"Standing knee drive",sets:3,reps:"10 each side",duration:"",rest:"30 sec",instructions:"Brace gently and alternate sides without rushing.",video:"",image:""}
  ];
  if(goal==="Flexibility")return [
    {name:"Cat-cow mobility",sets:2,reps:"8 reps",duration:"",rest:"30 sec",instructions:"Move gently through a comfortable range.",video:"",image:""},
    {name:"Standing hamstring stretch",sets:2,reps:"",duration:"30 sec each side",rest:"20 sec",instructions:"Keep a soft knee and stop before discomfort.",video:"",image:""},
    {name:"Wall shoulder slides",sets:2,reps:"8 reps",duration:"",rest:"30 sec",instructions:"Keep the movement comfortable; do not force the range.",video:"",image:""}
  ];
  return [
    {name:"Goblet squat",sets:3,reps:level==="Beginner"?"8 reps":"10 reps",duration:"",rest:"60 sec",instructions:"Use bodyweight or a light load and keep the movement controlled.",video:"",image:""},
    {name:effort,sets:3,reps:"8 reps",duration:"",rest:"60 sec",instructions:"Choose a variation that keeps your form steady.",video:"",image:""},
    {name:"Glute bridge",sets:3,reps:"12 reps",duration:"",rest:"45 sec",instructions:"Brace gently and pause at the top.",video:"",image:""}
  ];
}
function trainerSmartRecommendationForm() {
  modal(`<form id="trainerSmartRecommendation"><label>Choose a client<select name="clientId" required>${trainerClientOptions()}</select></label><p class="muted-note">Exercise suggestions are rule-based and use the selected client's goal and fitness level. Review safety, equipment, and readiness before assigning.</p><button class="btn btn-primary full" type="submit">Recommend exercises</button></form>`, "Smart exercise recommendations");
}
function trainerFollowup(clientId, text = "") {
  const c=trainerClientById(clientId);if(!c)return;
  const messages=trainerMessages();messages.push({id:trainerId("msg"),clientId,sender:"trainer",text:text||`Hi ${c.name.split(" ")[0]}, I noticed you may have missed a recent workout. Is there anything I can adjust to make your plan easier to fit your week?`,time:new Date().toISOString()});
  trainerSave("messages",messages);trainerMessageClientId=clientId;toast("Follow-up saved to the local message history.");
}
function trainerSetSessionStatus(id,status) {
  const sessions=trainerSessions(), session=sessions.find(s=>s.id===id);if(!session)return toast("Session was not found.");
  session.status=status;session.attendance=status==="Completed"?"Attended":["Cancelled","Rejected"].includes(status)?"Not attended":"Not recorded";trainerSave("sessions",sessions);
  if(status==="Completed"){const clients=trainerClients(),client=clients.find(c=>c.id===session.clientId);if(client){client.workoutHistory.push(session.description||"Training session");client.lastWorkout=trainerToday();trainerSave("clients",clients);}}
  renderPage("sessions");toast(`Session marked ${status.toLowerCase()}.`);
}
function trainerAction(name,data) {
  const id=data.id;
  if(name==="add-client")return trainerClientForm();
  if(name==="edit-client"){const c=trainerClientById(id);if(c)trainerClientForm(c);else toast("Client record was not found.");return;}
  if(name==="view-client")return trainerViewClient(id);
  if(name==="remove-client"){
    const clients=trainerClients(),c=clients.find(x=>x.id===id);if(!c)return toast("Client record was not found.");
    if(c.active){if(!confirm(`Deactivate ${c.name}? Their history will be kept.`))return;c.active=false;trainerSave("clients",clients);renderPage("clients");return toast("Client deactivated.");}
    if(!confirm(`Permanently remove ${c.name} and their local progress records?`))return;
    trainerSave("clients",clients.filter(x=>x.id!==id));trainerSave("sessions",trainerSessions().filter(s=>s.clientId!==id));trainerSave("messages",trainerMessages().filter(m=>m.clientId!==id));renderPage("clients");return toast("Client removed.");
  }
  if(name==="assign-plan")return trainerAssignPlanModal(id,trainerClientById(id)?.planId||"");
  if(name==="assign-plan-to")return trainerAssignPlanModal("",id);
  if(name==="create-plan")return trainerPlanForm();
  if(name==="edit-plan"){const p=trainerPlanById(id);if(p)trainerPlanForm(p);else toast("Workout plan was not found.");return;}
  if(name==="delete-plan"){
    const plan=trainerPlanById(id);if(!plan)return toast("Workout plan was not found.");
    if(!confirm(`Delete "${plan.title}"? Assigned clients will become unassigned.`))return;
    trainerSave("plans",trainerPlans().filter(p=>p.id!==id));trainerSave("clients",trainerClients().map(c=>c.planId===id?{...c,planId:""}:c));renderPage("plans");return toast("Workout plan deleted.");
  }
  if(name==="generate-plan")return modal(`<form id="trainerPlanGenerator"><label>Client goal<select name="goal">${["Weight Loss","Muscle Building","Strength Training","Cardio","Flexibility","Full Body Training"].map(x=>`<option>${x}</option>`).join("")}</select></label><label>Experience level<select name="level">${["Beginner","Intermediate","Advanced"].map(x=>`<option>${x}</option>`).join("")}</select></label><label>Available workout days per week<input name="days" type="number" min="1" max="7" value="3" required></label><p class="muted-note">Suggestion logic runs locally in JavaScript. No external AI service is called.</p><button class="btn btn-primary full" type="submit">Generate sample suggestion</button></form>`,"AI-inspired workout plan");
  if(name==="smart-recommendations")return trainerSmartRecommendationForm();
  if(name==="create-session")return trainerSessionForm();
  if(name==="view-session"){const s=trainerSessions().find(x=>x.id===id);if(s){const c=trainerClientById(s.clientId);modal(`<p><b>${trainerEscape(c?.name||"Client")}</b></p><p>${new Date(s.date).toLocaleString()} · ${trainerEscape(s.duration)} minutes</p><p>${trainerEscape(s.description)}</p><span class="badge">${trainerEscape(s.status)}</span>${["Scheduled","Accepted"].includes(s.status)?`<button class="btn btn-outline full" style="margin-top:14px" data-trainer-action="session-remind" data-id="${trainerEscape(s.id)}">Send session reminder</button>`:""}`,"Session details");}return;}
  if(name==="calendar-prev"||name==="calendar-next"){trainerCalendarDate.setMonth(trainerCalendarDate.getMonth()+(name==="calendar-next"?1:-1));return renderPage("sessions");}
  if(name==="session-accept")return trainerSetSessionStatus(id,"Accepted");
  if(name==="session-reject"){if(confirm("Reject this appointment request?"))trainerSetSessionStatus(id,"Rejected");return;}
  if(name==="session-complete")return trainerSetSessionStatus(id,"Completed");
  if(name==="session-cancel"){if(confirm("Cancel this training session?"))trainerSetSessionStatus(id,"Cancelled");return;}
  if(name==="session-remind"){
    const session=trainerSessions().find(s=>s.id===id);if(!session)return toast("Session was not found.");
    trainerFollowup(session.clientId,`Reminder: your training session is scheduled for ${new Date(session.date).toLocaleString()} (${session.duration} minutes).`);
    closeModal();trainerMessageClientId=session.clientId;renderPage("messages");return;
  }
  if(name==="add-progress")return trainerProgressForm(id);
  if(name==="message-client"){if(!trainerClientById(id))return toast("Client record was not found.");trainerMessageClientId=id;renderPage("messages");return;}
  if(name==="select-thread"){trainerMessageClientId=id;const messages=trainerMessages();messages.forEach(m=>{if(m.clientId===id&&m.sender==="client")m.read=true;});trainerSave("messages",messages);return renderPage("messages");}
  if(name==="remind")return trainerFollowup(id,`Reminder: your workout plan is ready when you are. Reply if you would like help adjusting this week's schedule.`);
  if(name==="followup"){trainerFollowup(id);trainerMessageClientId=id;renderPage("messages");return;}
  if(name==="announcement")return modal(`<form data-trainer-form="announcement"><label>Announcement<textarea name="text" rows="4" required maxlength="1000" placeholder="Share an update with your active clients"></textarea></label><button class="btn btn-primary full" type="submit">Send to active clients</button></form>`,"Client announcement");
  if(name==="edit-trainer-profile")return trainerProfileForm();
  if(name==="toggle-setting"){const pref=trainerRead("preferences",{sessionReminders:true,weeklySummary:true,showInactive:true});pref[data.setting]=!pref[data.setting];trainerSave("preferences",pref);renderPage("trainerSettings");return toast("Preference updated.");}
  if(name==="payment-mark"){const payments=trainerPayments(),p=payments.find(x=>x.id===id);if(!p)return toast("Payment record was not found.");p.status="Paid";p.date=trainerToday();trainerSave("payments",payments);renderPage("earnings");return toast("Sample payment marked as paid.");}
  if(name==="logout")return action("logout");
}

document.addEventListener("click", event => {
  const button=event.target.closest("[data-trainer-action]");
  if(button){event.preventDefault();trainerAction(button.dataset.trainerAction,button.dataset);return;}
  if(event.target.matches("#trainerProgressClient")){trainerProgressClientId=event.target.value;renderPage("progress");}
});
document.addEventListener("input", event => {
  if(event.target.matches("#trainerClientSearch"))trainerFilterClients();
});
document.addEventListener("change", event => {
  if(event.target.matches("#trainerClientStatus,#trainerSubStatus"))trainerFilterClients();
  if(event.target.matches("#trainerSessionFilter")){
    const sessions=trainerSessions().slice().sort((a,b)=>a.date.localeCompare(b.date));
    $("#trainerSessionRows").innerHTML=trainerSessionRows(event.target.value==="all"?sessions:sessions.filter(s=>s.status===event.target.value));iconRefresh();
  }
  if(event.target.matches("#trainerProgressClient")){trainerProgressClientId=event.target.value;renderPage("progress");}
});
document.addEventListener("submit", event => {
  const form=event.target.closest("[data-trainer-form]");
  if(form){event.preventDefault();trainerSubmitForm(form);return;}
  if(event.target.id==="trainerPlanGenerator"){event.preventDefault();trainerSuggestPlan(event.target);}
  if(event.target.id==="trainerSmartRecommendation"){
    event.preventDefault();
    const client=trainerClientById(String(new FormData(event.target).get("clientId")));if(!client)return toast("Choose a valid client.");
    const exercises=trainerSmartExercises(client.goal,client.level);
    modal(`<span class="trainer-ai-tag">RULE-BASED · ${trainerEscape(client.goal)} · ${trainerEscape(client.level)}</span><p>Suggested exercise ideas for <b>${trainerEscape(client.name)}</b>. Review suitability and equipment before assigning.</p><ul>${exercises.map(x=>`<li><b>${trainerEscape(x.name)}</b> · ${x.sets} sets · ${trainerEscape(x.reps||x.duration)} · rest ${trainerEscape(x.rest)}<br><small>${trainerEscape(x.instructions)}</small></li>`).join("")}</ul><button class="btn btn-primary full" id="saveSmartPlan">Create plan from suggestions</button>`, "Smart workout recommendations");
    $("#saveSmartPlan").onclick=()=>{const plans=trainerPlans();plans.push({id:trainerId("plan"),title:`${client.goal} · Smart picks`,category:client.goal,level:client.level,duration:"4 weeks",days:3,schedule:trainerDefaultSchedule(3),description:`Rule-based exercise ideas for ${client.name}. Trainer review required.`,exercises});trainerSave("plans",plans);closeModal();renderPage("plans");toast("Recommendation plan saved for trainer review.");};
  }
});

if (currentUser?.role === "trainer") renderPage("trainerDashboard");

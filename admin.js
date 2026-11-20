const ADMIN_NAV = [
  ["adminDashboard","Dashboard","layout-dashboard"],
  ["users","User Management","users"],
  ["adminTrainers","Trainer Management","badge-check"],
  ["subscriptionManagement","Subscription Management","layers"],
  ["subscriptionMonitoring","Subscription Monitoring","calendar-clock"],
  ["payments","Payment Management","credit-card"],
  ["announcements","Announcements","megaphone"],
  ["adminReports","Reports & Analytics","chart-no-axes-combined"],
  ["activityLogs","Activity Logs","list-checks"],
  ["systemSettings","System Settings","settings"],
  ["adminProfile","Admin Profile","user-round"]
];
const ADMIN_FEATURES = [
  ["basicWorkouts","Basic home workout programs"],
  ["basicTracking","Basic workout tracking"],
  ["limitedHistory","Limited workout history"],
  ["standardCategories","Standard workout categories"],
  ["basicProfile","Basic fitness profile"],
  ["freeSchedules","Free workout schedules"],
  ["fullLibrary","Full exercise video library"],
  ["advancedPrograms","Unlimited standard workout programs"],
  ["advancedTracking","Advanced workout tracking"],
  ["recommendations","Personalized workout recommendations"],
  ["weeklyReports","Weekly fitness reports"],
  ["monthlyReports","Monthly fitness reports"],
  ["workoutCalendar","Workout calendar and scheduling"],
  ["favorites","Favorite exercises"],
  ["trainerPrograms","Selected trainer-created programs"],
  ["prioritySupport","Priority application support"],
  ["personalizedPlans","Personalized trainer workout plans"],
  ["assignedTrainer","Assigned personal trainer"],
  ["trainerMessaging","Direct trainer messaging"],
  ["virtualSessions","Virtual coaching sessions"],
  ["fitnessAssessment","Personalized fitness assessment"],
  ["advancedProgress","Advanced progress monitoring"],
  ["trainerFeedback","Trainer feedback and recommendations"],
  ["exclusivePrograms","Exclusive trainer-created programs"]
];
const ADMIN_DEFAULT_ENTITLEMENTS = {
  FREE:["basicWorkouts","basicTracking","limitedHistory","standardCategories","basicProfile","freeSchedules"],
  PREMIUM:["basicWorkouts","basicTracking","limitedHistory","standardCategories","basicProfile","freeSchedules","fullLibrary","advancedPrograms","advancedTracking","recommendations","weeklyReports","monthlyReports","workoutCalendar","favorites","trainerPrograms","prioritySupport"],
  PRO:["basicWorkouts","basicTracking","limitedHistory","standardCategories","basicProfile","freeSchedules","fullLibrary","advancedPrograms","advancedTracking","recommendations","weeklyReports","monthlyReports","workoutCalendar","favorites","trainerPrograms","prioritySupport","personalizedPlans","assignedTrainer","trainerMessaging","virtualSessions","fitnessAssessment","advancedProgress","trainerFeedback","exclusivePrograms"]
};
let adminUserSearchTimer = null;

const adminEscape=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const adminStoreRead=(key,fallback=null)=>Store.get(`admin_${key}`,fallback);
const adminStoreWrite=(key,value)=>Store.set(`admin_${key}`,value);
const adminToday=()=>new Date().toISOString().slice(0,10);
const adminDateOffset=days=>{const d=new Date();d.setDate(d.getDate()+days);return d.toISOString().slice(0,10)};
const adminId=prefix=>`${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
const adminMoney=value=>`₱${Number(value||0).toLocaleString("en-PH")}`;
const adminUrl=value=>{const url=String(value||"").trim();return /^https?:\/\/[^\s"'<>]+$/i.test(url)?url:""};
const adminCanonicalPlan=value=>{
  const plan=String(value||"FREE").trim().toUpperCase();
  if(["BASIC","FREE"].includes(plan))return "FREE";
  if(["STANDARD"].includes(plan))return "PREMIUM";
  if(["PREMIUM","PRO"].includes(plan))return "PRO";
  return "FREE";
};
const adminPlanSeeds=()=>[
  {id:"FREE",name:"FREE",price:0,durationDays:0,description:"A welcoming starting point for building healthy habits.",discount:0,coachingSessions:0,active:true,benefits:["Basic home workout programs","Limited exercise library","Basic tracking and history","Standard categories and free schedules","Basic fitness profile","No trainer coaching or direct messaging"],entitlements:ADMIN_DEFAULT_ENTITLEMENTS.FREE},
  {id:"PREMIUM",name:"PREMIUM",price:199,durationDays:30,description:"More workout choices and useful progress tools for consistent training.",discount:0,coachingSessions:0,active:true,benefits:["Everything in Free","Full exercise video library","Advanced tracking and recommendations","Weekly and monthly fitness reports","Workout calendar, scheduling, and favorites","Selected trainer-created programs","Priority application support","No one-on-one trainer coaching"],entitlements:ADMIN_DEFAULT_ENTITLEMENTS.PREMIUM},
  {id:"PRO",name:"PRO",price:499,durationDays:30,description:"Personalized coaching and direct access to a professional trainer.",discount:0,coachingSessions:4,active:true,benefits:["Everything in Premium","Personalized trainer-created workout plans","Assigned personal trainer and direct messaging","Virtual coaching sessions (configured monthly limit)","Personalized fitness assessment","Trainer feedback and advanced progress monitoring","Exclusive trainer programs","Priority customer support"],entitlements:ADMIN_DEFAULT_ENTITLEMENTS.PRO}
];
function adminSeedTrainerProfiles(){
  return TRAINERS.map((trainer,index)=>{
    const account=getUsers().find(user=>user.role==="trainer"&&user.name.toLowerCase()===trainer.name.toLowerCase());
    return {id:`trainer-${trainer.id}`,name:trainer.name,email:account?.email||`${trainer.name.toLowerCase().replace(/\s+/g,".")}@fitconnect.demo`,specialty:trainer.specialty,certifications:trainer.cert,experience:trainer.experience,rating:trainer.rating,clients:trainer.subs,photo:trainer.image,verification:index===0?"Verified":"Pending Verification",accountStatus:"Active"};
  });
}
function adminEnsureData(){
  if(!Array.isArray(adminStoreRead("plans")))adminStoreWrite("plans",adminPlanSeeds());
  if(!Array.isArray(adminStoreRead("trainerProfiles")))adminStoreWrite("trainerProfiles",adminSeedTrainerProfiles());
  if(!adminStoreRead("userMeta"))adminStoreWrite("userMeta",{});
  if(!adminStoreRead("settings"))adminStoreWrite("settings",{registrationsEnabled:true,supportEmail:"support@fitconnect.demo",maintenanceMode:false});
  if(!adminStoreRead("profile")){const admin=getUsers().find(user=>user.role==="admin");adminStoreWrite("profile",{name:admin?.name||"Administrator",email:admin?.email||"admin@fitconnect.demo",title:"Platform Administrator",photo:"",bio:"Managing a healthier and more connected fitness community."});}
  if(!Array.isArray(adminStoreRead("subscriptions"))){
    const subscriptions=getUsers().filter(user=>user.role==="user").map(user=>({id:adminId("sub"),userEmail:user.email,planId:adminCanonicalPlan(user.plan),status:"Active",startedAt:user.createdAt?.slice(0,10)||adminDateOffset(-30),expiresAt:"",renewalEnabled:true,history:[]}));
    adminStoreWrite("subscriptions",subscriptions);
  }else{
    const subscriptions=adminStoreRead("subscriptions",[]),known=new Set(subscriptions.map(sub=>sub.userEmail.toLowerCase()));
    getUsers().filter(user=>user.role==="user"&&!known.has(user.email.toLowerCase())).forEach(user=>subscriptions.push({id:adminId("sub"),userEmail:user.email,planId:adminCanonicalPlan(user.plan),status:"Active",startedAt:user.createdAt?.slice(0,10)||adminToday(),expiresAt:"",renewalEnabled:true,history:[]}));
    adminStoreWrite("subscriptions",subscriptions);
  }
  if(!Array.isArray(adminStoreRead("payments"))){
    const email=getUsers().find(user=>user.role==="user")?.email||"user@fitconnect.demo";
    adminStoreWrite("payments",[
      {id:"txn-demo-001",userEmail:email,planId:"PREMIUM",amount:199,method:"Demo checkout",date:adminDateOffset(-45),status:"Paid",reference:"FC-DEMO-001"},
      {id:"txn-demo-002",userEmail:email,planId:"PRO",amount:499,method:"Demo checkout",date:adminDateOffset(-15),status:"Paid",reference:"FC-DEMO-002"},
      {id:"txn-demo-003",userEmail:email,planId:"PREMIUM",amount:199,method:"Demo checkout",date:adminToday(),status:"Pending",reference:"FC-DEMO-003"},
      {id:"txn-demo-004",userEmail:email,planId:"PRO",amount:499,method:"Demo checkout",date:adminDateOffset(-8),status:"Failed",reference:"FC-DEMO-004"},
      {id:"txn-demo-005",userEmail:email,planId:"PREMIUM",amount:199,method:"Demo checkout",date:adminDateOffset(-70),status:"Cancelled",reference:"FC-DEMO-005"}
    ]);
  }
  if(!Array.isArray(adminStoreRead("announcements")))adminStoreWrite("announcements",[]);
  if(!Array.isArray(adminStoreRead("logs")))adminStoreWrite("logs",[]);
  if(!Array.isArray(adminStoreRead("subscriptionEvents")))adminStoreWrite("subscriptionEvents",[]);
  if(!Array.isArray(adminStoreRead("archivedUsers")))adminStoreWrite("archivedUsers",[]);
  if(!Array.isArray(adminStoreRead("coachingRequests")))adminStoreWrite("coachingRequests",[]);
  adminSyncExpiredSubscriptions();
}
function adminPlans(){return adminStoreRead("plans",adminPlanSeeds())}
function adminPlanById(id){return adminPlans().find(plan=>plan.id===id)}
function adminSubscriptions(){return adminStoreRead("subscriptions",[])}
function adminPayments(){return adminStoreRead("payments",[])}
function adminUserMeta(){return adminStoreRead("userMeta",{})}
function adminSubscriptionFor(email){return adminSubscriptions().find(sub=>sub.userEmail.toLowerCase()===String(email||"").toLowerCase())}
function adminCoachingUsage(email){
  const subscription=adminSubscriptionFor(email),plan=adminPlanById(subscription?.planId||"");
  const limit=Math.max(0,Number(plan?.coachingSessions)||0),periodDays=Math.max(1,Number(plan?.durationDays)||30);
  const parsedStart=Date.parse(`${subscription?.startedAt||adminToday()}T00:00:00Z`),today=Date.parse(`${adminToday()}T00:00:00Z`);
  const start=Number.isFinite(parsedStart)?parsedStart:today;
  const cycle=Math.floor(Math.max(0,today-start)/(periodDays*86400000)),cycleStart=start+cycle*periodDays*86400000;
  const cycleDate=new Date(cycleStart).toISOString().slice(0,10);
  const used=adminStoreRead("coachingRequests",[]).filter(request=>String(request.userEmail||"").toLowerCase()===String(email||"").toLowerCase()&&String(request.date||"").slice(0,10)>=cycleDate&&request.status!=="Cancelled").length;
  return {limit,used,resetDate:new Date(cycleStart+periodDays*86400000).toISOString().slice(0,10)};
}
function adminSyncExpiredSubscriptions(){
  const subs=adminSubscriptions();let changed=false;
  for(const sub of subs){
    if(sub.status==="Active"&&sub.expiresAt&&sub.expiresAt<adminToday()&&sub.planId!=="FREE"){sub.status="Expired";changed=true;}
  }
  if(changed)adminStoreWrite("subscriptions",subs);
}
function adminEffectivePlanId(user=currentUser){
  if(!user||user.role!=="user")return "FREE";
  const sub=adminSubscriptionFor(user.email);
  if(!sub||sub.status!=="Active"||(sub.expiresAt&&sub.expiresAt<adminToday()))return "FREE";
  return adminPlanById(sub.planId)?sub.planId:adminCanonicalPlan(user.plan);
}
function adminHasFeature(feature,user=currentUser){
  if(!user||user.role!=="user")return true;
  const plan=adminPlanById(adminEffectivePlanId(user));
  return Boolean(plan?.entitlements?.includes(feature));
}
function adminRequiredPlan(feature){
  return adminPlans().filter(plan=>plan.active&&plan.entitlements?.includes(feature)).sort((a,b)=>a.price-b.price)[0]||adminPlanById("PRO");
}
function adminLogActivity(description){
  const logs=adminStoreRead("logs",[]);
  logs.unshift({id:adminId("log"),admin:currentUser?.name||"Administrator",description,date:new Date().toISOString()});
  adminStoreWrite("logs",logs.slice(0,300));
}
function adminTrainerProfiles(){return adminStoreRead("trainerProfiles",adminSeedTrainerProfiles())}
function adminProgramCount(){
  const custom=trainerPlans?.()||[];
  return WORKOUTS.length+custom.length;
}
function adminSessionData(){
  const stored=typeof trainerSessions==="function"?trainerSessions():[];
  return stored;
}
function adminFormatDate(value){
  if(!value)return "—";
  const date=new Date(value.length===10?`${value}T00:00:00`:value);
  return Number.isNaN(date.getTime())?"—":date.toLocaleDateString();
}
function adminPlanStatus(sub){
  if(sub.status==="Active"&&sub.expiresAt&&sub.expiresAt<adminToday())return "Expired";
  return sub.status;
}
function adminRoleLabel(role){return role==="user"?"Fitness User":role==="trainer"?"Trainer":role==="admin"?"Administrator":role}
function adminPlanLabel(id){return adminPlanById(String(id||"").toUpperCase())?.name||adminCanonicalPlan(id)}
function adminUserStatus(user){
  const meta=adminUserMeta()[user.email.toLowerCase()]||{};
  return meta.status||user.accountStatus||"Active";
}
function adminVisibleUsers(){return getUsers().filter(user=>user.role==="user")}
function adminClientName(email){return getUsers().find(user=>user.email.toLowerCase()===String(email||"").toLowerCase())?.name||"Unknown user"}
function adminUserCreated(user){return user.createdAt||adminUserMeta()[user.email.toLowerCase()]?.createdAt||adminDateOffset(-30)}

function adminNavMarkup(bottom=false){
  const links=ADMIN_NAV.map(([page,label,icon])=>`<button class="${bottom?"bottom-link":"nav-link"}" data-page="${page}"><i data-lucide="${icon}"></i><span>${adminEscape(label)}</span></button>`).join("");
  return `${links}<button class="${bottom?"bottom-link":"nav-link"} admin-logout-link" data-admin-action="logout"><i data-lucide="log-out"></i><span>Logout</span></button>`;
}
function syncAdminNavigation(){
  const side=$("#sideNav"),bottom=$(".bottom-nav"),label=$(".sidebar .side-label");
  if(side)side.innerHTML=adminNavMarkup();
  if(bottom){bottom.classList.add("trainer-bottom-nav","admin-bottom-nav");bottom.innerHTML=adminNavMarkup(true);}
  if(label)label.textContent="ADMINISTRATION";
  const sidebar=$(".sidebar"),promo=$(".sidebar-promo");
  sidebar?.classList.add("admin-sidebar");
  if(promo)promo.innerHTML=`<div class="promo-icon"><i data-lucide="shield-check"></i></div><b>Admin control center</b><p>Review platform activity and keep FITCONNECT running smoothly.</p><button class="btn btn-light btn-small" data-page="adminReports">View reports</button>`;
}
const adminBaseRender=renderPage;
renderPage=function(page){
  if(currentUser?.role==="admin"){
    adminEnsureData();
    const mapped=page==="training"||page==="adminDashboard"?"adminDashboard":page==="verification"||page==="adminTrainers"?"adminTrainers":page==="settings"?"adminProfile":page;
    adminBaseRender(mapped);
    syncAdminNavigation();
    const titles=Object.fromEntries(ADMIN_NAV.map(([key,label])=>[key,label]));
    $("#pageTitle").textContent=titles[mapped]||"Admin Dashboard";
    $("#pageEyebrow").textContent="ADMIN CONTROL CENTER";
    $$(".sidebar .nav-link,.bottom-nav .bottom-link").forEach(button=>button.classList.toggle("active",button.dataset.page===mapped));
    $("#sideUserRole").textContent="Administrator";
    const avatar=$(".profile-mini .avatar");if(avatar)avatar.textContent=initials(currentUser.name);
    $$("[data-page]").forEach(button=>button.onclick=()=>renderPage(button.dataset.page));
    iconRefresh();
    return;
  }
  if(currentUser?.role==="user"){
    adminEnsureData();
    const subscription=adminSubscriptionFor(currentUser.email);
    const tier=adminEffectivePlanId(currentUser);
    if(subscription&&subscription.status==="Active")currentUser.plan=subscription.planId;
    $("#topUserPlan").textContent=`${tier} plan${subscription&&adminPlanStatus(subscription)==="Expired"?" · expired":""}`;
  }else{
    $(".sidebar")?.classList.remove("admin-sidebar");
    $(".bottom-nav")?.classList.remove("admin-bottom-nav");
  }
  const result=adminBaseRender(page);
  if(currentUser?.role==="user"&&adminStoreRead("settings",{}).maintenanceMode){
    $("#pageContent").insertAdjacentHTML("afterbegin",'<div class="admin-maintenance-banner"><i data-lucide="construction"></i><span>FITCONNECT is in maintenance mode. Some services may be temporarily unavailable.</span></div>');
    iconRefresh();
  }
  return result;
};

const adminLegacyPage=adminPage;
adminPage=function(page){
  adminEnsureData();
  if(page==="adminDashboard")return adminDashboardPage();
  if(page==="users")return adminUsersPage();
  if(page==="adminTrainers"||page==="verification")return adminTrainersPage();
  if(page==="subscriptionManagement")return adminPlansPage();
  if(page==="subscriptionMonitoring")return adminSubscriptionsPage();
  if(page==="payments")return adminPaymentsPage();
  if(page==="announcements")return adminAnnouncementsPage();
  if(page==="adminReports")return adminReportsPage();
  if(page==="activityLogs")return adminActivityPage();
  if(page==="systemSettings")return adminSystemSettingsPage();
  if(page==="adminProfile")return adminProfilePage();
  return adminLegacyPage(page);
};

function adminHeading(title,subtitle,action=""){
  return `<div class="page-heading"><div><h1>${adminEscape(title)}</h1><p>${adminEscape(subtitle)}</p></div>${action}</div>`;
}
function adminStat(title,value,icon,detail="",tone=""){
  return `<div class="stat-card admin-stat-card ${tone}"><div class="stat-top">${adminEscape(title)}<span class="stat-icon"><i data-lucide="${icon}"></i></span></div><strong>${adminEscape(value)}</strong><small>${adminEscape(detail)}</small></div>`;
}
function adminDashboardPage(){
  const users=getUsers().filter(u=>u.role==="user"),trainers=adminTrainerProfiles(),subscriptions=adminSubscriptions(),payments=adminPayments(),sessions=adminSessionData(),plans=adminPlans();
  const activeSubs=subscriptions.filter(s=>adminPlanStatus(s)==="Active"),expired=subscriptions.filter(s=>adminPlanStatus(s)==="Expired");
  const free=activeSubs.filter(s=>s.planId==="FREE").length,premium=activeSubs.filter(s=>s.planId==="PREMIUM").length,pro=activeSubs.filter(s=>s.planId==="PRO").length;
  const pendingPayments=payments.filter(p=>p.status==="Pending").length;
  const pendingTrainers=trainers.filter(t=>t.verification==="Pending Verification").length;
  const revenueFor=range=>payments.filter(p=>p.status==="Paid"&&p.date>=range.start&&p.date<=range.end).reduce((sum,p)=>sum+Number(p.amount||0),0);
  const now=new Date(),monthStart=new Date(now.getFullYear(),now.getMonth(),1).toISOString().slice(0,10),yearStart=`${now.getFullYear()}-01-01`;
  const monthlyRevenue=revenueFor({start:monthStart,end:adminToday()}),annualRevenue=revenueFor({start:yearStart,end:adminToday()});
  const months=Array.from({length:6},(_,i)=>{const d=new Date(now.getFullYear(),now.getMonth()-5+i,1);return {label:d.toLocaleString("en",{month:"short"}),key:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`};});
  const revMax=Math.max(1,...months.map(m=>payments.filter(p=>p.status==="Paid"&&p.date.slice(0,7)===m.key).reduce((s,p)=>s+Number(p.amount||0),0)));
  const growth=months.map(m=>{const [y,mo]=m.key.split("-").map(Number),cutoff=new Date(y,mo,0,23,59,59);return {...m,count:users.filter(u=>new Date(adminUserCreated(u))<=cutoff).length};});
  const growthMax=Math.max(1,...growth.map(m=>m.count));
  const activity=adminUserMeta();
  const totalWorkoutSessions=sessions.length+users.reduce((sum,u)=>sum+Number(activity[u.email.toLowerCase()]?.workoutActivity||0)+(u.email.toLowerCase()===currentUser.email.toLowerCase()?Store.get("history",[]).length:0),0);
  const distribution=[["FREE",free],["PREMIUM",premium],["PRO",pro]],totalActive=activeSubs.length||1;
  const popular=WORKOUTS.slice(0,4);
  const recentLogs=adminStoreRead("logs",[]).slice(0,4);
  return `${adminHeading("Platform dashboard","A live overview of FITCONNECT users, subscriptions, trainers, and revenue.",`<button class="btn btn-outline btn-small" data-page="adminReports"><i data-lucide="chart-no-axes-combined"></i> View reports</button>`)}
    <div class="section admin-stat-grid">
      ${adminStat("Registered users",users.length,"users","Fitness member accounts")}
      ${adminStat("Registered trainers",trainers.length,"badge-check","Trainer profiles")}
      ${adminStat("Active subscribers",activeSubs.filter(s=>s.planId!=="FREE").length,"user-check","Paid active memberships")}
      ${adminStat("Free plan users",free,"user-round","Active FREE access")}
      ${adminStat("Premium subscribers",premium,"sparkles","Active PREMIUM plan")}
      ${adminStat("Pro subscribers",pro,"crown","Active PRO plan")}
      ${adminStat("Monthly subscription revenue",adminMoney(monthlyRevenue),"wallet","Paid transactions this month","admin-stat-blue")}
      ${adminStat("Annual revenue",adminMoney(annualRevenue),"chart-no-axes-combined","Paid transactions this year")}
      ${adminStat("Pending payments",pendingPayments,"clock","Require transaction review")}
      ${adminStat("Expired subscriptions",expired.length,"calendar-x","Access falls back to FREE")}
      ${adminStat("Pending trainer applications",pendingTrainers,"user-round-search","Awaiting review")}
      ${adminStat("Workout programs",adminProgramCount(),"dumbbell","Built-in and trainer-created")}
      ${adminStat("Training sessions",totalWorkoutSessions,"calendar-days","Recorded platform sessions")}
    </div>
    <div class="section admin-dashboard-grid">
      <div class="panel"><div class="section-head"><h3>Monthly revenue</h3><span class="muted">Last six months · paid only</span></div><div class="chart-box admin-chart">${months.map(m=>{const amount=payments.filter(p=>p.status==="Paid"&&p.date.slice(0,7)===m.key).reduce((s,p)=>s+Number(p.amount||0),0);return `<div class="chart-col"><b>${amount?adminMoney(amount):""}</b><div class="chart-bar" style="height:${Math.max(4,amount/revMax*76)}%"></div>${m.label}</div>`}).join("")}</div></div>
      <div class="panel"><div class="section-head"><h3>User registration growth</h3><span class="muted">Accounts by registration month</span></div><div class="chart-box admin-chart">${growth.map(m=>`<div class="chart-col"><b>${m.count}</b><div class="chart-bar" style="height:${Math.max(4,m.count/growthMax*76)}%"></div>${m.label}</div>`).join("")}</div></div>
    </div>
    <div class="section admin-dashboard-grid">
      <div class="panel"><div class="section-head"><h3>Subscription plan distribution</h3><button data-page="subscriptionMonitoring">View subscriptions</button></div><div class="admin-distribution">${distribution.map(([name,count])=>`<div class="admin-distribution-row"><span><i class="plan-dot ${name.toLowerCase()}"></i>${name}</span><b>${count}</b><div class="admin-distribution-track"><i class="${name.toLowerCase()}" style="width:${count/totalActive*100}%"></i></div></div>`).join("")}</div><div class="admin-legend"><span>Active</span><span>Expired: ${expired.length}</span></div></div>
      <div class="panel"><div class="section-head"><h3>Subscription status</h3><span class="muted">${subscriptions.length} records</span></div><div class="admin-status-circles"><div><strong>${activeSubs.length}</strong><small>Active</small></div><div><strong>${expired.length}</strong><small>Expired</small></div><div><strong>${subscriptions.filter(s=>adminPlanStatus(s)==="Cancelled").length}</strong><small>Cancelled</small></div></div><div class="admin-status-line"><span style="width:${subscriptions.length?activeSubs.length/subscriptions.length*100:0}%"></span></div></div>
    </div>
    <div class="section admin-dashboard-grid">
      <div class="panel"><div class="section-head"><h3>Trainer performance overview</h3><button data-page="adminTrainers">Manage trainers</button></div>${trainers.slice(0,4).map(t=>{const completed=sessions.filter(s=>s.status==="Completed").length;return `<div class="admin-trainer-performance"><img src="${adminEscape(adminUrl(t.photo))}" alt=""><div><b>${adminEscape(t.name)}</b><small>${adminEscape(t.specialty)} · ${adminEscape(t.verification)}</small></div><strong>★ ${Number(t.rating||0).toFixed(1)}</strong><small>${completed} completed sessions</small></div>`}).join("")}</div>
      <div class="panel"><div class="section-head"><h3>Popular workout programs</h3><button data-page="subscriptionManagement">Plan settings</button></div>${popular.map((w,i)=>`<div class="admin-popular-row"><span class="admin-popular-rank">${i+1}</span><div><b>${adminEscape(w.title)}</b><small>${adminEscape(w.category)} · ${adminEscape(w.level)}</small></div><span class="badge">${w.minutes} min</span></div>`).join("")}</div>
    </div>
    <div class="section panel"><div class="section-head"><h3>Admin activity</h3><button data-page="activityLogs">View activity log</button></div>${recentLogs.length?recentLogs.map(log=>`<div class="admin-log-row"><span class="stat-icon"><i data-lucide="shield-check"></i></span><div><b>${adminEscape(log.admin)}</b><small>${adminEscape(log.description)}</small></div><time>${new Date(log.date).toLocaleString()}</time></div>`).join(""):`<div class="empty-state">Administrative changes will be recorded here.</div>`}</div>`;
}

function adminUpgradeModal(feature,title=""){
  const required=adminRequiredPlan(feature),label=title||ADMIN_FEATURES.find(([id])=>id===feature)?.[1]||"this feature";
  modal(`<span class="admin-feature-lock"><i data-lucide="lock-keyhole"></i> MEMBERSHIP FEATURE</span><h2 class="admin-upgrade-title">Unlock ${adminEscape(label)}!</h2><p>This feature is available with the <b>${adminEscape(required?.name||"PRO")}</b> plan and above. Upgrade to unlock it alongside your other plan benefits.</p><div class="admin-upgrade-benefits">${(required?.benefits||[]).slice(0,4).map(benefit=>`<span><i data-lucide="check"></i>${adminEscape(benefit)}</span>`).join("")}</div><div class="admin-modal-actions"><button class="btn btn-outline" id="cancelUpgrade">Cancel</button><button class="btn btn-primary" id="confirmUpgrade">View ${adminEscape(required?.name||"PRO")} plan</button></div>`, "Upgrade your FITCONNECT plan");
  $("#cancelUpgrade").onclick=closeModal;
  $("#confirmUpgrade").onclick=()=>openPayment(required.id,required.price);
}
function adminUserSubscriptionStatus(user){
  const sub=adminSubscriptionFor(user.email);
  return sub?adminPlanStatus(sub):"Active";
}
function adminLimitedReportPage(){
  const history=Store.get("history",[]),latest=history.slice(-3).reverse();
  return `${pageHeading("Your progress","Keep your basic workout history and activity close at hand.",`<button class="btn btn-outline btn-small" data-page="subscription">Compare plans</button>`)}
    <div class="section stat-grid"><div class="stat-card"><div class="stat-top">Completed workouts</div><strong>${history.length}</strong><small>Saved on this device</small></div><div class="stat-card"><div class="stat-top">Current streak</div><strong>${Store.get("streak",2)} days</strong><small>Keep building your habit</small></div></div>
    <div class="section panel admin-locked-feature"><div class="admin-locked-icon"><i data-lucide="chart-no-axes-combined"></i></div><div><span class="badge">PREMIUM & PRO</span><h3>Unlock advanced progress tracking</h3><p>Get detailed activity and weight charts, expanded history, and monthly fitness reports.</p></div><button class="btn btn-primary btn-small" data-requires-feature="advancedTracking" data-feature-title="Advanced Progress Tracking">See upgrade options</button></div>
    <div class="section panel"><div class="section-head"><h3>Recent workout history</h3><span class="muted">Last ${Math.min(3,history.length)} sessions · Free plan</span></div>${latest.length?`<div class="table-wrap"><table><thead><tr><th>Workout</th><th>Date</th><th>Duration</th><th>Calories</th></tr></thead><tbody>${latest.map(item=>`<tr><td>${trainerEscape(item.title)}</td><td>${trainerEscape(item.date)}</td><td>${Number(item.minutes)||0} min</td><td>${Number(item.calories)||0} kcal</td></tr>`).join("")}</tbody></table></div>`:`<div class="empty-state">Complete a workout to start your history.</div>`}</div>`;
}
const adminOriginalWorkoutCard=workoutCard;
workoutCard=function(workout){
  if(currentUser?.role==="user"&&workout.id>3&&!adminHasFeature("fullLibrary")){
    return `<article class="workout-card admin-locked-workout" data-workout="${Number(workout.id)}" data-requires-feature="fullLibrary" data-feature-title="Full Exercise Video Library"><div class="workout-image" style="background-image:url('${adminEscape(adminUrl(workout.image))}')"><span class="image-tag">PREMIUM</span><span class="admin-lock-overlay"><i data-lucide="lock-keyhole"></i></span></div><div class="workout-body"><h4>${trainerEscape(workout.title)}</h4><div class="meta-row"><span>${trainerEscape(workout.category)}</span><span>${Number(workout.minutes)} min</span></div><div class="workout-footer"><span class="difficulty">Upgrade to unlock</span><span class="muted" style="font-size:10px">PREMIUM</span></div></div></article>`;
  }
  return adminOriginalWorkoutCard(workout);
};
const adminOriginalReportPage=reportPage;
reportPage=function(){
  return currentUser?.role==="user"&&!adminHasFeature("advancedTracking")?adminLimitedReportPage():adminOriginalReportPage();
};
const adminOriginalTrainersPage=trainersPage;
trainersPage=function(){
  return `${adminOriginalTrainersPage()}<div class="section panel admin-locked-feature"><div class="admin-locked-icon"><i data-lucide="message-circle"></i></div><div><span class="badge">PRO COACHING</span><h3>One-to-one trainer coaching</h3><p>Assigned coaching, direct trainer messages, and virtual sessions are included with PRO. Session limits are shown in the plan details.</p></div><button class="btn btn-primary btn-small" data-requires-feature="assignedTrainer" data-feature-title="Personal Trainer Coaching">Explore PRO</button></div>`;
};
document.addEventListener("click",event=>{
  const locked=event.target.closest("[data-requires-feature]");
  if(!locked||currentUser?.role!=="user")return;
  const feature=locked.dataset.requiresFeature;
  if(adminHasFeature(feature))return;
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
  adminUpgradeModal(feature,locked.dataset.featureTitle||"");
},true);
const adminOriginalOpenTrainer=openTrainer;
openTrainer=function(id){
  adminOriginalOpenTrainer(id);
  const button=$("#trainerSubscribe");
  if(!button||currentUser?.role!=="user")return;
  const usage=adminCoachingUsage(currentUser.email);
  button.textContent=adminHasFeature("assignedTrainer")&&adminHasFeature("virtualSessions")?`Request a coaching session (${usage.used}/${usage.limit})`:"See PRO coaching";
  button.onclick=()=>{
    if(!adminHasFeature("assignedTrainer"))return adminUpgradeModal("assignedTrainer","Personal Trainer Coaching");
    if(!adminHasFeature("virtualSessions"))return adminUpgradeModal("virtualSessions","Virtual Coaching Sessions");
    const currentUsage=adminCoachingUsage(currentUser.email);
    if(currentUsage.limit===0)return toast("Your current plan has no virtual coaching sessions. Review your plan benefits.");
    if(currentUsage.used>=currentUsage.limit)return toast(`You have used this period's ${currentUsage.limit} coaching sessions. Sessions renew on ${adminFormatDate(currentUsage.resetDate)}.`);
    const requests=adminStoreRead("coachingRequests",[]);
    requests.push({id:adminId("coach-request"),userEmail:currentUser.email,trainerId:id,date:new Date().toISOString(),status:"Requested"});
    adminStoreWrite("coachingRequests",requests);
    closeModal();toast("Coaching request saved locally. Trainer notifications require a backend.");
  };
};
subscriptionPage=function(){
  adminEnsureData();
  const plans=adminPlans().filter(plan=>plan.active||plan.id===adminEffectivePlanId());
  const subscription=adminSubscriptionFor(currentUser.email),current=adminEffectivePlanId(),expired=subscription&&adminPlanStatus(subscription)==="Expired";
  const featureRows=ADMIN_FEATURES.map(([key,label])=>`<tr class="${adminHasFeature(key)?"":"admin-feature-unavailable"}"><td>${adminEscape(label)}</td>${plans.map(plan=>`<td>${plan.entitlements.includes(key)?'<span class="admin-feature-check">✓</span>':'<span class="admin-feature-no">—</span>'}</td>`).join("")}</tr>`).join("");
  return `${pageHeading("Choose your FITCONNECT plan","Choose the right level of workout guidance for your goals.")}
    ${expired?`<div class="section admin-expiry-banner"><i data-lucide="triangle-alert"></i><span>Your ${adminEscape(adminPlanLabel(subscription.planId))} subscription expired on ${adminEscape(adminFormatDate(subscription.expiresAt))}. Your account currently has FREE plan access.</span></div>`:""}
    <div class="section admin-pricing-grid">${plans.map(plan=>{
      const currentPlan=current===plan.id&&!expired,discounted=Math.round(plan.price*(1-(Number(plan.discount)||0)/100));
      return `<article class="admin-price-card ${plan.id==="PREMIUM"?"recommended":""} ${plan.id==="PRO"?"pro-choice":""}">${plan.id==="PREMIUM"?'<span class="admin-plan-ribbon">RECOMMENDED</span>':plan.id==="PRO"?'<span class="admin-plan-ribbon pro">BEST FOR COACHING</span>':""}<span class="admin-price-name">${adminEscape(plan.name)}</span><p>${adminEscape(plan.description)}</p><div class="admin-price-amount">${discounted===0?adminMoney(0):adminMoney(discounted)}<small> / ${plan.durationDays?`${plan.durationDays} days`:"month"}</small></div>${Number(plan.discount)>0?`<div class="admin-discount-label">${Number(plan.discount)}% promotional discount</div>`:""}<div class="admin-plan-status">${currentPlan?'<span class="badge">Current plan</span>':expired&&subscription.planId===plan.id?'<span class="badge trainer-badge-warn">Expired · renew access</span>':""}</div><ul>${plan.benefits.map(benefit=>`<li>${adminEscape(benefit)}</li>`).join("")}</ul>${plan.id==="PRO"?`<div class="admin-session-limit">${Number(plan.coachingSessions)} virtual coaching session(s) per ${Number(plan.durationDays)||30} days</div>`:""}${currentPlan?'<button class="btn btn-outline full" disabled>Current plan</button>':plan.active?`<button class="btn ${plan.id==="PREMIUM"?"btn-primary":"btn-outline"} full" data-plan="${adminEscape(plan.id)}" data-price="${discounted}">${expired&&subscription.planId===plan.id?"Renew":"Choose"} ${adminEscape(plan.name)}</button>`:'<button class="btn btn-outline full" disabled>Unavailable</button>'}</article>`;
    }).join("")}</div>
    <div class="section panel"><div class="section-head"><div><h3>Compare plan features</h3><p class="muted">Benefits are configured by FITCONNECT administrators.</p></div></div><div class="table-wrap"><table class="admin-comparison-table"><thead><tr><th>Feature</th>${plans.map(plan=>`<th>${adminEscape(plan.name)}</th>`).join("")}</tr></thead><tbody>${featureRows}</tbody></table></div></div>
    <p class="muted-note">Prototype only: checkout does not process a real payment. Plan features are enforced in this browser; production access control must also be enforced by a secure backend.</p>`;
};
openPayment=function(planId,price){
  adminEnsureData();
  const plan=adminPlanById(String(planId||"").toUpperCase())||adminPlanById(adminCanonicalPlan(planId));
  if(!plan||!plan.active)return toast("This subscription plan is not currently available.");
  const amount=Math.max(0,Math.round(Number(price??plan.price)));
  if(plan.id==="FREE"){
    modal(`<p>Switch to the FREE plan? Paid-plan features will no longer be available after the change.</p><div class="muted-note">Your workout history remains on this device. No payment is requested.</div><button class="btn btn-primary full" id="confirmFreePlan">Switch to FREE</button>`,"Confirm plan change");
    $("#confirmFreePlan").onclick=()=>adminActivateSubscription(plan,0,"Plan change");
    return;
  }
  modal(`<h2 class="admin-checkout-title">Confirm ${adminEscape(plan.name)} plan</h2><p>${adminMoney(amount)} per ${plan.durationDays||30} days${Number(plan.discount)>0?` · ${plan.discount}% discount applied`:""}.</p><label>Demo payment method<select id="adminPayMethod"><option>Demo card</option><option>GCash (simulated)</option><option>Bank transfer (simulated)</option></select></label><p class="admin-payment-note"><i data-lucide="info"></i> This checkout is simulated. No card details are requested and no payment is processed.</p><button class="btn btn-primary full" id="confirmAdminPayment">Confirm demo purchase · ${adminMoney(amount)}</button>`,"Subscription checkout");
  $("#confirmAdminPayment").onclick=()=>adminActivateSubscription(plan,amount,$("#adminPayMethod").value);
};
function adminActivateSubscription(plan,amount,method){
  const users=getUsers(),user=users.find(item=>item.email.toLowerCase()===currentUser.email.toLowerCase());
  if(!user)return toast("Your account could not be found.");
  const subscriptions=adminSubscriptions(),old=subscriptions.find(sub=>sub.userEmail.toLowerCase()===user.email.toLowerCase()),oldPlan=old?.planId||"FREE";
  const startedAt=adminToday(),expiresAt=plan.id==="FREE"?"":adminDateOffset(Number(plan.durationDays)||30);
  const entry={id:old?.id||adminId("sub"),userEmail:user.email,planId:plan.id,status:"Active",startedAt,expiresAt,renewalEnabled:plan.id!=="FREE",history:[...(old?.history||[]),{from:oldPlan,to:plan.id,date:new Date().toISOString()}]};
  const next=subscriptions.filter(sub=>sub.userEmail.toLowerCase()!==user.email.toLowerCase());next.push(entry);
  adminStoreWrite("subscriptions",next);user.plan=plan.id;Store.set("users",users);currentUser=user;
  if(plan.id!=="FREE")adminStoreWrite("payments",[{id:adminId("txn"),userEmail:user.email,planId:plan.id,amount,method,status:"Paid",date:adminToday(),reference:`FC-${Date.now().toString(36).toUpperCase()}`},...adminPayments()]);
  adminStoreWrite("subscriptionEvents",[{id:adminId("subevent"),userEmail:user.email,from:oldPlan,to:plan.id,date:new Date().toISOString()},...adminStoreRead("subscriptionEvents",[])]);
  closeModal();$("#topUserPlan").textContent=`${plan.id} plan`;renderPage("subscription");toast(`${plan.id} demo subscription activated. No real payment was processed.`);
}
function adminUsersPage(){
  const users=adminVisibleUsers();
  return `${adminHeading("User management","Search accounts, review subscription access, and manage member status.",`<button class="btn btn-primary btn-small" data-admin-action="user-add"><i data-lucide="user-plus"></i> Add user</button>`)}
    <div class="section admin-toolbar"><div class="searchbar"><i data-lucide="search"></i><input id="adminUserSearch" placeholder="Search name or email"></div><select id="adminUserPlanFilter"><option value="all">All plans</option>${adminPlans().map(p=>`<option value="${p.id}">${adminEscape(p.name)}</option>`).join("")}</select><select id="adminUserStatusFilter"><option value="all">All account statuses</option><option>Active</option><option>Deactivated</option><option>Archived</option></select></div>
    <div class="section panel table-wrap"><table class="admin-table"><thead><tr><th>User</th><th>User ID</th><th>Registered</th><th>Subscription</th><th>Assigned trainer</th><th>Account</th><th>Activity</th><th>Actions</th></tr></thead><tbody id="adminUserRows">${adminUserRows(users)}</tbody></table><div id="adminUsersEmpty" class="empty-state hidden">No accounts match your search and filters.</div></div>
    <div class="section panel table-wrap"><div class="section-head"><div><h3>Platform account roles</h3><span class="muted">Preserve role controls for all demo accounts.</span></div></div><table class="admin-table"><thead><tr><th>Account</th><th>Role</th><th>Login status</th><th>Access</th></tr></thead><tbody>${getUsers().map(user=>`<tr><td>${adminEscape(user.name)}<small class="admin-cell-sub">${adminEscape(user.email)}</small></td><td>${adminEscape(adminRoleLabel(user.role))}</td><td>${adminEscape(adminUserStatus(user))}</td><td><button class="btn btn-outline btn-small" data-admin-action="role-edit" data-email="${adminEscape(user.email)}" ${user.email.toLowerCase()===currentUser.email.toLowerCase()?"disabled":""}>Change role</button></td></tr>`).join("")}</tbody></table></div>`;
}
function adminUserRows(users){
  const metas=adminUserMeta();
  return users.map(user=>{
    const meta=metas[user.email.toLowerCase()]||{},sub=adminSubscriptionFor(user.email),status=adminUserStatus(user);
    const plan=sub?adminPlanLabel(sub.planId):adminCanonicalPlan(user.plan),subscriptionStatus=sub?adminPlanStatus(sub):"Active";
    const photo=adminUrl(meta.photo);
      return `<tr><td><button class="admin-user-link" data-admin-action="user-view" data-email="${adminEscape(user.email)}">${photo?`<img src="${adminEscape(photo)}" alt="">`:`<span class="avatar">${initials(user.name)}</span>`}<span><b>${adminEscape(user.name)}</b><small>${adminEscape(user.email)} · ${adminEscape(adminRoleLabel(user.role))}</small></span></button></td><td><code>${adminEscape(user.id||adminUserId(user.email))}</code></td><td>${adminEscape(adminFormatDate(adminUserCreated(user)))}</td><td><span class="badge ${subscriptionStatus==="Active"?"":"trainer-badge-muted"}">${adminEscape(plan)} · ${adminEscape(subscriptionStatus)}</span></td><td>${adminEscape(meta.assignedTrainer?adminClientName(meta.assignedTrainer):"—")}</td><td><span class="badge ${status==="Active"?"":"trainer-badge-warn"}">${adminEscape(status)}</span></td><td>${Number(meta.workoutActivity)||0} workouts</td><td><div class="admin-row-actions"><button class="btn btn-outline btn-small" data-admin-action="user-edit" data-email="${adminEscape(user.email)}">Edit</button><button class="btn btn-outline btn-small" data-admin-action="user-subscription" data-email="${adminEscape(user.email)}">Plan</button><button class="btn btn-outline btn-small" data-admin-action="user-toggle" data-email="${adminEscape(user.email)}">${status==="Active"?"Deactivate":"Activate"}</button><button class="btn btn-outline btn-small" data-admin-action="user-archive" data-email="${adminEscape(user.email)}">Archive</button><button class="btn btn-outline btn-small admin-danger" data-admin-action="user-delete" data-email="${adminEscape(user.email)}">Delete</button></div></td></tr>`;
  }).join("");
}
function adminUserId(email){return `usr-${String(email).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}`;}
function adminFilterUsers(){
  const q=($("#adminUserSearch")?.value||"").trim().toLowerCase(),plan=$("#adminUserPlanFilter")?.value||"all",status=$("#adminUserStatusFilter")?.value||"all";
  const rows=adminVisibleUsers().filter(user=>{
    const sub=adminSubscriptionFor(user.email);
    return (`${user.name} ${user.email}`.toLowerCase().includes(q))&&(plan==="all"||(sub?.planId||adminCanonicalPlan(user.plan))===plan)&&(status==="all"||adminUserStatus(user)===status);
  });
  $("#adminUserRows").innerHTML=adminUserRows(rows);$("#adminUsersEmpty").classList.toggle("hidden",rows.length>0);iconRefresh();
}
function adminUserForm(user=null){
  const editing=Boolean(user),meta=adminUserMeta()[user?.email?.toLowerCase()]||{};
  modal(`<form data-admin-form="${editing?"user-edit":"user-create"}" data-email="${adminEscape(user?.email||"")}"><div class="field-grid"><label>Full name<input name="name" required maxlength="80" value="${adminEscape(user?.name||"")}"></label><label>Email address<input name="email" type="email" required maxlength="120" value="${adminEscape(user?.email||"")}"></label><label>Age<input name="age" type="number" min="13" max="100" value="${adminEscape(user?.age||"")}"></label><label>Fitness goal<input name="goal" maxlength="80" value="${adminEscape(user?.goal||"Keep Fit")}"></label><label>Subscription plan<select name="plan">${adminPlans().map(p=>`<option value="${p.id}" ${(p.id===(adminSubscriptionFor(user?.email)?.planId||adminCanonicalPlan(user?.plan)))?"selected":""}>${adminEscape(p.name)}</option>`).join("")}</select></label><label>Assigned trainer<select name="assignedTrainer"><option value="">No trainer assigned</option>${adminTrainerProfiles().filter(t=>t.verification==="Verified"&&t.accountStatus==="Active").map(t=>`<option value="${adminEscape(t.email)}" ${meta.assignedTrainer===t.email?"selected":""}>${adminEscape(t.name)}</option>`).join("")}</select></label></div>${editing?"":'<label>Temporary demo password<input name="password" type="password" required minlength="6" value="demo123"></label>'}<label>Profile picture URL<input name="photo" type="url" placeholder="https://..." value="${adminEscape(meta.photo||"")}"></label><button class="btn btn-primary full" type="submit">${editing?"Save user":"Create user"}</button></form>`,editing?"Edit user":"Add user");
}
function adminRoleForm(user){
  modal(`<form data-admin-form="account-role" data-email="${adminEscape(user.email)}"><p>Change the application role for <b>${adminEscape(user.name)}</b>.</p><label>Account role<select name="role">${[["user","Fitness User"],["trainer","Trainer / Coach"],["admin","Administrator"]].map(([value,label])=>`<option value="${value}" ${user.role===value?"selected":""}>${label}</option>`).join("")}</select></label><p class="muted-note">Role changes affect which workspace appears the next time this account signs in.</p><button class="btn btn-primary full" type="submit">Save role</button></form>`, "Manage account role");
}
function adminViewUser(email){
  const user=getUsers().find(item=>item.email.toLowerCase()===String(email).toLowerCase());if(!user)return toast("User record was not found.");
  const meta=adminUserMeta()[user.email.toLowerCase()]||{},sub=adminSubscriptionFor(user.email),history=user.email.toLowerCase()===currentUser.email.toLowerCase()?Store.get("history",[]):meta.workoutHistory||[];
  modal(`<div class="admin-user-detail"><div><span class="avatar admin-large-avatar">${initials(user.name)}</span></div><div><h2>${adminEscape(user.name)}</h2><p>${adminEscape(user.email)} · ${adminEscape(adminRoleLabel(user.role))}</p><span class="badge">${adminEscape(adminUserStatus(user))}</span></div></div><div class="admin-detail-grid"><div><small>User ID</small><b>${adminEscape(user.id||adminUserId(user.email))}</b></div><div><small>Registration date</small><b>${adminEscape(adminFormatDate(adminUserCreated(user)))}</b></div><div><small>Current plan</small><b>${adminEscape(sub?adminPlanLabel(sub.planId):adminCanonicalPlan(user.plan))} · ${adminEscape(sub?adminPlanStatus(sub):"Active")}</b></div><div><small>Assigned trainer</small><b>${adminEscape(meta.assignedTrainer?adminClientName(meta.assignedTrainer):"Not assigned")}</b></div><div><small>Age and goal</small><b>${adminEscape(user.age||"—")} · ${adminEscape(user.goal||"—")}</b></div><div><small>Recorded workout activity</small><b>${history.length||Number(meta.workoutActivity)||0} sessions</b></div></div><h3 class="admin-modal-section-title">Recent workout history</h3>${history.length?`<ul class="admin-history-list">${history.slice(-5).reverse().map(item=>`<li><b>${adminEscape(item.title)}</b><span>${adminEscape(item.date)} · ${Number(item.minutes)||0} min</span></li>`).join("")}</ul>`:`<div class="empty-state">No workout history is available for this account.</div>`}<div class="admin-modal-actions"><button class="btn btn-outline" data-admin-action="user-edit" data-email="${adminEscape(user.email)}">Edit information</button><button class="btn btn-primary" data-admin-action="user-subscription" data-email="${adminEscape(user.email)}">Manage subscription</button></div>`, "User profile");
}
function adminTrainersPage(){
  const trainers=adminTrainerProfiles();
  return `${adminHeading("Trainer management","Review certifications, verify applicants, and monitor trainer status.",`<button class="btn btn-outline btn-small" data-admin-action="trainer-new"><i data-lucide="user-plus"></i> Add trainer profile</button>`)}
    <div class="section admin-toolbar"><div class="searchbar"><i data-lucide="search"></i><input id="adminTrainerSearch" placeholder="Search trainer or certification"></div><select id="adminTrainerStatus"><option value="all">All verification statuses</option>${["Pending Verification","Verified","Rejected","Suspended"].map(s=>`<option>${s}</option>`).join("")}</select></div>
    <div class="section panel table-wrap"><table class="admin-table"><thead><tr><th>Trainer</th><th>Certification</th><th>Specialization</th><th>Clients</th><th>Performance</th><th>Verification</th><th>Actions</th></tr></thead><tbody id="adminTrainerRows">${adminTrainerRows(trainers)}</tbody></table><div id="adminTrainersEmpty" class="empty-state hidden">No trainer profiles match your filters.</div></div>
    <p class="muted-note">Certification verification, identity checks, and trainer notifications are demonstrations. Production approval requires staff review and secure document storage.</p>`;
}
function adminTrainerRows(trainers){
  const sessions=adminSessionData();
  return trainers.map(t=>{const completed=sessions.filter(s=>s.status==="Completed").length;return `<tr><td><button class="admin-user-link" data-admin-action="trainer-view" data-id="${adminEscape(t.id)}"><img src="${adminEscape(adminUrl(t.photo))}" alt=""><span><b>${adminEscape(t.name)}</b><small>${adminEscape(t.email)} · ${adminEscape(t.experience)}</small></span></button></td><td>${adminEscape(t.certifications)}</td><td>${adminEscape(t.specialty)}</td><td>${Number(t.clients)||0}</td><td><span class="admin-rating">★ ${Number(t.rating||0).toFixed(1)}</span><small class="admin-cell-sub">${completed} completed sessions</small></td><td><span class="badge ${t.verification==="Verified"?"":"trainer-badge-warn"}">${adminEscape(t.verification)}</span><small class="admin-cell-sub">${adminEscape(t.accountStatus)}</small></td><td><div class="admin-row-actions">${t.verification==="Pending Verification"?`<button class="btn btn-primary btn-small" data-admin-action="trainer-approve" data-id="${adminEscape(t.id)}">Approve</button><button class="btn btn-outline btn-small" data-admin-action="trainer-reject" data-id="${adminEscape(t.id)}">Reject</button>`:""}<button class="btn btn-outline btn-small" data-admin-action="trainer-edit" data-id="${adminEscape(t.id)}">Edit</button><button class="btn btn-outline btn-small admin-danger" data-admin-action="trainer-toggle" data-id="${adminEscape(t.id)}">${t.accountStatus==="Active"?"Suspend":"Activate"}</button></div></td></tr>`}).join("");
}
function adminFilterTrainers(){
  const q=($("#adminTrainerSearch")?.value||"").trim().toLowerCase(),status=$("#adminTrainerStatus")?.value||"all";
  const rows=adminTrainerProfiles().filter(t=>`${t.name} ${t.email} ${t.certifications} ${t.specialty}`.toLowerCase().includes(q)&&(status==="all"||t.verification===status));
  $("#adminTrainerRows").innerHTML=adminTrainerRows(rows);$("#adminTrainersEmpty").classList.toggle("hidden",rows.length>0);iconRefresh();
}
function adminTrainerForm(trainer=null){
  const editing=Boolean(trainer);
  modal(`<form data-admin-form="${editing?"trainer-edit":"trainer-create"}" data-id="${adminEscape(trainer?.id||"")}"><div class="field-grid"><label>Full name<input name="name" required maxlength="80" value="${adminEscape(trainer?.name||"")}"></label><label>Email<input name="email" type="email" required value="${adminEscape(trainer?.email||"")}"></label><label>Certification<input name="certifications" required maxlength="180" value="${adminEscape(trainer?.certifications||"")}"></label><label>Specialization<input name="specialty" required maxlength="160" value="${adminEscape(trainer?.specialty||"")}"></label><label>Experience<input name="experience" maxlength="40" value="${adminEscape(trainer?.experience||"")}"></label><label>Rating<input name="rating" type="number" min="0" max="5" step=".1" value="${adminEscape(trainer?.rating||0)}"></label><label>Assigned clients<input name="clients" type="number" min="0" value="${adminEscape(trainer?.clients||0)}"></label><label>Verification status<select name="verification">${["Pending Verification","Verified","Rejected","Suspended"].map(s=>`<option ${trainer?.verification===s?"selected":""}>${s}</option>`).join("")}</select></label><label>Account status<select name="accountStatus"><option ${trainer?.accountStatus==="Active"?"selected":""}>Active</option><option ${trainer?.accountStatus==="Suspended"?"selected":""}>Suspended</option></select></label><label>Profile image URL<input name="photo" type="url" value="${adminEscape(trainer?.photo||"")}"></label></div><button class="btn btn-primary full" type="submit">${editing?"Save trainer profile":"Add trainer profile"}</button></form>`,editing?"Edit trainer":"Add trainer profile");
}
function adminPlanFeatureCheckboxes(selected=[]){
  return ADMIN_FEATURES.map(([id,label])=>`<label class="admin-feature-checkbox"><input type="checkbox" name="entitlements" value="${id}" ${selected.includes(id)?"checked":""}><span>${adminEscape(label)}</span></label>`).join("");
}
function adminPlansPage(){
  const plans=adminPlans(),subscriptions=adminSubscriptions(),payments=adminPayments();
  return `${adminHeading("Subscription management","Configure plan pricing, duration, benefits, discounts, and access entitlements.",`<button class="btn btn-primary btn-small" data-admin-action="plan-create"><i data-lucide="plus"></i> Create plan</button>`)}
    <div class="section admin-plan-admin-grid">${plans.map(plan=>{const subs=subscriptions.filter(s=>s.planId===plan.id&&adminPlanStatus(s)==="Active").length,revenue=payments.filter(p=>p.planId===plan.id&&p.status==="Paid").reduce((sum,p)=>sum+Number(p.amount||0),0);return `<article class="panel admin-plan-admin-card"><div class="admin-plan-admin-head"><span class="admin-price-name">${adminEscape(plan.name)}</span><span class="badge ${plan.active?"":"trainer-badge-muted"}">${plan.active?"Active":"Inactive"}</span></div><h3>${adminMoney(plan.price)}<small> / ${plan.durationDays||"no-expiry"} days</small></h3><p>${adminEscape(plan.description)}</p><div class="admin-plan-kpis"><div><b>${subs}</b><small>Active subscribers</small></div><div><b>${adminMoney(revenue)}</b><small>Paid revenue</small></div><div><b>${plan.id==="PRO"?Number(plan.coachingSessions):"—"}</b><small>Coaching sessions</small></div></div><ul>${plan.benefits.slice(0,5).map(b=>`<li>${adminEscape(b)}</li>`).join("")}</ul><div class="admin-row-actions"><button class="btn btn-outline btn-small" data-admin-action="plan-edit" data-id="${adminEscape(plan.id)}">Edit plan</button><button class="btn btn-outline btn-small" data-admin-action="plan-toggle" data-id="${adminEscape(plan.id)}">${plan.active?"Deactivate":"Activate"}</button>${plan.id!=="FREE"?`<button class="btn btn-outline btn-small admin-danger" data-admin-action="plan-delete" data-id="${adminEscape(plan.id)}">Delete</button>`:""}</div></article>`}).join("")}</div>
    <div class="section panel"><div class="section-head"><h3>Plan access control</h3><span class="muted">Entitlements directly control user feature access.</span></div><div class="table-wrap"><table class="admin-entitlement-table"><thead><tr><th>Feature</th>${plans.map(p=>`<th>${adminEscape(p.name)}</th>`).join("")}</tr></thead><tbody>${ADMIN_FEATURES.map(([key,label])=>`<tr><td>${adminEscape(label)}</td>${plans.map(p=>`<td>${p.entitlements.includes(key)?'<span class="admin-feature-check">✓ Included</span>':'—'}</td>`).join("")}</tr>`).join("")}</tbody></table></div></div>`;
}
function adminPlanForm(plan=null){
  const editing=Boolean(plan),selected=plan?.entitlements||ADMIN_DEFAULT_ENTITLEMENTS.PREMIUM;
  modal(`<form data-admin-form="${editing?"plan-edit":"plan-create"}" data-id="${adminEscape(plan?.id||"")}"><div class="field-grid"><label>Plan ID<input name="id" required maxlength="16" pattern="[A-Za-z0-9_-]+" value="${adminEscape(plan?.id||"")}" ${editing?"readonly":""} placeholder="e.g. FAMILY"></label><label>Display name<input name="name" required maxlength="30" value="${adminEscape(plan?.name||"")}"></label><label>Monthly price (₱)<input name="price" type="number" min="0" step="1" required value="${adminEscape(plan?.price??0)}"></label><label>Duration (days, 0 = no expiry)<input name="durationDays" type="number" min="0" max="3650" required value="${adminEscape(plan?.durationDays??30)}"></label><label>Promotional discount (%)<input name="discount" type="number" min="0" max="90" value="${adminEscape(plan?.discount||0)}"></label><label>Virtual coaching sessions per period<input name="coachingSessions" type="number" min="0" max="100" value="${adminEscape(plan?.coachingSessions||0)}"></label></div><label>Plan description<input name="description" required maxlength="180" value="${adminEscape(plan?.description||"")}"></label><label>Plan benefits (one per line)<textarea name="benefits" rows="5" required>${adminEscape((plan?.benefits||[]).join("\n"))}</textarea></label><fieldset class="admin-entitlement-fieldset"><legend>Feature entitlements (used by application access checks)</legend><div class="admin-entitlement-checks">${adminPlanFeatureCheckboxes(selected)}</div></fieldset><label class="admin-inline-check"><input name="active" type="checkbox" ${plan?.active!==false?"checked":""}> Plan is available for new subscriptions</label><p class="muted-note">Deactivating a plan stops new purchases. Existing users keep the configured entitlements until their subscription expires.</p><button class="btn btn-primary full" type="submit">${editing?"Save plan configuration":"Create subscription plan"}</button></form>`,editing?`Edit ${plan.name} plan`:"Create subscription plan");
}
function adminSubscriptionsPage(){
  const subs=adminSubscriptions(),allUsers=getUsers();
  return `${adminHeading("Subscription monitoring","Track active, expired, cancelled, pending, and upcoming renewals.")}
    <div class="section admin-toolbar"><div class="searchbar"><i data-lucide="search"></i><input id="adminSubSearch" placeholder="Search user or plan"></div><select id="adminSubStatus"><option value="all">All statuses</option>${["Active","Expired","Cancelled","Pending"].map(s=>`<option>${s}</option>`).join("")}</select><select id="adminSubPlan"><option value="all">All plans</option>${adminPlans().map(p=>`<option value="${p.id}">${adminEscape(p.name)}</option>`).join("")}</select></div>
    <div class="section admin-monitor-cards">${adminMonitorCards(subs)}</div>
    <div class="section panel table-wrap"><table class="admin-table"><thead><tr><th>Member</th><th>Plan</th><th>Status</th><th>Start date</th><th>Expiration / renewal</th><th>Auto-renew</th><th>Actions</th></tr></thead><tbody id="adminSubRows">${adminSubscriptionRows(subs,allUsers)}</tbody></table><div id="adminSubsEmpty" class="empty-state hidden">No subscriptions match these filters.</div></div>
    <div class="section panel"><div class="section-head"><h3>Recent plan changes</h3><span class="muted">Upgrade and downgrade history</span></div>${adminStoreRead("subscriptionEvents",[]).slice(0,6).map(e=>`<div class="admin-log-row"><span class="stat-icon"><i data-lucide="arrow-left-right"></i></span><div><b>${adminEscape(adminClientName(e.userEmail))}</b><small>${adminEscape(adminPlanLabel(e.from))} → ${adminEscape(adminPlanLabel(e.to))}</small></div><time>${new Date(e.date).toLocaleString()}</time></div>`).join("")||'<div class="empty-state">Subscription changes will appear here.</div>'}</div>`;
}
function adminMonitorCards(subs){
  const soon=subs.filter(s=>adminPlanStatus(s)==="Active"&&s.expiresAt&&new Date(`${s.expiresAt}T00:00:00`)-new Date()<7*86400000).length;
  return `<div>${adminStat("Active",subs.filter(s=>adminPlanStatus(s)==="Active").length,"badge-check","Active access")}${adminStat("Expired",subs.filter(s=>adminPlanStatus(s)==="Expired").length,"calendar-x","Access is FREE")}${adminStat("Cancelled",subs.filter(s=>adminPlanStatus(s)==="Cancelled").length,"circle-x","Cancelled records")}${adminStat("Renewals due soon",soon,"bell-ring","Next seven days")}</div>`;
}
function adminSubscriptionRows(subs){
  return subs.map(sub=>{const status=adminPlanStatus(sub),user=getUsers().find(u=>u.email.toLowerCase()===sub.userEmail.toLowerCase()),expires=sub.expiresAt?adminFormatDate(sub.expiresAt):"No expiry";return `<tr><td>${adminEscape(user?.name||sub.userEmail)}<small class="admin-cell-sub">${adminEscape(sub.userEmail)}</small></td><td><span class="badge">${adminEscape(adminPlanLabel(sub.planId))}</span></td><td><span class="badge ${status==="Active"?"":"trainer-badge-warn"}">${adminEscape(status)}</span></td><td>${adminEscape(adminFormatDate(sub.startedAt))}</td><td>${adminEscape(expires)}${sub.renewalEnabled&&status==="Active"?'<small class="admin-cell-sub">Renewal enabled</small>':""}</td><td>${sub.renewalEnabled?"On":"Off"}</td><td><div class="admin-row-actions"><button class="btn btn-outline btn-small" data-admin-action="subscription-edit" data-id="${adminEscape(sub.id)}">Manage</button>${status==="Active"&&sub.planId!=="FREE"?`<button class="btn btn-outline btn-small" data-admin-action="subscription-cancel" data-id="${adminEscape(sub.id)}">Cancel</button>`:status!=="Active"&&sub.planId!=="FREE"?`<button class="btn btn-outline btn-small" data-admin-action="subscription-renew" data-id="${adminEscape(sub.id)}">Renew</button>`:""}</div></td></tr>`}).join("");
}
function adminFilterSubscriptions(){
  const q=($("#adminSubSearch")?.value||"").trim().toLowerCase(),status=$("#adminSubStatus")?.value||"all",plan=$("#adminSubPlan")?.value||"all";
  const rows=adminSubscriptions().filter(sub=>`${adminClientName(sub.userEmail)} ${sub.userEmail} ${adminPlanLabel(sub.planId)}`.toLowerCase().includes(q)&&(status==="all"||adminPlanStatus(sub)===status)&&(plan==="all"||sub.planId===plan));
  $("#adminSubRows").innerHTML=adminSubscriptionRows(rows);$("#adminSubsEmpty").classList.toggle("hidden",rows.length>0);iconRefresh();
}
function adminSubscriptionForm(subscription){
  modal(`<form data-admin-form="subscription-edit" data-id="${adminEscape(subscription.id)}"><label>Subscriber<input value="${adminEscape(adminClientName(subscription.userEmail))} · ${adminEscape(subscription.userEmail)}" disabled></label><div class="field-grid"><label>Plan<select name="planId">${adminPlans().map(p=>`<option value="${p.id}" ${subscription.planId===p.id?"selected":""}>${adminEscape(p.name)}</option>`).join("")}</select></label><label>Status<select name="status">${["Active","Expired","Cancelled","Pending"].map(s=>`<option ${adminPlanStatus(subscription)===s?"selected":""}>${s}</option>`).join("")}</select></label><label>Started<input name="startedAt" type="date" required value="${adminEscape(subscription.startedAt||adminToday())}"></label><label>Expires<input name="expiresAt" type="date" value="${adminEscape(subscription.expiresAt||"")}"></label></div><label class="admin-inline-check"><input name="renewalEnabled" type="checkbox" ${subscription.renewalEnabled?"checked":""}> Enable renewal</label><button class="btn btn-primary full" type="submit">Save subscription</button></form>`, "Manage subscription");
}
function adminPaymentsPage(){
  const payments=adminPayments();
  return `${adminHeading("Payment management","Review simulated subscription transactions. No payments are processed here.",`<button class="btn btn-outline btn-small" data-admin-action="payment-report"><i data-lucide="printer"></i> Print report</button>`)}
    <div class="section admin-toolbar"><div class="searchbar"><i data-lucide="search"></i><input id="adminPaymentSearch" placeholder="Search customer or transaction ID"></div><select id="adminPaymentStatus"><option value="all">All payment statuses</option>${["Paid","Pending","Failed","Cancelled"].map(s=>`<option>${s}</option>`).join("")}</select><select id="adminPaymentPlan"><option value="all">All plans</option>${adminPlans().map(p=>`<option value="${p.id}">${adminEscape(p.name)}</option>`).join("")}</select><label class="admin-date-filter">From<input id="adminPaymentFrom" type="date"></label><label class="admin-date-filter">To<input id="adminPaymentTo" type="date"></label></div>
    <div class="section admin-payment-summary">${["Paid","Pending","Failed","Cancelled"].map(status=>{const amount=payments.filter(p=>p.status===status).reduce((sum,p)=>sum+Number(p.amount||0),0);return adminStat(status,`${payments.filter(p=>p.status===status).length} · ${adminMoney(amount)}`,status==="Paid"?"badge-check":status==="Pending"?"clock":status==="Failed"?"circle-alert":"circle-x",status==="Paid"?"Simulated successful payments":"Transaction records")}).join("")}</div>
    <div class="section panel table-wrap"><table class="admin-table"><thead><tr><th>Transaction ID</th><th>Customer</th><th>Subscription</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th><th>Details</th></tr></thead><tbody id="adminPaymentRows">${adminPaymentRows(payments)}</tbody></table><div id="adminPaymentsEmpty" class="empty-state hidden">No transactions match these filters.</div></div>
    <p class="muted-note">Demo transaction records do not represent money collected. Connect a PCI-compliant payment provider and server-side reconciliation before production.</p>`;
}
function adminPaymentRows(payments){
  return payments.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(payment=>`<tr><td><code>${adminEscape(payment.id)}</code></td><td>${adminEscape(payment.customerName||adminClientName(payment.userEmail))}<small class="admin-cell-sub">${adminEscape(payment.userEmail)}</small></td><td>${adminEscape(adminPlanLabel(payment.planId))}</td><td>${adminMoney(payment.amount)}</td><td>${adminEscape(payment.method)}</td><td>${adminEscape(adminFormatDate(payment.date))}</td><td><span class="badge ${payment.status==="Paid"?"":payment.status==="Pending"?"trainer-badge-warn":"trainer-badge-muted"}">${adminEscape(payment.status)}</span></td><td><button class="btn btn-outline btn-small" data-admin-action="payment-view" data-id="${adminEscape(payment.id)}">View / review</button></td></tr>`).join("");
}
function adminFilterPayments(){
  const q=($("#adminPaymentSearch")?.value||"").trim().toLowerCase(),status=$("#adminPaymentStatus")?.value||"all",plan=$("#adminPaymentPlan")?.value||"all",from=$("#adminPaymentFrom")?.value||"",to=$("#adminPaymentTo")?.value||"";
  const rows=adminPayments().filter(payment=>`${payment.id} ${payment.userEmail} ${adminClientName(payment.userEmail)}`.toLowerCase().includes(q)&&(status==="all"||payment.status===status)&&(plan==="all"||payment.planId===plan)&&(!from||payment.date>=from)&&(!to||payment.date<=to));
  $("#adminPaymentRows").innerHTML=adminPaymentRows(rows);$("#adminPaymentsEmpty").classList.toggle("hidden",rows.length>0);iconRefresh();
}
function adminPaymentForm(payment){
  modal(`<form data-admin-form="payment-review" data-id="${adminEscape(payment.id)}"><div class="admin-detail-grid"><div><small>Transaction ID</small><b>${adminEscape(payment.id)}</b></div><div><small>Customer</small><b>${adminEscape(adminClientName(payment.userEmail))}</b></div><div><small>Plan / amount</small><b>${adminEscape(adminPlanLabel(payment.planId))} · ${adminMoney(payment.amount)}</b></div><div><small>Method / date</small><b>${adminEscape(payment.method)} · ${adminEscape(adminFormatDate(payment.date))}</b></div><div><small>Reference</small><b>${adminEscape(payment.reference||"—")}</b></div></div><label>Transaction status<select name="status">${["Paid","Pending","Failed","Cancelled"].map(s=>`<option ${payment.status===s?"selected":""}>${s}</option>`).join("")}</select></label><button class="btn btn-primary full" type="submit">Save transaction review</button></form>`, "Payment details");
}
function adminAnnouncementsPage(){
  const items=adminStoreRead("announcements",[]);
  return `${adminHeading("Announcements","Create and schedule audience-specific platform updates.",`<button class="btn btn-primary btn-small" data-admin-action="announcement-create"><i data-lucide="plus"></i> New announcement</button>`)}
    <div class="section panel admin-announcement-note"><i data-lucide="info"></i><span>Announcements are stored locally for this prototype. Publishing does not send push notifications or email.</span></div>
    <div class="section admin-announcement-list">${items.length?items.slice().sort((a,b)=>b.publishAt.localeCompare(a.publishAt)).map(item=>`<article class="panel admin-announcement-card"><div class="admin-announcement-head"><div><span class="badge">${adminEscape(item.audience)}</span><small>${item.publishAt>new Date().toISOString()?"Scheduled":"Published"} · ${adminEscape(new Date(item.publishAt).toLocaleString())}</small></div><div class="admin-row-actions"><button class="btn btn-outline btn-small" data-admin-action="announcement-edit" data-id="${adminEscape(item.id)}">Edit</button><button class="btn btn-outline btn-small admin-danger" data-admin-action="announcement-delete" data-id="${adminEscape(item.id)}">Delete</button></div></div><h3>${adminEscape(item.title)}</h3><p>${adminEscape(item.message)}</p><small>Created by ${adminEscape(item.author)}</small></article>`).join(""):`<div class="panel empty-state"><i data-lucide="megaphone"></i><p>No announcements yet. Create one to get started.</p></div>`}</div>`;
}
function adminAnnouncementForm(item=null){
  modal(`<form data-admin-form="${item?"announcement-edit":"announcement-create"}" data-id="${adminEscape(item?.id||"")}"><label>Announcement title<input name="title" required maxlength="100" value="${adminEscape(item?.title||"")}"></label><label>Message<textarea name="message" rows="5" required maxlength="1200">${adminEscape(item?.message||"")}</textarea></label><div class="field-grid"><label>Audience<select name="audience">${["All users","PREMIUM members","PRO members","Trainers"].map(a=>`<option ${item?.audience===a?"selected":""}>${a}</option>`).join("")}</select></label><label>Publish date and time<input name="publishAt" type="datetime-local" required value="${adminEscape(item?.publishAt?.slice(0,16)||new Date().toISOString().slice(0,16))}"></label></div><button class="btn btn-primary full" type="submit">${item?"Save announcement":"Schedule announcement"}</button></form>`,item?"Edit announcement":"New announcement");
}
function adminReportsPage(){
  const payments=adminPayments(),users=getUsers().filter(u=>u.role==="user"),subs=adminSubscriptions(),sessions=adminSessionData(),trainers=adminTrainerProfiles();
  return `${adminHeading("Reports & analytics","Filter business activity and print a concise report.",`<button class="btn btn-primary btn-small" data-admin-action="report-print"><i data-lucide="printer"></i> Print report</button>`)}
    <div class="section panel admin-report-filters"><label>Start date<input id="adminReportFrom" type="date"></label><label>End date<input id="adminReportTo" type="date"></label><button class="btn btn-outline btn-small" data-admin-action="report-filter">Apply dates</button><button class="btn btn-outline btn-small" data-admin-action="report-reset">Reset</button></div>
    <div id="adminReportContent"><div class="section admin-stat-grid">${adminStat("Paid revenue",adminMoney(payments.filter(p=>p.status==="Paid").reduce((sum,p)=>sum+Number(p.amount||0),0)),"wallet","Based on recorded demo payments")}${adminStat("Subscription sales",payments.filter(p=>p.status==="Paid").length,"receipt","Successful transactions")}${adminStat("Registered users",users.length,"users","Current account records")}${adminStat("Expired subscriptions",subs.filter(s=>adminPlanStatus(s)==="Expired").length,"calendar-x","Current subscription records")}</div>
    <div class="section admin-dashboard-grid"><div class="panel"><div class="section-head"><h3>Subscription sales by plan</h3></div><div class="table-wrap"><table class="admin-report-plan-table"><thead><tr><th>Plan</th><th>Subscribers</th><th>Paid transactions</th><th>Revenue</th></tr></thead><tbody id="adminReportPlanRows">${adminReportPlanRows(payments,subs)}</tbody></table></div></div>
      <div class="panel"><div class="section-head"><h3>Trainer performance</h3></div>${trainers.map(t=>`<div class="admin-trainer-performance"><img src="${adminEscape(adminUrl(t.photo))}" alt=""><div><b>${adminEscape(t.name)}</b><small>${adminEscape(t.specialty)}</small></div><strong>★ ${Number(t.rating||0).toFixed(1)}</strong><small>${sessions.filter(s=>s.status==="Completed").length} completed sessions</small></div>`).join("")}</div></div>
    <div class="section panel"><div class="section-head"><h3>Recent payment transactions</h3><button data-page="payments">Open payment management</button></div><div class="table-wrap"><table><thead><tr><th>Date</th><th>User</th><th>Plan</th><th>Amount</th><th>Status</th></tr></thead><tbody id="adminReportPaymentRows">${adminPaymentRows(payments)}</tbody></table></div></div>
    <div class="section panel"><div class="section-head"><h3>Popular workout programs</h3></div>${WORKOUTS.slice(0,5).map((w,i)=>`<div class="admin-popular-row"><span class="admin-popular-rank">${i+1}</span><div><b>${adminEscape(w.title)}</b><small>${adminEscape(w.category)}</small></div><span class="badge">Sample program</span></div>`).join("")}</div></div></div>`;
}
function adminReportPlanRows(payments,subs){
  return adminPlans().map(plan=>{
    const paid=payments.filter(payment=>payment.planId===plan.id&&payment.status==="Paid");
    return `<tr><td>${adminEscape(plan.name)}</td><td>${subs.filter(sub=>sub.planId===plan.id&&adminPlanStatus(sub)==="Active").length}</td><td>${paid.length}</td><td>${adminMoney(paid.reduce((sum,payment)=>sum+Number(payment.amount||0),0))}</td></tr>`;
  }).join("");
}
function adminApplyReportFilter(){
  const from=$("#adminReportFrom").value,to=$("#adminReportTo").value;
  if(from&&to&&from>to)return toast("Start date must be on or before end date.");
  const rows=adminPayments().filter(p=>(!from||p.date>=from)&&(!to||p.date<=to));
  const paid=rows.filter(payment=>payment.status==="Paid"),cards=$$("#adminReportContent .admin-stat-grid .stat-card");
  if(cards[0])cards[0].querySelector("strong").textContent=adminMoney(paid.reduce((sum,payment)=>sum+Number(payment.amount||0),0));
  if(cards[1])cards[1].querySelector("strong").textContent=paid.length;
  $("#adminReportPlanRows").innerHTML=adminReportPlanRows(rows,adminSubscriptions());
  $("#adminReportPaymentRows").innerHTML=adminPaymentRows(rows);iconRefresh();toast(`Report filtered to ${rows.length} transaction(s).`);
}
function adminActivityPage(){
  const logs=adminStoreRead("logs",[]);
  return `${adminHeading("Admin activity logs","Review account, trainer, plan, subscription, and payment changes.",`<button class="btn btn-outline btn-small" data-admin-action="logs-clear">Clear activity</button>`)}
    <div class="section panel">${logs.length?logs.map(log=>`<div class="admin-log-row"><span class="stat-icon"><i data-lucide="shield-check"></i></span><div><b>${adminEscape(log.admin)}</b><small>${adminEscape(log.description)}</small></div><time>${new Date(log.date).toLocaleString()}</time></div>`).join(""):`<div class="empty-state"><i data-lucide="list-checks"></i><p>Administrative changes will be recorded here.</p></div>`}</div>`;
}
function adminSystemSettingsPage(){
  const settings=adminStoreRead("settings",{registrationsEnabled:true,supportEmail:"support@fitconnect.demo",maintenanceMode:false});
  return `${adminHeading("System settings","Configure platform-wide prototype settings.")}
    <div class="section admin-dashboard-grid"><div class="panel"><div class="section-head"><h3>Platform settings</h3></div><form data-admin-form="system-settings"><label>Support email<input name="supportEmail" type="email" required value="${adminEscape(settings.supportEmail)}"></label><label class="admin-inline-check"><input name="registrationsEnabled" type="checkbox" ${settings.registrationsEnabled?"checked":""}> Allow new registrations</label><label class="admin-inline-check"><input name="maintenanceMode" type="checkbox" ${settings.maintenanceMode?"checked":""}> Enable maintenance notice</label><button class="btn btn-primary full" type="submit">Save system settings</button></form></div><div class="panel"><h3>Prototype service status</h3><div class="admin-service-row"><span>Local data storage</span><span class="badge">Available</span></div><div class="admin-service-row"><span>Payment gateway</span><span class="badge trainer-badge-muted">Not connected</span></div><div class="admin-service-row"><span>Push / email delivery</span><span class="badge trainer-badge-muted">Not connected</span></div><div class="admin-service-row"><span>Backend permission checks</span><span class="badge trainer-badge-muted">Not implemented</span></div></div></div>`;
}
function adminProfilePage(){
  const profile=adminStoreRead("profile",{name:currentUser.name,email:currentUser.email,title:"Platform Administrator",photo:"",bio:""});
  return `${adminHeading("Admin profile","Update your administrator contact and profile details.",`<button class="btn btn-primary btn-small" data-admin-action="profile-edit"><i data-lucide="pencil"></i> Edit profile</button>`)}
    <div class="section panel admin-own-profile">${adminUrl(profile.photo)?`<img src="${adminEscape(adminUrl(profile.photo))}" alt="">`:`<span class="avatar admin-large-avatar">${initials(profile.name)}</span>`}<div><span class="badge">ADMINISTRATOR</span><h2>${adminEscape(profile.name)}</h2><p>${adminEscape(profile.title)}</p><p>${adminEscape(profile.email)}</p><p>${adminEscape(profile.bio)}</p></div></div>
    <div class="section panel"><div class="section-head"><h3>Account security</h3></div><p class="muted-note">Admin passwords use the existing LocalStorage demo login. Secure credentials and administrative role authorization must be handled by a backend before deployment.</p><button class="btn btn-outline" data-admin-action="profile-password">Change demo password</button></div>`;
}
function adminProfileForm(){
  const profile=adminStoreRead("profile",{name:currentUser.name,email:currentUser.email,title:"Platform Administrator",photo:"",bio:""});
  modal(`<form data-admin-form="admin-profile"><label>Full name<input name="name" required maxlength="80" value="${adminEscape(profile.name)}"></label><label>Email<input name="email" type="email" required value="${adminEscape(profile.email)}"></label><label>Professional title<input name="title" maxlength="80" value="${adminEscape(profile.title)}"></label><label>Profile picture URL<input name="photo" type="url" value="${adminEscape(profile.photo||"")}"></label><label>Biography<textarea name="bio" rows="3" maxlength="400">${adminEscape(profile.bio||"")}</textarea></label><button class="btn btn-primary full" type="submit">Save profile</button></form>`, "Edit admin profile");
}
function adminSaveUser(form,editing){
  const d=new FormData(form),users=getUsers(),previousEmail=form.dataset.email||"",email=String(d.get("email")).trim();
  if(users.some(u=>u.email.toLowerCase()===email.toLowerCase()&&u.email.toLowerCase()!==previousEmail.toLowerCase()))return toast("An account already uses that email.");
  const selectedPlan=String(d.get("plan")||"").toUpperCase();
  const user={name:String(d.get("name")).trim(),email,role:"user",age:Number(d.get("age"))||"",goal:String(d.get("goal")||"Keep Fit").trim(),plan:adminPlanById(selectedPlan)?selectedPlan:adminCanonicalPlan(selectedPlan),createdAt:adminToday()};
  if(!user.name||!email)return toast("Enter a name and a valid email address.");
  const meta=adminUserMeta(),oldMeta=meta[previousEmail.toLowerCase()]||{};
  meta[email.toLowerCase()]={...oldMeta,createdAt:oldMeta.createdAt||adminToday(),assignedTrainer:String(d.get("assignedTrainer")||""),photo:adminUrl(d.get("photo")),status:oldMeta.status||"Active"};
  if(editing){
    const index=users.findIndex(u=>u.email.toLowerCase()===previousEmail.toLowerCase());if(index<0)return toast("User account was not found.");
    const existing=users[index];users[index]={...existing,...user,email,createdAt:existing.createdAt||adminUserCreated(existing)};
    if(previousEmail.toLowerCase()!==email.toLowerCase()){
      delete meta[previousEmail.toLowerCase()];
      adminStoreWrite("subscriptions",adminSubscriptions().map(s=>s.userEmail.toLowerCase()===previousEmail.toLowerCase()?{...s,userEmail:email}:s));
      adminStoreWrite("payments",adminPayments().map(p=>p.userEmail.toLowerCase()===previousEmail.toLowerCase()?{...p,userEmail:email}:p));
    }
    if(user.plan!==adminSubscriptionFor(email)?.planId)adminSetSubscriptionFor(email,user.plan,"Active");
  }else{
    if(users.some(u=>u.email.toLowerCase()===email.toLowerCase()))return toast("An account already uses that email.");
    user.password=String(d.get("password")||"demo123");user.id=adminUserId(email);user.createdAt=new Date().toISOString();users.push(user);
    const subs=adminSubscriptions();subs.push({id:adminId("sub"),userEmail:email,planId:user.plan,status:"Active",startedAt:adminToday(),expiresAt:user.plan==="FREE"?"":adminDateOffset(Number(adminPlanById(user.plan)?.durationDays)||30),renewalEnabled:user.plan!=="FREE",history:[]});adminStoreWrite("subscriptions",subs);
  }
  Store.set("users",users);adminStoreWrite("userMeta",meta);
  adminLogActivity(`${editing?"Updated":"Created"} user account for ${user.name}.`);
  closeModal();renderPage("users");toast(editing?"User details saved.":"User account created.");
}
function adminSetSubscriptionFor(email,planId,status="Active",expiresAt=""){
  const subscriptions=adminSubscriptions(),index=subscriptions.findIndex(s=>s.userEmail.toLowerCase()===email.toLowerCase()),plan=adminPlanById(planId)||adminPlanById("FREE"),old=index>=0?subscriptions[index]:null;
  const record={...(old||{}),id:old?.id||adminId("sub"),userEmail:email,planId:plan.id,status,startedAt:old?.startedAt||adminToday(),expiresAt:expiresAt||(status==="Active"&&plan.id!=="FREE"?adminDateOffset(Number(plan.durationDays)||30):""),renewalEnabled:status==="Active"&&plan.id!=="FREE",history:old?.history||[]};
  if(old){record.history=[...old.history,{from:old.planId,to:plan.id,date:new Date().toISOString()}];subscriptions[index]=record;}else subscriptions.push(record);
  adminStoreWrite("subscriptions",subscriptions);
  const users=getUsers().map(user=>user.email.toLowerCase()===email.toLowerCase()?{...user,plan:plan.id}:user);Store.set("users",users);
  return record;
}
function adminTrainerActionStatus(id,status){
  const profiles=adminTrainerProfiles(),trainer=profiles.find(t=>t.id===id);if(!trainer)return toast("Trainer profile was not found.");
  if(["Verified","Rejected","Pending Verification"].includes(status))trainer.verification=status;
  if(status==="Suspended"){trainer.verification="Suspended";trainer.accountStatus="Suspended";}
  if(status==="Active"){trainer.accountStatus="Active";if(trainer.verification==="Suspended")trainer.verification="Verified";}
  adminStoreWrite("trainerProfiles",profiles);
  const meta=adminUserMeta(),account=getUsers().find(u=>u.email.toLowerCase()===trainer.email.toLowerCase());
  if(account){meta[trainer.email.toLowerCase()]={...(meta[trainer.email.toLowerCase()]||{}),status:trainer.accountStatus};adminStoreWrite("userMeta",meta);}
  adminLogActivity(`${currentUser.name} set trainer ${trainer.name} to ${status}.`);
  renderPage("adminTrainers");toast(`Trainer status updated: ${status}.`);
}
function adminSaveTrainer(form,editing){
  const d=new FormData(form),profiles=adminTrainerProfiles(),id=form.dataset.id;
  const trainer={id:editing?id:adminId("trainer"),name:String(d.get("name")).trim(),email:String(d.get("email")).trim(),certifications:String(d.get("certifications")).trim(),specialty:String(d.get("specialty")).trim(),experience:String(d.get("experience")).trim(),rating:Number(d.get("rating"))||0,clients:Number(d.get("clients"))||0,verification:String(d.get("verification")),accountStatus:String(d.get("accountStatus")),photo:adminUrl(d.get("photo"))};
  if(!trainer.name||!trainer.email||!trainer.certifications||!trainer.specialty)return toast("Complete the trainer's name, email, certification, and specialization.");
  if(profiles.some(t=>t.email.toLowerCase()===trainer.email.toLowerCase()&&t.id!==id))return toast("A trainer profile already uses this email.");
  if(editing){const index=profiles.findIndex(t=>t.id===id);if(index<0)return toast("Trainer profile was not found.");profiles[index]={...profiles[index],...trainer};}
  else profiles.push(trainer);
  adminStoreWrite("trainerProfiles",profiles);
  const account=getUsers().find(u=>u.email.toLowerCase()===trainer.email.toLowerCase());
  if(account){const meta=adminUserMeta();meta[trainer.email.toLowerCase()]={...(meta[trainer.email.toLowerCase()]||{}),status:trainer.accountStatus};adminStoreWrite("userMeta",meta);}
  adminLogActivity(`${editing?"Updated":"Added"} trainer profile for ${trainer.name}.`);
  closeModal();renderPage("adminTrainers");toast(editing?"Trainer profile updated.":"Trainer profile created.");
}
function adminSavePlan(form,editing){
  const d=new FormData(form),plans=adminPlans(),id=String(d.get("id")||"").trim().toUpperCase(),oldId=form.dataset.id;
  const benefits=String(d.get("benefits")||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean),entitlements=d.getAll("entitlements").map(String);
  const plan={id,name:String(d.get("name")).trim().toUpperCase(),price:Number(d.get("price")),durationDays:Number(d.get("durationDays")),discount:Number(d.get("discount"))||0,coachingSessions:Number(d.get("coachingSessions"))||0,description:String(d.get("description")).trim(),benefits,entitlements,active:d.get("active")==="on"};
  if(!plan.id||!plan.name||!plan.description||!benefits.length||!Number.isFinite(plan.price)||plan.price<0||plan.durationDays<0||plan.discount<0||plan.discount>90)return toast("Complete plan details using valid price, duration, and benefits.");
  if(plans.some(p=>p.id===plan.id&&p.id!==oldId))return toast("A plan already uses that ID.");
  if(editing){const index=plans.findIndex(p=>p.id===oldId);if(index<0)return toast("Subscription plan was not found.");plans[index]={...plans[index],...plan,id:oldId};}
  else plans.push(plan);
  adminStoreWrite("plans",plans);adminLogActivity(`${editing?"Changed":"Created"} ${plan.name} subscription plan (${adminMoney(plan.price)}).`);
  closeModal();renderPage("subscriptionManagement");toast(editing?"Plan configuration saved.":"Subscription plan created.");
}
function adminSaveSubscription(form){
  const subs=adminSubscriptions(),sub=subs.find(s=>s.id===form.dataset.id);if(!sub)return toast("Subscription record was not found.");
  const d=new FormData(form),oldPlan=sub.planId,planId=String(d.get("planId")),status=String(d.get("status"));
  sub.planId=planId;sub.status=status;sub.startedAt=String(d.get("startedAt"));sub.expiresAt=String(d.get("expiresAt")||"");sub.renewalEnabled=d.get("renewalEnabled")==="on"&&status==="Active"&&planId!=="FREE";
  sub.history=[...(sub.history||[]),{from:oldPlan,to:planId,date:new Date().toISOString()}];adminStoreWrite("subscriptions",subs);
  const users=getUsers().map(user=>user.email.toLowerCase()===sub.userEmail.toLowerCase()?{...user,plan:planId}:user);Store.set("users",users);
  adminLogActivity(`Updated ${adminClientName(sub.userEmail)} subscription to ${adminPlanLabel(planId)} (${status}).`);
  closeModal();renderPage("subscriptionMonitoring");toast("Subscription record updated.");
}
function adminSavePayment(form){
  const payments=adminPayments(),payment=payments.find(p=>p.id===form.dataset.id);if(!payment)return toast("Transaction was not found.");
  const old=payment.status;payment.status=String(new FormData(form).get("status"));adminStoreWrite("payments",payments);
  if(payment.status==="Paid"&&old!=="Paid")adminSetSubscriptionFor(payment.userEmail,payment.planId,"Active");
  adminLogActivity(`Reviewed ${payment.id}: ${old} → ${payment.status}.`);
  closeModal();renderPage("payments");toast("Payment record review saved. It remains a simulated transaction.");
}
function adminSaveAnnouncement(form,editing){
  const items=adminStoreRead("announcements",[]),d=new FormData(form),id=form.dataset.id;
  const item={id:editing?id:adminId("announcement"),title:String(d.get("title")).trim(),message:String(d.get("message")).trim(),audience:String(d.get("audience")),publishAt:new Date(String(d.get("publishAt"))).toISOString(),author:currentUser.name};
  if(!item.title||!item.message||Number.isNaN(new Date(item.publishAt).getTime()))return toast("Enter an announcement title, message, and valid publish date.");
  if(editing){const index=items.findIndex(x=>x.id===id);if(index<0)return toast("Announcement was not found.");items[index]={...items[index],...item};}else items.unshift(item);
  adminStoreWrite("announcements",items);adminLogActivity(`${editing?"Edited":"Created"} announcement "${item.title}" for ${item.audience}.`);
  closeModal();renderPage("announcements");toast(editing?"Announcement updated.":"Announcement saved.");
}
function adminSubmitForm(form){
  const kind=form.dataset.adminForm;
  if(kind==="account-role"){
    const email=form.dataset.email,user=getUsers().find(item=>item.email.toLowerCase()===String(email).toLowerCase());
    if(!user)return toast("Account was not found.");
    const role=String(new FormData(form).get("role"));
    if(!["user","trainer","admin"].includes(role))return toast("Choose a valid account role.");
    if(user.email.toLowerCase()===currentUser.email.toLowerCase()&&role!=="admin")return toast("You cannot remove your own administrator access.");
    const users=getUsers().map(item=>item.email.toLowerCase()===user.email.toLowerCase()?{...item,role}:item);
    Store.set("users",users);adminLogActivity(`Changed ${user.name}'s account role to ${adminRoleLabel(role)}.`);
    closeModal();renderPage("users");return toast("Account role updated.");
  }
  if(kind==="user-create")return adminSaveUser(form,false);
  if(kind==="user-edit")return adminSaveUser(form,true);
  if(kind==="trainer-create")return adminSaveTrainer(form,false);
  if(kind==="trainer-edit")return adminSaveTrainer(form,true);
  if(kind==="plan-create")return adminSavePlan(form,false);
  if(kind==="plan-edit")return adminSavePlan(form,true);
  if(kind==="subscription-edit")return adminSaveSubscription(form);
  if(kind==="payment-review")return adminSavePayment(form);
  if(kind==="announcement-create")return adminSaveAnnouncement(form,false);
  if(kind==="announcement-edit")return adminSaveAnnouncement(form,true);
  if(kind==="system-settings"){
    const d=new FormData(form),settings={supportEmail:String(d.get("supportEmail")).trim(),registrationsEnabled:d.get("registrationsEnabled")==="on",maintenanceMode:d.get("maintenanceMode")==="on"};
    if(!settings.supportEmail)return toast("Enter a valid support email.");
    adminStoreWrite("settings",settings);adminLogActivity("Updated system settings.");closeModal();renderPage("systemSettings");return toast("System settings saved.");
  }
  if(kind==="admin-profile"){
    const d=new FormData(form),profile={name:String(d.get("name")).trim(),email:String(d.get("email")).trim(),title:String(d.get("title")).trim(),photo:adminUrl(d.get("photo")),bio:String(d.get("bio")).trim()};
    if(!profile.name||!profile.email)return toast("Enter your name and email address.");
    const users=getUsers(),oldEmail=currentUser.email;
    if(profile.email.toLowerCase()!==oldEmail.toLowerCase()&&users.some(u=>u.email.toLowerCase()===profile.email.toLowerCase()))return toast("That email address is already associated with an account.");
    currentUser.name=profile.name;currentUser.email=profile.email;Store.set("users",users.map(u=>u.email.toLowerCase()===oldEmail.toLowerCase()?{...u,name:profile.name,email:profile.email}:u));Store.set("session",{email:profile.email});
    adminStoreWrite("profile",profile);adminLogActivity("Updated administrator profile.");closeModal();renderPage("adminProfile");return toast("Admin profile updated.");
  }
  if(kind==="admin-password"){
    const d=new FormData(form),user=getUsers().find(u=>u.email.toLowerCase()===currentUser.email.toLowerCase());
    if(!user||d.get("currentPassword")!==user.password)return toast("Current password is incorrect.");
    if(String(d.get("newPassword")).length<6||d.get("newPassword")!==d.get("confirmPassword"))return toast("New passwords must match and contain at least 6 characters.");
    user.password=String(d.get("newPassword"));Store.set("users",getUsers());form.reset();adminLogActivity("Changed demo admin password.");return toast("Demo password updated on this device.");
  }
}
function adminAction(name,data={}){
  const id=data.id,email=data.email;
  if(name==="logout")return action("logout");
  if(name==="role-edit"){
    const user=getUsers().find(item=>item.email.toLowerCase()===String(email).toLowerCase());
    if(!user)return toast("Account was not found.");
    if(user.email.toLowerCase()===currentUser.email.toLowerCase())return toast("You cannot change your own administrator role.");
    return adminRoleForm(user);
  }
  if(name==="user-add")return adminUserForm();
  if(name==="user-edit"){const user=getUsers().find(u=>u.email.toLowerCase()===String(email).toLowerCase());return user?adminUserForm(user):toast("User account was not found.");}
  if(name==="user-view")return adminViewUser(email);
  if(name==="user-subscription"){const sub=adminSubscriptionFor(email);return sub?adminSubscriptionForm(sub):toast("Subscription record was not found.");}
  if(name==="user-toggle"){
    const user=getUsers().find(u=>u.email.toLowerCase()===String(email).toLowerCase());if(!user)return toast("User account was not found.");
    const meta=adminUserMeta(),status=adminUserStatus(user)==="Active"?"Deactivated":"Active";
    if(!confirm(`${status==="Active"?"Activate":"Deactivate"} ${user.name}'s account?`))return;
    meta[user.email.toLowerCase()]={...(meta[user.email.toLowerCase()]||{}),status};adminStoreWrite("userMeta",meta);
    adminLogActivity(`${status==="Active"?"Activated":"Deactivated"} user account for ${user.name}.`);renderPage("users");return toast(`User account ${status.toLowerCase()}.`);
  }
  if(name==="user-archive"){
    const user=getUsers().find(u=>u.email.toLowerCase()===String(email).toLowerCase());if(!user)return toast("User account was not found.");
    if(!confirm(`Archive ${user.name}'s account? It will be deactivated but retained.`))return;
    const meta=adminUserMeta();meta[user.email.toLowerCase()]={...(meta[user.email.toLowerCase()]||{}),status:"Archived"};adminStoreWrite("userMeta",meta);
    adminStoreWrite("archivedUsers",[...adminStoreRead("archivedUsers",[]),{email:user.email,name:user.name,date:new Date().toISOString()}]);adminLogActivity(`Archived user account for ${user.name}.`);renderPage("users");return toast("User account archived.");
  }
  if(name==="user-delete"){
    const user=getUsers().find(u=>u.email.toLowerCase()===String(email).toLowerCase());if(!user)return toast("User account was not found.");
    if(!confirm(`Permanently delete ${user.name}'s local account and subscription record?`))return;
    Store.set("users",getUsers().filter(u=>u.email.toLowerCase()!==user.email.toLowerCase()));
    adminStoreWrite("subscriptions",adminSubscriptions().filter(s=>s.userEmail.toLowerCase()!==user.email.toLowerCase()));
    adminStoreWrite("userMeta",Object.fromEntries(Object.entries(adminUserMeta()).filter(([key])=>key!==user.email.toLowerCase())));
    adminStoreWrite("payments",adminPayments().map(p=>p.userEmail.toLowerCase()===user.email.toLowerCase()?{...p,customerName:user.name,userEmail:"deleted-account"}:p));
    adminLogActivity(`Deleted user account for ${user.name}.`);renderPage("users");return toast("User account deleted. Historical transactions were retained.");
  }
  if(name==="trainer-new")return adminTrainerForm();
  if(name==="trainer-edit"||name==="trainer-view"){
    const trainer=adminTrainerProfiles().find(t=>t.id===id);if(!trainer)return toast("Trainer profile was not found.");
    if(name==="trainer-edit")return adminTrainerForm(trainer);
    modal(`<div class="admin-user-detail"><img src="${adminEscape(adminUrl(trainer.photo))}" alt=""><div><h2>${adminEscape(trainer.name)}</h2><p>${adminEscape(trainer.specialty)}</p><span class="badge">${adminEscape(trainer.verification)}</span></div></div><div class="admin-detail-grid"><div><small>Certification</small><b>${adminEscape(trainer.certifications)}</b></div><div><small>Experience</small><b>${adminEscape(trainer.experience)}</b></div><div><small>Rating / reviews</small><b>★ ${Number(trainer.rating||0).toFixed(1)} · ${Number(trainer.reviews||0)} reviews</b></div><div><small>Assigned clients</small><b>${Number(trainer.clients)||0}</b></div><div><small>Account status</small><b>${adminEscape(trainer.accountStatus)}</b></div></div><div class="admin-modal-actions"><button class="btn btn-outline" data-admin-action="trainer-edit" data-id="${adminEscape(trainer.id)}">Edit trainer</button>${trainer.verification==="Pending Verification"?`<button class="btn btn-primary" data-admin-action="trainer-approve" data-id="${adminEscape(trainer.id)}">Approve</button>`:""}</div>`, "Trainer profile and verification");
    return;
  }
  if(name==="trainer-approve"||name==="trainer-reject"){
    const trainer=adminTrainerProfiles().find(t=>t.id===id);if(!trainer)return toast("Trainer profile was not found.");
    const status=name==="trainer-approve"?"Verified":"Rejected";
    if(!confirm(`${status} trainer ${trainer.name}?`))return;
    return adminTrainerActionStatus(id,status);
  }
  if(name==="trainer-toggle"){
    const trainer=adminTrainerProfiles().find(t=>t.id===id);if(!trainer)return toast("Trainer profile was not found.");
    const status=trainer.accountStatus==="Active"?"Suspended":"Active";
    if(!confirm(`${status==="Suspended"?"Suspend":"Activate"} trainer ${trainer.name}?`))return;
    trainer.accountStatus=status;return adminTrainerActionStatus(id,status);
  }
  if(name==="plan-create")return adminPlanForm();
  if(name==="plan-edit"){const plan=adminPlanById(id);return plan?adminPlanForm(plan):toast("Subscription plan was not found.");}
  if(name==="plan-toggle"){
    const plans=adminPlans(),plan=plans.find(p=>p.id===id);if(!plan)return toast("Subscription plan was not found.");
    if(!confirm(`${plan.active?"Deactivate":"Activate"} the ${plan.name} plan?`))return;
    plan.active=!plan.active;adminStoreWrite("plans",plans);adminLogActivity(`${plan.active?"Activated":"Deactivated"} ${plan.name} plan availability.`);renderPage("subscriptionManagement");return toast(`Plan ${plan.active?"activated":"deactivated"}.`);
  }
  if(name==="plan-delete"){
    const plan=adminPlanById(id);if(!plan)return toast("Subscription plan was not found.");
    if(adminSubscriptions().some(s=>s.planId===id)||adminPayments().some(payment=>payment.planId===id))return toast("This plan has subscription or transaction history. Deactivate it instead to preserve records.");
    if(!confirm(`Delete the ${plan.name} plan and its configured benefits?`))return;
    adminStoreWrite("plans",adminPlans().filter(p=>p.id!==id));adminLogActivity(`Deleted ${plan.name} subscription plan.`);renderPage("subscriptionManagement");return toast("Plan deleted.");
  }
  if(name==="subscription-edit"){const sub=adminSubscriptions().find(s=>s.id===id);return sub?adminSubscriptionForm(sub):toast("Subscription was not found.");}
  if(name==="subscription-cancel"){
    const subs=adminSubscriptions(),sub=subs.find(s=>s.id===id);if(!sub)return toast("Subscription was not found.");
    if(!confirm(`Cancel ${adminClientName(sub.userEmail)}'s ${adminPlanLabel(sub.planId)} subscription?`))return;
    sub.status="Cancelled";sub.renewalEnabled=false;adminStoreWrite("subscriptions",subs);adminLogActivity(`Cancelled ${adminClientName(sub.userEmail)}'s ${adminPlanLabel(sub.planId)} subscription.`);renderPage("subscriptionMonitoring");return toast("Subscription cancelled.");
  }
  if(name==="subscription-renew"){
    const subs=adminSubscriptions(),sub=subs.find(s=>s.id===id);if(!sub)return toast("Subscription was not found.");
    sub.status="Active";sub.startedAt=adminToday();sub.expiresAt=adminDateOffset(Number(adminPlanById(sub.planId)?.durationDays)||30);sub.renewalEnabled=true;adminStoreWrite("subscriptions",subs);
    adminLogActivity(`Renewed ${adminClientName(sub.userEmail)}'s ${adminPlanLabel(sub.planId)} subscription.`);renderPage("subscriptionMonitoring");return toast("Subscription renewal recorded as a demo action.");
  }
  if(name==="payment-view"){const payment=adminPayments().find(p=>p.id===id);return payment?adminPaymentForm(payment):toast("Transaction was not found.");}
  if(name==="payment-report"){renderPage("adminReports");return toast("Open the report module to print filtered transactions.");}
  if(name==="report-print"){window.print();return;}
  if(name==="report-filter")return adminApplyReportFilter();
  if(name==="report-reset"){if($("#adminReportFrom"))$("#adminReportFrom").value="";if($("#adminReportTo"))$("#adminReportTo").value="";return adminApplyReportFilter();}
  if(name==="announcement-create")return adminAnnouncementForm();
  if(name==="announcement-edit"){const item=adminStoreRead("announcements",[]).find(x=>x.id===id);return item?adminAnnouncementForm(item):toast("Announcement was not found.");}
  if(name==="announcement-delete"){
    const items=adminStoreRead("announcements",[]),item=items.find(x=>x.id===id);if(!item)return toast("Announcement was not found.");
    if(!confirm(`Delete announcement "${item.title}"?`))return;
    adminStoreWrite("announcements",items.filter(x=>x.id!==id));adminLogActivity(`Deleted announcement "${item.title}".`);renderPage("announcements");return toast("Announcement deleted.");
  }
  if(name==="logs-clear"){
    if(!confirm("Clear all locally recorded admin activity logs?"))return;
    adminStoreWrite("logs",[]);renderPage("activityLogs");return toast("Activity logs cleared.");
  }
  if(name==="profile-edit")return adminProfileForm();
  if(name==="profile-password")return modal(`<form data-admin-form="admin-password"><label>Current password<input name="currentPassword" type="password" required autocomplete="current-password"></label><label>New password<input name="newPassword" type="password" minlength="6" required autocomplete="new-password"></label><label>Confirm new password<input name="confirmPassword" type="password" minlength="6" required autocomplete="new-password"></label><button class="btn btn-primary full" type="submit">Update demo password</button></form><p class="muted-note">Password changes in this demo are stored in browser LocalStorage and are not secure.</p>`, "Change administrator password");
}

document.addEventListener("click",event=>{
  const control=event.target.closest("[data-admin-action]");
  if(!control||currentUser?.role!=="admin")return;
  event.preventDefault();
  event.stopPropagation();
  adminAction(control.dataset.adminAction,{
    id:control.dataset.id,
    email:control.dataset.email
  });
});
document.addEventListener("input",event=>{
  if(event.target.matches("#adminUserSearch"))adminFilterUsers();
  if(event.target.matches("#adminTrainerSearch"))adminFilterTrainers();
  if(event.target.matches("#adminSubSearch"))adminFilterSubscriptions();
  if(event.target.matches("#adminPaymentSearch"))adminFilterPayments();
});
document.addEventListener("change",event=>{
  if(event.target.matches("#adminUserPlanFilter,#adminUserStatusFilter"))adminFilterUsers();
  if(event.target.matches("#adminTrainerStatus"))adminFilterTrainers();
  if(event.target.matches("#adminSubStatus,#adminSubPlan"))adminFilterSubscriptions();
  if(event.target.matches("#adminPaymentStatus,#adminPaymentPlan,#adminPaymentFrom,#adminPaymentTo"))adminFilterPayments();
});
document.addEventListener("submit",event=>{
  const form=event.target.closest("[data-admin-form]");
  if(form){event.preventDefault();adminSubmitForm(form);}
});
document.addEventListener("submit",event=>{
  if(event.target.id==="registerForm"){
    const settings=adminStoreRead("settings",{registrationsEnabled:true});
    if(settings.registrationsEnabled===false){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();toast("New account registration is currently disabled.");}
  }
},true);

if(currentUser?.role==="admin")renderPage("adminDashboard");
else if(currentUser?.role==="user")renderPage(currentPage||"training");

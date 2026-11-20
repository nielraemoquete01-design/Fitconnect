/* Local prototype storage. Do not use this to store real credentials or sensitive data. */
const Store = {
  get(key, fallback=null){ try { const v=localStorage.getItem("fitconnect_"+key); return v===null?fallback:JSON.parse(v); } catch(e){ return fallback; } },
  set(key,value){ localStorage.setItem("fitconnect_"+key,JSON.stringify(value)); },
  remove(key){ localStorage.removeItem("fitconnect_"+key); }
};
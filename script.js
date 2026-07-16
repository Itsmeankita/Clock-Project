(function(){
"use strict";

/* ================= STORAGE / SETTINGS ================= */
const LS = {
  settings:'clock_settings_v1', cities:'clock_cities_v1', alarms:'clock_alarms_v1', events:'clock_events_v1',
  countdowns:'clock_countdowns_v1', todos:'clock_todos_v1', habits:'clock_habits_v1', goals:'clock_goals_v1',
  journal:'clock_journal_v1', notes:'clock_notes_v1', clips:'clock_clips_v1', meds:'clock_meds_v1',
  sleep:'clock_sleep_v1', pomo:'clock_pomo_v1', usage:'clock_usage_v1', water:'clock_water_v1'
};
function load(key, def){ try{ return JSON.parse(localStorage.getItem(key)) ?? def; }catch(e){ return def; } }
function save(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){} }

let settings = Object.assign({ theme:'glass', autoTheme:false, particles:true, sound:true, vibrate:true, lang:'en', font:1 }, load(LS.settings, {}));
function saveSettings(){ save(LS.settings, settings); }

function applyTheme(){
  document.documentElement.dataset.theme = settings.theme;
  document.documentElement.style.setProperty('--font-scale', settings.font);
}
applyTheme();

function beep(freq){
  if(!settings.sound) return;
  try{
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type='sine'; o.frequency.value=freq||680; g.gain.value=0.05;
    o.connect(g); g.connect(ctx.destination); o.start();
    setTimeout(()=>{ o.stop(); ctx.close(); }, 120);
  }catch(e){}
}
function vibrate(p){ if(settings.vibrate && navigator.vibrate) navigator.vibrate(p||15); }
function toast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),1500); }
function logUsage(tool){ const u = load(LS.usage, {}); const day = new Date().toDateString(); u[day]=u[day]||{}; u[day][tool]=(u[day][tool]||0)+1; save(LS.usage,u); }

/* notifications */
function notify(title, body){
  if('Notification' in window && Notification.permission==='granted'){
    try{ new Notification(title, {body}); }catch(e){}
  } else { toast(title+': '+body); }
}
document.getElementById('notifyBtn').addEventListener('click', ()=>{
  if('Notification' in window) Notification.requestPermission().then(p=> toast('Notifications: '+p));
  else toast('Browser notifications supported nahi hai');
});
document.getElementById('fullscreenBtn').addEventListener('click', ()=>{
  if(!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
  else document.exitFullscreen();
});

/* ================= TABS ================= */
document.querySelectorAll('#mainTabs .tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('#mainTabs .tab-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    document.getElementById('view-'+btn.dataset.view).classList.add('active');
    logUsage(btn.dataset.view);
  });
});
function openOverlay(id){ document.getElementById(id).classList.add('show'); }
function closeOverlay(id){ document.getElementById(id).classList.remove('show'); }
document.getElementById('openDashboard').addEventListener('click', ()=>{ renderDashboard(); openOverlay('dashboardOverlay'); });
document.getElementById('openSettings').addEventListener('click', ()=> openOverlay('settingsOverlay'));
document.querySelectorAll('[data-close]').forEach(b=> b.addEventListener('click', ()=> closeOverlay(b.dataset.close)));
document.querySelectorAll('.overlay').forEach(o=> o.addEventListener('click', (e)=>{ if(e.target===o && o.id!=='ringingOverlay') o.classList.remove('show'); }));

/* ================= PARTICLE BACKGROUND ================= */
const canvas = document.getElementById('particleCanvas'); const ctx2d = canvas.getContext('2d');
let particles = [];
function resizeCanvas(){ canvas.width = innerWidth; canvas.height = innerHeight; }
resizeCanvas(); window.addEventListener('resize', resizeCanvas);
function initParticles(){ particles = Array.from({length:60}, ()=>({ x:Math.random()*canvas.width, y:Math.random()*canvas.height, r:Math.random()*1.8+0.5, vx:(Math.random()-0.5)*0.3, vy:(Math.random()-0.5)*0.3 })); }
initParticles();
function animateParticles(){
  ctx2d.clearRect(0,0,canvas.width,canvas.height);
  if(settings.particles){
    const style = getComputedStyle(document.documentElement).getPropertyValue('--accent-2').trim() || '#5eb4ff';
    particles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>canvas.width) p.vx*=-1;
      if(p.y<0||p.y>canvas.height) p.vy*=-1;
      ctx2d.beginPath(); ctx2d.arc(p.x,p.y,p.r,0,7); ctx2d.fillStyle = style+'55'; ctx2d.fill();
    });
  }
  requestAnimationFrame(animateParticles);
}
animateParticles();

/* ================= CLOCK ================= */
let use24 = false, showMs = false, clockMode='digital';
document.getElementById('fmt12').addEventListener('click', ()=>{ use24=false; togg('fmt12','fmt24'); });
document.getElementById('fmt24').addEventListener('click', ()=>{ use24=true; togg('fmt24','fmt12'); });
function togg(a,b){ document.getElementById(a).classList.add('active'); document.getElementById(b).classList.remove('active'); }
document.getElementById('msToggle').addEventListener('click', (e)=>{ showMs=!showMs; e.target.textContent = 'MS: '+(showMs?'ON':'OFF'); e.target.classList.toggle('active',showMs); });
document.querySelectorAll('[data-clockmode]').forEach(b=>{
  b.addEventListener('click', ()=>{
    document.querySelectorAll('[data-clockmode]').forEach(x=>x.classList.remove('active')); b.classList.add('active');
    clockMode = b.dataset.clockmode;
    document.getElementById('digitalBlock').style.display = clockMode==='digital' ? 'block':'none';
    document.getElementById('analogBlock').style.display = clockMode==='analog' ? 'flex':'none';
  });
});

const ticks = document.getElementById('analogTicks');
for(let i=0;i<12;i++){
  const a = i*30*Math.PI/180;
  const x1=100+80*Math.sin(a), y1=100-80*Math.cos(a), x2=100+90*Math.sin(a), y2=100-90*Math.cos(a);
  ticks.innerHTML += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--muted)" stroke-width="2"/>`;
}

const quotes = ["Time you enjoy wasting is not wasted time.","Discipline beats motivation, every single day.","Small steps daily beat big leaps rarely.","Aaj ka kaam kal pe mat taalo.","Focus on progress, not perfection.","Har second important hai — use it well.","Consistency is the real superpower."];
document.getElementById('quoteBox').textContent = '"'+quotes[new Date().getDate()%quotes.length]+'"';

function updateGreeting(h){
  const name='Dost';
  let g = h<5?'Good Night':h<12?'Good Morning':h<17?'Good Afternoon':h<21?'Good Evening':'Good Night';
  document.getElementById('greeting').innerHTML = `${g} 👋, <b>${name}</b>`;
  if(settings.autoTheme){
    const t = h<6?'matrix':h<12?'light':h<18?'glass':h<21?'sunset':'neon';
    settings.theme=t; applyTheme();
  }
}

function tickClock(){
  const now = new Date();
  const h24 = now.getHours(), m=now.getMinutes(), s=now.getSeconds(), ms=now.getMilliseconds();
  let hDisp = use24 ? h24 : (h24%12===0?12:h24%12);
  const ampm = h24<12?'AM':'PM';
  let timeStr = String(hDisp).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0') + (use24?'':' '+ampm);
  document.getElementById('bigTime').innerHTML = timeStr + (showMs ? ' <span class="digital-ms">.'+String(ms).padStart(3,'0')+'</span>' : '');
  document.getElementById('bigDate').textContent = now.toLocaleDateString(undefined,{weekday:'long', year:'numeric', month:'long', day:'numeric'});
  document.getElementById('tzName').textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offMin = -now.getTimezoneOffset();
  document.getElementById('utcOffset').textContent = 'UTC'+(offMin>=0?'+':'')+(offMin/60).toFixed(1);

  const hAngle = (h24%12+m/60)*30, mAngle=(m+s/60)*6, sAngle=s*6;
  document.getElementById('hourHand').setAttribute('transform', `rotate(${hAngle} 100 100)`);
  document.getElementById('minHand').setAttribute('transform', `rotate(${mAngle} 100 100)`);
  document.getElementById('secHand').setAttribute('transform', `rotate(${sAngle} 100 100)`);

  updateGreeting(h24);
  renderFunClocks(h24,m,s);
  checkAlarms(now);
}
setInterval(tickClock, 200); tickClock();

/* battery + network */
if(navigator.getBattery){ navigator.getBattery().then(b=>{
  function upd(){ document.getElementById('battStat').textContent = Math.round(b.level*100)+'%'+(b.charging?' ⚡':''); }
  upd(); b.addEventListener('levelchange', upd); b.addEventListener('chargingchange', upd);
});}
function updNet(){ document.getElementById('netStat').textContent = navigator.onLine ? 'Online' : 'Offline'; }
updNet(); window.addEventListener('online', updNet); window.addEventListener('offline', updNet);

/* weather + sun (open-meteo, no key) */
document.getElementById('weatherBtn').addEventListener('click', ()=>{
  const out = document.getElementById('weatherOut');
  if(!navigator.geolocation){ out.textContent='Geolocation supported nahi hai'; return; }
  out.textContent = 'Location le rahe hain...';
  navigator.geolocation.getCurrentPosition(pos=>{
    const {latitude, longitude} = pos.coords;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=sunrise,sunset&timezone=auto`)
      .then(r=>r.json()).then(d=>{
        const cw = d.current_weather;
        out.innerHTML = `🌡 ${cw.temperature}°C, wind ${cw.windspeed} km/h<br>🌅 Sunrise: ${d.daily.sunrise[0].split('T')[1]} &nbsp; 🌇 Sunset: ${d.daily.sunset[0].split('T')[1]}`;
      }).catch(()=>{ out.textContent='Weather load nahi hui'; });
  }, ()=>{ out.textContent='Location permission denied'; });
});

/* moon phase (algorithmic) */
(function(){
  const now = new Date();
  const lp = 2551443; // synodic month in seconds
  const newMoonRef = new Date(2000,0,6,18,14,0).getTime()/1000;
  const phase = ((now.getTime()/1000 - newMoonRef) % lp + lp) % lp;
  const idx = Math.floor(phase/lp*8);
  const names = ['🌑 New Moon','🌒 Waxing Crescent','🌓 First Quarter','🌔 Waxing Gibbous','🌕 Full Moon','🌖 Waning Gibbous','🌗 Last Quarter','🌘 Waning Crescent'];
  document.getElementById('moonOut').textContent = names[idx];
})();

/* AI smart alarm (bedtime via 90-min sleep cycles) */
document.getElementById('calcBedtime').addEventListener('click', ()=>{
  const val = document.getElementById('wakeTimeInput').value;
  if(!val){ toast('Wake time daalo'); return; }
  const [h,m] = val.split(':').map(Number);
  const wake = new Date(); wake.setHours(h,m,0,0);
  const cycles = [6,5,4]; // number of 90-min cycles
  const out = cycles.map(c=>{
    const bed = new Date(wake.getTime() - (c*90+15)*60000);
    return `${c} cycles (${c*1.5}h sleep): sone ka time <b>${bed.toTimeString().slice(0,5)}</b>`;
  }).join('<br>');
  document.getElementById('bedtimeOut').innerHTML = out;
});

/* productivity score (rule-based, from todos+pomodoro) */
function computeProductivity(){
  const todos = load(LS.todos, []);
  const done = todos.filter(t=>t.done).length;
  const totalTodo = todos.length || 1;
  const pomo = load(LS.pomo, {count:0, minutes:0, day:''});
  const today = new Date().toDateString();
  const pomoScore = pomo.day===today ? Math.min(pomo.count*10,50) : 0;
  const score = Math.min(100, Math.round((done/totalTodo)*50 + pomoScore));
  document.getElementById('prodScore').textContent = score+'%';
}
computeProductivity();

/* ================= WORLD CLOCK ================= */
const cityDB = [
  ['India (Delhi)','Asia/Kolkata'],['USA (New York)','America/New_York'],['USA (Los Angeles)','America/Los_Angeles'],
  ['UK (London)','Europe/London'],['UAE (Dubai)','Asia/Dubai'],['Japan (Tokyo)','Asia/Tokyo'],['Australia (Sydney)','Australia/Sydney'],
  ['Germany (Berlin)','Europe/Berlin'],['Singapore','Asia/Singapore'],['China (Beijing)','Asia/Shanghai'],['Russia (Moscow)','Europe/Moscow'],
  ['Brazil (Sao Paulo)','America/Sao_Paulo'],['South Africa (Johannesburg)','Africa/Johannesburg'],['Canada (Toronto)','America/Toronto'],
  ['France (Paris)','Europe/Paris'],['UTC','UTC']
];
const citySelect = document.getElementById('citySelect');
cityDB.forEach(([name,tz])=> citySelect.innerHTML += `<option value="${tz}">${name}</option>`);

let myCities = load(LS.cities, ['Asia/Kolkata','America/New_York','Europe/London']);
function renderCities(){
  const list = document.getElementById('cityList'); list.innerHTML='';
  const diffA = document.getElementById('diffA'), diffB = document.getElementById('diffB');
  diffA.innerHTML = diffB.innerHTML = myCities.map(tz=>`<option value="${tz}">${cityDB.find(c=>c[1]===tz)?.[0]||tz}</option>`).join('');
  myCities.forEach(tz=>{
    const name = cityDB.find(c=>c[1]===tz)?.[0] || tz;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US',{timeZone:tz, hour:'2-digit', minute:'2-digit'});
    const hourNum = parseInt(now.toLocaleTimeString('en-US',{timeZone:tz, hour:'2-digit', hour12:false}));
    const isDay = hourNum>=6 && hourNum<18;
    list.innerHTML += `<div class="city-card"><div><div class="cname">${isDay?'☀️':'🌙'} ${name}</div><div class="ctz">${tz}</div></div><div class="ctime mono">${timeStr}</div><div class="icons"><button data-remove="${tz}">✕</button></div></div>`;
  });
  list.querySelectorAll('[data-remove]').forEach(b=> b.addEventListener('click', ()=>{ myCities = myCities.filter(c=>c!==b.dataset.remove); save(LS.cities,myCities); renderCities(); }));
}
document.getElementById('addCityBtn').addEventListener('click', ()=>{
  const tz = citySelect.value;
  if(!myCities.includes(tz)){ myCities.push(tz); save(LS.cities,myCities); renderCities(); }
});
renderCities();
setInterval(renderCities, 1000);

document.getElementById('diffGo').addEventListener('click', ()=>{
  const a = document.getElementById('diffA').value, b = document.getElementById('diffB').value;
  const now = new Date();
  const ha = parseInt(now.toLocaleTimeString('en-US',{timeZone:a, hour:'2-digit', hour12:false}));
  const hb = parseInt(now.toLocaleTimeString('en-US',{timeZone:b, hour:'2-digit', hour12:false}));
  let diff = hb-ha;
  document.getElementById('diffOut').textContent = `Difference: ${diff>0?'+':''}${diff} hours`;
});
document.getElementById('meetGo').addEventListener('click', ()=>{
  const val = document.getElementById('meetBaseTime').value;
  if(!val || !myCities.length){ toast('Time daalo aur city add karo'); return; }
  const [h,m] = val.split(':').map(Number);
  const base = new Date(); base.setHours(h,m,0,0);
  const baseTz = myCities[0];
  const out = myCities.map(tz=>{
    const s = base.toLocaleTimeString('en-US',{timeZone:tz, hour:'2-digit', minute:'2-digit'});
    return `<div class="mode-label">${cityDB.find(c=>c[1]===tz)?.[0]||tz}: <b>${s}</b></div>`;
  }).join('');
  document.getElementById('meetOut').innerHTML = out;
});

/* ================= ALARMS ================= */
let alarms = load(LS.alarms, []);
let selectedDays = new Set();
document.querySelectorAll('#repeatDays .chip').forEach(c=> c.addEventListener('click', ()=>{ c.classList.toggle('active'); const d=c.dataset.day; selectedDays.has(d)?selectedDays.delete(d):selectedDays.add(d); }));

function renderAlarms(){
  const list = document.getElementById('alarmList'); list.innerHTML='';
  if(!alarms.length){ list.innerHTML = '<div class="mode-label">Koi alarm nahi hai</div>'; return; }
  alarms.forEach(al=>{
    list.innerHTML += `<div class="list-item"><div class="info">${al.label||'Alarm'} — ${al.time}<small>${al.days.length?al.days.map(d=>['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', '):'Once'} · ${al.tone} · ${al.challenge}</small></div><div class="actions"><div class="switch ${al.on?'on':''}" data-toggle="${al.id}"></div><button data-del="${al.id}">🗑</button></div></div>`;
  });
  list.querySelectorAll('[data-toggle]').forEach(s=> s.addEventListener('click', ()=>{ const al=alarms.find(a=>a.id===s.dataset.toggle); al.on=!al.on; save(LS.alarms,alarms); renderAlarms(); }));
  list.querySelectorAll('[data-del]').forEach(b=> b.addEventListener('click', ()=>{ alarms = alarms.filter(a=>a.id!==b.dataset.del); save(LS.alarms,alarms); renderAlarms(); }));
}
document.getElementById('addAlarmBtn').addEventListener('click', ()=>{
  const time = document.getElementById('alarmTime').value;
  if(!time){ toast('Time daalo'); return; }
  alarms.push({ id:Date.now().toString(36), time, label:document.getElementById('alarmLabel').value, days:[...selectedDays].map(Number),
    tone:document.getElementById('alarmTone').value, challenge:document.getElementById('alarmChallenge').value,
    vibrate: document.getElementById('alarmVibrate').classList.contains('on'), on:true, lastFired:'' });
  save(LS.alarms, alarms); renderAlarms(); toast('Alarm added');
});
document.getElementById('alarmVibrate').addEventListener('click', (e)=> e.target.classList.toggle('on'));
renderAlarms();

let ringingAlarm = null;
function checkAlarms(now){
  const hm = now.toTimeString().slice(0,5);
  const dow = now.getDay(); const dateKey = now.toDateString();
  alarms.forEach(al=>{
    if(!al.on || ringingAlarm) return;
    const dayOk = al.days.length ? al.days.includes(dow) : true;
    if(al.time===hm && al.lastFired!==dateKey+hm){
      al.lastFired = dateKey+hm; save(LS.alarms, alarms);
      ringAlarm(al);
    }
  });
}
function ringAlarm(al){
  ringingAlarm = al;
  document.getElementById('ringingLabel').textContent = al.label || 'Alarm!';
  const box = document.getElementById('challengeBox'); box.innerHTML='';
  if(al.challenge==='math'){
    const a=Math.floor(Math.random()*20)+1, b=Math.floor(Math.random()*20)+1;
    box.innerHTML = `<div class="mode-label">Solve to stop: ${a} + ${b} = ?</div><input type="number" id="mathAns" style="margin-top:6px;width:100%;padding:8px;border-radius:8px;background:rgba(0,0,0,.3);border:1px solid var(--edge);color:var(--text);">`;
    document.getElementById('stopAlarmBtn').dataset.answer = a+b;
  } else if(al.challenge==='shake'){
    box.innerHTML = `<div class="mode-label">📳 Phone ko shake karo alarm band karne ke liye</div>`;
    window.addEventListener('devicemotion', shakeHandler);
  } else { document.getElementById('stopAlarmBtn').removeAttribute('data-answer'); }
  openOverlay('ringingOverlay');
  ringLoop(al.tone);
  if(al.vibrate) vibrate([200,100,200,100,200]);
}
let ringInterval;
function ringLoop(tone){
  const freq = tone==='chime'?880: tone==='siren'?440:660;
  ringInterval = setInterval(()=> beep(freq + (tone==='siren'? (Math.random()*200-100):0)), 500);
}
function shakeHandler(e){
  const acc = e.accelerationIncludingGravity; if(!acc) return;
  const total = Math.abs(acc.x)+Math.abs(acc.y)+Math.abs(acc.z);
  if(total>35){ stopRinging(); }
}
function stopRinging(){
  clearInterval(ringInterval); window.removeEventListener('devicemotion', shakeHandler);
  closeOverlay('ringingOverlay'); ringingAlarm=null;
}
document.getElementById('stopAlarmBtn').addEventListener('click', (e)=>{
  const ans = e.target.dataset.answer;
  if(ans){ const input = document.getElementById('mathAns'); if(!input || input.value!=ans){ toast('Galat jawab, dobara try karo'); return; } }
  stopRinging();
});
document.getElementById('snoozeBtn').addEventListener('click', ()=>{
  clearInterval(ringInterval); window.removeEventListener('devicemotion', shakeHandler);
  closeOverlay('ringingOverlay');
  const al = ringingAlarm; ringingAlarm=null;
  setTimeout(()=> ringAlarm(al), 5*60*1000);
  toast('Snoozed 5 min');
});

/* ================= STOPWATCH ================= */
let swRunning=false, swStart=0, swElapsed=0, swLaps=[], swRAF;
function fmtSW(ms){
  const h=Math.floor(ms/3600000), m=Math.floor(ms%3600000/60000), s=Math.floor(ms%60000/1000), cs=Math.floor(ms%1000/10);
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}`;
}
function swTick(){ document.getElementById('swDisplay').textContent = fmtSW(swElapsed + (swRunning ? performance.now()-swStart : 0)); if(swRunning) swRAF = requestAnimationFrame(swTick); }
document.getElementById('swStart').addEventListener('click', (e)=>{
  if(!swRunning){ swRunning=true; swStart=performance.now(); swTick(); e.target.textContent='Pause'; }
  else{ swRunning=false; swElapsed += performance.now()-swStart; cancelAnimationFrame(swRAF); e.target.textContent='Resume'; }
});
document.getElementById('swReset').addEventListener('click', ()=>{ swRunning=false; swElapsed=0; swLaps=[]; cancelAnimationFrame(swRAF); document.getElementById('swDisplay').textContent='00:00:00.00'; document.getElementById('swStart').textContent='Start'; renderLaps(); });
document.getElementById('swLap').addEventListener('click', ()=>{ const cur = swElapsed + (swRunning?performance.now()-swStart:0); swLaps.push(cur); renderLaps(); });
function renderLaps(){
  const list = document.getElementById('lapList'); if(!swLaps.length){ list.innerHTML='<div class="mode-label">Koi lap nahi</div>'; return; }
  const diffs = swLaps.map((l,i)=> i===0?l:l-swLaps[i-1]);
  const best = Math.min(...diffs), worst = Math.max(...diffs);
  list.innerHTML = swLaps.map((l,i)=>{
    const cls = diffs[i]===best?'best':diffs[i]===worst?'worst':'';
    return `<div class="lap-row ${cls}"><span>Lap ${i+1}</span><span>${fmtSW(diffs[i])}</span><span>${fmtSW(l)}</span></div>`;
  }).join('');
}
document.getElementById('swExport').addEventListener('click', ()=>{
  if(!swLaps.length){ toast('Koi lap nahi hai'); return; }
  const csv = 'Lap,Split,Total\n'+swLaps.map((l,i)=>`${i+1},${fmtSW(i===0?l:l-swLaps[i-1])},${fmtSW(l)}`).join('\n');
  const blob = new Blob([csv],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='laps.csv'; a.click();
});

/* ================= TIMERS ================= */
document.querySelectorAll('#timerPresets .sub-tab').forEach(t=>{
  t.addEventListener('click', ()=>{
    document.querySelectorAll('#timerPresets .sub-tab').forEach(x=>x.classList.remove('active')); t.classList.add('active');
    if(t.dataset.preset!=='custom'){ document.getElementById('tH').value=0; document.getElementById('tM').value=t.dataset.preset; document.getElementById('tS').value=0; }
  });
});
let activeTimers = [];
document.getElementById('addTimerBtn').addEventListener('click', ()=>{
  const h=+document.getElementById('tH').value||0, m=+document.getElementById('tM').value||0, s=+document.getElementById('tS').value||0;
  const total = h*3600+m*60+s; if(total<=0){ toast('Valid time daalo'); return; }
  const id = Date.now().toString(36);
  activeTimers.push({ id, remaining: total, total, label: document.getElementById('timerLabel').value || 'Timer' });
  renderTimers();
});
function renderTimers(){
  const list = document.getElementById('timerList');
  if(!activeTimers.length){ list.innerHTML = '<div class="mode-label">Koi timer active nahi hai</div>'; return; }
  list.innerHTML = activeTimers.map(t=>{
    const h=Math.floor(t.remaining/3600), m=Math.floor(t.remaining%3600/60), s=t.remaining%60;
    return `<div class="list-item"><div class="info">${t.label}<small>${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}</small></div><div class="actions"><button data-timerdel="${t.id}">Stop</button></div></div>`;
  }).join('');
  list.querySelectorAll('[data-timerdel]').forEach(b=> b.addEventListener('click', ()=>{ activeTimers = activeTimers.filter(t=>t.id!==b.dataset.timerdel); renderTimers(); }));
}
setInterval(()=>{
  let changed=false;
  activeTimers.forEach(t=>{ if(t.remaining>0){ t.remaining--; changed=true; } else { notify('Timer Done', t.label+' complete!'); beep(880); vibrate(300); } });
  activeTimers = activeTimers.filter(t=>t.remaining>=0-1 && !(t.remaining<0));
  if(changed) renderTimers();
}, 1000);

/* ================= CALENDAR ================= */
let calDate = new Date(); let selectedDate = new Date();
let events = load(LS.events, {});
function renderCalendar(){
  const y=calDate.getFullYear(), m=calDate.getMonth();
  document.getElementById('calMonthLabel').textContent = calDate.toLocaleDateString(undefined,{month:'long', year:'numeric'});
  const grid = document.getElementById('calGrid'); grid.innerHTML='';
  ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(d=> grid.innerHTML += `<div class="dow">${d}</div>`);
  const firstDay = new Date(y,m,1).getDay(); const daysInMonth = new Date(y,m+1,0).getDate();
  for(let i=0;i<firstDay;i++) grid.innerHTML += '<div class="empty"></div>';
  const todayStr = new Date().toDateString();
  for(let d=1; d<=daysInMonth; d++){
    const dateObj = new Date(y,m,d); const key = dateObj.toDateString();
    const hasEvt = events[key] && events[key].length;
    const cls = ['day']; if(key===todayStr) cls.push('today'); if(hasEvt) cls.push('has-event'); if(key===selectedDate.toDateString()) cls.push('selected');
    grid.innerHTML += `<div class="${cls.join(' ')}" data-date="${key}">${d}</div>`;
  }
  grid.querySelectorAll('.day').forEach(el=> el.addEventListener('click', ()=>{ selectedDate = new Date(el.dataset.date); renderCalendar(); renderEventsForDay(); }));
}
document.getElementById('calPrev').addEventListener('click', ()=>{ calDate.setMonth(calDate.getMonth()-1); renderCalendar(); });
document.getElementById('calNext').addEventListener('click', ()=>{ calDate.setMonth(calDate.getMonth()+1); renderCalendar(); });
function renderEventsForDay(){
  const key = selectedDate.toDateString(); const list = events[key]||[];
  document.getElementById('eventsForDay').innerHTML = list.length ? list.map((e,i)=>`<div class="list-item"><div class="info">${e.type.toUpperCase()}: ${e.title}</div><div class="actions"><button data-evtdel="${i}">🗑</button></div></div>`).join('') : '<div class="mode-label">Is date pe koi event nahi</div>';
  document.querySelectorAll('[data-evtdel]').forEach(b=> b.addEventListener('click', ()=>{ events[key].splice(+b.dataset.evtdel,1); save(LS.events,events); renderCalendar(); renderEventsForDay(); }));
}
document.getElementById('addEventBtn').addEventListener('click', ()=>{
  const title = document.getElementById('eventTitle').value.trim(); if(!title) return;
  const key = selectedDate.toDateString(); events[key]=events[key]||[]; events[key].push({title, type:document.getElementById('eventType').value});
  save(LS.events, events); document.getElementById('eventTitle').value=''; renderCalendar(); renderEventsForDay();
});
renderCalendar(); renderEventsForDay();

/* countdown creator */
let countdowns = load(LS.countdowns, []);
document.getElementById('addCountdownBtn').addEventListener('click', ()=>{
  const title = document.getElementById('cdTitle').value.trim(), date = document.getElementById('cdDate').value;
  if(!title || !date) return;
  countdowns.push({ id:Date.now().toString(36), title, date, cat: document.getElementById('cdCategory').value });
  save(LS.countdowns, countdowns); document.getElementById('cdTitle').value=''; renderCountdowns();
});
function renderCountdowns(){
  const list = document.getElementById('countdownList'); const now = Date.now();
  list.innerHTML = countdowns.map(c=>{
    const diff = new Date(c.date).getTime()-now; const d=Math.floor(diff/86400000), h=Math.floor(diff%86400000/3600000);
    return `<div class="countdown-card"><div class="cd-cat">${c.cat}</div><div class="cd-title">${c.title}</div><div class="cd-num">${diff>0? d+'d '+h+'h' : 'Ho gaya!'}</div><button data-cddel="${c.id}" style="margin-top:6px;">Remove</button></div>`;
  }).join('') || '<div class="mode-label">Koi countdown nahi</div>';
  list.querySelectorAll('[data-cddel]').forEach(b=> b.addEventListener('click', ()=>{ countdowns = countdowns.filter(c=>c.id!==b.dataset.cddel); save(LS.countdowns,countdowns); renderCountdowns(); }));
}
renderCountdowns(); setInterval(renderCountdowns, 60000);

/* ================= PLANNER: todos/habits/goals/journal/pomodoro ================= */
let todos = load(LS.todos, []);
function renderTodos(){
  document.getElementById('todoList').innerHTML = todos.map((t,i)=>`<div class="list-item"><div class="info" style="text-decoration:${t.done?'line-through':'none'}">${t.text}</div><div class="actions"><div class="switch ${t.done?'on':''}" data-tdone="${i}"></div><button data-tdel="${i}">🗑</button></div></div>`).join('') || '<div class="mode-label">Koi task nahi</div>';
  document.querySelectorAll('[data-tdone]').forEach(s=> s.addEventListener('click', ()=>{ todos[+s.dataset.tdone].done = !todos[+s.dataset.tdone].done; save(LS.todos,todos); renderTodos(); computeProductivity(); }));
  document.querySelectorAll('[data-tdel]').forEach(b=> b.addEventListener('click', ()=>{ todos.splice(+b.dataset.tdel,1); save(LS.todos,todos); renderTodos(); }));
}
document.getElementById('todoAdd').addEventListener('click', ()=>{ const v=document.getElementById('todoInput').value.trim(); if(!v) return; todos.push({text:v, done:false}); save(LS.todos,todos); document.getElementById('todoInput').value=''; renderTodos(); });
renderTodos();

let habits = load(LS.habits, []);
function renderHabits(){
  const today = new Date().toDateString();
  document.getElementById('habitList').innerHTML = habits.map((h,i)=>`<div class="list-item"><div class="info">${h.text}<small>Streak: ${h.streak||0} days</small></div><div class="actions"><div class="switch ${h.lastDone===today?'on':''}" data-hdone="${i}"></div><button data-hdel="${i}">🗑</button></div></div>`).join('') || '<div class="mode-label">Koi habit nahi</div>';
  document.querySelectorAll('[data-hdone]').forEach(s=> s.addEventListener('click', ()=>{ const h=habits[+s.dataset.hdone]; const today=new Date().toDateString();
    if(h.lastDone!==today){ h.streak=(h.streak||0)+1; h.lastDone=today; } else { h.streak=Math.max(0,(h.streak||1)-1); h.lastDone=''; }
    save(LS.habits,habits); renderHabits(); }));
  document.querySelectorAll('[data-hdel]').forEach(b=> b.addEventListener('click', ()=>{ habits.splice(+b.dataset.hdel,1); save(LS.habits,habits); renderHabits(); }));
}
document.getElementById('habitAdd').addEventListener('click', ()=>{ const v=document.getElementById('habitInput').value.trim(); if(!v) return; habits.push({text:v, streak:0, lastDone:''}); save(LS.habits,habits); document.getElementById('habitInput').value=''; renderHabits(); });
renderHabits();

let goals = load(LS.goals, []);
function renderGoals(){
  document.getElementById('goalList').innerHTML = goals.map((g,i)=>`<div class="list-item"><div class="info" style="width:100%;">${g.text}<br><input type="range" min="0" max="100" value="${g.progress||0}" data-gprog="${i}" style="width:100%;"><small>${g.progress||0}% complete</small></div><button data-gdel="${i}">🗑</button></div>`).join('') || '<div class="mode-label">Koi goal nahi</div>';
  document.querySelectorAll('[data-gprog]').forEach(inp=> inp.addEventListener('input', ()=>{ goals[+inp.dataset.gprog].progress = +inp.value; save(LS.goals,goals); }));
  document.querySelectorAll('[data-gdel]').forEach(b=> b.addEventListener('click', ()=>{ goals.splice(+b.dataset.gdel,1); save(LS.goals,goals); renderGoals(); }));
}
document.getElementById('goalAdd').addEventListener('click', ()=>{ const v=document.getElementById('goalInput').value.trim(); if(!v) return; goals.push({text:v, progress:0}); save(LS.goals,goals); document.getElementById('goalInput').value=''; renderGoals(); });
renderGoals();

let selectedMood = '🙂';
document.querySelectorAll('#moodPicker .chip').forEach(c=> c.addEventListener('click', ()=>{ document.querySelectorAll('#moodPicker .chip').forEach(x=>x.classList.remove('active')); c.classList.add('active'); selectedMood=c.dataset.mood; }));
let journal = load(LS.journal, []);
function renderJournal(){ document.getElementById('journalList').innerHTML = journal.slice(0,10).map(j=>`<div class="list-item"><div class="info">${j.mood} ${j.text}<small>${j.date}</small></div></div>`).join(''); }
document.getElementById('journalSave').addEventListener('click', ()=>{
  const v = document.getElementById('journalInput').value.trim(); if(!v) return;
  journal.unshift({ text:v, mood:selectedMood, date:new Date().toLocaleString() }); save(LS.journal,journal);
  document.getElementById('journalInput').value=''; renderJournal();
});
renderJournal();

let pomoRunning=false, pomoRemaining=25*60, pomoInterval;
function fmtMin(s){ return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'); }
function updatePomoStats(){
  const p = load(LS.pomo, {count:0, minutes:0, day:''}); const today=new Date().toDateString();
  if(p.day!==today){ p.count=0; p.minutes=0; p.day=today; save(LS.pomo,p); }
  document.getElementById('pomoCount').textContent = p.count; document.getElementById('pomoMinutes').textContent = p.minutes;
}
updatePomoStats();
document.getElementById('pomoStart').addEventListener('click', (e)=>{
  if(pomoRunning){ pomoRunning=false; clearInterval(pomoInterval); e.target.textContent='Start Focus'; return; }
  pomoRunning=true; e.target.textContent='Pause';
  pomoInterval = setInterval(()=>{
    pomoRemaining--; document.getElementById('pomoDisplay').textContent = fmtMin(Math.max(0,pomoRemaining));
    if(pomoRemaining<=0){
      clearInterval(pomoInterval); pomoRunning=false; e.target.textContent='Start Focus';
      const p = load(LS.pomo, {count:0,minutes:0,day:new Date().toDateString()}); p.count++; p.minutes+=25; save(LS.pomo,p); updatePomoStats(); computeProductivity();
      notify('Pomodoro Complete', 'Break le lo 5 min!'); beep(880);
      pomoRemaining=25*60; document.getElementById('pomoDisplay').textContent='25:00';
    }
  }, 1000);
});
document.getElementById('pomoReset').addEventListener('click', ()=>{ pomoRunning=false; clearInterval(pomoInterval); pomoRemaining=25*60; document.getElementById('pomoDisplay').textContent='25:00'; document.getElementById('pomoStart').textContent='Start Focus'; });

/* ================= HEALTH ================= */
let waterCount = load(LS.water, {count:0, day:''});
function renderWater(){ const today=new Date().toDateString(); if(waterCount.day!==today){ waterCount={count:0,day:today}; save(LS.water,waterCount); } document.getElementById('waterCount').textContent = waterCount.count; }
renderWater();
document.getElementById('waterAdd').addEventListener('click', ()=>{ waterCount.count++; save(LS.water,waterCount); renderWater(); });
let waterTimer;
document.getElementById('waterStart').addEventListener('click', ()=>{
  clearInterval(waterTimer); const mins = +document.getElementById('waterInterval').value||60;
  waterTimer = setInterval(()=> notify('💧 Water Reminder', 'Paani peene ka time ho gaya!'), mins*60000);
  toast('Water reminder started every '+mins+' min');
});
let workoutTimer;
document.getElementById('workoutStart').addEventListener('click', ()=>{
  clearInterval(workoutTimer); const mins = +document.getElementById('workoutInterval').value||90;
  workoutTimer = setInterval(()=> notify('🏃 Move Reminder', 'Thoda walk/stretch kar lo!'), mins*60000);
  toast('Workout reminder started');
});
let eyeTimer;
document.getElementById('eyeStart').addEventListener('click', ()=>{
  clearInterval(eyeTimer);
  eyeTimer = setInterval(()=> notify('👁 Eye Care', '20 second ke liye 20 feet door dekho'), 20*60000);
  toast('Eye care reminder started (every 20 min)');
});
let meds = load(LS.meds, []);
function renderMeds(){ document.getElementById('medList').innerHTML = meds.map((m,i)=>`<div class="list-item"><div class="info">${m.name} — ${m.time}</div><button data-meddel="${i}">🗑</button></div>`).join('') || '<div class="mode-label">Koi reminder nahi</div>'; document.querySelectorAll('[data-meddel]').forEach(b=> b.addEventListener('click', ()=>{ meds.splice(+b.dataset.meddel,1); save(LS.meds,meds); renderMeds(); })); }
document.getElementById('medAdd').addEventListener('click', ()=>{ const n=document.getElementById('medName').value.trim(), t=document.getElementById('medTime').value; if(!n||!t) return; meds.push({name:n,time:t}); save(LS.meds,meds); renderMeds(); });
renderMeds();
setInterval(()=>{ const hm = new Date().toTimeString().slice(0,5); meds.forEach(m=>{ if(m.time===hm) notify('💊 Medicine Time', m.name); }); }, 30000);

let sleepLog = load(LS.sleep, []);
function renderSleep(){ document.getElementById('sleepList').innerHTML = sleepLog.slice(0,5).map(s=>`<div class="list-item"><div class="info">${s.bed} → ${s.wake}<small>${s.duration}</small></div></div>`).join(''); }
document.getElementById('sleepLog').addEventListener('click', ()=>{
  const bed = document.getElementById('sleepBed').value, wake = document.getElementById('sleepWake').value; if(!bed||!wake) return;
  let [bh,bm]=bed.split(':').map(Number), [wh,wm]=wake.split(':').map(Number);
  let mins = (wh*60+wm)-(bh*60+bm); if(mins<0) mins+=24*60;
  sleepLog.unshift({bed,wake, duration:(mins/60).toFixed(1)+'h'}); save(LS.sleep,sleepLog); renderSleep();
});
renderSleep();

document.getElementById('breatheStart').addEventListener('click', ()=>{
  const circle = document.getElementById('breatheCircle'); let step=0;
  const seq = [['Inhale',4000,1.3],['Hold',7000,1.3],['Exhale',8000,0.8]];
  function run(){ const [label,dur,scale]=seq[step%3]; circle.textContent=label; circle.style.transform=`scale(${scale})`; circle.style.transition=`transform ${dur}ms ease-in-out`; step++; if(step<12) setTimeout(run,dur); else { circle.textContent='Breathe'; circle.style.transform='scale(1)'; } }
  run();
});

/* ================= RELAX (WebAudio noise) ================= */
let audioCtx, noiseSrc, noiseGain, filterNode;
function stopSound(){ if(noiseSrc){ try{ noiseSrc.stop(); }catch(e){} noiseSrc=null; } document.querySelectorAll('#ambientTabs .sub-tab').forEach(t=>t.classList.remove('active')); }
function playNoise(type){
  stopSound();
  audioCtx = audioCtx || new (window.AudioContext||window.webkitAudioContext)();
  const bufferSize = 2*audioCtx.sampleRate;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for(let i=0;i<bufferSize;i++) data[i] = Math.random()*2-1;
  noiseSrc = audioCtx.createBufferSource(); noiseSrc.buffer=buffer; noiseSrc.loop=true;
  filterNode = audioCtx.createBiquadFilter();
  const freqs = {rain:1500, ocean:400, forest:800, white:8000};
  filterNode.type = type==='white' ? 'allpass' : 'lowpass';
  filterNode.frequency.value = freqs[type]||1000;
  noiseGain = audioCtx.createGain(); noiseGain.gain.value = +document.getElementById('soundVolume').value;
  noiseSrc.connect(filterNode); filterNode.connect(noiseGain); noiseGain.connect(audioCtx.destination);
  noiseSrc.start();
}
document.querySelectorAll('#ambientTabs .sub-tab').forEach(t=> t.addEventListener('click', ()=>{ document.querySelectorAll('#ambientTabs .sub-tab').forEach(x=>x.classList.remove('active')); t.classList.add('active'); playNoise(t.dataset.sound); }));
document.getElementById('soundStop').addEventListener('click', stopSound);
document.getElementById('soundVolume').addEventListener('input', (e)=>{ if(noiseGain) noiseGain.gain.value = +e.target.value; });

let medRemaining = 300, medRunning=false, medInterval;
document.querySelectorAll('[data-med]').forEach(b=> b.addEventListener('click', ()=>{ medRemaining = +b.dataset.med*60; document.getElementById('medDisplay').textContent = fmtMin(medRemaining); }));
document.getElementById('medStart').addEventListener('click', (e)=>{
  if(medRunning){ medRunning=false; clearInterval(medInterval); e.target.textContent='Start Meditation'; return; }
  medRunning=true; e.target.textContent='Pause';
  medInterval = setInterval(()=>{ medRemaining--; document.getElementById('medDisplay').textContent=fmtMin(Math.max(0,medRemaining)); if(medRemaining<=0){ clearInterval(medInterval); medRunning=false; e.target.textContent='Start Meditation'; notify('Meditation Complete','Well done! 🧘'); beep(660); } }, 1000);
});

/* ================= FUN CLOCKS ================= */
function renderFunClocks(h,m,s){
  const bin = document.getElementById('binaryClock');
  const parts = [h,m,s];
  bin.innerHTML = parts.map(p=>{
    const bits = p.toString(2).padStart(6,'0').split('');
    return `<div class="binary-col">${bits.map(b=>`<div class="binary-dot ${b==='1'?'on':''}"></div>`).join('')}</div>`;
  }).join('');

  document.getElementById('hexClock').textContent = '#'+[h,m,s].map(n=>n.toString(16).padStart(2,'0')).join('').toUpperCase();

  const roman = n=>{ const vals=[[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']]; let r=''; let x=n||12; if(x===0)x=12; for(const [v,sym] of vals){ while(x>=v){ r+=sym; x-=v; } } return r||'XII'; };
  const rh = h%12===0?12:h%12;
  document.getElementById('romanClock').textContent = `${roman(rh)} : ${roman(m||12)} : ${roman(s||12)}`;

  const emojis = ['🕛','🕐','🕑','🕒','🕓','🕔','🕕','🕖','🕗','🕘','🕙','🕚'];
  document.getElementById('emojiClock').textContent = emojis[h%12];

  const flip = document.getElementById('flipClock');
  const str = String(h).padStart(2,'0')+String(m).padStart(2,'0')+String(s).padStart(2,'0');
  flip.innerHTML = str.split('').map(d=>`<div class="flip-card">${d}</div>`).join('');
}

/* ================= TOOLS ================= */
let mcExpr = '';
document.getElementById('miniCalcKeys').addEventListener('click', (e)=>{
  const btn = e.target.closest('button'); if(!btn) return; const v = btn.dataset.mc;
  if(v==='C'){ mcExpr=''; }
  else if(v==='='){ try{ mcExpr = Function('"use strict";return('+mcExpr.replace(/[^0-9+\-*/.() ]/g,'')+')')().toString(); }catch(e){ mcExpr='Error'; } }
  else mcExpr += v;
  document.getElementById('miniCalcDisplay').value = mcExpr;
});

const ucTables = { length:{m:1,km:1000,cm:0.01,mile:1609.34,foot:0.3048}, weight:{kg:1,g:0.001,pound:0.453592}, temp:{celsius:'C',fahrenheit:'F',kelvin:'K'} };
function populateUC(){
  const cat = document.getElementById('ucCat').value; const units = Object.keys(ucTables[cat]);
  document.getElementById('ucFrom').innerHTML = units.map(u=>`<option>${u}</option>`).join('');
  document.getElementById('ucTo').innerHTML = units.map(u=>`<option>${u}</option>`).join('');
}
document.getElementById('ucCat').addEventListener('change', populateUC); populateUC();
document.getElementById('ucGo').addEventListener('click', ()=>{
  const cat = document.getElementById('ucCat').value, from = document.getElementById('ucFrom').value, to = document.getElementById('ucTo').value, val = +document.getElementById('ucVal').value||0;
  let result;
  if(cat==='temp'){ let c = from==='celsius'?val: from==='fahrenheit'?(val-32)*5/9:val-273.15; result = to==='celsius'?c: to==='fahrenheit'?c*9/5+32:c+273.15; }
  else { result = val*ucTables[cat][from]/ucTables[cat][to]; }
  document.getElementById('ucOut').textContent = `${val} ${from} = ${result.toFixed(4)} ${to}`;
});

document.getElementById('qrGoBtn').addEventListener('click', ()=>{
  const text = document.getElementById('qrInput').value.trim(); if(!text) return;
  const img = document.getElementById('qrOut');
  img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data='+encodeURIComponent(text);
  img.style.display='block';
});

let qrStream;
document.getElementById('qrScanBtn').addEventListener('click', async ()=>{
  const video = document.getElementById('qrVideo'), out = document.getElementById('qrScanOut');
  if(!navigator.mediaDevices){ out.textContent='Camera supported nahi hai'; return; }
  try{
    qrStream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
    video.srcObject = qrStream; video.style.display='block'; video.play();
    const c = document.createElement('canvas'); const cctx = c.getContext('2d');
    function scanFrame(){
      if(video.readyState===video.HAVE_ENOUGH_DATA && typeof jsQR!=='undefined'){
        c.width=video.videoWidth; c.height=video.videoHeight; cctx.drawImage(video,0,0,c.width,c.height);
        const img = cctx.getImageData(0,0,c.width,c.height);
        const code = jsQR(img.data, img.width, img.height);
        if(code){ out.textContent='Decoded: '+code.data; qrStream.getTracks().forEach(t=>t.stop()); video.style.display='none'; return; }
      }
      requestAnimationFrame(scanFrame);
    }
    scanFrame();
  }catch(e){ out.textContent='Camera access denied'; }
});

let notes = load(LS.notes, []);
function renderNotes(){ document.getElementById('noteList').innerHTML = notes.map((n,i)=>`<div class="list-item"><div class="info">${n}</div><button data-notedel="${i}">🗑</button></div>`).join('') || '<div class="mode-label">Koi note nahi</div>'; document.querySelectorAll('[data-notedel]').forEach(b=> b.addEventListener('click', ()=>{ notes.splice(+b.dataset.notedel,1); save(LS.notes,notes); renderNotes(); })); }
document.getElementById('noteAdd').addEventListener('click', ()=>{ const v=document.getElementById('noteInput').value.trim(); if(!v) return; notes.unshift(v); save(LS.notes,notes); document.getElementById('noteInput').value=''; renderNotes(); });
renderNotes();

let clips = load(LS.clips, []);
function renderClips(){ document.getElementById('clipList').innerHTML = clips.map((c,i)=>`<div class="list-item"><div class="info">${c}</div><div class="actions"><button data-clipcopy="${i}">📋</button><button data-clipdel="${i}">🗑</button></div></div>`).join('') || '<div class="mode-label">Koi history nahi</div>';
  document.querySelectorAll('[data-clipcopy]').forEach(b=> b.addEventListener('click', ()=>{ navigator.clipboard.writeText(clips[+b.dataset.clipcopy]); toast('Copied'); }));
  document.querySelectorAll('[data-clipdel]').forEach(b=> b.addEventListener('click', ()=>{ clips.splice(+b.dataset.clipdel,1); save(LS.clips,clips); renderClips(); }));
}
document.getElementById('clipSave').addEventListener('click', ()=>{ const v=document.getElementById('clipInput').value.trim(); if(!v) return; clips.unshift(v); save(LS.clips,clips); document.getElementById('clipInput').value=''; renderClips(); });
renderClips();

/* ================= DASHBOARD ================= */
function renderDashboard(){
  document.getElementById('dTotalAlarms').textContent = alarms.length;
  document.getElementById('dTotalEvents').textContent = countdowns.length + Object.values(events).reduce((a,b)=>a+b.length,0);
  const p = load(LS.pomo, {minutes:0}); document.getElementById('dFocusMin').textContent = p.minutes||0;
  document.getElementById('dHabits').textContent = habits.length;

  const usage = load(LS.usage, {});
  const days = []; for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); const key=d.toDateString(); const count = usage[key]? Object.values(usage[key]).reduce((a,b)=>a+b,0) : 0; days.push({label:d.toLocaleDateString(undefined,{weekday:'short'}), count}); }
  const max = Math.max(1, ...days.map(d=>d.count));
  document.getElementById('weekBars').innerHTML = days.map(d=>`<div class="bar" style="height:${Math.max(4,(d.count/max)*70)}px"></div>`).join('');
  document.getElementById('weekLbls').innerHTML = days.map(d=>`<span>${d.label}</span>`).join('');
}

/* ================= SETTINGS ================= */
const themes = ['glass','light','neon','matrix','cyberpunk','material','ocean','sunset','forest','mono','pastel'];
const swatch = { glass:'#7dffb3', light:'#0e9f6e', neon:'#ff2ec4', matrix:'#00ff66', cyberpunk:'#f637ec', material:'#03dac6', ocean:'#4fd1c5', sunset:'#ff7e5f', forest:'#7bd389', mono:'#e6e6e6', pastel:'#f7a1c4' };
const themeGrid = document.getElementById('themeGrid');
themes.forEach(t=>{
  const dot = document.createElement('div'); dot.className='theme-dot'+(settings.theme===t?' active':''); dot.style.background=swatch[t]; dot.title=t;
  dot.addEventListener('click', ()=>{ settings.theme=t; saveSettings(); applyTheme(); document.querySelectorAll('.theme-dot').forEach(d=>d.classList.remove('active')); dot.classList.add('active'); });
  themeGrid.appendChild(dot);
});
function wireSwitch(id, key, cb){ const el=document.getElementById(id); el.classList.toggle('on', settings[key]); el.addEventListener('click', ()=>{ settings[key]=!settings[key]; saveSettings(); el.classList.toggle('on', settings[key]); if(cb) cb(); }); }
wireSwitch('swAutoTheme','autoTheme'); wireSwitch('swParticles','particles'); wireSwitch('swSound','sound'); wireSwitch('swVibrate','vibrate');

document.getElementById('bgUpload').addEventListener('change', (e)=>{
  const f = e.target.files[0]; if(!f) return;
  if(f.size > 3*1024*1024){ toast('Image bahut badi hai (max 3MB)'); return; }
  const reader = new FileReader();
  reader.onload = ()=>{ document.getElementById('customBg').style.backgroundImage = `url(${reader.result})`; document.getElementById('customBg').style.display='block'; document.getElementById('auroraBg').style.opacity='0.15'; };
  reader.readAsDataURL(f);
});

const langSelect = document.getElementById('langSelect'); langSelect.value = settings.lang;
langSelect.addEventListener('change', ()=>{ settings.lang = langSelect.value; saveSettings(); toast('Language: '+(settings.lang==='hi'?'हिन्दी':'English')); });
const fontSelect = document.getElementById('fontSelect'); fontSelect.value = settings.font;
fontSelect.addEventListener('change', ()=>{ settings.font = parseFloat(fontSelect.value); saveSettings(); applyTheme(); });

document.getElementById('exportSettings').addEventListener('click', ()=>{
  const all = {}; Object.entries(LS).forEach(([k,v])=> all[k] = load(v, null));
  const blob = new Blob([JSON.stringify(all,null,2)], {type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download='clock-data-backup.json'; a.click();
});
document.getElementById('importSettings').addEventListener('change', (e)=>{
  const f = e.target.files[0]; if(!f) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    try{ const data = JSON.parse(reader.result); Object.entries(LS).forEach(([k,v])=>{ if(data[k]!==undefined) save(v, data[k]); }); toast('Data imported! Reloading...'); setTimeout(()=>location.reload(), 1200); }
    catch(e){ toast('Invalid file'); }
  };
  reader.readAsText(f);
});

/* keyboard shortcuts */
window.addEventListener('keydown', (e)=>{
  const active = document.activeElement;
  if(active && ['INPUT','TEXTAREA','SELECT'].includes(active.tagName)) return;
  if(e.key==='Escape'){ document.querySelectorAll('.overlay.show').forEach(o=>{ if(o.id!=='ringingOverlay') o.classList.remove('show'); }); }
  if(e.key===' '){ e.preventDefault(); document.getElementById('swStart').click(); }
  const tabKeys = ['clock','world','alarms','stopwatch','timers','calendar','planner','health','relax'];
  if(/^[1-9]$/.test(e.key)){ const idx=+e.key-1; if(tabKeys[idx]) document.querySelector(`[data-view="${tabKeys[idx]}"]`)?.click(); }
});

})();

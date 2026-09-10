
const $=id=>document.getElementById(id), key=()=>{
  if(window.cuttrackSelectedDateKey) return window.cuttrackSelectedDateKey;
  const d=new Date(),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),dd=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${dd}`;
};const N={cal:['Calories','kcal','limit',2200],p:['Protein','g','goal',180],c:['Carbs','g','goal',200],f:['Fat','g','limit',70],fiber:['Fibre','g','goal',30],water:['Water','mL','goal',2700],sodium:['Sodium','mg','limit',2300],potassium:['Potassium','mg','goal',3500],sugar:['Sugar','g','limit',50],satfat:['Saturated fat','g','limit',20],calcium:['Calcium','mg','goal',1000],iron:['Iron','mg','goal',8],magnesium:['Magnesium','mg','goal',400]};let db=JSON.parse(localStorage.getItem('cuttrack_v9')||localStorage.getItem('cuttrack_v8')||localStorage.getItem('cuttrack_v7')||'null')||{days:{},targets:{},theme:'system',profile:{name:'',email:'',photo:''},personal:{goals:['lose']},supplements:[],reminders:[]};if(!Array.isArray(db.reminders)){let old=db.reminders||{};db.reminders=old.meal?[{type:'meal',name:'Meal',time:old.time||'18:00',days:[0,1,2,3,4,5,6],enabled:true}]:[]}for(const[k,n]of Object.entries(N))db.targets[k]??={enabled:['cal','p','c'].includes(k),value:n[3]};function day(){return db.days[key()]??={foods:[],health:{steps:0,burn:0,weight:0,water:0},supp:{}}}function save(){localStorage.setItem('cuttrack_v9',JSON.stringify(db))}function total(d=day()){let t={};Object.keys(N).forEach(k=>t[k]=0);(d.foods||[]).forEach(x=>Object.keys(N).forEach(k=>t[k]+=+x[k]||0));t.water+=(+d.health?.water||0);return t}function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function theme(){let today=document.body.classList.contains('todayMode'),meal=document.body.classList.contains('mealViewOnly');document.body.className=db.theme==='dark'?'dark':db.theme==='light'?'light':'system';if(today)document.body.classList.add('todayMode');if(meal)document.body.classList.add('mealViewOnly');document.querySelectorAll('[data-theme]').forEach(x=>x.classList.toggle('on',x.dataset.theme===db.theme))}
function metric(k){let t=total()[k],n=N[k],g=db.targets[k],pct=g.enabled?Math.min(100,t/g.value*100):0,over=g.enabled&&n[2]==='limit'&&t>g.value,sub=!g.enabled?'Tracked · no daily target':over?`${Math.round(t-g.value)} ${n[1]} over limit`:n[2]==='limit'?`${Math.max(0,Math.round(g.value-t))} ${n[1]} remaining`:t>=g.value?'Goal reached':`${Math.max(0,Math.round(g.value-t))} ${n[1]} to goal`;return `<div class="metric ${over?'over':''} ${g.enabled?'':'noTarget'}"><div class="metricHead"><span>${n[0]}</span><span>${Math.round(t)}${g.enabled?` / ${g.value}`:''} ${n[1]}</span></div><div class="track"><div class="fill" style="width:${pct}%"></div></div><div class="metricSub">${sub}</div></div>`}
function macroMini(k){let t=total()[k],n=N[k],g=db.targets[k],pct=g.enabled?Math.min(100,t/g.value*100):0,over=g.enabled&&n[2]==='limit'&&t>g.value;return `<div class="macroItem ${over?'over':''} ${g.enabled?'':'noTarget'}"><div class="macroLabel">${n[0]}</div><div class="macroValue">${Math.round(t)}${g.enabled?` / ${g.value}`:''} ${n[1]}</div><div class="track"><div class="fill" style="width:${pct}%"></div></div></div>`}
function renderToday(){let t=total(),h=day().health||{};let rd=window.cuttrackSelectedDateKey?new Date(window.cuttrackSelectedDateKey+'T12:00:00'):new Date(),wi=(rd.getDay()+6)%7;document.querySelectorAll('#weekStrip .weekDay').forEach((el,i)=>el.classList.toggle('active',i===wi));$('todayDate').textContent=rd.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'});$('glBurn').textContent=h.burn?Math.round(h.burn)+' kcal':'—';$('glSteps').textContent=h.steps?Math.round(h.steps).toLocaleString():'—';$('glWater').textContent=Math.round(t.water)+' mL';let aw=document.querySelector('.activityCard>div:nth-child(3) small');if(aw)aw.textContent=db.targets.water.enabled?`Target ${db.targets.water.value} mL`:'Set a target ›';$('calorieMetric').innerHTML=metric('cal');$('macroMetrics').innerHTML=['c','f','p'].map(macroMini).join('');$('perfGrid').innerHTML=['fiber','water','sodium','potassium','sugar','satfat','calcium','iron','magnesium'].map(k=>{let n=N[k],g=db.targets[k],cur=Math.round(t[k]),goal=+g.value||0,pct=goal?Math.max(0,Math.min(100,cur/goal*100)):0,remaining=Math.max(0,goal-cur);return `<div class="perf"><b>${n[0]}</b><span class="perfValue">${cur}${g.enabled?` / ${goal}`:''} ${n[1]}</span>${g.enabled?`<div class="perfTrack"><div class="perfFill" style="width:${pct}%"></div></div><small class="perfRemain">${remaining} ${n[1]} remaining</small>`:''}</div>`}).join('');$('suppToday').innerHTML=db.supplements.length?`<h3 style="margin:18px 0 6px">Supplements</h3>${db.supplements.map((s,i)=>{let v=+(day().supp?.[i]||0);return `<div class="supp"><div><b>${esc(s.name)}</b><div class="small muted">${v} / ${s.target} ${s.unit}</div></div><button class="chip ${v>=s.target?'on':''}" data-takesupp="${i}">${v>=s.target?'Taken':'＋ Log'}</button></div>`}).join('')}`:'';document.querySelectorAll('[data-takesupp]').forEach(b=>b.onclick=()=>{let i=+b.dataset.takesupp,s=db.supplements[i];day().supp[i]=+(day().supp[i]||0)+(+s.target||1);save();renderToday()});let foods=day().foods||[];$('loggedCount').textContent=foods.length+' logged';$('mealList').innerHTML=foods.length?foods.map((x,i)=>`<div class="meal" data-meal="${i}"><div class="thumb">${x.photos?.[0]?`<img class="thumb" src="${x.photos[0]}">`:'🍽️'}</div><div class="mealText"><b>${esc(x.name||'Intake')}</b><small>${Math.round(+x.p||0)}P · ${Math.round(+x.c||0)}C · ${Math.round(+x.f||0)}F</small></div><b class="mealKcal">${Math.round(+x.cal||0)} kcal</b><span class="mealChev">‹</span></div>`).join(''):'<div class="muted" style="padding:20px 0;text-align:center">Nothing logged yet.</div>';wireMealRows()}

function wireMealRows(){document.querySelectorAll('[data-meal]').forEach(row=>{let startX=0,startY=0,dx=0,moved=false;const open=()=>openMeal(+row.dataset.meal);row.onclick=e=>{if(!moved)open()};row.addEventListener('touchstart',e=>{let t=e.touches[0];startX=t.clientX;startY=t.clientY;dx=0;moved=false;row.classList.add('swiping')},{passive:true});row.addEventListener('touchmove',e=>{let t=e.touches[0],x=t.clientX-startX,y=t.clientY-startY;if(Math.abs(x)>8&&Math.abs(x)>Math.abs(y)){dx=Math.min(0,Math.max(-72,x));moved=Math.abs(dx)>10;row.style.transform=`translateX(${dx}px)`}},{passive:true});row.addEventListener('touchend',()=>{row.classList.remove('swiping');row.style.transform='';if(dx<-42){moved=true;setTimeout(open,80)}setTimeout(()=>moved=false,220)},{passive:true})})}
let editMeal=null,photos=[],activePhoto=0;
function openMeal(i=null){editMeal=i;photos=[];activePhoto=0;['Name','Cal','P','C','F','Fiber','Water','Sodium','Potassium','Sugar','Satfat','Calcium','Iron','Magnesium'].forEach(x=>$('m'+x).value='');if(i!==null){let x=day().foods[i];$('mName').value=x.name||'';for(const[k,id]of [['cal','Cal'],['p','P'],['c','C'],['f','F'],['fiber','Fiber'],['water','Water'],['sodium','Sodium'],['potassium','Potassium'],['sugar','Sugar'],['satfat','Satfat'],['calcium','Calcium'],['iron','Iron'],['magnesium','Magnesium']])$('m'+id).value=x[k]||'';photos=x.photos||[];$('saveMeal').textContent='Save Changes';$('deleteMeal').classList.remove('hidden')}else{$('saveMeal').textContent='Add to Today';$('deleteMeal').classList.add('hidden')}setMealTab('edit');updateMealHero();show('mealView')}
function updateMealHero(){if(activePhoto>=photos.length)activePhoto=Math.max(0,photos.length-1);let p=photos[activePhoto];$('mealHero').classList.toggle('hasPhoto',!!p);if(p)$('mealHeroBg').src=p;let name=$('mName').value.trim()||(editMeal===null?'New Meal':'Meal');$('heroMealName').textContent=name;$('heroSubtitle').textContent=photos.length?(photos.length===1?'Meal photo':`Photo ${activePhoto+1} of ${photos.length}`):'Add a photo or enter nutrition manually';for(const[id,suf]of [['Cal',' kcal'],['P',' g'],['C',' g'],['F',' g'],['Fiber',' g']])$('hero'+id).textContent=(+$('m'+id).value||0)+suf;$('photoCount').textContent=photos.length;$('photoCount').classList.toggle('hidden',photos.length<2);$('heroDots').innerHTML=photos.length>1?photos.map((_,i)=>`<span class="heroDot ${i===activePhoto?'on':''}"></span>`).join(''):'';renderNutritionInfo()}
function showHeroPhoto(i){if(!photos.length)return;activePhoto=(i+photos.length)%photos.length;updateMealHero()}
function renderNutritionInfo(){let rows=[['Calories','Cal','kcal'],['Protein','P','g'],['Carbs','C','g'],['Fat','F','g'],['Fibre','Fiber','g'],['Water','Water','mL'],['Sodium','Sodium','mg'],['Potassium','Potassium','mg'],['Sugar','Sugar','g'],['Saturated fat','Satfat','g'],['Calcium','Calcium','mg'],['Iron','Iron','mg'],['Magnesium','Magnesium','mg']];$('nutritionPanel').innerHTML=rows.map(([n,id,u])=>`<div class="stat"><span>${n}</span><b>${+$('m'+id).value||0} ${u}</b></div>`).join('')}
function setMealTab(t){let edit=t==='edit';$('editMealTab').classList.toggle('on',edit);$('nutritionTab').classList.toggle('on',!edit);$('editMealPanel').classList.toggle('hidden',!edit);$('nutritionPanel').classList.toggle('hidden',edit)}
function photoMenu(open=true){$('photoSheet').classList.toggle('hidden',!open)}
function addFiles(fs){[...fs].forEach(f=>{let r=new FileReader;r.onload=e=>{let im=new Image;im.onload=()=>{let max=900,s=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);photos.push(c.toDataURL('image/jpeg',.72));activePhoto=photos.length-1;updateMealHero()};im.src=e.target.result};r.readAsDataURL(f)})}
function renderSettings(){theme();$('profileName').textContent=db.profile.name||'Your Profile';for(const id of ['profilePic','editProfilePic'])$(id).innerHTML=db.profile.photo?`<img class="profilePic" src="${db.profile.photo}">`:'👤';renderReminders()}
function renderReminders(){let box=$('reminderList');if(!db.reminders.length){box.innerHTML='<div class="muted" style="padding:8px 0 16px">No reminders yet.</div>';return}box.innerHTML=db.reminders.map((r,i)=>`<div class="settingsRow"><button class="linkBtn" data-editrem="${i}" style="text-align:left;flex:1;color:var(--text)"><b>${esc(r.name||(r.type==='meal'?'Meal':'Supplement'))}</b><div class="small muted">${r.type==='meal'?'Meal':'Supplement'} · ${r.time||'—'} · ${(r.days||[]).length===7?'Every day':(r.days||[]).map(d=>['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')}</div></button><input class="toggle" data-remtoggle="${i}" type="checkbox" ${r.enabled?'checked':''}></div>`).join('');document.querySelectorAll('[data-editrem]').forEach(b=>b.onclick=()=>openReminder(+b.dataset.editrem));document.querySelectorAll('[data-remtoggle]').forEach(t=>t.onchange=()=>{db.reminders[+t.dataset.remtoggle].enabled=t.checked;save()})}
let editReminder=null;function openReminder(i=null){editReminder=i;let r=i===null?{type:'meal',name:'',time:'08:00',days:[0,1,2,3,4,5,6],enabled:true}:db.reminders[i];$('reminderHeading').textContent=i===null?'Add Reminder':'Edit Reminder';$('rType').value=r.type||'meal';$('rName').value=r.name||'';$('rTime').value=r.time||'08:00';$('rEnabled').checked=r.enabled!==false;$('rSupplement').innerHTML='<option value="">Choose…</option>'+db.supplements.map((s,j)=>`<option value="${j}">${esc(s.name)}</option>`).join('');$('rSupplement').value=r.supplementIndex??'';document.querySelectorAll('[data-rday]').forEach(b=>b.classList.toggle('on',(r.days||[]).includes(+b.dataset.rday)));$('deleteReminder').classList.toggle('hidden',i===null);updateReminderType();show('reminderView')}
function updateReminderType(){$('rSuppWrap').classList.toggle('hidden',$('rType').value!=='supplement')}
function renderTargets(){$('targetInputs').innerHTML=Object.entries(N).map(([k,n])=>`<div class="settingsRow"><div><b>${n[0]}</b><div class="small muted">${n[1]} · ${n[2]==='limit'?'maximum':'goal'} · always tracked</div></div><div style="display:flex;align-items:center;gap:8px"><input id="tv_${k}" type="number" value="${db.targets[k].value}" style="width:90px" ${db.targets[k].enabled?'':'disabled'}><input class="toggle" id="te_${k}" type="checkbox" ${db.targets[k].enabled?'checked':''}></div></div>`).join('');Object.keys(N).forEach(k=>$('te_'+k).onchange=()=>{$('tv_'+k).disabled=!$('te_'+k).checked})}
function loadPersonal(){let p=db.personal||{};document.querySelectorAll('[data-goal]').forEach(b=>b.classList.toggle('on',(p.goals||[]).includes(b.dataset.goal)));$('pAge').value=p.age||'';$('pSex').value=p.sex||'male';$('pHeight').value=p.height||'';$('pWeight').value=p.weight||'';$('pActivity').value=p.activity||'1.55';$('pBodyfat').value=p.bodyfat||'';$('pTrend').value=p.trend||'unknown';$('pSessions').value=p.sessions||'0';$('pDailyActivity').value=p.dailyActivity||'Mostly sedentary';$('pLifting').value=p.lifting||'None';$('pCardio').value=p.cardio||'None';$('pAthlete').value=p.athlete||'Exercise regularly'}
function generate(){let p={goals:[...document.querySelectorAll('[data-goal].on')].map(x=>x.dataset.goal),age:+$('pAge').value,sex:$('pSex').value,height:+$('pHeight').value,weight:+$('pWeight').value,activity:$('pActivity').value,bodyfat:+$('pBodyfat').value||0,trend:$('pTrend').value,sessions:$('pSessions').value,dailyActivity:$('pDailyActivity').value,lifting:$('pLifting').value,cardio:$('pCardio').value,athlete:$('pAthlete').value};if(!p.goals.length||!p.age||!p.height||!p.weight)return alert('Add at least one goal, age, height and weight.');db.personal=p;let bmr=p.bodyfat?370+21.6*(p.weight*(1-p.bodyfat/100)):(10*p.weight+6.25*p.height-5*p.age+(p.sex==='male'?5:-161));let tdee=Math.round(bmr*(+p.activity));let cal=tdee;if(p.goals.includes('lose'))cal-=Math.round(Math.min(500,tdee*.18));if(p.goals.includes('muscle'))cal+=p.goals.includes('lose')?0:Math.round(Math.min(300,tdee*.1));if(p.goals.includes('performance'))cal+=p.goals.includes('lose')?100:100;let protein=Math.round(p.weight*(p.goals.includes('muscle')||p.goals.includes('lose')?2:1.7));let fat=Math.round(p.weight*.8),carbs=Math.max(80,Math.round((cal-protein*4-fat*9)/4));$('targetResult').innerHTML=`<div class="card"><div class="muted">Estimated maintenance</div><div class="result">${tdee} kcal/day</div><div class="muted">Suggested starting targets</div><div class="miniGrid"><div class="mini"><b>${cal}</b><div class="small muted">Calories</div></div><div class="mini"><b>${protein} g</b><div class="small muted">Protein</div></div><div class="mini"><b>${carbs} g</b><div class="small muted">Carbs</div></div><div class="mini"><b>${fat} g</b><div class="small muted">Fat</div></div></div><div class="notice" style="margin:12px 0">Prototype target assistant: these numbers are calculated locally from your answers. The secure AI service will add deeper reasoning and ongoing adjustments later.</div><button class="primary" id="useTargets">Use These Targets</button></div>`;$('useTargets').onclick=()=>{for(const[k,v]of Object.entries({cal, p:protein,c:carbs,f:fat})){db.targets[k].enabled=true;db.targets[k].value=v}save();renderToday();show('todayView')}}
function renderSupp(){let d=day();$('suppList').innerHTML=db.supplements.length?db.supplements.map((s,i)=>`<div class="supp"><div><b>${esc(s.name)}</b><div class="small muted">${s.target} ${s.unit}/day${s.time?' · reminder '+s.time:''}</div></div><button class="linkBtn" data-rms="${i}">Remove</button></div>`).join(''):'<div class="muted">No supplements added yet.</div>';document.querySelectorAll('[data-rms]').forEach(b=>b.onclick=()=>{db.supplements.splice(+b.dataset.rms,1);d.supp={};save();renderSupp();renderToday()})}
function progress(mode){document.querySelectorAll('[data-range]').forEach(x=>x.classList.toggle('on',x.dataset.range===mode));let days=mode==='month'?30:7;if(mode==='supp'){let rows=db.supplements.map((s,i)=>{let sum=0,hit=0;for(let d=0;d<7;d++){let dt=new Date();dt.setDate(dt.getDate()-d);let k=dt.toISOString().slice(0,10),v=+(db.days[k]?.supp?.[i]||0);sum+=v;if(v>=s.target)hit++}return `<div class="stat"><span><b>${esc(s.name)}</b><div class="small muted">${hit}/7 days hit target</div></span><b>${sum} ${s.unit}</b></div>`}).join('');$('progressContent').innerHTML=`<div class="card"><h2>Last 7 days</h2>${rows||'<div class="muted" style="margin-top:15px">Add supplements in Settings to track them here.</div>'}</div>`;return}let sums={cal:0,p:0,c:0};for(let d=0;d<days;d++){let dt=new Date();dt.setDate(dt.getDate()-d);let t=total(db.days[dt.toISOString().slice(0,10)]);for(const k of Object.keys(sums))sums[k]+=t[k]}$('progressContent').innerHTML=`<div class="card"><h2>Last ${days} days</h2>${Object.entries(sums).map(([k,v])=>`<div class="stat"><span>${N[k][0]} average</span><b>${Math.round(v/days)} ${N[k][1]}</b></div>`).join('')}</div>`}
function show(id){document.body.classList.toggle('todayMode',id==='todayView');document.body.classList.toggle('mealViewOnly',id==='mealView');['todayView','progressView','healthView','settingsView','mealView','targetsHubView','targetView','personaliseView','suppView','profileView','reminderView'].forEach(x=>$(x).classList.toggle('hidden',x!==id));document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.view===id));if(id==='todayView')renderToday();if(id==='healthView')renderHealth();if(id==='settingsView')renderSettings();if(id==='targetView')renderTargets();if(id==='personaliseView')loadPersonal();if(id==='targetsHubView')renderReminders();if(id==='suppView')renderSupp();scrollTo(0,0)}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>show(b.dataset.view));document.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>show(b.dataset.back));$('addIntakeBtn').onclick=()=>openMeal();$('targetSetupBtn').onclick=()=>show('targetsHubView');$('dailyTargetBtn').onclick=()=>show('targetView');$('personaliseBtn').onclick=()=>show('personaliseView');$('suppSettingsBtn').onclick=()=>show('suppView');$('editProfileBtn').onclick=()=>{$('nameInput').value=db.profile.name||'';$('emailInput').value=db.profile.email||'';renderSettings();show('profileView')};$('saveMeal').onclick=()=>{let x={name:$('mName').value.trim()||'Intake',photos:[...photos]};for(const[k,id]of [['cal','Cal'],['p','P'],['c','C'],['f','F'],['fiber','Fiber'],['water','Water'],['sodium','Sodium'],['potassium','Potassium'],['sugar','Sugar'],['satfat','Satfat'],['calcium','Calcium'],['iron','Iron'],['magnesium','Magnesium']])x[k]=+$('m'+id).value||0;if(editMeal===null)day().foods.push(x);else day().foods[editMeal]=x;save();show('todayView')};$('saveHealth').onclick=()=>{day().health={steps:+$('stepsInput').value||0,burn:+$('burnInput').value||0,weight:+$('weightInput').value||0,water:+$('waterInput').value||0};save();renderHealth();renderToday()};$('saveTargets').onclick=()=>{Object.keys(N).forEach(k=>{db.targets[k]={enabled:$('te_'+k).checked,value:+$('tv_'+k).value||N[k][3]}});save();show('todayView')};document.querySelectorAll('[data-goal]').forEach(b=>b.onclick=()=>b.classList.toggle('on'));$('generateTargets').onclick=generate;$('addSupp').onclick=()=>{let name=$('sName').value.trim(),target=+$('sTarget').value;if(!name||!target)return alert('Add a supplement name and daily target.');db.supplements.push({name,target,unit:$('sUnit').value,time:$('sTime').value});save();$('sName').value='';$('sTarget').value='';renderSupp();renderToday()};document.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>{db.theme=b.dataset.theme;save();theme();renderSettings()});$('addReminderBtn').onclick=()=>openReminder();$('rType').onchange=updateReminderType;document.querySelectorAll('[data-rday]').forEach(b=>b.onclick=()=>b.classList.toggle('on'));$('rSupplement').onchange=()=>{let i=$('rSupplement').value;if(i!==''&&!$('rName').value.trim())$('rName').value=db.supplements[+i]?.name||''};$('saveReminder').onclick=()=>{let days=[...document.querySelectorAll('[data-rday].on')].map(b=>+b.dataset.rday);if(!$('rName').value.trim())return alert('Give the reminder a name.');if(!$('rTime').value)return alert('Choose a reminder time.');if(!days.length)return alert('Choose at least one day.');let r={type:$('rType').value,name:$('rName').value.trim(),time:$('rTime').value,days,enabled:$('rEnabled').checked};if(r.type==='supplement'&&$('rSupplement').value!=='')r.supplementIndex=+$('rSupplement').value;if(editReminder===null)db.reminders.push(r);else db.reminders[editReminder]=r;save();show('targetsHubView');renderReminders()};$('deleteReminder').onclick=()=>{if(editReminder===null)return;db.reminders.splice(editReminder,1);save();show('targetsHubView');renderReminders()};$('changePhoto').onclick=()=>$('profilePhotoInput').click();$('profilePhotoInput').onchange=()=>{let f=$('profilePhotoInput').files[0];if(!f)return;let r=new FileReader;r.onload=e=>{db.profile.photo=e.target.result;save();renderSettings()};r.readAsDataURL(f)};$('saveProfile').onclick=()=>{db.profile.name=$('nameInput').value.trim();db.profile.email=$('emailInput').value.trim();save();show('settingsView')};document.querySelectorAll('[data-range]').forEach(b=>b.onclick=()=>progress(b.dataset.range));$('mealBack').onclick=()=>show('todayView');$('heroPhotoBtn').onclick=()=>photoMenu(true);$('takePhotoBtn').onclick=()=>{photoMenu(false);$('cameraInput').click()};$('choosePhotoBtn').onclick=()=>{photoMenu(false);$('libraryInput').click()};$('cancelPhotoBtn').onclick=()=>photoMenu(false);$('photoSheet').onclick=e=>{if(e.target===$('photoSheet'))photoMenu(false)};$('cameraInput').onchange=()=>{addFiles($('cameraInput').files);$('cameraInput').value=''};$('libraryInput').onchange=()=>{addFiles($('libraryInput').files);$('libraryInput').value=''};$('editMealTab').onclick=()=>setMealTab('edit');$('nutritionTab').onclick=()=>setMealTab('nutrition');['mName','mCal','mP','mC','mF','mFiber','mWater','mSodium','mPotassium','mSugar','mSatfat','mCalcium','mIron','mMagnesium'].forEach(id=>$(id).addEventListener('input',updateMealHero));$('deleteMeal').onclick=()=>{if(editMeal===null)return;if(confirm('Delete this meal?')){day().foods.splice(editMeal,1);save();show('todayView')}};
let heroStartX=0,heroStartY=0,heroSwipe=false;$('mealHero').addEventListener('touchstart',e=>{if(e.target.closest('button'))return;let t=e.touches[0];heroStartX=t.clientX;heroStartY=t.clientY;heroSwipe=true},{passive:true});$('mealHero').addEventListener('touchend',e=>{if(!heroSwipe||photos.length<2)return;heroSwipe=false;let t=e.changedTouches[0],dx=t.clientX-heroStartX,dy=t.clientY-heroStartY;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.2)showHeroPhoto(activePhoto+(dx<0?1:-1))},{passive:true});theme();renderToday();

// v17: horizontal swipe between the four main slides.
const MAIN_SLIDES=['todayView','progressView','healthView','settingsView'];
let slideTouch=null;
function visibleMainSlide(){
  return MAIN_SLIDES.find(id=>!$(id).classList.contains('hidden'));
}
function swipeBlocked(el){
  return !!el.closest('input,textarea,select,button,a,details,.meal,.mealHero,.photoSheet');
}
document.addEventListener('touchstart',e=>{
  if(e.touches.length!==1 || swipeBlocked(e.target)) return;
  const current=visibleMainSlide();
  if(!current) return;
  slideTouch={x:e.touches[0].clientX,y:e.touches[0].clientY,current};
},{passive:true});
document.addEventListener('touchend',e=>{
  if(!slideTouch || !e.changedTouches.length){slideTouch=null;return}
  const dx=e.changedTouches[0].clientX-slideTouch.x;
  const dy=e.changedTouches[0].clientY-slideTouch.y;
  if(Math.abs(dx)>70 && Math.abs(dx)>Math.abs(dy)*1.35){
    const i=MAIN_SLIDES.indexOf(slideTouch.current);
    if(dx<0 && i<MAIN_SLIDES.length-1) show(MAIN_SLIDES[i+1]);
    if(dx>0 && i>0) show(MAIN_SLIDES[i-1]);
  }
  slideTouch=null;
},{passive:true});

// v18 — date navigation and custom Performance targets.
if(!db.customTargets) db.customTargets=[];
let selectedDateKey = localStorage.getItem('cuttrackSelectedDate') || (()=>{
 const d=new Date(),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),dd=String(d.getDate()).padStart(2,'0');
 return `${y}-${m}-${dd}`;
})();
window.cuttrackSelectedDateKey=selectedDateKey;

function localISO(d){let y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`}
function setSelectedDate(d){
  selectedDateKey=localISO(d); window.cuttrackSelectedDateKey=selectedDateKey; localStorage.setItem('cuttrackSelectedDate',selectedDateKey);
  const today=localISO(new Date());
  const heading=$('dayHeading');
  if(heading) heading.innerHTML=(selectedDateKey===today?'Today':d.toLocaleDateString(undefined,{weekday:'long'}))+' <span class="todayDrop">⌄</span>';
  const td=$('todayDate'); if(td) td.textContent=d.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'});
  document.querySelectorAll('.weekDay').forEach((b,i)=>{
    const now=new Date(selectedDateKey+'T12:00:00'), monday=new Date(now); let diff=(now.getDay()+6)%7;
    monday.setDate(now.getDate()-diff); monday.setHours(12,0,0,0);
    const x=new Date(monday); x.setDate(monday.getDate()+i);
    b.classList.toggle('active',localISO(x)===selectedDateKey);
  });
  renderToday();
}
function weekDate(i){
  const base=new Date(selectedDateKey+'T12:00:00'); let diff=(base.getDay()+6)%7;
  const monday=new Date(base); monday.setDate(base.getDate()-diff); monday.setHours(12,0,0,0);
  monday.setDate(monday.getDate()+i); return monday;
}
document.querySelectorAll('.weekDay').forEach((b,i)=>b.addEventListener('click',()=>setSelectedDate(weekDate(i))));
const picker=$('calendarPicker');
$('dateOpenBtn')?.addEventListener('click',()=>{
  show('progressView');
  // Jump directly to the calendar without animated scrolling. On iOS Safari,
  // smooth scrolling a freshly-rendered section can cause long frame stalls.
  requestAnimationFrame(()=>{
    const cal=document.querySelector('.v40Calendar');
    if(cal){
      const y=cal.getBoundingClientRect().top + window.scrollY - 18;
      window.scrollTo(0,Math.max(0,y));
    }
  });
});
picker?.addEventListener('change',()=>{if(picker.value){let d=new Date(picker.value+'T12:00:00');setSelectedDate(d)}});

function saveCustomTargets(){localStorage.setItem('cuttrackCustomTargets',JSON.stringify(db.customTargets)); if(typeof save==='function') save()}
try{const c=JSON.parse(localStorage.getItem('cuttrackCustomTargets')||'null');if(Array.isArray(c))db.customTargets=c}catch(e){}
function renderCustomTargets(){
 const box=$('customTargetList'); if(!box)return;
 box.innerHTML=db.customTargets.length?db.customTargets.map((t,i)=>`<div class="customTargetRow"><div><b>${t.name}</b><small>${t.type==='limit'?'Maximum':'Goal'} ${t.value} ${t.unit}</small></div><button data-delct="${i}">Remove</button></div>`).join(''):'<div class="muted" style="padding:12px 0">No custom targets yet.</div>';
 box.querySelectorAll('[data-delct]').forEach(b=>b.onclick=()=>{db.customTargets.splice(+b.dataset.delct,1);saveCustomTargets();renderCustomTargets();renderCustomPerformance()});
}
function renderCustomPerformance(){
 const pg=$('perfGrid'); if(!pg)return;
 pg.querySelectorAll('.customPerf').forEach(x=>x.remove());
 db.customTargets.forEach(t=>{
   let el=document.createElement('div');el.className='perf customPerf';
   let on=t.enabled!==false,goal=+t.value||0,cur=0,pct=goal?Math.max(0,Math.min(100,cur/goal*100)):0;el.innerHTML=`<b>${t.name}</b><span class="perfValue">${cur}${on?` / ${goal}`:''} ${t.unit}</span>${on?`<div class="perfTrack"><div class="perfFill" style="width:${pct}%"></div></div><small class="perfRemain">${Math.max(0,goal-cur)} ${t.unit} remaining</small>`:''}`;
   pg.appendChild(el);
 });
}
$('newCustomTargetBtn')?.addEventListener('click',()=>{$('customTargetModal').classList.remove('hidden')});
$('ctCancel')?.addEventListener('click',()=>{$('customTargetModal').classList.add('hidden')});
$('ctUnit')?.addEventListener('change',()=>{$('ctCustomUnitWrap').classList.toggle('hidden',$('ctUnit').value!=='custom')});
$('ctSave')?.addEventListener('click',()=>{
 const name=$('ctName').value.trim(), value=parseFloat($('ctValue').value);
 let unit=$('ctUnit').value==='custom'?$('ctCustomUnit').value.trim():$('ctUnit').value;
 if(!name || !isFinite(value) || value<0 || !unit)return;
 db.customTargets.push({id:Date.now(),name,value,unit,type:$('ctType').value});
 saveCustomTargets();renderCustomTargets();renderCustomPerformance();$('customTargetModal').classList.add('hidden');
 $('ctName').value='';$('ctValue').value='';$('ctCustomUnit').value='';
});
renderCustomTargets();renderCustomPerformance();
setSelectedDate(new Date(selectedDateKey+'T12:00:00'));

// Make Targets the direct home for Targets & Personalisation.
$('targetSetupBtn')?.addEventListener('click',()=>{ if(typeof openTargets==='function') openTargets(); });

// v19 — every tracked metric appears in Daily Targets.
// A switch controls only whether a target is active; tracking itself always remains on.
const V19_STANDARD_TARGETS=[
 {key:'water',name:'Water',unit:'mL',type:'goal',def:3000},
 {key:'steps',name:'Steps',unit:'steps',type:'goal',def:10000},
 {key:'burned',name:'Burned',unit:'kcal',type:'goal',def:500},
 {key:'sodium',name:'Sodium',unit:'mg',type:'limit',def:2300},
 {key:'potassium',name:'Potassium',unit:'mg',type:'goal',def:3500},
 {key:'sugar',name:'Sugar',unit:'g',type:'limit',def:50},
 {key:'satfat',name:'Saturated Fat',unit:'g',type:'limit',def:20},
 {key:'calcium',name:'Calcium',unit:'mg',type:'goal',def:1000},
 {key:'iron',name:'Iron',unit:'mg',type:'goal',def:18},
 {key:'magnesium',name:'Magnesium',unit:'mg',type:'goal',def:400}
];
let v19Targets={};
try{v19Targets=JSON.parse(localStorage.getItem('cuttrackV19Targets')||'{}')||{}}catch(e){}
function saveV19Targets(){localStorage.setItem('cuttrackV19Targets',JSON.stringify(v19Targets))}
function switchMarkup(on,key,custom=false){
 return `<label class="switch"><input type="checkbox" ${on?'checked':''} data-v19toggle="${key}" data-custom="${custom?'1':'0'}"><span class="slider"></span></label>`;
}
function ensureStandardTargetRows(){
 const inline=$('customTargetsInline'); if(!inline)return;
 let std=$('v19StandardTargets');
 if(!std){std=document.createElement('div');std.id='v19StandardTargets';std.className='v19StandardTargets';inline.parentNode.insertBefore(std,inline)}
 // Avoid duplicating rows already present in the original v18 Daily Targets markup.
 const pageText=(std.parentElement?.innerText||'').toLowerCase();
 std.innerHTML=V19_STANDARD_TARGETS.filter(t=>{
   // Existing core items may already be present; only skip when an existing target label is actually found above injected block.
   const prior=(std.parentElement?.innerText||'').split('Create Custom Target')[0].toLowerCase();
   return !new RegExp('(^|\\n)'+t.name.toLowerCase()+'(\\n|$)').test(prior);
 }).map(t=>{
   const s=v19Targets[t.key]||{enabled:false,value:t.def};
   return `<div class="inlineTargetRow">
    <div><div class="targetName">${t.name}</div><div class="targetMeta">${t.unit} · ${t.type==='limit'?'maximum':'goal'} · always tracked</div></div>
    <input type="number" min="0" step="any" value="${s.value??t.def}" data-v19value="${t.key}" ${s.enabled?'':'disabled'}>
    ${switchMarkup(!!s.enabled,t.key)}
   </div>`;
 }).join('');
}
function renderCustomTargets(){
 const box=$('customTargetsInline'); if(!box)return;
 box.innerHTML=(db.customTargets||[]).map((t,i)=>{
   if(t.enabled===undefined)t.enabled=true;
   return `<div class="inlineTargetRow">
    <div><div class="targetName">${t.name}</div><div class="targetMeta">${t.unit} · ${t.type==='limit'?'maximum':'goal'} · custom target</div></div>
    <input type="number" min="0" step="any" value="${t.value}" data-ctvalue="${i}" ${t.enabled?'':'disabled'}>
    ${switchMarkup(!!t.enabled,String(i),true)}
    <button class="removeCT" data-delct="${i}" type="button">Remove ${t.name}</button>
   </div>`;
 }).join('');
 box.querySelectorAll('[data-delct]').forEach(b=>b.onclick=()=>{db.customTargets.splice(+b.dataset.delct,1);saveCustomTargets();renderCustomTargets();renderCustomPerformance()});
 box.querySelectorAll('[data-ctvalue]').forEach(inp=>inp.onchange=()=>{let t=db.customTargets[+inp.dataset.ctvalue];if(t){t.value=Math.max(0,parseFloat(inp.value)||0);saveCustomTargets();renderCustomPerformance()}});
}
document.addEventListener('change',e=>{
 const el=e.target;
 if(el.matches('[data-v19toggle]')){
   if(el.dataset.custom==='1'){
     const t=db.customTargets[+el.dataset.v19toggle];if(t){t.enabled=el.checked;saveCustomTargets();renderCustomTargets();renderCustomPerformance()}
   }else{
     const k=el.dataset.v19toggle;v19Targets[k]=v19Targets[k]||{};
     v19Targets[k].enabled=el.checked;
     const val=document.querySelector(`[data-v19value="${k}"]`);
     if(val){val.disabled=!el.checked;v19Targets[k].value=parseFloat(val.value)||0}
     saveV19Targets();
   }
 }
 if(el.matches('[data-v19value]')){
   const k=el.dataset.v19value;v19Targets[k]=v19Targets[k]||{};
   v19Targets[k].value=Math.max(0,parseFloat(el.value)||0);saveV19Targets();
 }
});
ensureStandardTargetRows();
renderCustomTargets();

// v22 — unify every target into the original Daily Targets card/list.
function v22UnifyTargets(){
  const view=$('targetView');
  if(!view)return;
  const std=$('v19StandardTargets');
  const custom=$('customTargetsInline');
  const create=document.querySelector('#targetView .targetCreateFooter');
  const saveBtn=[...view.querySelectorAll('button')].find(b=>(b.textContent||'').trim().includes('Save Daily Targets'));
  if(!saveBtn)return;

  // Find the original dark target card containing Calories/Protein/Carbs.
  const core=[...view.querySelectorAll('.card')].find(c=>{
    const tx=(c.textContent||'');
    return tx.includes('Calories') && tx.includes('Protein') && tx.includes('Carbs');
  });
  if(!core)return;

  // Put every additional standard and custom row inside that same card.
  if(std && std.parentElement!==core) core.appendChild(std);
  if(custom && custom.parentElement!==core) core.appendChild(custom);

  // Save is directly after the single target card.
  const saveWrap=saveBtn.parentElement;
  if(saveWrap && core.nextElementSibling!==saveWrap) core.after(saveWrap);

  // Create Custom Target is directly after Save.
  if(create){
    if(saveWrap && saveWrap.nextElementSibling!==create) saveWrap.after(create);
  }
}
v22UnifyTargets();
const v22Observer=new MutationObserver(()=>v22UnifyTargets());
v22Observer.observe(document.body,{childList:true,subtree:true});

// v23 — all standard metrics can be shown in Performance; custom targets auto-appear.
const V23_ALL_PERFORMANCE=[
 ['calories','Calories','kcal'],['protein','Protein','g'],['carbs','Carbs','g'],['fat','Fat','g'],
 ['fiber','Fibre','g'],['water','Water','mL'],['steps','Steps','steps'],['burned','Burned','kcal'],
 ['sodium','Sodium','mg'],['potassium','Potassium','mg'],['sugar','Sugar','g'],
 ['satfat','Saturated Fat','g'],['calcium','Calcium','mg'],['iron','Iron','mg'],['magnesium','Magnesium','mg']
];
let v23AllPerformance=localStorage.getItem('cuttrackAllPerformance')==='1';

function v23TargetState(k){
 if(db.targets && db.targets[k]) return db.targets[k];
 if(typeof v19Targets!=='undefined' && v19Targets[k]) return v19Targets[k];
 return {enabled:false,value:0};
}
function v23Current(k){
 try{
   if(typeof totals==='function'){const x=totals(); if(x && Number.isFinite(+x[k])) return +x[k]}
 }catch(e){}
 return 0;
}
function v23RenderAllPerformance(){
 if(!v23AllPerformance)return;
 const grid=$('perfGrid'); if(!grid)return;
 // Standard Performance items already rendered by v21 are retained. Add only missing standard items.
 const existing=[...grid.querySelectorAll('.perf b')].map(x=>(x.textContent||'').trim().toLowerCase());
 V23_ALL_PERFORMANCE.forEach(([k,name,unit])=>{
   if(existing.includes(name.toLowerCase()))return;
   const st=v23TargetState(k), on=!!st.enabled, goal=+st.value||0, cur=Math.round(v23Current(k));
   const pct=goal?Math.max(0,Math.min(100,cur/goal*100)):0, rem=Math.max(0,goal-cur);
   const el=document.createElement('div');el.className='perf v23Perf';
   el.innerHTML=`<b>${name}</b><span class="perfValue">${cur}${on?` / ${goal}`:''} ${unit}</span>${on?`<div class="perfTrack"><div class="perfFill" style="width:${pct}%"></div></div><small class="perfRemain">${rem} ${unit} remaining</small>`:''}`;
   grid.appendChild(el);
 });
}

// Newly-created custom targets already render through renderCustomPerformance.
// Re-wrap save click so it refreshes Performance immediately after creation.
const v23Save=$('ctSave');
if(v23Save){
 v23Save.addEventListener('click',()=>setTimeout(()=>{
   if(typeof renderCustomPerformance==='function')renderCustomPerformance();
   v23RenderAllPerformance();
 },0));
}
v23RenderAllPerformance();

// v24 — independent Target and Performance visibility controls.
const V24_BUILTINS=[
 ['calories','Calories','kcal'],['protein','Protein','g'],['carbs','Carbs','g'],['fat','Fat','g'],
 ['fiber','Fibre','g'],['water','Water','mL'],['steps','Steps','steps'],['burned','Burned','kcal'],
 ['sodium','Sodium','mg'],['potassium','Potassium','mg'],['sugar','Sugar','g'],
 ['satfat','Saturated Fat','g'],['calcium','Calcium','mg'],['iron','Iron','mg'],['magnesium','Magnesium','mg']
];
let v24Prefs={};
try{v24Prefs=JSON.parse(localStorage.getItem('cuttrackV24TargetPrefs')||'{}')||{}}catch(e){}
function v24SavePrefs(){localStorage.setItem('cuttrackV24TargetPrefs',JSON.stringify(v24Prefs))}
function v24Builtin(k){return V24_BUILTINS.find(x=>x[0]===k)}
function v24State(k){
 const meta=v24Builtin(k), old=(db.targets&&db.targets[k])||(typeof v19Targets!=='undefined'&&v19Targets[k])||{};
 const p=v24Prefs[k]||{};
 return {key:k,name:meta?meta[1]:k,unit:p.unit||meta?.[2]||'',value:p.value??old.value??0,enabled:p.enabled??!!old.enabled,performance:p.performance??false,custom:false}
}
function v24Current(k){
 try{if(typeof totals==='function'){const t=totals();if(t&&Number.isFinite(+t[k]))return +t[k]}}catch(e){}
 return 0;
}
let v24Editing=null;
function v24OpenTarget(key,customIndex=null){
 let s;
 if(customIndex!==null){
   const t=db.customTargets[customIndex]; if(!t)return;
   s={key:String(customIndex),name:t.name,unit:t.unit,value:t.value,enabled:t.enabled!==false,performance:t.performance!==false,custom:true,index:customIndex};
 }else s=v24State(key);
 v24Editing=s;
 $('etName').value=s.name;$('etValue').value=s.value;
 const known=[...$('etUnit').options].some(o=>o.value===s.unit);
 $('etUnit').value=known?s.unit:'custom';$('etCustomUnit').value=known?'':s.unit;
 $('etCustomUnitWrap').classList.toggle('hidden',known);
 $('etEnabled').checked=!!s.enabled;$('etPerformance').checked=!!s.performance;
 $('etDelete').classList.toggle('hidden',!s.custom);
 $('editTargetModal').classList.remove('hidden');
}
$('editTargetBack')?.addEventListener('click',()=>$('editTargetModal').classList.add('hidden'));
$('etUnit')?.addEventListener('change',()=>$('etCustomUnitWrap').classList.toggle('hidden',$('etUnit').value!=='custom'));
function v24RenderPerformance(){
 const grid=$('perfGrid');if(!grid)return;
 grid.innerHTML='';
 V24_BUILTINS.forEach(([k,name,defaultUnit])=>{
   const s=v24State(k);if(!s.performance)return;
   const cur=Math.round(v24Current(k)),goal=+s.value||0,pct=goal?Math.max(0,Math.min(100,cur/goal*100)):0,rem=Math.max(0,goal-cur);
   const el=document.createElement('div');el.className='perf';
   el.innerHTML=`<b>${name}</b><span class="perfValue">${cur}${s.enabled?` / ${goal}`:''} ${s.unit}</span>${s.enabled?`<div class="perfTrack"><div class="perfFill" style="width:${pct}%"></div></div><small class="perfRemain">${rem} ${s.unit} remaining</small>`:''}`;
   grid.appendChild(el);
 });
 (db.customTargets||[]).forEach((t,i)=>{
   if(t.performance===false)return;
   const on=t.enabled!==false,cur=0,goal=+t.value||0,pct=goal?Math.max(0,Math.min(100,cur/goal*100)):0;
   const el=document.createElement('div');el.className='perf customPerf';
   el.innerHTML=`<b>${t.name}</b><span class="perfValue">${cur}${on?` / ${goal}`:''} ${t.unit}</span>${on?`<div class="perfTrack"><div class="perfFill" style="width:${pct}%"></div></div><small class="perfRemain">${Math.max(0,goal-cur)} ${t.unit} remaining</small>`:''}`;
   grid.appendChild(el);
 });
}
$('etSave')?.addEventListener('click',()=>{
 if(!v24Editing)return;
 let unit=$('etUnit').value==='custom'?$('etCustomUnit').value.trim():$('etUnit').value;
 let value=Math.max(0,parseFloat($('etValue').value)||0);
 if(!unit)return;
 if(v24Editing.custom){
   let t=db.customTargets[v24Editing.index];if(!t)return;
   t.unit=unit;t.value=value;t.enabled=$('etEnabled').checked;t.performance=$('etPerformance').checked;
   if(typeof saveCustomTargets==='function')saveCustomTargets();
 }else{
   v24Prefs[v24Editing.key]={unit,value,enabled:$('etEnabled').checked,performance:$('etPerformance').checked};
   v24SavePrefs();
   // mirror target enable/value into legacy state so existing Today calculations remain compatible
   if(db.targets&&db.targets[v24Editing.key]){db.targets[v24Editing.key].enabled=$('etEnabled').checked;db.targets[v24Editing.key].value=value}
   if(typeof v19Targets!=='undefined'&&v19Targets[v24Editing.key]){v19Targets[v24Editing.key].enabled=$('etEnabled').checked;v19Targets[v24Editing.key].value=value;if(typeof saveV19Targets==='function')saveV19Targets()}
   if(typeof save==='function')save();
 }
 $('editTargetModal').classList.add('hidden');v24RenderPerformance();
 if(typeof renderCustomTargets==='function')renderCustomTargets();
});
$('etDelete')?.addEventListener('click',()=>{
 if(!v24Editing?.custom)return;
 db.customTargets.splice(v24Editing.index,1);
 if(typeof saveCustomTargets==='function')saveCustomTargets();
 $('editTargetModal').classList.add('hidden');v24RenderPerformance();
 if(typeof renderCustomTargets==='function')renderCustomTargets();
});

// Make every Daily Targets row tappable without breaking its existing switch/input.
function v24WireRows(){
 const view=$('targetView');if(!view)return;
 const rows=[...view.querySelectorAll('.targetRow,.inlineTargetRow')];
 rows.forEach(row=>{
   if(row.dataset.v24wired)return;row.dataset.v24wired='1';
   row.addEventListener('click',e=>{
     if(e.target.closest('input,select,label.switch,button'))return;
     const nm=(row.querySelector('b,.targetName')?.textContent||'').trim().toLowerCase();
     const builtin=V24_BUILTINS.find(x=>x[1].toLowerCase()===nm);
     if(builtin){v24OpenTarget(builtin[0]);return}
     const ci=(db.customTargets||[]).findIndex(t=>t.name.toLowerCase()===nm);
     if(ci>=0)v24OpenTarget(null,ci);
   });
 });
}
v24WireRows();
new MutationObserver(v24WireRows).observe(document.body,{childList:true,subtree:true});

// New custom targets default to visible in Performance and remain editable.
$('ctSave')?.addEventListener('click',()=>setTimeout(()=>{
 const arr=db.customTargets||[];if(arr.length){
   const t=arr[arr.length-1];
   if(t.performance===undefined){t.performance=true;if(t.enabled===undefined)t.enabled=true;if(typeof saveCustomTargets==='function')saveCustomTargets()}
 }
 v24WireRows();v24RenderPerformance();
},0));

// Replace v23 all-performance behavior with v24 individual preferences.
localStorage.removeItem('cuttrackAllPerformance');
v24RenderPerformance();

// v25 — one master tracking switch per metric + Edit for target/performance settings.
const V25_META=[
 ['calories','🔥','Calories'],['protein','🥩','Protein'],['carbs','🍞','Carbs'],['fat','💧','Fat'],
 ['fiber','🌿','Fibre'],['water','💧','Water'],['steps','👟','Steps'],['burned','🔥','Burned'],
 ['sodium','🧂','Sodium'],['potassium','🍌','Potassium'],['sugar','🧊','Sugar'],['satfat','🧈','Saturated Fat'],
 ['calcium','🦴','Calcium'],['iron','🩸','Iron'],['magnesium','💊','Magnesium']
];
let v25Tracking={};
try{v25Tracking=JSON.parse(localStorage.getItem('cuttrackV25Tracking')||'{}')||{}}catch(e){}
function v25SaveTracking(){localStorage.setItem('cuttrackV25Tracking',JSON.stringify(v25Tracking))}
function v25IsTracked(k){return v25Tracking[k]!==false}
function v25CustomTracked(t){return t.tracked!==false}
function v25Switch(on,key,custom=false){
 return `<label class="switch"><input type="checkbox" ${on?'checked':''} data-v25track="${key}" data-v25custom="${custom?'1':'0'}"><span class="slider"></span></label>`;
}
function v25RenderTargets(){
 const view=$('targetView');if(!view)return;
 let list=$('v25MetricList');
 if(!list){
   list=document.createElement('div');list.id='v25MetricList';
   const top=view.querySelector('.top');top.insertAdjacentElement('afterend',list);
 }
 let rows=V25_META.map(([k,emoji,name])=>`<div class="v25MetricRow ${v25IsTracked(k)?'':'off'}">
   <div class="v25Emoji">${emoji}</div><div class="v25Name">${name}</div>
   <button class="v25Edit" type="button" data-v25edit="${k}" ${v25IsTracked(k)?'':'disabled'}>Edit</button>
   ${v25Switch(v25IsTracked(k),k)}
 </div>`).join('');
 rows+=(db.customTargets||[]).map((t,i)=>`<div class="v25MetricRow ${v25CustomTracked(t)?'':'off'}">
   <div class="v25Emoji">${t.emoji||'✨'}</div><div class="v25Name">${t.name}</div>
   <button class="v25Edit" type="button" data-v25cedit="${i}" ${v25CustomTracked(t)?'':'disabled'}>Edit</button>
   ${v25Switch(v25CustomTracked(t),String(i),true)}
 </div>`).join('');
 list.innerHTML=rows;
 let create=$('v25Create');
 if(!create){create=document.createElement('button');create.id='v25Create';create.className='v25Create';create.type='button';create.textContent='+ Create Custom Target';list.insertAdjacentElement('afterend',create)}
 create.onclick=()=>{ if(typeof openCustomTarget==='function')openCustomTarget(); else $('customTargetModal')?.classList.remove('hidden') };
 list.querySelectorAll('[data-v25edit]').forEach(b=>b.onclick=()=>v24OpenTarget(b.dataset.v25edit));
 list.querySelectorAll('[data-v25cedit]').forEach(b=>b.onclick=()=>v24OpenTarget(null,+b.dataset.v25cedit));
}
document.addEventListener('change',e=>{
 const el=e.target;if(!el.matches('[data-v25track]'))return;
 if(el.dataset.v25custom==='1'){
   const t=(db.customTargets||[])[+el.dataset.v25track];if(t){t.tracked=el.checked;saveCustomTargets()}
 }else{v25Tracking[el.dataset.v25track]=el.checked;v25SaveTracking()}
 v25RenderTargets();v25RenderPerformance();
});

// Tracking OFF removes metric from app-facing Performance regardless of its saved Performance preference.
// Target ON/OFF remains independent and controls only goal/bar.
const v25OldRenderPerformance=v24RenderPerformance;
v24RenderPerformance=function(){
 const grid=$('perfGrid');if(!grid)return;
 grid.innerHTML='';
 V24_BUILTINS.forEach(([k,name])=>{
   const s=v24State(k);if(!v25IsTracked(k)||!s.performance)return;
   const cur=Math.round(v24Current(k)),goal=+s.value||0,pct=goal?Math.max(0,Math.min(100,cur/goal*100)):0,rem=Math.max(0,goal-cur);
   const el=document.createElement('div');el.className='perf';
   el.innerHTML=`<b>${name}</b><span class="perfValue">${cur}${s.enabled?` / ${goal}`:''} ${s.unit}</span>${s.enabled?`<div class="perfTrack"><div class="perfFill" style="width:${pct}%"></div></div><small class="perfRemain">${rem} ${s.unit} remaining</small>`:''}`;
   grid.appendChild(el);
 });
 (db.customTargets||[]).forEach(t=>{
   if(!v25CustomTracked(t)||t.performance===false)return;
   const on=t.enabled!==false,cur=0,goal=+t.value||0,pct=goal?Math.max(0,Math.min(100,cur/goal*100)):0;
   const el=document.createElement('div');el.className='perf customPerf';
   el.innerHTML=`<b>${t.name}</b><span class="perfValue">${cur}${on?` / ${goal}`:''} ${t.unit}</span>${on?`<div class="perfTrack"><div class="perfFill" style="width:${pct}%"></div></div><small class="perfRemain">${Math.max(0,goal-cur)} ${t.unit} remaining</small>`:''}`;
   grid.appendChild(el);
 });
};

// Edit modal uses Target as goal/bar only; master tracking is controlled from Daily Targets list.
const v25Open=v24OpenTarget;
v24OpenTarget=function(key,customIndex=null){
 v25Open(key,customIndex);
 // Ensure the two editor switches are the intended independent settings.
 $('etEnabled').closest('.editSwitchRow').querySelector('b').textContent='Target';
 $('etEnabled').closest('.editSwitchRow').querySelector('small').textContent='Show goal and progress bar';
 $('etPerformance').closest('.editSwitchRow').querySelector('b').textContent='Show in Performance';
};

// Refresh simplified list whenever Daily Targets is opened.
const v25Show=show;
show=function(id){v25Show(id);if(id==='targetView')setTimeout(v25RenderTargets,0)}
v25RenderTargets();

// Custom target creation defaults: tracked ON, target ON, Performance ON.
$('ctSave')?.addEventListener('click',()=>setTimeout(()=>{
 const a=db.customTargets||[],t=a[a.length-1];
 if(t){if(t.tracked===undefined)t.tracked=true;if(t.enabled===undefined)t.enabled=true;if(t.performance===undefined)t.performance=true;saveCustomTargets()}
 v25RenderTargets();v25RenderPerformance();
},10));

// v26 — approved colourful icon list, editable values, no master on/off switch.
// Saturated fat remains in nutrition data but is intentionally omitted from Daily Targets.
const V26_META=[
 ['calories','🔥','Calories'],['protein','🥩','Protein'],['carbs','🍞','Carbs'],['fat','🥑','Fat'],
 ['fiber','🌿','Fibre'],['water','💧','Water'],['sodium','🧂','Sodium'],['potassium','🍌','Potassium'],
 ['sugar','🧊','Sugar'],['calcium','🦴','Calcium'],['iron','🩸','Iron'],['magnesium','💊','Magnesium'],
 ['steps','👟','Steps'],['burned','🔥','Burned']
];
function v26Value(k){
 const s=v24State(k);
 if(s && s.value!==undefined && s.value!==null && s.value!=='') return s.value;
 const defaults={calories:2200,protein:180,carbs:200,fat:70,fiber:30,water:2700,sodium:2300,potassium:3500,sugar:50,calcium:1000,iron:8,magnesium:400,steps:10000,burned:500};
 return defaults[k]??0;
}
v25RenderTargets=function(){
 const view=$('targetView');if(!view)return;
 let list=$('v25MetricList');
 if(!list){list=document.createElement('div');list.id='v25MetricList';view.querySelector('.top').insertAdjacentElement('afterend',list)}
 let rows=V26_META.map(([k,icon,name])=>`<div class="v25MetricRow">
   <div class="v25Emoji">${icon}</div><div class="v25Name">${name}</div>
   <input class="v26Value" type="number" min="0" step="any" value="${v26Value(k)}" data-v26value="${k}" aria-label="${name} target">
   <button class="v25Edit" type="button" data-v25edit="${k}">Edit</button>
 </div>`).join('');
 rows+=(db.customTargets||[]).map((t,i)=>`<div class="v25MetricRow">
   <div class="v25Emoji">${t.emoji||'🎯'}</div><div class="v25Name">${t.name}</div>
   <input class="v26Value" type="number" min="0" step="any" value="${+t.value||0}" data-v26custom="${i}" aria-label="${t.name} target">
   <button class="v25Edit" type="button" data-v25cedit="${i}">Edit</button>
 </div>`).join('');
 list.innerHTML=rows;

 let create=$('v25Create');
 if(!create){create=document.createElement('button');create.id='v25Create';create.className='v25Create';create.type='button';create.textContent='+ Create Custom Target';list.insertAdjacentElement('afterend',create)}
 create.onclick=()=>{if(typeof openCustomTarget==='function')openCustomTarget();else $('customTargetModal')?.classList.remove('hidden')};
 list.querySelectorAll('[data-v25edit]').forEach(b=>b.onclick=()=>v24OpenTarget(b.dataset.v25edit));
 list.querySelectorAll('[data-v25cedit]').forEach(b=>b.onclick=()=>v24OpenTarget(null,+b.dataset.v25cedit));
};
document.addEventListener('change',e=>{
 if(e.target.matches('[data-v26value]')){
   const k=e.target.dataset.v26value,val=Math.max(0,parseFloat(e.target.value)||0);
   const s=v24State(k);v24Prefs[k]={...(v24Prefs[k]||{}),unit:s.unit,value:val,enabled:s.enabled,performance:s.performance};v24SavePrefs();
   if(db.targets&&db.targets[k])db.targets[k].value=val;
   if(typeof save==='function')save();
   v24RenderPerformance();
 }
 if(e.target.matches('[data-v26custom]')){
   const t=(db.customTargets||[])[+e.target.dataset.v26custom];
   if(t){t.value=Math.max(0,parseFloat(e.target.value)||0);saveCustomTargets();v24RenderPerformance()}
 }
});
// Ensure legacy master tracking never hides a metric in v26.
V26_META.forEach(([k])=>v25Tracking[k]=true);v25SaveTracking();
v25RenderTargets();

// v27 — Targets hub navigation. Today itself is intentionally unchanged.
$('targetsHubBack')?.addEventListener('click',()=>show('todayView'));
$('hubAiTarget')?.addEventListener('click',()=>show('personaliseView'));
$('hubMacros')?.addEventListener('click',()=>show('targetView'));
document.querySelectorAll('.reminderPreset').forEach(b=>b.addEventListener('click',()=>{const name=b.dataset.rpreset,time=b.dataset.rtime,type=b.dataset.rtype;const existing=db.reminders.findIndex(r=>r.name===name);if(existing>=0){openReminder(existing);return}db.reminders.push({type,name,time,days:[0,1,2,3,4,5,6],enabled:true});save();renderReminders()}));

// v28 — ONE target source of truth for AI Setup, Macros & Supplements and Today.
const V28_KEYMAP={
 calories:'cal', protein:'p', carbs:'c', fat:'f', fiber:'fiber', water:'water',
 sodium:'sodium', potassium:'potassium', sugar:'sugar', calcium:'calcium',
 iron:'iron', magnesium:'magnesium'
};
const V28_REVERSE=Object.fromEntries(Object.entries(V28_KEYMAP).map(([a,b])=>[b,a]));

function v28CanonicalKey(k){ return V28_KEYMAP[k] || k; }
function v28UiKey(k){ return V28_REVERSE[k] || k; }

function v28GetTarget(k){
 const ck=v28CanonicalKey(k);
 const base=(db.targets&&db.targets[ck]) || {};
 const ui=v24Prefs[v28UiKey(ck)] || {};
 return {
   value: ui.value ?? base.value ?? 0,
   enabled: ui.enabled ?? base.enabled ?? true,
   unit: ui.unit || (N[ck] ? N[ck][1] : '')
 };
}
function v28SetTarget(k,value,extra={}){
 const ck=v28CanonicalKey(k), uk=v28UiKey(ck), val=Math.max(0,+value||0);
 if(db.targets){
   if(!db.targets[ck]) db.targets[ck]={enabled:true,value:val};
   db.targets[ck].value=val;
   if(extra.enabled!==undefined) db.targets[ck].enabled=!!extra.enabled;
 }
 const prev=v24Prefs[uk]||{};
 v24Prefs[uk]={...prev,value:val};
 if(extra.enabled!==undefined)v24Prefs[uk].enabled=!!extra.enabled;
 if(extra.unit)v24Prefs[uk].unit=extra.unit;
 v24SavePrefs();
 if(typeof save==='function')save();
 return val;
}

// Make v24/v26 read the canonical values used by Today.
const v28OldState=v24State;
v24State=function(k){
 const s=v28OldState(k), ck=v28CanonicalKey(k);
 if(V28_REVERSE[ck] || N[ck]){
   const c=v28GetTarget(k);
   s.value=c.value;s.enabled=c.enabled;if(c.unit)s.unit=c.unit;
 }
 return s;
};

// Direct number edits now update canonical Today targets too.
document.addEventListener('change',e=>{
 if(e.target.matches('[data-v26value]')){
   const k=e.target.dataset.v26value;
   v28SetTarget(k,e.target.value);
   if(typeof render==='function')render();
   v25RenderTargets();v24RenderPerformance();
 }
},true);

// Save Changes in Edit synchronises the edited target to Today.
$('etSave')?.addEventListener('click',()=>{
 if(v24Editing && !v24Editing.custom){
   setTimeout(()=>{
     const k=v24Editing.key;
     const pref=v24Prefs[k];
     if(pref)v28SetTarget(k,pref.value,{enabled:pref.enabled,unit:pref.unit});
     if(typeof render==='function')render();
     v25RenderTargets();v24RenderPerformance();
   },0);
 }
});

// AI setup: after its existing generator/save action runs, copy its canonical
// db.targets values into Macros & Supplements so both screens display identically.
function v28SyncFromCanonical(){
 Object.entries(V28_KEYMAP).forEach(([uk,ck])=>{
   const t=db.targets&&db.targets[ck];
   if(t && t.value!==undefined){
     const old=v24Prefs[uk]||{};
     v24Prefs[uk]={...old,value:+t.value||0,enabled:t.enabled!==false,unit:old.unit||(N[ck]?N[ck][1]:'')};
   }
 });
 v24SavePrefs();
 if(typeof save==='function')save();
 if(typeof render==='function')render();
 v25RenderTargets();v24RenderPerformance();
}

// Hook all controls inside the existing AI/personalisation view that commit/generate targets.
// Sync occurs after the app's original click handler has completed.
$('personaliseView')?.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 const txt=(b.textContent||'').toLowerCase();
 if(/generate|calculate|apply|save|set targets|update targets/.test(txt)){
   setTimeout(v28SyncFromCanonical,20);
 }
});

// On startup migrate the existing Today values into Macros & Supplements.
// This immediately fixes old installs where the two screens had diverged.
v28SyncFromCanonical();

// v29 — Performance visibility and Target state are fully independent and saved reliably.
function v29State(k){
 const s=v24State(k);
 const pref=v24Prefs[k]||{};
 return {
   ...s,
   enabled: pref.enabled!==undefined ? !!pref.enabled : !!s.enabled,
   performance: pref.performance!==undefined ? !!pref.performance : !!s.performance
 };
}

v24RenderPerformance=function(){
 const grid=$('perfGrid');if(!grid)return;
 grid.innerHTML='';

 V26_META.forEach(([k,icon,name])=>{
   const s=v29State(k);
   if(!s.performance)return;

   const cur=Math.round(v24Current(k));
   const goal=+s.value||0;
   const pct=goal?Math.max(0,Math.min(100,cur/goal*100)):0;
   const rem=Math.max(0,goal-cur);
   const el=document.createElement('div');
   el.className='perf';
   el.innerHTML=`<b>${name}</b>
     <span class="perfValue">${cur}${s.enabled?` / ${goal}`:''} ${s.unit}</span>
     ${s.enabled?`<div class="perfTrack"><div class="perfFill" style="width:${pct}%"></div></div>
     <small class="perfRemain">${rem} ${s.unit} remaining</small>`:''}`;
   grid.appendChild(el);
 });

 (db.customTargets||[]).forEach(t=>{
   if(t.performance===false)return;
   const on=t.enabled!==false,cur=0,goal=+t.value||0;
   const pct=goal?Math.max(0,Math.min(100,cur/goal*100)):0;
   const el=document.createElement('div');
   el.className='perf customPerf';
   el.innerHTML=`<b>${t.name}</b>
     <span class="perfValue">${cur}${on?` / ${goal}`:''} ${t.unit}</span>
     ${on?`<div class="perfTrack"><div class="perfFill" style="width:${pct}%"></div></div>
     <small class="perfRemain">${Math.max(0,goal-cur)} ${t.unit} remaining</small>`:''}`;
   grid.appendChild(el);
 });
};

// Capture Edit Target switches before the existing save/close logic can lose them.
$('etSave')?.addEventListener('click',()=>{
 if(!v24Editing)return;

 const enabled=!!$('etEnabled')?.checked;
 const performance=!!$('etPerformance')?.checked;
 const value=Math.max(0,+($('etValue')?.value||0));
 const unit=$('etUnit')?.value||'';

 if(v24Editing.custom){
   const t=(db.customTargets||[])[v24Editing.index];
   if(t){
     t.enabled=enabled;
     t.performance=performance;
     t.value=value;
     t.unit=unit;
     saveCustomTargets();
   }
 }else{
   const k=v24Editing.key;
   const old=v24Prefs[k]||{};
   v24Prefs[k]={...old,enabled,performance,value,unit};
   v24SavePrefs();

   // Canonical Today target gets value/target state, but Performance remains a separate preference.
   const ck=v28CanonicalKey(k);
   if(db.targets&&db.targets[ck]){
     db.targets[ck].value=value;
     db.targets[ck].enabled=enabled;
   }
   if(typeof save==='function')save();
 }
 setTimeout(()=>{
   if(typeof render==='function')render();
   v25RenderTargets();
   v24RenderPerformance();
 },0);
},true);

// Whenever Performance is opened/rendered, use the current saved visibility flags.
$('perfToggle')?.addEventListener('click',()=>setTimeout(v24RenderPerformance,0));
v24RenderPerformance();

// v31 — built from v29, not v30.

// 1) AI Target Setup Back now returns to the Targets hub.
// Capture the existing back control while the personalisation view is active.
$('personaliseView')?.addEventListener('click',e=>{
 const b=e.target.closest('button,.back');
 if(!b)return;
 const txt=(b.textContent||'').trim().toLowerCase();
 if(b.classList.contains('back') || txt==='‹' || txt.includes('back')){
   e.preventDefault();e.stopImmediatePropagation();show('targetsHubView');
 }
},true);

// 2) Performance cards open the same Edit Target screen.
$('perfGrid')?.addEventListener('click',e=>{
 const card=e.target.closest('.perf');if(!card)return;
 const name=(card.querySelector('b')?.textContent||'').trim().toLowerCase();
 const hit=V26_META.find(x=>x[2].toLowerCase()===name);
 if(hit){v24OpenTarget(hit[0]);return}
 const i=(db.customTargets||[]).findIndex(t=>(t.name||'').trim().toLowerCase()===name);
 if(i>=0)v24OpenTarget(null,i);
});

// 3) Burned / Steps / Water use their Target state for a home progress bar.
// Patch the existing rendered cells conservatively by matching their visible labels.
function v31GlanceTargets(){
 const specs={
   burned:{label:'Burned',cur:()=>Math.round(day().health?.burn||0),unit:'kcal'},
   steps:{label:'Steps',cur:()=>Math.round(day().health?.steps||0),unit:''},
   water:{label:'Water',cur:()=>Math.round(day().health?.water||0),unit:'mL'}
 };
 Object.entries(specs).forEach(([k,o])=>{
   const s=v24State(k),on=!!s.enabled,goal=+s.value||0,cur=o.cur(),unit=s.unit||o.unit;
   const labels=[...document.querySelectorAll('#todayView *')].filter(el=>{
     if(el.children.length)return false;
     return (el.textContent||'').replace(/[🔥👟💧]/g,'').trim()===o.label;
   });
   const label=labels[0];if(!label)return;
   const cell=label.parentElement;if(!cell)return;

   // Keep label, replace only the value/status area we own.
   let box=cell.querySelector('.v31Glance');
   if(!box){box=document.createElement('div');box.className='v31Glance';cell.appendChild(box)}
   [...cell.children].forEach(ch=>{
     if(ch===label||ch===box)return;
     if(!ch.dataset.v31Display)ch.dataset.v31Display=ch.style.display||'__blank__';
     ch.style.display='none';
   });
   if(on){
     const pct=goal?Math.max(0,Math.min(100,cur/goal*100)):0;
     box.innerHTML=`<strong>${cur} / ${goal}${unit?' '+unit:''}</strong>
       <div class="v31Track"><div class="v31Fill" style="width:${pct}%"></div></div>`;
   }else{
     box.innerHTML=`<strong>${cur}${unit?' '+unit:''}</strong>`;
   }
 });
}

// Re-run focused UI after existing render without replacing the app's render/show functions.
function v31Refresh(){v24RenderPerformance();v31GlanceTargets()}
setTimeout(v31Refresh,0);
document.addEventListener('click',e=>{
 if(e.target.closest('#etSave,#targetSetupBtn,#hubMacros,.navBtn'))setTimeout(v31Refresh,30);
});

// Ensure Edit Save refreshes Performance and glance immediately.
$('etSave')?.addEventListener('click',()=>setTimeout(v31Refresh,30));

// v32 — selected date is the source of truth for the entire daily dashboard.
function v32SelectedHeading(){
 const h=document.querySelector('.glanceHead h2');if(!h)return;
 const today=localISO(new Date());
 if(selectedDateKey===today){h.textContent='Today at a glance';return}
 const d=new Date(selectedDateKey+'T12:00:00');
 h.textContent=d.toLocaleDateString(undefined,{weekday:'long'})+' at a glance';
}
const v32SetSelectedDate=setSelectedDate;
setSelectedDate=function(d){
 v32SetSelectedDate(d);
 v32SelectedHeading();
 setTimeout(()=>{if(typeof v31GlanceTargets==='function')v31GlanceTargets()},0);
};
v32SelectedHeading();

// v33 — Profile contains full Settings; Today Targets is simply the shortcut.
$('personaliseBtn')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();show('personaliseView')},true);
$('dailyTargetBtn')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();show('targetView')},true);

// Generic legal placeholders are deliberately non-binding until real policies are supplied.
document.querySelectorAll('[data-generic-info]').forEach(b=>b.addEventListener('click',()=>{
 const what=b.dataset.genericInfo==='privacy'?'Privacy Policy':'Terms & Conditions';
 alert(`${what} will be added here before CutTrack is released publicly.`);
}));

// v39 — one calendar/history system backed by the exact same db.days records as Today.
let v39MonthDate=new Date((window.cuttrackSelectedDateKey||key())+'T12:00:00');
function v39DateKey(d){
 const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),dd=String(d.getDate()).padStart(2,'0');
 return `${y}-${m}-${dd}`;
}
function v39HasData(k){
 const d=db.days?.[k];if(!d)return false;
 return !!((d.foods&&d.foods.length)||(+d.health?.steps)||(+d.health?.burn)||(+d.health?.water)||(+d.health?.weight)||Object.values(d.supp||{}).some(Number));
}
function v39RenderSummary(){
 const k=window.cuttrackSelectedDateKey||key(),d=db.days?.[k]||{foods:[],health:{steps:0,burn:0,weight:0,water:0},supp:{}};
 const dt=new Date(k+'T12:00:00'), foods=d.foods||[];
 const sum=foods.reduce((a,x)=>{a.cal+=+x.cal||0;a.p+=+x.p||0;a.c+=+x.c||0;a.f+=+x.f||0;return a},{cal:0,p:0,c:0,f:0});
 $('v39SelectedTitle').textContent=dt.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'});
 const h=d.health||{};
 const rows=[
  ['Calories',`${Math.round(sum.cal)} kcal`],['Protein',`${Math.round(sum.p)} g`],
  ['Carbs',`${Math.round(sum.c)} g`],['Fat',`${Math.round(sum.f)} g`],
  ['Burned',`${Math.round(+h.burn||0)} kcal`],['Steps',Math.round(+h.steps||0).toLocaleString()],
  ['Water',`${Math.round(+h.water||0)} mL`],['Weight',h.weight?`${(+h.weight).toFixed(1)} kg`:'—']
 ];
 $('v39SummaryGrid').innerHTML=rows.map(x=>`<div class="v39SummaryMetric"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('');
}
function v39RenderCalendar(){
 const y=v39MonthDate.getFullYear(),m=v39MonthDate.getMonth();
 $('v39MonthTitle').textContent=new Date(y,m,1).toLocaleDateString(undefined,{month:'long',year:'numeric'});
 const first=new Date(y,m,1,12),offset=(first.getDay()+6)%7,days=new Date(y,m+1,0).getDate();
 const prevDays=new Date(y,m,0).getDate(),selected=window.cuttrackSelectedDateKey||key(),today=v39DateKey(new Date());
 let cells=[];
 for(let i=0;i<42;i++){
   let d,other=false;
   if(i<offset){d=new Date(y,m-1,prevDays-offset+i+1,12);other=true}
   else if(i>=offset+days){d=new Date(y,m+1,i-offset-days+1,12);other=true}
   else d=new Date(y,m,i-offset+1,12);
   const k=v39DateKey(d);
   cells.push(`<button class="v39CalDay${other?' other':''}${v39HasData(k)?' hasData':''}${k===selected?' selected':''}${k===today?' today':''}" data-v39date="${k}" type="button">${d.getDate()}</button>`);
 }
 $('v39CalendarGrid').innerHTML=cells.join('');
 document.querySelectorAll('[data-v39date]').forEach(b=>b.onclick=()=>{
   const d=new Date(b.dataset.v39date+'T12:00:00');
   setSelectedDate(d);window.cuttrackSelectedDateKey=selectedDateKey;
   v39MonthDate=new Date(d);v39RenderCalendar();v39RenderSummary();
 });
 v39RenderSummary();
}
$('v39PrevMonth')?.addEventListener('click',()=>{v39MonthDate=new Date(v39MonthDate.getFullYear(),v39MonthDate.getMonth()-1,1,12);v39RenderCalendar()});
$('v39NextMonth')?.addEventListener('click',()=>{v39MonthDate=new Date(v39MonthDate.getFullYear(),v39MonthDate.getMonth()+1,1,12);v39RenderCalendar()});
$('v39OpenToday')?.addEventListener('click',()=>show('todayView'));

// Replace Progress's old week/month/supplement rendering when the tab opens.
const v39Show=show;
show=function(id){
 v39Show(id);
 if(false && id==='progressView'){}
};

// v40 Progress — weekly/monthly averages + full calendar
let v40MonthDate=new Date((window.cuttrackSelectedDateKey||key())+'T12:00:00');
function v40Key(d){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),dd=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${dd}`}
function v40Data(k){return db.days?.[k]||{foods:[],health:{steps:0,burn:0,weight:0,water:0}}}
function v40Logged(k){const d=db.days?.[k];return !!(d&&((d.foods&&d.foods.length)||+d.health?.steps||+d.health?.burn||+d.health?.water||+d.health?.weight))}
function v40Food(d){return (d.foods||[]).reduce((a,x)=>{a.cal+=+x.cal||0;a.p+=+x.p||0;a.c+=+x.c||0;a.f+=+x.f||0;return a},{cal:0,p:0,c:0,f:0})}
function v40Targets(){const val=k=>{const x=db.targets?.[k];return +(x&&typeof x==='object'?x.value:x)||0};return {cal:val('cal'),p:val('p'),c:val('c'),f:val('f')}}
function v40Range(keys){
 let n=0,s={cal:0,p:0,c:0,f:0,burn:0,steps:0,water:0,weight:0,weightN:0};
 keys.forEach(k=>{if(!v40Logged(k))return;n++;const d=v40Data(k),f=v40Food(d),h=d.health||{};['cal','p','c','f'].forEach(x=>s[x]+=f[x]);s.burn+=+h.burn||0;s.steps+=+h.steps||0;s.water+=+h.water||0;if(+h.weight){s.weight+=+h.weight;s.weightN++}});
 const div=n||1;return {logged:n,cal:s.cal/div,p:s.p/div,c:s.c/div,f:s.f/div,burn:s.burn/div,steps:s.steps/div,water:s.water/div,weight:s.weightN?s.weight/s.weightN:0}
}
function v40RingHTML(a){
 const t=v40Targets(),defs=[['cal','Calories','kcal','#0a84ff'],['p','Protein','g','#30d158'],['c','Carbs','g','#ff9f0a'],['f','Fat','g','#ffd60a']];
 return defs.map(([k,l,u,col])=>{const pct=t[k]?Math.min(100,Math.round(a[k]/t[k]*100)):0;const val=Math.round(a[k]);return `<div class="v40RingItem"><div class="v40Ring" style="--pct:${pct};--ring:${col}"><div class="v40RingVal">${val.toLocaleString()}<small>${u}</small></div></div><span>${l}</span></div>`}).join('')
}
function v40MiniHTML(a){return [['🔥','burn','Burned','kcal'],['👟','steps','Steps',''],['💧','water','Water','mL'],['⚖️','weight','Weight','kg']].map(([i,k,l,u])=>{let v=a[k];let text=k==='weight'?(v?v.toFixed(1):'—'):k==='steps'?Math.round(v).toLocaleString():Math.round(v).toLocaleString();return `<div class="v40Mini"><div class="ico">${i}</div><b>${text}${u?' '+u:''}</b><span>${l}</span></div>`}).join('')}
function v40Render(){
 const sel=new Date((window.cuttrackSelectedDateKey||key())+'T12:00:00');
 const dow=(sel.getDay()+6)%7,mon=new Date(sel);mon.setDate(sel.getDate()-dow);const weekKeys=[];for(let i=0;i<7;i++){let d=new Date(mon);d.setDate(mon.getDate()+i);weekKeys.push(v40Key(d))}
 const wa=v40Range(weekKeys);$('v40WeekLogged').textContent=`${wa.logged} / 7`;
 const sun=new Date(mon);sun.setDate(mon.getDate()+6);$('v40WeekRange').textContent=`${mon.toLocaleDateString(undefined,{day:'numeric',month:'short'})} – ${sun.toLocaleDateString(undefined,{day:'numeric',month:'short'})}`;
 $('v40WeekRings').innerHTML=v40RingHTML(wa);$('v40WeekMini').innerHTML=v40MiniHTML(wa);

 const y=v40MonthDate.getFullYear(),m=v40MonthDate.getMonth(),days=new Date(y,m+1,0).getDate(),monthKeys=[];
 for(let d=1;d<=days;d++)monthKeys.push(v40Key(new Date(y,m,d,12)));
 const ma=v40Range(monthKeys);$('v40MonthLogged').textContent=`${ma.logged} / ${days}`;$('v40MonthLabel').textContent=new Date(y,m,1).toLocaleDateString(undefined,{month:'long',year:'numeric'});
 $('v40MonthRings').innerHTML=v40RingHTML(ma);$('v40MonthMini').innerHTML=v40MiniHTML(ma);

 $('v40CalTitle').textContent=new Date(y,m,1).toLocaleDateString(undefined,{month:'long',year:'numeric'});
 const first=new Date(y,m,1,12),off=(first.getDay()+6)%7,prev=new Date(y,m,0).getDate(),selected=window.cuttrackSelectedDateKey||key(),today=v40Key(new Date());let cells=[];
 for(let i=0;i<42;i++){let d,other=false;if(i<off){d=new Date(y,m-1,prev-off+i+1,12);other=true}else if(i>=off+days){d=new Date(y,m+1,i-off-days+1,12);other=true}else d=new Date(y,m,i-off+1,12);const k=v40Key(d);cells.push(`<button type="button" data-v40date="${k}" class="v40CalDay${other?' other':''}${v40Logged(k)?' hasData':''}${k===selected?' selected':''}${k===today?' today':''}">${d.getDate()}</button>`)}
 $('v40CalendarGrid').innerHTML=cells.join('');
 document.querySelectorAll('[data-v40date]').forEach(b=>b.addEventListener('click',()=>{const d=new Date(b.dataset.v40date+'T12:00:00');setSelectedDate(d);window.cuttrackSelectedDateKey=selectedDateKey;v40MonthDate=new Date(d);v40Render()}));
}
$('v40PrevMonth')?.addEventListener('click',()=>{v40MonthDate=new Date(v40MonthDate.getFullYear(),v40MonthDate.getMonth()-1,1,12);v40Render()});
$('v40NextMonth')?.addEventListener('click',()=>{v40MonthDate=new Date(v40MonthDate.getFullYear(),v40MonthDate.getMonth()+1,1,12);v40Render()});
const v40Show=show;show=function(id){v40Show(id);if(id==='progressView'){v40MonthDate=new Date((window.cuttrackSelectedDateKey||key())+'T12:00:00');setTimeout(v40Render,0)}};

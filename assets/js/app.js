(function(){
'use strict';
var WA='966506489563';
var root=document.documentElement;
function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){return null;}}

/* ---------- language ---------- */
var lang=store('qd-lang')||'en';
function t(en,ar){return lang==='ar'?ar:en;}
function applyLang(){
  root.lang=lang;root.dir=lang==='ar'?'rtl':'ltr';
  document.querySelectorAll('[data-en]').forEach(function(el){
    var v=el.getAttribute('data-'+lang);if(v!==null)el.innerHTML=v;
  });
  document.querySelectorAll('[data-ph-en]').forEach(function(el){el.placeholder=el.getAttribute('data-ph-'+lang);});
  var ti=document.querySelector('title[data-en]');if(ti)document.title=ti.getAttribute('data-'+lang);
  document.querySelectorAll('.seg [data-l]').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.l===lang?'true':'false');});
  renderStatus();renderSlots();
}
function setLang(l){lang=l;store('qd-lang',l);applyLang();}

/* ---------- theme ---------- */
var theme=store('qd-theme')||'dark';
function applyTheme(){
  if(theme==='light')root.setAttribute('data-theme','light');else root.removeAttribute('data-theme');
  var sw=document.getElementById('themeSw');if(sw){sw.setAttribute('aria-checked',theme==='dark'?'true':'false');sw.setAttribute('aria-label',theme==='dark'?'Switch to light mode':'Switch to dark mode');}
}

/* ---------- hours / status (Asia/Riyadh) ---------- */
var HOURS={0:[9,23],1:[9,23],2:[9,23],3:[9,23],4:[9,23],5:[14,23],6:[9,23]};
var DAYMAP={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};
function riyadhNow(){
  var f=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Riyadh',weekday:'short',hour:'numeric',minute:'numeric',hour12:false});
  var o={};f.formatToParts(new Date()).forEach(function(p){o[p.type]=p.value;});
  var h=parseInt(o.hour,10);if(h===24)h=0;
  return {day:DAYMAP[o.weekday],h:h,m:parseInt(o.minute,10)};
}
function fmt(h){var ap=h>=12?(lang==='ar'?'م':'PM'):(lang==='ar'?'ص':'AM');var x=h%12;if(x===0)x=12;return x+':00 '+ap;}
function renderStatus(){
  var els=document.querySelectorAll('[data-status]');if(!els.length)return;
  var n=riyadhNow(),hr=HOURS[n.day],cur=n.h+n.m/60,open=hr&&cur>=hr[0]&&cur<hr[1],txt,cls;
  if(open){cls='open';txt=t('Open now · until '+fmt(hr[1]),'مفتوح الآن · حتى '+fmt(hr[1]));}
  else{
    cls='closed';var d=n.day,nxt=null,k;
    if(hr&&cur<hr[0]){nxt=[0,hr[0]];}
    else{for(k=1;k<=7;k++){var dd=(n.day+k)%7;if(HOURS[dd]){nxt=[k,HOURS[dd][0]];break;}}}
    txt=t('Closed now · opens '+(nxt[0]===0?'today':nxt[0]===1?'tomorrow':'soon')+' at '+fmt(nxt[1]),'مغلق الآن · يفتح '+(nxt[0]===0?'اليوم':nxt[0]===1?'غدًا':'قريبًا')+' الساعة '+fmt(nxt[1]));
  }
  els.forEach(function(el){
    el.querySelector('.dot').className='dot '+cls;
    el.querySelector('.st').textContent=txt;
  });
  document.querySelectorAll('.hours tr[data-d]').forEach(function(tr){tr.classList.toggle('today',parseInt(tr.dataset.d,10)===n.day);});
}

/* ---------- toast ---------- */
function toast(msg){
  var el=document.getElementById('toast');if(!el)return;
  el.textContent=msg;el.classList.add('show');
  clearTimeout(toast._t);toast._t=setTimeout(function(){el.classList.remove('show');},2600);
}

/* ---------- booking form ---------- */
var chosenSlot=null;
function slotsFor(dateStr){
  if(!dateStr)return null;
  var p=dateStr.split('-').map(Number);
  var wd=new Date(Date.UTC(p[0],p[1]-1,p[2])).getUTCDay();
  var hr=HOURS[wd];if(!hr)return [];
  var out=[];for(var h=hr[0];h<hr[1];h++)out.push(h);return out;
}
function renderSlots(){
  var box=document.getElementById('slots');if(!box)return;
  var d=document.getElementById('date').value;
  var list=slotsFor(d);box.innerHTML='';
  if(list===null){box.innerHTML='<span class="fine">'+t('Pick a date to see call times.','اختار التاريخ علشان تظهر المواعيد.')+'</span>';return;}
  if(!list.length){box.innerHTML='<span class="err">'+t('We are closed that day. Pick another date.','مغلقين في اليوم ده. اختار يوم تاني.')+'</span>';chosenSlot=null;return;}
  list.forEach(function(h){
    var b=document.createElement('button');b.type='button';b.className='slot';b.textContent=fmt(h);
    b.setAttribute('aria-pressed',chosenSlot===h?'true':'false');
    b.addEventListener('click',function(){chosenSlot=h;renderSlots();});
    box.appendChild(b);
  });
  if(chosenSlot!==null&&list.indexOf(chosenSlot)<0)chosenSlot=null;
}
function buildMessage(f){
  var pkgSel=document.getElementById('pkg');
  var pkg=pkgSel.options[pkgSel.selectedIndex].text;
  var L=lang==='ar'?[
    'السلام عليكم، أريد الاستفسار عن رحلة عمرة.',
    'الاسم: '+f.name,'الجوال: '+f.phone,'عدد المعتمرين: '+f.pax,
    'الباقة المطلوبة: '+pkg,'منطقة الانطلاق في الرياض: '+(f.area||'-'),
    'التاريخ المفضل: '+f.date,'وقت الاتصال المناسب: '+fmt(chosenSlot),
    f.note?('ملاحظات: '+f.note):''
  ]:[
    'Assalamu alaikum, I would like to ask about an Umrah trip.',
    'Name: '+f.name,'Phone: '+f.phone,'Travellers: '+f.pax,
    'Package: '+pkg,'Pick-up area in Riyadh: '+(f.area||'-'),
    'Preferred date: '+f.date,'Best time to call: '+fmt(chosenSlot),
    f.note?('Notes: '+f.note):''
  ];
  return L.filter(Boolean).join('\n');
}
function initForm(){
  var form=document.getElementById('bookForm');if(!form)return;
  var d=document.getElementById('date');
  var now=riyadhNow(),dt=new Date();var iso=new Date(dt.getTime()-dt.getTimezoneOffset()*60000).toISOString().slice(0,10);
  d.min=iso;d.addEventListener('change',function(){chosenSlot=null;renderSlots();});
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var f={name:form.name.value.trim(),phone:form.phone.value.trim(),pax:form.pax.value,area:form.area.value.trim(),date:d.value,note:form.note.value.trim()};
    var err=document.getElementById('formErr'),msg=[];
    if(!f.name)msg.push(t('Enter your name.','اكتب اسمك.'));
    if(f.phone.replace(/\D/g,'').length<9)msg.push(t('Enter a valid phone number.','اكتب رقم جوال صحيح.'));
    if(!f.date)msg.push(t('Pick a date.','اختار التاريخ.'));
    else if(chosenSlot===null)msg.push(t('Pick a call time.','اختار وقت الاتصال.'));
    err.textContent=msg.join(' ');
    if(msg.length)return;
    var url='https://wa.me/'+WA+'?text='+encodeURIComponent(buildMessage(f));
    window.open(url,'_blank','noopener');
    toast(t('Opening WhatsApp…','جاري فتح واتساب…'));
  });
}

/* ---------- hero video ---------- */
function initHero(){
  var v=document.getElementById('heroVid');if(!v)return;
  var mobile=window.matchMedia('(max-width:760px)').matches;
  var name=mobile?'mobile':'laptop';
  v.poster='assets/media/hero-'+name+'-poster.jpg';
  var reduce=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var btn=document.getElementById('pauseBtn');
  function icon(){btn.querySelector('.ic').textContent=v.paused?'play_arrow':'pause';btn.setAttribute('aria-label',v.paused?'Play background video':'Pause background video');}
  if(!reduce){v.src='assets/media/hero-'+name+'.mp4';var pr=v.play();if(pr&&pr.catch)pr.catch(function(){icon();});}
  btn.addEventListener('click',function(){if(!v.getAttribute('src')){v.src='assets/media/hero-'+name+'.mp4';}if(v.paused)v.play();else v.pause();icon();});
  v.addEventListener('play',icon);v.addEventListener('pause',icon);icon();
}

/* ---------- wiring ---------- */
document.addEventListener('DOMContentLoaded',function(){
  applyTheme();applyLang();initForm();initHero();
  document.querySelectorAll('.seg [data-l]').forEach(function(b){b.addEventListener('click',function(){setLang(b.dataset.l);});});
  var sw=document.getElementById('themeSw');if(sw)sw.addEventListener('click',function(){theme=theme==='dark'?'light':'dark';store('qd-theme',theme);applyTheme();});
  var bg=document.getElementById('burger'),nav=document.getElementById('nav');
  if(bg)bg.addEventListener('click',function(){var o=nav.classList.toggle('open');bg.setAttribute('aria-expanded',o?'true':'false');});
  setInterval(renderStatus,60000);
});
})();

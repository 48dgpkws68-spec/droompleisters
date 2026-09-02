(function(){
  // --- scroll reveals: rect-check werkt ook waar IO stilstaat ----------
  var pending=Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  function checkReveals(){
    if(!pending.length){clearInterval(revTimer);return;}
    var vh=window.innerHeight||document.documentElement.clientHeight;
    pending=pending.filter(function(el){
      var r=el.getBoundingClientRect();
      if(r.top<vh-30&&r.bottom>0){el.classList.add('in');return false;}
      return true;
    });
  }
  var revTimer=setInterval(checkReveals,600);
  window.addEventListener('scroll',checkReveals,{passive:true});
  window.addEventListener('resize',checkReveals);
  checkReveals();

  // --- adaptieve navigatie: donker boven de hero, parelwit daarna ------
  var nav=document.getElementById('siteNav'), heroEl=document.querySelector('.hero');
  function paintNav(){
    if(!nav||!heroEl) return;
    nav.classList.toggle('lit',window.scrollY>heroEl.offsetHeight-120);
  }
  window.addEventListener('scroll',paintNav,{passive:true});
  paintNav();

  // --- starfields -----------------------------------------------------
  document.querySelectorAll('.starfield').forEach(function(field){
    var n=parseInt(field.dataset.stars||'50',10);
    for(var i=0;i<n;i++){
      var s=document.createElement('span');
      s.className='star';
      var size=(Math.random()*1.8+.6).toFixed(1);
      s.style.width=size+'px'; s.style.height=size+'px';
      s.style.left=(Math.random()*100).toFixed(2)+'%';
      s.style.top=(Math.random()*100).toFixed(2)+'%';
      s.style.setProperty('--tw',(Math.random()*3+2.4).toFixed(1)+'s');
      s.style.setProperty('--td',(Math.random()*4).toFixed(1)+'s');
      field.appendChild(s);
    }
  });

  // --- faq accordion --------------------------------------------------
  document.querySelectorAll('.faq-item').forEach(function(item){
    var q=item.querySelector('.faq-q'), a=item.querySelector('.faq-a');
    q.addEventListener('click',function(){
      var open=item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(other){
        other.classList.remove('open');
        other.querySelector('.faq-a').style.maxHeight='0px';
        other.querySelector('.faq-q').setAttribute('aria-expanded','false');
      });
      if(!open){
        item.classList.add('open');
        a.style.maxHeight=a.scrollHeight+'px';
        q.setAttribute('aria-expanded','true');
      }
    });
  });

  // --- sticky mobile cta ----------------------------------------------
  var sticky=document.getElementById('stickyCta'), bestel=document.getElementById('bestel');
  if(sticky){
    window.addEventListener('scroll',function(){
      var past=heroEl?window.scrollY>heroEl.offsetHeight*.75:window.scrollY>360;
      var inPricing=false;
      if(bestel){
        var r=bestel.getBoundingClientRect();
        inPricing=r.top<window.innerHeight&&r.bottom>0;
      }
      sticky.classList.toggle('show',past&&!inPricing);
    },{passive:true});
  }

  // --- order modal ----------------------------------------------------
  var modal=document.getElementById('orderModal');
  var lastFocus=null;
  var inertTargets=['.topbar','#siteNav','main','footer','#stickyCta'];
  function setInert(on){inertTargets.forEach(function(sel){var el=document.querySelector(sel);if(el){if(on)el.setAttribute('inert','');else el.removeAttribute('inert');}});}
  function euro(n){ return '€'+n.toFixed(2).replace('.',','); }
  function updateTotal(){
    var checked=modal.querySelector('input[name=bundel]:checked');
    if(!checked) return;
    var price=parseFloat(checked.dataset.price||'0'), boxes=parseInt(checked.dataset.boxes||'1',10), club=checked.dataset.club==='1';
    var landEl=document.getElementById('f-land'); var be=landEl&&landEl.value==='België';
    var ship=(!club&&be&&boxes<2)?4.95:0;
    var total=price+ship;
    var line, note;
    if(club){
      line='Vandaag: <b>'+euro(price)+'</b> · daarna '+euro(price)+' elke 30 dagen · altijd gratis verzending';
      note='Bestelling met betaalverplichting · met je eerste betaling geef je een machtiging: daarna '+euro(price)+' elke 30 dagen via automatische incasso of je creditcard · opzeggen kan altijd, zonder termijn.';
    }else if(ship>0){
      line='Totaal: <b>'+euro(total)+'</b> · incl. €4,95 verzending naar België';
      note='Bestelling met betaalverplichting · eenmalige betaling · 14 dagen bedenktijd · 30 nachten garantie op je eerste doos.';
    }else{
      line='Totaal: <b>'+euro(total)+'</b> · gratis verzending';
      note='Bestelling met betaalverplichting · eenmalige betaling · 14 dagen bedenktijd · 30 nachten garantie op je eerste doos.';
    }
    var totalEl=document.getElementById('modalTotal');
    if(totalEl) totalEl.innerHTML=line;
    var btnTotal=document.getElementById('orderBtnTotal');
    if(btnTotal) btnTotal.textContent=euro(total);
    var noteEl=document.getElementById('orderNote');
    if(noteEl) noteEl.textContent=note;
    var hidden=document.getElementById('orderTotaal');
    if(hidden) hidden.value=euro(total)+(club?' (Droomclub, elke 30 dagen)':'');
    var hv=document.getElementById('orderVerzending');
    if(hv) hv.value=ship>0?euro(ship):'gratis';
    var nx=modal.querySelector('input[name=_next]');
    if(nx) nx.value=location.origin+location.pathname+'?bevestigd=bestelling&bundel='+checked.id.slice(1);
  }
  var landSel=document.getElementById('f-land');
  if(landSel) landSel.addEventListener('change',updateTotal);
  function openModal(bundle){
    if(bundle){var r=document.getElementById('b'+bundle); if(r) r.checked=true;}
    updateTotal();
    lastFocus=document.activeElement;
    modal.classList.add('open');
    document.body.style.overflow='hidden';
    setInert(true);
    var first=modal.querySelector('input[type=radio]:checked')||modal.querySelector('input,button');
    if(first) first.focus();
  }
  function closeModal(){
    modal.classList.remove('open');
    document.body.style.overflow='';
    setInert(false);
    if(lastFocus){ lastFocus.focus(); lastFocus=null; }
  }
  modal.querySelectorAll('input[name=bundel]').forEach(function(r){
    r.addEventListener('change',updateTotal);
  });
  updateTotal();
  document.querySelectorAll('[data-order]').forEach(function(btn){
    btn.addEventListener('click',function(e){ e.preventDefault(); openModal(btn.dataset.order); });
  });
  modal.addEventListener('click',function(e){ if(e.target===modal) closeModal(); });
  modal.querySelector('[data-close]').addEventListener('click',closeModal);
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&modal.classList.contains('open')) closeModal();
    if(e.key==='Tab'&&modal.classList.contains('open')){
      var focusables=Array.prototype.filter.call(
        modal.querySelectorAll('button,input,select,[href]'),
        function(el){ return !el.disabled&&el.offsetParent!==null; }
      );
      if(!focusables.length) return;
      var first=focusables[0],last=focusables[focusables.length-1],a=document.activeElement;
      if(e.shiftKey&&(a===first||!modal.contains(a))){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&(a===last||!modal.contains(a))){e.preventDefault();first.focus();}
    }
  });

  // --- submit-state: voorkom dubbele inzendingen ------------------------
  document.querySelectorAll('form[action*="formsubmit.co"]').forEach(function(f){
    f.addEventListener('submit',function(){
      var b=f.querySelector('button[type=submit]');
      if(b){ b.disabled=true; b.dataset.txt=b.innerHTML; b.textContent='Versturen…'; setTimeout(function(){ if(b.disabled){ b.disabled=false; b.innerHTML=b.dataset.txt; } },8000); }
    });
  });
  window.addEventListener('pageshow',function(){
    document.querySelectorAll('button[type=submit][disabled]').forEach(function(b){
      b.disabled=false;
      if(b.dataset.txt) b.innerHTML=b.dataset.txt;
    });
  });

  // --- _next meeschalen met het actieve domein --------------------------
  document.querySelectorAll('input[name=_next]').forEach(function(i){
    var q=(i.value.split('?')[1]||'bevestigd=bestelling');
    i.value=location.origin+location.pathname+'?'+q;
  });

  // --- bevestigingsmodal na redirect ------------------------------------
  var confirmModal=document.getElementById('confirmModal');
  function closeConfirm(){ confirmModal.classList.remove('open'); document.body.style.overflow=''; setInert(false); var b=document.querySelector('.brand'); if(b) b.focus(); }
  confirmModal.querySelectorAll('[data-close-confirm]').forEach(function(b){ b.addEventListener('click',closeConfirm); });
  confirmModal.addEventListener('click',function(e){ if(e.target===confirmModal) closeConfirm(); });
  var mConf=location.search.match(/[?&]bevestigd=(bestelling|droomclub|contact)/);
  if(mConf){
    var t=document.getElementById('confirmTitle'), x=document.getElementById('confirmText');
    if(mConf[1]==='bestelling'){
      t.textContent='Bestelling geplaatst';
      var PAY={}; /* betaalpagina's per pakket, bijv. {club:'https://...',1:'https://...',2:'https://...',3:'https://...'} zodra de betaalkoppeling (Mollie: iDEAL, Bancontact, creditcard, SEPA-incasso) actief is */
      var mB=location.search.match(/[?&]bundel=(club2?|[123])/);
      var isClub=mB&&mB[1].indexOf('club')===0;
      if(mB&&PAY[mB[1]]){
        var pn=document.getElementById('payNow'); pn.href=PAY[mB[1]]; pn.style.display='inline-flex';
        document.getElementById('payMethods').style.display='block';
        document.getElementById('confirmClose').className='btn btn-pearl';
        x.textContent='Nog één stap: rond je betaling af. Daarna verwerken we je bestelling automatisch en verzenden we op werkdagen binnen 1 werkdag.';
      }else{
        x.textContent=(isClub?'Welkom bij de Droomclub! Je welkomstbox met je eerste doos en het satijnen slaapmasker gaat als eerste levering de deur uit. ':'Bedankt! ')+'Je bestelling wordt automatisch verwerkt. Je ontvangt je bevestiging en track & trace per e-mail; op werkdagen verzenden we binnen 1 werkdag vanuit Nederland.';
      }
    }else if(mConf[1]==='contact'){
      t.textContent='Bericht ontvangen';
      x.textContent='Bedankt voor je bericht. We reageren binnen één werkdag op het e-mailadres dat je opgaf.';
    }else{
      t.textContent='Je Droombrief komt eraan';
      x.textContent='Je aanmelding is binnen. Eén mail per maand met een avondritueel, een slaaptip en het clubnieuws. Uitschrijven kan altijd met één klik.';
    }
    confirmModal.classList.add('open');
    document.body.style.overflow='hidden';
    setInert(true); document.getElementById('confirmTitle').focus();
    history.replaceState(null,'',location.pathname+location.hash);
  }

  // --- juridische modal -------------------------------------------------
  var LEGAL={
    voorwaarden:{
      title:'Algemene voorwaarden',
      html:'<h4>Bestellen &amp; betalen</h4><p>Je rekent direct af met iDEAL, Bancontact of creditcard. Je bestelling wordt automatisch verwerkt en je ontvangt meteen een bevestiging per e-mail. Alle prijzen zijn in euro en inclusief btw.</p><h4>Verzending en levering</h4><p>Verzending is gratis in heel Nederland. Naar België is verzending gratis vanaf 2 dozen; voor 1 losse doos rekenen we €4,95. Droomclub-leden betalen nooit verzendkosten. Op werkdagen verzenden we binnen 1 werkdag vanuit Nederland, met track &amp; trace.</p><h4>Droomclub</h4><p>Als lid ontvang je elke 30 dagen automatisch één doos voor €19,95, gratis verzonden. De vervolgbetalingen lopen via automatische incasso (na iDEAL of Bancontact) of via je creditcard; je krijgt 3 dagen vooraf een herinnering. Geen minimale looptijd en geen opzegtermijn: overslaan, pauzeren of opzeggen kan altijd via de link in elke mail of via hallo@droompleisters.nl.</p><h4>Garantie</h4><p>Je hebt 30 nachten slaapgarantie op je eerste doos. Ben je niet tevreden, dan krijg je je aankoopbedrag terug; ongeopende dozen uit een bundel vergoeden we ook. Mail hiervoor naar hallo@droompleisters.nl.</p><h4>Contact</h4><p>Droompleisters · Voorstraat 9, 4132 AM Vianen, Nederland · hallo@droompleisters.nl</p>'
    },
    privacy:{
      title:'Privacybeleid',
      html:'<h4>Welke gegevens</h4><p>Wij verwerken alleen de gegevens die je zelf invult bij een bestelling of Droomclub-aanmelding: naam, e-mailadres, telefoonnummer (optioneel) en bezorgadres.</p><h4>Waarvoor</h4><p>Je gegevens gebruiken we uitsluitend om je bestelling en, als je lid bent, je Droomclub-leveringen af te handelen, en om je de Droombrief te sturen als je je daarvoor aanmeldt (maximaal één mail per maand). Je betaling verloopt via onze betaalprovider; wij zien geen rekening- of kaartgegevens. Uitschrijven kan altijd met één klik.</p><h4>Delen &amp; bewaren</h4><p>We verkopen je gegevens nooit en delen ze alleen met partijen die nodig zijn voor de afhandeling, zoals de bezorgdienst. Je kunt altijd inzage of verwijdering vragen via hallo@droompleisters.nl.</p>'
    },
    retour:{
      title:'Retour & herroeping',
      html:'<h4>Wettelijk herroepingsrecht</h4><p>Je hebt bij koop op afstand het recht je bestelling binnen 14 dagen na ontvangst (bij de Droomclub: na ontvangst van je eerste levering) zonder opgave van reden te herroepen. Ongeopende dozen kun je binnen die termijn retourneren; na ontvangst betalen wij het aankoopbedrag van de geretourneerde dozen terug. Om hygiënische redenen kunnen geopende dozen niet worden geretourneerd, behalve via de slaapgarantie hieronder.</p><h4>30 nachten slaapgarantie</h4><p>Bovenop het herroepingsrecht geldt onze slaapgarantie: probeer je eerste doos 30 nachten. Niet tevreden? Mail naar hallo@droompleisters.nl en je krijgt je aankoopbedrag terug, inclusief ongeopende dozen uit een bundel.</p><h4>Retouradres</h4><p>Droompleisters · Voorstraat 9, 4132 AM Vianen, Nederland. Meld je retour altijd eerst per e-mail, dan ontvang je instructies.</p>'
    }
  };
  var legalModal=document.getElementById('legalModal'), legalLast=null;
  function closeLegal(){ legalModal.classList.remove('open'); document.body.style.overflow=''; setInert(false); if(legalLast){ legalLast.focus(); legalLast=null; } }
  document.querySelectorAll('[data-legal]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var d=LEGAL[btn.dataset.legal]; if(!d) return;
      document.getElementById('legalTitle').textContent=d.title;
      document.getElementById('legalBody').innerHTML=d.html;
      legalLast=btn;
      legalModal.classList.add('open');
      document.body.style.overflow='hidden';
      setInert(true); document.getElementById('legalTitle').focus();
    });
  });
  legalModal.querySelector('[data-close-legal]').addEventListener('click',closeLegal);
  legalModal.addEventListener('click',function(e){ if(e.target===legalModal) closeLegal(); });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){
      if(legalModal.classList.contains('open')) closeLegal();
      if(confirmModal.classList.contains('open')) closeConfirm();
    }
    if(e.key==='Tab'){
      var openM=[legalModal,confirmModal].filter(function(m){return m.classList.contains('open')})[0];
      if(!openM) return;
      var f=Array.prototype.filter.call(openM.querySelectorAll('button,input,select,[href],[tabindex="0"]'),function(el){return !el.disabled&&el.offsetParent!==null;});
      if(!f.length) return;
      var first=f[0],last=f[f.length-1],a=document.activeElement;
      if(e.shiftKey&&(a===first||!openM.contains(a))){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&(a===last||!openM.contains(a))){e.preventDefault();first.focus();}
    }
  });

  var reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- scroll progress bar --------------------------------------------
  var bar=document.getElementById('progressBar');
  function paintProgress(){
    var h=document.documentElement.scrollHeight-window.innerHeight;
    bar.style.width=(h>0?(window.scrollY/h)*100:0)+'%';
  }
  window.addEventListener('scroll',paintProgress,{passive:true});
  paintProgress();

  // --- countdown to 23:59 ---------------------------------------------
  var cd=document.getElementById('cdown');
  function tickCd(){
    var now=new Date(), end=new Date(now);
    end.setHours(23,59,0,0);
    if(end<now) end.setDate(end.getDate()+1);
    var s=Math.floor((end-now)/1000);
    var hh=String(Math.floor(s/3600)).padStart(2,'0'),
        mm=String(Math.floor(s%3600/60)).padStart(2,'0'),
        ss=String(s%60).padStart(2,'0');
    cd.textContent=hh+':'+mm+':'+ss;
  }
  if(cd){ tickCd(); setInterval(tickCd,1000); }

  // --- stat counters ---------------------------------------------------
  var counted=false;
  function runCounters(){
    if(counted) return;
    var els=document.querySelectorAll('[data-count]');
    if(!els.length) return;
    var r=els[0].getBoundingClientRect();
    if(r.top>window.innerHeight||r.bottom<0) return;
    counted=true;
    els.forEach(function(el){
      var target=parseFloat(el.dataset.count), dec=parseInt(el.dataset.decimals||'0',10),
          suf=el.dataset.suffix||'', group=el.dataset.group==='1', t0=null, dur=1600;
      function frame(ts){
        if(!t0) t0=ts;
        var p=Math.min((ts-t0)/dur,1), eased=1-Math.pow(1-p,3), val=target*eased;
        var txt=dec?val.toFixed(dec).replace('.',','):Math.round(val).toString();
        if(group) txt=txt.replace(/\B(?=(\d{3})+(?!\d))/g,'.');
        el.textContent=txt+suf;
        if(p<1) requestAnimationFrame(frame);
      }
      if(reduceMotion){ el.textContent=(dec?target.toFixed(dec).replace('.',','):(group?String(target).replace(/\B(?=(\d{3})+(?!\d))/g,'.'):target))+suf; }
      else requestAnimationFrame(frame);
    });
  }
  window.addEventListener('scroll',runCounters,{passive:true});
  runCounters();

  // --- shooting stars ---------------------------------------------------
  if(!reduceMotion){
    document.querySelectorAll('[data-shooting]').forEach(function(field){
      setInterval(function(){
        if(document.hidden) return;
        var s=document.createElement('span');
        s.className='shooting';
        s.style.left=(Math.random()*55)+'%';
        s.style.top=(Math.random()*45)+'%';
        field.appendChild(s);
        setTimeout(function(){ s.remove(); },1700);
      },5200+Math.random()*2600);
    });
  }

  // --- cursor glow (desktop) --------------------------------------------
  var glow=document.getElementById('cursorGlow');
  if(glow&&!reduceMotion&&window.matchMedia('(hover:hover) and (min-width:1024px)').matches){
    var gx=0,gy=0,tx=0,ty=0,shown=false,running=false;
    document.addEventListener('mousemove',function(e){
      tx=e.clientX; ty=e.clientY;
      if(!shown){ shown=true; glow.style.opacity='1'; }
      if(!running){ running=true; requestAnimationFrame(loop); }
    });
    function loop(){
      gx+=(tx-gx)*.12; gy+=(ty-gy)*.12;
      if(Math.abs(tx-gx)<.3&&Math.abs(ty-gy)<.3){ gx=tx; gy=ty; running=false; }
      glow.style.transform='translate('+(gx-280)+'px,'+(gy-280)+'px)';
      if(running) requestAnimationFrame(loop);
    }
  }
})();

(function(){
  // navigatie: parelwit op pagina's zonder donkere hero
  var nav=document.getElementById('siteNav');
  if(nav&&!document.querySelector('.hero')) nav.classList.add('lit');
  // hamburger + mobiel menu
  var burger=document.getElementById('navBurger'), mm=document.getElementById('mobileMenu');
  if(burger&&mm){
    function setMenu(open){
      mm.classList.toggle('open',open);
      burger.classList.toggle('is-open',open);
      burger.setAttribute('aria-expanded',open?'true':'false');
      burger.setAttribute('aria-label',open?'Menu sluiten':'Menu openen');
      document.body.classList.toggle('menu-open',open);
      document.body.style.overflow=(open||document.querySelector('.modal-back.open'))?'hidden':'';
      if(open){ var nb=nav?nav.getBoundingClientRect().bottom:78; mm.style.paddingTop=Math.round(nb+18)+'px'; var f=mm.querySelector('a'); if(f) f.focus(); }
    }
    burger.addEventListener('click',function(){ setMenu(!mm.classList.contains('open')); });
    mm.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ setMenu(false); }); });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&mm.classList.contains('open')){ setMenu(false); burger.focus(); } });
    window.addEventListener('resize',function(){ if(window.innerWidth>900&&mm.classList.contains('open')) setMenu(false); });
  }
  // productpagina: galerij + bundelkeuze
  var mainImg=document.getElementById('pdpMain');
  if(mainImg){
    document.querySelectorAll('.pdp-thumb').forEach(function(t){
      t.addEventListener('click',function(){
        mainImg.style.opacity='0';
        setTimeout(function(){ mainImg.src=t.dataset.src; mainImg.alt=t.dataset.alt||''; mainImg.style.opacity='1'; },180);
        document.querySelectorAll('.pdp-thumb').forEach(function(x){ x.classList.toggle('active',x===t); });
      });
    });
  }
  var pdpOrder=document.getElementById('pdpOrder');
  if(pdpOrder){
    var price=document.getElementById('pdpPrice'), per=document.getElementById('pdpPer');
    document.querySelectorAll('input[name=pdpBundle]').forEach(function(r){
      r.addEventListener('change',function(){
        pdpOrder.dataset.order=r.value;
        var im=document.getElementById('pdpMain');
        if(im&&r.dataset.img&&im.getAttribute('src')!==r.dataset.img){im.src=r.dataset.img;var th=document.querySelector('.pdp-thumb[data-src="'+r.dataset.img+'"]');if(th&&th.dataset.alt)im.alt=th.dataset.alt;document.querySelectorAll('.pdp-thumb').forEach(function(t){t.classList.toggle('active',t.dataset.src===r.dataset.img);t.setAttribute('aria-current',t.dataset.src===r.dataset.img?'true':'false');});}
        if(price) price.textContent=r.dataset.price;
        if(per) per.textContent=r.dataset.per;
        var pn=document.getElementById('pdpNote'); if(pn&&r.dataset.note) pn.textContent=r.dataset.note;
        if(r.dataset.cta) pdpOrder.textContent=r.dataset.cta;
      });
    });
  }
})();

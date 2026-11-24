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
  // ritme alleen bij club, cadeau-kaartje
  function syncClubUI(){
    var checked=modal.querySelector('input[name=bundel]:checked'); var fc=document.getElementById('freqChoice');
    if(fc&&checked) fc.hidden=checked.dataset.club!=='1';
  }
  modal.querySelectorAll('input[name=bundel]').forEach(function(r){ r.addEventListener('change',syncClubUI); });
  syncClubUI();
  var giftOpt=document.getElementById('giftOpt'), giftMsg=document.getElementById('giftMsg');
  if(giftOpt&&giftMsg) giftOpt.addEventListener('change',function(){ giftMsg.hidden=!giftOpt.checked; });
  function openModal(bundle){
    if(window.DP_SHOP&&DP_SHOP[bundle]){ location.href=DP_SHOP[bundle]; return; }
    if(bundle){var isC=String(bundle).indexOf('club')===0; var r=document.getElementById(isC?'bclub':'b1'); if(r) r.checked=true; var am=document.getElementById('f-aantal'); var n=bundle==='club2'?'2':(isC?'1':String(bundle)); if(am&&/^[123]$/.test(n)) am.value=n;}
    updateTotal(); syncShop();
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
  // winkelmodus: losse dozen naar de Shopify-kassa, Droomclub blijft reserveren
  var shopForm=document.querySelector('form[data-shopform]');
  function syncShop(){
    if(!shopForm) return;
    var c=shopForm.querySelector('input[name=keuze]:checked'); if(!c) return;
    var isShop=!!c.dataset.shop, cf=document.getElementById('clubFields'), lg=document.getElementById('orderLegal'), sb=document.getElementById('orderSubmit');
    if(cf){ cf.hidden=isShop; cf.querySelectorAll('input').forEach(function(i){ i.required=!isShop; }); }
    if(lg) lg.textContent=isShop?lg.dataset.shopText:lg.dataset.clubText;
    if(sb&&c.dataset.btn) sb.textContent=c.dataset.btn;
  }
  if(shopForm){
    shopForm.querySelectorAll('input[name=keuze]').forEach(function(r){ r.addEventListener('change',syncShop); });
    shopForm.addEventListener('submit',function(e){ var c=shopForm.querySelector('input[name=keuze]:checked'); if(c&&c.dataset.shop){ e.preventDefault(); e.stopImmediatePropagation(); location.href=c.dataset.shop; } });
    syncShop();
  }
  document.querySelectorAll('[data-order]').forEach(function(btn){
    btn.addEventListener('click',function(e){ e.preventDefault(); openModal(btn.dataset.order); });
  });
  document.addEventListener('dp:order',function(e){ openModal(e.detail); });
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
  document.querySelectorAll('form[action*="/dp/"]').forEach(function(f){
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
    if(i.value.indexOf('bedankt.html')>-1){ i.value=location.origin+'/bedankt.html'; return; }
    var q=(i.value.split('?')[1]||'bevestigd=bestelling');
    i.value=location.origin+location.pathname+'?'+q;
  });

  // --- bevestigingsmodal na redirect ------------------------------------
  var confirmModal=document.getElementById('confirmModal');
  function closeConfirm(){ confirmModal.classList.remove('open'); document.body.style.overflow=''; setInert(false); var b=document.querySelector('.brand'); if(b) b.focus(); }
  confirmModal.querySelectorAll('[data-close-confirm]').forEach(function(b){ b.addEventListener('click',closeConfirm); });
  confirmModal.addEventListener('click',function(e){ if(e.target===confirmModal) closeConfirm(); });
  var mConf=location.search.match(/[?&]bevestigd=(bestelling|droomclub|contact|verkooppunt)/);
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
        x.textContent='Nog één stap: rond je betaling af. Daarna verwerken we je bestelling automatisch en verzenden we vóór 17:00 besteld, dezelfde werkdag.';
      }else{
        x.textContent=(isClub?'Welkom bij de Droomclub! Je welkomstbox met je eerste doos en het satijnen slaapmasker gaat als eerste levering de deur uit. ':'Bedankt! ')+'Je bestelling wordt automatisch verwerkt. Je ontvangt je bevestiging en track & trace per e-mail; op werkdagen vóór 17:00 besteld, dezelfde dag verzonden vanuit Nederland.';
      }
    }else if(mConf[1]==='verkooppunt'){
      t.textContent='Aanmelding ontvangen';
      x.textContent='Bedankt voor je aanmelding als verkooppunt. Binnen één werkdag mailen we je de inkoopprijzen en voorwaarden. Geen mail gezien? Kijk even in je spam-map.';
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
      html:'<h4>Bestellen &amp; betalen</h4><p>Nu reserveer je zonder te betalen. Zodra bestellen kan, reken je via de bestellink af met iDEAL, Bancontact of creditcard. Je bestelling wordt automatisch verwerkt en je ontvangt meteen een bevestiging per e-mail. Alle prijzen zijn in euro en inclusief btw.</p><h4>Verzending en levering</h4><p>Verzending is gratis in heel Nederland. Naar België is verzending gratis vanaf 2 dozen; voor 1 losse doos rekenen we €4,95. Droomclub-leden betalen nooit verzendkosten. Op werkdagen vóór 17:00 besteld, dezelfde dag verzonden vanuit Nederland, met track &amp; trace.</p><h4>Droomclub</h4><p>Als lid ontvang je elke 30 dagen automatisch één doos voor €19,95, gratis verzonden. De vervolgbetalingen lopen via automatische incasso (na iDEAL of Bancontact) of via je creditcard; je krijgt 3 dagen vooraf een herinnering. Geen minimale looptijd en geen opzegtermijn: overslaan, pauzeren of opzeggen kan altijd via de link in elke mail of via info@droompleisters.nl.</p><h4>Garantie</h4><p>Je hebt 30 nachten slaapgarantie op je eerste doos. Ben je niet tevreden, dan krijg je je aankoopbedrag terug; ongeopende dozen uit een bundel vergoeden we ook. Mail hiervoor naar info@droompleisters.nl.</p><h4>Contact</h4><p>Droompleisters · Voorstraat 9, 4132 AM Vianen, Nederland · info@droompleisters.nl</p>'
    },
    privacy:{
      title:'Privacybeleid',
      html:'<h4>Welke gegevens</h4><p>Wij verwerken alleen de gegevens die je zelf invult bij een bestelling of Droomclub-aanmelding: naam, e-mailadres, telefoonnummer (optioneel) en bezorgadres.</p><h4>Waarvoor</h4><p>Je gegevens gebruiken we uitsluitend om je bestelling en, als je lid bent, je Droomclub-leveringen af te handelen en om je de Droombrief te sturen als je je daarvoor aanmeldt (maximaal één mail per maand). Je betaling verloopt via onze betaalprovider; wij zien geen rekening- of kaartgegevens. Uitschrijven kan altijd met één klik.</p><h4>Delen &amp; bewaren</h4><p>We verkopen je gegevens nooit en delen ze alleen met partijen die nodig zijn voor de afhandeling, zoals de bezorgdienst. Je kunt altijd inzage of verwijdering vragen via info@droompleisters.nl.</p>'
    },
    retour:{
      title:'Retour & herroeping',
      html:'<h4>Wettelijk herroepingsrecht</h4><p>Je hebt bij koop op afstand het recht je bestelling binnen 14 dagen na ontvangst (bij de Droomclub: na ontvangst van je eerste levering) zonder opgave van reden te herroepen. Ongeopende dozen kun je binnen die termijn retourneren; na ontvangst betalen wij het aankoopbedrag van de geretourneerde dozen terug. Om hygiënische redenen kunnen geopende dozen niet worden geretourneerd, behalve via de slaapgarantie hieronder.</p><h4>30 nachten slaapgarantie</h4><p>Bovenop het herroepingsrecht geldt onze slaapgarantie: probeer je eerste doos 30 nachten. Niet tevreden? Mail naar info@droompleisters.nl en je krijgt je aankoopbedrag terug, inclusief ongeopende dozen uit een bundel.</p><h4>Retouradres</h4><p>Droompleisters · Voorstraat 9, 4132 AM Vianen, Nederland. Meld je retour altijd eerst per e-mail, dan ontvang je instructies.</p>'
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
  // --- leverbelofte met cut-off 17:00 (werkdagen) --------------------------
  var DAGEN=['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'], MAANDEN=['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
  function nlNow(){ try{ return new Date(new Date().toLocaleString('en-US',{timeZone:'Europe/Amsterdam'})); }catch(e){ return new Date(); } }
  function nextWorkday(d){ var x=new Date(d); x.setDate(x.getDate()+1); while(x.getDay()===0||x.getDay()===6) x.setDate(x.getDate()+1); return x; }
  function fmt(d){ return DAGEN[d.getDay()]+' '+d.getDate()+' '+MAANDEN[d.getMonth()]; }
  var LAUNCH=Date.parse((document.querySelector('meta[name="launch"]')||{}).content||'')||Infinity; /* geen meta = wachtlijst zonder datum */
  function preLaunch(){ return Date.now()<LAUNCH; }
  function pad2(n){ return String(n).padStart(2,'0'); }
  function tickLaunch(){
    if(!isFinite(LAUNCH)) return;
    var s=Math.max(0,Math.floor((LAUNCH-Date.now())/1000)), d=Math.floor(s/86400), h=Math.floor(s%86400/3600), mi=Math.floor(s%3600/60), se=s%60;
    var v={d:d,h:pad2(h),m:pad2(mi),s:pad2(se)};
    document.querySelectorAll('[data-cd]').forEach(function(el){ el.textContent=v[el.dataset.cd]; });
    var short=d>0?(d+(d===1?' dag':' dagen')+(d<7?' en '+h+' uur':'')):(h+' uur en '+mi+' min');
    document.querySelectorAll('[data-cd-short]').forEach(function(el){ el.textContent=short; });
    if(!preLaunch()) document.documentElement.classList.add('launched');
  }
  tickLaunch(); setInterval(tickLaunch,1000);
  function deliveryText(be){
    if(preLaunch()) return isFinite(LAUNCH)?'Verzending start binnenkort.':'Reserveer nu zonder te betalen. Zodra bestellen kan, krijg je als eerste de bestellink.';
    var now=nlNow(), day=now.getDay(), beforeCut=now.getHours()<17;
    var ship, when;
    if(day>=1&&day<=5&&beforeCut){ ship=new Date(now); when='vandaag'; }
    else { ship=nextWorkday(now); when=(ship.getDate()===now.getDate()+1&&day>=1&&day<=4)?'morgen':'op '+DAGEN[ship.getDay()]; }
    var arrive=nextWorkday(ship); if(be) arrive=nextWorkday(arrive);
    var pre=(day>=1&&day<=5&&beforeCut)?'Bestel v\u00f3\u00f3r 17:00, dan gaat je pakket vandaag nog mee. ':'Bestel nu, dan gaat je pakket '+when+' mee. ';
    return pre+'Verwacht in huis: <b>'+fmt(arrive)+'</b>'+(be?' (Belgi\u00eb, 1 werkdag extra)':'')+'.';
  }
  function renderDelivery(){
    var be=document.getElementById('f-land')&&document.getElementById('f-land').value==='Belgi\u00eb';
    document.querySelectorAll('[data-delivery]').forEach(function(el){ el.innerHTML=deliveryText(el.closest('#orderModal')?be:false); });
    var c=document.getElementById('cutoffLeft'); if(c&&preLaunch()&&!isFinite(LAUNCH)){ c.textContent=''; } else if(c&&preLaunch()){ var dd=Math.ceil((LAUNCH-Date.now())/86400000); c.textContent='Nog '+dd+(dd===1?' dag':' dagen')+' tot de verzending start.'; } else if(c){ var n=nlNow(); if(n.getDay()>=1&&n.getDay()<=5&&n.getHours()<17){ var ms=new Date(n.getFullYear(),n.getMonth(),n.getDate(),17,0,0)-n; var h=Math.floor(ms/3600000), mi=Math.floor(ms%3600000/60000); c.textContent='Nog '+(h>0?h+' uur en ':'')+mi+' minuten om vandaag verzonden te worden.'; } else { c.textContent=''; } }
  }
  renderDelivery(); setInterval(renderDelivery,60000);
  if(document.getElementById('f-land')) document.getElementById('f-land').addEventListener('change',renderDelivery);

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
  // slaaptest
  var qz=document.getElementById('quiz');
  if(qz){
    var data=JSON.parse(qz.getAttribute('data-quiz')), body=document.getElementById('quizBody'), bar=document.getElementById('quizBar'), step=document.getElementById('quizStep'), back=document.getElementById('quizBack');
    var answers=[], idx=0, letters='ABCD';
    function esc(s){return s.replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
    function render(){
      var q=data.q[idx];
      bar.style.width=Math.round(idx/data.q.length*100)+'%';
      step.textContent='Vraag '+(idx+1)+' van '+data.q.length;
      back.hidden=idx===0;
      var h='<h2 class="quiz-q">'+esc(q.t)+'</h2><div class="quiz-opts" role="group" aria-label="'+esc(q.t)+'">';
      q.a.forEach(function(a,i){ h+='<button type="button" class="quiz-opt" data-k="'+esc(a.k)+'"><span class="k" aria-hidden="true">'+letters[i]+'</span><span>'+esc(a.t)+'</span></button>'; });
      body.innerHTML=h+'</div>';
      var first=body.querySelector('.quiz-opt'); if(first&&idx>0) first.focus();
      body.querySelectorAll('.quiz-opt').forEach(function(b){ b.addEventListener('click',function(){ answers[idx]=b.dataset.k; if(idx<data.q.length-1){ idx++; render(); } else { result(); } }); });
    }
    function result(){
      var score={P:0,L:0,R:0,M:0}, sev=0, tryFirst=false, duo=false, gift=false;
      answers.forEach(function(k){ if(score.hasOwnProperty(k)) score[k]++; if(k==='s1') sev=1; if(k==='s2') sev=2; if(k==='s3') sev=3; if(k==='try') tryFirst=true; if(k==='duo') duo=true; if(k==='gift') gift=true; });
      var best='P', max=-1; ['P','L','R','M'].forEach(function(k){ if(score[k]>max){ max=score[k]; best=k; } });
      var r=data.r[best];
      bar.style.width='100%'; step.textContent='Jouw resultaat'; back.hidden=true;
      var reco, order;
      if(gift){ reco={rh:'Ons advies als cadeau', h:'Eén doos, mooi verpakt', p:'Een losse doos is het mooiste cadeau: 30 nachten, gratis verzonden in Nederland, met 30 nachten garantie. Wordt het een blijvertje? Dan kan de ontvanger zelf lid worden voor €19,95 per doos.', btn:'Reserveer nu', order:'1', alt:'Of geef de Droomclub cadeau', altOrder:'club'}; }
      else if(tryFirst){ reco={rh:'Ons eerlijke advies', h:'Begin met één doos', p:'Je wilt eerst rustig proberen. Prima: één doos, €29,95, gratis verzonden in Nederland, 30 nachten garantie. Bevalt het ritueel? Dan is de Droomclub daarna €10 per doos goedkoper.', btn:'Reserveer nu', order:'1', alt:'Toch meteen lid worden · €19,95 per doos', altOrder:'club'}; }
      else if(duo){ reco={rh:'Ons advies voor jullie samen', h:'Droomclub voor twee', p:'Elke 30 dagen twee dozen in één pakket voor 2 × €19,95, altijd gratis verzonden, met de welkomstbox bij je eerste levering. Pauzeren of opzeggen kan altijd.', btn:'Word lid voor twee · €39,90', order:'club2', alt:'Liever eerst één doos proberen', altOrder:'1'}; }
      else { reco={rh:'Ons advies', h:sev>=2?'De Droomclub, omdat ritme wint':'De Droomclub, zonder gedoe', p:(sev>=2?'Bij meerdere onrustige nachten per week is het ritme belangrijker dan één goede nacht. ':'')+'Als lid ligt er elke 30 dagen automatisch een nieuwe doos voor €19,95 op de mat, gratis verzonden, met de welkomstbox bij je eerste levering. Geen looptijd, geen opzegtermijn, 30 nachten garantie.', btn:'Word lid · €19,95 per doos', order:'club', alt:'Liever eerst één doos proberen · €29,95', altOrder:'1'}; }
      var h='<div class="quiz-result"><p class="eyebrow">Jouw slaaptype</p><h2>'+esc(r.name)+'</h2><p class="lead">'+esc(r.text)+'</p><ul class="quiz-tips">';
      r.tips.forEach(function(t){ h+='<li>'+esc(t)+'</li>'; });
      h+='</ul><div class="quiz-why"><b>Waarom een Droompleister bij jou past.</b> '+esc(r.why)+(r.url?' <a href="'+esc(r.url)+'" style="color:var(--gold-deep)">'+esc(r.urlTitle)+'</a>':'')+'</div>';
      h+='<div class="quiz-reco"><p class="rh">'+esc(reco.rh)+'</p><h3>'+esc(reco.h)+'</h3><p>'+esc(reco.p)+'</p><div class="club-cta"><a class="btn btn-gold" href="slaappleisters.html#bestel" data-order="'+reco.order+'">'+esc(reco.btn)+'</a><a class="btn btn-pearl" href="slaappleisters.html#bestel" data-order="'+reco.altOrder+'">'+esc(reco.alt)+'</a></div></div>';
      h+='<p class="quiz-again"><button type="button" id="quizAgain">Opnieuw doen</button> · <a href="droomclub.html" style="color:var(--gold-deep)">Alles over de Droomclub</a></p></div>';
      body.innerHTML=h;
      body.querySelectorAll('[data-order]').forEach(function(btn){ btn.addEventListener('click',function(e){ e.preventDefault(); document.dispatchEvent(new CustomEvent('dp:order',{detail:btn.dataset.order})); }); });
      document.getElementById('quizAgain').addEventListener('click',function(){ answers=[]; idx=0; render(); qz.scrollIntoView({behavior:'smooth',block:'start'}); });
      var rh=body.querySelector('h2'); if(rh){ rh.setAttribute('tabindex','-1'); rh.focus(); }
    }
    back.addEventListener('click',function(){ if(idx>0){ idx--; render(); } });
    render();
  }
  // exit-prompt: één keer per bezoeker, alleen desktop, niet als een modal open is
  var ep=document.getElementById('exitPrompt');
  if(ep&&window.matchMedia('(hover:hover) and (min-width:900px)').matches){
    var seen=false; try{ seen=localStorage.getItem('dpExit')==='1'; }catch(e){}
    function closeExit(){ ep.classList.remove('open'); ep.hidden=true; }
    if(!seen){
      var armed=false; setTimeout(function(){ armed=true; },15000);
      document.addEventListener('mouseleave',function(e){
        if(!armed||e.clientY>0||document.querySelector('.modal-back.open')) return;
        armed=false; try{ localStorage.setItem('dpExit','1'); }catch(err){}
        ep.hidden=false; ep.classList.add('open'); var b=document.getElementById('exitClose'); if(b) b.focus();
      });
    }
    document.getElementById('exitClose').addEventListener('click',closeExit);
    ep.addEventListener('click',function(e){ if(e.target===ep) closeExit(); });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&ep.classList.contains('open')) closeExit(); });
    var dl=document.getElementById('exitDownload'); if(dl) dl.addEventListener('click',function(){ setTimeout(closeExit,300); });
  }
  var n14g=document.getElementById('n14Good');
  if(n14g){
    n14g.addEventListener('click',function(){ document.getElementById('n14Form').hidden=false; document.getElementById('n14Tips').hidden=true; document.getElementById('r-naam').focus(); });
    document.getElementById('n14Meh').addEventListener('click',function(){ document.getElementById('n14Tips').hidden=false; document.getElementById('n14Form').hidden=true; });
  }
  var rf=document.querySelector('.rev-filter');
  if(rf){
    rf.querySelectorAll('button').forEach(function(btn){ btn.addEventListener('click',function(){
      rf.querySelectorAll('button').forEach(function(b){ b.classList.toggle('on',b===btn); b.setAttribute('aria-pressed',b===btn?'true':'false'); });
      var f=btn.dataset.f, n=0;
      document.querySelectorAll('#revGrid .rev-card').forEach(function(c){ var show=f==='alle'||c.dataset.sit===f; c.hidden=!show; if(show) n++; });
      var e=document.getElementById('revEmpty'); if(e) e.hidden=n>0;
    }); });
  }
})();

/* v20 luxe-laag: rustige beweging, geen scroll-kaping */
(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=window.matchMedia('(hover:hover) and (min-width:901px)').matches;

  // na de reveal: hover-effecten weer vlot laten reageren
  document.addEventListener('transitionend',function(e){
    var t=e.target;
    if(e.propertyName==='opacity'&&t.classList&&t.classList.contains('reveal')&&t.classList.contains('in')) t.classList.add('done');
  });

  // eigen in-beeld-check voor lijnen en foto's (werkt ook waar IntersectionObserver stilstaat)
  var watch=Array.prototype.slice.call(document.querySelectorAll('.hairline,.photo-frame'));
  var frames=Array.prototype.slice.call(document.querySelectorAll('.photo-frame'));
  function checkWatch(){
    if(!watch.length){ clearInterval(wTimer); return; }
    var vh=window.innerHeight||document.documentElement.clientHeight;
    watch=watch.filter(function(el){
      var r=el.getBoundingClientRect();
      if(r.top<vh-20&&r.bottom>0){ el.classList.add('in'); return false; }
      return true;
    });
  }
  var wTimer=setInterval(checkWatch,600);
  window.addEventListener('scroll',checkWatch,{passive:true});
  window.addEventListener('resize',checkWatch);
  checkWatch();

  // foto's bewegen heel licht mee met scrollen (alleen desktop)
  if(fine&&!reduce&&frames.length){
    var ticking=false;
    function parallax(){
      ticking=false;
      var vh=window.innerHeight;
      frames.forEach(function(f){
        var r=f.getBoundingClientRect();
        if(r.bottom<-50||r.top>vh+50) return;
        var p=((r.top+r.height/2)-vh/2)/vh;            // -0.5 .. 0.5
        var img=f.querySelector('img');
        if(img) img.style.setProperty('--py',(p*-r.height*0.06).toFixed(1)+'px');
      });
    }
    window.addEventListener('scroll',function(){ if(!ticking){ ticking=true; requestAnimationFrame(parallax); } },{passive:true});
    parallax();
  }

  // de doos kantelt een fractie mee met de muis (alleen desktop)
  var stage=document.querySelector('[data-stage]');
  if(stage&&fine&&!reduce){
    var box=stage.querySelector('.stage-box'), hero=stage.closest('.hero');
    hero.addEventListener('mousemove',function(e){
      var r=hero.getBoundingClientRect();
      var x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      box.style.setProperty('--ry',(x*9).toFixed(2)+'deg');
      box.style.setProperty('--rx',(y*-6).toFixed(2)+'deg');
    });
    hero.addEventListener('mouseleave',function(){ box.style.setProperty('--ry','0deg'); box.style.setProperty('--rx','0deg'); });
  }

  // sterrenstof met scherptediepte in de nachtsecties
  function makeDust(cv){
    var ctx=cv.getContext('2d'); if(!ctx) return;
    var host=cv.parentElement, w=0, h=0, dpr=Math.min(window.devicePixelRatio||1,2), parts=[], running=false, visible=true, last=0;
    var spr=document.createElement('canvas'); spr.width=spr.height=64;
    var sx=spr.getContext('2d'), g=sx.createRadialGradient(32,32,0,32,32,32);
    g.addColorStop(0,'rgba(255,244,214,1)'); g.addColorStop(.25,'rgba(242,223,174,.55)'); g.addColorStop(1,'rgba(242,223,174,0)');
    sx.fillStyle=g; sx.fillRect(0,0,64,64);
    function size(){
      var r=host.getBoundingClientRect(); w=Math.max(1,Math.round(r.width)); h=Math.max(1,Math.round(r.height));
      cv.width=w*dpr; cv.height=h*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
      var n=Math.max(24,Math.min(64,Math.round(w*h/26000)));
      parts=[];
      for(var i=0;i<n;i++){
        var z=Math.random();                                   // 0 = ver weg, 1 = dichtbij (groot en vaag)
        parts.push({x:Math.random()*w,y:Math.random()*h,z:z,r:1.2+z*z*9,a:.18+Math.random()*.5*(1-z*.6),vy:-(3+z*11),ph:Math.random()*6.28,sp:.2+Math.random()*.5});
      }
    }
    function draw(t){
      var dt=Math.min(.05,(t-last)/1000||0); last=t;
      ctx.clearRect(0,0,w,h);
      for(var i=0;i<parts.length;i++){
        var p=parts[i];
        p.y+=p.vy*dt; p.ph+=p.sp*dt; p.x+=Math.sin(p.ph)*6*dt*(.4+p.z);
        if(p.y<-20){ p.y=h+20; p.x=Math.random()*w; }
        ctx.globalAlpha=p.a*(.65+.35*Math.sin(p.ph*1.7));
        ctx.drawImage(spr,p.x-p.r,p.y-p.r,p.r*2,p.r*2);
      }
      ctx.globalAlpha=1;
    }
    function loop(t){ if(!running) return; draw(t); requestAnimationFrame(loop); }
    function start(){ if(running||reduce||!visible||document.hidden) return; running=true; last=performance.now(); requestAnimationFrame(loop); }
    function stop(){ running=false; }
    size(); draw(performance.now());
    var rt; window.addEventListener('resize',function(){ clearTimeout(rt); rt=setTimeout(function(){ size(); draw(performance.now()); },200); });
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(en){ visible=en[0].isIntersecting; if(visible) start(); else stop(); }).observe(host);
    }
    document.addEventListener('visibilitychange',function(){ if(document.hidden) stop(); else start(); });
    start();
  }
  document.querySelectorAll('canvas[data-dust]').forEach(makeDust);

  // productgalerij: sfeerfoto's vullen het hele kader, de vrijstaande doos blijft zweven
  var pdpImg=document.getElementById('pdpMain');
  if(pdpImg&&window.MutationObserver){
    var pdpBox=pdpImg.closest('.pdp-main');
    function pdpMode(){ pdpBox.classList.toggle('photo',/sfeer-(nacht|arm|plak)|pleister-kaart/.test(pdpImg.getAttribute('src')||'')); }
    new MutationObserver(pdpMode).observe(pdpImg,{attributes:true,attributeFilter:['src']});
    pdpMode();
  }

  // brede vergelijkingstabel: zeg erbij dat je opzij kunt vegen
  document.querySelectorAll('table.vgl-wide').forEach(function(t){
    var w=t.closest('.table-wrap'); if(!w) return;
    var p=document.createElement('p'); p.className='vgl-hint'; p.textContent='Veeg opzij voor alle merken ›';
    w.insertAdjacentElement('beforebegin',p);
  });

  // veeg-hint onder de kaartstroken op telefoon
  document.querySelectorAll('#ingredienten .ingr-grid,#reviews .rev-grid').forEach(function(el){
    var p=document.createElement('p'); p.className='swipe-hint'; p.setAttribute('aria-hidden','true');
    p.innerHTML='<i></i>Veeg opzij voor meer<i></i>';
    el.insertAdjacentElement('afterend',p);
  });
})();

(function(){
  if(window.__historicoVeiculosLuizForcadoV1) return;
  window.__historicoVeiculosLuizForcadoV1 = true;

  function H(v){
    try{return typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
    catch(e){return String(v??'')}
  }
  function F(d){try{return typeof fmtDate==='function'?fmtDate(d):(d||'-')}catch(e){return d||'-'}}
  function Money(v){try{return typeof BRL==='function'?BRL(v):Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}catch(e){return 'R$ '+Number(v||0).toFixed(2)}}
  function YM(d){try{return typeof ym==='function'?ym(d):String(d||'').slice(0,7)}catch(e){return String(d||'').slice(0,7)}}
  function C(v){try{return typeof clean==='function'?clean(v):String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}catch(e){return String(v||'').toLowerCase()}}
  function N(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]/g,'')}
  function Suf(placa){return N(placa).slice(-4)}
  function matchesPlate(value,placa){
    const v=N(value), p=N(placa), s=Suf(placa);
    if(!v||!p)return false;
    return v===p || (!!s && v===s) || (!!s && v.endsWith(s)) || (v.length>=4 && p.endsWith(v));
  }
  function matchesRecord(r,placa,fields){return fields.some(function(f){return matchesPlate(r&&r[f],placa)})}
  function statusClass(st){
    const t=C(st);
    if(t.includes('pago')||t.includes('concluido')||t.includes('ativo'))return 'green';
    if(t.includes('aguard')||t.includes('pend'))return 'amber';
    if(t.includes('venc')||t.includes('crit')||t.includes('demit'))return 'red';
    return 'gray';
  }
  function firstPlateFromText(txt){
    const raw=String(txt||'').toUpperCase();
    const patterns=[
      /[A-Z]{3}\s*[-]?\s*[0-9][A-Z0-9][0-9]{2}/,
      /[0-9][A-Z][0-9]{2}/,
      /[0-9]{1,2}[A-Z][0-9]{2}/
    ];
    for(const p of patterns){
      const m=raw.match(p);
      if(m) return m[0].replace(/[^A-Z0-9]/g,'');
    }
    return '';
  }
  function resolvePlateFromElement(el){
    if(!el) return '';
    const direct = el.getAttribute && (
      el.getAttribute('data-history-plate') ||
      el.getAttribute('data-vehicle-plate') ||
      el.getAttribute('data-placa')
    );
    if(direct) return direct;

    const txt = (el.textContent||'').trim();
    let p = firstPlateFromText(txt);
    if(p) return p;

    const row = el.closest && (el.closest('tr') || el.closest('.card') || el.closest('article') || el.closest('.vehicle-card') || el.closest('.fleet-card'));
    if(row){
      const plateEl = row.querySelector && (row.querySelector('.plate') || row.querySelector('[data-placa]'));
      if(plateEl && plateEl !== el){
        const px = resolvePlateFromElement(plateEl);
        if(px) return px;
      }
      p = firstPlateFromText(row.textContent||'');
      if(p) return p;
    }
    return '';
  }
  function vehicleHistoryData(placa){
    const veic=(data.veiculos||[]).find(function(v){return matchesPlate(v.placa,placa)})||{placa:placa,modelo:'Veículo'};
    placa = veic.placa || placa;
    const manut=(data.manutencoes||[]).filter(function(r){return matchesRecord(r,placa,['placa','origem'])});
    const prod=(data.producao||[]).filter(function(r){return matchesRecord(r,placa,['placa'])});
    const multas=(data.multas||[]).filter(function(r){return matchesRecord(r,placa,['placa','carro'])});
    const pontos=(data.pontos||[]).filter(function(r){return matchesRecord(r,placa,['placa'])});
    const oleo=(data.oleo||[]).filter(function(r){return matchesRecord(r,placa,['placa'])});
    const tac=(data.tacografos||[]).filter(function(r){return matchesRecord(r,placa,['placa'])});
    const brats=(data.brat||data.brats||data.brats_registros||[]).filter(function(r){return matchesRecord(r,placa,['placa'])});
    const events=[];
    manut.forEach(function(r){events.push({date:r.data||'',type:'Manutenção',title:r.tipo||'Serviço de manutenção',desc:r.descricao||'Sem descrição',meta:[r.origem?('Origem: '+r.origem):'',Money(r.valor),r.status||''].filter(Boolean),cls:'green'})});
    prod.forEach(function(r){events.push({date:r.data||'',type:'Produção',title:'Produção do dia',desc:r.servico||'Sem serviço informado',meta:[r.mes||YM(r.data),r.responsavel?('Resp.: '+r.responsavel):'',r.obs||''].filter(Boolean),cls:'gray'})});
    multas.forEach(function(r){events.push({date:r.data||r.vencimento||'',type:'Multa',title:'Auto '+(r.auto||'-'),desc:r.infracao||r.local||'Infração registrada',meta:[r.motorista||'',Money(r.valor),r.status||''].filter(Boolean),cls:statusClass(r.status)})});
    pontos.forEach(function(r){events.push({date:r.data||'',type:'Pontos',title:(r.pontos||0)+' ponto(s) na CNH',desc:[r.gravidade,r.auto,r.motorista].filter(Boolean).join(' • ')||'Lançamento de pontos',meta:[r.aceitou||'',r.origem||''].filter(Boolean),cls:statusClass(r.gravidade)})});
    oleo.forEach(function(r){events.push({date:r.data||'',type:'Óleo',title:'Troca de óleo',desc:'KM atual: '+(r.km||'-')+' • Próximo: '+(r.proxKm||'-'),meta:[r.obs||''].filter(Boolean),cls:'green'})});
    tac.forEach(function(r){events.push({date:r.validade||r.data||'',type:'Tacógrafo',title:'Tacógrafo',desc:'Aferição: '+F(r.data)+' • Validade: '+F(r.validade),meta:[r.status||'',r.obs||''].filter(Boolean),cls:statusClass(r.status)})});
    brats.forEach(function(r){events.push({date:r.data||'',type:'BRAT',title:r.numero_brat||'BRAT',desc:r.descricao||r.pasta_origem||'Registro de acidente',meta:[r.motorista||'',r.status||''].filter(Boolean),cls:statusClass(r.status)})});
    events.sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''))||String(b.type).localeCompare(String(a.type))});
    return {veic,manut,prod,multas,pontos,oleo,tac,brats,events};
  }
  function summaryCard(label,value,sub){return '<article><span>'+H(label)+'</span><b>'+H(value)+'</b><small>'+H(sub||'')+'</small></article>'}
  function eventHtml(e){
    return '<article class="vehicle-history-event">'+
      '<div class="event-date"><b>'+H(F(e.date)).slice(0,10)+'</b><small>'+H(YM(e.date)||'Sem data')+'</small></div>'+
      '<div><h5>'+H(e.title)+'</h5><p>'+H(e.desc)+'</p><div class="event-meta">'+
      (e.meta||[]).slice(0,4).map(function(m){return '<span class="vehicle-history-pill gray">'+H(m)+'</span>'}).join('')+
      '</div></div><span class="vehicle-history-pill '+H(e.cls||'gray')+'">'+H(e.type)+'</span></article>';
  }
  window.openVehicleHistory=function(placa){
    if(!placa){
      showVehicleHistoryToast('Não consegui identificar a placa desse item.');
      return;
    }
    const h=vehicleHistoryData(placa);
    const lastMan=h.manut.slice().sort(function(a,b){return String(b.data||'').localeCompare(String(a.data||''))})[0];
    const totalMan=h.manut.reduce(function(s,r){return s+(Number(r.valor)||0)},0);
    const lastOleo=h.oleo.slice().sort(function(a,b){return String(b.data||'').localeCompare(String(a.data||''))})[0];
    const nextTac=h.tac.slice().sort(function(a,b){return String(b.validade||'').localeCompare(String(a.validade||''))})[0];

    const body =
      '<div class="vehicle-history-summary">'+
        summaryCard('Eventos',h.events.length,'histórico total')+
        summaryCard('Manutenções',h.manut.length,Money(totalMan))+
        summaryCard('Produção',h.prod.length,'serviços do dia')+
        summaryCard('Multas',h.multas.length,'vinculadas')+
      '</div>'+
      '<div class="vehicle-history-summary">'+
        summaryCard('Última manutenção',lastMan?F(lastMan.data):'—',lastMan?(lastMan.tipo||'Serviço'):'sem registro')+
        summaryCard('Último óleo',lastOleo?F(lastOleo.data):'—',lastOleo?('Próx. '+(lastOleo.proxKm||'-')+' km'):'sem registro')+
        summaryCard('Tacógrafo',nextTac?F(nextTac.validade):'—','validade')+
        summaryCard('Modelo',h.veic.modelo||'—',h.veic.status||'')+
      '</div>'+
      '<section class="vehicle-history-section">'+
        '<div class="vehicle-history-section-title"><h4>Linha do tempo completa</h4><small>'+h.events.length+' registro(s)</small></div>'+
        (h.events.length?'<div class="vehicle-history-timeline">'+h.events.map(eventHtml).join('')+'</div>':'<div class="vehicle-history-empty">Nenhum histórico encontrado para esta placa.</div>')+
      '</section>';

    const old=document.getElementById('vehicleHistoryModalLuiz');
    if(old) old.remove();

    const modal=document.createElement('div');
    modal.className='vehicle-history-modal-bg';
    modal.id='vehicleHistoryModalLuiz';
    modal.innerHTML =
      '<aside class="vehicle-history-modal">'+
        '<div class="vehicle-history-modal-head">'+
          '<div class="vehicle-history-modal-title">'+
            '<span class="plate">'+H(h.veic.placa||placa)+'</span>'+
            '<div><h3>Histórico do veículo</h3><small>'+H(h.veic.modelo||'Veículo da frota')+'</small></div>'+
          '</div>'+
          '<button class="vehicle-history-modal-close" type="button" data-close-vehicle-history>×</button>'+
        '</div>'+
        '<div class="vehicle-history-modal-body">'+body+'</div>'+
      '</aside>';
    modal.addEventListener('click',function(ev){
      if(ev.target===modal || ev.target.hasAttribute('data-close-vehicle-history')) closeVehicleHistory();
    });
    document.body.appendChild(modal);
    setTimeout(function(){modal.classList.add('open')},10);
  };
  window.closeVehicleHistory=function(){
    const el=document.getElementById('vehicleHistoryModalLuiz');
    if(el) el.remove();
  };
  window.showVehicleHistoryToast=function(msg){
    const old=document.querySelector('.vehicle-history-debug-toast');
    if(old) old.remove();
    const t=document.createElement('div');
    t.className='vehicle-history-debug-toast';
    t.textContent=msg;
    document.body.appendChild(t);
    setTimeout(function(){t.remove()},2600);
  };
  function enhanceVehiclePage(){
    const page=document.getElementById('veiculos');
    if(!page) return;
    const isVisible = page.classList.contains('active') || (typeof currentPage!=='undefined' && currentPage==='veiculos') || (window.currentPage==='veiculos');
    if(!isVisible && !page.offsetParent) return;

    page.querySelectorAll('.plate').forEach(function(el){
      if(el.dataset.historyEnhanced==='1') return;
      const placa=resolvePlateFromElement(el);
      if(!placa) return;
      el.dataset.historyEnhanced='1';
      el.dataset.historyPlate=placa;
      el.title='Clique para abrir o histórico da placa';
    });

    page.querySelectorAll('tr').forEach(function(row){
      if(row.dataset.historyRowEnhanced==='1') return;
      const placa=resolvePlateFromElement(row);
      if(!placa) return;
      row.dataset.historyRowEnhanced='1';
      const cells=row.querySelectorAll('td');
      if(!cells.length) return;
      const last=cells[cells.length-1];
      if(last && !last.querySelector('.vehicle-history-inline-btn')){
        const btn=document.createElement('button');
        btn.type='button';
        btn.className='vehicle-history-inline-btn';
        btn.textContent='Histórico';
        btn.dataset.historyPlate=placa;
        last.prepend(btn);
      }
    });

    page.querySelectorAll('article,.card,.vehicle-card,.fleet-card').forEach(function(card){
      if(card.dataset.historyCardEnhanced==='1') return;
      const placa=resolvePlateFromElement(card);
      if(!placa) return;
      card.dataset.historyCardEnhanced='1';
      card.dataset.historyPlate=placa;
      card.style.cursor='pointer';
    });
  }

  document.addEventListener('click',function(ev){
    const page=document.getElementById('veiculos');
    if(!page || !page.contains(ev.target)) return;

    const ignore = ev.target.closest && ev.target.closest('input,select,textarea,.icon-btn,[onclick*="openForm"],[onclick*="removeItem"]');
    const btn = ev.target.closest && ev.target.closest('.vehicle-history-inline-btn,[data-history-plate],.plate');
    if(btn){
      const placa=resolvePlateFromElement(btn);
      if(placa){
        ev.preventDefault();
        ev.stopPropagation();
        openVehicleHistory(placa);
      }
      return;
    }

    if(ignore) return;

    const rowOrCard = ev.target.closest && (ev.target.closest('tr') || ev.target.closest('article') || ev.target.closest('.card') || ev.target.closest('.vehicle-card') || ev.target.closest('.fleet-card'));
    if(rowOrCard && page.contains(rowOrCard)){
      const placa=resolvePlateFromElement(rowOrCard);
      if(placa){
        ev.preventDefault();
        ev.stopPropagation();
        openVehicleHistory(placa);
      }
    }
  }, true);

  function wrapShowPage(){
    const old = window.showPage || (typeof showPage==='function'?showPage:null);
    if(!old || old.__vehicleHistoryWrapped) return;
    const wrapped=function(){
      const out=old.apply(this,arguments);
      setTimeout(enhanceVehiclePage,80);
      setTimeout(enhanceVehiclePage,400);
      return out;
    };
    wrapped.__vehicleHistoryWrapped=true;
    window.showPage=wrapped;
    try{showPage=wrapped}catch(e){}
  }

  const observer = new MutationObserver(function(){
    const cp = (typeof currentPage!=='undefined'?currentPage:window.currentPage);
    if(cp==='veiculos') setTimeout(enhanceVehiclePage,30);
  });
  try{observer.observe(document.body,{childList:true,subtree:true})}catch(e){}

  wrapShowPage();
  document.addEventListener('DOMContentLoaded',function(){
    wrapShowPage();
    setTimeout(enhanceVehiclePage,200);
    setTimeout(enhanceVehiclePage,1000);
  });
  setTimeout(function(){
    wrapShowPage();
    enhanceVehiclePage();
  },800);
})();

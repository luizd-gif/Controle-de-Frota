(function(){
  function H(v){
    try{return typeof esc==='function' ? esc(v) : String(v??'').replace(/[&<>'"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]})}catch(e){return String(v??'')}
  }
  function C(v){
    try{return typeof clean==='function' ? clean(v) : String(v??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}catch(e){return String(v??'').toLowerCase()}
  }
  function D(v){try{return typeof daysUntil==='function'?daysUntil(v):NaN}catch(e){return NaN}}
  function F(v){try{return typeof fmtDate==='function'?fmtDate(v):(v||'-')}catch(e){return v||'-'}}
  function M(v){try{return typeof BRL==='function'?BRL(v):String(v||0)}catch(e){return String(v||0)}}
  function oilState(r){try{return typeof oilStatusEmpresa==='function'?oilStatusEmpresa(r):(typeof oilStatus==='function'?oilStatus(r):{tag:'gray',text:'Verificar'})}catch(e){return {tag:'gray',text:'Verificar'}}}
  function multaStatus(r){try{return typeof statusMulta==='function'?statusMulta(r.status):C(r.status)}catch(e){return C(r.status)}}
  function prazoText(p){try{return typeof prazoAceiteText==='function'?prazoAceiteText(p):(p?F(p):'Sem prazo')}catch(e){return p?F(p):'Sem prazo'}}
  function isOil(r){try{return typeof isOilExpiryConsidered==='function'?isOilExpiryConsidered(r):true}catch(e){return true}}
  function iconFor(group){
    var g=C(group);
    if(g.indexOf('multa')>=0) return '🚨';
    if(g.indexOf('tac')>=0) return '🧾';
    if(g.indexOf('oleo')>=0) return '🛢️';
    if(g.indexOf('cnh')>=0) return '🪪';
    if(g.indexOf('manut')>=0) return '🛠️';
    if(g.indexOf('veiculo')>=0) return '🚚';
    if(g.indexOf('ponto')>=0) return '📍';
    return '⚠️';
  }
  function levelText(c){
    if(c==='red') return 'Crítico';
    if(c==='amber') return 'Atenção';
    if(c==='blue') return 'Acompanhar';
    if(c==='green') return 'Operacional';
    return 'Info';
  }
  function pageLabel(p){
    return {multas:'Multas',tacografos:'Tacógrafos',oleo:'Troca de óleo',motoristas:'Motoristas',manutencoes:'Manutenções',veiculos:'Veículos',pontos:'Pontos',producao:'Produção do Dia',dashboard:'Dashboard'}[p]||p||'Módulo';
  }
  function buildAlertsV3(){
    var alerts=[];
    try{
      (data.multas||[]).forEach(function(r){
        var st=multaStatus(r);
        if(['aguardando_aceite','aguardando_assinatura','pendente'].indexOf(st)>=0){
          var d=D(r.prazo), urgent=Number.isFinite(d)&&d<=5;
          alerts.push({grupo:'Multas',c:urgent?'red':'amber',t:'Multa '+(r.placa||'-'),d:(r.motorista||'Sem motorista')+' • '+(r.prazo?prazoText(r.prazo):'Sem prazo informado'),page:'multas',q:r.placa||r.motorista||r.auto||'',ord:urgent?1:2});
        }
      });
      (data.tacografos||[]).forEach(function(r){
        var validade=r.validade||r.vencimento||r.data_validade;
        if(validade){
          var d=D(validade);
          if(Number.isFinite(d)&&d<=60){
            alerts.push({grupo:'Tacógrafo',c:d<=30?'red':'amber',t:'Tacógrafo '+(r.placa||'-'),d:d<0?'Vencido há '+Math.abs(d)+' dias':'Vence em '+d+' dias',page:'tacografos',q:r.placa||r.status||'',ord:d<=30?1:2});
          }
        }
      });
      (data.oleo||[]).filter(isOil).forEach(function(r){
        var st=oilState(r);
        if(['red','amber'].indexOf(st.tag)>=0){
          alerts.push({grupo:'Óleo',c:st.tag,t:'Óleo '+(r.placa||'-'),d:st.text||'Verificar vencimento/quilometragem',page:'oleo',q:r.placa||r.modelo||'',ord:st.tag==='red'?1:2});
        }
      });
      (data.motoristas||[]).forEach(function(r){
        var validade=r.validade||r.validade_cnh||r.vencimento_cnh;
        if(validade){
          var d=D(validade);
          if(Number.isFinite(d)&&d<=60){
            alerts.push({grupo:'CNH',c:d<=30?'red':'amber',t:'CNH '+(r.nome||'-'),d:d<0?'Vencida há '+Math.abs(d)+' dias':'Vence em '+d+' dias',page:'motoristas',q:r.nome||r.cnh||'',ord:d<=30?1:2});
          }
        }
      });
      (data.manutencoes||[]).forEach(function(r){
        var st=C(r.status);
        if(st.includes('pendente')||st.includes('andamento')||st.includes('aberto')){
          alerts.push({grupo:'Manutenção',c:'blue',t:'Manutenção '+(r.placa||'-'),d:(r.tipo||r.servico||r.descricao||'Serviço pendente')+' • '+F(r.data),page:'manutencoes',q:r.placa||r.tipo||r.servico||'',ord:3});
        }
      });
      (data.veiculos||[]).forEach(function(r){
        var st=C(r.status||r.situacao);
        var motivo=r.motivo||r.descricao_motivo||r.observacao||'';
        if(st.includes('manut')||st.includes('inativo')||st.includes('parado')){
          alerts.push({grupo:'Veículos',c:st.includes('inativo')?'red':'blue',t:'Veículo '+(r.placa||'-'),d:(motivo?motivo:'Sem motivo informado')+' • Status: '+(r.status||r.situacao||'verificar'),page:'veiculos',q:r.placa||r.modelo||motivo||'',ord:st.includes('inativo')?1:3});
        }
      });
      try{
        var resumo=typeof pointSummary==='function'?Object.values(pointSummary()):[];
        resumo.forEach(function(r){
          var pts=Number(r.pontos||0);
          if(pts>=15){
            alerts.push({grupo:'Pontos',c:pts>=20?'red':'amber',t:'Pontuação '+(r.nome||r.motorista||'-'),d:pts+' pontos acumulados • consultar histórico',page:'pontos',q:r.nome||r.motorista||'',ord:pts>=20?1:2});
          }
        });
      }catch(e){}
    }catch(e){}
    return alerts.sort(function(a,b){return (a.ord||9)-(b.ord||9)}).slice(0,28);
  }
  window.makeAlertsSortido=buildAlertsV3;

  function resetFiltersForPage(page){
    try{
      if(page==='multas'){
        selectedMultaStatus='';
        var sm=document.getElementById('multasStatusMobile'); if(sm) sm.value='';
        var mm=document.getElementById('multasMonth'); if(mm) mm.value='';
      }
      if(page==='oleo'){ selectedOleoMonth=''; }
      if(page==='tacografos'){ selectedTacMonth=''; }
      if(page==='manutencoes'){ selectedManMonth=''; }
      if(page==='producao'){ selectedProdMonth=''; }
      if(page==='veiculos'){ window.selectedVehicleStatus='todos'; }
    }catch(e){}
  }
  function callRenderer(page){
    try{
      var fn=window['render_'+page];
      if(typeof fn==='function') fn();
    }catch(e){}
  }
  function setSearch(page,q){
    var selectors={multas:'#multasSearch',tacografos:'#tacSearch',oleo:'#oleoSearch',motoristas:'#motSearch',manutencoes:'#manSearch',producao:'#prodSearch',pontos:'#pontosSearch',veiculos:'#veiSearch'}[page];
    var input=selectors?document.querySelector(selectors):null;
    if(input && q){
      input.value=q;
      input.dispatchEvent(new Event('input',{bubbles:true}));
    }
  }
  function highlightTarget(page,q){
    var section=document.getElementById(page);
    if(!section) return;
    document.querySelectorAll('.alert-target-pulse').forEach(function(el){el.classList.remove('alert-target-pulse')});
    var needle=C(q);
    var candidates=[].slice.call(section.querySelectorAll('.fine-card,.driver-card,.vehicle-card,.oil-card,.folder,.table-card tbody tr,.cards > *,#veiculosTable tr,#motoristasTable tr,#oleoInfo tr,#tacInfo tr,#manTable tr,#pontosInfo tr,#prodInfo tr'));
    var target=null;
    if(needle){
      target=candidates.find(function(el){return C(el.textContent).indexOf(needle)>=0});
    }
    if(!target) target=candidates[0]||section;
    target.classList.add('alert-target-pulse');
    try{target.scrollIntoView({behavior:'smooth',block:'center'});}catch(e){section.scrollIntoView({behavior:'smooth',block:'start'});}
  }
  window.goToFleetAlert=function(i){
    var a=(window.__fleetDimeAlerts||[])[Number(i)];
    if(!a) return;
    var page=a.page||'dashboard';
    var q=a.q||'';
    resetFiltersForPage(page);
    try{
      if(typeof showPage==='function') showPage(page);
      else location.hash=page;
    }catch(e){try{location.hash=page}catch(_){}}
    setTimeout(function(){
      resetFiltersForPage(page);
      callRenderer(page);
      setSearch(page,q);
      setTimeout(function(){highlightTarget(page,q)},90);
      try{ if(typeof toast==='function') toast('Abrindo '+pageLabel(page)+(q?' • '+q:'')); }catch(e){}
    },230);
  };
  window.goToFleetAlertV3=window.goToFleetAlert;

  function overviewHtml(arr){
    var red=arr.filter(function(a){return a.c==='red'}).length;
    var amber=arr.filter(function(a){return a.c==='amber'}).length;
    var blue=arr.filter(function(a){return a.c==='blue'}).length;
    var total=arr.length;
    return '<div class="alerts-v3-overview">'+
      '<div class="alerts-v3-summary red"><small>Críticos</small><strong>'+red+'</strong><span>Exigem ação mais rápida.</span></div>'+
      '<div class="alerts-v3-summary amber"><small>Atenção</small><strong>'+amber+'</strong><span>Próximos do vencimento.</span></div>'+
      '<div class="alerts-v3-summary blue"><small>Acompanhar</small><strong>'+blue+'</strong><span>Pendências operacionais.</span></div>'+
      '<div class="alerts-v3-summary green"><small>Total</small><strong>'+total+'</strong><span>Alertas ativos da frota.</span></div>'+
    '</div>';
  }
  function alertasHtmlV3(){
    var arr=buildAlertsV3();
    window.__fleetDimeAlerts=arr;
    var cards='';
    if(arr.length){
      cards=arr.map(function(a,i){
        var cls=['red','amber','blue','green'].indexOf(a.c)>=0?a.c:'green';
        var filtro=a.q?'<span>Filtro: '+H(a.q)+'</span>':'<span>Filtro automático</span>';
        return '<button type="button" class="alert-card-v3 '+cls+'" onclick="goToFleetAlertV3('+i+')">'+
          '<div class="alert-card-v3-icon" aria-hidden="true">'+iconFor(a.grupo)+'</div>'+
          '<div class="alert-card-v3-main">'+
            '<div class="alert-card-v3-line"><span class="alert-chip-v3">'+H(a.grupo)+'</span><span class="alert-severity-v3">'+H(levelText(a.c))+'</span></div>'+
            '<h4>'+H(a.t)+'</h4>'+
            '<p>'+H(a.d)+'</p>'+
            '<div class="alert-meta-v3"><span>Consultar em: '+H(pageLabel(a.page))+'</span>'+filtro+'</div>'+
          '</div>'+
          '<div class="alert-card-v3-action"><span>Abrir</span><b>→</b></div>'+
        '</button>';
      }).join('');
    }else{
      cards='<div class="alerts-v3-empty">Nenhum alerta crítico no momento. A frota está sem pendências urgentes.</div>';
    }
    return '<div class="alerts-v3-shell">'+
      '<div class="alerts-v3-hero">'+
        '<div class="alerts-v3-hero-main"><span class="alerts-v3-kicker">Central Operacional</span><h3>Alertas FROTA DIME</h3><p>Clique em qualquer alerta para abrir automaticamente o módulo correto, aplicar o filtro da placa, motorista ou documento e destacar o registro consultado.</p></div>'+
        '<div class="alerts-v3-meter"><small>Alertas ativos</small><strong>'+arr.length+'</strong><span>clique para consultar</span></div>'+
      '</div>'+
      overviewHtml(arr)+
      '<div class="alerts-v3-panel"><div class="alerts-v3-panel-head"><div><h3>Alertas clicáveis</h3><small>Multas, CNH, óleo, tacógrafo, manutenção, veículos e pontos</small></div></div><div class="alerts-v3-list">'+cards+'</div></div>'+
    '</div>';
  }

  window.render_dashboard=function(){
    try{ if(typeof setActions==='function') setActions("<button class=\"btn\" onclick=\"exportCSV(\'multas\')\">Exportar multas CSV</button>"); }catch(e){}
    var totalMan=(data.manutencoes||[]).reduce(function(s,r){return s+(+r.valor||0)},0);
    var totalMultas=(data.multas||[]).reduce(function(s,r){return s+(+r.valor||0)},0);
    var alerts=buildAlertsV3();
    var rankingMotoristas=Object.values((data.multas||[]).reduce(function(m,r){var k=r.motorista||'Sem motorista';m[k]=m[k]||{nome:k,qtd:0,valor:0};m[k].qtd++;m[k].valor+=(+r.valor||0);return m},{})).sort(function(a,b){return b.qtd-a.qtd}).slice(0,5);
    var rankingMan=Object.values((data.manutencoes||[]).reduce(function(m,r){var k=r.placa||'Sem placa';m[k]=m[k]||{placa:k,qtd:0,valor:0};m[k].qtd++;m[k].valor+=(+r.valor||0);return m},{})).sort(function(a,b){return b.valor-a.valor}).slice(0,5);
    var html=(typeof stats==='function'?stats([['Veículos',(data.veiculos||[]).length,'cadastrados'],['Alertas',alerts.length,'clicáveis'],['Multas',M(totalMultas),'valor total'],['Manutenção',M(totalMan),'valor total']]):'')+
      '<div class="global-search-card"><input id="globalSearch" placeholder="Pesquisa global: placa, motorista, CPF, CNH ou auto..."><div class="global-results" id="globalResults"></div></div>'+
      alertasHtmlV3()+
      '<div class="dash-grid"><div>'+table('Ranking de multas por motorista',['Motorista','Qtd.','Valor'],rankingMotoristas.map(function(r){return '<tr><td><b>'+H(r.nome)+'</b></td><td>'+r.qtd+'</td><td>'+M(r.valor)+'</td></tr>'}).join(''))+'</div><div>'+table('Veículos com mais custo de manutenção',['Placa','Serviços','Valor'],rankingMan.map(function(r){return '<tr><td><span class="plate">'+H(r.placa)+'</span></td><td>'+r.qtd+'</td><td>'+M(r.valor)+'</td></tr>'}).join(''))+'</div></div>'+
      '<div class="table-card"><div class="table-head"><h3>Histórico completo do veículo</h3><small>Digite uma placa na pesquisa global e clique no resultado do veículo</small></div><div id="vehicleHistory" class="vehicle-history"><div class="empty">Nenhum veículo selecionado.</div></div></div>';
    var dash=document.getElementById('dashboard');
    if(dash) dash.innerHTML=html;
    var gs=document.getElementById('globalSearch');
    if(gs && typeof renderGlobalSearch==='function') gs.oninput=renderGlobalSearch;
    try{ if(typeof highlightDescriptions==='function') highlightDescriptions(); }catch(e){}
  };
  document.addEventListener('DOMContentLoaded',function(){try{if((typeof currentPage!=='undefined'?currentPage:'')==='dashboard') window.render_dashboard()}catch(e){}});
  setTimeout(function(){try{if((typeof currentPage!=='undefined'?currentPage:'')==='dashboard') window.render_dashboard()}catch(e){}},600);
})();

(function(){
  function H(v){
    try{return typeof esc==='function' ? esc(v) : String(v??'').replace(/[&<>'"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]})}catch(e){return String(v??'')}
  }
  function M(v){ try{ return typeof BRL==='function' ? BRL(v) : String(v||0); }catch(e){ return String(v||0); } }
  function iconFor(group){
    var g=String(group||'').toLowerCase();
    if(g.indexOf('multa')>=0) return '🚨';
    if(g.indexOf('tac')>=0) return '🧾';
    if(g.indexOf('óleo')>=0 || g.indexOf('oleo')>=0) return '🛢️';
    if(g.indexOf('cnh')>=0) return '🪪';
    if(g.indexOf('manut')>=0) return '🛠️';
    return '⚠️';
  }
  function levelText(c){
    if(c==='red') return 'Crítico';
    if(c==='amber') return 'Atenção';
    if(c==='blue') return 'Acompanhar';
    return 'Informativo';
  }
  function overviewHtml(arr){
    var red=arr.filter(function(a){return a.c==='red'}).length;
    var amber=arr.filter(function(a){return a.c==='amber'}).length;
    var blue=arr.filter(function(a){return a.c==='blue'}).length;
    var total=arr.length;
    return '<div class="alerts-overview">'+
      '<div class="alerts-overview-card red"><small class="kicker">Críticos</small><strong>'+red+'</strong><span>Itens que pedem ação mais rápida.</span></div>'+
      '<div class="alerts-overview-card amber"><small class="kicker">Atenção</small><strong>'+amber+'</strong><span>Itens próximos do vencimento.</span></div>'+
      '<div class="alerts-overview-card blue"><small class="kicker">Acompanhar</small><strong>'+blue+'</strong><span>Pendências operacionais abertas.</span></div>'+
      '<div class="alerts-overview-card gray"><small class="kicker">Total</small><strong>'+total+'</strong><span>Alertas ativos na central FROTA DIME.</span></div>'+
    '</div>';
  }
  function alertasHtmlPremium(){
    var arr=(typeof window.makeAlertsSortido==='function'?window.makeAlertsSortido():[])||[];
    window.__fleetDimeAlerts=arr;
    var content='';
    if(arr.length){
      content=arr.map(function(a,i){
        var tag=a.c==='red'?'red':a.c==='amber'?'amber':a.c==='blue'?'blue':'gray';
        return '<button type="button" class="alert-card alert-clickable '+H(a.c)+'" onclick="goToFleetAlert('+i+')">'+
          '<div class="alert-top">'+
            '<div class="alert-badges">'+
              '<span class="tag '+tag+'">'+H(a.grupo)+'</span>'+
              '<span class="level-badge">'+H(levelText(a.c))+'</span>'+
            '</div>'+
            '<span class="alert-icon" aria-hidden="true">'+iconFor(a.grupo)+'</span>'+
          '</div>'+
          '<b class="alert-title">'+H(a.t)+'</b>'+
          '<small class="alert-desc">'+H(a.d)+'</small>'+
          '<div class="alert-footer"><strong>Abrir módulo</strong><span>Ir direto para o item relacionado →</span></div>'+
        '</button>';
      }).join('');
    } else {
      content='<div class="alert-empty-state">Nenhum alerta crítico no momento.</div>';
    }
    return '<div class="alerts-shell">'+overviewHtml(arr)+'<div class="table-card alert-panel-premium"><div class="table-head"><h3>Central de alertas</h3><small>Visual mais limpo, leitura melhor e clique direto para abrir o módulo filtrado</small></div><div class="alert-mixed-grid">'+content+'</div></div></div>';
  }
  window.render_dashboard=function(){
    try{ if(typeof setActions==='function') setActions('<button class="btn" onclick="exportCSV(\'multas\')">Exportar multas CSV</button>'); }catch(e){}
    var totalMan=(data.manutencoes||[]).reduce(function(s,r){return s+(+r.valor||0)},0);
    var totalMultas=(data.multas||[]).reduce(function(s,r){return s+(+r.valor||0)},0);
    var alerts=(typeof window.makeAlertsSortido==='function'?window.makeAlertsSortido():[])||[];
    var rankingMotoristas=Object.values((data.multas||[]).reduce(function(m,r){var k=r.motorista||'Sem motorista';m[k]=m[k]||{nome:k,qtd:0,valor:0};m[k].qtd++;m[k].valor+=(+r.valor||0);return m},{})).sort(function(a,b){return b.qtd-a.qtd}).slice(0,5);
    var rankingMan=Object.values((data.manutencoes||[]).reduce(function(m,r){var k=r.placa||'Sem placa';m[k]=m[k]||{placa:k,qtd:0,valor:0};m[k].qtd++;m[k].valor+=(+r.valor||0);return m},{})).sort(function(a,b){return b.valor-a.valor}).slice(0,5);
    var html=(typeof stats==='function'?stats([['Veículos',(data.veiculos||[]).length,'cadastrados'],['Alertas',alerts.length,'visual repaginado'],['Multas',M(totalMultas),'valor total'],['Manutenção',M(totalMan),'valor total']]):'')+
      '<div class="global-search-card"><input id="globalSearch" placeholder="Pesquisa global: placa, motorista, CPF, CNH ou auto..."><div class="global-results" id="globalResults"></div></div>'+
      alertasHtmlPremium()+
      '<div class="dash-grid"><div>'+table('Ranking de multas por motorista',['Motorista','Qtd.','Valor'],rankingMotoristas.map(function(r){return '<tr><td><b>'+H(r.nome)+'</b></td><td>'+r.qtd+'</td><td>'+M(r.valor)+'</td></tr>'}).join(''))+'</div><div>'+table('Veículos com mais custo de manutenção',['Placa','Serviços','Valor'],rankingMan.map(function(r){return '<tr><td><span class="plate">'+H(r.placa)+'</span></td><td>'+r.qtd+'</td><td>'+M(r.valor)+'</td></tr>'}).join(''))+'</div></div>'+
      '<div class="table-card"><div class="table-head"><h3>Histórico completo do veículo</h3><small>Digite uma placa na pesquisa global e clique no resultado do veículo</small></div><div id="vehicleHistory" class="vehicle-history"><div class="empty">Nenhum veículo selecionado.</div></div></div>';
    var dash=document.getElementById('dashboard');
    if(dash) dash.innerHTML=html;
    var gs=document.getElementById('globalSearch');
    if(gs && typeof renderGlobalSearch==='function') gs.oninput=renderGlobalSearch;
    try{ if(typeof highlightDescriptions==='function') highlightDescriptions(); }catch(e){}
  };
  document.addEventListener('DOMContentLoaded',function(){
    try{ if((typeof currentPage!=='undefined'?currentPage:'')==='dashboard') window.render_dashboard(); }catch(e){}
  });
  setTimeout(function(){ try{ if((typeof currentPage!=='undefined'?currentPage:'')==='dashboard') window.render_dashboard(); }catch(e){} }, 700);
})();

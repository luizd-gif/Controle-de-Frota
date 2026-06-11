(function(){
  function E(v){
    try{ return typeof esc==='function' ? esc(v) : String(v??'').replace(/[&<>'"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]}); }
    catch(err){ return String(v??''); }
  }
  function C(v){
    try{ return typeof clean==='function' ? clean(v) : String(v??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
    catch(err){ return String(v??'').toLowerCase(); }
  }
  function D(v){ try{ return typeof daysUntil==='function' ? daysUntil(v) : NaN; }catch(e){ return NaN; } }
  function F(v){ try{ return typeof fmtDate==='function' ? fmtDate(v) : (v||'-'); }catch(e){ return v||'-'; } }
  function money(v){ try{ return typeof BRL==='function' ? BRL(v) : String(v||0); }catch(e){ return String(v||0); } }
  function oilState(r){ try{ return typeof oilStatusEmpresa==='function' ? oilStatusEmpresa(r) : (typeof oilStatus==='function'?oilStatus(r):{tag:'gray',text:'Verificar'}); }catch(e){ return {tag:'gray',text:'Verificar'}; } }
  function multaStatus(r){ try{ return typeof statusMulta==='function' ? statusMulta(r.status) : C(r.status); }catch(e){ return C(r.status); } }
  function prazoText(p){ try{ return typeof prazoAceiteText==='function' ? prazoAceiteText(p) : (p?F(p):'Sem prazo'); }catch(e){ return p?F(p):'Sem prazo'; } }
  function isOil(r){ try{ return typeof isOilExpiryConsidered==='function' ? isOilExpiryConsidered(r) : true; }catch(e){ return true; } }

  function buildAlerts(){
    var alerts=[];
    (data.multas||[]).forEach(function(r){
      var st=multaStatus(r);
      if(['aguardando_aceite','aguardando_assinatura'].indexOf(st)>=0){
        var d=D(r.prazo), urgent=Number.isFinite(d)&&d<=5;
        alerts.push({grupo:'Multas',c:urgent?'red':'amber',t:'Multa '+(r.placa||'-'),d:(r.motorista||'Sem motorista')+' • '+(r.prazo?prazoText(r.prazo):'Sem prazo'),page:'multas',q:r.placa||r.motorista||r.auto||'',ord:urgent?1:2});
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
        alerts.push({grupo:'Óleo',c:st.tag,t:'Óleo '+(r.placa||'-'),d:st.text||'Verificar vencimento',page:'oleo',q:r.placa||r.modelo||'',ord:st.tag==='red'?1:2});
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
      if(C(r.status).includes('pendente')){
        alerts.push({grupo:'Manutenção',c:'blue',t:'Manutenção '+(r.placa||'-'),d:(r.tipo||r.servico||r.descricao||'Pendente')+' • '+F(r.data),page:'manutencoes',q:r.placa||r.tipo||r.servico||'',ord:3});
      }
    });
    return alerts.sort(function(a,b){return (a.ord||9)-(b.ord||9)}).slice(0,18);
  }

  window.makeAlertsSortido = buildAlerts;
  window.goToFleetAlert=function(i){
    var a=(window.__fleetDimeAlerts||[])[Number(i)];
    if(!a) return;
    var page=a.page||'dashboard';
    try{ if(typeof showPage==='function') showPage(page); }
    catch(e){ try{ window.location.hash=page; }catch(_){} }
    setTimeout(function(){
      var selector={multas:'#multasSearch',tacografos:'#tacSearch',oleo:'#oleoSearch',motoristas:'#motSearch',manutencoes:'#manSearch',producao:'#prodSearch',pontos:'#pontosSearch'}[page];
      var q=a.q||'';
      var input=selector?document.querySelector(selector):null;
      if(input && q){
        input.value=q;
        input.dispatchEvent(new Event('input',{bubbles:true}));
      }
      var section=document.getElementById(page);
      if(section) section.scrollIntoView({behavior:'smooth',block:'start'});
      try{ if(typeof toast==='function') toast('Abrindo '+(a.grupo||'alerta')+(q?' • '+q:'')); }catch(e){}
    },180);
  };

  function alertasHtmlDime(){
    var arr=buildAlerts();
    window.__fleetDimeAlerts=arr;
    var content=arr.length?arr.map(function(a,i){
      var tag=a.c==='red'?'red':a.c==='amber'?'amber':a.c==='blue'?'blue':'gray';
      return '<button type="button" class="alert-card alert-clickable '+E(a.c)+'" onclick="goToFleetAlert('+i+')">'+
        '<span class="tag '+tag+'">'+E(a.grupo)+'</span>'+
        '<b class="alert-title">'+E(a.t)+'</b>'+
        '<small class="alert-desc">'+E(a.d)+'</small>'+
      '</button>';
    }).join(''):'<div class="empty">Nenhum alerta crítico no momento.</div>';
    return '<div class="table-card"><div class="table-head"><h3>Central de alertas</h3><small>Clique em um alerta para abrir o módulo filtrado automaticamente</small></div><div class="alert-mixed-grid">'+content+'</div></div>';
  }

  window.render_dashboard=function(){
    try{ if(typeof setActions==='function') setActions('<button class="btn" onclick="exportCSV(\'multas\')">Exportar multas CSV</button>'); }catch(e){}
    var totalMan=(data.manutencoes||[]).reduce(function(s,r){return s+(+r.valor||0)},0);
    var totalMultas=(data.multas||[]).reduce(function(s,r){return s+(+r.valor||0)},0);
    var alerts=buildAlerts();
    var rankingMotoristas=Object.values((data.multas||[]).reduce(function(m,r){var k=r.motorista||'Sem motorista';m[k]=m[k]||{nome:k,qtd:0,valor:0};m[k].qtd++;m[k].valor+=(+r.valor||0);return m},{})).sort(function(a,b){return b.qtd-a.qtd}).slice(0,5);
    var rankingMan=Object.values((data.manutencoes||[]).reduce(function(m,r){var k=r.placa||'Sem placa';m[k]=m[k]||{placa:k,qtd:0,valor:0};m[k].qtd++;m[k].valor+=(+r.valor||0);return m},{})).sort(function(a,b){return b.valor-a.valor}).slice(0,5);
    var html=(typeof stats==='function'?stats([['Veículos',(data.veiculos||[]).length,'cadastrados'],['Alertas',alerts.length,'clique para abrir'],['Multas',money(totalMultas),'valor total'],['Manutenção',money(totalMan),'valor total']]):'')+
      '<div class="global-search-card"><input id="globalSearch" placeholder="Pesquisa global: placa, motorista, CPF, CNH ou auto..."><div class="global-results" id="globalResults"></div></div>'+alertasHtmlDime()+
      '<div class="dash-grid"><div>'+table('Ranking de multas por motorista',['Motorista','Qtd.','Valor'],rankingMotoristas.map(function(r){return '<tr><td><b>'+E(r.nome)+'</b></td><td>'+r.qtd+'</td><td>'+money(r.valor)+'</td></tr>'}).join(''))+'</div><div>'+table('Veículos com mais custo de manutenção',['Placa','Serviços','Valor'],rankingMan.map(function(r){return '<tr><td><span class="plate">'+E(r.placa)+'</span></td><td>'+r.qtd+'</td><td>'+money(r.valor)+'</td></tr>'}).join(''))+'</div></div>'+
      '<div class="table-card"><div class="table-head"><h3>Histórico completo do veículo</h3><small>Digite uma placa na pesquisa global e clique no resultado do veículo</small></div><div id="vehicleHistory" class="vehicle-history"><div class="empty">Nenhum veículo selecionado.</div></div></div>';
    var dash=document.getElementById('dashboard');
    if(dash) dash.innerHTML=html;
    var gs=document.getElementById('globalSearch');
    if(gs && typeof renderGlobalSearch==='function') gs.oninput=renderGlobalSearch;
    highlightDescriptions();
  };
  try{ render_dashboard=window.render_dashboard; }catch(e){}

  function highlightDescriptions(root){
    root=root||document;
    try{
      root.querySelectorAll('.multa-desc,.desc-muted').forEach(function(el){el.classList.add('desc-highlight')});
      root.querySelectorAll('table').forEach(function(table){
        var headers=[].map.call(table.querySelectorAll('thead th'),function(th){return C(th.textContent)});
        var idx=[];
        headers.forEach(function(h,i){ if(/obs|observacao|descri|motivo|servico|detalhe/.test(h)) idx.push(i+1); });
        if(!idx.length) return;
        table.querySelectorAll('tbody tr').forEach(function(tr){
          idx.forEach(function(n){ var td=tr.querySelector('td:nth-child('+n+')'); if(td && td.textContent.trim() && td.textContent.trim()!=='-') td.classList.add('desc-cell'); });
        });
      });
    }catch(e){}
  }
  window.highlightDescriptions=highlightDescriptions;

  function applyBrand(){
    document.title='FROTA DIME';
    var brandTitle=document.querySelector('.sidebar .brand h1');
    var brandSub=document.querySelector('.sidebar .brand small');
    var loginTitle=document.querySelector('.login-card h1');
    var loginSub=document.querySelector('.login-card p');
    var themeBtn=document.getElementById('themeToggleBtn');
    if(brandTitle && brandTitle.textContent.trim()!=='FROTA DIME') brandTitle.textContent='FROTA DIME';
    if(brandSub && brandSub.textContent.trim()!=='Gestão de Frota') brandSub.textContent='Gestão de Frota';
    if(loginTitle && loginTitle.textContent.trim()!=='FROTA DIME') loginTitle.textContent='FROTA DIME';
    if(loginSub && loginSub.textContent.trim()!=='Acesso ao painel operacional') loginSub.textContent='Acesso ao painel operacional';
    if(themeBtn && themeBtn.textContent.trim()!=='⚙️ FROTA DIME') themeBtn.textContent='⚙️ FROTA DIME';
  }
  // Observador removido nesta versão: ele podia entrar em loop ao reescrever textos do topo durante o carregamento.
  document.addEventListener('DOMContentLoaded',function(){applyBrand();highlightDescriptions(); if((typeof currentPage!=='undefined'?currentPage:'')==='dashboard') window.render_dashboard();});
  applyBrand();
  setTimeout(function(){applyBrand();highlightDescriptions(); if((typeof currentPage!=='undefined'?currentPage:'')==='dashboard') window.render_dashboard();},500);
  setTimeout(function(){applyBrand();highlightDescriptions();},1400);
})();

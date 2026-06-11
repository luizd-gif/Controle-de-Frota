(function(){
  function H(v){
    try{ return typeof esc==='function' ? esc(v) : String(v??'').replace(/[&<>'"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]}); }
    catch(e){ return String(v??''); }
  }
  function C(v){
    try{ return typeof clean==='function' ? clean(v) : String(v??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
    catch(e){ return String(v??'').toLowerCase(); }
  }
  function D(v){ try{ return typeof daysUntil==='function' ? daysUntil(v) : NaN; }catch(e){ return NaN; } }
  function F(v){ try{ return typeof fmtDate==='function' ? fmtDate(v) : (v||'-'); }catch(e){ return v||'-'; } }
  function M(v){ try{ return typeof BRL==='function' ? BRL(v) : String(v||0); }catch(e){ return String(v||0); } }
  function oilState(r){ try{ return typeof oilStatusEmpresa==='function' ? oilStatusEmpresa(r) : (typeof oilStatus==='function'?oilStatus(r):{tag:'gray',text:'Verificar'}); }catch(e){ return {tag:'gray',text:'Verificar'}; } }
  function isOil(r){ try{ return typeof isOilExpiryConsidered==='function' ? isOilExpiryConsidered(r) : true; }catch(e){ return true; } }
  function multaStatus(r){ try{ return typeof statusMulta==='function' ? statusMulta(r.status) : C(r.status); }catch(e){ return C(r.status); } }
  function prazoText(p){ try{ return typeof prazoAceiteText==='function' ? prazoAceiteText(p) : (p?F(p):'Sem prazo informado'); }catch(e){ return p?F(p):'Sem prazo informado'; } }
  function iconFor(g){
    g=C(g);
    if(g.includes('multa')) return '⚠️';
    if(g.includes('tac')) return '⏱️';
    if(g.includes('oleo')) return '🛢️';
    if(g.includes('cnh')||g.includes('motor')) return '🪪';
    if(g.includes('manut')) return '🔧';
    if(g.includes('veic')) return '🚚';
    if(g.includes('ponto')) return '📍';
    return '•';
  }
  function pageLabel(p){
    return {multas:'Multas',tacografos:'Tacógrafos',oleo:'Troca de óleo',motoristas:'Motoristas',manutencoes:'Manutenções',veiculos:'Veículos',pontos:'Pontos',producao:'Produção do Dia',dashboard:'Dashboard'}[p]||p||'Módulo';
  }
  function level(a){ return a.c==='red'?1:a.c==='amber'?2:a.c==='blue'?3:4; }

  function buildAlertsModulo(){
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
            alerts.push({grupo:'CNH / Motoristas',c:d<=30?'red':'amber',t:'CNH '+(r.nome||'-'),d:d<0?'Vencida há '+Math.abs(d)+' dias':'Vence em '+d+' dias',page:'motoristas',q:r.nome||r.cnh||'',ord:d<=30?1:2});
          }
        }
      });
      (data.manutencoes||[]).forEach(function(r){
        var st=C(r.status);
        if(st.includes('pendente')||st.includes('andamento')||st.includes('aberto')){
          alerts.push({grupo:'Manutenções',c:'blue',t:'Manutenção '+(r.placa||'-'),d:(r.tipo||r.servico||r.descricao||'Serviço pendente')+' • '+F(r.data),page:'manutencoes',q:r.placa||r.tipo||r.servico||'',ord:3});
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
    return alerts.sort(function(a,b){return level(a)-level(b) || (a.ord||9)-(b.ord||9)});
  }
  window.makeAlertsPorModulo=buildAlertsModulo;

  function goToAlertIndex(i){
    window.__fleetDimeAlerts = window.__fleetDimeAlerts || [];
    if(typeof window.goToFleetAlertV3==='function') return window.goToFleetAlertV3(i);
    if(typeof window.goToFleetAlert==='function') return window.goToFleetAlert(i);
  }
  window.goToFleetAlertModulo=goToAlertIndex;

  function groupedHtml(alerts){
    var order=['Multas','CNH / Motoristas','Óleo','Tacógrafo','Manutenções','Veículos','Pontos'];
    var by={};
    alerts.forEach(function(a){ (by[a.grupo]=by[a.grupo]||[]).push(a); });
    var html='';
    order.forEach(function(g){
      var list=by[g]||[];
      if(!list.length) return;
      var show=list.slice(0,6);
      html += '<section class="alerts-module"><div class="alerts-module-head"><h4>'+H(g)+'</h4><span>'+list.length+'</span></div><div class="alerts-module-list">';
      show.forEach(function(a){
        var idx=window.__fleetDimeAlerts.push(a)-1;
        var cls=['red','amber','blue','green'].indexOf(a.c)>=0?a.c:'green';
        html += '<button type="button" class="alert-card-mod '+cls+'" onclick="goToFleetAlertModulo('+idx+')">'+
          '<div class="alert-card-mod-icon">'+iconFor(a.grupo)+'</div>'+
          '<div><h5>'+H(a.t)+'</h5><p>'+H(a.d)+' • '+H(pageLabel(a.page))+'</p></div>'+
          '<b>→</b>'+
        '</button>';
      });
      if(list.length>show.length) html += '<div class="alerts-mod-more">+'+(list.length-show.length)+' alertas neste módulo</div>';
      html += '</div></section>';
    });
    return html || '<div class="alerts-mod-empty">Nenhum alerta crítico no momento.</div>';
  }
  function alertasHtmlModulo(){
    var arr=buildAlertsModulo();
    window.__fleetDimeAlerts=[];
    var red=arr.filter(function(a){return a.c==='red'}).length;
    var amber=arr.filter(function(a){return a.c==='amber'}).length;
    var blue=arr.filter(function(a){return a.c==='blue'}).length;
    var mods={}; arr.forEach(function(a){mods[a.grupo]=1;});
    return '<div class="alerts-mod-shell">'+
      '<div class="alerts-mod-hero"><div><h3>Central da Frota</h3><p>Alertas separados por módulo. Clique no item para abrir a aba correta e localizar o registro.</p></div><div class="alerts-mod-total"><small>Total</small><strong>'+arr.length+'</strong></div></div>'+
      '<div class="alerts-mod-overview">'+
        '<div class="alerts-mod-summary"><small>Críticos</small><strong>'+red+'</strong></div>'+
        '<div class="alerts-mod-summary"><small>Atenção</small><strong>'+amber+'</strong></div>'+
        '<div class="alerts-mod-summary"><small>Acompanhar</small><strong>'+blue+'</strong></div>'+
        '<div class="alerts-mod-summary"><small>Módulos</small><strong>'+Object.keys(mods).length+'</strong></div>'+
      '</div>'+
      '<div class="alerts-mod-groups">'+groupedHtml(arr)+'</div>'+
    '</div>';
  }
  window.alertasHtmlModulo=alertasHtmlModulo;

  function cleanDescriptionMarks(root){
    root=root||document;
    try{
      var notWanted = '#multas .desc-highlight,#multas .desc-cell,#multas .obs-cell,#multas .motivo-cell,.dash-grid .desc-cell';
      root.querySelectorAll(notWanted).forEach(function(el){
        el.classList.remove('desc-highlight','desc-cell','obs-cell','motivo-cell');
      });
      ['#manutencoes','#producao'].forEach(function(sel){
        var box=root.querySelector(sel);
        if(!box) return;
        box.querySelectorAll('table').forEach(function(table){
          var heads=[].map.call(table.querySelectorAll('thead th'),function(th){return C(th.textContent)});
          var idx=[];
          heads.forEach(function(h,i){ if(/obs|observacao|descri|motivo|detalhe/.test(h)) idx.push(i+1); });
          table.querySelectorAll('tbody tr').forEach(function(tr){
            idx.forEach(function(n){
              var td=tr.querySelector('td:nth-child('+n+')');
              if(td && td.textContent.trim() && td.textContent.trim()!=='-') td.classList.add('desc-cell');
            });
          });
        });
        box.querySelectorAll('.desc-muted,.multa-desc').forEach(function(el){ el.classList.add('dime-desc-focus'); });
      });
    }catch(e){}
  }
  window.highlightDescriptions=function(root){ cleanDescriptionMarks(root); };
  window.aplicarDestaqueDescricoesDime=cleanDescriptionMarks;

  function moveUserPanelBottom(){
    try{
      var panel=document.getElementById('userPanel');
      var sidebar=document.querySelector('.sidebar');
      if(!panel || !sidebar) return;
      panel.classList.add('user-panel-bottom');
      panel.querySelectorAll('small').forEach(function(s){s.remove();});
      if(panel.parentElement!==sidebar || sidebar.lastElementChild!==panel) sidebar.appendChild(panel);
    }catch(e){}
  }
  window.moveUserPanelBottom=moveUserPanelBottom;

  /* Silencia somente o aviso automático de carregamento das multas */
  try{
    var oldToast=window.toast;
    if(typeof oldToast==='function' && !oldToast.__frotaDimeSilent){
      var silent=function(msg){
        if(/multas\s+carregadas\s+d[eo]\s+supabase/i.test(String(msg||''))) return;
        return oldToast.apply(this,arguments);
      };
      silent.__frotaDimeSilent=true;
      window.toast=silent;
    }
  }catch(e){}

  var oldRenderDashboard=window.render_dashboard || (typeof render_dashboard==='function'?render_dashboard:null);
  window.render_dashboard=function(){
    try{ if(typeof setActions==='function') setActions("<button class=\"btn\" onclick=\"exportCSV('multas')\">Exportar multas CSV</button>"); }catch(e){}
    try{
      var totalMan=(data.manutencoes||[]).reduce(function(s,r){return s+(+r.valor||0)},0);
      var totalMultas=(data.multas||[]).reduce(function(s,r){return s+(+r.valor||0)},0);
      var alerts=buildAlertsModulo();
      var rankingMotoristas=Object.values((data.multas||[]).reduce(function(m,r){var k=r.motorista||'Sem motorista';m[k]=m[k]||{nome:k,qtd:0,valor:0};m[k].qtd++;m[k].valor+=(+r.valor||0);return m},{})).sort(function(a,b){return b.qtd-a.qtd}).slice(0,5);
      var rankingMan=Object.values((data.manutencoes||[]).reduce(function(m,r){var k=r.placa||'Sem placa';m[k]=m[k]||{placa:k,qtd:0,valor:0};m[k].qtd++;m[k].valor+=(+r.valor||0);return m},{})).sort(function(a,b){return b.valor-a.valor}).slice(0,5);
      var html=(typeof stats==='function'?stats([['Veículos',(data.veiculos||[]).length,'cadastrados'],['Alertas',alerts.length,'por módulo'],['Multas',M(totalMultas),'valor total'],['Manutenção',M(totalMan),'valor total']]):'')+
        '<div class="global-search-card"><input id="globalSearch" placeholder="Pesquisa global: placa, motorista, CPF, CNH ou auto..."><div class="global-results" id="globalResults"></div></div>'+
        alertasHtmlModulo()+
        '<div class="dash-grid"><div>'+table('Ranking de multas por motorista',['Motorista','Qtd.','Valor'],rankingMotoristas.map(function(r){return '<tr><td><b>'+H(r.nome)+'</b></td><td>'+r.qtd+'</td><td>'+M(r.valor)+'</td></tr>'}).join(''))+'</div><div>'+table('Veículos com mais custo de manutenção',['Placa','Serviços','Valor'],rankingMan.map(function(r){return '<tr><td><span class="plate">'+H(r.placa)+'</span></td><td>'+r.qtd+'</td><td>'+M(r.valor)+'</td></tr>'}).join(''))+'</div></div>'+
        '<div class="table-card"><div class="table-head"><h3>Histórico completo do veículo</h3><small>Digite uma placa na pesquisa global e clique no resultado do veículo</small></div><div id="vehicleHistory" class="vehicle-history"><div class="empty">Nenhum veículo selecionado.</div></div></div>';
      var dash=document.getElementById('dashboard');
      if(dash) dash.innerHTML=html;
      var gs=document.getElementById('globalSearch');
      if(gs && typeof renderGlobalSearch==='function') gs.oninput=renderGlobalSearch;
      cleanDescriptionMarks();
      moveUserPanelBottom();
    }catch(e){
      if(typeof oldRenderDashboard==='function') return oldRenderDashboard();
    }
  };
  try{ render_dashboard=window.render_dashboard; }catch(e){}

  function applyAll(){
    cleanDescriptionMarks();
    moveUserPanelBottom();
    try{
      if((typeof currentPage!=='undefined'?currentPage:'')==='dashboard') window.render_dashboard();
    }catch(e){}
  }
  document.addEventListener('DOMContentLoaded',function(){
    moveUserPanelBottom();
    cleanDescriptionMarks();
    try{ if((typeof currentPage!=='undefined'?currentPage:'')==='dashboard') window.render_dashboard(); }catch(e){}
  });
  [250,800,1600,3000].forEach(function(t){setTimeout(function(){moveUserPanelBottom();cleanDescriptionMarks();},t);});
})();

(function(){
  function H(v){
    try{ return typeof esc==='function' ? esc(v) : String(v??'').replace(/[&<>'"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]}); }
    catch(e){ return String(v??''); }
  }
  function C(v){
    try{ return typeof clean==='function' ? clean(v) : String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }
    catch(e){ return String(v??'').toLowerCase(); }
  }
  function F(v){ try{ return typeof fmtDate==='function' ? fmtDate(v) : (v||'-'); }catch(e){ return v||'-'; } }
  function M(v){ try{ return typeof BRL==='function' ? BRL(v) : String(v||0); }catch(e){ return String(v||0); } }
  function YM(v){ try{ return typeof ym==='function' ? ym(v) : (/^\d{4}-\d{2}-\d{2}$/.test(String(v||''))?String(v).slice(0,7):''); }catch(e){ return ''; } }
  function MN(v){ try{ return typeof monthName==='function' ? monthName(v) : (v||'Todos os meses'); }catch(e){ return v||'Todos os meses'; } }
  function D(v){ try{ return typeof daysUntil==='function' ? daysUntil(v) : NaN; }catch(e){ return NaN; } }
  function ST(v){ try{ return typeof statusMulta==='function' ? statusMulta(v) : C(v); }catch(e){ return C(v); } }
  function STag(v){ try{ return typeof statusTag==='function' ? statusTag(v) : '<span class="tag gray">'+H(v||'-')+'</span>'; }catch(e){ return '<span class="tag gray">'+H(v||'-')+'</span>'; } }
  function PText(p){ try{ return typeof prazoAceiteText==='function' ? prazoAceiteText(p) : (p?F(p):'Sem prazo informado'); }catch(e){ return p?F(p):'Sem prazo informado'; } }

  function gravidadeKey(v){
    var n=C(v).trim();
    if(!n) return 'nao-informada';
    if(n.indexOf('gravissima')>=0) return 'gravissima';
    if(n.indexOf('grave')>=0) return 'grave';
    if(n.indexOf('media')>=0) return 'media';
    if(n.indexOf('leve')>=0) return 'leve';
    return 'nao-informada';
  }
  function gravidadeLabel(v){
    var k=gravidadeKey(v);
    return {leve:'Leve',media:'Média',grave:'Grave',gravissima:'Gravíssima','nao-informada':'Não informada'}[k]||'Não informada';
  }
  function gravidadeTag(v){
    var k=gravidadeKey(v);
    return '<span class="tag sev-'+k+'">'+H(gravidadeLabel(v))+'</span>';
  }
  window.gravidadeKeyMulta=gravidadeKey;
  window.gravidadeLabelMulta=gravidadeLabel;
  window.gravidadeTagMulta=gravidadeTag;

  function ensureSchemas(){
    try{
      if(typeof schemas==='undefined') return;
      if(Array.isArray(schemas.multas)){
        schemas.multas=schemas.multas.filter(function(f){ return f && f[0] !== 'gravidade_multa'; });
        var hasGrav=schemas.multas.some(function(f){ return f && f[0]==='gravidade'; });
        if(!hasGrav){
          var idx=schemas.multas.findIndex(function(f){ return f && (f[0]==='infracao' || f[0]==='auto'); });
          schemas.multas.splice(idx>=0?idx+1:schemas.multas.length,0,['gravidade','Gravidade da multa','select:,Leve,Média,Grave,Gravíssima']);
        }
      }
    }catch(e){}
  }
  ensureSchemas();

  try{
    var oldFrom = window.multaFromDb || (typeof multaFromDb==='function'?multaFromDb:null);
    if(typeof oldFrom==='function' && !oldFrom.__gravidadeLuiz){
      var novoFrom=function(row){
        var r=oldFrom(row);
        r.gravidade = row?.gravidade || row?.gravidade_multa || r.gravidade || '';
        return r;
      };
      novoFrom.__gravidadeLuiz=true;
      window.multaFromDb = multaFromDb = novoFrom;
    }
  }catch(e){}

  try{
    var oldTo = window.multaToDb || (typeof multaToDb==='function'?multaToDb:null);
    if(typeof oldTo==='function' && !oldTo.__gravidadeLuiz){
      var novoTo=function(r){
        var p=oldTo(r);
        p.gravidade = r?.gravidade || '';
        return p;
      };
      novoTo.__gravidadeLuiz=true;
      window.multaToDb = multaToDb = novoTo;
    }
  }catch(e){}

  try{
    if(Array.isArray(data?.multas)){
      data.multas.forEach(function(r){
        if(r.gravidade==null) r.gravidade='';
      });
    }
  }catch(e){}

  window.selectedMultaGravidade = window.selectedMultaGravidade || '';

  window.setMultaGravidade=function(v){
    window.selectedMultaGravidade=v||'';
    var sel=document.getElementById('multasGravidade');
    if(sel) sel.value=window.selectedMultaGravidade;
    if(typeof renderMultasList==='function') renderMultasList();
  };

  function veiculosEmManutencao(){
    try{
      return (data.veiculos||[]).filter(function(v){
        var st=C(v.status||v.situacao||v.estado);
        return st.indexOf('manut')>=0 || st.indexOf('oficina')>=0 || st.indexOf('parado')>=0;
      });
    }catch(e){ return []; }
  }
  window.veiculosEmManutencaoPrioridade=veiculosEmManutencao;

  window.abrirVeiculosEmManutencao=function(q){
    try{ if(typeof showPage==='function') showPage('veiculos'); }catch(e){}
    setTimeout(function(){
      var input=document.getElementById('veiSearch');
      if(input){
        input.value=q || 'manutenção';
        input.dispatchEvent(new Event('input',{bubbles:true}));
      }
    },100);
  };

  function maintPriorityBlock(){
    var rows=veiculosEmManutencao();
    if(!rows.length) return '';
    return '<div class="gf-maint-priority-wrap">'+
      '<h3>Prioridade: veículos em manutenção</h3>'+
      '<p>'+rows.length+' veículo(s) parado(s)/em manutenção aparecem primeiro nos alertas.</p>'+
      '<div class="gf-maint-priority-list">'+rows.slice(0,8).map(function(v){
        var motivo=v.motivo||v.descricao_motivo||v.observacao||v.obs||'Sem motivo informado';
        return '<div class="gf-maint-priority-item">'+
          '<div class="gf-maint-priority-icon">🔧</div>'+
          '<div><b><span class="plate">'+H(v.placa||'-')+'</span> '+H(v.modelo||'')+'</b><small>'+H(motivo)+' • Status: '+H(v.status||v.situacao||'manutenção')+'</small></div>'+
          '<button class="btn" onclick="abrirVeiculosEmManutencao(\''+H(v.placa||'manutenção').replace(/'/g,'&#39;')+'\')">Ver veículo</button>'+
        '</div>';
      }).join('')+'</div></div>';
  }

  function buildAlertsPrioridade(){
    var alerts=[];
    try{
      veiculosEmManutencao().forEach(function(r){
        var motivo=r.motivo||r.descricao_motivo||r.observacao||r.obs||'Sem motivo informado';
        alerts.push({grupo:'Prioridade — Veículos em manutenção',c:'red',t:'Veículo '+(r.placa||'-'),d:(r.modelo||'Veículo')+' • '+motivo,page:'veiculos',q:r.placa||'manutenção',ord:0});
      });
      (data.multas||[]).forEach(function(r){
        var st=ST(r.status);
        if(['aguardando_aceite','aguardando_assinatura','pendente'].indexOf(st)>=0){
          var d=D(r.prazo), urgent=Number.isFinite(d)&&d<=5;
          alerts.push({grupo:'Multas',c:urgent?'red':'amber',t:'Multa '+(r.placa||'-'),d:(r.motorista||'Sem motorista')+' • '+(r.prazo?PText(r.prazo):'Sem prazo informado')+' • '+gravidadeLabel(r.gravidade),page:'multas',q:r.placa||r.motorista||r.auto||'',ord:urgent?1:2});
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
      (data.oleo||[]).forEach(function(r){
        var ok=true;
        try{ ok=typeof isOilExpiryConsidered==='function'?isOilExpiryConsidered(r):true; }catch(e){}
        if(!ok) return;
        var st;
        try{ st=typeof oilStatusEmpresa==='function'?oilStatusEmpresa(r):(typeof oilStatus==='function'?oilStatus(r):{tag:'gray',text:'Verificar'}); }catch(e){ st={tag:'gray',text:'Verificar'}; }
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
        if(st.indexOf('pendente')>=0||st.indexOf('andamento')>=0||st.indexOf('aberto')>=0){
          alerts.push({grupo:'Manutenções',c:'blue',t:'Manutenção '+(r.placa||'-'),d:(r.tipo||r.servico||r.descricao||'Serviço pendente')+' • '+F(r.data),page:'manutencoes',q:r.placa||r.tipo||r.servico||'',ord:3});
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
    return alerts.sort(function(a,b){
      var rank=function(x){ return x.c==='red'?1:x.c==='amber'?2:x.c==='blue'?3:4; };
      return (a.ord||9)-(b.ord||9) || rank(a)-rank(b);
    });
  }
  window.makeAlertsPorModulo=buildAlertsPrioridade;

  function iconFor(g){
    var c=C(g);
    if(c.indexOf('manutencao')>=0||c.indexOf('manut')>=0) return '🔧';
    if(c.indexOf('multa')>=0) return '⚠️';
    if(c.indexOf('tac')>=0) return '⏱️';
    if(c.indexOf('oleo')>=0) return '🛢️';
    if(c.indexOf('cnh')>=0||c.indexOf('motor')>=0) return '🪪';
    if(c.indexOf('veic')>=0) return '🚚';
    if(c.indexOf('ponto')>=0) return '📍';
    return '•';
  }
  function pageLabel(p){
    return {multas:'Multas',tacografos:'Tacógrafos',oleo:'Troca de óleo',motoristas:'Motoristas',manutencoes:'Manutenções',veiculos:'Veículos',pontos:'Pontos',producao:'Produção do Dia',dashboard:'Dashboard'}[p]||p||'Módulo';
  }
  function groupedAlertsHtml(alerts){
    window.__fleetDimeAlerts=[];
    var order=['Prioridade — Veículos em manutenção','Multas','CNH / Motoristas','Óleo','Tacógrafo','Manutenções','Pontos'];
    var by={};
    alerts.forEach(function(a){ (by[a.grupo]=by[a.grupo]||[]).push(a); });
    var html='';
    order.forEach(function(g){
      var list=by[g]||[];
      if(!list.length) return;
      var show=list.slice(0,7);
      html += '<section class="alerts-module"><div class="alerts-module-head"><h4>'+H(g)+'</h4><span>'+list.length+'</span></div><div class="alerts-module-list">';
      show.forEach(function(a){
        var idx=window.__fleetDimeAlerts.push(a)-1;
        var cls=['red','amber','blue','green'].indexOf(a.c)>=0?a.c:'green';
        if(a.grupo.indexOf('Prioridade')===0) cls+=' maint-priority-alert';
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
  window.alertasHtmlModulo=function(){
    var arr=buildAlertsPrioridade();
    var red=arr.filter(function(a){return a.c==='red'}).length;
    var amber=arr.filter(function(a){return a.c==='amber'}).length;
    var blue=arr.filter(function(a){return a.c==='blue'}).length;
    var mods={}; arr.forEach(function(a){mods[a.grupo]=1;});
    return '<div class="alerts-mod-shell">'+
      '<div class="alerts-mod-hero"><div><h3>Central da Frota</h3><p>Veículos em manutenção entram primeiro como prioridade. Clique no alerta para abrir o módulo correto.</p></div><div class="alerts-mod-total"><small>Total</small><strong>'+arr.length+'</strong></div></div>'+
      '<div class="alerts-mod-overview">'+
        '<div class="alerts-mod-summary"><small>Críticos</small><strong>'+red+'</strong></div>'+
        '<div class="alerts-mod-summary"><small>Atenção</small><strong>'+amber+'</strong></div>'+
        '<div class="alerts-mod-summary"><small>Acompanhar</small><strong>'+blue+'</strong></div>'+
        '<div class="alerts-mod-summary"><small>Módulos</small><strong>'+Object.keys(mods).length+'</strong></div>'+
      '</div>'+
      '<div class="alerts-mod-groups">'+groupedAlertsHtml(arr)+'</div>'+
    '</div>';
  };

  window.render_multas=function(){
    ensureSchemas();
    try{ setActions('<button class="btn" onclick="exportCSV(\'multas\')">Exportar CSV</button><button class="btn primary" onclick="openForm(\'multas\')">+ Nova multa</button>'); }catch(e){}
    var meses=[...new Set((data.multas||[]).map(function(r){return YM(r.data)}).filter(Boolean))].sort().reverse();
    var statusLabel=(typeof selectedMultaStatus!=='undefined' && selectedMultaStatus)?statusNice(selectedMultaStatus):'Todos';
    var graves=(data.multas||[]).filter(function(r){return ['grave','gravissima'].indexOf(gravidadeKey(r.gravidade))>=0}).length;
    var sem=(data.multas||[]).filter(function(r){return gravidadeKey(r.gravidade)==='nao-informada'}).length;
    var html=stats([
      ['Total',(data.multas||[]).length,'multas'],
      ['Valor',M((data.multas||[]).reduce(function(s,r){return s+(+r.valor||0)},0)),'soma'],
      ['Graves',graves,'grave/gravíssima'],
      ['Sem gravidade',sem,'faltando classificar']
    ])+
    '<div class="filters"><div class="filter-row with-gravidade">'+
      '<input id="multasSearch" placeholder="Buscar placa, motorista, auto, descrição ou gravidade...">'+
      '<select id="multasMonth"><option value="">Todos os meses</option>'+meses.map(function(m){return '<option value="'+H(m)+'">'+H(MN(m))+'</option>'}).join('')+'</select>'+
      '<select id="multasStatusMobile"><option value="">Todos os status</option><option value="aguardando_aceite">Aguardando aceite</option><option value="aguardando_assinatura">Aguardando assinatura</option><option value="aceito">Aceito</option><option value="pago">Pago</option><option value="recorrida">Recorrida / em análise</option><option value="sem_necessidade">Sem necessidade</option><option value="demitido">Motorista demitido</option></select>'+
      '<select id="multasGravidade"><option value="">Todas as gravidades</option><option value="leve">Leve</option><option value="media">Média</option><option value="grave">Grave</option><option value="gravissima">Gravíssima</option><option value="nao-informada">Não informada</option></select>'+
      '<select id="multasSort"><option value="recentes">Adicionadas recentemente</option><option value="antigas">Adicionadas antigas</option></select>'+
    '</div></div><div class="cards" id="multasList"></div>';
    var box=document.getElementById('multas');
    if(box) box.innerHTML=html;
    var st=document.getElementById('multasStatusMobile');
    if(st) st.value=(typeof selectedMultaStatus!=='undefined'?selectedMultaStatus:'')||'';
    var gr=document.getElementById('multasGravidade');
    if(gr) gr.value=window.selectedMultaGravidade||'';
    ['multasSearch','multasMonth','multasSort'].forEach(function(x){var el=document.getElementById(x); if(el) el.oninput=renderMultasList;});
    if(st) st.oninput=function(e){ selectedMultaStatus=e.target.value; try{renderNav();}catch(_){} renderMultasList(); };
    if(gr) gr.oninput=function(e){ window.selectedMultaGravidade=e.target.value||''; renderMultasList(); };
    renderMultasList();
  };
  try{ render_multas=window.render_multas; }catch(e){}

  window.renderMultasList=function(){
    var q=C(document.getElementById('multasSearch')?.value||'');
    var m=document.getElementById('multasMonth')?.value||'';
    var sort=document.getElementById('multasSort')?.value||'recentes';
    var grav=document.getElementById('multasGravidade')?.value||window.selectedMultaGravidade||'';
    window.selectedMultaGravidade=grav;
    var statusSel=(typeof selectedMultaStatus!=='undefined'?selectedMultaStatus:'')||'';
    var rows=(data.multas||[]).filter(function(r){
      var okStatus=!statusSel || ST(r.status)===statusSel;
      var okMes=!m || YM(r.data)===m;
      var okGrav=!grav || gravidadeKey(r.gravidade)===grav;
      var okBusca=!q || C(Object.values(r).join(' ')+' '+gravidadeLabel(r.gravidade)).indexOf(q)>=0;
      return okStatus && okMes && okGrav && okBusca;
    });
    rows=rows.sort(function(a,b){
      var ak=Number(a.id||0), bk=Number(b.id||0);
      return sort==='antigas'?ak-bk:bk-ak;
    });
    var list=document.getElementById('multasList');
    if(!list) return;
    list.innerHTML=rows.length?rows.map(function(r){
      var st=ST(r.status);
      var cardCls=st==='pago'?'multa-ok':st==='aceito'||st==='recorrida'?'multa-info':st==='demitido'?'multa-red':'multa-warn';
      var rca=r.envio_rca||r.envioRCA||r.data_envio_rca||'';
      return '<article class="fine-card multa-card-final '+cardCls+'">'+
        '<div><span class="plate">'+H(r.placa||'-')+'</span><div class="desc-muted">Auto '+H(r.auto||'-')+'</div></div>'+
        '<div><b>'+H(r.motorista||'Sem motorista')+'</b><small>'+F(r.data)+' • '+H(r.hora||'-')+'</small><small class="multa-desc">'+H(r.descricao||r.infracao||'-')+'</small><div class="multa-gravidade-box">'+gravidadeTag(r.gravidade)+'</div></div>'+
        '<div><b>'+H(r.municipio||'-')+'</b><small class="multa-local">'+H(r.local||'-')+'</small><div class="multa-extra">'+(rca?'<span class="rca-date">RCA: '+F(rca)+'</span>':'')+'</div></div>'+
        '<div><b>'+M(r.valor)+'</b><small>Prazo RI: '+F(r.prazo)+'</small><small>'+PText(r.prazo)+'</small><div class="multa-extra">'+STag(st)+'</div></div>'+
        '<div class="multa-actions"><button class="icon-btn" onclick="openForm(\'multas\','+Number(r.id)+')">✎</button><button class="icon-btn" onclick="removeItem(\'multas\','+Number(r.id)+')">×</button></div>'+
      '</article>';
    }).join(''):'<div class="empty">Nenhuma multa encontrada neste filtro.</div>';
  };
  try{ renderMultasList=window.renderMultasList; }catch(e){}

  var oldRenderNav = window.renderNav || (typeof renderNav==='function'?renderNav:null);
  window.renderNav=function(){
    try{
      var nav=document.getElementById('nav');
      if(!nav || typeof pages==='undefined') return oldRenderNav?oldRenderNav():null;
      var countStatus=function(st){return (data.multas||[]).filter(function(r){return ST(r.status)===st}).length};
      if(currentPage==='multas' && multasSidebarCollapsed){
        var shortcuts=[['','Todas'],['aguardando_aceite','Aguardando aceite'],['aguardando_assinatura','Aguardando assinatura'],['aceito','Aceitas'],['pago','Pagas'],['recorrida','Recorridas'],['sem_necessidade','Sem necessidade'],['demitido','Demitidos']];
        var priority=(data.multas||[]).filter(function(r){return ['aguardando_aceite','aguardando_assinatura'].indexOf(ST(r.status))>=0}).sort(function(a,b){var da=D(a.prazo),db=D(b.prazo);return (Number.isFinite(da)?da:999999)-(Number.isFinite(db)?db:999999)||Number(b.id||0)-Number(a.id||0)}).slice(0,5);
        nav.innerHTML='<button class="sidebar-back" onclick="toggleMultasSidebar(false)"><span>← Outros módulos</span></button><div class="shortcut-title">Atalhos</div>'+
          shortcuts.map(function(x){var st=x[0],label=x[1]; return '<button class="shortcut-btn '+(selectedMultaStatus===st?'shortcut-active':'')+'" onclick="selectMultaStatus(\''+st+'\')"><span class="nav-label">'+H(label)+'</span><span class="pill shortcut-pill">'+(st?countStatus(st):(data.multas||[]).length)+'</span></button>';}).join('')+
          '<div class="shortcut-title">Prioridade</div>'+
          (priority.length?priority.map(function(r){return '<button class="priority-card '+(typeof priorityClassMulta==='function'?priorityClassMulta(r):'priority-warn')+'" onclick="openForm(\'multas\','+Number(r.id)+')"><span class="priority-top"><span class="priority-plate">'+H(r.placa||'-')+'</span>'+STag(ST(r.status))+'</span><span class="priority-name">'+H(r.motorista||'Sem motorista')+'</span><span class="priority-meta">'+F(r.data)+' • Auto '+H(r.auto||'-')+'<br>'+PText(r.prazo)+' • '+H(gravidadeLabel(r.gravidade))+'</span></button>';}).join(''):'<div class="collapse-hint">Nenhuma multa pendente em prioridade.</div>');
        return;
      }
      if(typeof oldRenderNav==='function') return oldRenderNav();
    }catch(e){
      if(typeof oldRenderNav==='function') return oldRenderNav();
    }
  };
  try{ renderNav=window.renderNav; }catch(e){}

  var oldRenderDashboard=window.render_dashboard || (typeof render_dashboard==='function'?render_dashboard:null);
  window.render_dashboard=function(){
    try{
      if(typeof setActions==='function') setActions("<button class=\"btn\" onclick=\"exportCSV('multas')\">Exportar multas CSV</button>");
      var totalMan=(data.manutencoes||[]).reduce(function(s,r){return s+(+r.valor||0)},0);
      var totalMultas=(data.multas||[]).reduce(function(s,r){return s+(+r.valor||0)},0);
      var alerts=buildAlertsPrioridade();
      var rankingMotoristas=Object.values((data.multas||[]).reduce(function(acc,r){var k=r.motorista||'Sem motorista';acc[k]=acc[k]||{nome:k,qtd:0,valor:0};acc[k].qtd++;acc[k].valor+=(+r.valor||0);return acc;},{})).sort(function(a,b){return b.qtd-a.qtd}).slice(0,5);
      var rankingMan=Object.values((data.manutencoes||[]).reduce(function(acc,r){var k=r.placa||'Sem placa';acc[k]=acc[k]||{placa:k,qtd:0,valor:0};acc[k].qtd++;acc[k].valor+=(+r.valor||0);return acc;},{})).sort(function(a,b){return b.valor-a.valor}).slice(0,5);
      var dash=document.getElementById('dashboard');
      if(!dash) return;
      dash.innerHTML=stats([['Veículos',(data.veiculos||[]).length,'cadastrados'],['Alertas',alerts.length,'por prioridade'],['Multas',M(totalMultas),'valor total'],['Manutenção',M(totalMan),'valor total']])+
        '<div class="global-search-card"><input id="globalSearch" placeholder="Pesquisa global: placa, motorista, CPF, CNH ou auto..."><div class="global-results" id="globalResults"></div></div>'+
        maintPriorityBlock()+
        window.alertasHtmlModulo()+
        '<div class="dash-grid"><div>'+table('Ranking de multas por motorista',['Motorista','Qtd.','Valor'],rankingMotoristas.map(function(r){return '<tr><td><b>'+H(r.nome)+'</b></td><td>'+r.qtd+'</td><td>'+M(r.valor)+'</td></tr>'}).join(''))+'</div><div>'+table('Veículos com mais custo de manutenção',['Placa','Serviços','Valor'],rankingMan.map(function(r){return '<tr><td><span class="plate">'+H(r.placa)+'</span></td><td>'+r.qtd+'</td><td>'+M(r.valor)+'</td></tr>'}).join(''))+'</div></div>'+
        '<div class="table-card"><div class="table-head"><h3>Histórico completo do veículo</h3><small>Digite uma placa na pesquisa global e clique no resultado do veículo</small></div><div id="vehicleHistory" class="vehicle-history"><div class="empty">Nenhum veículo selecionado.</div></div></div>';
      var gs=document.getElementById('globalSearch');
      if(gs && typeof renderGlobalSearch==='function') gs.oninput=renderGlobalSearch;
      try{ if(typeof window.aplicarDestaqueDescricoesDime==='function') window.aplicarDestaqueDescricoesDime(document); }catch(e){}
      try{ if(typeof window.moveUserPanelBottom==='function') window.moveUserPanelBottom(); }catch(e){}
    }catch(e){
      if(typeof oldRenderDashboard==='function') return oldRenderDashboard();
    }
  };
  try{ render_dashboard=window.render_dashboard; }catch(e){}

  try{
    ensureSchemas();
    if(typeof renderNav==='function') renderNav();
    if((typeof currentPage!=='undefined'?currentPage:'')==='multas') window.render_multas();
    if((typeof currentPage!=='undefined'?currentPage:'')==='dashboard') window.render_dashboard();
  }catch(e){}
  setTimeout(function(){
    try{
      ensureSchemas();
      if(typeof renderNav==='function') renderNav();
      if((typeof currentPage!=='undefined'?currentPage:'')==='multas') window.render_multas();
      if((typeof currentPage!=='undefined'?currentPage:'')==='dashboard') window.render_dashboard();
    }catch(e){}
  },400);
})();

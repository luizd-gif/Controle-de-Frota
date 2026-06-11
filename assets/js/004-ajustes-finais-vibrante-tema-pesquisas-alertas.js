(function(){
  const MIN_OIL_EXPIRY = '2026-03-01';
  function parseDateSafe(d){return /^\d{4}-\d{2}-\d{2}$/.test(String(d||''))?new Date(d+'T00:00:00'):null;}
  function expiryOilDate(r){const base=parseDateSafe(r?.data); if(!base) return null; const exp=new Date(base); exp.setMonth(exp.getMonth()+3); return exp;}
  function ymd(dt){return dt ? dt.toISOString().slice(0,10) : '';}
  function isOilExpiryConsidered(r){const exp=expiryOilDate(r); return !!exp && ymd(exp) >= MIN_OIL_EXPIRY;}
  window.aplicarTemaFrota=function(theme){document.documentElement.setAttribute('data-theme',theme);localStorage.setItem('gf_theme',theme);const b=document.getElementById('themeToggleBtn');if(b)b.textContent=theme==='dark'?'☀️ Modo claro':'🌙 Modo escuro';};
  window.toggleTemaFrota=function(){aplicarTemaFrota((document.documentElement.getAttribute('data-theme')||'light')==='dark'?'light':'dark');};
  aplicarTemaFrota(localStorage.getItem('gf_theme')||'light');
  function installThemeButton(){const side=document.querySelector('.sidebar'); if(!side || document.getElementById('themeToggleBtn')) return; const btn=document.createElement('button');btn.id='themeToggleBtn';btn.className='theme-toggle';btn.onclick=toggleTemaFrota;btn.textContent=(document.documentElement.getAttribute('data-theme')==='dark')?'☀️ Modo claro':'🌙 Modo escuro'; side.appendChild(btn);} 
  const oldRenderNav=window.renderNav||renderNav; window.renderNav=renderNav=function(){oldRenderNav.apply(this,arguments);setTimeout(installThemeButton,0);}; setTimeout(installThemeButton,300);

  const oldOilStatus = window.oilStatusEmpresa || window.oilStatus;
  window.oilStatusEmpresa=function(r){
    const st=oldOilStatus?oldOilStatus(r):{tag:'gray',text:'sem data'};
    return st;
  };

  window.render_tacografos=function(){
    setActions('<button class="btn primary" onclick="openForm(\'tacografos\')">+ Novo tacógrafo</button>');
    const months=monthsBy(data.tacografos,'validade');
    const rows=data.tacografos.filter(r=>!folderSel.tacografos||ym(r.validade)===folderSel.tacografos);
    document.getElementById('tacografos').innerHTML=stats([['Registros',data.tacografos.length,'tacógrafos'],['Ativos',data.tacografos.filter(x=>clean(x.status).includes('ativo')||clean(x.status).includes('ok')).length,'válidos'],['Pastas',months.length,'por validade'],['Selecionado',folderSel.tacografos?monthName(folderSel.tacografos):'Todos','pasta atual']])+folderHtmlEmpresa('tacografos',months)+filterHtml('tacSearch','Buscar placa, emissão, validade, situação ou observação...')+`<div id="tacInfo"></div>`;
    document.getElementById('tacSearch').oninput=renderTacListEmpresa; renderTacListEmpresa();
  };
  window.renderTacListEmpresa=function(){
    const q=clean(document.getElementById('tacSearch')?.value||'');
    const rows=data.tacografos.filter(r=>(!folderSel.tacografos||ym(r.validade)===folderSel.tacografos)&&(!q||clean(Object.values(r).join(' ')).includes(q)));
    document.getElementById('tacInfo').innerHTML=table(folderSel.tacografos?`Tacógrafos — ${monthName(folderSel.tacografos)}`:'Tacógrafos — Todos os meses',['Placa','Emissão','Validade','Situação','Obs','Ações'],rows.map(r=>`<tr><td><span class="plate">${esc(r.placa)}</span></td><td>${fmtDate(r.data)}</td><td>${fmtDate(r.validade)}</td><td>${statusTag(r.status)}</td><td>${esc(r.obs||'-')}</td><td class="row-actions"><button class="icon-btn" onclick="openForm('tacografos',${r.id})">✎</button><button class="icon-btn" onclick="removeItem('tacografos',${r.id})">×</button></td></tr>`).join(''));
  };

  window.render_oleo=function(){
    setActions('<button class="btn primary" onclick="openForm(\'oleo\')">+ Nova troca</button>');
    const months=monthsBy(data.oleo,'data');
    const all=data.oleo.map(r=>({...r,st:oilStatusEmpresa(r)}));
    document.getElementById('oleo').innerHTML=stats([['Registros',data.oleo.length,'trocas'],['Verde',all.filter(x=>x.st.tag==='green').length,'em dia'],['Amarelo',all.filter(x=>x.st.tag==='amber').length,'atenção'],['Vermelho',all.filter(x=>x.st.tag==='red').length,'urgente/vencido']])+folderHtmlEmpresa('oleo',months)+filterHtml('oleoSearch','Buscar placa, modelo, KM ou observação...')+`<div id="oleoInfo"></div>`;
    document.getElementById('oleoSearch').oninput=renderOleoListEmpresa; renderOleoListEmpresa();
  };
  window.renderOleoListEmpresa=function(){
    const q=clean(document.getElementById('oleoSearch')?.value||'');
    const rows=data.oleo.filter(r=>(!folderSel.oleo||ym(r.data)===folderSel.oleo)&&(!q||clean(Object.values(r).join(' ')).includes(q))).map(r=>({...r,st:oilStatusEmpresa(r)}));
    document.getElementById('oleoInfo').innerHTML=table(folderSel.oleo?`Troca de óleo — ${monthName(folderSel.oleo)}`:'Troca de óleo — Todos os meses',['Placa','Modelo','Última troca','KM atual','Próxima KM','Faltando','Ações'],rows.map(r=>`<tr><td><span class="plate">${esc(r.placa)}</span></td><td>${esc(r.modelo||r.obs||'-')}</td><td>${fmtDate(r.data)}</td><td>${r.km||'-'}</td><td>${r.proxKm||'-'}</td><td><span class="tag ${r.st.tag}">${esc(r.st.text)}</span></td><td class="row-actions"><button class="icon-btn" onclick="openForm('oleo',${r.id})">✎</button><button class="icon-btn" onclick="removeItem('oleo',${r.id})">×</button></td></tr>`).join(''));
  };

  function alertaMultas(){return (data.multas||[]).filter(r=>['aguardando_aceite','aguardando_assinatura'].includes(statusMulta(r.status))).map(r=>{const d=daysUntil(r.prazo);return {grupo:'Multas',c:Number.isFinite(d)&&d<=5?'red':'amber',t:`Multa ${r.placa||'-'}`,d:`${r.motorista||'Sem motorista'} • ${r.prazo?prazoAceiteText(r.prazo):'Sem prazo'}`};}).slice(0,5);}
  function alertaTacografos(){return (data.tacografos||[]).filter(r=>r.validade).map(r=>({r,d:daysUntil(r.validade)})).filter(x=>Number.isFinite(x.d)&&x.d<=60).map(x=>({grupo:'Tacógrafo',c:x.d<=30?'red':'amber',t:`Tacógrafo ${x.r.placa||'-'}`,d:x.d<0?`Vencido há ${Math.abs(x.d)} dias`:`Vence em ${x.d} dias`})).slice(0,5);}
  function alertaOleo(){return (data.oleo||[]).filter(isOilExpiryConsidered).map(r=>({r,st:oilStatusEmpresa(r)})).filter(x=>['red','amber'].includes(x.st.tag)).map(x=>({grupo:'Óleo',c:x.st.tag,t:`Óleo ${x.r.placa||'-'}`,d:x.st.text})).slice(0,5);}
  function alertaCnh(){return (data.motoristas||[]).filter(r=>r.validade).map(r=>({r,d:daysUntil(r.validade)})).filter(x=>Number.isFinite(x.d)&&x.d<=60).map(x=>({grupo:'CNH',c:x.d<=30?'red':'amber',t:`CNH ${x.r.nome||'-'}`,d:x.d<0?`Vencida há ${Math.abs(x.d)} dias`:`Vence em ${x.d} dias`})).slice(0,4);}
  function alertaManut(){return (data.manutencoes||[]).filter(r=>clean(r.status).includes('pendente')).slice(0,4).map(r=>({grupo:'Manutenção',c:'blue',t:`Manutenção ${r.placa||'-'}`,d:`${r.tipo||'Pendente'} • ${fmtDate(r.data)}`}));}
  window.makeAlertsSortido=function(){
    const groups=[alertaMultas(),alertaTacografos(),alertaOleo(),alertaCnh(),alertaManut()];
    const mixed=[]; let i=0; while(mixed.length<16 && groups.some(g=>g.length>i)){for(const g of groups){if(g[i]) mixed.push(g[i]); if(mixed.length>=16) break;} i++;}
    return mixed;
  };
  function alertasHtml(){
    const arr=makeAlertsSortido();
    const content=arr.length?arr.map(a=>`<div class="alert-card ${a.c}"><span class="tag ${a.c==='red'?'red':a.c==='amber'?'amber':a.c==='blue'?'blue':'gray'}">${esc(a.grupo)}</span><b>${esc(a.t)}</b><small>${esc(a.d)}</small></div>`).join(''):'<div class="empty">Nenhum alerta crítico no momento.</div>';
    return `<div class="table-card"><div class="table-head"><h3>Central de alertas</h3><small>Multas, tacógrafos, óleo, CNH e manutenção misturados por prioridade</small></div><div class="alert-mixed-grid">${content}</div></div>`;
  }
  window.render_dashboard=function(){
    setActions('<button class="btn" onclick="exportCSV(\'multas\')">Exportar multas CSV</button>');
    const totalMan=data.manutencoes.reduce((s,r)=>s+(+r.valor||0),0), totalMultas=data.multas.reduce((s,r)=>s+(+r.valor||0),0);
    const alerts=makeAlertsSortido();
    const rankingMotoristas=Object.values((data.multas||[]).reduce((m,r)=>{const k=r.motorista||'Sem motorista';m[k]=m[k]||{nome:k,qtd:0,valor:0};m[k].qtd++;m[k].valor+=(+r.valor||0);return m},{})).sort((a,b)=>b.qtd-a.qtd).slice(0,5);
    const rankingMan=Object.values((data.manutencoes||[]).reduce((m,r)=>{const k=r.placa||'Sem placa';m[k]=m[k]||{placa:k,qtd:0,valor:0};m[k].qtd++;m[k].valor+=(+r.valor||0);return m},{})).sort((a,b)=>b.valor-a.valor).slice(0,5);
    document.getElementById('dashboard').innerHTML=stats([['Veículos',data.veiculos.length,'cadastrados'],['Alertas',alerts.length,'atenção agora'],['Multas',BRL(totalMultas),'valor total'],['Manutenção',BRL(totalMan),'valor total']])+`<div class="global-search-card"><input id="globalSearch" placeholder="Pesquisa global: placa, motorista, CPF, CNH ou auto..."><div class="global-results" id="globalResults"></div></div>`+alertasHtml()+`<div class="dash-grid"><div>${table('Ranking de multas por motorista',['Motorista','Qtd.','Valor'],rankingMotoristas.map(r=>`<tr><td><b>${esc(r.nome)}</b></td><td>${r.qtd}</td><td>${BRL(r.valor)}</td></tr>`).join(''))}</div><div>${table('Veículos com mais custo de manutenção',['Placa','Serviços','Valor'],rankingMan.map(r=>`<tr><td><span class="plate">${esc(r.placa)}</span></td><td>${r.qtd}</td><td>${BRL(r.valor)}</td></tr>`).join(''))}</div></div><div class="table-card"><div class="table-head"><h3>Histórico completo do veículo</h3><small>Digite uma placa na pesquisa global e clique no resultado do veículo</small></div><div id="vehicleHistory" class="vehicle-history"><div class="empty">Nenhum veículo selecionado.</div></div></div>`;
    document.getElementById('globalSearch').oninput=renderGlobalSearch;
  };
  // reforço para edição: as telas já possuem botões; garantimos schema completo
  if(window.schemas){
    if(schemas.manutencoes && !schemas.manutencoes.some(x=>x[0]==='descricao')) schemas.manutencoes.push(['descricao','Descrição','text']);
    if(schemas.producao && !schemas.producao.some(x=>x[0]==='obs')) schemas.producao.push(['obs','Observação','text']);
  }
})();

(function(){
  'use strict';
  const TABLES = {
    motoristas:['motoristas'],
    veiculos:['veiculos'],
    tacografos:['tacografos','tacografo'],
    oleo:['oleo','troca_oleo','troca_de_oleo'],
    manutencoes:['manutencoes','manutencao'],
    producao:['producao','producao_dia'],
    pontos:['pontos'],
    producaoMeses:['producao_meses','pastas_producao'],
    manutencoesMeses:['manutencoes_meses','pastas_manutencoes']
  };
  const SYNC_KEYS=['motoristas','veiculos','tacografos','oleo','manutencoes','producao','pontos'];
  const cache={};
  const oldSaveModal = window.saveModal || saveModal;
  const oldRemoveItem = window.removeItem || removeItem;

  function db(){ try{return typeof connectSupabase==='function'?connectSupabase():null;}catch(e){return null;} }
  function say(m){ try{ if(typeof toast==='function') toast(m); }catch(e){} }
  function num(v){ const n=Number(v||0); return Number.isFinite(n)?n:0; }
  function date(v){ v=String(v||''); return /^\d{4}-\d{2}-\d{2}$/.test(v)?v:null; }
  function norm(s){ return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }
  function upper(s){ return String(s||'').toUpperCase(); }
  function arr(key){ if(!data[key]) data[key]=[]; return data[key]; }

  async function tableFor(key){
    if(cache[key]) return cache[key];
    const c=db(); if(!c) return null;
    for(const t of (TABLES[key]||[key])){
      try{ const {error}=await c.from(t).select('id').limit(1); if(!error){ cache[key]=t; return t; } }catch(e){}
    }
    return null;
  }
  function rowToApp(key,r){
    const o={...(r||{})}; delete o.created_at; delete o.updated_at;
    if(o.id!==undefined) o.id=Number(o.id);
    if(key==='oleo'){ o.proxKm=num(o.proxKm??o.proxkm??o.prox_km); o.km=num(o.km); delete o.proxkm; delete o.prox_km; }
    if(key==='motoristas'){ o.cnhArquivo=o.cnhArquivo||o.cnharquivo||''; o.pontos=num(o.pontos); delete o.cnharquivo; }
    if(key==='manutencoes') o.valor=num(o.valor);
    if(key==='pontos') o.pontos=num(o.pontos);
    return o;
  }
  function payload(key,o){
    o=o||{};
    const p={id:Number(o.id || (typeof id==='function'?id():Date.now()))};
    if(key==='motoristas') Object.assign(p,{nome:o.nome||'',funcao:o.funcao||'',departamento:o.departamento||'',cpf:o.cpf||'',cnh:o.cnh||'',categoria:o.categoria||'',validade:date(o.validade),status:o.status||'ativo',cnharquivo:o.cnhArquivo||o.cnharquivo||'',pontos:num(o.pontos)});
    if(key==='veiculos') Object.assign(p,{placa:upper(o.placa),modelo:o.modelo||'',ano:o.ano===''?null:num(o.ano),status:o.status||'ativo'});
    if(key==='tacografos') Object.assign(p,{placa:upper(o.placa),data:date(o.data),validade:date(o.validade),status:o.status||'',obs:o.obs||''});
    if(key==='oleo') Object.assign(p,{placa:upper(o.placa),data:date(o.data),km:num(o.km),proxkm:num(o.proxKm??o.proxkm),obs:o.obs||''});
    if(key==='manutencoes') Object.assign(p,{data:date(o.data),placa:upper(o.placa),tipo:o.tipo||'',origem:o.origem||'',descricao:o.descricao||'',valor:num(o.valor),status:o.status||'',anexo:o.anexo||'',obs:o.obs||''});
    if(key==='producao') Object.assign(p,{mes:o.mes||(typeof ym==='function'?ym(o.data):''),data:date(o.data),placa:upper(o.placa),servico:o.servico||'',responsavel:o.responsavel||'',obs:o.obs||'',anexo:o.anexo||''});
    if(key==='pontos') Object.assign(p,{motorista:o.motorista||'',data:date(o.data),placa:upper(o.placa),auto:o.auto||'',gravidade:o.gravidade||'',pontos:num(o.pontos),aceitou:o.aceitou||'Pendente',multa_id:o.multaId||o.multa_id||o.origem_multa_id||null});
    Object.keys(p).forEach(k=>{ if(p[k]===undefined) delete p[k]; });
    return p;
  }
  function variants(key,o){
    const p=payload(key,o), v=[p];
    if(key==='oleo'){
      const a={...p,proxKm:p.proxkm}; delete a.proxkm; v.push(a);
      const b={...p,prox_km:p.proxkm}; delete b.proxkm; v.push(b);
    }
    if(key==='motoristas') { const a={...p,cnhArquivo:p.cnharquivo}; delete a.cnharquivo; v.push(a); }
    if(key==='manutencoes') { const a={...p}; delete a.anexo; delete a.obs; v.push(a); }
    if(key==='producao') { const a={...p}; delete a.anexo; v.push(a); }
    return v;
  }
  async function saveRemote(key,obj){
    if(key==='multas') return true;
    const c=db(), t=await tableFor(key); if(!c||!t) return false;
    let last=null;
    for(const p of variants(key,obj)){
      try{
        const {data:row,error}=await c.from(t).upsert(p,{onConflict:'id'}).select().single();
        if(error) throw error;
        if(row) Object.assign(obj,rowToApp(key,row));
        return true;
      }catch(e){ last=e; }
    }
    throw last;
  }
  async function delRemote(key,itemId){
    if(key==='multas') return true;
    const c=db(), t=await tableFor(key); if(!c||!t) return false;
    const {error}=await c.from(t).delete().eq('id',Number(itemId));
    if(error) throw error;
    return true;
  }
  async function loadRemote(key){
    const c=db(), t=await tableFor(key); if(!c||!t) return false;
    try{
      const order=key==='producao'?'data':'id';
      const {data:rows,error}=await c.from(t).select('*').order(order,{ascending:key!=='producao'});
      if(error) throw error;
      if(Array.isArray(rows) && rows.length){
        const local=arr(key).slice();
        for(const item of rows.map(r=>rowToApp(key,r))){
          const i=local.findIndex(x=>String(x.id)===String(item.id));
          if(i>=0) local[i]={...local[i],...item}; else local.push(item);
        }
        data[key]=local;
      }
      return true;
    }catch(e){ console.warn('Falha ao carregar '+key,e); return false; }
  }
  async function saveMonth(key,mes){
    if(!mes) return;
    const tableKey=key==='producao'?'producaoMeses':'manutencoesMeses';
    const c=db(), t=await tableFor(tableKey); if(!c||!t) return;
    try{ await c.from(t).upsert({mes},{onConflict:'mes'}); }catch(e){ console.warn('Falha ao salvar pasta',e); }
  }
  async function loadMonths(key){
    const tableKey=key==='producao'?'producaoMeses':'manutencoesMeses';
    const target=key==='producao'?'producaoMeses':'manutencoesMeses';
    const c=db(), t=await tableFor(tableKey); if(!c||!t) return;
    try{ const {data:rows,error}=await c.from(t).select('*').order('mes',{ascending:true}); if(error) throw error; if(Array.isArray(rows)&&rows.length) data[target]=rows.map(r=>({mes:r.mes})); }catch(e){}
  }

  window.saveModal=async function(){
    const ctx = modalCtx ? {...modalCtx} : null;
    const before = ctx && data[ctx.key] ? new Set(data[ctx.key].map(x=>String(x.id))) : new Set();
    await oldSaveModal.apply(this,arguments);
    if(!ctx || ctx.key==='multas' || !SYNC_KEYS.includes(ctx.key)) return;
    const list=arr(ctx.key);
    const obj=ctx.itemId ? list.find(x=>String(x.id)===String(ctx.itemId)) : (list.find(x=>!before.has(String(x.id))) || list[list.length-1]);
    if(!obj) return;
    try{
      await saveRemote(ctx.key,obj);
      if(ctx.key==='producao' && obj.mes) await saveMonth('producao',obj.mes);
      if(ctx.key==='manutencoes' && typeof ym==='function' && ym(obj.data)) await saveMonth('manutencoes',ym(obj.data));
      say('Salvo no Supabase.');
    }catch(e){ console.error(e); alert('Salvou na tela, mas não salvou no Supabase. Detalhe: '+(e.message||e)); }
  };
  try{ saveModal=window.saveModal; }catch(e){}

  window.removeItem=async function(key,itemId){
    if(key==='multas') return oldRemoveItem.apply(this,arguments);
    if(!confirm('Excluir este registro?')) return;
    try{ await delRemote(key,itemId); }catch(e){ alert('Não consegui excluir no Supabase. Detalhe: '+(e.message||e)); return; }
    if(data[key]) data[key]=data[key].filter(x=>String(x.id)!==String(itemId));
    say('Excluído do Supabase.');
    if(typeof showPage==='function') showPage(currentPage);
  };
  try{ removeItem=window.removeItem; }catch(e){}

  window.syncTodasAbasSupabase=async function(){
    for(const key of SYNC_KEYS) await loadRemote(key);
    await loadMonths('producao'); await loadMonths('manutencoes');
    if(typeof renderNav==='function') renderNav();
    if(typeof showPage==='function') showPage(currentPage||'dashboard');
  };
  setTimeout(window.syncTodasAbasSupabase,1000);
  window.addEventListener('focus',()=>{ if(!document.hidden && SYNC_KEYS.includes(currentPage||'')) loadRemote(currentPage).then(()=>showPage(currentPage)); });

  /* Veículos separados por status, sem mexer no resto do sistema */
  window.selectedVehicleStatus=window.selectedVehicleStatus||'todos';
  function st(s){ const v=norm(s); if(v.includes('manut')) return 'manutencao'; if(v.includes('inat')) return 'inativo'; return 'ativo'; }
  function stTag(s){ const x=st(s); if(x==='manutencao') return '<span class="tag amber">Em manutenção</span>'; if(x==='inativo') return '<span class="tag gray">Inativo</span>'; return '<span class="tag green">Ativo</span>'; }
  function vTable(title,rows,empty){return `<div class="table-card"><div class="table-head"><h3>${title}</h3><small>${rows.length} veículo(s)</small></div>${rows.length?`<div class="table-scroll"><table><thead><tr><th>Placa</th><th>Modelo</th><th>Linha</th><th>Ano</th><th>Motorista</th><th>Status</th><th>Ações</th></tr></thead><tbody>${rows.map(v=>`<tr><td><span class="plate">${esc(v.placa)}</span></td><td>${esc(v.modelo||'-')}</td><td>${esc(v.linha||'-')}</td><td>${esc(v.ano||'-')}</td><td>${esc(v.motorista||'-')}</td><td>${stTag(v.status)}</td><td><div class="row-actions"><button class="icon-btn" onclick="openForm('veiculos',${v.id})">✎</button><button class="icon-btn" onclick="removeItem('veiculos',${v.id})">×</button></div></td></tr>`).join('')}</tbody></table></div>`:`<div class="empty">${empty}</div>`}</div>`;}
  window.setVehicleStatusFilter=function(s){ window.selectedVehicleStatus=s||'todos'; renderVeiculosList(); };
  window.renderVeiculosList=function(){
    const input=document.getElementById('veiSearch'); const q=typeof clean==='function'?clean(input?input.value:''):norm(input?input.value:'');
    const selected=window.selectedVehicleStatus||'todos'; const sel=document.getElementById('veiStatusSelect'); if(sel) sel.value=selected;
    let rows=(data.veiculos||[]).filter(r=>!q||(typeof clean==='function'?clean(Object.values(r).join(' ')):norm(Object.values(r).join(' '))).includes(q));
    if(selected!=='todos') rows=rows.filter(r=>st(r.status)===selected);
    const ativos=rows.filter(r=>st(r.status)==='ativo'), manut=rows.filter(r=>st(r.status)==='manutencao'), inativos=rows.filter(r=>st(r.status)==='inativo');
    const html=selected==='todos'?`<div class="vehicle-split-grid">${vTable('Veículos ativos',ativos,'Nenhum veículo ativo encontrado.')}${vTable('Veículos em manutenção',manut,'Nenhum veículo em manutenção encontrado.')}${inativos.length?vTable('Veículos inativos',inativos,''):''}</div>`:selected==='ativo'?vTable('Veículos ativos',ativos,'Nenhum veículo ativo encontrado.'):selected==='manutencao'?vTable('Veículos em manutenção',manut,'Nenhum veículo em manutenção encontrado.'):vTable('Veículos inativos',inativos,'Nenhum veículo inativo encontrado.');
    const target=document.getElementById('veiculosTable'); if(target) target.innerHTML=html;
  };
  window.renderVeiculos=function(){
    const rows=data.veiculos||[], ativos=rows.filter(r=>st(r.status)==='ativo').length, manut=rows.filter(r=>st(r.status)==='manutencao').length, inativos=rows.filter(r=>st(r.status)==='inativo').length;
    document.getElementById('veiculos').innerHTML=`<div class="stats"><div class="stat"><span>Ativos</span><strong>${ativos}</strong><em>em operação</em></div><div class="stat"><span>Em manutenção</span><strong>${manut}</strong><em>parados/oficina</em></div><div class="stat"><span>Inativos</span><strong>${inativos}</strong><em>fora de uso</em></div><div class="stat"><span>Total</span><strong>${rows.length}</strong><em>cadastrados</em></div></div><div class="filters"><div class="filter-row two"><input id="veiSearch" placeholder="Buscar por placa, modelo, linha ou motorista"><select id="veiStatusSelect"><option value="todos">Todos</option><option value="ativo">Ativos</option><option value="manutencao">Em manutenção</option><option value="inativo">Inativos</option></select></div></div><div id="veiculosTable"></div>`;
    document.getElementById('veiSearch').oninput=renderVeiculosList; document.getElementById('veiStatusSelect').onchange=e=>setVehicleStatusFilter(e.target.value); renderVeiculosList();
  };
})();

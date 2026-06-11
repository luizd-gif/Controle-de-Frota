(function(){
  'use strict';
  function db(){ try{return typeof connectSupabase==='function'?connectSupabase():null;}catch(e){return null;} }
  function upper(v){ return String(v??'').trim().toUpperCase(); }
  function str(v){ return String(v??'').trim(); }
  function dt(v){ v=str(v); return /^\d{4}-\d{2}-\d{2}$/.test(v)?v:''; }
  function makeId(){ try{return typeof id==='function'?id():Date.now()+Math.floor(Math.random()*999);}catch(e){return Date.now()+Math.floor(Math.random()*999);} }
  function month(v){ try{return typeof ym==='function'?ym(v):(/^\d{4}-\d{2}-\d{2}$/.test(String(v||''))?String(v).slice(0,7):'');}catch(e){return '';} }
  function fmt(v){ try{return typeof fmtDate==='function'?fmtDate(v):(v||'-');}catch(e){return v||'-';} }
  function escapeHtml(v){ try{return typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]});}catch(e){return String(v??'');} }
  function cleanText(v){ try{return typeof clean==='function'?clean(v):String(v||'').toLowerCase();}catch(e){return String(v||'').toLowerCase();} }
  function statusHtml(v){ try{return typeof statusTag==='function'?statusTag(v):'<span class="tag gray">'+escapeHtml(v||'-')+'</span>';}catch(e){return '<span class="tag gray">'+escapeHtml(v||'-')+'</span>'; } }
  function tableHtml(title,heads,body){ try{return typeof table==='function'?table(title,heads,body):('<div class="table-card"><div class="table-head"><h3>'+title+'</h3><small>Controle</small></div><div class="table-scroll"><table><thead><tr>'+heads.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+(body||'<tr><td colspan="99">Nenhum registro.</td></tr>')+'</tbody></table></div></div>');}catch(e){return '';}}
  function statsHtml(items){ try{return typeof stats==='function'?stats(items):'';}catch(e){return '';} }
  function folderHtml(key,months){ try{return typeof folderHtmlEmpresa==='function'?folderHtmlEmpresa(key,months):'';}catch(e){return '';}}
  function filterBox(){ try{return typeof filterHtml==='function'?filterHtml('tacSearch','Buscar placa, emissão, validade, situação ou observação...'):'<div class="filters"><div class="filter-row two"><input id="tacSearch" placeholder="Buscar placa, emissão, validade, situação ou observação..."></div></div>';}catch(e){return '<div class="filters"><input id="tacSearch" placeholder="Buscar placa..."></div>';}}
  function ensure(){ if(!window.data && typeof data!=='undefined') window.data=data; if(!data.tacografos) data.tacografos=[]; return data.tacografos; }
  function normalize(row){ row=row||{}; return {
    id:Number(row.id||makeId()),
    placa:upper(row.placa||row.veiculo||row.carro||''),
    data:dt(row.data||row.emissao||row.data_emissao||row.data_afericao||row.aferido_em||row.created_at||''),
    validade:dt(row.validade||row.vencimento||row.data_validade||row.validade_tacografo||''),
    status:str(row.status||row.situacao||row.resultado||'ativo'),
    obs:str(row.obs||row.observacao||row.observacoes||'')
  }; }
  function selectedMonth(){ return (typeof folderSel!=='undefined' && folderSel && folderSel.tacografos) ? folderSel.tacografos : (typeof selectedTacMonth!=='undefined' ? selectedTacMonth : ''); }
  function setSelectedMonth(m){ if(typeof folderSel!=='undefined' && folderSel) folderSel.tacografos=m||''; try{ selectedTacMonth=m||''; }catch(e){} }
  function months(){ const set=new Set(); ensure().forEach(r=>{ const m=month(r.validade||r.data); if(m) set.add(m); }); return Array.from(set).sort(); }
  function upsertLocal(obj){ const list=ensure(); obj=normalize(obj); const i=list.findIndex(x=>String(x.id)===String(obj.id)); if(i>=0) list[i]={...list[i],...obj}; else list.push(obj); return obj; }
  function removeLocal(itemId){ data.tacografos=ensure().filter(x=>String(x.id)!==String(itemId)); }
  async function tableName(){ const c=db(); if(!c) return null; for(const t of ['tacografos','tacografo']){ try{ const r=await c.from(t).select('*').limit(1); if(!r.error) return t; }catch(e){} } return null; }
  function missingCol(err){ const txt=String(err?.message||err?.details||err||''); const m=txt.match(/Could not find the '([^']+)' column|column "([^"]+)" does not exist/i); return m?(m[1]||m[2]):''; }
  async function saveSupabase(obj){
    const c=db(), t=await tableName(); if(!c||!t) return null;
    obj=normalize(obj);
    const base={id:Number(obj.id),placa:obj.placa,data:obj.data||null,validade:obj.validade||null,status:obj.status||'ativo',obs:obj.obs||''};
    const tries=[base,{...base,observacao:base.obs},{id:base.id,placa:base.placa,data:base.data,validade:base.validade,status:base.status},{id:base.id,placa:base.placa,validade:base.validade,status:base.status},{id:base.id,placa:base.placa,data:base.data,validade:base.validade}];
    let last=null;
    for(const original of tries){
      let p={...original};
      for(let i=0;i<10;i++){
        try{
          const r=await c.from(t).upsert(p,{onConflict:'id'}).select().single();
          if(!r.error) return normalize(r.data||p);
          throw r.error;
        }catch(e){ last=e; const col=missingCol(e); if(col && Object.prototype.hasOwnProperty.call(p,col)){ delete p[col]; continue; } break; }
      }
    }
    throw last||new Error('Não foi possível salvar tacógrafo.');
  }
  async function loadSupabase(){
    const c=db(), t=await tableName(); if(!c||!t) return false;
    try{
      const r=await c.from(t).select('*'); if(r.error) throw r.error;
      (r.data||[]).map(normalize).filter(x=>x.placa||x.data||x.validade).forEach(upsertLocal);
      data.tacografos=ensure().sort((a,b)=>String(a.validade||a.data||'').localeCompare(String(b.validade||b.data||''))||String(a.placa||'').localeCompare(String(b.placa||'')));
      return true;
    }catch(e){ console.warn('Falha ao carregar tacógrafos do Supabase:',e); return false; }
  }
  async function deleteSupabase(itemId){ const c=db(), t=await tableName(); if(!c||!t) return false; const r=await c.from(t).delete().eq('id',Number(itemId)); if(r.error) throw r.error; return true; }

  window.renderTacListEmpresa=window.renderTacListFinal=function(){
    const target=document.getElementById('tacInfo'); if(!target) return;
    const q=cleanText(document.getElementById('tacSearch')?.value||''); const sel=selectedMonth();
    const rows=ensure().filter(r=>(!sel||month(r.validade||r.data)===sel)&&(!q||cleanText(Object.values(r).join(' ')).includes(q)));
    target.innerHTML=tableHtml(sel?`Tacógrafos — ${typeof monthName==='function'?monthName(sel):sel}`:'Tacógrafos — Todos os meses',['Placa','Emissão','Validade','Situação','Obs','Ações'], rows.map(r=>`<tr><td><span class="plate">${escapeHtml(r.placa)}</span></td><td>${fmt(r.data)}</td><td>${fmt(r.validade)}</td><td>${statusHtml(r.status)}</td><td>${escapeHtml(r.obs||'-')}</td><td class="row-actions"><button class="icon-btn" onclick="openForm('tacografos',${r.id})">✎</button><button class="icon-btn" onclick="removeItem('tacografos',${r.id})">×</button></td></tr>`).join(''));
  };
  window.render_tacografos=function(){
    if(typeof setActions==='function') setActions('<button class="btn primary" onclick="openForm(\'tacografos\')">+ Novo tacógrafo</button>');
    const ms=months(); const sel=selectedMonth();
    const el=document.getElementById('tacografos'); if(!el) return;
    el.innerHTML=statsHtml([['Registros',ensure().length,'tacógrafos'],['Ativos',ensure().filter(x=>cleanText(x.status).includes('ativo')||cleanText(x.status).includes('ok')).length,'válidos'],['Pastas',ms.length,'por validade'],['Selecionado',sel?(typeof monthName==='function'?monthName(sel):sel):'Todos','pasta atual']])+folderHtml('tacografos',ms)+filterBox()+`<div id="tacInfo"></div>`;
    const inp=document.getElementById('tacSearch'); if(inp) inp.oninput=window.renderTacListEmpresa; window.renderTacListEmpresa();
  };
  try{ render_tacografos=window.render_tacografos; }catch(e){}

  const oldOpen=window.openForm || (typeof openForm==='function'?openForm:null);
  window.openForm=function(key,itemId=null){
    if(key!=='tacografos') return oldOpen?oldOpen.apply(this,arguments):undefined;
    const item=itemId?ensure().find(x=>String(x.id)===String(itemId)):null;
    const r=normalize(item||{id:makeId(),status:'ativo'});
    modalCtx={key:'tacografos',itemId:itemId||null,tempId:r.id};
    document.getElementById('modalTitle').textContent=(itemId?'Editar ':'Adicionar ')+'tacógrafo';
    document.getElementById('modalBody').innerHTML=`<div class="form-grid">
      <div class="field"><label>Placa</label><input id="f_placa" type="text" value="${escapeHtml(r.placa)}"></div>
      <div class="field"><label>Data da emissão/aferição</label><input id="f_data" type="date" value="${escapeHtml(r.data)}"></div>
      <div class="field"><label>Validade</label><input id="f_validade" type="date" value="${escapeHtml(r.validade)}"></div>
      <div class="field"><label>Status</label><select id="f_status"><option value="ativo" ${r.status==='ativo'?'selected':''}>Ativo</option><option value="ok" ${r.status==='ok'?'selected':''}>OK</option><option value="pendente" ${r.status==='pendente'?'selected':''}>Pendente</option><option value="vencido" ${r.status==='vencido'?'selected':''}>Vencido</option><option value="inativo" ${r.status==='inativo'?'selected':''}>Inativo</option></select></div>
      <div class="field full"><label>Observação</label><input id="f_obs" type="text" value="${escapeHtml(r.obs)}"></div>
    </div>`;
    document.getElementById('modalBg').classList.add('open');
  };
  try{ openForm=window.openForm; }catch(e){}

  const oldSave=window.saveModal || (typeof saveModal==='function'?saveModal:null);
  window.saveModal=async function(){
    const ctx=(typeof modalCtx!=='undefined' && modalCtx)?{...modalCtx}:null;
    if(!ctx || ctx.key!=='tacografos') return oldSave?oldSave.apply(this,arguments):undefined;
    const obj={
      id:Number(ctx.itemId || ctx.tempId || makeId()),
      placa:upper(document.getElementById('f_placa')?.value||''),
      data:dt(document.getElementById('f_data')?.value||''),
      validade:dt(document.getElementById('f_validade')?.value||''),
      status:str(document.getElementById('f_status')?.value||'ativo'),
      obs:str(document.getElementById('f_obs')?.value||'')
    };
    if(!obj.placa){ alert('Informe a placa.'); return; }
    upsertLocal(obj);
    const m=month(obj.validade||obj.data); setSelectedMonth(m||'');
    if(typeof closeModal==='function') closeModal();
    window.render_tacografos();
    try{
      const saved=await saveSupabase(obj); if(saved){ upsertLocal(saved); const sm=month(saved.validade||saved.data)||m; setSelectedMonth(sm||''); }
      await loadSupabase();
      window.render_tacografos();
      if(typeof toast==='function') toast('Tacógrafo salvo e exibido na tela.');
    }catch(e){ console.error(e); window.render_tacografos(); alert('Apareceu na tela, mas não salvou no Supabase. Detalhe: '+(e.message||e)); }
  };
  try{ saveModal=window.saveModal; }catch(e){}

  const oldRemove=window.removeItem || (typeof removeItem==='function'?removeItem:null);
  window.removeItem=async function(key,itemId){
    if(key!=='tacografos') return oldRemove?oldRemove.apply(this,arguments):undefined;
    if(!confirm('Excluir este tacógrafo?')) return;
    removeLocal(itemId); window.render_tacografos();
    try{ await deleteSupabase(itemId); if(typeof toast==='function') toast('Tacógrafo excluído.'); }
    catch(e){ console.error(e); alert('Excluiu da tela, mas não excluiu no Supabase. Detalhe: '+(e.message||e)); }
  };
  try{ removeItem=window.removeItem; }catch(e){}

  window.carregarTacografosSupabase=async function(){ const ok=await loadSupabase(); if((currentPage||'')==='tacografos') window.render_tacografos(); return ok; };
  setTimeout(function(){ loadSupabase().then(function(){ if((currentPage||'')==='tacografos') window.render_tacografos(); }); },800);
})();

(function(){
  'use strict';
  const MODS=['tacografos','oleo','manutencoes','producao'];
  const TABLES={
    tacografos:['tacografos','tacografo'],
    oleo:['oleo','troca_oleo','trocas_oleo','troca_de_oleo'],
    manutencoes:['manutencoes','manutencao'],
    producao:['producao','producao_dia','producao_do_dia'],
    producaoMeses:['producao_meses','pastas_producao'],
    manutencoesMeses:['manutencoes_meses','pastas_manutencoes']
  };
  const cache={};
  const backup={};
  function clone(x){ try{return JSON.parse(JSON.stringify(x||[]));}catch(e){return [];} }
  function keepBackup(){ MODS.forEach(k=>{ if(Array.isArray(data[k]) && data[k].length && !backup[k]) backup[k]=clone(data[k]); }); }
  keepBackup();
  function restoreIfZero(key){ if(Array.isArray(data[key]) && data[key].length===0 && backup[key] && backup[key].length){ data[key]=clone(backup[key]); return true; } return false; }
  const n=v=>Number(String(v??'').replace(',','.'))||0;
  const up=v=>String(v??'').trim().toUpperCase();
  const dt=v=>/^\d{4}-\d{2}-\d{2}$/.test(String(v||''))?String(v):null;
  const monthOf=v=>{ try{return typeof ym==='function'?ym(v):(/^\d{4}-\d{2}-\d{2}$/.test(String(v||''))?String(v).slice(0,7):'');}catch(e){return '';} };
  function db(){ try{return typeof connectSupabase==='function'?connectSupabase():null;}catch(e){return null;} }
  async function findTable(key){
    if(cache[key]) return cache[key];
    const c=db(); if(!c) return null;
    for(const t of (TABLES[key]||[key])){
      try{ const res=await c.from(t).select('*').limit(1); if(!res.error){ cache[key]=t; return t; } }catch(e){}
    }
    return null;
  }
  function missingColumn(err){
    const txt=String(err?.message||err?.details||err?.hint||err||'');
    const m=txt.match(/Could not find the '([^']+)' column|column "([^"]+)" does not exist|Could not find the ([a-zA-Z0-9_]+) column/i);
    return m ? (m[1]||m[2]||m[3]||'') : '';
  }
  function normalize(key,row){
    const o={...(row||{})};
    if(o.id!==undefined) o.id=Number(o.id);
    if(key==='tacografos'){
      o.placa=o.placa||o.veiculo||''; o.data=o.data||o.emissao||o.data_emissao||''; o.validade=o.validade||o.vencimento||''; o.obs=o.obs||o.observacao||''; o.status=o.status||o.situacao||'ativo';
    }
    if(key==='oleo'){
      o.placa=o.placa||o.veiculo||''; o.proxKm=n(o.proxKm??o.proxkm??o.prox_km??o.proximo_km); o.km=n(o.km); o.obs=o.obs||o.observacao||'';
    }
    if(key==='manutencoes'){
      o.placa=o.placa||o.veiculo||'';
      o.servico=o.servico||o.tipo||o.descricao||o.obs||o.observacao||o.peca||'';
      o.tipo=o.tipo||o.servico||o.peca||'';
      o.descricao=o.descricao||o.obs||o.observacao||o.servico||'';
      o.valor=n(o.valor); o.status=o.status||'concluido';
    }
    if(key==='producao'){
      o.placa=o.placa||o.veiculo||''; o.mes=o.mes||monthOf(o.data); o.obs=o.obs||o.observacao||'';
    }
    return o;
  }
  function payloadBase(key,o){
    o=o||{}; const idv=Number(o.id || (typeof id==='function'?id():Date.now()));
    if(key==='tacografos') return {id:idv,placa:up(o.placa),data:dt(o.data),validade:dt(o.validade),status:o.status||'ativo',obs:o.obs||''};
    if(key==='oleo') { const prox=n(o.proxKm??o.proxkm??o.prox_km); return {id:idv,placa:up(o.placa),modelo:o.modelo||'',data:dt(o.data),km:n(o.km),proxkm:prox,prox_km:prox,proxKm:prox,obs:o.obs||''}; }
    if(key==='manutencoes') {
      const servicoMan = String(o.servico || o.tipo || o.descricao || o.obs || '').trim() || 'Serviço de manutenção';
      const descMan = String(o.descricao || o.obs || o.servico || o.tipo || '').trim();
      return {id:idv,data:dt(o.data),placa:up(o.placa),servico:servicoMan,tipo:o.tipo||servicoMan,origem:o.origem||'',descricao:descMan,obs:descMan,valor:n(o.valor),status:o.status||'concluido'};
    }
    if(key==='producao') { const mes=o.mes||monthOf(o.data); return {id:idv,mes:mes,data:dt(o.data),placa:up(o.placa),servico:o.servico||'',responsavel:o.responsavel||'',obs:o.obs||''}; }
    return {id:idv,...o};
  }
  function payloadVariants(key,o){
    const p=payloadBase(key,o); const out=[p];
    if(key==='oleo'){
      let a={...p}; delete a.proxKm; delete a.prox_km; out.push(a);
      let b={...p}; delete b.proxKm; delete b.proxkm; out.push(b);
      let c={...p}; delete c.proxkm; delete c.prox_km; out.push(c);
    }
    if(key==='manutencoes'){
      let a={...p}; delete a.descricao; out.push(a);
      let b={...p}; delete b.obs; out.push(b);
      let c={...p}; delete c.descricao; delete c.obs; out.push(c);
    }
    if(key==='tacografos'){
      let a={...p}; delete a.obs; out.push(a);
    }
    if(key==='producao'){
      let a={...p}; delete a.obs; out.push(a);
      let b={...p}; delete b.mes; out.push(b);
    }
    return out;
  }
  async function upsertSmart(table,payloads){
    const c=db(); let last=null;
    for(const original of payloads){
      let p={...original};
      Object.keys(p).forEach(k=>{ if(p[k]===undefined) delete p[k]; });
      for(let i=0;i<20;i++){
        try{
          const r=await c.from(table).upsert(p,{onConflict:'id'}).select().single();
          if(!r.error) return r.data||p;
          throw r.error;
        }catch(e){
          last=e; const col=missingColumn(e);
          if(col && Object.prototype.hasOwnProperty.call(p,col)){ delete p[col]; continue; }
          try{ const r2=await c.from(table).upsert(p,{onConflict:'id'}); if(!r2.error) return p; last=r2.error; const col2=missingColumn(r2.error); if(col2 && Object.prototype.hasOwnProperty.call(p,col2)){ delete p[col2]; continue; } }catch(e2){ last=e2; const col3=missingColumn(e2); if(col3 && Object.prototype.hasOwnProperty.call(p,col3)){ delete p[col3]; continue; } }
          break;
        }
      }
    }
    throw last||new Error('Não consegui salvar no Supabase.');
  }
  async function salvarRegistroSupabase(key,obj){
    if(!MODS.includes(key)) return false;
    const t=await findTable(key); if(!t) throw new Error('Tabela não encontrada para '+key);
    const row=await upsertSmart(t,payloadVariants(key,obj));
    Object.assign(obj, normalize(key,row||obj));
    keepBackup();
    return true;
  }
  async function excluirRegistroSupabase(key,itemId){
    if(!MODS.includes(key)) return false;
    const t=await findTable(key), c=db(); if(!t||!c) return false;
    const r=await c.from(t).delete().eq('id',Number(itemId));
    if(r.error) throw r.error;
    return true;
  }
  async function excluirMesSupabase(key,mes){
    const t=await findTable(key), c=db(); if(!t||!c) return false;
    const start=mes+'-01';
    const y=Number(mes.slice(0,4)), m=Number(mes.slice(5,7));
    const end=(m===12?String(y+1)+'-01':String(y)+'-'+String(m+1).padStart(2,'0'))+'-01';
    async function tryDelete(builder){ try{ const r=await builder; if(r.error){ const col=missingColumn(r.error); if(!col) throw r.error; } }catch(e){ const col=missingColumn(e); if(!col) throw e; } }
    await tryDelete(c.from(t).delete().gte('data',start).lt('data',end));
    await tryDelete(c.from(t).delete().gte('validade',start).lt('validade',end));
    await tryDelete(c.from(t).delete().eq('mes',mes));
    const mt=await findTable(key==='producao'?'producaoMeses':'manutencoesMeses');
    if(mt) { try{ await c.from(mt).delete().eq('mes',mes); }catch(e){} }
    return true;
  }
  window.salvarRegistroSupabase=salvarRegistroSupabase;
  window.excluirRegistroSupabase=excluirRegistroSupabase;
  function applySchemas(){
    if(typeof schemas==='undefined') return;
    schemas.tacografos=[['placa','Placa','text'],['data','Data da emissão/aferição','date'],['validade','Validade','date'],['status','Status','select:ativo,pendente,vencido,inativo'],['obs','Observação','text']];
    schemas.oleo=[['placa','Placa','text'],['modelo','Modelo','text'],['data','Data','date'],['km','KM','number'],['proxKm','Próxima KM','number'],['obs','Observação','text']];
    schemas.manutencoes=[['data','Data','date'],['placa','Placa','text'],['tipo','Serviço','text'],['origem','Origem','text'],['descricao','Observação','text'],['valor','Valor','number'],['status','Status','select:concluido,pendente,em andamento']];
    schemas.producao=[['mes','Pasta/Mês AAAA-MM','text'],['data','Data','date'],['placa','Placa','text'],['servico','Serviço','text'],['responsavel','Responsável','text'],['obs','Observação','text']];
  }
  const oldOpen=window.openForm || (typeof openForm==='function'?openForm:null);
  window.openForm=function(key,itemId){ applySchemas(); return oldOpen.apply(this,arguments); };
  try{ openForm=window.openForm; }catch(e){}
  function readModalObj(key,itemId){
    const obj=itemId ? ((data[key]||[]).find(x=>String(x.id)===String(itemId)) || {id:Number(itemId)}) : {id:(typeof id==='function'?id():Date.now())};
    (schemas[key]||[]).forEach(([prop,,type])=>{ const el=document.getElementById('f_'+prop); if(!el) return; let v=el.value; if(type==='number') v=n(v); if(prop==='placa') v=up(v); obj[prop]=v; });
    if(key==='producao' && !obj.mes) obj.mes=monthOf(obj.data);
    return obj;
  }
  const oldSave=window.saveModal || (typeof saveModal==='function'?saveModal:null);
  window.saveModal=async function(){
    applySchemas();
    const ctx=(typeof modalCtx!=='undefined' && modalCtx)?{...modalCtx}:null;
    if(!ctx || !MODS.includes(ctx.key)) return oldSave.apply(this,arguments);
    const key=ctx.key; const obj=readModalObj(key,ctx.itemId);
    if(!ctx.itemId && !(data[key]||[]).some(x=>String(x.id)===String(obj.id))) data[key].push(obj);
    if(key==='producao' && obj.mes && !((data.producaoMeses||[]).some(x=>(typeof x==='string'?x:x.mes)===obj.mes))) data.producaoMeses=[...(data.producaoMeses||[]),{mes:obj.mes}];
    if(key==='manutencoes') { const mm=monthOf(obj.data); if(mm && !((data.manutencoesMeses||[]).some(x=>(typeof x==='string'?x:x.mes)===mm))) data.manutencoesMeses=[...(data.manutencoesMeses||[]),{mes:mm}]; }
    try{ await salvarRegistroSupabase(key,obj); if(typeof closeModal==='function') closeModal(); if(typeof toast==='function') toast('Salvo no Supabase.'); if(typeof showPage==='function') showPage(currentPage); }
    catch(e){ console.error(e); if(typeof closeModal==='function') closeModal(); if(typeof showPage==='function') showPage(currentPage); alert('Salvou na tela, mas não salvou no Supabase. Detalhe: '+(e.message||e)); }
  };
  try{ saveModal=window.saveModal; }catch(e){}
  const oldRemove=window.removeItem || (typeof removeItem==='function'?removeItem:null);
  window.removeItem=async function(key,itemId){
    if(!MODS.includes(key)) return oldRemove.apply(this,arguments);
    if(!confirm('Excluir este registro?')) return;
    try{ await excluirRegistroSupabase(key,itemId); }catch(e){ console.warn(e); }
    data[key]=(data[key]||[]).filter(x=>String(x.id)!==String(itemId));
    keepBackup();
    if(typeof toast==='function') toast('Registro excluído.');
    if(typeof showPage==='function') showPage(currentPage);
  };
  try{ removeItem=window.removeItem; }catch(e){}
  window.excluirPastaModulo=async function(key,mes){
    if(!MODS.includes(key) || !mes) return;
    if(!confirm('Excluir a pasta '+(typeof monthName==='function'?monthName(mes):mes)+'? Isso apaga os registros desse mês.')) return;
    try{ await excluirMesSupabase(key,mes); }catch(e){ console.warn(e); }
    const prop=key==='tacografos'?'validade':'data';
    data[key]=(data[key]||[]).filter(r=>monthOf(r[prop]||r.data)!==mes && String(r.mes||'')!==mes);
    if(key==='producao') data.producaoMeses=(data.producaoMeses||[]).filter(x=>(typeof x==='string'?x:x.mes)!==mes);
    if(key==='manutencoes') data.manutencoesMeses=(data.manutencoesMeses||[]).filter(x=>(typeof x==='string'?x:x.mes)!==mes);
    if(typeof folderSel!=='undefined' && folderSel[key]===mes) folderSel[key]='';
    keepBackup();
    if(typeof toast==='function') toast('Pasta excluída.');
    if(typeof showPage==='function') showPage(currentPage);
  };
  window.deleteProdMonth=function(mes){ return window.excluirPastaModulo('producao',mes); };
  window.deleteManMonth=function(mes){ return window.excluirPastaModulo('manutencoes',mes); };
  window.deleteOleoMonth=function(mes){ return window.excluirPastaModulo('oleo',mes); };
  window.deleteTacMonth=function(mes){ return window.excluirPastaModulo('tacografos',mes); };
  // Não deixa carregamento remoto vazio substituir os dados embutidos.
  const oldSync=window.syncTodasAbasSupabase;
  window.syncTodasAbasSupabase=async function(){
    keepBackup();
    try{ if(typeof oldSync==='function') await oldSync(); }catch(e){ console.warn(e); }
    let restored=false; MODS.forEach(k=>{ if(restoreIfZero(k)) restored=true; });
    if(restored && typeof showPage==='function') showPage(currentPage||'dashboard');
  };
  setTimeout(function(){ let restored=false; MODS.forEach(k=>{ if(restoreIfZero(k)) restored=true; }); if(restored && typeof showPage==='function') showPage(currentPage||'dashboard'); }, 1400);
  applySchemas();
})();

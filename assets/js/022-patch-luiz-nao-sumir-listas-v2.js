(function(){
  'use strict';
  const KEYS=['oleo','producao','tacografos'];
  const TABLES={
    oleo:['oleo','troca_oleo','trocas_oleo','troca_de_oleo'],
    producao:['producao','producao_dia','producao_do_dia'],
    tacografos:['tacografos','tacografo']
  };
  const tableCache={};
  const remoteIds={oleo:new Set(),producao:new Set(),tacografos:new Set()};
  const deletedIds={oleo:new Set(),producao:new Set(),tacografos:new Set()};
  const originalSave=window.saveModal || (typeof saveModal==='function'?saveModal:null);
  const originalRemove=window.removeItem || (typeof removeItem==='function'?removeItem:null);
  const originalOpenAddMonth=window.openAddMonth || (typeof openAddMonth==='function'?openAddMonth:null);

  function db(){ try{return typeof connectSupabase==='function'?connectSupabase():null;}catch(e){return null;} }
  function msg(t){ try{ if(typeof toast==='function') toast(t); }catch(e){} }
  function up(s){ return String(s||'').trim().toUpperCase(); }
  function cleanStr(s){ return String(s??'').trim(); }
  function n(v){ const x=Number(String(v??'').replace(',','.')); return Number.isFinite(x)?x:0; }
  function validDate(v){ v=cleanStr(v); return /^\d{4}-\d{2}-\d{2}$/.test(v)?v:null; }
  function month(v){ try{return typeof ym==='function'?ym(v):(/^\d{4}-\d{2}/.test(String(v||''))?String(v).slice(0,7):'');}catch(e){return '';} }
  function cacheKey(k){ return 'GF_FIX_MERGE_'+k; }
  function getData(k){ if(!window.data && typeof data!=='undefined') window.data=data; if(!data[k]) data[k]=[]; return data[k]; }
  function setData(k,arr){ if(!window.data && typeof data!=='undefined') window.data=data; data[k]=arr; }
  function saveCache(k){ try{ localStorage.setItem(cacheKey(k), JSON.stringify(getData(k)||[])); }catch(e){} }
  function loadCache(k){ try{ const arr=JSON.parse(localStorage.getItem(cacheKey(k))||'[]'); if(Array.isArray(arr)&&arr.length) arr.forEach(x=>mergeLocal(k,normalize(k,x),false)); }catch(e){} }
  function refresh(){ try{ if(typeof renderNav==='function') renderNav(); }catch(e){} try{ if(typeof showPage==='function') showPage(currentPage||'dashboard'); }catch(e){} }

  async function tableFor(k){
    if(tableCache[k]) return tableCache[k];
    const c=db(); if(!c) return null;
    for(const t of (TABLES[k]||[k])){
      try{ const r=await c.from(t).select('*').limit(1); if(!r.error){ tableCache[k]=t; return t; } }catch(e){}
    }
    return null;
  }
  function normalize(k,row){
    const r=Object.assign({},row||{});
    if(r.id!==undefined) r.id=Number(r.id);
    delete r.created_at; delete r.updated_at;
    if(k==='oleo'){
      r.placa=up(r.placa||r.veiculo||r.carro||'');
      r.data=cleanStr(r.data||'');
      r.km=n(r.km);
      r.proxKm=n(r.proxKm??r.proxkm??r.prox_km??r.proximo_km);
      r.obs=cleanStr(r.obs||r.observacao||'');
    }
    if(k==='producao'){
      r.placa=up(r.placa||r.veiculo||r.carro||'');
      r.data=cleanStr(r.data||'');
      r.mes=cleanStr(r.mes||month(r.data));
      r.servico=cleanStr(r.servico||r.descricao||'');
      r.responsavel=cleanStr(r.responsavel||'');
      r.obs=cleanStr(r.obs||r.observacao||'');
    }
    if(k==='tacografos'){
      r.placa=up(r.placa||r.veiculo||r.carro||'');
      r.data=cleanStr(r.data||r.emissao||r.data_emissao||r.data_afericao||'');
      r.validade=cleanStr(r.validade||r.vencimento||r.data_validade||r.data_vencimento||'');
      r.status=cleanStr(r.status||r.situacao||'ativo');
      r.obs=cleanStr(r.obs||r.observacao||r.observacoes||'');
    }
    if(!r.id) r.id=Date.now()+Math.floor(Math.random()*9999);
    return r;
  }
  function mergeLocal(k,obj,writeCache=true){
    const arr=getData(k);
    const id=String(obj.id);
    if(deletedIds[k] && deletedIds[k].has(id)) return null;
    const i=arr.findIndex(x=>String(x.id)===id);
    if(i>=0) arr[i]=Object.assign({},arr[i],obj); else arr.push(obj);
    if(k==='producao') ensureProdMonth(obj.mes||month(obj.data));
    if(writeCache) saveCache(k);
    return obj;
  }
  function removeLocal(k,itemId){
    const id=String(itemId);
    deletedIds[k].add(id);
    setData(k,getData(k).filter(x=>String(x.id)!==id));
    saveCache(k);
  }
  function ensureProdMonth(m){
    if(!m) return;
    if(!data.producaoMeses) data.producaoMeses=[];
    if(!data.producaoMeses.some(x=>String((typeof x==='string'?x:x.mes)||'')===m)) data.producaoMeses.push({mes:m});
  }
  function payloads(k,obj){
    const r=normalize(k,obj);
    if(k==='oleo'){
      return [
        {id:r.id,placa:r.placa,data:validDate(r.data),km:n(r.km),proxkm:n(r.proxKm),obs:r.obs},
        {id:r.id,placa:r.placa,data:validDate(r.data),km:n(r.km),proxKm:n(r.proxKm),obs:r.obs},
        {id:r.id,placa:r.placa,data:validDate(r.data),km:n(r.km),prox_km:n(r.proxKm),obs:r.obs}
      ];
    }
    if(k==='producao'){
      return [
        {id:r.id,mes:r.mes||month(r.data),data:validDate(r.data),placa:r.placa,servico:r.servico,responsavel:r.responsavel,obs:r.obs,anexo:r.anexo||''},
        {id:r.id,mes:r.mes||month(r.data),data:validDate(r.data),placa:r.placa,servico:r.servico,responsavel:r.responsavel,obs:r.obs}
      ];
    }
    if(k==='tacografos'){
      return [
        {id:r.id,placa:r.placa,data:validDate(r.data),validade:validDate(r.validade),status:r.status||'ativo',obs:r.obs},
        {id:r.id,placa:r.placa,data:validDate(r.data),vencimento:validDate(r.validade),status:r.status||'ativo',obs:r.obs},
        {id:r.id,placa:r.placa,data:validDate(r.data),data_validade:validDate(r.validade),status:r.status||'ativo',obs:r.obs}
      ];
    }
    return [r];
  }
  function missingCol(e){ const s=String((e&&(e.message||e.details||e.hint))||e||''); const m=s.match(/Could not find the '([^']+)' column|column "([^"]+)" does not exist/i); return m&&(m[1]||m[2]); }
  async function saveRemote(k,obj){
    const c=db(), t=await tableFor(k); if(!c||!t) return false;
    let last=null;
    for(const original of payloads(k,obj)){
      let p=Object.assign({},original);
      for(let tries=0;tries<10;tries++){
        try{
          const r=await c.from(t).upsert(p,{onConflict:'id'}).select().single();
          if(r.error) throw r.error;
          const saved=normalize(k,Object.assign({},obj,r.data||{}));
          remoteIds[k].add(String(saved.id));
          mergeLocal(k,saved,true);
          return true;
        }catch(e){
          last=e;
          const col=missingCol(e);
          if(col && Object.prototype.hasOwnProperty.call(p,col)){ delete p[col]; continue; }
          break;
        }
      }
    }
    throw last||new Error('Não salvou no Supabase');
  }
  async function deleteRemote(k,itemId){
    const c=db(), t=await tableFor(k); if(!c||!t) return false;
    const r=await c.from(t).delete().eq('id',Number(itemId));
    if(r.error) throw r.error;
    return true;
  }
  async function loadRemoteMerge(k,removeMissing){
    const c=db(), t=await tableFor(k); if(!c||!t) return false;
    try{
      const r=await c.from(t).select('*');
      if(r.error) throw r.error;
      const rows=(r.data||[]).map(x=>normalize(k,x));
      const idsNow=new Set(rows.map(x=>String(x.id)));
      rows.forEach(x=>{ remoteIds[k].add(String(x.id)); mergeLocal(k,x,true); });
      // Só remove automaticamente tacógrafo que já sabemos que veio do Supabase antes.
      // Isso evita zerar listas antigas/locais de óleo e produção.
      if(removeMissing && k==='tacografos' && rows.length>=0){
        const known=Array.from(remoteIds[k]);
        const toRemove=known.filter(id=>!idsNow.has(id));
        if(toRemove.length){
          toRemove.forEach(id=>deletedIds[k].add(id));
          setData(k,getData(k).filter(x=>!toRemove.includes(String(x.id))));
          saveCache(k);
        }
      }
      return true;
    }catch(e){ console.warn('Falha ao mesclar '+k,e); return false; }
  }
  function objFromModal(k,ctx){
    const base=ctx&&ctx.itemId? (getData(k).find(x=>String(x.id)===String(ctx.itemId))||{}) : {id:(ctx&&ctx.tempId)||Date.now()+Math.floor(Math.random()*9999)};
    const obj=Object.assign({},base);
    const fields={
      oleo:['placa','data','km','proxKm','obs'],
      producao:['mes','data','placa','servico','responsavel','obs'],
      tacografos:['placa','data','validade','status','obs']
    }[k]||[];
    fields.forEach(prop=>{
      const el=document.getElementById('f_'+prop);
      if(!el) return;
      let v=el.value;
      if(prop==='placa') v=up(v);
      if(prop==='km'||prop==='proxKm') v=n(v);
      obj[prop]=v;
    });
    if(k==='producao' && !obj.mes) obj.mes=month(obj.data);
    return normalize(k,obj);
  }
  window.saveModal=async function(){
    const ctx=(typeof modalCtx!=='undefined'&&modalCtx)?Object.assign({},modalCtx):null;
    if(!ctx || !KEYS.includes(ctx.key)) return originalSave?originalSave.apply(this,arguments):undefined;
    const k=ctx.key;
    const obj=objFromModal(k,ctx);
    if((k==='oleo'||k==='producao'||k==='tacografos') && !obj.placa){ alert('Informe a placa.'); return; }
    if(k==='producao' && !obj.mes){ alert('Informe a pasta/mês no formato AAAA-MM.'); return; }
    mergeLocal(k,obj,true);
    if(k==='producao') ensureProdMonth(obj.mes);
    try{ if(typeof closeModal==='function') closeModal(); }catch(e){}
    refresh();
    try{
      await saveRemote(k,obj);
      if(k==='producao') ensureProdMonth(obj.mes);
      refresh();
      msg('Salvo sem apagar os outros registros.');
    }catch(e){
      console.error(e);
      refresh();
      alert('Apareceu na tela, mas não salvou no Supabase. Detalhe: '+(e.message||e));
    }
  };
  try{ saveModal=window.saveModal; }catch(e){}

  window.removeItem=async function(key,itemId){
    if(!KEYS.includes(key)) return originalRemove?originalRemove.apply(this,arguments):undefined;
    if(!confirm('Excluir este registro?')) return;
    removeLocal(key,itemId);
    refresh();
    try{
      await deleteRemote(key,itemId);
      msg('Excluído e sincronizado.');
    }catch(e){
      console.error(e);
      alert('Excluiu desta tela, mas não consegui excluir no Supabase. Detalhe: '+(e.message||e));
    }
  };
  try{ removeItem=window.removeItem; }catch(e){}

  window.openAddMonth=function(){
    const atual=(typeof folderSel!=='undefined'&&folderSel&&folderSel.producao)||month(new Date().toISOString().slice(0,10))||'2026-06';
    const m=prompt('Digite a pasta no formato AAAA-MM:', atual);
    if(m===null) return;
    if(!/^\d{4}-\d{2}$/.test(m)){ alert('Use o formato AAAA-MM.'); return; }
    ensureProdMonth(m);
    try{ if(typeof folderSel!=='undefined'&&folderSel) folderSel.producao=m; }catch(e){}
    try{ selectedProdMonth=m; }catch(e){}
    saveCache('producao');
    refresh();
    msg('Pasta criada sem apagar as outras.');
  };
  try{ openAddMonth=window.openAddMonth; }catch(e){}

  async function startRealtime(){
    const c=db(); if(!c || typeof c.channel!=='function') return;
    for(const k of KEYS){
      const t=await tableFor(k); if(!t) continue;
      try{
        c.channel('luiz-final-'+t+'-'+Math.random().toString(36).slice(2))
          .on('postgres_changes',{event:'*',schema:'public',table:t},async payload=>{
            if(payload.eventType==='DELETE'){
              const rid=payload.old&&payload.old.id;
              if(rid!==undefined){ deletedIds[k].add(String(rid)); setData(k,getData(k).filter(x=>String(x.id)!==String(rid))); saveCache(k); refresh(); return; }
            }
            await loadRemoteMerge(k,false); refresh();
          }).subscribe();
      }catch(e){ console.warn('Realtime '+k+' não iniciou',e); }
    }
  }
  window.syncCorrecoesLuiz=function(){ return Promise.all(KEYS.map(k=>loadRemoteMerge(k,k==='tacografos'))).then(refresh); };
  KEYS.forEach(loadCache);
  setTimeout(()=>{ window.syncCorrecoesLuiz(); startRealtime(); },1200);
  window.addEventListener('focus',()=>window.syncCorrecoesLuiz());
  console.log('Patch Luiz final: óleo/produção não substituem lista; tacógrafo exclui em tempo real.');
})();

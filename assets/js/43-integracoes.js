(function(){
  'use strict';

  // Luiz v4: a aba Manutenções passa a usar o Supabase como fonte única.
  // Motivo: versões anteriores mesclavam as 274 manutenções embutidas no index
  // com as linhas vindas do Supabase, fazendo o contador subir para 400+.

  try { sessionStorage.setItem('gf_manut_desc_antigas_sync_v2','1'); } catch(e) {}
  try { localStorage.removeItem('GF_FIX_MERGE_manutencoes'); } catch(e) {}

  function db(){
    try { return typeof connectSupabase === 'function' ? connectSupabase() : null; }
    catch(e){ return null; }
  }
  function T(v){ return String(v == null ? '' : v).trim(); }
  function U(v){ return T(v).toUpperCase(); }
  function N(v){
    if(v === null || v === undefined || v === '') return 0;
    if(typeof v === 'number') return Number.isFinite(v) ? v : 0;
    let s = String(v).trim().replace(/\s+/g,'');
    if(!s) return 0;
    const temVirgula = s.includes(',');
    const temPonto = s.includes('.');
    if(temVirgula && temPonto){
      // Formato brasileiro: 1.116,99 -> 1116.99
      s = s.replace(/\./g,'').replace(',','.');
    }else if(temVirgula){
      // Decimal brasileiro: 287,10 -> 287.10
      s = s.replace(',','.');
    }
    // Se tiver apenas ponto, mantém como decimal JS/Supabase: 1116.99 não vira 111699.
    s = s.replace(/[^0-9.\-]/g,'');
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }
  function D(v){
    v = T(v);
    return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : '';
  }
  function normalizarDescricaoCompleta(txt){
    let s = T(txt);
    const tipo = (s.match(/Tipo\/peça:\s*([^\n]+)/i)||[])[1] || '';
    const origem = (s.match(/Origem:\s*([^\n]+)/i)||[])[1] || '';
    const desc = (s.match(/Descrição:\s*([\s\S]*)/i)||[])[1] || s;
    return {tipo:T(tipo), origem:T(origem), descricao:T(desc)};
  }
  function normalizarManutencao(row){
    const r = Object.assign({}, row || {});
    const parsed = normalizarDescricaoCompleta(r.descricao || r.obs || r.observacao || '');
    return {
      id: Number(r.id),
      data: D(r.data),
      placa: U(r.placa || r.veiculo || r.carro || ''),
      tipo: T(r.tipo || r.servico || parsed.tipo || ''),
      servico: T(r.servico || r.tipo || parsed.tipo || ''),
      origem: T(r.origem || parsed.origem || ''),
      validadePeca: D(r.validadePeca || r.validade_peca || r.validade_peca_manutencao || r.validade || ''),
      descricao: T(parsed.descricao || r.descricao || r.obs || r.observacao || ''),
      obs: T(r.obs || r.observacao || r.descricao || ''),
      valor: N(r.valor),
      status: T(r.status || 'concluido'),
      anexo: T(r.anexo || '')
    };
  }
  function chaveSemId(r){
    const limpar = s => T(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').replace(/\s+/g,' ').trim();
    const placa = limpar(r.placa).slice(-4);
    const desc = limpar(r.descricao || r.obs || '').slice(0,90);
    const tipo = limpar(r.tipo || r.servico || '').slice(0,45);
    if(!r.data || !placa) return 'ID:' + String(r.id || Math.random());
    return [r.data, placa, tipo, desc].join('|');
  }
  function deduplicarManutencoesLocal(){
    if(!window.data && typeof data !== 'undefined') window.data = data;
    if(!window.data || !Array.isArray(window.data.manutencoes)) return [];
    const map = new Map();
    for(const raw of window.data.manutencoes){
      const r = normalizarManutencao(raw);
      const k = chaveSemId(r);
      const prev = map.get(k);
      if(!prev){ map.set(k, r); continue; }
      const score = x =>
        (x.id ? 8 : 0) +
        (x.descricao ? 4 : 0) +
        (x.tipo ? 2 : 0) +
        (x.origem ? 1 : 0) +
        ((x.valor && x.valor < 50000) ? 1 : 0);
      if(score(r) > score(prev)) map.set(k, Object.assign({}, prev, r));
    }
    window.data.manutencoes = Array.from(map.values()).sort((a,b)=>String(a.data||'').localeCompare(String(b.data||'')) || Number(a.id||0)-Number(b.id||0));
    try { data.manutencoes = window.data.manutencoes; } catch(e) {}
    return window.data.manutencoes;
  }

  async function tabelaManutencoes(){
    const c = db();
    if(!c) return null;
    for(const t of ['manutencoes','manutencao']){
      try{
        const r = await c.from(t).select('id').limit(1);
        if(!r.error) return t;
      }catch(e){}
    }
    return null;
  }

  window.carregarManutencoesSupabaseFonteUnica = async function(){
    const c = db();
    const t = await tabelaManutencoes();
    if(!c || !t) return false;
    try{
      const r = await c.from(t).select('*').order('id', {ascending:true});
      if(r.error) throw r.error;
      const rows = Array.isArray(r.data) ? r.data.map(normalizarManutencao).filter(x=>x.id) : [];
      // Aqui é a correção principal: substitui a lista local pela lista do Supabase.
      window.data.manutencoes = rows;
      try { data.manutencoes = rows; } catch(e) {}
      deduplicarManutencoesLocal();
      try { localStorage.removeItem('GF_FIX_MERGE_manutencoes'); } catch(e) {}
      try { if(typeof renderNav === 'function') renderNav(); } catch(e) {}
      try { if((typeof currentPage !== 'undefined' ? currentPage : '') === 'manutencoes' && typeof render_manutencoes === 'function') render_manutencoes(); } catch(e) {}
      return true;
    }catch(e){
      console.warn('Não consegui carregar Manutenções como fonte única do Supabase:', e);
      deduplicarManutencoesLocal();
      return false;
    }
  };

  const oldCountFor = window.countFor || (typeof countFor === 'function' ? countFor : null);
  window.countFor = function(k){
    if(k === 'manutencoes') return deduplicarManutencoesLocal().length;
    return oldCountFor ? oldCountFor(k) : '';
  };
  try { countFor = window.countFor; } catch(e) {}

  const oldRenderManutencoes = window.render_manutencoes || (typeof render_manutencoes === 'function' ? render_manutencoes : null);
  if(oldRenderManutencoes){
    window.render_manutencoes = function(){
      deduplicarManutencoesLocal();
      return oldRenderManutencoes.apply(this, arguments);
    };
    try { render_manutencoes = window.render_manutencoes; } catch(e) {}
  }

  const oldRenderManList = window.renderManList || (typeof renderManList === 'function' ? renderManList : null);
  if(oldRenderManList){
    window.renderManList = function(){
      deduplicarManutencoesLocal();
      return oldRenderManList.apply(this, arguments);
    };
    try { renderManList = window.renderManList; } catch(e) {}
  }

  const oldSync = window.syncTodasAbasSupabase;
  if(typeof oldSync === 'function'){
    window.syncTodasAbasSupabase = async function(){
      const out = await oldSync.apply(this, arguments);
      await window.carregarManutencoesSupabaseFonteUnica();
      return out;
    };
  }

  const oldShow = window.showPage;
  if(typeof oldShow === 'function'){
    window.showPage = function(page){
      const out = oldShow.apply(this, arguments);
      if((page || currentPage) === 'manutencoes'){
        deduplicarManutencoesLocal();
        setTimeout(()=>window.carregarManutencoesSupabaseFonteUnica(), 250);
      }
      return out;
    };
    try { showPage = window.showPage; } catch(e) {}
  }

  // A sincronização antiga agora só faz UPDATE em IDs existentes; não cria linha nova.
  const oldSyncDesc = window.sincronizarDescricoesManutencoesAnterioresSupabase;
  window.sincronizarDescricoesManutencoesAnterioresSupabase = async function(silencioso){
    deduplicarManutencoesLocal();
    const c = db();
    const t = await tabelaManutencoes();
    if(!c || !t){
      if(!silencioso && typeof toast === 'function') toast('Supabase indisponível.');
      return {ok:0, fail:0, total:0};
    }
    let ok=0, fail=0;
    const rows = (window.data.manutencoes || []).filter(r=>r.id && r.data && r.data < '2026-06-01' && r.descricao);
    for(const r of rows){
      let payload = {
        descricao: r.descricao,
        obs: r.obs || r.descricao,
        tipo: r.tipo || r.servico || '',
        origem: r.origem || ''
      };
      for(let i=0;i<6;i++){
        try{
          const res = await c.from(t).update(payload).eq('id', Number(r.id));
          if(res.error) throw res.error;
          ok++;
          break;
        }catch(e){
          const msg = String(e && (e.message || e.details || e.hint) || e || '');
          const col = (msg.match(/column "([^"]+)" does not exist/i)||msg.match(/Could not find the '([^']+)' column/i)||[])[1];
          if(col && Object.prototype.hasOwnProperty.call(payload,col)){ delete payload[col]; continue; }
          fail++;
          break;
        }
      }
    }
    await window.carregarManutencoesSupabaseFonteUnica();
    if(!silencioso && typeof toast === 'function') toast('Descrições atualizadas sem criar manutenções novas: '+ok+(fail?' falhas: '+fail:''));
    return {ok, fail, total:rows.length};
  };

  window.limparCacheManutencoesLuiz = function(){
    try { localStorage.removeItem('GF_FIX_MERGE_manutencoes'); } catch(e) {}
    try { sessionStorage.setItem('gf_manut_desc_antigas_sync_v2','1'); } catch(e) {}
    try { if(typeof toast === 'function') toast('Cache local de manutenções limpo. Recarregando...'); } catch(e) {}
    setTimeout(()=>location.reload(), 500);
  };

  function botaoLimparCache(){
    try{
      if((typeof currentPage !== 'undefined' ? currentPage : '') !== 'manutencoes') return;
      const box = document.getElementById('pageActions');
      if(!box || document.getElementById('btnLimparCacheManutLuiz')) return;
      const b = document.createElement('button');
      b.id = 'btnLimparCacheManutLuiz';
      b.className = 'btn danger';
      b.textContent = 'Limpar cache local';
      b.onclick = window.limparCacheManutencoesLuiz;
      box.prepend(b);
    }catch(e){}
  }

  setTimeout(()=>{ deduplicarManutencoesLocal(); botaoLimparCache(); window.carregarManutencoesSupabaseFonteUnica(); }, 1800);
  window.addEventListener('focus', ()=>setTimeout(()=>window.carregarManutencoesSupabaseFonteUnica(), 400));
  document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) setTimeout(()=>window.carregarManutencoesSupabaseFonteUnica(), 400); });
})();

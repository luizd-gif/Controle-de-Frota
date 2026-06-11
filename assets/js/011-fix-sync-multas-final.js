(function(){
  const previousSaveModal = window.saveModal;

  async function saveMultaDiretoSupabase(){
    const ctx = (typeof modalCtx !== 'undefined' && modalCtx) ? {...modalCtx} : null;
    if(!ctx || ctx.key !== 'multas') return false;

    const itemId = ctx.itemId;
    let obj = itemId ? (data.multas || []).find(x => String(x.id) === String(itemId)) : null;
    if(!obj) obj = { id: (typeof id === 'function' ? id() : Date.now()) };

    (schemas.multas || []).forEach(([prop,,type]) => {
      const el = document.getElementById('f_' + prop);
      if(!el) return;
      let v = el.value;
      if(type === 'number') v = Number(v || 0);
      if(prop === 'placa') v = String(v || '').toUpperCase();
      obj[prop] = v;
    });

    try{
      await salvarMultaSupabase(obj);
      const idx = (data.multas || []).findIndex(x => String(x.id) === String(obj.id));
      if(idx >= 0) data.multas[idx] = obj;
      else data.multas.unshift(obj);

      if(typeof sincronizarPontoDaMulta === 'function'){
        await sincronizarPontoDaMulta(obj).catch(console.warn);
      }

      if(typeof closeModal === 'function') closeModal();
      if(typeof toast === 'function') toast('Multa salva no Supabase.');
      if(typeof renderNav === 'function') renderNav();
      if(typeof showPage === 'function') showPage(currentPage || 'multas');
      return true;
    }catch(e){
      console.error('Erro ao salvar multa no Supabase:', e);
      alert('Erro ao salvar multa no Supabase: ' + (e.message || e));
      return true;
    }
  }

  async function saveModalFinal(){
    const ctx = (typeof modalCtx !== 'undefined' && modalCtx) ? {...modalCtx} : null;
    if(ctx && ctx.key === 'multas') return saveMultaDiretoSupabase();
    return previousSaveModal.apply(this, arguments);
  }

  window.saveModal = saveModalFinal;
  try { saveModal = saveModalFinal; } catch(e) {}

  const previousRemoveItem = window.removeItem;
  async function removeItemFinal(key,itemId){
    if(key !== 'multas') return previousRemoveItem.apply(this, arguments);
    if(!confirm('Excluir esta multa?')) return;
    try{
      await removerMultaSupabase(itemId);
      data.multas = (data.multas || []).filter(x => String(x.id) !== String(itemId));
      if(typeof toast === 'function') toast('Multa excluída do Supabase.');
      if(typeof renderNav === 'function') renderNav();
      if(typeof showPage === 'function') showPage(currentPage || 'multas');
    }catch(e){
      console.error('Erro ao excluir multa no Supabase:', e);
      alert('Erro ao excluir multa no Supabase: ' + (e.message || e));
    }
  }

  window.removeItem = removeItemFinal;
  try { removeItem = removeItemFinal; } catch(e) {}

  async function atualizarMultasQuandoAberto(){
    if(document.hidden) return;
    if(!['multas','dashboard','pontos','motoristas'].includes(currentPage || '')) return;
    if(typeof carregarMultasSupabase === 'function') await carregarMultasSupabase().catch(console.warn);
  }

  window.addEventListener('focus', atualizarMultasQuandoAberto);
  document.addEventListener('visibilitychange', atualizarMultasQuandoAberto);
  setInterval(atualizarMultasQuandoAberto, 20000);
})();

(function(){
  'use strict';
  function texto(v){ return String(v ?? '').trim(); }
  function prepararManutencao(obj){
    if(!obj) return obj;
    const servico = texto(obj.servico || obj.tipo || obj.descricao || obj.obs) || 'Serviço de manutenção';
    obj.servico = servico;
    if(!texto(obj.tipo)) obj.tipo = servico;
    if(!texto(obj.descricao) && texto(obj.obs)) obj.descricao = obj.obs;
    return obj;
  }
  if(Array.isArray(window.data?.manutencoes)) window.data.manutencoes.forEach(prepararManutencao);
  const oldSaveModal = window.saveModal;
  window.saveModal = async function(){
    const ctx = (typeof modalCtx !== 'undefined' && modalCtx) ? {...modalCtx} : null;
    if(ctx && ctx.key === 'manutencoes'){
      const original = window.salvarRegistroSupabase;
      if(typeof original === 'function'){
        window.salvarRegistroSupabase = async function(key,obj){
          if(key === 'manutencoes') prepararManutencao(obj);
          return original.apply(this, arguments);
        };
      }
    }
    return oldSaveModal.apply(this, arguments);
  };
  try{ saveModal = window.saveModal; }catch(e){}
})();

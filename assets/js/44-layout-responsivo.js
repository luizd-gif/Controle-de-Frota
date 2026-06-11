(function(){
  'use strict';
  function valorSeguro(v){
    if(v === null || v === undefined || v === '') return 0;
    if(typeof v === 'number') return Number.isFinite(v) ? v : 0;
    let s = String(v).trim().replace(/\s+/g,'');
    if(!s) return 0;
    if(s.includes(',') && s.includes('.')) s = s.replace(/\./g,'').replace(',','.');
    else if(s.includes(',')) s = s.replace(',','.');
    s = s.replace(/[^0-9.\-]/g,'');
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }
  function corrigirValoresNaTela(){
    try{
      if(!window.data || !Array.isArray(window.data.manutencoes)) return;
      data.manutencoes.forEach(function(r){
        r.valor = valorSeguro(r.valor);
      });
    }catch(e){}
  }
  corrigirValoresNaTela();
  const oldShow = window.showPage;
  if(typeof oldShow === 'function'){
    window.showPage = function(){
      corrigirValoresNaTela();
      const out = oldShow.apply(this, arguments);
      setTimeout(corrigirValoresNaTela, 50);
      return out;
    };
    try{ showPage = window.showPage; }catch(e){}
  }
})();

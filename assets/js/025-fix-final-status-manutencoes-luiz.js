(function(){
  function corrigirStatusManutencoes(){
    if(!window.data || !Array.isArray(data.manutencoes)) return;
    data.manutencoes.forEach(r=>{
      const st=String(r.status||'').toLowerCase().trim();
      if(['aguardando_aceite','aguardando assinatura','aguardando_assinatura','aceito','aceita','enviado_rca','enviado_para_rca'].includes(st)) r.status='pendente';
      if(!st) r.status='concluido';
    });
  }
  corrigirStatusManutencoes();
  const oldShowPage=window.showPage;
  if(typeof oldShowPage==='function'){
    window.showPage=function(p){ corrigirStatusManutencoes(); return oldShowPage.apply(this,arguments); };
    try{ showPage=window.showPage; }catch(e){}
  }
})();

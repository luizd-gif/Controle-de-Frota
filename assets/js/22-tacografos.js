(function(){
  'use strict';
  function txt(v){ return String(v ?? '').trim(); }
  function parseDescCompleta(v){
    const s=txt(v);
    const out={tipo:'',origem:'',descricao:s};
    if(!s) return out;
    const tipo=s.match(/(?:^|\n)\s*(?:Tipo\/peça|Tipo|Serviço)\s*:\s*([^\n]+)/i);
    const origem=s.match(/(?:^|\n)\s*Origem\s*:\s*([^\n]+)/i);
    const desc=s.match(/(?:^|\n)\s*Descrição\s*:\s*([\s\S]*)$/i);
    if(tipo) out.tipo=txt(tipo[1]);
    if(origem) out.origem=txt(origem[1]);
    if(desc) out.descricao=txt(desc[1]);
    return out;
  }
  function montarDescricaoCompleta(tipo,origem,descricao){
    const linhas=[];
    tipo=txt(tipo); origem=txt(origem); descricao=txt(descricao);
    const parsed=parseDescCompleta(descricao);
    if(!tipo && parsed.tipo) tipo=parsed.tipo;
    if(!origem && parsed.origem) origem=parsed.origem;
    descricao=parsed.descricao || descricao;
    if(tipo) linhas.push('Tipo/peça: '+tipo);
    if(origem) linhas.push('Origem: '+origem);
    if(descricao) linhas.push('Descrição: '+descricao);
    return linhas.join('\n');
  }

  const oldOpenForm = window.openForm;
  window.openForm=function(key,itemId){
    const r = oldOpenForm ? oldOpenForm.apply(this,arguments) : undefined;
    if(key==='manutencoes'){
      setTimeout(function(){
        const tipoEl=document.getElementById('f_tipo');
        const origemEl=document.getElementById('f_origem');
        const descEl=document.getElementById('f_descricao');
        if(!descEl) return;
        const parsed=parseDescCompleta(descEl.value);
        if(tipoEl && !txt(tipoEl.value) && parsed.tipo) tipoEl.value=parsed.tipo;
        if(origemEl && !txt(origemEl.value) && parsed.origem) origemEl.value=parsed.origem;
        if(parsed.tipo || parsed.origem) descEl.value=parsed.descricao;
      },0);
    }
    return r;
  };
  try{ openForm=window.openForm; }catch(e){}

  const oldSaveModal = window.saveModal;
  window.saveModal=async function(){
    const ctx=(typeof modalCtx!=='undefined' && modalCtx) ? Object.assign({},modalCtx) : null;
    if(ctx && ctx.key==='manutencoes'){
      const tipoEl=document.getElementById('f_tipo');
      const origemEl=document.getElementById('f_origem');
      const descEl=document.getElementById('f_descricao');
      if(descEl){
        descEl.value=montarDescricaoCompleta(tipoEl&&tipoEl.value, origemEl&&origemEl.value, descEl.value);
      }
    }
    return oldSaveModal ? oldSaveModal.apply(this,arguments) : undefined;
  };
  try{ saveModal=window.saveModal; }catch(e){}
})();

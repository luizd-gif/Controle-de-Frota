(function(){
  function arrSafe(key){ if(!data[key]) data[key]=[]; return data[key]; }
  function mesProp(key){ return key==='tacografos' ? 'validade' : 'data'; }
  function listaMeses(months){
    return [...new Set((months||[]).map(m=>typeof m==='string'?m:(m&&m.mes)).filter(Boolean))].sort();
  }
  function manterDia(dataAntiga, novoMes){
    const antiga=String(dataAntiga||'');
    const dia=/^\d{4}-\d{2}-\d{2}$/.test(antiga) ? Number(antiga.slice(8,10)) : 1;
    const ultimo=new Date(Number(novoMes.slice(0,4)), Number(novoMes.slice(5,7)), 0).getDate();
    return `${novoMes}-${String(Math.min(dia,ultimo)).padStart(2,'0')}`;
  }
  async function salvarLinha(key, r){
    if(typeof window.salvarRegistroSupabase==='function'){
      try{ await window.salvarRegistroSupabase(key,r); }catch(e){ console.warn(e); }
    }
  }
  async function excluirLinha(key, id){
    if(typeof window.excluirRegistroSupabase==='function'){
      try{ await window.excluirRegistroSupabase(key,id); }catch(e){ console.warn(e); }
    }
  }

  window.editarPastaModulo = async function(key, oldMes){
    const novoMes = prompt('Novo mês da pasta no formato AAAA-MM:', oldMes || '');
    if(!novoMes) return;
    if(!/^\d{4}-\d{2}$/.test(novoMes)){ alert('Use o formato AAAA-MM. Exemplo: 2026-06'); return; }
    const prop = mesProp(key);
    const linhas = arrSafe(key).filter(r=>ym(r[prop]||r.data||'')===oldMes);
    for(const r of linhas){
      r[prop]=manterDia(r[prop]||r.data, novoMes);
      if(key==='producao') r.mes=novoMes;
      await salvarLinha(key,r);
    }
    if(key==='producao' && Array.isArray(data.producaoMeses)){
      data.producaoMeses=data.producaoMeses.map(x=>(typeof x==='string'?x:x.mes)===oldMes?{mes:novoMes}:x);
    }
    if(key==='manutencoes' && Array.isArray(data.manutencoesMeses)){
      data.manutencoesMeses=data.manutencoesMeses.map(x=>(typeof x==='string'?x:x.mes)===oldMes?{mes:novoMes}:x);
    }
    folderSel[key]=novoMes;
    showPage(currentPage);
    toast('Pasta editada sem apagar as outras.');
  };

  window.excluirPastaModulo = async function(key, mes){
    if(!confirm(`Excluir a pasta ${monthName(mes)}? Isso apaga só os registros desse mês.`)) return;
    const prop = mesProp(key);
    const linhas = arrSafe(key).filter(r=>ym(r[prop]||r.data||'')===mes);
    for(const r of linhas){ await excluirLinha(key,r.id); }
    data[key]=arrSafe(key).filter(r=>ym(r[prop]||r.data||'')!==mes);
    if(key==='producao' && Array.isArray(data.producaoMeses)) data.producaoMeses=data.producaoMeses.filter(x=>(typeof x==='string'?x:x.mes)!==mes);
    if(key==='manutencoes' && Array.isArray(data.manutencoesMeses)) data.manutencoesMeses=data.manutencoesMeses.filter(x=>(typeof x==='string'?x:x.mes)!==mes);
    if(folderSel[key]===mes) folderSel[key]='';
    showPage(currentPage);
    toast('Pasta excluída. As outras foram preservadas.');
  };

  window.folderHtmlEmpresa = function(key, months){
    const current=folderSel[key]||'';
    const cards=[{mes:'',label:'Todos os meses'}, ...listaMeses(months).map(m=>({mes:m,label:monthName(m)}))];
    return `<div class="folders">${cards.map(f=>{
      const acoes = f.mes ? `<div class="folder-actions" onclick="event.stopPropagation()"><button type="button" class="icon-btn" title="Editar pasta" onclick="editarPastaModulo('${key}','${f.mes}')">✎</button><button type="button" class="icon-btn" title="Excluir pasta" onclick="excluirPastaModulo('${key}','${f.mes}')">×</button></div>` : '';
      return `<div class="folder ${current===f.mes?'active':''}" role="button" tabindex="0" onclick="selectFolderEmpresa('${key}','${f.mes}')">${acoes}<div class="folder-icon">📁</div><strong>${f.label}</strong><small>${folderCountEmpresa(key,f.mes)}</small></div>`;
    }).join('')}</div>`;
  };
})();

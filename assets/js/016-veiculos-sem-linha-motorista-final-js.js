(function(){
  'use strict';
  function safeEsc(v){ try{return typeof esc==='function'?esc(v):String(v??'').replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c;});}catch(e){return String(v??'');} }
  function safeClean(v){ try{return typeof clean==='function'?clean(v):String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}catch(e){return String(v||'').toLowerCase();} }
  function normStatus(v){
    const s=safeClean(v||'ativo');
    if(s.includes('manut')) return 'manutencao';
    if(s.includes('inat')||s.includes('baix')||s.includes('parad')) return 'inativo';
    return 'ativo';
  }
  function tagStatus(v){
    const s=normStatus(v);
    if(s==='manutencao') return '<span class="tag amber">Em manutenção</span>';
    if(s==='inativo') return '<span class="tag red">Inativo</span>';
    return '<span class="tag green">Ativo</span>';
  }
  function sanitizeVehicles(){
    if(!window.data || !Array.isArray(data.veiculos)) return;
    data.veiculos.forEach(function(v){
      delete v.motorista;
      delete v.linha;
      if(v.status) v.status=normStatus(v.status);
    });
  }
  function vehicleTable(title, rows, emptyText){
    const body = rows.length ? rows.map(function(v){
      return '<tr>'+
        '<td><span class="plate">'+safeEsc(v.placa||'-')+'</span></td>'+
        '<td>'+safeEsc(v.modelo||'-')+'</td>'+
        '<td>'+safeEsc(v.ano||'-')+'</td>'+
        '<td>'+tagStatus(v.status)+'</td>'+
        '<td><div class="row-actions"><button class="icon-btn" title="Editar" onclick="openForm(\'veiculos\','+Number(v.id)+')">✎</button><button class="icon-btn" title="Excluir" onclick="removeItem(\'veiculos\','+Number(v.id)+')">×</button></div></td>'+
      '</tr>';
    }).join('') : '<tr><td colspan="5"><div class="empty">'+safeEsc(emptyText||'Nenhum veículo encontrado.')+'</div></td></tr>';
    return '<div class="table-card"><div class="table-head"><h3>'+title+'</h3><small>'+rows.length+' veículo(s)</small></div><div class="table-scroll"><table><thead><tr><th>Placa</th><th>Modelo</th><th>Ano</th><th>Status</th><th>Ações</th></tr></thead><tbody>'+body+'</tbody></table></div></div>';
  }
  window.setVehicleStatusFilter=function(v){ window.selectedVehicleStatus=v||'todos'; if(typeof renderVeiculosList==='function') renderVeiculosList(); };
  window.renderVeiculosList=function(){
    sanitizeVehicles();
    const q=safeClean(document.getElementById('veiSearch')?.value||'');
    const selected=window.selectedVehicleStatus||'todos';
    const sel=document.getElementById('veiStatusSelect'); if(sel && sel.value!==selected) sel.value=selected;
    let rows=(data.veiculos||[]).filter(function(r){
      const searchable=[r.placa,r.modelo,r.ano,r.status].join(' ');
      return !q || safeClean(searchable).includes(q);
    });
    if(selected!=='todos') rows=rows.filter(function(r){ return normStatus(r.status)===selected; });
    const ativos=rows.filter(function(r){return normStatus(r.status)==='ativo';});
    const manut=rows.filter(function(r){return normStatus(r.status)==='manutencao';});
    const inativos=rows.filter(function(r){return normStatus(r.status)==='inativo';});
    let html='';
    if(selected==='todos'){
      html='<div class="vehicle-split-grid">'+
        vehicleTable('Veículos ativos',ativos,'Nenhum veículo ativo encontrado.')+
        vehicleTable('Veículos em manutenção',manut,'Nenhum veículo em manutenção encontrado.')+
        (inativos.length?vehicleTable('Veículos inativos',inativos,'Nenhum veículo inativo encontrado.'):'')+
      '</div>';
    }else if(selected==='ativo') html=vehicleTable('Veículos ativos',ativos,'Nenhum veículo ativo encontrado.');
    else if(selected==='manutencao') html=vehicleTable('Veículos em manutenção',manut,'Nenhum veículo em manutenção encontrado.');
    else html=vehicleTable('Veículos inativos',inativos,'Nenhum veículo inativo encontrado.');
    const target=document.getElementById('veiculosTable'); if(target) target.innerHTML=html;
  };
  window.render_veiculos=function(){
    sanitizeVehicles();
    if(typeof schemas!=='undefined') schemas.veiculos=[['placa','Placa','text'],['modelo','Modelo','text'],['ano','Ano','number'],['status','Status','select:ativo,manutencao,inativo']];
    if(typeof setActions==='function') setActions('<button class="btn primary" onclick="openForm(\'veiculos\')">+ Novo veículo</button>');
    const rows=data.veiculos||[];
    const ativos=rows.filter(function(r){return normStatus(r.status)==='ativo';}).length;
    const manut=rows.filter(function(r){return normStatus(r.status)==='manutencao';}).length;
    const inativos=rows.filter(function(r){return normStatus(r.status)==='inativo';}).length;
    const modelos=[...new Set(rows.map(function(r){return r.modelo||'';}).filter(Boolean))].length;
    const statsHtml = typeof stats==='function' ? stats([['Ativos',ativos,'em operação'],['Em manutenção',manut,'parados/oficina'],['Inativos',inativos,'fora de uso'],['Modelos',modelos,'diferentes']]) : '';
    const el=document.getElementById('veiculos'); if(!el) return;
    el.innerHTML=statsHtml+
      '<div class="filters"><div class="filter-row two"><input id="veiSearch" placeholder="Buscar por placa, modelo, ano ou status..."><select id="veiStatusSelect"><option value="todos">Todos</option><option value="ativo">Ativos</option><option value="manutencao">Em manutenção</option><option value="inativo">Inativos</option></select></div><div class="vehicle-status-note"><span>Veículos separados automaticamente pelo campo Status:</span><span class="tag green">Ativo</span><span class="tag amber">Em manutenção</span><span class="tag red">Inativo</span></div></div><div id="veiculosTable"></div>';
    document.getElementById('veiSearch').oninput=renderVeiculosList;
    document.getElementById('veiStatusSelect').value=window.selectedVehicleStatus||'todos';
    document.getElementById('veiStatusSelect').onchange=function(e){setVehicleStatusFilter(e.target.value);};
    renderVeiculosList();
  };
  window.renderVeiculos=window.render_veiculos;
  // Mantém o formulário de veículo limpo em qualquer abertura.
  const oldOpenForm=window.openForm || (typeof openForm==='function'?openForm:null);
  if(oldOpenForm){
    window.openForm=function(key,itemId){
      if(key==='veiculos'){
        sanitizeVehicles();
        if(typeof schemas!=='undefined') schemas.veiculos=[['placa','Placa','text'],['modelo','Modelo','text'],['ano','Ano','number'],['status','Status','select:ativo,manutencao,inativo']];
      }
      return oldOpenForm.apply(this,arguments);
    };
    try{ openForm=window.openForm; }catch(e){}
  }
  // Garante que nada de linha/motorista seja enviado no salvamento de veículos.
  const oldSaveModal2=window.saveModal || (typeof saveModal==='function'?saveModal:null);
  if(oldSaveModal2){
    window.saveModal=async function(){
      const ctx=window.modalCtx || (typeof modalCtx!=='undefined'?modalCtx:null);
      if(ctx && ctx.key==='veiculos' && typeof schemas!=='undefined') schemas.veiculos=[['placa','Placa','text'],['modelo','Modelo','text'],['ano','Ano','number'],['status','Status','select:ativo,manutencao,inativo']];
      const r=await oldSaveModal2.apply(this,arguments);
      sanitizeVehicles();
      return r;
    };
    try{ saveModal=window.saveModal; }catch(e){}
  }
  sanitizeVehicles();
})();

(function(){
  window.selectedVehicleStatus = window.selectedVehicleStatus || 'todos';
  function statusNorm(v){
    v=String(v||'ativo').toLowerCase().trim();
    if(['manutencao','manutenção','em manutencao','em manutenção'].includes(v)) return 'manutencao';
    if(['inativo','baixado','parado'].includes(v)) return 'inativo';
    return 'ativo';
  }
  function statusLabel(v){
    v=statusNorm(v);
    if(v==='manutencao') return 'Em manutenção';
    if(v==='inativo') return 'Inativo';
    return 'Ativo';
  }
  function statusTagVeiculo(v){
    v=statusNorm(v);
    if(typeof statusTag==='function') return statusTag(v);
    const cls=v==='manutencao'?'amber':(v==='inativo'?'red':'green');
    return `<span class="tag ${cls}">${statusLabel(v)}</span>`;
  }
  function vehicleRows(rows){
    return rows.map(r=>`<tr>
      <td><span class="plate">${esc(r.placa)}</span></td>
      <td>${esc(r.renavam||'-')}</td>
      <td>${esc(r.modelo||'-')}</td>
      <td>${esc(r.motorista||'-')}</td>
      <td>${statusTagVeiculo(r.status)}</td>
      <td class="row-actions"><button class="icon-btn" title="Editar" onclick="openForm('veiculos',${r.id})">✎</button><button class="icon-btn" title="Excluir" onclick="removeItem('veiculos',${r.id})">×</button></td>
    </tr>`).join('');
  }
  function vehicleTable(title, rows, hint){
    return table(`<span class="vehicle-section-title">${title} <span class="tag gray">${rows.length}</span></span>`, ['Placa','Renavam','Modelo','Motorista','Status','Ações'], vehicleRows(rows) || `<tr><td colspan="6"><div class="empty">${hint}</div></td></tr>`);
  }
  window.setVehicleStatusFilter=function(v){
    window.selectedVehicleStatus=v||'todos';
    if(typeof renderVeiculosList==='function') renderVeiculosList();
  };
  window.render_veiculos=function(){
    setActions('<button class="btn primary" onclick="openForm(\'veiculos\')">+ Novo veículo</button>');
    const total=data.veiculos.length;
    const ativos=data.veiculos.filter(x=>statusNorm(x.status)==='ativo').length;
    const manut=data.veiculos.filter(x=>statusNorm(x.status)==='manutencao').length;
    const inativos=data.veiculos.filter(x=>statusNorm(x.status)==='inativo').length;
    document.getElementById('veiculos').innerHTML=
      stats([['Veículos',total,'frota cadastrada'],['Ativos',ativos,'operando'],['Em manutenção',manut,'separados'],['Inativos',inativos,'fora de operação']])+
      `<div class="filters">
        <div class="filter-row two">
          <input id="veiSearch" placeholder="Buscar placa, modelo, renavam, motorista ou status...">
          <select id="veiStatusSelect">
            <option value="todos">Todos os veículos</option>
            <option value="ativo">Somente ativos</option>
            <option value="manutencao">Somente em manutenção</option>
            <option value="inativo">Somente inativos</option>
          </select>
        </div>
        <div class="vehicle-status-note">
          <span>Separação automática pelo campo Status:</span>
          <span class="tag green">Ativo</span>
          <span class="tag amber">Em manutenção</span>
          <span class="tag red">Inativo</span>
        </div>
      </div>
      <div class="vehicle-status-tabs">
        <button class="btn" data-vtab="todos" onclick="setVehicleStatusFilter('todos')">Todos</button>
        <button class="btn" data-vtab="ativo" onclick="setVehicleStatusFilter('ativo')">Ativos</button>
        <button class="btn" data-vtab="manutencao" onclick="setVehicleStatusFilter('manutencao')">Em manutenção</button>
        <button class="btn" data-vtab="inativo" onclick="setVehicleStatusFilter('inativo')">Inativos</button>
      </div>
      <div id="veiculosTable"></div>`;
    document.getElementById('veiSearch').oninput=renderVeiculosList;
    document.getElementById('veiStatusSelect').value=window.selectedVehicleStatus||'todos';
    document.getElementById('veiStatusSelect').onchange=e=>setVehicleStatusFilter(e.target.value);
    renderVeiculosList();
  };
  window.renderVeiculosList=function(){
    const input=document.getElementById('veiSearch');
    const q=clean(input?input.value:'');
    const selected=window.selectedVehicleStatus||'todos';
    document.querySelectorAll('[data-vtab]').forEach(b=>b.classList.toggle('active',b.dataset.vtab===selected));
    const sel=document.getElementById('veiStatusSelect'); if(sel && sel.value!==selected) sel.value=selected;
    let rows=(data.veiculos||[]).filter(r=>!q||clean(Object.values(r).join(' ')).includes(q));
    if(selected!=='todos') rows=rows.filter(r=>statusNorm(r.status)===selected);
    const ativos=rows.filter(r=>statusNorm(r.status)==='ativo');
    const manut=rows.filter(r=>statusNorm(r.status)==='manutencao');
    const inativos=rows.filter(r=>statusNorm(r.status)==='inativo');
    let html='';
    if(selected==='todos'){
      html=`<div class="vehicle-split-grid">${vehicleTable('Veículos ativos',ativos,'Nenhum veículo ativo encontrado.')}${vehicleTable('Veículos em manutenção',manut,'Nenhum veículo em manutenção encontrado.')}${inativos.length?vehicleTable('Veículos inativos',inativos,''):''}</div>`;
    }else if(selected==='ativo') html=vehicleTable('Veículos ativos',ativos,'Nenhum veículo ativo encontrado.');
    else if(selected==='manutencao') html=vehicleTable('Veículos em manutenção',manut,'Nenhum veículo em manutenção encontrado.');
    else html=vehicleTable('Veículos inativos',inativos,'Nenhum veículo inativo encontrado.');
    const target=document.getElementById('veiculosTable'); if(target) target.innerHTML=html;
  };
})();

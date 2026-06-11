(function(){
  const oldRenderManutencoes = window.render_manutencoes || render_manutencoes;
  const oldRenderManList = window.renderManList || renderManList;
  const oldOpenFormMan = window.openForm;
  const oldSaveModalMan = window.saveModal;
  const oldCloseModalMan = window.closeModal;

  function uniqueManMonths(){
    const saved=(data.manutencoesMeses||[]).map(x=>typeof x==='string'?x:x.mes).filter(Boolean);
    const fromRows=(data.manutencoes||[]).map(r=>ym(r.data)).filter(Boolean);
    const all=[...new Set([...saved,...fromRows])].filter(m=>/^\d{4}-\d{2}$/.test(m)).sort();
    data.manutencoesMeses=all.map(m=>({mes:m}));
    return all;
  }
  function ensureManMonth(m){
    if(!/^\d{4}-\d{2}$/.test(m||'')) return false;
    const months=uniqueManMonths();
    if(!months.includes(m)) data.manutencoesMeses.push({mes:m});
    return true;
  }
  function rowsManMonth(m){return (data.manutencoes||[]).filter(r=>!m||ym(r.data)===m)}
  function safeMonthDate(oldDate,newMes){
    const day=/^\d{4}-\d{2}-\d{2}$/.test(oldDate||'')?oldDate.slice(8,10):'01';
    const last=new Date(Number(newMes.slice(0,4)), Number(newMes.slice(5,7)), 0).getDate();
    return `${newMes}-${String(Math.min(Number(day)||1,last)).padStart(2,'0')}`;
  }

  window.openAddManMonth=function(){
    const m=prompt('Digite a pasta no formato AAAA-MM:', selectedManMonth || new Date().toISOString().slice(0,7));
    if(m===null) return;
    if(!/^\d{4}-\d{2}$/.test(m)){alert('Use o formato AAAA-MM.');return;}
    ensureManMonth(m);
    selectedManMonth=m;
    toast('Pasta de manutenção criada.');
    render_manutencoes();
  };

  window.editManMonth=function(oldMes){
    if(!oldMes){alert('A pasta "Todos os meses" não pode ser editada.');return;}
    const novo=prompt('Editar pasta/mês:', oldMes);
    if(novo===null) return;
    if(!/^\d{4}-\d{2}$/.test(novo)){alert('Use o formato AAAA-MM.');return;}
    if(novo===oldMes) return;
    const qtd=rowsManMonth(oldMes).length;
    const ok=confirm(`Mover ${qtd} manutenção(ões) de ${monthName(oldMes)} para ${monthName(novo)}?`);
    if(!ok) return;
    data.manutencoes.forEach(r=>{ if(ym(r.data)===oldMes) r.data=safeMonthDate(r.data,novo); });
    data.manutencoesMeses=(data.manutencoesMeses||[]).filter(x=>(typeof x==='string'?x:x.mes)!==oldMes);
    ensureManMonth(novo);
    selectedManMonth=novo;
    toast('Pasta de manutenção editada.');
    render_manutencoes();
  };

  window.deleteManMonth=function(mes){
    if(!mes){alert('A pasta "Todos os meses" não pode ser excluída.');return;}
    const qtd=rowsManMonth(mes).length;
    if(!confirm(`Excluir a pasta ${monthName(mes)} e ${qtd} manutenção(ões) dentro dela?`)) return;
    data.manutencoes=data.manutencoes.filter(r=>ym(r.data)!==mes);
    data.manutencoesMeses=(data.manutencoesMeses||[]).filter(x=>(typeof x==='string'?x:x.mes)!==mes);
    if(selectedManMonth===mes) selectedManMonth='';
    toast('Pasta de manutenção excluída.');
    render_manutencoes();
  };

  window.manutencoesFoldersHtml=function(){
    const meses=uniqueManMonths();
    const folders=['',...meses];
    return `<div class="folders">${folders.map(m=>{
      const rows=rowsManMonth(m);
      const total=rows.reduce((s,r)=>s+Number(r.valor||0),0);
      const unique=new Set(rows.map(r=>r.placa).filter(Boolean)).size;
      return `<div class="folder editable-folder ${selectedManMonth===m?'active':''}">
        <div class="folder-main" onclick="selectManMonth('${m}')">
          <div class="folder-icon">📁</div>
          <strong>${m?monthName(m):'Todos os meses'}<span class="folder-count">${rows.length}</span></strong>
          <small>${rows.length} registros • ${unique} veículos</small>
          <small class="warn">Total: ${BRL(total)}</small>
        </div>
        ${m?`<div class="folder-card-actions"><button class="icon-btn" title="Editar pasta" onclick="event.stopPropagation();editManMonth('${m}')">✎</button><button class="icon-btn danger" title="Excluir pasta" onclick="event.stopPropagation();deleteManMonth('${m}')">×</button></div>`:''}
      </div>`;
    }).join('')}</div>`;
  };

  window.render_manutencoes=function(){
    uniqueManMonths();
    setActions('<button class="btn" onclick="openAddManMonth()">+ Pasta/mês</button><button class="btn primary" onclick="openForm(\'manutencoes\')">+ Nova manutenção</button>');
    const rows=rowsManMonth(selectedManMonth);
    const total=rows.reduce((s,r)=>s+Number(r.valor||0),0);
    const ticket=rows.length?total/rows.length:0;
    document.getElementById('manutencoes').innerHTML=stats([
      ['Registros',rows.length,selectedManMonth?'no mês selecionado':'total de serviços'],
      ['Valor',BRL(total),selectedManMonth?'total do mês':'total geral'],
      ['Ticket médio',BRL(ticket),'valor médio por serviço'],
      ['Selecionado',selectedManMonth?monthName(selectedManMonth):'Todos','pasta atual']
    ])+manutencoesFoldersHtml()+filterHtml('manSearch','Buscar placa, tipo, origem ou descrição...')+`<div id="manTable"></div>`;
    document.getElementById('manSearch').oninput=renderManList;
    renderManList();
  };

  window.openForm=function(key,itemId=null){
    if(key!=='manutencoes') return oldOpenFormMan(key,itemId);
    modalCtx={key,itemId};
    const selected=selectedManMonth||'';
    const item=itemId?(data.manutencoes.find(x=>x.id===itemId)||{}):{data:selected?selected+'-01':'',placa:'',tipo:'',origem:'',descricao:'',valor:0,status:'concluido',anexo:''};
    const itemMes=ym(item.data)||selected;
    const months=[...new Set([itemMes,selected,...uniqueManMonths()].filter(Boolean))];
    document.getElementById('modalTitle').textContent=(itemId?'Editar manutenção':'Adicionar manutenção');
    document.querySelector('#modalBg .modal')?.classList.add('manutencao-modal');
    document.getElementById('modalBody').innerHTML=`<div class="form-grid">
      <div class="man-help">Cadastro de manutenção<span>Escolha a pasta/mês e preencha a data do serviço. Ao mudar a pasta, o registro entra automaticamente no mês selecionado.</span></div>
      <div class="field"><label>Pasta/Mês</label><select id="f_man_mes"><option value="">Usar mês da data</option>${months.map(m=>`<option value="${esc(m)}" ${itemMes===m?'selected':''}>${monthName(m)}</option>`).join('')}</select></div>
      <div class="field"><label>Data</label><input id="f_data" type="date" value="${esc(item.data||'')}"></div>
      <div class="field"><label>Placa</label><input id="f_placa" type="text" value="${esc(item.placa||'')}" placeholder="Ex.: ABC1D23"></div>
      <div class="field"><label>Tipo/peça</label><input id="f_tipo" type="text" value="${esc(item.tipo||'')}"></div>
      <div class="field"><label>Origem</label><input id="f_origem" type="text" value="${esc(item.origem||'')}"></div>
      <div class="field"><label>Valor</label><input id="f_valor" type="number" step="0.01" value="${esc(item.valor||0)}"></div>
      <div class="field"><label>Status</label><select id="f_status"><option value="concluido" ${String(item.status||'concluido')==='concluido'?'selected':''}>Concluído</option><option value="pendente" ${String(item.status||'')==='pendente'?'selected':''}>Pendente</option></select></div>
      <div class="field full"><label>Descrição</label><textarea id="f_descricao" placeholder="Descreva o serviço realizado">${esc(item.descricao||'')}</textarea></div>
      <div class="field full"><label>Anexo/Comprovante</label><input id="f_anexo" type="text" placeholder="Cole um link ou nome do arquivo" value="${esc(item.anexo||'')}"></div>
    </div>`;
    document.getElementById('modalBg').classList.add('open');
  };

  window.saveModal=async function(){
    if(!modalCtx || modalCtx.key!=='manutencoes') return oldSaveModalMan();
    const itemId=modalCtx.itemId;
    const obj=itemId?(data.manutencoes.find(x=>x.id===itemId)||{}):{id:id()};
    let dataServico=document.getElementById('f_data').value;
    const mesEscolhido=document.getElementById('f_man_mes').value;
    if(mesEscolhido){ dataServico=safeMonthDate(dataServico||`${mesEscolhido}-01`,mesEscolhido); }
    obj.data=dataServico;
    obj.placa=(document.getElementById('f_placa').value||'').toUpperCase();
    obj.tipo=document.getElementById('f_tipo').value;
    obj.origem=document.getElementById('f_origem').value;
    obj.descricao=document.getElementById('f_descricao').value;
    obj.valor=Number(document.getElementById('f_valor').value||0);
    obj.status=document.getElementById('f_status').value;
    obj.anexo=document.getElementById('f_anexo').value;
    const m=ym(obj.data);
    if(!m){alert('Preencha a data ou escolha uma pasta/mês.');return;}
    ensureManMonth(m);
    if(!itemId) data.manutencoes.push(obj);
    selectedManMonth=m;
    closeModal();
    toast('Manutenção salva.');
    showPage(currentPage);
  };

  window.closeModal=function(){
    document.querySelector('#modalBg .modal')?.classList.remove('manutencao-modal');
    oldCloseModalMan();
  };
})();

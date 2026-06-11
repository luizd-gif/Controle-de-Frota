/* Ajustes: editar/excluir pastas de Produção do Dia + formulário de lançamento melhorado. */
(function(){
  const oldOpenForm = window.openForm || openForm;
  const oldCloseModal = window.closeModal || closeModal;
  const oldSaveModal = window.saveModal || saveModal;

  function prodMonths(){
    const fromFolders=(data.producaoMeses||[]).map(x=>String(x.mes||'')).filter(Boolean);
    const fromRows=(data.producao||[]).map(x=>String(x.mes||ym(x.data)||'')).filter(Boolean);
    return [...new Set([...fromFolders,...fromRows])].filter(m=>/^\d{4}-\d{2}$/.test(m)).sort();
  }
  function ensureMonth(m){
    if(/^\d{4}-\d{2}$/.test(m||'') && !data.producaoMeses.some(x=>x.mes===m)){
      data.producaoMeses.push({mes:m});
    }
  }
  function monthInputValue(){
    const d=new Date(), mm=String(d.getMonth()+1).padStart(2,'0');
    return `${d.getFullYear()}-${mm}`;
  }

  window.render_producao=function(){
    setActions('<button class="btn" onclick="openAddMonth()">+ Nova pasta</button><button class="btn primary" onclick="openForm(\'producao\')">+ Adicionar dia</button>');
    const months=prodMonths();
    const selected=(typeof folderSel!=='undefined' ? folderSel.producao : selectedProdMonth)||'';
    const rowsSel=data.producao.filter(r=>!selected||r.mes===selected);
    document.getElementById('producao').innerHTML=
      stats([
        ['Pastas',months.length,'meses'],
        ['Lançamentos',data.producao.length,'registros'],
        ['Veículos únicos',new Set(data.producao.map(x=>x.placa)).size,'sem duplicar placa'],
        ['Selecionado',selected?monthName(selected):'Todos','pasta atual']
      ])+
      `<div class="prod-folder-create"><small>Selecione uma pasta para filtrar. Use ✎ para renomear e × para excluir pastas criadas.</small><button class="btn" onclick="openAddMonth()">+ Criar pasta</button></div>`+
      `<div class="prod-folder-grid">
        <div class="prod-folder-card ${!selected?'active':''}">
          <button class="prod-folder-main" onclick="selectProdFolder('')"><div class="folder-icon">📁</div><strong>Todos os meses</strong><small>${data.producao.length} lançamentos • ${new Set(data.producao.map(r=>r.placa)).size} veículos únicos</small></button>
        </div>
        ${months.map(m=>{
          const rows=data.producao.filter(r=>r.mes===m), unique=new Set(rows.map(r=>r.placa)).size;
          return `<div class="prod-folder-card ${selected===m?'active':''}">
            <button class="prod-folder-main" onclick="selectProdFolder('${m}')"><div class="folder-icon">📁</div><strong>${monthName(m)}</strong><small>${rows.length} lançamentos • ${unique} veículos únicos</small></button>
            <div class="prod-folder-tools"><button class="icon-btn" title="Editar pasta" onclick="editProdMonth('${m}')">✎</button><button class="icon-btn danger" title="Excluir pasta" onclick="deleteProdMonth('${m}')">×</button></div>
          </div>`;
        }).join('')}
      </div>`+
      filterHtml('prodSearch','Buscar placa, serviço, responsável...')+`<div id="prodInfo"></div>`;
    const input=document.getElementById('prodSearch'); if(input) input.oninput=renderProdInfo;
    renderProdInfo();
  };

  window.selectProdFolder=function(m){
    if(typeof folderSel!=='undefined') folderSel.producao=m;
    selectedProdMonth=m;
    render_producao();
    setTimeout(()=>document.getElementById('prodInfo')?.scrollIntoView({behavior:'smooth',block:'start'}),40);
  };
  window.selectProdMonth=window.selectProdFolder;

  window.renderProdInfo=function(){
    const selected=(typeof folderSel!=='undefined' ? folderSel.producao : selectedProdMonth)||'';
    const q=clean(document.getElementById('prodSearch')?.value||'');
    const rows=data.producao
      .filter(r=>(!selected||r.mes===selected)&&(!q||clean(Object.values(r).join(' ')).includes(q)))
      .sort((a,b)=>String(b.data||'').localeCompare(String(a.data||''))||Number(b.id||0)-Number(a.id||0));
    const el=document.getElementById('prodInfo'); if(!el) return;
    el.innerHTML=table(selected?`Produção — ${monthName(selected)}`:'Produção — Todos os meses',
      ['Data','Pasta/Mês','Placa','Serviço','Responsável','Observação','Anexo','Ações'],
      rows.map(r=>`<tr><td>${fmtDate(r.data)}</td><td>${monthName(r.mes)}</td><td><span class="plate">${esc(r.placa||'-')}</span></td><td>${esc(r.servico||'-')}</td><td>${esc(r.responsavel||'-')}</td><td>${esc(r.obs||'-')}</td><td>${r.anexo?`<button class="icon-btn" onclick="window.open('${esc(r.anexo)}','_blank')">↗</button>`:'-'}</td><td class="row-actions"><button class="icon-btn" onclick="openForm('producao',${r.id})">✎</button><button class="icon-btn" onclick="removeItem('producao',${r.id})">×</button></td></tr>`).join(''));
  };

  window.openAddMonth=function(){
    const m=prompt('Digite o mês da pasta no formato AAAA-MM:', (typeof folderSel!=='undefined' && folderSel.producao) || selectedProdMonth || monthInputValue());
    if(m===null) return;
    if(!/^\d{4}-\d{2}$/.test(m)){alert('Use o formato AAAA-MM, por exemplo: 2026-06.');return;}
    ensureMonth(m);
    if(typeof folderSel!=='undefined') folderSel.producao=m;
    selectedProdMonth=m;
    toast('Pasta criada.');
    render_producao();
  };

  window.editProdMonth=function(oldMes){
    const novo=prompt('Novo mês da pasta no formato AAAA-MM:', oldMes);
    if(novo===null) return;
    if(!/^\d{4}-\d{2}$/.test(novo)){alert('Use o formato AAAA-MM, por exemplo: 2026-06.');return;}
    if(novo===oldMes) return;
    if(prodMonths().includes(novo) && !confirm('Já existe uma pasta com esse mês. Deseja juntar os lançamentos nela?')) return;
    data.producao.forEach(r=>{ if(r.mes===oldMes) r.mes=novo; });
    data.producaoMeses=(data.producaoMeses||[]).filter(x=>x.mes!==oldMes);
    ensureMonth(novo);
    if(typeof folderSel!=='undefined' && folderSel.producao===oldMes) folderSel.producao=novo;
    if(selectedProdMonth===oldMes) selectedProdMonth=novo;
    toast('Pasta atualizada.');
    render_producao();
  };

  window.deleteProdMonth=function(mes){
    const qtd=data.producao.filter(r=>r.mes===mes).length;
    const msg=qtd ? `Esta pasta tem ${qtd} lançamento(s). Excluir a pasta também removerá esses lançamentos. Continuar?` : 'Excluir esta pasta?';
    if(!confirm(msg)) return;
    data.producao=data.producao.filter(r=>r.mes!==mes);
    data.producaoMeses=(data.producaoMeses||[]).filter(x=>x.mes!==mes);
    if(typeof folderSel!=='undefined' && folderSel.producao===mes) folderSel.producao='';
    if(selectedProdMonth===mes) selectedProdMonth='';
    toast('Pasta excluída.');
    render_producao();
  };

  window.openForm=function(key,itemId=null){
    if(key!=='producao') return oldOpenForm(key,itemId);
    modalCtx={key,itemId};
    const selected=(typeof folderSel!=='undefined' ? folderSel.producao : selectedProdMonth)||'';
    const item=itemId?(data.producao.find(x=>x.id===itemId)||{}):{mes:selected,data:'',placa:'',servico:'',responsavel:'',obs:'',anexo:''};
    const months=prodMonths();
    const opts=[...new Set([item.mes,selected,...months].filter(Boolean))];
    document.getElementById('modalTitle').textContent=(itemId?'Editar lançamento':'Adicionar produção do dia');
    document.querySelector('#modalBg .modal')?.classList.add('producao-modal');
    document.getElementById('modalBody').innerHTML=`<div class="form-grid">
      <div class="producao-help">Lançamento da produção do dia<span>A pasta/mês agora é uma seleção. Se deixar em branco, o sistema usa automaticamente o mês da data informada.</span></div>
      <div class="field"><label>Pasta/Mês</label><select id="f_mes"><option value="">Usar mês da data</option>${opts.map(m=>`<option value="${esc(m)}" ${String(item.mes||selected)===m?'selected':''}>${monthName(m)}</option>`).join('')}</select></div>
      <div class="field"><label>Data</label><input id="f_data" type="date" value="${esc(item.data||'')}"></div>
      <div class="field"><label>Placa</label><input id="f_placa" type="text" placeholder="Ex.: ABC1D23" value="${esc(item.placa||'')}"></div>
      <div class="field"><label>Responsável</label><input id="f_responsavel" type="text" value="${esc(item.responsavel||'')}"></div>
      <div class="field full"><label>Serviço</label><textarea id="f_servico" placeholder="Descreva o serviço feito no dia">${esc(item.servico||'')}</textarea></div>
      <div class="field full"><label>Observação</label><textarea id="f_obs" placeholder="Informações extras, origem do lançamento etc.">${esc(item.obs||'')}</textarea></div>
      <div class="field full"><label>Anexo/Comprovante</label><input id="f_anexo" type="text" placeholder="Cole um link ou nome do arquivo" value="${esc(item.anexo||'')}"></div>
    </div>`;
    document.getElementById('modalBg').classList.add('open');
  };

  window.saveModal=async function(){
    if(!modalCtx || modalCtx.key!=='producao') return oldSaveModal();
    const itemId=modalCtx.itemId;
    const obj=itemId?(data.producao.find(x=>x.id===itemId)||{}):{id:id()};
    obj.data=document.getElementById('f_data').value;
    obj.mes=document.getElementById('f_mes').value || ym(obj.data);
    obj.placa=(document.getElementById('f_placa').value||'').toUpperCase();
    obj.responsavel=document.getElementById('f_responsavel').value;
    obj.servico=document.getElementById('f_servico').value;
    obj.obs=document.getElementById('f_obs').value;
    obj.anexo=document.getElementById('f_anexo').value;
    if(!/^\d{4}-\d{2}$/.test(obj.mes||'')){alert('Informe a pasta/mês ou preencha a data para o sistema definir o mês.');return;}
    ensureMonth(obj.mes);
    if(!itemId) data.producao.push(obj);
    if(typeof folderSel!=='undefined') folderSel.producao=obj.mes;
    selectedProdMonth=obj.mes;
    closeModal();
    toast('Produção salva.');
    showPage(currentPage);
  };

  window.closeModal=function(){
    document.querySelector('#modalBg .modal')?.classList.remove('producao-modal');
    oldCloseModal();
  };
})();

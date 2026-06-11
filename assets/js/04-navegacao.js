(function(){
  const DEFECT_PDF_ARCHIVES = [
    {mes:'2026-01', nome:'Janeiro', arquivo:'formularios_defeito_arquivos/Janeiro_Completo.pdf', paginas:1},
    {mes:'2026-04', nome:'Abril', arquivo:'formularios_defeito_arquivos/Abril_Completo.pdf', paginas:22},
    {mes:'2026-05', nome:'Maio', arquivo:'formularios_defeito_arquivos/Maio_Completo.pdf', paginas:37},
    {mes:'2026-06', nome:'Junho', arquivo:'formularios_defeito_arquivos/Junho_Completo.pdf', paginas:5}
  ];
  if(!document.getElementById('formularios_defeito')){
    const main=document.querySelector('main.content');
    const sec=document.createElement('section');
    sec.id='formularios_defeito';
    sec.className='page';
    main.appendChild(sec);
  }
  if(typeof pages!=='undefined' && !pages.some(p=>p[0]==='formularios_defeito')){
    const ix=pages.findIndex(p=>p[0]==='manutencoes');
    const item=['formularios_defeito','Formulários de Defeito (em construção)','Registro dos relatórios de defeito dos caminhões — em construção'];
    if(ix>=0) pages.splice(ix+1,0,item); else pages.push(item);
  }
  if(typeof data!=='undefined' && !Array.isArray(data.formularios_defeito)) data.formularios_defeito=[];
  if(typeof schemas!=='undefined'){
    schemas.formularios_defeito=[
      ['data','Data do relatório','date'],
      ['mes','Pasta/Mês AAAA-MM','text'],
      ['placa','Placa','text'],
      ['motorista','Motorista','text'],
      ['defeito','Defeito relatado','text'],
      ['localizacao','Local/Componente','text'],
      ['gravidade','Gravidade','select:Baixa,Média,Alta,Crítica'],
      ['status','Status','select:aberto,em_analise,em_manutencao,resolvido'],
      ['responsavel','Responsável','text'],
      ['observacao','Observação','text'],
      ['anexo','Anexo/Link','text']
    ];
  }
  function defectStatusNice(v){return ({aberto:'Aberto',em_analise:'Em análise',em_manutencao:'Em manutenção',resolvido:'Resolvido'})[String(v||'').toLowerCase()]||statusNice(v||'aberto');}
  window.defectStatusTag=function(v){const s=String(v||'aberto').toLowerCase();const c=s==='resolvido'?'green':s==='em_manutencao'?'blue':s==='em_analise'?'amber':'red';return `<span class="tag ${c}">${esc(defectStatusNice(s))}</span>`;};
  window.defectSeverityTag=function(v){const s=clean(v||'Baixa');const c=s.includes('crit')?'risk-critical':s.includes('alta')?'red':s.includes('media')?'amber':'green';return `<span class="tag ${c}">${esc(v||'Baixa')}</span>`;};
  window.defectMonthFolders=function(){
    const meses=[...new Set([...(data.formularios_defeito||[]).map(r=>r.mes||ym(r.data)).filter(Boolean),...DEFECT_PDF_ARCHIVES.map(x=>x.mes)])].sort();
    const sel=window.selectedDefectMonth||'';
    return `<div class="folder-actions"><button class="btn ${!sel?'primary':''}" onclick="selectDefectMonth('')">Todos</button><small>${meses.length} pastas de formulários</small></div><div class="folders">${meses.map(m=>{const regs=(data.formularios_defeito||[]).filter(r=>(r.mes||ym(r.data))===m).length;const arq=DEFECT_PDF_ARCHIVES.find(x=>x.mes===m);return `<button class="folder ${sel===m?'active':''}" onclick="selectDefectMonth('${m}')"><div class="folder-icon">📋</div><strong>${monthName(m)} <span class="folder-count">${regs}</span></strong><small>${regs} registros cadastrados</small>${arq?`<small class="warn">PDF importado • ${arq.paginas} pág.</small>`:''}</button>`}).join('')}</div>`;
  };
  window.selectDefectMonth=function(m){window.selectedDefectMonth=m;render_formularios_defeito();setTimeout(()=>document.getElementById('defeitosList')?.scrollIntoView({behavior:'smooth',block:'start'}),40)};
  window.render_formularios_defeito=function(){
    setActions('<button class="btn" onclick="exportCSV(\'formularios_defeito\')">Exportar CSV</button><button class="btn primary" onclick="openForm(\'formularios_defeito\')">+ Novo relatório</button>');
    const arr=data.formularios_defeito||[];
    const abertos=arr.filter(x=>String(x.status||'aberto')!=='resolvido').length;
    const criticos=arr.filter(x=>clean(x.gravidade).includes('crit')||clean(x.gravidade).includes('alta')).length;
    document.getElementById('formularios_defeito').innerHTML=stats([
      ['Relatórios',arr.length,'registros cadastrados'],
      ['Em aberto',abertos,'pendentes'],
      ['Alta/Critica',criticos,'prioridade'],
      ['Arquivos',DEFECT_PDF_ARCHIVES.length,'PDFs mensais']
    ])+defectMonthFolders()+filterHtml('defSearch','Buscar placa, motorista, defeito, status...')+`<div class="table-card"><div class="table-head"><h3>Arquivos mensais importados</h3><small>Relatórios em PDF que você enviou</small></div><div class="defect-archive-grid">${DEFECT_PDF_ARCHIVES.map(a=>`<a class="defect-file-card" href="${a.arquivo}" target="_blank"><b>📄 ${a.nome}</b><small>${monthName(a.mes)} • ${a.paginas} página(s)</small><span>Abrir PDF</span></a>`).join('')}</div></div><div id="defeitosList"></div>`;
    const s=document.getElementById('defSearch'); if(s) s.oninput=renderDefeitosList; renderDefeitosList();
  };
  window.renderDefeitosList=function(){
    const q=clean(document.getElementById('defSearch')?.value||''); const sel=window.selectedDefectMonth||'';
    const rows=(data.formularios_defeito||[]).filter(r=>(!sel||(r.mes||ym(r.data))===sel)&&(!q||clean(Object.values(r).join(' ')).includes(q))).sort((a,b)=>String(b.data||'').localeCompare(String(a.data||''))||Number(b.id||0)-Number(a.id||0));
    document.getElementById('defeitosList').innerHTML=table(sel?`Formulários de Defeito — ${monthName(sel)}`:'Formulários de Defeito — Todos os meses',['Data','Placa','Motorista','Defeito','Local/Componente','Gravidade','Status','Responsável','Ações'],rows.map(r=>`<tr><td>${fmtDate(r.data)}</td><td><span class="plate">${esc(r.placa||'-')}</span></td><td>${esc(r.motorista||'-')}</td><td>${esc(r.defeito||'-')}</td><td>${esc(r.localizacao||'-')}</td><td>${defectSeverityTag(r.gravidade)}</td><td>${defectStatusTag(r.status)}</td><td>${esc(r.responsavel||'-')}</td><td class="row-actions">${r.anexo?`<button class="icon-btn" onclick="window.open('${esc(r.anexo)}','_blank')">↗</button>`:''}<button class="icon-btn" onclick="openForm('formularios_defeito',${r.id})">✎</button><button class="icon-btn" onclick="removeItem('formularios_defeito',${r.id})">×</button></td></tr>`).join(''));
  };
  window.defeitoFromDb=function(row){return {id:Number(row.id),data:row.data||'',mes:row.mes||ym(row.data)||'',placa:row.placa||'',motorista:row.motorista||'',defeito:row.defeito||'',localizacao:row.localizacao||'',gravidade:row.gravidade||'Baixa',status:row.status||'aberto',responsavel:row.responsavel||'',observacao:row.observacao||'',anexo:row.anexo||''};};
  window.defeitoToDb=function(r){return {id:Number(r.id),data:r.data||null,mes:r.mes||ym(r.data)||'',placa:r.placa||'',motorista:r.motorista||'',defeito:r.defeito||'',localizacao:r.localizacao||'',gravidade:r.gravidade||'Baixa',status:r.status||'aberto',responsavel:r.responsavel||'',observacao:r.observacao||'',anexo:r.anexo||''};};
  window.carregarDefeitosSupabase=async function(){const db=connectSupabase(); if(!db) return; try{const {data:rows,error}=await db.from('formularios_defeito').select('*').order('data',{ascending:false}); if(error) throw error; data.formularios_defeito=(rows||[]).map(defeitoFromDb); if(currentPage==='formularios_defeito') render_formularios_defeito(); renderNav();}catch(e){console.warn('Tabela formularios_defeito ainda não disponível ou sem permissão:',e.message||e);}};
  window.salvarDefeitoSupabase=async function(obj){const db=connectSupabase(); if(!db) return false; const payload=defeitoToDb(obj); const {data:row,error}=await db.from('formularios_defeito').upsert(payload,{onConflict:'id'}).select().single(); if(error) throw error; Object.assign(obj,defeitoFromDb(row)); return true;};
  window.removerDefeitoSupabase=async function(itemId){const db=connectSupabase(); if(!db) return false; const {error}=await db.from('formularios_defeito').delete().eq('id',itemId); if(error) throw error; return true;};
  const oldSaveModal = window.saveModal || saveModal;
  window.saveModal = saveModal = async function(){
    if(!modalCtx || modalCtx.key!=='formularios_defeito') return oldSaveModal.apply(this,arguments);
    const {key,itemId}=modalCtx; const obj=itemId?(data[key].find(x=>x.id===itemId)||{}):{id:id()};
    schemas[key].forEach(([prop,,type])=>{let v=document.getElementById('f_'+prop).value; if(type==='number') v=Number(v||0); if(prop==='placa') v=v.toUpperCase(); obj[prop]=v;});
    if(!obj.mes) obj.mes=ym(obj.data);
    try{ await salvarDefeitoSupabase(obj); if(!itemId && !data[key].some(x=>x.id===obj.id)) data[key].push(obj); closeModal(); toast('Formulário de defeito salvo.'); showPage(currentPage);}catch(e){console.error(e); alert('Erro ao salvar formulário de defeito: '+(e.message||e));}
  };
  const oldRemoveItem = window.removeItem || removeItem;
  window.removeItem = removeItem = async function(key,itemId){
    if(key!=='formularios_defeito') return oldRemoveItem.apply(this,arguments);
    if(!confirm('Excluir este relatório de defeito?')) return;
    try{ await removerDefeitoSupabase(itemId); data.formularios_defeito=data.formularios_defeito.filter(x=>x.id!==itemId); toast('Relatório de defeito removido.'); showPage(currentPage);}catch(e){console.error(e); alert('Erro ao excluir relatório de defeito: '+(e.message||e));}
  };
  const oldLabelKey = window.labelKey || labelKey;
  window.labelKey = labelKey = function(k){return k==='formularios_defeito'?'formulário de defeito':oldLabelKey(k);};
  const style=document.createElement('style'); style.textContent=`
    .defect-archive-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px;padding:14px}.defect-file-card{display:block;text-decoration:none;color:var(--text);border:1px solid var(--line);border-radius:16px;padding:14px;background:var(--panel2);box-shadow:0 6px 18px rgba(15,23,42,.05)}.defect-file-card:hover{border-color:#93c5fd;background:#f8fbff;transform:translateY(-1px)}.defect-file-card b{display:block;font-size:14px}.defect-file-card small{display:block;color:var(--muted);margin:5px 0 10px}.defect-file-card span{font-size:12px;font-weight:800;color:#1d4ed8}.tag.risk-critical{background:#7f1d1d!important;color:#fff!important}.tag.red{background:#fee2e2;color:#991b1b}.tag.amber{background:#fef3c7;color:#92400e}.tag.green{background:#dcfce7;color:#166534}.tag.blue{background:#dbeafe;color:#1d4ed8}`; document.head.appendChild(style);
  carregarDefeitosSupabase();
  renderNav();
})();

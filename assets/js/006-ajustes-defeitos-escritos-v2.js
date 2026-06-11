(function(){
  function statusText(v){return (typeof defectStatusNice==='function')?defectStatusNice(v):String(v||'Aberto');}
  function defectCard(r){
    const anexo=r.anexo?`<button class="icon-btn" onclick="window.open('${esc(r.anexo)}','_blank')">↗</button>`:'';
    return `<div class="defect-written-card">
      <div class="def-top"><h4><span class="plate">${esc(r.placa||'-')}</span> ${esc(r.defeito||'Defeito não informado')}</h4>${typeof defectSeverityTag==='function'?defectSeverityTag(r.gravidade):''}</div>
      <div class="defect-written-meta">
        <span><b>Data:</b> ${fmtDate(r.data)} ${r.mes?`• <b>Pasta:</b> ${esc(monthName(r.mes))}`:''}</span>
        <span><b>Motorista:</b> ${esc(r.motorista||'-')}</span>
        <span><b>Local/Componente:</b> ${esc(r.localizacao||'-')}</span>
        <span><b>Status:</b> ${typeof defectStatusTag==='function'?defectStatusTag(r.status):esc(statusText(r.status))}</span>
        <span><b>Responsável:</b> ${esc(r.responsavel||'-')}</span>
      </div>
      <p>${esc(r.observacao||'Sem observação adicional.')}</p>
      <div class="defect-written-actions">${anexo}<button class="icon-btn" onclick="openForm('formularios_defeito',${r.id})">✎</button><button class="icon-btn" onclick="removeItem('formularios_defeito',${r.id})">×</button></div>
    </div>`;
  }
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
    ])+defectMonthFolders()+filterHtml('defSearch','Buscar placa, motorista, defeito, status...')+
    `<div class="table-card"><div class="table-head"><h3>Registros escritos dos defeitos</h3><small>Resumo operacional parecido com Produção do Dia</small></div><div id="defeitosCards" class="defect-written-grid"></div></div>`+
    `<div class="table-card"><div class="table-head"><h3>Arquivos mensais importados</h3><small>Relatórios em PDF que você enviou</small></div><div class="defect-archive-grid">${DEFECT_PDF_ARCHIVES.map(a=>`<a class="defect-file-card" href="${a.arquivo}" target="_blank"><b>📄 ${a.nome}</b><small>${monthName(a.mes)} • ${a.paginas} página(s)</small><span>Abrir PDF</span></a>`).join('')}</div></div><div id="defeitosList"></div>`;
    const input=document.getElementById('defSearch'); if(input) input.oninput=renderDefeitosList; renderDefeitosList();
  };
  window.renderDefeitosList=function(){
    const q=clean(document.getElementById('defSearch')?.value||''); const sel=window.selectedDefectMonth||'';
    const rows=(data.formularios_defeito||[]).filter(r=>(!sel||(r.mes||ym(r.data))===sel)&&(!q||clean(Object.values(r).join(' ')).includes(q))).sort((a,b)=>String(b.data||'').localeCompare(String(a.data||''))||Number(b.id||0)-Number(a.id||0));
    const cards=document.getElementById('defeitosCards'); if(cards) cards.innerHTML=rows.length?rows.slice(0,12).map(defectCard).join(''):'<div class="empty">Nenhum formulário de defeito cadastrado para este filtro.</div>';
    const list=document.getElementById('defeitosList'); if(list) list.innerHTML=table(sel?`Formulários de Defeito — ${monthName(sel)}`:'Formulários de Defeito — Todos os meses',['Data','Placa','Motorista','Defeito','Local/Componente','Gravidade','Status','Responsável','Ações'],rows.map(r=>`<tr><td>${fmtDate(r.data)}</td><td><span class="plate">${esc(r.placa||'-')}</span></td><td>${esc(r.motorista||'-')}</td><td>${esc(r.defeito||'-')}</td><td>${esc(r.localizacao||'-')}</td><td>${defectSeverityTag(r.gravidade)}</td><td>${defectStatusTag(r.status)}</td><td>${esc(r.responsavel||'-')}</td><td class="row-actions">${r.anexo?`<button class="icon-btn" onclick="window.open('${esc(r.anexo)}','_blank')">↗</button>`:''}<button class="icon-btn" onclick="openForm('formularios_defeito',${r.id})">✎</button><button class="icon-btn" onclick="removeItem('formularios_defeito',${r.id})">×</button></td></tr>`).join(''));
  };
})();

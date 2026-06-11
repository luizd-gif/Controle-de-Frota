(function(){
  'use strict';
  function arr(key){ return (window.data && Array.isArray(window.data[key])) ? window.data[key] : []; }
  function safeEsc(v){ return (typeof esc === 'function') ? esc(v) : String(v ?? '').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function safeDate(v){ return (typeof fmtDate === 'function') ? fmtDate(v) : (v || '-'); }
  function safeMonth(v){ return (typeof monthName === 'function') ? monthName(v) : (v || 'Todos os meses'); }
  function safeBRL(v){ return (typeof BRL === 'function') ? BRL(v) : ('R$ ' + Number(v || 0).toFixed(2)); }
  function monthOf(d){ return (typeof ym === 'function') ? ym(d) : (/^\d{4}-\d{2}-\d{2}$/.test(d||'') ? String(d).slice(0,7) : ''); }
  function norm(v){ return (typeof clean === 'function') ? clean(v) : String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }
  function statusHtml(v){ return (typeof statusTag === 'function') ? statusTag(v) : `<span class="tag gray">${safeEsc(v || '-')}</span>`; }
  function statusText(v){ return (typeof statusNice === 'function') ? statusNice(v) : (v || '-'); }
  function makeTable(title, headers, rows){
    if(typeof table === 'function') return table(title, headers, rows);
    return `<div class="table-card"><div class="table-head"><h3>${safeEsc(title)}</h3><small>${rows ? 'Registros' : 'Sem registros'}</small></div><div class="table-scroll"><table><thead><tr>${headers.map(h=>`<th>${safeEsc(h)}</th>`).join('')}</tr></thead><tbody>${rows || ''}</tbody></table></div></div>`;
  }
  function manSelected(){
    try{ if(window.folderSel && typeof window.folderSel.manutencoes !== 'undefined') return window.folderSel.manutencoes || ''; }catch(e){}
    try{ if(typeof folderSel !== 'undefined' && folderSel && typeof folderSel.manutencoes !== 'undefined') return folderSel.manutencoes || ''; }catch(e){}
    try{ return selectedManMonth || ''; }catch(e){ return ''; }
  }
  function setManSelected(m){
    try{ if(window.folderSel) window.folderSel.manutencoes = m || ''; }catch(e){}
    try{ if(typeof folderSel !== 'undefined' && folderSel) folderSel.manutencoes = m || ''; }catch(e){}
    try{ selectedManMonth = m || ''; }catch(e){}
  }
  function prodSelected(){
    try{ if(window.folderSel && typeof window.folderSel.producao !== 'undefined') return window.folderSel.producao || ''; }catch(e){}
    try{ if(typeof folderSel !== 'undefined' && folderSel && typeof folderSel.producao !== 'undefined') return folderSel.producao || ''; }catch(e){}
    try{ return selectedProdMonth || ''; }catch(e){ return ''; }
  }
  function setProdSelected(m){
    try{ if(window.folderSel) window.folderSel.producao = m || ''; }catch(e){}
    try{ if(typeof folderSel !== 'undefined' && folderSel) folderSel.producao = m || ''; }catch(e){}
    try{ selectedProdMonth = m || ''; }catch(e){}
  }
  function manRows(m){ return arr('manutencoes').filter(function(r){ return !m || monthOf(r.data) === m; }); }
  function manTotal(rows){ return rows.reduce(function(s,r){ return s + Number(r.valor || 0); }, 0); }
  function manFoldersHtml(){
    const meses = Array.from(new Set(arr('manutencoes').map(function(r){ return monthOf(r.data); }).filter(Boolean))).sort();
    const selected = manSelected();
    return `<div class="folders">${[''].concat(meses).map(function(m){
      const rows = manRows(m);
      const total = manTotal(rows);
      const unique = new Set(rows.map(function(r){ return r.placa; }).filter(Boolean)).size;
      return `<button class="folder ${selected===m?'active':''}" onclick="selectManMonthLuiz('${safeEsc(m)}')"><div class="folder-icon">📁</div><strong>${m?safeMonth(m):'Todos os meses'}<span class="folder-count">${rows.length}</span></strong><small>${rows.length} registros • ${unique} veículos</small><small class="warn">Total: ${safeBRL(total)}</small></button>`;
    }).join('')}</div>`;
  }
  window.selectManMonthLuiz = function(m){
    setManSelected(m || '');
    if(typeof window.render_manutencoes === 'function') window.render_manutencoes();
    setTimeout(function(){ document.getElementById('manTable')?.scrollIntoView({behavior:'smooth',block:'start'}); }, 40);
  };
  window.render_manutencoes = function(){
    try{
      if(typeof setActions === 'function') setActions('<button class="btn" onclick="openAddManMonth && openAddManMonth()">+ Pasta/mês</button><button class="btn primary" onclick="openForm(\'manutencoes\')">+ Nova manutenção</button>');
      const selected = manSelected();
      const rows = manRows(selected);
      const total = manTotal(rows);
      const ticket = rows.length ? total / rows.length : 0;
      const unique = new Set(rows.map(function(r){ return r.placa; }).filter(Boolean)).size;
      const box = document.getElementById('manutencoes');
      if(!box) return;
      const topStats = (typeof stats === 'function') ? stats([
        ['Registros', rows.length, selected ? 'serviços no mês' : 'serviços no total'],
        ['Valor', safeBRL(total), selected ? 'total do mês' : 'total geral'],
        ['Ticket médio', safeBRL(ticket), 'valor médio por serviço'],
        ['Selecionado', selected ? safeMonth(selected) : 'Todos', unique + ' veículos']
      ]) : '';
      const filtro = (typeof filterHtml === 'function') ? filterHtml('manSearch','Buscar placa, tipo, origem ou descrição...') : '<div class="filters"><input id="manSearch" placeholder="Buscar placa, tipo, origem ou descrição..."></div>';
      box.innerHTML = topStats + manFoldersHtml() + filtro + '<div id="manTable"></div>';
      const input = document.getElementById('manSearch');
      if(input) input.oninput = window.renderManList;
      window.renderManList();
    }catch(e){
      console.error('Erro ao renderizar Manutenções:', e);
      const box = document.getElementById('manutencoes');
      if(box) box.innerHTML = '<div class="empty">Não foi possível carregar as manutenções. Recarregue a página ou volte para o backup anterior.</div>';
    }
  };
  window.renderManList = function(){
    const q = norm(document.getElementById('manSearch')?.value || '');
    const selected = manSelected();
    const rows = arr('manutencoes').filter(function(r){
      return (!selected || monthOf(r.data) === selected) && (!q || norm(Object.values(r).join(' ')).includes(q));
    });
    const htmlRows = rows.map(function(r){
      return `<tr>
        <td data-label="Data">${safeDate(r.data)}</td>
        <td data-label="Placa"><span class="plate">${safeEsc(r.placa || '-')}</span></td>
        <td data-label="Tipo/peça"><div class="long-cell-luiz">${safeEsc(r.tipo || '-')}</div></td>
        <td data-label="Origem"><div class="long-cell-luiz">${safeEsc(r.origem || '-')}</div></td>
        <td data-label="Descrição"><div class="long-cell-luiz">${safeEsc(r.descricao || '-')}</div><div class="mini-muted-luiz">Abra detalhes para ver o texto completo</div></td>
        <td data-label="Valor"><b>${safeBRL(r.valor)}</b></td>
        <td data-label="Status">${statusHtml(r.status)}</td>
        <td data-label="Ações" class="row-actions compact-actions-luiz"><button class="detail-btn-luiz" onclick="openRegistroDetalhesLuiz('manutencoes',${Number(r.id) || 0})">Detalhes</button><button class="icon-btn" onclick="openForm('manutencoes',${Number(r.id) || 0})">✎</button><button class="icon-btn" onclick="removeItem('manutencoes',${Number(r.id) || 0})">×</button></td>
      </tr>`;
    }).join('');
    const target = document.getElementById('manTable');
    if(target) target.innerHTML = makeTable(selected ? `Manutenções — ${safeMonth(selected)}` : 'Manutenções — Todos os meses', ['Data','Placa','Tipo/peça','Origem','Descrição','Valor','Status','Ações'], htmlRows);
  };
  try{ render_manutencoes = window.render_manutencoes; renderManList = window.renderManList; }catch(e){}

  function ensureDrawer(){
    let bg = document.getElementById('detailDrawerLuiz');
    if(bg) return bg;
    bg = document.createElement('div');
    bg.id = 'detailDrawerLuiz';
    bg.className = 'detail-drawer-bg-luiz';
    bg.innerHTML = `<aside class="detail-drawer-luiz" onclick="event.stopPropagation()">
      <div class="detail-drawer-head-luiz"><div><h3 id="detailDrawerTitleLuiz">Detalhes</h3><small id="detailDrawerSubLuiz"></small></div><button class="icon-btn" onclick="closeRegistroDetalhesLuiz()">×</button></div>
      <div class="detail-drawer-body-luiz" id="detailDrawerBodyLuiz"></div>
      <div class="detail-drawer-foot-luiz"><button class="btn" onclick="closeRegistroDetalhesLuiz()">Fechar</button><button class="btn primary" id="detailDrawerEditLuiz">Editar</button></div>
    </aside>`;
    bg.onclick = window.closeRegistroDetalhesLuiz;
    document.body.appendChild(bg);
    return bg;
  }
  function detailBox(label, value, full){
    return `<div class="detail-info-luiz ${full?'detail-full-luiz':''}"><span>${safeEsc(label)}</span><div class="${full?'detail-text-luiz':''}">${safeEsc(value || '-')}</div></div>`;
  }
  window.openRegistroDetalhesLuiz = function(key, itemId){
    const r = arr(key).find(function(x){ return String(x.id) === String(itemId); });
    if(!r){ if(typeof toast === 'function') toast('Registro não encontrado.'); return; }
    const bg = ensureDrawer();
    const title = key === 'manutencoes' ? 'Detalhes da manutenção' : 'Detalhes da produção';
    document.getElementById('detailDrawerTitleLuiz').textContent = title;
    document.getElementById('detailDrawerSubLuiz').textContent = (r.placa ? 'Placa ' + r.placa + ' • ' : '') + (r.data ? safeDate(r.data) : 'Sem data');
    if(key === 'manutencoes'){
      document.getElementById('detailDrawerBodyLuiz').innerHTML = `<div class="detail-info-grid-luiz">
        ${detailBox('Data', safeDate(r.data))}
        ${detailBox('Placa', r.placa)}
        ${detailBox('Tipo/peça', r.tipo)}
        ${detailBox('Origem', r.origem)}
        ${detailBox('Valor', safeBRL(r.valor))}
        ${detailBox('Status', statusText(r.status || 'concluido'))}
        ${detailBox('Descrição completa', r.descricao, true)}
      </div>`;
    }else{
      document.getElementById('detailDrawerBodyLuiz').innerHTML = `<div class="detail-info-grid-luiz">
        ${detailBox('Data', safeDate(r.data))}
        ${detailBox('Pasta/Mês', safeMonth(r.mes))}
        ${detailBox('Placa', r.placa)}
        ${detailBox('Responsável', r.responsavel)}
        ${detailBox('Serviço completo', r.servico, true)}
        ${detailBox('Observação', r.obs, true)}
      </div>`;
    }
    const edit = document.getElementById('detailDrawerEditLuiz');
    edit.onclick = function(){ window.closeRegistroDetalhesLuiz(); if(typeof openForm === 'function') openForm(key, itemId); };
    bg.classList.add('open');
  };
  window.closeRegistroDetalhesLuiz = function(){ document.getElementById('detailDrawerLuiz')?.classList.remove('open'); };

  window.renderProdInfo = function(){
    const q = norm(document.getElementById('prodSearch')?.value || '');
    const selected = prodSelected();
    const rows = arr('producao').filter(function(r){
      return (!selected || r.mes === selected) && (!q || norm(Object.values(r).join(' ')).includes(q));
    }).sort(function(a,b){ return String(a.data || '').localeCompare(String(b.data || '')); });
    const htmlRows = rows.map(function(r){
      return `<tr>
        <td data-label="Data">${safeDate(r.data)}</td>
        <td data-label="Pasta/Mês">${safeMonth(r.mes)}</td>
        <td data-label="Placa"><span class="plate">${safeEsc(r.placa || '-')}</span></td>
        <td data-label="Serviço"><div class="long-cell-luiz">${safeEsc(r.servico || '-')}</div><div class="mini-muted-luiz">Abra detalhes para ver o texto completo</div></td>
        <td data-label="Responsável"><div class="long-cell-luiz">${safeEsc(r.responsavel || '-')}</div></td>
        <td data-label="Observação"><div class="long-cell-luiz">${safeEsc(r.obs || '-')}</div></td>
        <td data-label="Ações" class="row-actions compact-actions-luiz"><button class="detail-btn-luiz" onclick="openRegistroDetalhesLuiz('producao',${Number(r.id) || 0})">Detalhes</button><button class="icon-btn" onclick="openForm('producao',${Number(r.id) || 0})">✎</button><button class="icon-btn" onclick="removeItem('producao',${Number(r.id) || 0})">×</button></td>
      </tr>`;
    }).join('');
    const target = document.getElementById('prodInfo');
    if(target) target.innerHTML = makeTable(selected ? `Produção — ${safeMonth(selected)}` : 'Produção — Todos os meses', ['Data','Pasta/Mês','Placa','Serviço','Responsável','Observação','Ações'], htmlRows);
  };
  try{ renderProdInfo = window.renderProdInfo; }catch(e){}

  const oldSelectProd = window.selectProdMonth || (typeof selectProdMonth === 'function' ? selectProdMonth : null);
  window.selectProdMonth = function(m){
    setProdSelected(m || '');
    if(typeof window.render_producao === 'function') window.render_producao();
    else if(oldSelectProd) oldSelectProd.apply(this, arguments);
    setTimeout(function(){ document.getElementById('prodInfo')?.scrollIntoView({behavior:'smooth',block:'start'}); }, 40);
  };
  try{ selectProdMonth = window.selectProdMonth; }catch(e){}
})();

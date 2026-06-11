(function(){
  'use strict';
  function safeEsc(v){
    try{return typeof esc==='function'?esc(v):String(v??'').replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c;});}
    catch(e){return String(v??'');}
  }
  function safeClean(v){
    try{return typeof clean==='function'?clean(v):String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
    catch(e){return String(v||'').toLowerCase();}
  }
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
  function up(v){return String(v||'').trim().toUpperCase();}
  function n(v){const x=Number(String(v??'').replace(',','.')); return Number.isFinite(x)?x:0;}
  function db(){try{return typeof connectSupabase==='function'?connectSupabase():null;}catch(e){return null;}}
  function missingColumn(err){
    const txt=String((err&&err.message)||err||'');
    const m=txt.match(/Could not find the '([^']+)' column|column "([^"]+)" does not exist|Could not find the ([a-zA-Z0-9_]+) column/i);
    return m ? (m[1]||m[2]||m[3]||'') : '';
  }
  async function salvarVeiculoSupabase(obj){
    const c=db(); if(!c) return {ok:false, motivoSalvo:false, motivoRemovido:false};
    let p={
      id:Number(obj.id || (typeof id==='function'?id():Date.now())),
      placa:up(obj.placa),
      modelo:obj.modelo||'',
      ano:obj.ano===''?null:n(obj.ano),
      status:obj.status||'ativo',
      motivo:obj.motivo||''
    };
    let motivoTentado=!!p.motivo, motivoRemovido=false, last=null;
    for(let i=0;i<8;i++){
      try{
        const r=await c.from('veiculos').upsert(p,{onConflict:'id'}).select().single();
        if(r.error) throw r.error;
        if(r.data) Object.assign(obj,r.data);
        return {ok:true,motivoSalvo:motivoTentado && !motivoRemovido,motivoRemovido};
      }catch(e){
        last=e;
        const col=missingColumn(e);
        if(col && Object.prototype.hasOwnProperty.call(p,col)){
          if(col==='motivo') motivoRemovido=true;
          delete p[col];
          continue;
        }
        break;
      }
    }
    if(motivoTentado && Object.prototype.hasOwnProperty.call(p,'motivo')){
      const semMotivo={...p}; delete semMotivo.motivo;
      try{ const r2=await c.from('veiculos').upsert(semMotivo,{onConflict:'id'}); if(!r2.error) return {ok:true,motivoSalvo:false,motivoRemovido:true}; }catch(e2){last=e2;}
    }
    throw last||new Error('Não foi possível salvar o veículo no Supabase.');
  }
  function motivoHtml(v){
    const m=String(v.motivo||v.motivo_parado||v.descricao_status||'').trim();
    const st=normStatus(v.status);
    if(m) return '<span class="vehicle-motivo-box"><span class="vehicle-motivo-label">Motivo</span>'+safeEsc(m)+'</span>';
    if(st==='manutencao'||st==='inativo') return '<span class="vehicle-motivo-box empty"><span class="vehicle-motivo-label">Motivo</span>Sem motivo informado.</span>';
    return '<span class="muted">—</span>';
  }
  function vehicleTable(title, rows, emptyText){
    const body = rows.length ? rows.map(function(v){
      return '<tr>'+ 
        '<td><span class="plate">'+safeEsc(v.placa||'-')+'</span></td>'+ 
        '<td>'+safeEsc(v.modelo||'-')+'</td>'+ 
        '<td>'+safeEsc(v.ano||'-')+'</td>'+ 
        '<td>'+tagStatus(v.status)+'</td>'+ 
        '<td>'+motivoHtml(v)+'</td>'+ 
        '<td><div class="row-actions"><button class="icon-btn" title="Editar" onclick="openForm(\'veiculos\','+Number(v.id)+')">✎</button><button class="icon-btn" title="Excluir" onclick="removeItem(\'veiculos\','+Number(v.id)+')">×</button></div></td>'+ 
      '</tr>';
    }).join('') : '<tr><td colspan="6"><div class="empty">'+safeEsc(emptyText||'Nenhum veículo encontrado.')+'</div></td></tr>';
    return '<div class="table-card"><div class="table-head"><h3>'+safeEsc(title)+'</h3><small>'+rows.length+' veículo(s)</small></div><div class="table-scroll"><table><thead><tr><th>Placa</th><th>Modelo</th><th>Ano</th><th>Status</th><th>Motivo / descrição</th><th>Ações</th></tr></thead><tbody>'+body+'</tbody></table></div></div>';
  }
  window.setVehicleStatusFilter=function(v){window.selectedVehicleStatus=v||'todos'; if(typeof renderVeiculosList==='function') renderVeiculosList();};
  window.renderVeiculosList=function(){
    const q=safeClean(document.getElementById('veiSearch')?.value||'');
    const selected=window.selectedVehicleStatus||'todos';
    const sel=document.getElementById('veiStatusSelect'); if(sel && sel.value!==selected) sel.value=selected;
    let rows=(window.data&&data.veiculos?data.veiculos:[]).filter(function(r){
      const searchable=[r.placa,r.modelo,r.ano,r.status,r.motivo,r.motivo_parado,r.descricao_status].join(' ');
      return !q || safeClean(searchable).includes(q);
    });
    if(selected!=='todos') rows=rows.filter(function(r){return normStatus(r.status)===selected;});
    const ativos=rows.filter(function(r){return normStatus(r.status)==='ativo';});
    const manut=rows.filter(function(r){return normStatus(r.status)==='manutencao';});
    const inativos=rows.filter(function(r){return normStatus(r.status)==='inativo';});
    let html='';
    if(selected==='todos') html='<div class="vehicle-split-grid">'+vehicleTable('Veículos ativos',ativos,'Nenhum veículo ativo encontrado.')+vehicleTable('Veículos em manutenção / parados',manut,'Nenhum veículo em manutenção encontrado.')+(inativos.length?vehicleTable('Veículos inativos',inativos,'Nenhum veículo inativo encontrado.'):'')+'</div>';
    else if(selected==='ativo') html=vehicleTable('Veículos ativos',ativos,'Nenhum veículo ativo encontrado.');
    else if(selected==='manutencao') html=vehicleTable('Veículos em manutenção / parados',manut,'Nenhum veículo em manutenção encontrado.');
    else html=vehicleTable('Veículos inativos',inativos,'Nenhum veículo inativo encontrado.');
    const target=document.getElementById('veiculosTable'); if(target) target.innerHTML=html;
  };
  window.render_veiculos=function(){
    if(typeof schemas!=='undefined') schemas.veiculos=[['placa','Placa','text'],['modelo','Modelo','text'],['ano','Ano','number'],['status','Status','select:ativo,manutencao,inativo'],['motivo','Motivo / descrição do veículo parado','text']];
    if(typeof setActions==='function') setActions('<button class="btn primary" onclick="openForm(\'veiculos\')">+ Novo veículo</button>');
    const rows=(window.data&&data.veiculos?data.veiculos:[]);
    const ativos=rows.filter(function(r){return normStatus(r.status)==='ativo';}).length;
    const manut=rows.filter(function(r){return normStatus(r.status)==='manutencao';}).length;
    const inativos=rows.filter(function(r){return normStatus(r.status)==='inativo';}).length;
    const comMotivo=rows.filter(function(r){return String(r.motivo||r.motivo_parado||r.descricao_status||'').trim();}).length;
    const statsHtml=typeof stats==='function'?stats([['Ativos',ativos,'em operação'],['Em manutenção',manut,'parados/oficina'],['Inativos',inativos,'fora de uso'],['Com motivo',comMotivo,'descrição preenchida']]):'';
    const el=document.getElementById('veiculos'); if(!el) return;
    el.innerHTML=statsHtml+
      '<div class="filters"><div class="filter-row two"><input id="veiSearch" placeholder="Buscar por placa, modelo, ano, status ou motivo..."><select id="veiStatusSelect"><option value="todos">Todos</option><option value="ativo">Ativos</option><option value="manutencao">Em manutenção</option><option value="inativo">Inativos</option></select></div><div class="vehicle-motivo-help">Agora cada veículo pode ter um motivo/descrição quando estiver parado, em manutenção ou inativo. Use o botão de editar na linha do veículo para preencher.</div></div><div id="veiculosTable"></div>';
    document.getElementById('veiSearch').oninput=renderVeiculosList;
    document.getElementById('veiStatusSelect').value=window.selectedVehicleStatus||'todos';
    document.getElementById('veiStatusSelect').onchange=function(e){setVehicleStatusFilter(e.target.value);};
    renderVeiculosList();
  };
  window.renderVeiculos=window.render_veiculos;

  const oldOpenForm=window.openForm || (typeof openForm==='function'?openForm:null);
  window.openForm=function(key,itemId){
    if(key!=='veiculos') return oldOpenForm?oldOpenForm.apply(this,arguments):undefined;
    if(!window.data) return;
    const list=data.veiculos||[];
    const item=itemId?list.find(function(x){return String(x.id)===String(itemId);})||{}:{};
    if(typeof modalCtx!=='undefined') modalCtx={key:'veiculos',itemId:itemId||null};
    const title=document.getElementById('modalTitle'); if(title) title.textContent=(itemId?'Editar ':'Adicionar ')+'veículo';
    const body=document.getElementById('modalBody'); if(body) body.innerHTML=
      '<div class="form-grid">'+
        '<div class="field"><label>Placa</label><input id="f_placa" type="text" value="'+safeEsc(item.placa||'')+'"></div>'+ 
        '<div class="field"><label>Modelo</label><input id="f_modelo" type="text" value="'+safeEsc(item.modelo||'')+'"></div>'+ 
        '<div class="field"><label>Ano</label><input id="f_ano" type="number" value="'+safeEsc(item.ano||'')+'"></div>'+ 
        '<div class="field"><label>Status</label><select id="f_status"><option value="ativo" '+(normStatus(item.status)==='ativo'?'selected':'')+'>Ativo</option><option value="manutencao" '+(normStatus(item.status)==='manutencao'?'selected':'')+'>Em manutenção</option><option value="inativo" '+(normStatus(item.status)==='inativo'?'selected':'')+'>Inativo</option></select></div>'+ 
        '<div class="field full"><label>Motivo / descrição do veículo parado</label><textarea id="f_motivo" placeholder="Ex.: Aguardando peça, motor em manutenção, parado por documentação, sinistro, revisão preventiva...">'+safeEsc(item.motivo||item.motivo_parado||item.descricao_status||'')+'</textarea></div>'+ 
        '<div class="vehicle-stop-reason-tip">Esse campo serve para explicar por que o veículo está parado, em manutenção ou inativo. Ele também aparece destacado na tabela de veículos.</div>'+ 
      '</div>';
    const bg=document.getElementById('modalBg'); if(bg) bg.classList.add('open');
  };
  try{openForm=window.openForm;}catch(e){}

  const oldSaveModal=window.saveModal || (typeof saveModal==='function'?saveModal:null);
  window.saveModal=async function(){
    const ctx=(typeof modalCtx!=='undefined'&&modalCtx)?{...modalCtx}:null;
    if(!ctx || ctx.key!=='veiculos') return oldSaveModal?oldSaveModal.apply(this,arguments):undefined;
    if(!window.data) return;
    if(!data.veiculos) data.veiculos=[];
    let obj=ctx.itemId?data.veiculos.find(function(x){return String(x.id)===String(ctx.itemId);})||null:null;
    if(!obj){obj={id:(typeof id==='function'?id():Date.now())}; data.veiculos.push(obj);}
    obj.placa=up(document.getElementById('f_placa')?.value||'');
    obj.modelo=document.getElementById('f_modelo')?.value||'';
    obj.ano=document.getElementById('f_ano')?.value||'';
    obj.status=document.getElementById('f_status')?.value||'ativo';
    obj.motivo=document.getElementById('f_motivo')?.value||'';
    if(!obj.placa){alert('Informe a placa.'); return;}
    try{
      const res=await salvarVeiculoSupabase(obj);
      if(typeof closeModal==='function') closeModal();
      if(typeof toast==='function') toast(res.motivoRemovido&&obj.motivo?'Veículo salvo. Para salvar o motivo no Supabase, rode o SQL enviado.':'Veículo salvo.');
      if(typeof showPage==='function') showPage(currentPage||'veiculos');
      if(res.motivoRemovido&&obj.motivo) console.warn('A coluna motivo ainda não existe na tabela veiculos. Rode: ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS motivo text;');
    }catch(e){
      console.error(e);
      if(typeof closeModal==='function') closeModal();
      if(typeof showPage==='function') showPage(currentPage||'veiculos');
      alert('O veículo apareceu na tela, mas não salvou no Supabase. Detalhe: '+(e.message||e));
    }
  };
  try{saveModal=window.saveModal;}catch(e){}
})();

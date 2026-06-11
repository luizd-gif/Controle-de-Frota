(function(){
  'use strict';

  const previousSaveModalForOtherTabs = window.saveModal;
  function T(v){ return String(v ?? '').trim(); }
  function U(v){ return T(v).toUpperCase(); }
  function N(v){ const n=Number(String(v ?? '').replace(',','.')); return Number.isFinite(n)?n:0; }
  function D(v){ v=T(v); return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : ''; }
  function YM(v){ try{ return typeof ym==='function'?ym(v):(D(v)?v.slice(0,7):''); }catch(e){ return D(v)?v.slice(0,7):''; } }
  function MN(m){ try{ return typeof monthName==='function'?monthName(m):m; }catch(e){ return m||'Todos os meses'; } }
  function E(v){ try{ return typeof esc==='function'?esc(v):T(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }catch(e){ return T(v); } }
  function F(v){ try{ return typeof fmtDate==='function'?fmtDate(v):(D(v)?v.split('-').reverse().join('/'):'-'); }catch(e){ return D(v)?v.split('-').reverse().join('/'):'-'; } }
  function MNY(v){ try{ return typeof BRL==='function'?BRL(v):('R$ '+N(v).toFixed(2)); }catch(e){ return 'R$ '+N(v).toFixed(2); } }
  function TAG(s){
    const raw=T(s).toLowerCase();
    const st=(['aguardando_aceite','aguardando assinatura','aguardando_assinatura','aceito','aceita','enviado_rca','enviado_para_rca'].includes(raw))?'pendente':(raw||'concluido');
    if(st==='concluido' || st==='concluida' || st==='ok') return `<span class="tag green">Concluído</span>`;
    if(st==='pendente') return `<span class="tag amber">Pendente</span>`;
    if(st==='em_andamento' || st==='andamento' || st==='manutencao') return `<span class="tag blue">Em andamento</span>`;
    return `<span class="tag gray">${E(st.replaceAll('_',' '))}</span>`;
  }
  function CLEAN(s){ try{ return typeof clean==='function'?clean(s):T(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }catch(e){ return T(s).toLowerCase(); } }
  function newId(){ try{ return typeof id==='function'?id():Date.now()+Math.floor(Math.random()*999); }catch(e){ return Date.now()+Math.floor(Math.random()*999); } }
  function db(){ try{ return typeof connectSupabase==='function'?connectSupabase():null; }catch(e){ return null; } }

  function parseDescricaoCompleta(valor){
    const s=T(valor);
    const out={tipo:'',origem:'',validadePeca:'',descricao:s};
    if(!s) return out;
    const tipo=s.match(/(?:^|\n)\s*(?:Tipo\/peça|Tipo|Serviço)\s*:\s*([^\n]+)/i);
    const origem=s.match(/(?:^|\n)\s*Origem\s*:\s*([^\n]+)/i);
    const validade=s.match(/(?:^|\n)\s*(?:Validade da peça|Vencimento da peça|Validade)\s*:\s*([^\n]+)/i);
    const desc=s.match(/(?:^|\n)\s*Descrição\s*:\s*([\s\S]*)$/i);
    if(tipo) out.tipo=T(tipo[1]);
    if(origem) out.origem=T(origem[1]);
    if(validade) out.validadePeca=D(T(validade[1]).split('/').reverse().join('-')) || D(T(validade[1]));
    if(desc) out.descricao=T(desc[1]);
    return out;
  }

  function descricaoLimpa(obj){
    const parsed=parseDescricaoCompleta(obj.descricao || obj.obs || '');
    const tipo=T(obj.tipo || obj.servico || parsed.tipo);
    const origem=T(obj.origem || parsed.origem);
    const validade=D(obj.validadePeca || obj.validade_peca || obj.validade || parsed.validadePeca);
    const descricao=T(parsed.descricao || obj.descricao || obj.obs || '');
    const linhas=[];
    if(tipo) linhas.push('Tipo/peça: '+tipo);
    if(origem) linhas.push('Origem: '+origem);
    if(validade) linhas.push('Validade da peça: '+validade);
    if(descricao) linhas.push('Descrição: '+descricao);
    return linhas.join('\n');
  }

  function diasValidade(data){
    const d=D(data); if(!d) return {tag:'gray',texto:'Sem validade'};
    const hoje=new Date(); hoje.setHours(0,0,0,0);
    const v=new Date(d+'T00:00:00');
    const diff=Math.round((v-hoje)/86400000);
    if(diff<0) return {tag:'red',texto:`Vencido há ${Math.abs(diff)} dia${Math.abs(diff)===1?'':'s'}`};
    if(diff===0) return {tag:'red',texto:'Vence hoje'};
    if(diff<=30) return {tag:'amber',texto:`Vence em ${diff} dia${diff===1?'':'s'}`};
    return {tag:'green',texto:`Vence em ${diff} dias`};
  }

  function normalizarMan(row){
    const o={...(row||{})};
    const parsed=parseDescricaoCompleta(o.descricao || o.obs || o.observacao || '');
    o.id=Number(o.id || newId());
    o.data=D(o.data);
    o.placa=U(o.placa || o.veiculo || '');
    o.tipo=T(o.tipo || o.servico || o.peca || parsed.tipo);
    o.origem=T(o.origem || parsed.origem);
    o.validadePeca=D(o.validadePeca || o.validade_peca || o.validade_peca_manutencao || o.validade || parsed.validadePeca);
    o.descricao=T(parsed.descricao || o.descricao || o.obs || o.observacao || '');
    o.valor=N(o.valor);
    {
      const st=T(o.status || 'concluido').toLowerCase();
      o.status=(['aguardando_aceite','aguardando assinatura','aguardando_assinatura','aceito','aceita','enviado_rca','enviado_para_rca'].includes(st))?'pendente':(st||'concluido');
    }
    o.anexo=T(o.anexo || '');
    o.servico=T(o.servico || o.tipo || 'Serviço de manutenção');
    return o;
  }

  function mesesMan(){
    const salvos=(window.data?.manutencoesMeses||[]).map(x=>typeof x==='string'?x:x.mes).filter(Boolean);
    const registros=(window.data?.manutencoes||[]).map(r=>YM(r.data)).filter(Boolean);
    const meses=[...new Set([...salvos,...registros])].filter(m=>/^\d{4}-\d{2}$/.test(m)).sort();
    data.manutencoesMeses=meses.map(m=>({mes:m}));
    return meses;
  }
  function garantirMes(m){ if(!/^\d{4}-\d{2}$/.test(m||'')) return; const meses=mesesMan(); if(!meses.includes(m)) data.manutencoesMeses.push({mes:m}); }
  function linhasMes(m){ return (data.manutencoes||[]).map(normalizarMan).filter(r=>!m || YM(r.data)===m); }

  async function tabelaManutencoes(){
    if(window.__manutencoesTable) return window.__manutencoesTable;
    const c=db(); if(!c) return null;
    for(const t of ['manutencoes','manutencao']){
      try{ const r=await c.from(t).select('*').limit(1); if(!r.error){ window.__manutencoesTable=t; return t; } }catch(e){}
    }
    return null;
  }
  function colunaFaltando(err){
    const s=String(err?.message||err?.details||err?.hint||err||'');
    const m=s.match(/Could not find the '([^']+)' column|column "([^"]+)" does not exist|Could not find the ([a-zA-Z0-9_]+) column/i);
    return m ? (m[1]||m[2]||m[3]||'') : '';
  }
  async function upsertManutencao(obj){
    const c=db(), t=await tabelaManutencoes();
    if(!c || !t) return false;
    const completo=descricaoLimpa(obj);
    const payload={
      id:Number(obj.id),
      data:D(obj.data)||null,
      placa:U(obj.placa),
      veiculo:U(obj.placa),
      servico:T(obj.tipo || obj.servico || 'Serviço de manutenção'),
      tipo:T(obj.tipo || obj.servico || ''),
      origem:T(obj.origem),
      validade_peca:D(obj.validadePeca)||null,
      validade_peca_manutencao:D(obj.validadePeca)||null,
      descricao:completo,
      obs:completo,
      observacao:completo,
      valor:N(obj.valor),
      status:T(obj.status || 'concluido'),
      anexo:T(obj.anexo)
    };
    let p={...payload};
    let last=null;
    for(let i=0;i<30;i++){
      Object.keys(p).forEach(k=>{ if(p[k]===undefined) delete p[k]; });
      const r=await c.from(t).upsert(p,{onConflict:'id'}).select().single();
      if(!r.error){
        const row=normalizarMan(r.data || p);
        Object.assign(obj,row);
        obj.descricao=parseDescricaoCompleta(completo).descricao;
        return true;
      }
      last=r.error;
      const col=colunaFaltando(r.error);
      if(col && Object.prototype.hasOwnProperty.call(p,col)){ delete p[col]; continue; }
      break;
    }
    throw last || new Error('Falha ao salvar manutenção no Supabase.');
  }
  async function salvarPasta(mes){
    const c=db(); if(!c || !/^\d{4}-\d{2}$/.test(mes||'')) return;
    for(const t of ['manutencoes_meses','pastas_manutencoes']){
      try{ const r=await c.from(t).upsert({mes},{onConflict:'mes'}); if(!r.error) return; }catch(e){}
    }
  }

  window.renderManList=function(){
    const busca=CLEAN(document.getElementById('manSearch')?.value||'');
    const arr=linhasMes(selectedManMonth).filter(r=>!busca || CLEAN(Object.values(r).join(' ')).includes(busca));
    const html=arr.map(r=>{
      const validade=D(r.validadePeca || r.validade_peca || r.validade);
      const st=diasValidade(validade);
      return `<tr>
        <td>${F(r.data)}</td>
        <td><span class="plate">${E(r.placa)}</span></td>
        <td>${E(r.tipo || r.servico || '-')}</td>
        <td>${E(r.origem || '-')}</td>
        <td>${validade?F(validade):'-'}<br><span class="tag ${st.tag}">${E(st.texto)}</span></td>
        <td>${E(r.descricao || '-').replace(/\n/g,'<br>')}</td>
        <td><b>${MNY(r.valor)}</b></td>
        <td>${TAG(r.status)}</td>
        <td class="row-actions"><button class="icon-btn" onclick="openForm('manutencoes',${Number(r.id)})">✎</button><button class="icon-btn" onclick="removeItem('manutencoes',${Number(r.id)})">×</button></td>
      </tr>`;
    }).join('');
    document.getElementById('manTable').innerHTML=table(selectedManMonth?`Manutenções — ${MN(selectedManMonth)}`:'Manutenções — Todos os meses',['Data','Placa','Tipo/peça','Origem','Validade da peça','Descrição','Valor','Status','Ações'],html);
  };
  try{ renderManList=window.renderManList; }catch(e){}

  window.render_manutencoes=function(){
    mesesMan();
    setActions('<button class="btn" onclick="openAddManMonth()">+ Pasta/mês</button><button class="btn primary" onclick="openForm(\'manutencoes\')">+ Nova manutenção</button>');
    const rows=linhasMes(selectedManMonth);
    const total=rows.reduce((s,r)=>s+N(r.valor),0);
    const ticket=rows.length?total/rows.length:0;
    const folders=['',...mesesMan()].map(m=>{
      const rowsM=linhasMes(m), totalM=rowsM.reduce((s,r)=>s+N(r.valor),0), unique=new Set(rowsM.map(r=>r.placa).filter(Boolean)).size;
      return `<div class="folder editable-folder ${selectedManMonth===m?'active':''}">
        <div class="folder-main" onclick="selectManMonth('${m}')"><div class="folder-icon">📁</div><strong>${m?MN(m):'Todos os meses'}<span class="folder-count">${rowsM.length}</span></strong><small>${rowsM.length} registros • ${unique} veículos</small><small class="warn">Total: ${MNY(totalM)}</small></div>
        ${m?`<div class="folder-card-actions"><button class="icon-btn" title="Editar pasta" onclick="event.stopPropagation();editManMonth('${m}')">✎</button><button class="icon-btn danger" title="Excluir pasta" onclick="event.stopPropagation();deleteManMonth('${m}')">×</button></div>`:''}
      </div>`;
    }).join('');
    document.getElementById('manutencoes').innerHTML=stats([
      ['Registros',rows.length,selectedManMonth?'no mês selecionado':'total de serviços'],
      ['Valor',MNY(total),selectedManMonth?'total do mês':'total geral'],
      ['Ticket médio',MNY(ticket),'valor médio por serviço'],
      ['Selecionado',selectedManMonth?MN(selectedManMonth):'Todos','pasta atual']
    ])+`<div class="folders">${folders}</div>`+filterHtml('manSearch','Buscar placa, tipo, origem, validade ou descrição...')+`<div id="manTable"></div>`;
    document.getElementById('manSearch').oninput=window.renderManList;
    window.renderManList();
  };
  try{ render_manutencoes=window.render_manutencoes; }catch(e){}

  const oldOpenFormFinal=window.openForm;
  window.openForm=function(key,itemId=null){
    if(key!=='manutencoes') return oldOpenFormFinal ? oldOpenFormFinal.apply(this,arguments) : undefined;
    modalCtx={key,itemId};
    const raw=itemId?(data.manutencoes.find(x=>String(x.id)===String(itemId))||{}):{};
    const item=normalizarMan(itemId?raw:{data:selectedManMonth?selectedManMonth+'-01':'',placa:'',tipo:'',origem:'',validadePeca:'',descricao:'',valor:0,status:'concluido',anexo:''});
    const itemMes=YM(item.data) || selectedManMonth || '';
    const meses=[...new Set([itemMes, selectedManMonth, ...mesesMan()].filter(Boolean))];
    document.getElementById('modalTitle').textContent=itemId?'Editar manutenção':'Adicionar manutenção';
    document.querySelector('#modalBg .modal')?.classList.add('manutencao-modal');
    document.getElementById('modalBody').innerHTML=`<div class="form-grid">
      <div class="man-help">Cadastro de manutenção<span>Este formulário salva a descrição completa no Supabase e mantém cada registro em sua pasta correta.</span></div>
      <div class="field"><label>Pasta/Mês</label><select id="f_man_mes"><option value="">Usar mês da data</option>${meses.map(m=>`<option value="${E(m)}" ${itemMes===m?'selected':''}>${MN(m)}</option>`).join('')}</select></div>
      <div class="field"><label>Data</label><input id="f_data" type="date" value="${E(item.data||'')}"></div>
      <div class="field"><label>Placa</label><input id="f_placa" type="text" value="${E(item.placa||'')}" placeholder="Ex.: ABC1D23"></div>
      <div class="field"><label>Tipo/peça</label><input id="f_tipo" type="text" value="${E(item.tipo||'')}" placeholder="Ex.: Lona de freio"></div>
      <div class="field"><label>Origem</label><input id="f_origem" type="text" value="${E(item.origem||'')}"></div>
      <div class="field"><label>Validade da peça</label><input id="f_validadePeca" type="date" value="${E(item.validadePeca||'')}"><small id="validadePecaAviso" class="desc-muted"></small></div>
      <div class="field"><label>Valor</label><input id="f_valor" type="number" step="0.01" value="${E(item.valor||0)}"></div>
      <div class="field"><label>Status</label><select id="f_status"><option value="concluido" ${T(item.status)==='concluido'?'selected':''}>Concluído</option><option value="pendente" ${T(item.status)==='pendente'?'selected':''}>Pendente</option><option value="em andamento" ${T(item.status)==='em andamento'?'selected':''}>Em andamento</option></select></div>
      <div class="field full"><label>Descrição</label><textarea id="f_descricao" placeholder="Descreva o serviço realizado">${E(item.descricao||'')}</textarea></div>
      <div class="field full"><label>Anexo/Comprovante</label><input id="f_anexo" type="text" placeholder="Cole um link ou nome do arquivo" value="${E(item.anexo||'')}"></div>
    </div>`;
    const aviso=()=>{ const el=document.getElementById('f_validadePeca'), av=document.getElementById('validadePecaAviso'); if(av) av.textContent=diasValidade(el?.value).texto; };
    document.getElementById('f_validadePeca')?.addEventListener('change',aviso); aviso();
    document.getElementById('modalBg').classList.add('open');
  };
  try{ openForm=window.openForm; }catch(e){}

  window.saveModal=async function(){
    const ctx=(typeof modalCtx!=='undefined' && modalCtx)?{...modalCtx}:null;
    if(!ctx || ctx.key!=='manutencoes'){
      // para outras abas, usa a última implementação existente antes desta correção, se existir
      if(typeof previousSaveModalForOtherTabs==='function') return previousSaveModalForOtherTabs.apply(this,arguments);
      return;
    }
    const itemId=ctx.itemId;
    const obj=itemId?(data.manutencoes.find(x=>String(x.id)===String(itemId))||{id:Number(itemId)}):{id:newId()};
    let dataServico=D(document.getElementById('f_data')?.value);
    const mesEscolhido=T(document.getElementById('f_man_mes')?.value);
    if(mesEscolhido){
      const dia=dataServico ? dataServico.slice(8,10) : '01';
      const ultimo=new Date(Number(mesEscolhido.slice(0,4)), Number(mesEscolhido.slice(5,7)), 0).getDate();
      dataServico=mesEscolhido+'-'+String(Math.min(Number(dia)||1,ultimo)).padStart(2,'0');
    }
    if(!D(dataServico)){ alert('Preencha a data ou escolha uma pasta/mês.'); return; }
    obj.data=dataServico;
    obj.placa=U(document.getElementById('f_placa')?.value);
    obj.tipo=T(document.getElementById('f_tipo')?.value);
    obj.servico=obj.tipo || 'Serviço de manutenção';
    obj.origem=T(document.getElementById('f_origem')?.value);
    obj.validadePeca=D(document.getElementById('f_validadePeca')?.value);
    obj.descricao=T(document.getElementById('f_descricao')?.value);
    obj.valor=N(document.getElementById('f_valor')?.value);
    obj.status=T(document.getElementById('f_status')?.value || 'concluido');
    obj.anexo=T(document.getElementById('f_anexo')?.value);
    if(!itemId && !(data.manutencoes||[]).some(x=>String(x.id)===String(obj.id))) data.manutencoes.push(obj);
    garantirMes(YM(obj.data));
    // Não força selectedManMonth para junho ou qualquer outro mês: mantém a pasta que o usuário está vendo.
    try{
      await upsertManutencao(obj);
      await salvarPasta(YM(obj.data));
      if(typeof toast==='function') toast('Manutenção salva no Supabase.');
    }catch(e){
      console.error(e);
      alert('Salvou na tela, mas não salvou no Supabase. Detalhe: '+(e.message||e));
    }
    if(typeof closeModal==='function') closeModal();
    if(typeof showPage==='function') showPage(currentPage||'manutencoes');
  };
  try{ saveModal=window.saveModal; }catch(e){}

  // guarda a implementação anterior só para não quebrar outras abas caso o navegador precise dela
  if(!window.__oldSaveModalBeforeManutencaoClean && typeof saveModal==='function'){
    // intencionalmente não sobrescreve: a função atual já trata manutenção; outras abas continuam pelas funções globais antigas chamadas antes desta correção.
  }

  // Normaliza dados carregados sem apagar meses antigos.
  if(Array.isArray(window.data?.manutencoes)) data.manutencoes=data.manutencoes.map(normalizarMan);
})();

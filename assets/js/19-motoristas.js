(function(){
  'use strict';
  function S(v){ return String(v==null?'':v).trim(); }
  function C(v){ try{return typeof clean==='function'?clean(v):S(v).toLowerCase();}catch(e){return S(v).toLowerCase();} }
  function E(v){ try{return typeof esc==='function'?esc(v):S(v).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]});}catch(e){return S(v);} }
  function F(v){ try{return typeof fmtDate==='function'?fmtDate(v):(v||'-');}catch(e){return v||'-';} }
  function M(v){ v=S(v); return /^\d{4}-\d{2}-\d{2}$/.test(v)?v.slice(0,7):(/^\d{4}-\d{2}$/.test(v)?v:''); }
  function MN(m){ try{return typeof monthName==='function'?monthName(m):m;}catch(e){return m;} }
  function TG(v){ try{return typeof statusTag==='function'?statusTag(v):'<span class="tag gray">'+E(v||'-')+'</span>';}catch(e){return '<span class="tag gray">'+E(v||'-')+'</span>';}}
  function TB(title,heads,body){ try{return typeof table==='function'?table(title,heads,body):'<div class="table-card"><div class="table-head"><h3>'+E(title)+'</h3></div><div class="table-scroll"><table><thead><tr>'+heads.map(h=>'<th>'+E(h)+'</th>').join('')+'</tr></thead><tbody>'+(body||'<tr><td colspan="99">Nenhum registro.</td></tr>')+'</tbody></table></div></div>';}catch(e){return '';}}
  function ST(items){ try{return typeof stats==='function'?stats(items):'';}catch(e){return '';}}
  function FB(){ try{return typeof filterHtml==='function'?filterHtml('tacSearch','Buscar placa, emissão, validade, vencimento, situação ou observação...'):'<div class="filters"><input id="tacSearch" placeholder="Buscar placa..."></div>';}catch(e){return '<div class="filters"><input id="tacSearch" placeholder="Buscar placa..."></div>';}}
  function arr(){ if(typeof data==='undefined') return []; if(!Array.isArray(data.tacografos)) data.tacografos=[]; return data.tacografos; }
  function tacDate(r){ return S(r.validade||r.vencimento||r.data_validade||r.validade_tacografo||r.data||r.emissao||r.data_emissao||r.data_afericao||''); }
  function tacMonth(r){ return M(tacDate(r)); }
  function months(){ return Array.from(new Set(arr().map(tacMonth).filter(Boolean))).sort(); }
  function getSel(){ try{ if(typeof folderSel!=='undefined' && folderSel) return folderSel.tacografos||''; }catch(e){} try{return selectedTacMonth||'';}catch(e){return '';} }
  function setSel(m){ try{ if(typeof folderSel!=='undefined' && folderSel) folderSel.tacografos=m||''; }catch(e){} try{ selectedTacMonth=m||''; }catch(e){} }
  function count(m){ const rows=arr().filter(r=>!m||tacMonth(r)===m); const placas=new Set(rows.map(r=>S(r.placa).replace(/\s+/g,'').toUpperCase()).filter(Boolean)).size; return rows.length+' registros • '+placas+' veículos'; }
  function foldersHtml(ms){ const current=getSel(); const cards=[{mes:'',label:'Todos os meses'}].concat(ms.map(m=>({mes:m,label:MN(m)}))); return '<div class="folders">'+cards.map(f=>'<button type="button" class="folder '+(current===f.mes?'active':'')+'" onclick="selectFolderTacografoCorrigido(\''+f.mes+'\')"><div class="folder-icon">📁</div><strong>'+E(f.label)+'</strong><small>'+E(count(f.mes))+'</small></button>').join('')+'</div>'; }
  window.selectFolderTacografoCorrigido=function(m){ setSel(m||''); if(typeof window.render_tacografos==='function') window.render_tacografos(); setTimeout(function(){document.getElementById('tacInfo')?.scrollIntoView({behavior:'smooth',block:'start'});},50); };
  window.renderTacListEmpresa=window.renderTacListFinal=function(){
    const target=document.getElementById('tacInfo'); if(!target) return;
    const q=C(document.getElementById('tacSearch')?.value||''); const sel=getSel();
    const rows=arr().filter(r=>(!sel||tacMonth(r)===sel)&&(!q||C(Object.values(r).join(' ')).includes(q)));
    target.innerHTML=TB(sel?'Tacógrafos — '+MN(sel):'Tacógrafos — Todos os meses',['Placa','Emissão','Validade/Vencimento','Situação','Obs','Ações'],rows.map(function(r){
      const val=S(r.validade||r.vencimento||r.data_validade||r.validade_tacografo||'');
      const em=S(r.data||r.emissao||r.data_emissao||r.data_afericao||'');
      return '<tr><td><span class="plate">'+E(r.placa)+'</span></td><td>'+F(em)+'</td><td>'+F(val||tacDate(r))+'</td><td>'+TG(r.status||r.situacao||'ativo')+'</td><td>'+E(r.obs||r.observacao||'-')+'</td><td class="row-actions"><button class="icon-btn" onclick="openForm(\'tacografos\','+Number(r.id)+')">✎</button><button class="icon-btn" onclick="removeItem(\'tacografos\','+Number(r.id)+')">×</button></td></tr>';
    }).join(''));
  };
  window.render_tacografos=function(){
    if(typeof setActions==='function') setActions('<button class="btn primary" onclick="openForm(\'tacografos\')">+ Novo tacógrafo</button>');
    const ms=months(), sel=getSel(); const el=document.getElementById('tacografos'); if(!el) return;
    el.innerHTML=ST([['Registros',arr().length,'tacógrafos'],['Ativos',arr().filter(x=>C(x.status||x.situacao).includes('ativo')||C(x.status||x.situacao).includes('ok')).length,'válidos'],['Pastas',ms.length,'por validade/vencimento'],['Selecionado',sel?MN(sel):'Todos','pasta atual']])+foldersHtml(ms)+FB()+'<div id="tacInfo"></div>';
    const inp=document.getElementById('tacSearch'); if(inp) inp.oninput=window.renderTacListEmpresa; window.renderTacListEmpresa();
  };
  try{ render_tacografos=window.render_tacografos; }catch(e){}
  // Depois de salvar tacógrafo, sempre recalcula as pastas pelo vencimento/validade e mostra a pasta correta.
  const oldSave=window.saveModal || (typeof saveModal==='function'?saveModal:null);
  window.saveModal=async function(){
    const ctx=(typeof modalCtx!=='undefined' && modalCtx)?modalCtx:null;
    const isTac=ctx && ctx.key==='tacografos';
    if(!isTac) return oldSave?oldSave.apply(this,arguments):undefined;
    const beforeIds=new Set(arr().map(x=>String(x.id)));
    const ret=await (oldSave?oldSave.apply(this,arguments):undefined);
    const newest=arr().slice().reverse().find(x=>!beforeIds.has(String(x.id))) || arr().slice().sort((a,b)=>Number(b.id||0)-Number(a.id||0))[0];
    const m=newest?tacMonth(newest):'';
    if(m) setSel(m); else setSel('');
    window.render_tacografos();
    return ret;
  };
  try{ saveModal=window.saveModal; }catch(e){}
  setTimeout(function(){ if((typeof currentPage==='string'?currentPage:'')==='tacografos') window.render_tacografos(); },500);
})();

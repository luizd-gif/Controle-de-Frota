(function(){
  'use strict';
  if(window.__BRAT_PACKAGE_FLOW_V3__) return;
  window.__BRAT_PACKAGE_FLOW_V3__ = true;

  function H(v){try{return esc(v);}catch(e){return String(v??'').replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c;});}}
  function C(v){try{return clean(v);}catch(e){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}}
  function F(v){try{return fmtDate(v);}catch(e){return /^\d{4}-\d{2}-\d{2}$/.test(String(v||''))?String(v).split('-').reverse().join('/'):(v||'-');}}
  function YM(d){try{return ym(d);}catch(e){return /^\d{4}-\d{2}-\d{2}$/.test(String(d||''))?String(d).slice(0,7):'';}}
  function MN(m){try{return monthName(m);}catch(e){return m||'Todos os meses';}}
  function T(msg){try{toast(msg);}catch(e){alert(msg);}}
  function newId(){try{return id();}catch(e){return Date.now()+Math.floor(Math.random()*999);}}
  function getBrats(){try{data.brat=Array.isArray(data.brat)?data.brat:[]; return data.brat;}catch(e){return [];}}
  function setPageActions(html){try{setActions(html);}catch(e){var a=document.getElementById('pageActions'); if(a) a.innerHTML=html;}}
  function normalizeStatus(v){var s=C(v); if(s.indexOf('final')>=0||s.indexOf('conclu')>=0) return 'finalizado'; if(s.indexOf('pend')>=0) return 'pendente'; if(s.indexOf('andamento')>=0||s.indexOf('analise')>=0) return 'em_analise'; return s||'em_analise';}
  function statusText(v){var s=normalizeStatus(v); return s==='finalizado'?'Finalizado':s==='pendente'?'Pendente':'Em análise';}
  function tagStatus(v){var s=normalizeStatus(v), cls=s==='finalizado'?'green':(s==='pendente'?'amber':'blue'); return '<span class="tag '+cls+'">'+H(statusText(s))+'</span>';}
  function getExt(name){var m=String(name||'').toLowerCase().match(/\.([a-z0-9]+)$/); return m?m[1]:'';}
  function fileKind(name){var e=getExt(name); if(/^(jpe?g|png|webp|gif|bmp)$/i.test(e)) return 'img'; if(e==='pdf') return 'pdf'; if(/^(mp4|mov|avi|mkv|webm)$/i.test(e)) return 'vid'; return 'doc';}

  var PLACA_MAP={'1J99':'KPT1J99','6E12':'KRF6E12','7F74':'LQM7F74','9F95':'LSE9F95'};
  var MOTORISTA_MAP={'1J99':'VANILSON FRANCISCO BARBOSA','6E12':'LEONARDO DE SOUZA','7F74':'THIAGO ELIAS DA SILVA SANTOS','9F95':'DIEGO LUIZ NUNES DE FRANÇA'};
  window.__bratPacoteState = window.__bratPacoteState || null;

  function ensureBratPage(){
    try{
      if(Array.isArray(pages) && !pages.some(function(p){return p&&p[0]==='brat';})) pages.push(['brat','BRAT','Boletins de Registro de Acidente de Trânsito']);
      if(!document.getElementById('brat')){var main=document.querySelector('main.content')||document.querySelector('main'); if(main){var sec=document.createElement('section'); sec.id='brat'; sec.className='page'; main.appendChild(sec);}}
    }catch(e){}
  }

  function ensureInputs(){
    if(!document.getElementById('bratPackZipInput')){
      var z=document.createElement('input'); z.id='bratPackZipInput'; z.type='file'; z.accept='.zip,application/zip,application/x-zip-compressed'; z.style.display='none';
      z.onchange=function(){if(this.files&&this.files[0]) window.importarBratPacoteZip(this.files[0]); this.value='';}; document.body.appendChild(z);
    }
    if(!document.getElementById('bratPackFolderInput')){
      var f=document.createElement('input'); f.id='bratPackFolderInput'; f.type='file'; f.multiple=true; f.style.display='none'; f.setAttribute('webkitdirectory',''); f.setAttribute('directory','');
      f.onchange=function(){if(this.files&&this.files.length) window.importarBratPacotePasta(Array.prototype.slice.call(this.files)); this.value='';}; document.body.appendChild(f);
    }
  }

  function splitZipPath(path){
    var parts=String(path||'').split('/').filter(Boolean);
    if(parts.length>=3) return {root:parts[0], folder:parts[1], file:parts.slice(2).join('/')};
    if(parts.length>=2) return {root:'', folder:parts[0], file:parts.slice(1).join('/')};
    return null;
  }
  function splitFolderPath(path){
    var parts=String(path||'').split('/').filter(Boolean);
    if(parts.length>=3) return {root:parts[0], folder:parts[1], file:parts.slice(2).join('/')};
    if(parts.length>=2) return {root:'', folder:parts[0], file:parts.slice(1).join('/')};
    return {root:'', folder:'BRAT importado', file:parts[0]||path};
  }
  function inferDate(files){
    var dates=[]; files.forEach(function(f){var m=String(f.name||f.file||'').match(/(20\d{2})[-_\. ](\d{2})[-_\. ](\d{2})/); if(m) dates.push(m[1]+'-'+m[2]+'-'+m[3]);}); dates.sort(); return dates[0]||'';
  }
  function inferMonth(folder,date){
    var n=C(folder); var meses=[['janeiro','01'],['fevereiro','02'],['marco','03'],['abril','04'],['maio','05'],['junho','06'],['julho','07'],['agosto','08'],['setembro','09'],['outubro','10'],['novembro','11'],['dezembro','12']];
    for(var i=0;i<meses.length;i++){if(n.indexOf(meses[i][0])>=0) return '2026-'+meses[i][1];}
    return YM(date)||'';
  }
  function inferCode(folder){
    var u=String(folder||'').toUpperCase();
    if(u.indexOf('1J99')>=0) return '1J99'; if(u.indexOf('6E12')>=0) return '6E12'; if(u.indexOf('7F74')>=0) return '7F74'; if(u.indexOf('9F95')>=0) return '9F95';
    var m=u.match(/[A-Z0-9]{4}/); return m?m[0]:'';
  }
  function inferRecord(group,idx){
    var folder=group.folder||'BRAT importado', code=inferCode(folder), dataOc=inferDate(group.files||[]);
    var pdfs=(group.files||[]).filter(function(f){return getExt(f.name||f.file)==='pdf';}).map(function(f){return f.name||f.file;});
    var bratPdfs=pdfs.filter(function(f){return /brat|ebrat|20\d{10,}/i.test(f);});
    var numero=(bratPdfs.length?bratPdfs:pdfs).map(function(f){return String(f).replace(/\.pdf$/i,'');}).slice(0,3).join(' / ');
    return {id:Number(String(dataOc||'2026-01-01').replace(/-/g,'')+String(idx+71).padStart(2,'0'))||newId(),mes:inferMonth(folder,dataOc),data:dataOc,placa:PLACA_MAP[code]||code||'',motorista:MOTORISTA_MAP[code]||folder.replace(code,'').replace(/\b(JANEIRO|FEVEREIRO|MARCO|MARÇO|ABRIL|MAIO|JUNHO|JULHO|AGOSTO|SETEMBRO|OUTUBRO|NOVEMBRO|DEZEMBRO)\b/ig,'').trim(),numero_brat:numero||'BRAT importado',status:'em_analise',tipo:'BRAT / Sinistro',local:'',descricao:'Registro importado do pacote: '+folder+'. Complete local, descrição do ocorrido e status.',pasta_origem:folder,qtd_fotos:(group.files||[]).filter(function(f){return fileKind(f.name||f.file)==='img';}).length,qtd_videos:(group.files||[]).filter(function(f){return fileKind(f.name||f.file)==='vid';}).length,qtd_pdfs:pdfs.length,arquivos:(group.files||[]).map(function(f){return f.name||f.file;}).join('\n'),obs:''};
  }
  function mergeRecords(records){
    var list=getBrats();
    records.forEach(function(r){
      var found=list.find(function(x){return C(x.pasta_origem||'')===C(r.pasta_origem||'') || (x.placa&&r.placa&&x.placa===r.placa&&(x.data||'')===(r.data||''));});
      if(found){['mes','data','placa','motorista','numero_brat','tipo','pasta_origem','qtd_fotos','qtd_videos','qtd_pdfs','arquivos'].forEach(function(k){found[k]=r[k];}); if(!found.descricao) found.descricao=r.descricao; if(!found.status) found.status=r.status;}
      else list.push(r);
    });
    try{localStorage.setItem('gf_brat_importados_cache',JSON.stringify(list));}catch(e){}
  }
  function hydrateCache(){
    try{var cached=JSON.parse(localStorage.getItem('gf_brat_importados_cache')||'[]'); if(Array.isArray(cached)&&cached.length){data.brat=Array.isArray(data.brat)?data.brat:[]; cached.forEach(function(r){if(!data.brat.some(function(x){return C(x.pasta_origem||'')===C(r.pasta_origem||'')&&x.placa===r.placa;})) data.brat.push(r);});}}catch(e){}
  }

  window.importarBratPacoteZip = async function(file){
    if(!file) return; if(!window.JSZip){T('JSZip não carregou. Confira a internet e tente novamente.'); return;}
    try{
      T('Importando pacote BRAT...');
      var zip=await JSZip.loadAsync(file), groupsMap={}, allEntries=[];
      Object.keys(zip.files).forEach(function(path){var entry=zip.files[path]; if(entry.dir||/thumbs\.db|__macosx/i.test(path)) return; var sp=splitZipPath(path); if(!sp||!sp.folder||!sp.file) return; groupsMap[sp.folder]=groupsMap[sp.folder]||{folder:sp.folder,files:[]}; var item={name:sp.file,path:path,size:(entry._data&&entry._data.uncompressedSize)||0,entry:entry}; groupsMap[sp.folder].files.push(item); allEntries.push(item);});
      var groups=Object.keys(groupsMap).sort().map(function(k){groupsMap[k].files.sort(function(a,b){return a.name.localeCompare(b.name);}); return groupsMap[k];});
      if(!groups.length){T('Não encontrei pastas válidas dentro do ZIP.'); return;}
      window.__bratPacoteState={mode:'zip',file:file,zip:zip,groups:groups,entries:allEntries,loadedAt:new Date()};
      window.__bratAnexosState={file:file,zip:zip,groups:groups,filesByPath:{},loadedAt:new Date()};
      groups.forEach(function(g){g.files.forEach(function(f){window.__bratAnexosState.filesByPath[f.path]=f;});});
      mergeRecords(groups.map(inferRecord));
      try{renderNav();}catch(e){}; window.render_brat();
      T('BRAT importado. Os cards foram preenchidos e o ZIP ficou pronto para baixar.');
    }catch(err){console.error(err); T('Erro ao importar ZIP: '+(err.message||err));}
  };

  window.importarBratPacotePasta = function(files){
    files=Array.isArray(files)?files:[]; if(!files.length) return;
    var groupsMap={};
    files.forEach(function(file){var path=file.webkitRelativePath||file.name; if(/thumbs\.db|__macosx/i.test(path)) return; var sp=splitFolderPath(path); groupsMap[sp.folder]=groupsMap[sp.folder]||{folder:sp.folder,files:[]}; groupsMap[sp.folder].files.push({name:sp.file,path:path,file:file,size:file.size||0});});
    var groups=Object.keys(groupsMap).sort().map(function(k){groupsMap[k].files.sort(function(a,b){return a.name.localeCompare(b.name);}); return groupsMap[k];});
    window.__bratPacoteState={mode:'folder',files:files,groups:groups,loadedAt:new Date()};
    mergeRecords(groups.map(inferRecord));
    try{renderNav();}catch(e){}; window.render_brat();
    T('Pasta BRAT importada. Os cards foram preenchidos.');
  };

  window.baixarBratPacoteCompleto = async function(){
    var st=window.__bratPacoteState;
    if(!st){T('Importe o ZIP ou a pasta do BRAT primeiro.'); return;}
    if(st.mode==='zip' && st.file){
      var url=URL.createObjectURL(st.file), a=document.createElement('a'); a.href=url; a.download=st.file.name||'BRAT_importado.zip'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){URL.revokeObjectURL(url);},5000); return;
    }
    if(st.mode==='folder'){
      if(!window.JSZip){T('JSZip não carregou. Confira a internet e tente novamente.'); return;}
      var zip=new JSZip(); (st.files||[]).forEach(function(f){zip.file(f.webkitRelativePath||f.name,f);});
      var blob=await zip.generateAsync({type:'blob'}); var url2=URL.createObjectURL(blob), b=document.createElement('a'); b.href=url2; b.download='BRAT_importado.zip'; document.body.appendChild(b); b.click(); b.remove(); setTimeout(function(){URL.revokeObjectURL(url2);},5000);
    }
  };

  function rowsFiltered(){
    var q=C(document.getElementById('bratPackSearch')?.value||''), mes=document.getElementById('bratPackMonth')?.value||'', st=document.getElementById('bratPackStatus')?.value||'';
    return getBrats().filter(function(r){var okQ=!q||C(Object.values(r).join(' ')).indexOf(q)>=0; var okM=!mes||(r.mes||YM(r.data))===mes; var okS=!st||normalizeStatus(r.status)===st; return okQ&&okM&&okS;}).sort(function(a,b){return String(b.data||'').localeCompare(String(a.data||''));});
  }
  function renderCards(){
    var box=document.getElementById('bratPackList'); if(!box) return; var rows=rowsFiltered();
    box.innerHTML=rows.length?rows.map(function(r){var total=(Number(r.qtd_fotos||0)+Number(r.qtd_pdfs||0)+Number(r.qtd_videos||0)); return '<article class="brat-pack-item"><div class="brat-pack-top"><div><b>'+H(r.placa||'-')+' • '+H(r.motorista||'-')+'</b><small>'+F(r.data)+' • '+H(MN(r.mes||YM(r.data)))+'</small></div>'+tagStatus(r.status)+'</div><div><span class="plate">'+H(r.placa||'-')+'</span><small>'+H(r.pasta_origem||'Pasta não informada')+'</small></div><div class="brat-pack-files"><span class="brat-chip img">📷 '+Number(r.qtd_fotos||0)+' fotos</span><span class="brat-chip pdf">📄 '+Number(r.qtd_pdfs||0)+' PDFs</span><span class="brat-chip vid">🎥 '+Number(r.qtd_videos||0)+' vídeos</span><span class="brat-chip">📦 '+total+' arquivos</span></div><div class="brat-pack-desc"><b>'+H(r.numero_brat||'BRAT importado')+'</b><br>'+H(r.descricao||'Sem descrição')+'</div><div class="brat-pack-tools"><button class="btn" onclick="showBratDocs&&showBratDocs('+Number(r.id)+')">Ver lista de arquivos</button><button class="btn" onclick="openBratForm&&openBratForm('+Number(r.id)+')">Editar</button></div></article>';}).join(''):'<div class="empty">Nenhum BRAT encontrado nesse filtro. Clique em Importar ZIP do BRAT.</div>';
  }

  window.render_brat = function(){
    ensureBratPage(); ensureInputs(); hydrateCache();
    setPageActions('<button class="btn" onclick="document.getElementById(\'bratPackZipInput\').click()">Importar ZIP do BRAT</button><button class="btn" onclick="document.getElementById(\'bratPackFolderInput\').click()">Importar pasta</button><button class="btn primary" onclick="baixarBratPacoteCompleto()">Baixar ZIP importado</button><button class="btn" onclick="gerarPdfBratZipAtual&&gerarPdfBratZipAtual()">Gerar PDF</button><button class="btn primary" onclick="openBratForm&&openBratForm()">+ Novo BRAT</button>');
    var el=document.getElementById('brat'); if(!el) return;
    var list=getBrats(), meses=[...new Set(list.map(function(r){return r.mes||YM(r.data);}).filter(Boolean))].sort().reverse();
    var st=window.__bratPacoteState, totalFotos=list.reduce(function(s,r){return s+Number(r.qtd_fotos||0);},0), totalPdfs=list.reduce(function(s,r){return s+Number(r.qtd_pdfs||0);},0), totalVideos=list.reduce(function(s,r){return s+Number(r.qtd_videos||0);},0);
    var pacoteHtml=st?('<div class="brat-pack-status"><b>Pacote BRAT importado: '+H(st.mode==='zip'?(st.file&&st.file.name||'ZIP importado'):'Pasta importada')+'</b>'+Number(st.groups&&st.groups.length||0)+' pasta(s) reconhecida(s). Clique em <b style="display:inline">Baixar ZIP importado</b> para baixar o pacote completo e abrir as pastas no computador.</div>'):'<div class="brat-pack-status"><b>Nenhum pacote importado nesta sessão.</b>Importe o ZIP ou a pasta do BRAT. O sistema preenche os registros automaticamente e libera o botão para baixar o pacote completo.</div>';
    el.innerHTML='<div class="brat-pack-card"><div><h3>Importar BRAT e manter pacote para download</h3><p>Escolha o ZIP/pasta do BRAT. Os cards ficam preenchidos igual ao relatório inicial, e você pode baixar o ZIP completo depois para abrir as pastas no computador.</p></div><div class="brat-pack-actions"><button class="btn primary" onclick="document.getElementById(\'bratPackZipInput\').click()">Importar ZIP</button><button class="btn" onclick="document.getElementById(\'bratPackFolderInput\').click()">Importar pasta</button><button class="btn primary" onclick="baixarBratPacoteCompleto()">Baixar ZIP importado</button></div></div>'+pacoteHtml+'<div class="stats"><div class="stat"><span>BRATs</span><strong>'+list.length+'</strong><em>registros</em></div><div class="stat"><span>Fotos</span><strong>'+totalFotos+'</strong><em>imagens</em></div><div class="stat"><span>PDFs</span><strong>'+totalPdfs+'</strong><em>documentos</em></div><div class="stat"><span>Vídeos</span><strong>'+totalVideos+'</strong><em>arquivos</em></div></div><div class="filters"><div class="filter-row"><input id="bratPackSearch" placeholder="Buscar por placa, motorista, pasta ou BRAT"><select id="bratPackMonth"><option value="">Todos os meses</option>'+meses.map(function(m){return '<option value="'+H(m)+'">'+H(MN(m))+'</option>';}).join('')+'</select><select id="bratPackStatus"><option value="">Todos os status</option><option value="em_analise">Em análise</option><option value="pendente">Pendente</option><option value="finalizado">Finalizado</option></select></div></div><div class="brat-pack-grid" id="bratPackList"></div>';
    ['bratPackSearch','bratPackMonth','bratPackStatus'].forEach(function(i){var x=document.getElementById(i); if(x) x.oninput=renderCards;});
    renderCards();
  };
  try{render_brat=window.render_brat;}catch(e){}

  var oldNav=window.renderNav || (typeof renderNav==='function'?renderNav:null);
  if(oldNav&&!window.__BRAT_PACKAGE_NAV_WRAP__){window.__BRAT_PACKAGE_NAV_WRAP__=true; window.renderNav=function(){ensureBratPage(); return oldNav.apply(this,arguments);}; try{renderNav=window.renderNav;}catch(e){}}
  ensureBratPage(); ensureInputs(); setTimeout(function(){try{renderNav(); if((typeof currentPage!=='undefined'?currentPage:'')==='brat') window.render_brat();}catch(e){}},400);
})();

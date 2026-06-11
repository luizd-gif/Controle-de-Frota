(function(){
  'use strict';
  if(window.__BRAT_ANEXOS_VIEWER__) return;
  window.__BRAT_ANEXOS_VIEWER__ = true;

  function H(v){try{return esc(v);}catch(e){return String(v??'').replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c;});}}
  function C(v){try{return clean(v);}catch(e){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}}
  function YM(d){try{return ym(d);}catch(e){return /^\d{4}-\d{2}-\d{2}$/.test(String(d||''))?String(d).slice(0,7):'';}}
  function MN(m){try{return monthName(m);}catch(e){return m||'Todos os meses';}}
  function T(msg){try{toast(msg);}catch(e){alert(msg);}}
  function newId(){try{return id();}catch(e){return Date.now()+Math.floor(Math.random()*999);}}

  var PLACA_MAP = {'1J99':'KPT1J99','6E12':'KRF6E12','7F74':'LQM7F74','9F95':'LSE9F95'};
  var MOTORISTA_MAP = {'1J99':'VANILSON FRANCISCO BARBOSA','6E12':'LEONARDO DE SOUZA','7F74':'THIAGO ELIAS DA SILVA SANTOS','9F95':'DIEGO LUIZ NUNES DE FRANÇA'};

  window.__bratAnexosState = window.__bratAnexosState || null;

  function getExt(name){var m=String(name||'').toLowerCase().match(/\.([a-z0-9]+)$/); return m?m[1]:'';}
  function fileType(name){
    var e=getExt(name);
    if(/^(jpe?g|png|webp|gif|bmp)$/i.test(e)) return 'image';
    if(e==='pdf') return 'pdf';
    if(/^(mp4|mov|avi|mkv|webm)$/i.test(e)) return 'video';
    if(/^(docx?|xlsx?|pptx?|odt|ods|txt|csv)$/i.test(e)) return 'doc';
    return 'other';
  }
  function mimeFor(name){
    var e=getExt(name);
    if(e==='pdf') return 'application/pdf';
    if(e==='png') return 'image/png';
    if(e==='jpg'||e==='jpeg') return 'image/jpeg';
    if(e==='webp') return 'image/webp';
    if(e==='gif') return 'image/gif';
    if(e==='mp4') return 'video/mp4';
    if(e==='mov') return 'video/quicktime';
    if(e==='webm') return 'video/webm';
    return 'application/octet-stream';
  }
  function iconFor(t){return t==='image'?'📷':t==='pdf'?'📄':t==='video'?'🎥':t==='doc'?'📝':'📎';}
  function bytes(n){n=Number(n||0); if(!n) return '-'; if(n<1024) return n+' B'; if(n<1024*1024) return (n/1024).toFixed(1).replace('.',',')+' KB'; return (n/1024/1024).toFixed(1).replace('.',',')+' MB';}

  function splitZipPath(path){
    var parts=String(path||'').split('/').filter(Boolean);
    if(parts.length>=3) return {folder:parts[1], file:parts.slice(2).join('/')};
    if(parts.length>=2) return {folder:parts[0], file:parts.slice(1).join('/')};
    return null;
  }
  function inferData(files){
    var dates=[];
    files.forEach(function(f){var m=String(f.name||'').match(/(20\d{2})[-_\. ](\d{2})[-_\. ](\d{2})/); if(m) dates.push(m[1]+'-'+m[2]+'-'+m[3]);});
    dates.sort(); return dates[0]||'';
  }
  function inferMes(folder,data){
    var n=C(folder);
    if(n.indexOf('janeiro')>=0) return '2026-01'; if(n.indexOf('fevereiro')>=0) return '2026-02'; if(n.indexOf('marco')>=0) return '2026-03'; if(n.indexOf('abril')>=0) return '2026-04'; if(n.indexOf('maio')>=0) return '2026-05'; if(n.indexOf('junho')>=0) return '2026-06'; if(n.indexOf('julho')>=0) return '2026-07'; if(n.indexOf('agosto')>=0) return '2026-08'; if(n.indexOf('setembro')>=0) return '2026-09'; if(n.indexOf('outubro')>=0) return '2026-10'; if(n.indexOf('novembro')>=0) return '2026-11'; if(n.indexOf('dezembro')>=0) return '2026-12';
    return YM(data)||'';
  }
  function inferBratRecord(group, idx){
    var folder=group.folder||'';
    var upper=String(folder).toUpperCase();
    var codeMatch=upper.match(/[A-Z0-9]{4}/);
    var code=codeMatch?codeMatch[0].replace(/[^A-Z0-9]/g,''):'';
    var dataOc=inferData(group.files);
    var pdfs=group.files.filter(function(f){return getExt(f.name)==='pdf';}).map(function(f){return f.name;});
    var bratPdfs=pdfs.filter(function(f){return /brat|ebrat|20\d{10,}/i.test(f);});
    var numero=bratPdfs.length?bratPdfs.map(function(f){return f.replace(/\.pdf$/i,'');}).join(' / '):(pdfs[0]?pdfs[0].replace(/\.pdf$/i,''):'');
    return {id:Number(String((dataOc||'2026-01-01')).replace(/-/g,'')+String(idx+31).padStart(2,'0'))||newId(),mes:inferMes(folder,dataOc),data:dataOc,placa:PLACA_MAP[code]||code||'',motorista:MOTORISTA_MAP[code]||folder.replace(code,'').replace(/\b(JANEIRO|FEVEREIRO|MARCO|MARÇO|ABRIL|MAIO|JUNHO|JULHO|AGOSTO|SETEMBRO|OUTUBRO|NOVEMBRO|DEZEMBRO)\b/ig,'').trim(),numero_brat:numero,status:'em_analise',tipo:'BRAT / Sinistro',local:'',descricao:'Registro importado do ZIP: '+folder+'. Complete local, descrição do ocorrido e status.',pasta_origem:folder,qtd_fotos:group.files.filter(function(f){return fileType(f.name)==='image';}).length,qtd_videos:group.files.filter(function(f){return fileType(f.name)==='video';}).length,qtd_pdfs:group.files.filter(function(f){return getExt(f.name)==='pdf';}).length,arquivos:group.files.map(function(f){return f.name;}).join('\n'),obs:''};
  }
  function mergeRecords(records){
    try{
      if(typeof data==='undefined') return;
      data.brat=Array.isArray(data.brat)?data.brat:[];
      records.forEach(function(r){
        var found=data.brat.find(function(x){return C(x.pasta_origem||'')===C(r.pasta_origem||'') || (x.placa && r.placa && x.placa===r.placa && (x.data||'')===(r.data||''));});
        if(found){['mes','data','placa','motorista','numero_brat','tipo','pasta_origem','qtd_fotos','qtd_videos','qtd_pdfs','arquivos'].forEach(function(k){found[k]=r[k];}); if(!found.descricao) found.descricao=r.descricao; if(!found.status) found.status=r.status;}
        else data.brat.push(r);
      });
    }catch(e){}
  }

  function ensureInput(){
    if(document.getElementById('bratZipAnexosInput')) return;
    var input=document.createElement('input');
    input.id='bratZipAnexosInput'; input.type='file'; input.accept='.zip,application/zip,application/x-zip-compressed'; input.style.display='none';
    input.onchange=function(){if(this.files && this.files[0]) window.importarBratZipVerAnexos(this.files[0]); this.value='';};
    document.body.appendChild(input);
  }
  function ensureUI(){
    ensureInput();
    var el=document.getElementById('brat');
    if(el && !document.getElementById('bratAnexosPanel')){
      var after=document.getElementById('bratImportCard');
      var html='<div class="brat-anexos-panel" id="bratAnexosPanel"><div id="bratAnexosContent"></div></div>';
      if(after) after.insertAdjacentHTML('afterend',html); else el.insertAdjacentHTML('afterbegin',html);
    }
    var actionsBox=document.querySelector('#bratImportCard .brat-import-actions');
    if(actionsBox && !actionsBox.querySelector('[data-brat-anexos-import]')){
      actionsBox.insertAdjacentHTML('beforeend','<button data-brat-anexos-import class="btn" onclick="document.getElementById(\'bratZipAnexosInput\').click()">Importar ZIP e ver anexos</button><button data-brat-anexos-package class="btn" onclick="baixarBratZipOriginal()">Baixar pacote completo</button>');
    }
    var pageActions=document.getElementById('pageActions');
    try{
      if(pageActions && (typeof currentPage==='undefined' || currentPage==='brat') && !pageActions.querySelector('[data-brat-anexos-import]')){
        pageActions.insertAdjacentHTML('afterbegin','<button data-brat-anexos-import class="btn" onclick="document.getElementById(\'bratZipAnexosInput\').click()">Importar ZIP e ver anexos</button>');
      }
    }catch(e){}
    renderViewer();
  }

  var oldRenderBrat = window.render_brat || (typeof render_brat==='function'?render_brat:null);
  window.render_brat=function(){
    if(oldRenderBrat) oldRenderBrat.apply(this,arguments);
    ensureUI();
  };
  try{render_brat=window.render_brat;}catch(e){}

  window.importarBratZipVerAnexos = async function(file){
    if(!file) return;
    if(!window.JSZip){T('Biblioteca JSZip não carregou. Verifique a internet e tente novamente.'); return;}
    var panel=document.getElementById('bratAnexosPanel'); if(panel) panel.classList.add('open','brat-anexos-loading');
    try{
      T('Lendo ZIP e preparando anexos...');
      var zip=await JSZip.loadAsync(file);
      var groupsMap={}, filesByPath={};
      Object.keys(zip.files).forEach(function(path){
        var entry=zip.files[path];
        if(entry.dir || /thumbs\.db|__macosx/i.test(path)) return;
        var sp=splitZipPath(path); if(!sp || !sp.folder || !sp.file) return;
        groupsMap[sp.folder]=groupsMap[sp.folder]||{folder:sp.folder,files:[]};
        var item={name:sp.file,path:path,folder:sp.folder,entry:entry,ext:getExt(sp.file),type:fileType(sp.file),size:(entry._data && entry._data.uncompressedSize)||0};
        groupsMap[sp.folder].files.push(item); filesByPath[path]=item;
      });
      var groups=Object.keys(groupsMap).sort().map(function(k){groupsMap[k].files.sort(function(a,b){return a.name.localeCompare(b.name);}); return groupsMap[k];});
      if(!groups.length){T('Não encontrei arquivos válidos dentro do ZIP.'); return;}
      window.__bratAnexosState={file:file,zip:zip,groups:groups,filesByPath:filesByPath,loadedAt:new Date()};
      mergeRecords(groups.map(inferBratRecord));
      try{if(typeof renderNav==='function') renderNav();}catch(e){}
      renderViewer();
      try{if(typeof renderBratList==='function') renderBratList();}catch(e){}
      T('ZIP importado. Agora você pode visualizar ou baixar os anexos.');
    }catch(err){console.error(err); T('Erro ao ler ZIP: '+(err.message||err));}
    finally{var p=document.getElementById('bratAnexosPanel'); if(p) p.classList.remove('brat-anexos-loading');}
  };

  function getFile(pathEnc){
    var path=decodeURIComponent(pathEnc||'');
    var st=window.__bratAnexosState;
    return st && st.filesByPath ? st.filesByPath[path] : null;
  }
  async function blobFor(item){
    var raw=await item.entry.async('blob');
    return new Blob([raw],{type:mimeFor(item.name)});
  }
  function safeDownloadName(item){return String(item.name||'arquivo').split('/').filter(Boolean).pop()||'arquivo';}

  window.openBratAnexo = async function(pathEnc){
    var item=getFile(pathEnc); if(!item){T('Arquivo não encontrado. Importe o ZIP novamente.'); return;}
    try{
      var blob=await blobFor(item);
      var url=URL.createObjectURL(blob);
      if(item.type==='pdf'){
        var win=window.open(url,'_blank');
        if(!win){showPreview(item,url,'Seu navegador bloqueou a nova aba. Clique no botão abaixo para abrir o PDF.');}
        return;
      }
      if(item.type==='image' || item.type==='video'){
        showPreview(item,url,''); return;
      }
      showPreview(item,url,'Este tipo de arquivo pode não abrir direto no navegador. Use o botão baixar para visualizar no programa correto.');
    }catch(err){console.error(err); T('Não consegui abrir o anexo: '+(err.message||err));}
  };

  window.downloadBratAnexo = async function(pathEnc){
    var item=getFile(pathEnc); if(!item){T('Arquivo não encontrado. Importe o ZIP novamente.'); return;}
    try{
      var blob=await blobFor(item);
      var url=URL.createObjectURL(blob);
      var a=document.createElement('a'); a.href=url; a.download=safeDownloadName(item); document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function(){URL.revokeObjectURL(url);},5000);
    }catch(err){console.error(err); T('Não consegui baixar o anexo: '+(err.message||err));}
  };

  window.baixarBratZipOriginal = function(){
    var st=window.__bratAnexosState;
    if(!st || !st.file){T('Importe um ZIP primeiro para baixar o pacote completo.'); return;}
    var url=URL.createObjectURL(st.file);
    var a=document.createElement('a'); a.href=url; a.download=st.file.name||'BRAT_anexos.zip'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){URL.revokeObjectURL(url);},5000);
  };

  window.gerarPdfBratZipAtual = function(){
    var st=window.__bratAnexosState;
    if(!st || !st.file){T('Importe um ZIP primeiro para gerar o PDF desse pacote.'); return;}
    if(typeof window.importarBratZipGerarPdf==='function') window.importarBratZipGerarPdf(st.file);
    else T('Gerador de PDF não está disponível neste index.');
  };

  function showPreview(item,url,note){
    var title='Anexo BRAT - '+safeDownloadName(item);
    var body='';
    if(item.type==='image') body='<div class="brat-anexos-preview"><img src="'+H(url)+'" alt="'+H(item.name)+'"></div>';
    else if(item.type==='video') body='<div class="brat-anexos-preview"><video src="'+H(url)+'" controls></video></div>';
    else body='<div class="brat-anexos-preview"><div class="brat-anexos-empty">'+H(note||'Arquivo pronto para abrir ou baixar.')+'</div><a class="btn primary" href="'+H(url)+'" target="_blank" rel="noopener">Abrir arquivo</a></div>';
    body += '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px;flex-wrap:wrap"><button class="btn" onclick="downloadBratAnexo(\''+encodeURIComponent(item.path)+'\')">Baixar original</button><a class="btn primary" href="'+H(url)+'" target="_blank" rel="noopener">Abrir em nova aba</a></div>';
    if(note && item.type!=='other' && item.type!=='doc') body='<div class="brat-anexos-empty">'+H(note)+'</div>'+body;
    var bg=document.getElementById('modalBg'), mt=document.getElementById('modalTitle'), mb=document.getElementById('modalBody');
    if(bg && mt && mb){mt.textContent=title; mb.innerHTML=body; bg.classList.add('open');}
    else{window.open(url,'_blank');}
  }

  function renderViewer(){
    var panel=document.getElementById('bratAnexosPanel'), box=document.getElementById('bratAnexosContent');
    if(!panel || !box) return;
    var st=window.__bratAnexosState;
    if(!st || !st.groups || !st.groups.length){
      panel.classList.remove('open');
      box.innerHTML='';
      return;
    }
    panel.classList.add('open');
    var all=[]; st.groups.forEach(function(g){all=all.concat(g.files);});
    var count=function(t){return all.filter(function(f){return f.type===t;}).length;};
    box.innerHTML='<div class="brat-anexos-head"><div><h3>Anexos importados do BRAT</h3><small>Arquivo: '+H(st.file.name||'-')+' • '+st.groups.length+' pasta(s). Visualize ou baixe os documentos sem sair do sistema.</small></div><div class="brat-anexos-tools"><button class="btn" onclick="document.getElementById(\'bratZipAnexosInput\').click()">Trocar ZIP</button><button class="btn" onclick="gerarPdfBratZipAtual()">Gerar PDF desse ZIP</button><button class="btn primary" onclick="baixarBratZipOriginal()">Baixar pacote completo</button></div></div>'+
      '<div class="brat-anexos-summary"><div class="brat-anexos-stat"><span>Pastas</span><b>'+st.groups.length+'</b></div><div class="brat-anexos-stat"><span>Imagens</span><b>'+count('image')+'</b></div><div class="brat-anexos-stat"><span>PDFs</span><b>'+count('pdf')+'</b></div><div class="brat-anexos-stat"><span>Vídeos/docs</span><b>'+(count('video')+count('doc')+count('other'))+'</b></div></div>'+
      '<div class="brat-anexos-folders">'+st.groups.map(function(g){
        return '<div class="brat-anexos-folder"><div class="brat-anexos-folder-title"><div><b>'+H(g.folder)+'</b><small>'+g.files.length+' arquivo(s)</small></div><span class="brat-anexos-package">📦 BRAT</span></div><div class="brat-anexos-file-list">'+g.files.map(function(f){
          var enc=encodeURIComponent(f.path);
          var canOpen=(f.type==='image'||f.type==='pdf'||f.type==='video'||f.type==='doc'||f.type==='other');
          return '<div class="brat-anexos-file"><div class="brat-anexos-icon '+H(f.type)+'">'+iconFor(f.type)+'</div><div><b>'+H(f.name)+'</b><small>'+H(f.type.toUpperCase())+' • '+bytes(f.size)+'</small></div><div class="brat-anexos-actions">'+(canOpen?'<button class="btn" onclick="openBratAnexo(\''+enc+'\')">Visualizar</button>':'')+'<button class="btn primary" onclick="downloadBratAnexo(\''+enc+'\')">Baixar</button></div></div>';
        }).join('')+'</div></div>';
      }).join('')+'</div>';
  }

  setTimeout(function(){ensureUI();},400);
  setTimeout(function(){ensureUI();},1300);
})();

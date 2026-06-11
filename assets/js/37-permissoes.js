(function(){
  'use strict';
  if(window.__BRAT_MENU_PDF_FINAL__) return;
  window.__BRAT_MENU_PDF_FINAL__ = true;

  function H(v){try{return esc(v);}catch(e){return String(v??'').replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c;});}}
  function C(v){try{return clean(v);}catch(e){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}}
  function YM(d){try{return ym(d);}catch(e){return /^\d{4}-\d{2}-\d{2}$/.test(String(d||''))?String(d).slice(0,7):'';}}
  function MN(m){try{return monthName(m);}catch(e){return m||'Todos os meses';}}
  function T(msg){try{toast(msg);}catch(e){alert(msg);}}
  function newId(){try{return id();}catch(e){return Date.now()+Math.floor(Math.random()*999);}}

  var PLACA_MAP = {
    '1J99':'KPT1J99',
    '6E12':'KRF6E12',
    '7F74':'LQM7F74',
    '9F95':'LSE9F95'
  };
  var MOTORISTA_MAP = {
    '1J99':'VANILSON FRANCISCO BARBOSA',
    '6E12':'LEONARDO DE SOUZA',
    '7F74':'THIAGO ELIAS DA SILVA SANTOS',
    '9F95':'DIEGO LUIZ NUNES DE FRANÇA'
  };

  function registerBratPermanent(){
    try{
      if(typeof pages !== 'undefined' && Array.isArray(pages) && !pages.some(function(p){return p[0] === 'brat';})){
        pages.push(['brat','BRAT','Boletins de Registro de Acidente de Trânsito']);
      }
    }catch(e){}
    try{
      if(!document.getElementById('brat')){
        var main=document.querySelector('main.content') || document.querySelector('.content');
        if(main){
          var sec=document.createElement('section');
          sec.id='brat';
          sec.className='page';
          main.appendChild(sec);
        }
      }
    }catch(e){}
  }

  registerBratPermanent();

  var oldShowPage = window.showPage || (typeof showPage === 'function' ? showPage : null);
  if(oldShowPage && !window.__BRAT_SHOWPAGE_WRAPPED__){
    window.__BRAT_SHOWPAGE_WRAPPED__ = true;
    window.showPage = function(page){
      registerBratPermanent();
      return oldShowPage.apply(this, arguments);
    };
    try{ showPage = window.showPage; }catch(e){}
  }

  var oldRenderNavFinal = window.renderNav || (typeof renderNav === 'function' ? renderNav : null);
  if(oldRenderNavFinal && !window.__BRAT_RENDERNAV_WRAPPED__){
    window.__BRAT_RENDERNAV_WRAPPED__ = true;
    window.renderNav = function(){
      registerBratPermanent();
      return oldRenderNavFinal.apply(this, arguments);
    };
    try{ renderNav = window.renderNav; }catch(e){}
  }

  function addBratImportUI(){
    var el=document.getElementById('brat');
    if(!el) return;
    if(!document.getElementById('bratZipPdfInput')){
      var input=document.createElement('input');
      input.id='bratZipPdfInput';
      input.type='file';
      input.accept='.zip,application/zip,application/x-zip-compressed';
      input.style.display='none';
      input.onchange=function(){
        if(this.files && this.files[0]) window.importarBratZipGerarPdf(this.files[0]);
        this.value='';
      };
      document.body.appendChild(input);
    }
    if(!document.getElementById('bratImportCard')){
      el.insertAdjacentHTML('afterbegin',
        '<div class="brat-import-card" id="bratImportCard">'+
          '<div><b>Importar BRAT pelo ZIP e gerar PDF</b><small>Selecione a pasta compactada do BRAT. O sistema lê as pastas, lista os documentos e coloca as imagens no PDF consolidado.</small></div>'+
          '<div class="brat-import-actions"><button class="btn primary" onclick="document.getElementById(\'bratZipPdfInput\').click()">Importar ZIP e baixar PDF</button></div>'+
        '</div>'
      );
    }
    var actions=document.getElementById('pageActions');
    try{
      if(actions && (typeof currentPage === 'undefined' || currentPage === 'brat') && !actions.querySelector('[data-brat-import-btn]')){
        actions.insertAdjacentHTML('afterbegin','<button data-brat-import-btn class="btn primary" onclick="document.getElementById(\'bratZipPdfInput\').click()">Importar ZIP e baixar PDF</button>');
      }
    }catch(e){}
  }

  var oldRenderBratFinal = window.render_brat || (typeof render_brat === 'function' ? render_brat : null);
  window.render_brat = function(){
    registerBratPermanent();
    if(oldRenderBratFinal) oldRenderBratFinal.apply(this, arguments);
    else {
      var el=document.getElementById('brat');
      if(el) el.innerHTML='<div class="empty">Módulo BRAT carregando...</div>';
    }
    addBratImportUI();
  };
  try{ render_brat = window.render_brat; }catch(e){}

  function splitZipPath(path){
    var parts=String(path||'').split('/').filter(Boolean);
    if(parts.length>=3) return {folder:parts[1], file:parts.slice(2).join('/')};
    if(parts.length>=2) return {folder:parts[0], file:parts.slice(1).join('/')};
    return null;
  }

  function getExt(name){
    var m=String(name||'').toLowerCase().match(/\.([a-z0-9]+)$/);
    return m?m[1]:'';
  }

  function inferDataFromFiles(files){
    var dates=[];
    files.forEach(function(f){
      var m=String(f.name||'').match(/(20\d{2})[-_\. ](\d{2})[-_\. ](\d{2})/);
      if(m) dates.push(m[1]+'-'+m[2]+'-'+m[3]);
    });
    dates.sort();
    return dates[0] || '';
  }

  function inferMes(folder, data){
    var n=C(folder);
    if(n.indexOf('janeiro')>=0) return '2026-01';
    if(n.indexOf('fevereiro')>=0) return '2026-02';
    if(n.indexOf('marco')>=0) return '2026-03';
    if(n.indexOf('abril')>=0) return '2026-04';
    if(n.indexOf('maio')>=0) return '2026-05';
    if(n.indexOf('junho')>=0) return '2026-06';
    if(n.indexOf('julho')>=0) return '2026-07';
    if(n.indexOf('agosto')>=0) return '2026-08';
    if(n.indexOf('setembro')>=0) return '2026-09';
    if(n.indexOf('outubro')>=0) return '2026-10';
    if(n.indexOf('novembro')>=0) return '2026-11';
    if(n.indexOf('dezembro')>=0) return '2026-12';
    return YM(data) || '';
  }

  function inferBratRecord(group, idx){
    var folder=group.folder||'';
    var upper=String(folder).toUpperCase();
    var codeMatch=upper.match(/[A-Z0-9]{4}/);
    var code=codeMatch?codeMatch[0].replace(/[^A-Z0-9]/g,''):'';
    var dataOc=inferDataFromFiles(group.files);
    var pdfs=group.files.filter(function(f){return getExt(f.name)==='pdf';}).map(function(f){return f.name;});
    var bratPdfs=pdfs.filter(function(f){return /brat|ebrat|20\d{10,}/i.test(f);});
    var numero=bratPdfs.length?bratPdfs.map(function(f){return f.replace(/\.pdf$/i,'');}).join(' / '):(pdfs[0]?pdfs[0].replace(/\.pdf$/i,''):'');
    return {
      id: Number(String((dataOc||'2026-01-01')).replace(/-/g,'') + String(idx+1).padStart(2,'0')) || newId(),
      mes: inferMes(folder, dataOc),
      data: dataOc,
      placa: PLACA_MAP[code] || code || '',
      motorista: MOTORISTA_MAP[code] || folder.replace(code,'').replace(/\b(JANEIRO|FEVEREIRO|MARCO|MARÇO|ABRIL|MAIO|JUNHO|JULHO|AGOSTO|SETEMBRO|OUTUBRO|NOVEMBRO|DEZEMBRO)\b/ig,'').trim(),
      numero_brat: numero,
      status: 'em_analise',
      tipo: 'BRAT / Sinistro',
      local: '',
      descricao: 'Registro importado do ZIP: '+folder+'. Complete local, descrição do ocorrido e status.',
      pasta_origem: folder,
      qtd_fotos: group.files.filter(function(f){return /^(jpe?g|png|webp)$/i.test(getExt(f.name));}).length,
      qtd_videos: group.files.filter(function(f){return /^(mp4|mov|avi|mkv)$/i.test(getExt(f.name));}).length,
      qtd_pdfs: pdfs.length,
      arquivos: group.files.map(function(f){return f.name;}).join('\n'),
      obs: ''
    };
  }

  function mergeBratIntoData(records){
    try{
      if(typeof data === 'undefined') return;
      data.brat = Array.isArray(data.brat) ? data.brat : [];
      records.forEach(function(r){
        var found=data.brat.find(function(x){
          return C(x.pasta_origem||'')===C(r.pasta_origem||'') || (x.placa && r.placa && x.placa===r.placa && (x.data||'')===(r.data||''));
        });
        if(found){
          ['mes','data','placa','motorista','numero_brat','tipo','pasta_origem','qtd_fotos','qtd_videos','qtd_pdfs','arquivos'].forEach(function(k){found[k]=r[k];});
          if(!found.descricao) found.descricao=r.descricao;
          if(!found.status) found.status=r.status;
        }else{
          data.brat.push(r);
        }
      });
    }catch(e){}
  }

  function blobToDataURL(blob){
    return new Promise(function(resolve,reject){
      var reader=new FileReader();
      reader.onload=function(){resolve(reader.result);};
      reader.onerror=reject;
      reader.readAsDataURL(blob);
    });
  }

  function imageBlobToJpeg(blob){
    return new Promise(function(resolve,reject){
      var reader=new FileReader();
      reader.onload=function(){
        var img=new Image();
        img.onload=function(){
          var maxW=1300, maxH=1000;
          var scale=Math.min(1, maxW/img.width, maxH/img.height);
          var canvas=document.createElement('canvas');
          canvas.width=Math.max(1, Math.round(img.width*scale));
          canvas.height=Math.max(1, Math.round(img.height*scale));
          var ctx=canvas.getContext('2d');
          ctx.fillStyle='#ffffff';
          ctx.fillRect(0,0,canvas.width,canvas.height);
          ctx.drawImage(img,0,0,canvas.width,canvas.height);
          resolve({dataUrl:canvas.toDataURL('image/jpeg',0.78), width:canvas.width, height:canvas.height});
        };
        img.onerror=function(){reject(new Error('Imagem inválida'));};
        img.src=reader.result;
      };
      reader.onerror=reject;
      reader.readAsDataURL(blob);
    });
  }

  function addWrappedText(doc, text, x, y, maxW, lineH){
    var lines=doc.splitTextToSize(String(text||'-'), maxW);
    doc.text(lines, x, y);
    return y + (lines.length * lineH);
  }

  window.importarBratZipGerarPdf = async function(file){
    if(!file) return;
    if(!window.JSZip){T('Biblioteca JSZip não carregou. Verifique a internet e tente novamente.'); return;}
    if(!window.jspdf || !window.jspdf.jsPDF){T('Biblioteca jsPDF não carregou. Verifique a internet e tente novamente.'); return;}

    var importCard=document.getElementById('bratImportCard');
    if(importCard) importCard.classList.add('brat-pdf-loading');
    try{
      T('Lendo ZIP e montando PDF...');
      var zip=await JSZip.loadAsync(file);
      var groupsMap={};
      Object.keys(zip.files).forEach(function(path){
        var entry=zip.files[path];
        if(entry.dir) return;
        if(/thumbs\.db|__macosx/i.test(path)) return;
        var sp=splitZipPath(path);
        if(!sp || !sp.folder || !sp.file) return;
        groupsMap[sp.folder]=groupsMap[sp.folder] || {folder:sp.folder, files:[]};
        groupsMap[sp.folder].files.push({name:sp.file, path:path, entry:entry});
      });
      var groups=Object.keys(groupsMap).sort().map(function(k){
        groupsMap[k].files.sort(function(a,b){return a.name.localeCompare(b.name);});
        return groupsMap[k];
      });
      if(!groups.length){T('Não encontrei pastas/arquivos válidos dentro do ZIP.'); return;}
      var records=groups.map(inferBratRecord);
      mergeBratIntoData(records);

      var jsPDF=window.jspdf.jsPDF;
      var doc=new jsPDF({unit:'mm', format:'a4', orientation:'portrait'});
      var pageW=doc.internal.pageSize.getWidth();
      var pageH=doc.internal.pageSize.getHeight();
      var M=12;
      var y=18;

      function newPage(){doc.addPage(); y=16;}
      function header(title, subtitle){
        doc.setFont('helvetica','bold'); doc.setFontSize(16); doc.text(String(title||''), M, y); y+=7;
        if(subtitle){doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(90); y=addWrappedText(doc, subtitle, M, y, pageW-(M*2), 4.5)+2; doc.setTextColor(0);}
        doc.setDrawColor(220); doc.line(M, y, pageW-M, y); y+=7;
      }
      function ensureSpace(h){if(y+h>pageH-M){newPage();}}

      header('Relatório BRAT 2026', 'PDF gerado automaticamente a partir do ZIP importado no módulo BRAT da Gestão de Frota. PDFs e vídeos são listados; imagens são exibidas no relatório.');
      doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.text('Resumo do ZIP', M, y); y+=6;
      doc.setFont('helvetica','normal'); doc.setFontSize(10);
      y=addWrappedText(doc, 'Arquivo: '+file.name, M, y, pageW-(M*2), 5);
      y=addWrappedText(doc, 'Pastas encontradas: '+groups.length, M, y, pageW-(M*2), 5);
      y=addWrappedText(doc, 'Gerado em: '+new Date().toLocaleString('pt-BR'), M, y, pageW-(M*2), 5)+4;
      records.forEach(function(r,idx){
        ensureSpace(12);
        doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.text((idx+1)+'. '+(r.placa||'-')+' - '+(r.motorista||'-'), M, y); y+=5;
        doc.setFont('helvetica','normal'); doc.setFontSize(9);
        y=addWrappedText(doc, (r.pasta_origem||'-')+' | '+MN(r.mes)+' | '+r.qtd_fotos+' foto(s), '+r.qtd_pdfs+' PDF(s), '+r.qtd_videos+' vídeo(s)', M+4, y, pageW-(M*2)-4, 4.5)+2;
      });

      for(var gi=0; gi<groups.length; gi++){
        var group=groups[gi];
        var rec=records[gi];
        newPage();
        header((rec.placa||'-')+' - '+(rec.motorista||'-'), 'Pasta: '+(rec.pasta_origem||group.folder)+' | Mês: '+MN(rec.mes)+' | Data: '+(rec.data||'-'));
        doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.text('Informações', M, y); y+=6;
        doc.setFont('helvetica','normal'); doc.setFontSize(9);
        y=addWrappedText(doc, 'Número / arquivo BRAT: '+(rec.numero_brat||'Não informado'), M, y, pageW-(M*2), 4.5);
        y=addWrappedText(doc, 'Status: Em análise', M, y, pageW-(M*2), 4.5);
        y=addWrappedText(doc, 'Descrição: '+(rec.descricao||'-'), M, y, pageW-(M*2), 4.5)+3;
        var docs=group.files.filter(function(f){return /^(pdf|odt|docx?|xlsx?)$/i.test(getExt(f.name));});
        var videos=group.files.filter(function(f){return /^(mp4|mov|avi|mkv)$/i.test(getExt(f.name));});
        if(docs.length || videos.length){
          ensureSpace(16);
          doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.text('Documentos e vídeos no ZIP', M, y); y+=6;
          doc.setFont('helvetica','normal'); doc.setFontSize(8.5);
          docs.concat(videos).forEach(function(f){
            ensureSpace(5);
            y=addWrappedText(doc, '- '+f.name, M+2, y, pageW-(M*2)-2, 4.2);
          });
          y+=3;
        }
        var imgs=group.files.filter(function(f){return /^(jpe?g|png|webp)$/i.test(getExt(f.name));});
        if(imgs.length){
          ensureSpace(12);
          doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.text('Imagens', M, y); y+=6;
        }
        for(var ii=0; ii<imgs.length; ii++){
          var imgEntry=imgs[ii];
          try{
            var blob=await imgEntry.entry.async('blob');
            var img=await imageBlobToJpeg(blob);
            var maxW=pageW-(M*2), maxH=118;
            var drawW=maxW;
            var drawH=drawW*(img.height/img.width);
            if(drawH>maxH){drawH=maxH; drawW=drawH*(img.width/img.height);}
            ensureSpace(drawH+14);
            doc.setFont('helvetica','normal'); doc.setFontSize(8);
            y=addWrappedText(doc, imgEntry.name, M, y, pageW-(M*2), 4)+1;
            doc.addImage(img.dataUrl, 'JPEG', M, y, drawW, drawH, undefined, 'FAST');
            y+=drawH+7;
          }catch(imgErr){
            ensureSpace(8);
            doc.setFont('helvetica','normal'); doc.setFontSize(8);
            y=addWrappedText(doc, 'Imagem não carregada: '+imgEntry.name, M, y, pageW-(M*2), 4)+2;
          }
        }
      }

      var totalPages=doc.getNumberOfPages();
      for(var p=1;p<=totalPages;p++){
        doc.setPage(p);
        doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(120);
        doc.text('Gestão de Frota - BRAT', M, pageH-7);
        doc.text('Página '+p+' de '+totalPages, pageW-M-28, pageH-7);
        doc.setTextColor(0);
      }
      doc.save('BRAT_2026_relatorio.pdf');
      try{ if(typeof renderNav==='function') renderNav(); }catch(e){}
      try{ if(typeof render_brat==='function') render_brat(); }catch(e){}
      T('PDF do BRAT gerado. Verifique seus downloads.');
    }catch(err){
      console.error(err);
      T('Erro ao importar o ZIP/gerar PDF: '+(err.message||err));
    }finally{
      if(importCard) importCard.classList.remove('brat-pdf-loading');
    }
  };

  setTimeout(function(){
    registerBratPermanent();
    try{ if(typeof renderNav==='function') renderNav(); }catch(e){}
    try{ if((typeof currentPage !== 'undefined' ? currentPage : '') === 'brat') window.render_brat(); }catch(e){}
  },300);
  setTimeout(function(){
    registerBratPermanent();
    try{ if(typeof renderNav==='function') renderNav(); }catch(e){}
  },1200);
})();

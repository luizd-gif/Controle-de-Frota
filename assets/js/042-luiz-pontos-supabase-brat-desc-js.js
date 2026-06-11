(function(){
  'use strict';
  var W=window;
  function D(){try{if(!W.data) W.data={}; return W.data;}catch(e){return {};}}
  function arr(k){var d=D(); d[k]=Array.isArray(d[k])?d[k]:[]; return d[k];}
  function H(v){return String(v??'').replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c];});}
  function C(v){try{if(typeof clean==='function') return clean(v);}catch(e){} return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
  function F(v){try{if(typeof fmtDate==='function') return fmtDate(v);}catch(e){} return /^\d{4}-\d{2}-\d{2}$/.test(String(v||''))?String(v).split('-').reverse().join('/'):(v||'-');}
  function YM(v){try{if(typeof ym==='function') return ym(v);}catch(e){} return /^\d{4}-\d{2}-\d{2}$/.test(String(v||''))?String(v).slice(0,7):'';}
  function MN(v){try{if(typeof monthName==='function') return monthName(v);}catch(e){} return v||'Todos os meses';}
  function T(v){try{if(typeof toast==='function') return toast(v);}catch(e){} console.log(v);}
  function newId(){try{if(typeof id==='function') return id();}catch(e){} return Date.now()+Math.floor(Math.random()*999);}
  function db(){try{return typeof connectSupabase==='function'?connectSupabase():null;}catch(e){return null;}}
  function statsHtml(items){try{if(typeof stats==='function') return stats(items);}catch(e){} return '<div class="stats">'+items.map(function(x){return '<div class="stat"><span>'+H(x[0])+'</span><strong>'+H(x[1])+'</strong><em>'+H(x[2]||'')+'</em></div>';}).join('')+'</div>';}
  function tableHtml(title,heads,rows){var body=Array.isArray(rows)?rows.join(''):(rows||''); var count=Array.isArray(rows)?rows.length:(body?1:0); try{if(typeof table==='function') return table(title,heads,body);}catch(e){} return '<div class="table-card"><div class="table-head"><h3>'+H(title)+'</h3><small>'+count+' registro(s)</small></div><div class="table-scroll"><table><thead><tr>'+heads.map(function(h){return '<th>'+H(h)+'</th>';}).join('')+'</tr></thead><tbody>'+(body||'<tr><td colspan="99">Nenhum registro.</td></tr>')+'</tbody></table></div></div>'; }
  function setActs(html){try{if(typeof setActions==='function') return setActions(html);}catch(e){} var el=document.getElementById('pageActions'); if(el) el.innerHTML=html;}
  function statusFinal(v){
    try{if(typeof statusTagFinal==='function') return statusTagFinal(v);}catch(e){}
    var n=C(v), label=n.replace(/_/g,' ')||'-'; var cls=n==='finalizado'||n==='pago'||n==='ativo'?'green':(n.indexOf('analise')>=0?'blue':(n.indexOf('pend')>=0||n.indexOf('aguard')>=0?'amber':'gray'));
    return '<span class="tag '+cls+'">'+H(label)+'</span>';
  }
  function gravKey(v){var n=C(v); if(n.indexOf('gravissima')>=0)return'gravissima'; if(n.indexOf('grave')>=0)return'grave'; if(n.indexOf('media')>=0)return'media'; if(n.indexOf('leve')>=0)return'leve'; return n||'nao-informada';}
  function gravLabel(v){var k=gravKey(v); return k==='gravissima'?'Gravíssima':k==='grave'?'Grave':k==='media'?'Média':k==='leve'?'Leve':(v||'Não informada');}
  function ptsPorGravidade(v){var k=gravKey(v); return k==='gravissima'?7:k==='grave'?5:k==='media'?4:k==='leve'?3:Number(v)||0;}
  function gravTag(v){try{if(typeof gravidadeTag==='function') return gravidadeTag(v);}catch(e){} var k=gravKey(v), cls=k==='gravissima'?'gravissima':k==='grave'?'grave':k==='media'?'media':k==='leve'?'leve':'nao-informada'; return '<span class="tag sev-'+cls+'">'+H(gravLabel(v))+'</span>';}
  function riscoTag(pontos){var n=Number(pontos||0); if(n>=15) return '<span class="tag red">Alto</span>'; if(n>=8) return '<span class="tag amber">Atenção</span>'; return '<span class="tag green">Baixo</span>';}
  function rowToPonto(r){return {id:Number(r.id)||newId(),motorista:r.motorista||'',data:r.data||'',placa:String(r.placa||'').toUpperCase(),auto:r.auto||'',gravidade:r.gravidade||'',pontos:Number(r.pontos||0),aceitou:r.aceitou||'Pendente',multa_id:r.multa_id||r.multaId||null,origem:r.origem||r.origem_multa||'Supabase'};}
  function pontoToDb(p){return {id:Number(p.id)||newId(),motorista:p.motorista||'',data:p.data||null,placa:String(p.placa||'').toUpperCase(),auto:p.auto||'',gravidade:p.gravidade||'',pontos:Number(p.pontos||0),aceitou:p.aceitou||'Pendente',multa_id:p.multa_id||p.multaId||null,origem:p.origem||'manual'};}

  W.carregarPontosSupabaseFinal = async function(silent){
    var client=db();
    if(!client){ if(!silent) T('Supabase indisponível. Pontos carregados apenas localmente.'); return false; }
    try{
      W.__pontosLoadStarted=true;
      var res=await client.from('pontos').select('*').order('data',{ascending:false});
      if(res.error) throw res.error;
      D().pontos=(res.data||[]).map(rowToPonto);
      W.__pontosLoadedFromSupabase=true;
      W.__pontosLoadStarted=false;
      if(!silent) T('Pontos carregados do Supabase.');
      try{if((typeof currentPage!=='undefined'?currentPage:'')==='pontos') W.render_pontos();}catch(e){}
      try{if(typeof renderNav==='function') renderNav();}catch(e){}
      return true;
    }catch(e){
      W.__pontosLoadStarted=false;
      console.warn('Erro ao carregar pontos do Supabase:',e);
      if(!silent) T('Não consegui carregar public.pontos. Confira se o SQL foi rodado.');
      return false;
    }
  };

  W.salvarPontoSupabaseFinal = async function(p){
    var client=db(); if(!client) return false;
    var payload=pontoToDb(p);
    var res=await client.from('pontos').upsert(payload,{onConflict:'id'}).select().single();
    if(res.error) throw res.error;
    Object.assign(p,rowToPonto(res.data||payload));
    return true;
  };

  W.removerPontoSupabaseFinal = async function(itemId){
    var client=db(); if(!client) return false;
    var res=await client.from('pontos').delete().eq('id',itemId);
    if(res.error) throw res.error;
    return true;
  };

  function multaValida(m){return m && C(m.motorista) && C(m.motorista)!=='s/n' && C(m.motorista)!=='sem motorista';}
  W.sincronizarPontosMultasSupabase = async function(){
    arr('pontos'); arr('multas');
    await W.carregarPontosSupabaseFinal(true);
    var criados=0, atualizados=0;
    for(var i=0;i<D().multas.length;i++){
      var m=D().multas[i]; if(!multaValida(m)) continue;
      var existente=D().pontos.find(function(p){return (p.multa_id&&String(p.multa_id)===String(m.id)) || (m.auto&&C(p.auto)===C(m.auto));});
      var g=gravLabel(m.gravidade||m.gravidade_multa||m.infracao||'');
      var ponto=existente||{id:newId(),aceitou:'Pendente',origem:'multa vinculada'};
      ponto.motorista=m.motorista||''; ponto.data=m.data||''; ponto.placa=String(m.placa||m.carro||'').toUpperCase(); ponto.auto=m.auto||''; ponto.gravidade=g; ponto.pontos=ptsPorGravidade(g); ponto.multa_id=m.id||ponto.multa_id||null; ponto.origem='multa vinculada';
      if(!existente){D().pontos.push(ponto); criados++;} else atualizados++;
      try{await W.salvarPontoSupabaseFinal(ponto);}catch(e){console.warn('Falha ao salvar ponto:',e);}
    }
    await W.carregarPontosSupabaseFinal(true);
    T('Pontos sincronizados: '+criados+' novo(s), '+atualizados+' atualizado(s).');
  };

  W.render_pontos = function(){
    arr('pontos');
    if(!W.__pontosLoadedFromSupabase && !W.__pontosLoadStarted){ W.carregarPontosSupabaseFinal(true); }
    setActs('<button class="btn primary" onclick="sincronizarPontosMultasSupabase()">Sincronizar multas → pontos</button><button class="btn" onclick="carregarPontosSupabaseFinal(false)">Recarregar Supabase</button><button class="btn" onclick="openForm(&quot;pontos&quot;)">+ Lançar manual</button>');
    var resumo={};
    D().pontos.forEach(function(p){var k=p.motorista||'Sem motorista'; if(!resumo[k]) resumo[k]={motorista:k,pontos:0,qtd:0,grave:0}; resumo[k].pontos+=Number(p.pontos||0); resumo[k].qtd++; if(['grave','gravissima'].indexOf(gravKey(p.gravidade))>=0) resumo[k].grave++;});
    var res=Object.values(resumo).sort(function(a,b){return b.pontos-a.pontos;});
    var total=D().pontos.reduce(function(s,p){return s+Number(p.pontos||0);},0);
    var el=document.getElementById('pontos'); if(!el) return;
    el.innerHTML=statsHtml([['Motoristas',res.length,'com pontuação'],['Total pontos',total,'somados'],['Lançamentos',D().pontos.length,'vindos do Supabase'],['Risco alto',res.filter(function(r){return r.pontos>=15;}).length,'15+ pontos']])+ '<div class="filters"><div class="points-filter-row"><input id="pontosSearch" placeholder="Buscar motorista, placa, auto ou gravidade..."><select id="pontosGravidade"><option value="">Todas as gravidades</option><option value="leve">Leve</option><option value="media">Média</option><option value="grave">Grave</option><option value="gravissima">Gravíssima</option></select><select id="pontosAceite"><option value="">Todos os aceites</option><option value="sim">Sim</option><option value="nao">Não</option><option value="pendente">Pendente</option></select></div></div><div id="pontosInfo"></div>';
    ['pontosSearch','pontosGravidade','pontosAceite'].forEach(function(id){var x=document.getElementById(id); if(x)x.oninput=W.renderPontosList;});
    W.renderPontosList();
  };

  W.renderPontosList = function(){
    arr('pontos');
    var q=C(document.getElementById('pontosSearch')?.value||''), g=document.getElementById('pontosGravidade')?.value||'', a=C(document.getElementById('pontosAceite')?.value||'');
    var rows=D().pontos.filter(function(p){return (!q||C(Object.values(p).join(' ')).indexOf(q)>=0)&&(!g||gravKey(p.gravidade)===g)&&(!a||C(p.aceitou)===a);}).sort(function(x,y){return String(y.data||'').localeCompare(String(x.data||''));});
    var resumo={}; rows.forEach(function(p){var k=p.motorista||'Sem motorista'; if(!resumo[k])resumo[k]={motorista:k,pontos:0,qtd:0,grave:0}; resumo[k].pontos+=Number(p.pontos||0); resumo[k].qtd++; if(['grave','gravissima'].indexOf(gravKey(p.gravidade))>=0) resumo[k].grave++;});
    var res=Object.values(resumo).sort(function(a,b){return b.pontos-a.pontos;});
    var html1=tableHtml('Resumo por motorista',['Motorista','Pontos','Ocorrências','Graves','Risco'],res.map(function(r){return '<tr><td><b>'+H(r.motorista)+'</b></td><td><b>'+r.pontos+'</b><div class="progress"><div style="width:'+Math.min(r.pontos/40*100,100)+'%;background:'+(r.pontos>=15?'var(--red)':r.pontos>=8?'var(--amber)':'var(--green)')+'"></div></div></td><td>'+r.qtd+'</td><td>'+r.grave+'</td><td>'+riscoTag(r.pontos)+'</td></tr>'; }));
    var html2=tableHtml('Histórico de pontos',['Data','Motorista','Placa','Auto','Gravidade','Pontos','Aceitou','Origem','Ações'],rows.map(function(p){return '<tr><td>'+F(p.data)+'</td><td><b>'+H(p.motorista)+'</b></td><td><span class="plate">'+H(p.placa||'-')+'</span></td><td>'+H(p.auto||'-')+'</td><td>'+gravTag(p.gravidade)+'</td><td><b>'+Number(p.pontos||0)+'</b></td><td>'+H(p.aceitou||'Pendente')+'</td><td><span class="ponto-chip">'+H(p.origem||'manual')+'</span></td><td class="row-actions"><button class="icon-btn" onclick="openForm(&quot;pontos&quot;,'+Number(p.id)+')">✎</button><button class="icon-btn" onclick="removeItem(&quot;pontos&quot;,'+Number(p.id)+')">×</button></td></tr>'; }));
    var box=document.getElementById('pontosInfo'); if(box) box.innerHTML=(rows.length?html1+html2:'<div class="empty">Nenhum ponto encontrado no Supabase com esses filtros.</div>');
  };

  var oldSave=W.saveModal;
  W.saveModal=async function(){
    var ctx=null, before=[];
    try{ctx=(typeof modalCtx!=='undefined'&&modalCtx)?Object.assign({},modalCtx):null; before=arr('pontos').map(function(p){return String(p.id);});}catch(e){}
    var ret=oldSave?await oldSave.apply(this,arguments):undefined;
    try{
      if(ctx && ctx.key==='pontos'){
        var item=null;
        if(ctx.itemId) item=D().pontos.find(function(p){return String(p.id)===String(ctx.itemId);});
        if(!item) item=D().pontos.find(function(p){return before.indexOf(String(p.id))<0;}) || D().pontos[D().pontos.length-1];
        if(item){await W.salvarPontoSupabaseFinal(item); await W.carregarPontosSupabaseFinal(true); T('Ponto salvo no Supabase.');}
      }
    }catch(e){console.warn(e); T('Ponto salvo localmente, mas não foi para o Supabase. Confira a tabela public.pontos.');}
    return ret;
  };
  try{saveModal=W.saveModal;}catch(e){}

  var oldRemove=W.removeItem;
  W.removeItem=async function(key,itemId){
    if(key==='pontos'){
      var ok=confirm('Excluir este ponto?'); if(!ok) return;
      try{await W.removerPontoSupabaseFinal(itemId);}catch(e){console.warn(e); T('Não consegui excluir no Supabase. Vou remover da tela local.');}
      D().pontos=arr('pontos').filter(function(p){return String(p.id)!==String(itemId);});
      T('Ponto excluído.');
      try{if((typeof currentPage!=='undefined'?currentPage:'')==='pontos') W.render_pontos();}catch(e){}
      return;
    }
    return oldRemove?oldRemove.apply(this,arguments):undefined;
  };
  try{removeItem=W.removeItem;}catch(e){}

  function ext(n){var m=String(n||'').toLowerCase().match(/\.([a-z0-9]+)(?:\?|#)?$/); return m?m[1]:'';}
  function fileKind(n){var e=ext(n); if(['jpg','jpeg','png','webp','gif','heic'].indexOf(e)>=0)return'foto'; if(e==='pdf')return'pdf'; if(['mp4','mov','avi','mkv','webm'].indexOf(e)>=0)return'video'; return'arquivo';}
  function getBrats(){D().brat=Array.isArray(D().brat)?D().brat:[]; try{var cached=JSON.parse(localStorage.getItem('gf_brat_importados_cache')||'[]'); if(Array.isArray(cached)){cached.forEach(function(r){if(!D().brat.some(function(x){return String(x.id)===String(r.id) || (C(x.pasta_origem||'')&&C(x.pasta_origem||'')===C(r.pasta_origem||''));})) D().brat.push(r);});}}catch(e){} return D().brat;}
  function filesFor(r){
    if(W.__bratFilesById && W.__bratFilesById[r.id] && W.__bratFilesById[r.id].length) return W.__bratFilesById[r.id];
    return String(r.arquivos||'').split('\n').map(function(x){return x.trim();}).filter(Boolean).map(function(n){return {name:n,path:n,size:0};});
  }
  function filteredBrats(){
    var q=C(document.getElementById('bratSearchFinal')?.value||''), m=document.getElementById('bratMonthFinal')?.value||'', s=C(document.getElementById('bratStatusFinal')?.value||'');
    return getBrats().filter(function(r){return (!q||C(Object.values(r).join(' ')).indexOf(q)>=0)&&(!m||(r.mes||YM(r.data))===m)&&(!s||C(r.status)===s);}).sort(function(a,b){return String(b.data||'').localeCompare(String(a.data||''));});
  }
  W.renderBratCards=function(){
    var box=document.getElementById('bratListFinal'); if(!box) return;
    var rows=filteredBrats();
    box.innerHTML=rows.length?'<div class="brat-simple-grid">'+rows.map(function(r){
      var files=filesFor(r), total=files.length || (Number(r.qtd_fotos||0)+Number(r.qtd_pdfs||0)+Number(r.qtd_videos||0));
      var fotos=Number(r.qtd_fotos||files.filter(function(f){return fileKind(f.name)==='foto';}).length||0);
      var pdfs=Number(r.qtd_pdfs||files.filter(function(f){return fileKind(f.name)==='pdf';}).length||0);
      var vids=Number(r.qtd_videos||files.filter(function(f){return fileKind(f.name)==='video';}).length||0);
      var desc=String(r.descricao||'').trim();
      return '<article class="brat-simple-card status-'+H(C(r.status))+'">'+
        '<div class="brat-simple-top"><div><b><span class="plate">'+H(r.placa||'-')+'</span></b><small>'+H(r.motorista||'Sem motorista')+'</small></div>'+statusFinal(r.status)+'</div>'+
        '<div><b>'+H(r.numero_brat||'BRAT não informado')+'</b><small>'+F(r.data)+' • '+H(MN(r.mes||YM(r.data)))+'</small><p class="brat-card-description '+(!desc?'muted':'')+'">'+H(desc||'Sem descrição.')+'</p></div>'+
        '<div class="brat-simple-docs"><div class="brat-simple-doc"><b>'+fotos+'</b><span>Fotos</span></div><div class="brat-simple-doc"><b>'+pdfs+'</b><span>PDFs</span></div><div class="brat-simple-doc"><b>'+vids+'</b><span>Vídeos</span></div><div class="brat-simple-doc"><b>'+total+'</b><span>Arquivos</span></div></div>'+
        '<div class="brat-simple-tools"><button class="btn" onclick="openBratFiles('+Number(r.id)+')">Lista de arquivos</button><button class="btn" onclick="baixarArquivosBrat('+Number(r.id)+')">Baixar arquivos</button><button class="btn" onclick="openBratForm('+Number(r.id)+')">Editar</button><button class="icon-btn" onclick="removeBrat('+Number(r.id)+')">×</button></div>'+
      '</article>';
    }).join('')+'</div>':'<div class="empty">Nenhum BRAT cadastrado. Clique em Importar pasta ou Adicionar BRAT.</div>';
  };

  W.render_brat=function(){
    var list=getBrats();
    var meses=[...new Set(list.map(function(r){return r.mes||YM(r.data);}).filter(Boolean))].sort().reverse();
    var tf=list.reduce(function(s,r){return s+Number(r.qtd_fotos||0);},0), tp=list.reduce(function(s,r){return s+Number(r.qtd_pdfs||0);},0), tv=list.reduce(function(s,r){return s+Number(r.qtd_videos||0);},0);
    setActs('<button class="btn primary" onclick="document.getElementById(&quot;bratFolderOnlyInput&quot;).click()">Importar pasta</button><button class="btn primary" onclick="openBratForm()">+ Adicionar BRAT</button>');
    var el=document.getElementById('brat'); if(!el) return;
    el.innerHTML='<div class="brat-simple-hero"><div><h3>BRAT</h3><p>Importe a pasta do BRAT, edite as informações, veja a lista de arquivos e baixe os anexos quando precisar abrir no computador.</p></div><div class="brat-simple-actions"><button class="btn primary" onclick="document.getElementById(&quot;bratFolderOnlyInput&quot;).click()">Importar pasta</button><button class="btn primary" onclick="openBratForm()">+ Adicionar BRAT</button></div></div>'+statsHtml([['BRATs',list.length,'registros'],['Fotos',tf,'imagens'],['PDFs',tp,'documentos'],['Vídeos',tv,'arquivos']])+'<div class="filters"><div class="filter-row"><input id="bratSearchFinal" placeholder="Buscar placa, motorista, descrição ou arquivo..."><select id="bratMonthFinal"><option value="">Todos os meses</option>'+meses.map(function(m){return '<option value="'+H(m)+'">'+H(MN(m))+'</option>';}).join('')+'</select><select id="bratStatusFinal"><option value="">Todos os status</option><option value="em_analise">Em análise</option><option value="pendente">Pendente</option><option value="aguardando_docs">Aguardando docs</option><option value="finalizado">Finalizado</option></select></div></div><div id="bratListFinal"></div>';
    ['bratSearchFinal','bratMonthFinal','bratStatusFinal'].forEach(function(id){var x=document.getElementById(id); if(x)x.oninput=W.renderBratCards;});
    W.renderBratCards();
  };
  try{render_brat=W.render_brat; renderPontosList=W.renderPontosList; render_pontos=W.render_pontos;}catch(e){}

  setTimeout(function(){
    try{if((typeof currentPage!=='undefined'?currentPage:'')==='pontos') W.render_pontos(); else W.carregarPontosSupabaseFinal(true);}catch(e){}
    try{if((typeof currentPage!=='undefined'?currentPage:'')==='brat') W.render_brat();}catch(e){}
  },900);
})();

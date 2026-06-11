(function(){
  'use strict';

  var BRAT_SEEDS = [{"id": 202604301, "mes": "2026-04", "data": "2026-04-30", "placa": "KPT1J99", "motorista": "VANILSON FRANCISCO BARBOSA", "numero_brat": "20260506000000048550 / 20260506000000048712", "status": "em_analise", "tipo": "BRAT / Sinistro", "local": "", "descricao": "Registro importado do ZIP: 1J99 VANILSON Abril. Complete local, descrição do ocorrido e status.", "pasta_origem": "1J99 VANILSON Abril", "qtd_fotos": 9, "qtd_videos": 1, "qtd_pdfs": 2, "arquivos": "20260506000000048550.pdf\n20260506000000048712.pdf\nWhatsApp Image 2026-04-30 at 19.22.49 (1).jpeg\nWhatsApp Image 2026-04-30 at 19.22.49 (2).jpeg\nWhatsApp Image 2026-04-30 at 19.22.49 (3) - Copia.jpeg\nWhatsApp Image 2026-04-30 at 19.22.49 (3).jpeg\nWhatsApp Image 2026-04-30 at 19.22.49.jpeg\nWhatsApp Image 2026-04-30 at 19.25.15.jpeg\nWhatsApp Image 2026-04-30 at 19.25.16 (1).jpeg\nWhatsApp Image 2026-04-30 at 19.25.16 (2).jpeg\nWhatsApp Image 2026-04-30 at 19.25.16.jpeg\nWhatsApp Video 2026-05-15 at 14.27.18.mp4\nregistro de conversa.odt", "obs": ""}, {"id": 202605132, "mes": "2026-05", "data": "2026-05-13", "placa": "KRF6E12", "motorista": "LEONARDO DE SOUZA", "numero_brat": "EBRAT", "status": "em_analise", "tipo": "BRAT / Sinistro", "local": "", "descricao": "Registro importado do ZIP: 6e12 LEONARDO DE SOUZA MAIO. Complete local, descrição do ocorrido e status.", "pasta_origem": "6e12 LEONARDO DE SOUZA MAIO", "qtd_fotos": 6, "qtd_videos": 0, "qtd_pdfs": 4, "arquivos": "CNH LEONARDO DE SOUZA 04042034.pdf\nCNH-e.pdf.pdf\nCRLV-e_2211801054129BG1553.pdf.pdf\nEBRAT.pdf\nWhatsApp Image 2026-05-13 at 12.11.56.jpeg\nWhatsApp Image 2026-05-13 at 12.11.57 (1).jpeg\nWhatsApp Image 2026-05-13 at 12.11.57 (2).jpeg\nWhatsApp Image 2026-05-13 at 12.11.57 (3).jpeg\nWhatsApp Image 2026-05-13 at 12.11.57.jpeg\nWhatsApp Image 2026-05-27 at 21.14.11.jpeg", "obs": ""}, {"id": 202605153, "mes": "2026-05", "data": "2026-05-15", "placa": "LQM7F74", "motorista": "THIAGO ELIAS DA SILVA SANTOS", "numero_brat": "EBRAT", "status": "em_analise", "tipo": "BRAT / Sinistro", "local": "", "descricao": "Registro importado do ZIP: 7F74 THIAGO ELIAS MAIO. Complete local, descrição do ocorrido e status.", "pasta_origem": "7F74 THIAGO ELIAS MAIO", "qtd_fotos": 3, "qtd_videos": 1, "qtd_pdfs": 3, "arquivos": "CNH THIAGO ELIAS DA SILVA SANTOS 29012033.pdf\nCRLVDigital_LQM7F74_2026.pdf\nEBRAT.pdf\nWhatsApp Image 2026-05-15 at 18.06.51.jpeg\nWhatsApp Image 2026-05-15 at 18.06.52.jpeg\nWhatsApp Image 2026-05-15 at 18.26.12.jpeg\nWhatsApp Video 2026-05-15 at 18.06.51.mp4", "obs": ""}, {"id": 202605284, "mes": "2026-05", "data": "2026-05-28", "placa": "LSE9F95", "motorista": "DIEGO LUIZ NUNES DE FRANÇA", "numero_brat": "BRAT 28052026 / cópia do ebrat", "status": "em_analise", "tipo": "BRAT / Sinistro", "local": "", "descricao": "Registro importado do ZIP: 9F95 DIEGO LUIZ  MAIO. Complete local, descrição do ocorrido e status.", "pasta_origem": "9F95 DIEGO LUIZ  MAIO", "qtd_fotos": 7, "qtd_videos": 0, "qtd_pdfs": 2, "arquivos": "BRAT 28052026.pdf\nWhatsApp Image 2026-05-28 at 17.09.29 (1).jpeg\nWhatsApp Image 2026-05-28 at 17.09.29 (2).jpeg\nWhatsApp Image 2026-05-28 at 17.09.29.jpeg\nWhatsApp Image 2026-05-28 at 17.09.30 (1).jpeg\nWhatsApp Image 2026-05-28 at 17.09.30.jpeg\nWhatsApp Image 2026-05-28 at 17.20.48 - Copia.jpeg\nWhatsApp Image 2026-05-28 at 17.20.48.jpeg\ncópia do ebrat.pdf", "obs": ""}];

  function H(v){try{return typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}catch(e){return String(v??'')}}
  function C(v){try{return typeof clean==='function'?clean(v):String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}catch(e){return String(v??'').toLowerCase().trim()}}
  function F(v){try{return typeof fmtDate==='function'?fmtDate(v):(v||'-')}catch(e){return v||'-'}}
  function YM(v){try{return typeof ym==='function'?ym(v):(/^\d{4}-\d{2}-\d{2}$/.test(v||'')?String(v).slice(0,7):'')}catch(e){return ''}}
  function MN(v){try{return typeof monthName==='function'?monthName(v):(v||'')}catch(e){return v||''}}
  function T(msg){try{if(typeof toast==='function') toast(msg); else console.log(msg)}catch(e){console.log(msg)}}
  function newId(){try{return typeof id==='function'?id():Date.now()+Math.floor(Math.random()*999)}catch(e){return Date.now()+Math.floor(Math.random()*999)}}
  function stTag(v){try{return typeof statusTag==='function'?statusTag(v):'<span class="tag gray">'+H(v||'-')+'</span>'}catch(e){return '<span class="tag gray">'+H(v||'-')+'</span>'}}
  function gravTag(v){try{return typeof gravidadeTag==='function'?gravidadeTag(v):'<span class="tag gray">'+H(v||'-')+'</span>'}catch(e){return '<span class="tag gray">'+H(v||'-')+'</span>'}}

  function ensurePontosBratBase(){
    if(typeof data==='undefined') return;
    if(!Array.isArray(data.pontos)) data.pontos=[];
    if(!Array.isArray(data.brat)) data.brat=[];
    if(data.brat.length===0){
      data.brat = BRAT_SEEDS.map(function(r){return Object.assign({}, r);});
    }

    try{
      if(typeof pages!=='undefined' && Array.isArray(pages) && !pages.some(function(p){return p[0]==='brat'})){
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

    try{
      if(typeof schemas!=='undefined'){
        schemas.brat = schemas.brat || [
          ['data','Data do ocorrido','date'],
          ['mes','Mês / Pasta','text'],
          ['placa','Placa','text'],
          ['motorista','Motorista','text'],
          ['numero_brat','Número / arquivo BRAT','text'],
          ['status','Status','select:aberto,em_analise,aguardando_docs,finalizado'],
          ['tipo','Tipo','text'],
          ['local','Local','text'],
          ['descricao','Descrição','text'],
          ['arquivos','Arquivos','text'],
          ['obs','Observações','text']
        ];
        if(Array.isArray(schemas.pontos)){
          if(!schemas.pontos.some(function(c){return c[0]==='multa_id'})) schemas.pontos.push(['multa_id','ID da multa vinculada','number']);
          if(!schemas.pontos.some(function(c){return c[0]==='origem'})) schemas.pontos.push(['origem','Origem','text']);
        }
      }
    }catch(e){}
  }

  function gravidadeKey(v){
    var n=C(v);
    if(n.indexOf('gravissima')>=0) return 'gravissima';
    if(n.indexOf('grave')>=0) return 'grave';
    if(n.indexOf('media')>=0) return 'media';
    if(n.indexOf('leve')>=0) return 'leve';
    return '';
  }
  function gravidadeLabel(v){
    var k=gravidadeKey(v);
    return k==='gravissima'?'Gravíssima':k==='grave'?'Grave':k==='media'?'Média':k==='leve'?'Leve':'Não informada';
  }
  function pontosPorGravidade(v){
    var k=gravidadeKey(v);
    if(k==='gravissima') return 7;
    if(k==='grave') return 5;
    if(k==='media') return 4;
    if(k==='leve') return 3;
    return 4;
  }
  function inferGravidadeMulta(m){
    if(gravidadeKey(m && m.gravidade)) return gravidadeLabel(m.gravidade);
    var t=C([m&&m.infracao,m&&m.descricao,m&&m.obs].join(' '));
    if(t.indexOf('gravissima')>=0) return 'Gravíssima';
    if(t.indexOf('grave')>=0) return 'Grave';
    if(t.indexOf('media')>=0) return 'Média';
    if(t.indexOf('leve')>=0) return 'Leve';
    return 'Média';
  }
  function pontoKeyFromMulta(m){
    var auto=C(m && m.auto);
    if(auto) return 'auto:'+auto;
    return 'multa:'+String(m && m.id || '');
  }
  function pontoDaMulta(m){
    var auto=C(m && m.auto);
    return (data.pontos||[]).find(function(p){
      return (p.multa_id && String(p.multa_id)===String(m.id)) ||
             (p.multaId && String(p.multaId)===String(m.id)) ||
             (p.origem_multa_id && String(p.origem_multa_id)===String(m.id)) ||
             (auto && C(p.auto)===auto) ||
             (p.autoPontoKey && p.autoPontoKey===pontoKeyFromMulta(m));
    });
  }
  function multaValidaParaPonto(m){
    if(!m) return false;
    var mot=C(m.motorista);
    if(!mot || mot==='s/n' || mot==='sem motorista') return false;
    return true;
  }
  function normalizarPonto(p){
    p.id=Number(p.id||newId());
    p.motorista=p.motorista||'';
    p.data=p.data||'';
    p.placa=String(p.placa||'').toUpperCase();
    p.auto=p.auto||'';
    p.gravidade=gravidadeLabel(p.gravidade);
    p.pontos=Number(p.pontos||pontosPorGravidade(p.gravidade));
    p.aceitou=p.aceitou||'Pendente';
    p.origem=p.origem||'manual';
    if(p.multaId && !p.multa_id) p.multa_id=p.multaId;
    if(p.origem_multa_id && !p.multa_id) p.multa_id=p.origem_multa_id;
    return p;
  }
  async function salvarPontoSupabaseFinal(p){
    try{
      var db=typeof connectSupabase==='function'?connectSupabase():null;
      if(!db) return false;
      p=normalizarPonto(p);
      var payload={
        id:Number(p.id),
        motorista:p.motorista||'',
        data:p.data||'',
        placa:p.placa||'',
        auto:p.auto||'',
        gravidade:p.gravidade||'',
        pontos:Number(p.pontos||0),
        aceitou:p.aceitou||'Pendente',
        multa_id:p.multa_id?Number(p.multa_id):null,
        origem:p.origem||''
      };
      var res=await db.from('pontos').upsert(payload,{onConflict:'id'});
      if(res.error) throw res.error;
      return true;
    }catch(e){
      try{
        var db2=typeof connectSupabase==='function'?connectSupabase():null;
        if(!db2) return false;
        var basic={
          id:Number(p.id),
          motorista:p.motorista||'',
          data:p.data||'',
          placa:p.placa||'',
          auto:p.auto||'',
          gravidade:p.gravidade||'',
          pontos:Number(p.pontos||0),
          aceitou:p.aceitou||'Pendente'
        };
        var res2=await db2.from('pontos').upsert(basic,{onConflict:'id'});
        if(res2.error) throw res2.error;
        return true;
      }catch(e2){
        console.warn('Ponto salvo localmente, mas não foi para o Supabase:', e2);
        return false;
      }
    }
  }

  window.sincronizarPontoDaMulta = async function(m){
    ensurePontosBratBase();
    if(!multaValidaParaPonto(m)) return null;
    var grav=inferGravidadeMulta(m);
    var p=pontoDaMulta(m);
    var novo=false;
    if(!p){
      p={id:newId()};
      data.pontos.push(p);
      novo=true;
    }
    Object.assign(p,{
      motorista:m.motorista||'',
      data:m.data||'',
      placa:String(m.placa||'').toUpperCase(),
      auto:m.auto||'',
      gravidade:grav,
      pontos:pontosPorGravidade(grav),
      aceitou:p.aceitou||'Pendente',
      multa_id:m.id,
      multaId:m.id,
      origem_multa_id:m.id,
      autoPontoKey:pontoKeyFromMulta(m),
      origem:'multa vinculada'
    });
    await salvarPontoSupabaseFinal(p);
    return {ponto:p, novo:novo};
  };

  window.sincronizarTodosPontosMultas = async function(silent){
    ensurePontosBratBase();
    var multas=(data.multas||[]).filter(multaValidaParaPonto);
    var criados=0, atualizados=0;
    for(var i=0;i<multas.length;i++){
      var antes=!!pontoDaMulta(multas[i]);
      var res=await window.sincronizarPontoDaMulta(multas[i]);
      if(res){ if(antes) atualizados++; else criados++; }
    }
    if(!silent) T('Pontos sincronizados: '+criados+' criados e '+atualizados+' atualizados.');
    try{ if(typeof showPage==='function') showPage('pontos'); }catch(e){ if(typeof window.render_pontos==='function') window.render_pontos(); }
    return {criados:criados, atualizados:atualizados};
  };

  async function carregarPontosSupabaseFinal(){
    try{
      var db=typeof connectSupabase==='function'?connectSupabase():null;
      if(!db) return false;
      var res=await db.from('pontos').select('*').order('data',{ascending:false});
      if(res.error) throw res.error;
      if(Array.isArray(res.data) && res.data.length){
        data.pontos=res.data.map(function(r){return normalizarPonto({
          id:r.id,motorista:r.motorista,data:r.data,placa:r.placa,auto:r.auto,gravidade:r.gravidade,pontos:r.pontos,aceitou:r.aceitou,multa_id:r.multa_id,origem:r.origem
        });});
        if(['pontos','dashboard','motoristas'].indexOf(typeof currentPage!=='undefined'?currentPage:'')>=0) showPage(currentPage);
      }
      return true;
    }catch(e){
      console.warn('Não carregou pontos do Supabase; mantendo dados locais.', e);
      return false;
    }
  }
  window.carregarPontosSupabaseSeguro = carregarPontosSupabaseFinal;

  function pointSummaryFinal(){
    var now=new Date();
    var limit=new Date(now.getFullYear(), now.getMonth(), now.getDate()-45);
    var map={};
    (data.pontos||[]).forEach(function(raw){
      var p=normalizarPonto(raw);
      var k=p.motorista||'Sem motorista';
      if(!map[k]) map[k]={motorista:k,pontos:0,qtd:0,pontos45:0,qtd45:0,grave:0,ultimas:[]};
      map[k].pontos+=Number(p.pontos||0);
      map[k].qtd++;
      if(['grave','gravissima'].indexOf(gravidadeKey(p.gravidade))>=0) map[k].grave++;
      if(/^\d{4}-\d{2}-\d{2}$/.test(p.data||'')){
        var d=new Date(p.data+'T00:00:00');
        if(d>=limit){ map[k].pontos45+=Number(p.pontos||0); map[k].qtd45++; }
      }
      map[k].ultimas.push(p);
    });
    return map;
  }

  window.render_pontos = function(){
    ensurePontosBratBase();
    try{ setActions('<button class="btn primary" onclick="openPontoFromMultaModal()">+ Lançar pela multa</button><button class="btn" onclick="openForm(&quot;pontos&quot;)">Lançar manual</button><button class="btn" onclick="sincronizarTodosPontosMultas(false)">Sincronizar multas → pontos</button>'); }catch(e){}
    var multasComMotorista=(data.multas||[]).filter(multaValidaParaPonto).length;
    var vinculados=(data.pontos||[]).filter(function(p){return p.multa_id||p.multaId||p.origem_multa_id||C(p.origem).indexOf('multa')>=0}).length;
    var resumo=Object.values(pointSummaryFinal());
    var total=resumo.reduce(function(s,r){return s+r.pontos},0);
    var alto=resumo.filter(function(r){return r.pontos>=15}).length;
    var warn = multasComMotorista>vinculados ? '<div class="points-warning-box"><div><b>Existem multas que ainda podem não estar vinculadas aos pontos.</b><small>Multas com motorista: '+multasComMotorista+' • Pontos vinculados: '+vinculados+'. Clique em sincronizar para reconstruir os pontos pela gravidade da multa.</small></div><button class="btn primary" onclick="sincronizarTodosPontosMultas(false)">Sincronizar agora</button></div>' : '';
    var el=document.getElementById('pontos');
    if(!el) return;
    el.innerHTML=stats([
      ['Motoristas',resumo.length,'com pontuação'],
      ['Total pontos',total,'somados'],
      ['Vinculados',vinculados,'pontos de multas'],
      ['Risco alto',alto,'15+ pontos']
    ])+warn+
    '<div class="filters"><div class="points-filter-row">'+
      '<input id="pontosSearch" placeholder="Buscar motorista, placa, auto, gravidade ou origem...">'+
      '<select id="pontosGravidade"><option value="">Todas as gravidades</option><option value="leve">Leve</option><option value="media">Média</option><option value="grave">Grave</option><option value="gravissima">Gravíssima</option></select>'+
      '<select id="pontosAceite"><option value="">Todos os aceites</option><option value="sim">Sim</option><option value="nao">Não</option><option value="pendente">Pendente</option></select>'+
    '</div></div><div id="pontosInfo"></div>';
    ['pontosSearch','pontosGravidade','pontosAceite'].forEach(function(id){var x=document.getElementById(id); if(x) x.oninput=window.renderPontosList;});
    window.renderPontosList();
  };
  try{ render_pontos=window.render_pontos; }catch(e){}

  window.renderPontosList = function(){
    ensurePontosBratBase();
    var q=C(document.getElementById('pontosSearch')?.value||'');
    var g=document.getElementById('pontosGravidade')?.value||'';
    var a=C(document.getElementById('pontosAceite')?.value||'');
    var hist=(data.pontos||[]).map(normalizarPonto).filter(function(p){
      var okBusca=!q || C(Object.values(p).join(' ')).indexOf(q)>=0;
      var okG=!g || gravidadeKey(p.gravidade)===g;
      var okA=!a || C(p.aceitou)===a;
      return okBusca && okG && okA;
    }).sort(function(x,y){return String(y.data||'').localeCompare(String(x.data||'')) || Number(y.id||0)-Number(x.id||0)});
    var resumo=Object.values(hist.reduce(function(acc,p){
      var k=p.motorista||'Sem motorista';
      if(!acc[k]) acc[k]={motorista:k,pontos:0,qtd:0,pontos45:0,qtd45:0,grave:0};
      acc[k].pontos+=Number(p.pontos||0); acc[k].qtd++;
      if(['grave','gravissima'].indexOf(gravidadeKey(p.gravidade))>=0) acc[k].grave++;
      return acc;
    },{})).sort(function(x,y){return y.pontos-x.pontos});
    var html1=table('Resumo por motorista',['Motorista','Pontos','Ocorrências','Graves','Risco'],resumo.map(function(r){return '<tr><td><b>'+H(r.motorista)+'</b></td><td><b>'+r.pontos+'</b><div class="progress"><div style="width:'+Math.min(r.pontos/40*100,100)+'%;background:'+(r.pontos>=15?'var(--red)':r.pontos>=8?'var(--amber)':'var(--green)')+'"></div></div></td><td>'+r.qtd+'</td><td>'+r.grave+'</td><td>'+((typeof riscoPontosTag==='function')?riscoPontosTag(r.pontos):stTag(r.pontos>=15?'alto':r.pontos>=8?'atenção':'baixo'))+'</td></tr>'}).join(''));
    var html2=table('Histórico de pontos',['Data','Motorista','Placa','Auto','Gravidade','Pontos','Aceitou','Origem','Ações'],hist.map(function(p){
      var abrir=p.multa_id?'<button class="point-linked-btn" onclick="openForm(&quot;multas&quot;,'+Number(p.multa_id)+')">Ver multa</button>':'';
      return '<tr><td>'+F(p.data)+'</td><td><b>'+H(p.motorista)+'</b></td><td><span class="plate">'+H(p.placa||'-')+'</span></td><td>'+H(p.auto||'-')+'</td><td>'+gravTag(p.gravidade)+'</td><td><b>'+Number(p.pontos||0)+'</b></td><td>'+H(p.aceitou||'Pendente')+'</td><td><span class="point-origin-chip">'+H(p.origem||'manual')+'</span></td><td class="row-actions">'+abrir+'<button class="icon-btn" onclick="openForm(&quot;pontos&quot;,'+Number(p.id)+')">✎</button><button class="icon-btn" onclick="removeItem(&quot;pontos&quot;,'+Number(p.id)+')">×</button></td></tr>';
    }).join(''));
    var box=document.getElementById('pontosInfo'); if(box) box.innerHTML=html1+html2;
  };
  try{ renderPontosList=window.renderPontosList; }catch(e){}

  function bratStatusLabel(v){
    var m={aberto:'Aberto',em_analise:'Em análise',aguardando_docs:'Aguardando docs',finalizado:'Finalizado'};
    return m[String(v||'').toLowerCase()]||String(v||'-').replaceAll('_',' ');
  }
  function bratStatusTag(v){
    var s=String(v||'em_analise').toLowerCase();
    var c=s==='finalizado'?'green':s==='aguardando_docs'?'red':s==='aberto'?'amber':'blue';
    return '<span class="tag '+c+'">'+H(bratStatusLabel(s))+'</span>';
  }
  function normalizarBrat(r){
    r=r||{};
    return {
      id:Number(r.id||newId()),
      mes:r.mes||YM(r.data)||'',
      data:r.data||'',
      placa:String(r.placa||'').toUpperCase(),
      motorista:r.motorista||'',
      numero_brat:r.numero_brat||r.numero||'',
      status:r.status||'em_analise',
      tipo:r.tipo||'BRAT / Sinistro',
      local:r.local||'',
      descricao:r.descricao||'',
      pasta_origem:r.pasta_origem||'',
      qtd_fotos:Number(r.qtd_fotos||0),
      qtd_videos:Number(r.qtd_videos||0),
      qtd_pdfs:Number(r.qtd_pdfs||0),
      arquivos:r.arquivos||'',
      obs:r.obs||''
    };
  }
  async function salvarBratSupabase(r){
    try{
      var db=typeof connectSupabase==='function'?connectSupabase():null;
      if(!db) return false;
      var p=normalizarBrat(r);
      var res=await db.from('brats').upsert(p,{onConflict:'id'});
      if(res.error) throw res.error;
      return true;
    }catch(e){console.warn('BRAT salvo localmente, mas não foi para Supabase:',e);return false;}
  }
  async function removerBratSupabase(idv){
    try{
      var db=typeof connectSupabase==='function'?connectSupabase():null;
      if(!db) return false;
      var res=await db.from('brats').delete().eq('id',idv);
      if(res.error) throw res.error;
      return true;
    }catch(e){console.warn('BRAT removido localmente, mas não removeu no Supabase:',e);return false;}
  }
  async function carregarBratsSupabase(){
    ensurePontosBratBase();
    try{
      var db=typeof connectSupabase==='function'?connectSupabase():null;
      if(!db) return false;
      var res=await db.from('brats').select('*').order('data',{ascending:false});
      if(res.error) throw res.error;
      if(Array.isArray(res.data) && res.data.length){
        data.brat=res.data.map(normalizarBrat);
        if((typeof currentPage!=='undefined'?currentPage:'')==='brat') window.render_brat();
        try{ if(typeof renderNav==='function') renderNav(); }catch(e){}
      }
      return true;
    }catch(e){console.warn('Não carregou BRAT do Supabase; usando registros importados do ZIP.',e);return false;}
  }
  window.carregarBratsSupabase=carregarBratsSupabase;

  window.syncBratSeedsSupabase=async function(){
    ensurePontosBratBase();
    var total=0;
    for(var i=0;i<(data.brat||[]).length;i++){ if(await salvarBratSupabase(data.brat[i])) total++; }
    T(total?('BRAT sincronizado no Supabase: '+total+' registro(s).'):'Não foi possível sincronizar. Confira o SQL/políticas do Supabase.');
  };

  window.openBratForm=function(itemId){
    ensurePontosBratBase();
    var item=itemId?(data.brat||[]).find(function(x){return String(x.id)===String(itemId)}):null;
    item=normalizarBrat(item||{id:newId(),data:new Date().toISOString().slice(0,10),mes:new Date().toISOString().slice(0,7),status:'aberto'});
    try{ modalCtx={key:'brat_custom',itemId:itemId||null, id:item.id}; }catch(e){}
    document.getElementById('modalTitle').textContent=(itemId?'Editar ':'Adicionar ')+'BRAT';
    document.getElementById('modalBody').innerHTML=
      '<div class="brat-modal-grid">'+
        '<div class="field"><label>Data do ocorrido</label><input id="brat_data" type="date" value="'+H(item.data||'')+'"></div>'+
        '<div class="field"><label>Mês / pasta</label><input id="brat_mes" type="text" value="'+H(item.mes||'')+'" placeholder="AAAA-MM"></div>'+
        '<div class="field"><label>Placa</label><input id="brat_placa" type="text" value="'+H(item.placa||'')+'"></div>'+
        '<div class="field"><label>Motorista</label><input id="brat_motorista" type="text" value="'+H(item.motorista||'')+'"></div>'+
        '<div class="field"><label>Número / arquivo BRAT</label><input id="brat_numero" type="text" value="'+H(item.numero_brat||'')+'"></div>'+
        '<div class="field"><label>Status</label><select id="brat_status"><option value="aberto" '+(item.status==='aberto'?'selected':'')+'>Aberto</option><option value="em_analise" '+(item.status==='em_analise'?'selected':'')+'>Em análise</option><option value="aguardando_docs" '+(item.status==='aguardando_docs'?'selected':'')+'>Aguardando docs</option><option value="finalizado" '+(item.status==='finalizado'?'selected':'')+'>Finalizado</option></select></div>'+
        '<div class="field"><label>Tipo</label><input id="brat_tipo" type="text" value="'+H(item.tipo||'')+'"></div>'+
        '<div class="field"><label>Local</label><input id="brat_local" type="text" value="'+H(item.local||'')+'"></div>'+
        '<div class="field full"><label>Descrição do ocorrido</label><textarea id="brat_descricao" placeholder="Descreva o acidente, avarias, envolvidos e providências...">'+H(item.descricao||'')+'</textarea></div>'+
        '<div class="field full"><label>Arquivos / documentos</label><textarea id="brat_arquivos" placeholder="Cole os nomes ou links dos arquivos.">'+H(item.arquivos||'')+'</textarea></div>'+
        '<div class="field full"><label>Observações</label><textarea id="brat_obs" placeholder="Ex.: aguardando motorista, aguardando seguradora, pendente fotos...">'+H(item.obs||'')+'</textarea></div>'+
      '</div>';
    document.querySelector('.modal-foot').innerHTML='<button class="btn" onclick="closeModal()">Cancelar</button><button class="btn primary" onclick="saveBratForm()">Salvar BRAT</button>';
    document.getElementById('modalBg').classList.add('open');
  };

  window.saveBratForm=async function(){
    ensurePontosBratBase();
    var ctx=(typeof modalCtx!=='undefined'&&modalCtx)?modalCtx:{};
    var item=ctx.itemId?(data.brat||[]).find(function(x){return String(x.id)===String(ctx.itemId)}):null;
    if(!item){item={id:ctx.id||newId()}; data.brat.push(item);}
    item.data=document.getElementById('brat_data')?.value||'';
    item.mes=document.getElementById('brat_mes')?.value||YM(item.data)||'';
    item.placa=String(document.getElementById('brat_placa')?.value||'').toUpperCase();
    item.motorista=document.getElementById('brat_motorista')?.value||'';
    item.numero_brat=document.getElementById('brat_numero')?.value||'';
    item.status=document.getElementById('brat_status')?.value||'em_analise';
    item.tipo=document.getElementById('brat_tipo')?.value||'';
    item.local=document.getElementById('brat_local')?.value||'';
    item.descricao=document.getElementById('brat_descricao')?.value||'';
    item.arquivos=document.getElementById('brat_arquivos')?.value||'';
    item.obs=document.getElementById('brat_obs')?.value||'';
    var linhas=(item.arquivos||'').split('\n').map(function(x){return x.trim()}).filter(Boolean);
    item.qtd_pdfs=linhas.filter(function(x){return /\.pdf$/i.test(x)}).length;
    item.qtd_videos=linhas.filter(function(x){return /\.(mp4|mov|avi)$/i.test(x)}).length;
    item.qtd_fotos=linhas.filter(function(x){return /\.(jpe?g|png|webp)$/i.test(x)}).length;
    await salvarBratSupabase(item);
    try{ closeModal(); }catch(e){}
    T('BRAT salvo.');
    try{ showPage('brat'); }catch(e){ window.render_brat(); }
  };

  window.removeBrat=function(itemId){
    if(!confirm('Excluir este BRAT?')) return;
    data.brat=(data.brat||[]).filter(function(x){return String(x.id)!==String(itemId)});
    removerBratSupabase(itemId);
    T('BRAT removido.');
    window.render_brat();
    try{ if(typeof renderNav==='function') renderNav(); }catch(e){}
  };

  window.openBratFiles=function(itemId){
    var item=(data.brat||[]).find(function(x){return String(x.id)===String(itemId)});
    if(!item) return;
    var files=String(item.arquivos||'').split('\n').map(function(x){return x.trim()}).filter(Boolean);
    document.getElementById('modalTitle').textContent='Documentos do BRAT';
    document.getElementById('modalBody').innerHTML=
      '<div style="margin-bottom:12px"><b>'+H(item.placa||'-')+' • '+H(item.motorista||'-')+'</b><small style="display:block;color:var(--muted);margin-top:4px">'+H(item.pasta_origem||item.numero_brat||'')+'</small></div>'+
      '<div class="brat-file-list">'+(files.length?files.map(function(f){return '<span>'+H(f)+'</span>'}).join(''):'<span>Nenhum arquivo listado.</span>')+'</div>';
    document.querySelector('.modal-foot').innerHTML='<button class="btn primary" onclick="closeModal()">Fechar</button>';
    document.getElementById('modalBg').classList.add('open');
  };

  window.render_brat=function(){
    ensurePontosBratBase();
    try{ setActions('<button class="btn" onclick="syncBratSeedsSupabase()">Sincronizar BRAT no Supabase</button><button class="btn primary" onclick="openBratForm()">+ Novo BRAT</button>'); }catch(e){}
    var rows=(data.brat||[]).map(normalizarBrat);
    var meses=[...new Set(rows.map(function(r){return r.mes||YM(r.data)}).filter(Boolean))].sort().reverse();
    var totalDocs=rows.reduce(function(s,r){return s+r.qtd_fotos+r.qtd_videos+r.qtd_pdfs},0);
    var pend=rows.filter(function(r){return r.status!=='finalizado'}).length;
    var el=document.getElementById('brat');
    if(!el) return;
    el.innerHTML=stats([
      ['BRATs',rows.length,'registros'],
      ['Pendentes',pend,'não finalizados'],
      ['Arquivos',totalDocs,'fotos/PDFs/vídeos'],
      ['Com vídeo',rows.filter(function(r){return r.qtd_videos>0}).length,'ocorrências']
    ])+
    '<div class="filters"><div class="filter-row with-sort">'+
      '<input id="bratSearch" placeholder="Buscar placa, motorista, número, pasta ou descrição...">'+
      '<select id="bratMonth"><option value="">Todos os meses</option>'+meses.map(function(m){return '<option value="'+H(m)+'">'+H(MN(m))+'</option>'}).join('')+'</select>'+
      '<select id="bratStatus"><option value="">Todos os status</option><option value="aberto">Aberto</option><option value="em_analise">Em análise</option><option value="aguardando_docs">Aguardando docs</option><option value="finalizado">Finalizado</option></select>'+
    '</div></div><div id="bratList"></div>';
    ['bratSearch','bratMonth','bratStatus'].forEach(function(id){var x=document.getElementById(id); if(x) x.oninput=window.renderBratList;});
    window.renderBratList();
  };
  try{ render_brat=window.render_brat; }catch(e){}

  window.renderBratList=function(){
    var q=C(document.getElementById('bratSearch')?.value||'');
    var m=document.getElementById('bratMonth')?.value||'';
    var s=document.getElementById('bratStatus')?.value||'';
    var rows=(data.brat||[]).map(normalizarBrat).filter(function(r){
      var okQ=!q || C(Object.values(r).join(' ')).indexOf(q)>=0;
      var okM=!m || (r.mes||YM(r.data))===m;
      var okS=!s || r.status===s;
      return okQ && okM && okS;
    }).sort(function(a,b){return String(b.data||'').localeCompare(String(a.data||''));});
    var box=document.getElementById('bratList'); if(!box) return;
    box.innerHTML=rows.length?'<div class="brat-folder-grid">'+rows.map(function(r){
      return '<article class="brat-card status-'+H(r.status)+'">'+
        '<div class="brat-card-head"><div><h3><span class="plate">'+H(r.placa||'-')+'</span></h3><small>'+H(r.motorista||'Sem motorista')+'</small></div>'+bratStatusTag(r.status)+'</div>'+
        '<div><b>'+H(r.numero_brat||'BRAT não informado')+'</b><small>'+F(r.data)+' • '+H(r.pasta_origem||r.tipo||'BRAT')+'</small><small>'+H(r.local||'Local não informado')+'</small></div>'+
        '<small>'+H(r.descricao||'Sem descrição.')+'</small>'+
        '<div class="brat-doc-grid"><div class="brat-doc-mini"><b>'+Number(r.qtd_fotos||0)+'</b><span>Fotos</span></div><div class="brat-doc-mini"><b>'+Number(r.qtd_pdfs||0)+'</b><span>PDFs</span></div><div class="brat-doc-mini"><b>'+Number(r.qtd_videos||0)+'</b><span>Vídeos</span></div></div>'+
        '<div class="brat-actions"><button class="btn" onclick="openBratFiles('+Number(r.id)+')">Documentos</button><button class="icon-btn" onclick="openBratForm('+Number(r.id)+')">✎</button><button class="icon-btn" onclick="removeBrat('+Number(r.id)+')">×</button></div>'+
      '</article>';
    }).join('')+'</div>':'<div class="empty">Nenhum BRAT encontrado nesse filtro.</div>';
  };

  var previousSaveModal=window.saveModal || (typeof saveModal==='function'?saveModal:null);
  window.saveModal=async function(){
    var ctx=(typeof modalCtx!=='undefined'&&modalCtx)?Object.assign({},modalCtx):null;
    if(ctx && ctx.key==='pontos'){
      ensurePontosBratBase();
      var obj=ctx.itemId?(data.pontos||[]).find(function(x){return String(x.id)===String(ctx.itemId)}):null;
      if(!obj){obj={id:newId()}; data.pontos.push(obj);}
      try{
        (schemas.pontos||[]).forEach(function(c){
          var prop=c[0], type=c[2]||'text', el=document.getElementById('f_'+prop);
          if(!el) return;
          var v=el.value;
          if(type==='number') v=Number(v||0);
          if(prop==='placa') v=String(v||'').toUpperCase();
          obj[prop]=v;
        });
      }catch(e){}
      normalizarPonto(obj);
      await salvarPontoSupabaseFinal(obj);
      try{ closeModal(); }catch(e){}
      T('Ponto salvo.');
      try{ showPage(currentPage||'pontos'); }catch(e){ window.render_pontos(); }
      return;
    }
    return previousSaveModal?previousSaveModal.apply(this,arguments):undefined;
  };
  try{ saveModal=window.saveModal; }catch(e){}

  ensurePontosBratBase();
  setTimeout(function(){
    ensurePontosBratBase();
    carregarPontosSupabaseFinal();
    carregarBratsSupabase();
    try{ if(typeof renderNav==='function') renderNav(); }catch(e){}
    try{ if((typeof currentPage!=='undefined'?currentPage:'')==='pontos') window.render_pontos(); }catch(e){}
    try{ if((typeof currentPage!=='undefined'?currentPage:'')==='brat') window.render_brat(); }catch(e){}
  },900);
})();

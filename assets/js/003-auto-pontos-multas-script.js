/* Luiz: ao salvar uma multa, cadastrar/atualizar automaticamente os pontos do motorista. */
(function(){
  const MAPA_PONTOS_MULTA = {
    'leve': 3,
    'media': 4,
    'média': 4,
    'grave': 5,
    'gravissima': 7,
    'gravíssima': 7
  };

  function normTxt(v){
    return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  }

  function gravidadeNice(v){
    const n=normTxt(v);
    if(n==='leve') return 'Leve';
    if(n==='media') return 'Média';
    if(n==='grave') return 'Grave';
    if(n==='gravissima') return 'Gravíssima';
    return '';
  }

  function inferirGravidadeDaMulta(multa){
    const manual=gravidadeNice(multa?.gravidade);
    if(manual) return manual;
    const texto=normTxt([multa?.infracao,multa?.descricao,multa?.obs].join(' '));
    if(texto.includes('gravissima')) return 'Gravíssima';
    if(texto.includes('grave')) return 'Grave';
    if(texto.includes('media')) return 'Média';
    if(texto.includes('leve')) return 'Leve';
    return 'Média';
  }

  function pontosDaGravidade(gravidade){
    const n=normTxt(gravidade);
    return MAPA_PONTOS_MULTA[n] || 4;
  }

  function pontoChave(multa){
    const auto=normTxt(multa?.auto);
    if(auto) return 'auto:'+auto;
    return 'multa:'+String(multa?.id||'');
  }

  function procurarPontoDaMulta(multa){
    const chave=pontoChave(multa);
    const auto=normTxt(multa?.auto);
    return (data.pontos||[]).find(p=>{
      if(p.origem_multa_id && String(p.origem_multa_id)===String(multa?.id)) return true;
      if(p.multaId && String(p.multaId)===String(multa?.id)) return true;
      if(auto && normTxt(p.auto)===auto) return true;
      return p.autoPontoKey===chave;
    });
  }

  async function salvarPontoSupabaseSeguro(ponto){
    try{
      const db = typeof connectSupabase==='function' ? connectSupabase() : null;
      if(!db) return false;
      const payload={
        id:Number(ponto.id),
        motorista:ponto.motorista||'',
        data:ponto.data||'',
        placa:ponto.placa||'',
        auto:ponto.auto||'',
        gravidade:ponto.gravidade||'',
        pontos:Number(ponto.pontos||0),
        aceitou:ponto.aceitou||'Pendente'
      };
      const {error}=await db.from('pontos').upsert(payload,{onConflict:'id'});
      if(error) throw error;
      return true;
    }catch(e){
      console.warn('Ponto automático criado localmente, mas não foi salvo no Supabase:', e);
      return false;
    }
  }

  async function sincronizarPontoDaMulta(multa){
    if(!multa || !multa.motorista || normTxt(multa.motorista)==='s/n') return null;
    if(!data.pontos) data.pontos=[];

    const gravidade=inferirGravidadeDaMulta(multa);
    const pontos=pontosDaGravidade(gravidade);
    let ponto=procurarPontoDaMulta(multa);
    const novo=!ponto;

    if(!ponto){
      ponto={id: (typeof id==='function'?id():Date.now())};
      data.pontos.push(ponto);
    }

    Object.assign(ponto,{
      motorista:multa.motorista||'',
      data:multa.data||'',
      placa:multa.placa||'',
      auto:multa.auto||'',
      gravidade,
      pontos,
      aceitou:ponto.aceitou||'Pendente',
      multaId:multa.id,
      origem_multa_id:multa.id,
      autoPontoKey:pontoChave(multa),
      origem:'multa automática'
    });

    await salvarPontoSupabaseSeguro(ponto);
    return {ponto,novo};
  }

  async function carregarPontosSupabaseSeguro(){
    try{
      const db = typeof connectSupabase==='function' ? connectSupabase() : null;
      if(!db) return;
      const {data:rows,error}=await db.from('pontos').select('*').order('data',{ascending:false});
      if(error) throw error;
      if(Array.isArray(rows)){
        data.pontos=rows.map(r=>({
          id:Number(r.id),
          motorista:r.motorista||'',
          data:r.data||'',
          placa:r.placa||'',
          auto:r.auto||'',
          gravidade:r.gravidade||'',
          pontos:Number(r.pontos||0),
          aceitou:r.aceitou||'Pendente'
        }));
        if(['pontos','motoristas','dashboard'].includes(currentPage)) showPage(currentPage);
      }
    }catch(e){
      console.warn('Não foi possível carregar pontos do Supabase. Usando dados locais.', e);
    }
  }

  window.sincronizarPontoDaMulta = sincronizarPontoDaMulta;
  window.carregarPontosSupabaseSeguro = carregarPontosSupabaseSeguro;

  if(window.schemas && Array.isArray(window.schemas?.multas)){
    const temGravidade = schemas.multas.some(c=>c[0]==='gravidade');
    if(!temGravidade){
      const idx = schemas.multas.findIndex(c=>c[0]==='infracao');
      schemas.multas.splice(idx>=0?idx+1:schemas.multas.length,0,['gravidade','Gravidade da infração','select:Automático,Leve,Média,Grave,Gravíssima']);
    }
  }

  const saveModalOriginal = window.saveModal;
  window.saveModal = async function(){
    const ctx = window.modalCtx ? {...window.modalCtx} : (typeof modalCtx!=='undefined' && modalCtx ? {...modalCtx} : null);
    const idsAntes = new Set((data?.multas||[]).map(x=>String(x.id)));
    await saveModalOriginal.apply(this, arguments);

    if(!ctx || ctx.key!=='multas') return;
    const multa = ctx.itemId
      ? (data.multas||[]).find(x=>String(x.id)===String(ctx.itemId))
      : ((data.multas||[]).find(x=>!idsAntes.has(String(x.id))) || (data.multas||[]).slice().sort((a,b)=>Number(b.id||0)-Number(a.id||0))[0]);

    const res = await sincronizarPontoDaMulta(multa);
    if(res){
      if(typeof toast==='function') toast(res.novo?'Multa salva e pontos cadastrados automaticamente.':'Multa salva e pontos atualizados automaticamente.');
      if(['multas','pontos','motoristas','dashboard'].includes(currentPage)) showPage(currentPage);
    }
  };

  // Carrega a tabela pontos, se existir no Supabase. Se não existir, o sistema continua usando os dados locais.
  setTimeout(carregarPontosSupabaseSeguro, 700);
})();

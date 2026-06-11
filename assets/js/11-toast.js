(function(){
  const CAMPOS_MULTAS_SUPABASE = [
    'id','linha','carro','placa','data','hora','local','municipio','infracao','auto',
    'motorista','valor','assinado','pago','envio_rca','prazo_aceite','dp','status','obs','data_suspeita'
  ];

  function montarPayloadMultaSeguro(r){
    r = r || {};
    const status = (typeof statusMulta === 'function' ? statusMulta(r.status) : r.status) ||
                   (typeof inferStatusMulta === 'function' ? inferStatusMulta(r) : 'aguardando_aceite');
    const payload = {
      id: Number(r.id),
      linha: String(r.linha ?? 'manual'),
      carro: r.placa || r.carro || '',
      placa: r.placa || r.carro || '',
      data: r.data || '',
      hora: r.hora || '',
      local: r.local || '',
      municipio: r.municipio || '',
      infracao: r.infracao || '',
      auto: r.auto || '',
      motorista: r.motorista || 'S/N',
      valor: Number(r.valor || 0),
      assinado: r.assinado || '',
      pago: r.pago || '',
      envio_rca: r.envioRCA || r.envio_rca || '',
      prazo_aceite: r.prazo || r.prazo_aceite || '',
      dp: r.dp || '',
      status: status,
      obs: r.obs || '',
      data_suspeita: !!(r.dataSuspeita || r.data_suspeita)
    };

    // Garante que NUNCA vá descricao/descricao_multa para a tabela multas.
    Object.keys(payload).forEach(k => { if(!CAMPOS_MULTAS_SUPABASE.includes(k)) delete payload[k]; });
    return payload;
  }

  async function salvarMultaSupabaseSeguro(obj){
    const db = typeof connectSupabase === 'function' ? connectSupabase() : null;
    if(!db) return false;

    const payload = montarPayloadMultaSeguro(obj);
    console.log('Payload seguro enviado para multas:', Object.keys(payload));

    const { error } = await db.from('multas').upsert(payload, { onConflict: 'id' });
    if(error) throw error;

    // Atualiza o objeto local sem depender do SELECT do Supabase.
    Object.assign(obj, {
      id: payload.id,
      linha: payload.linha,
      placa: payload.placa,
      data: payload.data,
      hora: payload.hora,
      local: payload.local,
      municipio: payload.municipio,
      infracao: payload.infracao,
      auto: payload.auto,
      motorista: payload.motorista,
      valor: payload.valor,
      assinado: payload.assinado,
      pago: payload.pago,
      envioRCA: payload.envio_rca,
      prazo: payload.prazo_aceite,
      dp: payload.dp,
      status: payload.status,
      obs: payload.obs,
      dataSuspeita: payload.data_suspeita
    });
    return true;
  }

  window.salvarMultaSupabase = salvarMultaSupabaseSeguro;
  try { salvarMultaSupabase = salvarMultaSupabaseSeguro; } catch(e) {}
})();

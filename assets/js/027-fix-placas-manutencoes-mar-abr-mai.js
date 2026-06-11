(function(){
  'use strict';
  const PLACAS={"0H70": "RIU0H70", "1C65": "TTJ1C65", "1E06": "TTL1E06", "1J99": "KPT1J99", "2D29": "SRB2D29", "2E49": "RKA2E49", "2F64": "RJU2F64", "3B79": "LNS3B79", "3J34": "KXJ3J34", "4117": "TUH4I17", "4B80": "TTN4B80", "4B83": "TTN4B83", "4E92": "TUH4E92", "4G76": "LUN4G76", "4I17": "TUH4I17", "5059": "KXO5A59", "5A59": "KXO5A59", "5C96": "RJR5C96", "5I29": "SRI5I29", "5I59": "KRA5I59", "6588": "KRS6588", "6E12": "KRF6E12", "6I41": "KWX6I41", "6J44": "TTE6J44", "7210": "LTF7210", "7A87": "LRQ7A87", "7C73": "TUD7C73", "7F74": "LQM7F74", "7H15": "KRK7H15", "7H47": "RKU7H47", "7J57": "RIR7J57", "7J59": "RIR7J59", "7J74": "RKD7J74", "8437": "LQE8437", "8541": "KRZ8541", "8F40": "KRZ8F40", "8F42": "KRZ8F42", "8F79": "RJL8F79", "8G84": "TUC8G84", "8I95": "KRU8I95", "8J14": "LTE8J14", "9A65": "LUH9A65", "9C37": "LSS9C37", "9D01": "LTM9D01", "9D02": "LTM9D02", "9D59": "TUB9D59", "9D76": "KYH9D76", "9F95": "LSE9F95", "ARGO5C96": "RJR5C96", "FIORINO7H15": "KRK7H15", "TUH4117": "TUH4I17"};
  const MESES={'2026-03':true,'2026-04':true,'2026-05':true};
  function norm(v){return String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');}
  function resolvePlaca(){
    for(const raw of arguments){
      const n=norm(raw);
      if(!n) continue;
      if(PLACAS[n]) return PLACAS[n];
      if(n.length>=4 && PLACAS[n.slice(-4)]) return PLACAS[n.slice(-4)];
      if(n==='5059') return 'KXO5A59';
      if(n==='TUH4117' || n==='4117') return 'TUH4I17';
    }
    return '';
  }
  window.corrigirPlacasManutencoesMarAbrMai=function(){
    if(!window.data || !Array.isArray(data.manutencoes)) return 0;
    let alteradas=0;
    data.manutencoes.forEach(function(r){
      const mes=String(r.data||'').slice(0,7);
      if(!MESES[mes]) return;
      const placa=resolvePlaca(r.origem,r.placa);
      if(placa && r.placa!==placa){ r.placa=placa; alteradas++; }
    });
    return alteradas;
  };
  const oldShow=window.showPage || (typeof showPage==='function'?showPage:null);
  if(oldShow){
    window.showPage=function(page){
      window.corrigirPlacasManutencoesMarAbrMai();
      const r=oldShow.apply(this,arguments);
      window.corrigirPlacasManutencoesMarAbrMai();
      return r;
    };
    try{ showPage=window.showPage; }catch(e){}
  }
  const oldSync=window.syncTodasAbasSupabase;
  if(typeof oldSync==='function'){
    window.syncTodasAbasSupabase=async function(){
      const r=await oldSync.apply(this,arguments);
      window.corrigirPlacasManutencoesMarAbrMai();
      if((window.currentPage||'')==='manutencoes' && typeof showPage==='function') showPage('manutencoes');
      return r;
    };
  }
  setTimeout(function(){ window.corrigirPlacasManutencoesMarAbrMai(); }, 300);
})();

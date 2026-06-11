(function(){
  function runCleanup(){
    try{ if(typeof window.aplicarDestaqueDescricoesDime==='function') window.aplicarDestaqueDescricoesDime(document); }catch(e){}
    try{ if(typeof window.moveUserPanelBottom==='function') window.moveUserPanelBottom(); }catch(e){}
  }
  try{
    var oldShowPage=window.showPage || (typeof showPage==='function'?showPage:null);
    if(typeof oldShowPage==='function' && !oldShowPage.__frotaDimeV5){
      var wrapped=function(){
        var r=oldShowPage.apply(this,arguments);
        setTimeout(runCleanup,80);
        setTimeout(runCleanup,300);
        return r;
      };
      wrapped.__frotaDimeV5=true;
      window.showPage=wrapped;
      try{ showPage=wrapped; }catch(e){}
    }
  }catch(e){}
  document.addEventListener('click',function(){setTimeout(runCleanup,120);},true);
})();

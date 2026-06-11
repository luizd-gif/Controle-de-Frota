(function(){
  if(window.__luizManutFiltroEstavelV1) return;
  window.__luizManutFiltroEstavelV1 = true;

  var lastManInputAt = 0;
  var delayedSyncTimer = null;
  var runningDelayedSync = false;

  function isManPage(){
    try { return (window.currentPage || (typeof currentPage !== 'undefined' ? currentPage : '')) === 'manutencoes'; }
    catch(e){ return false; }
  }
  function manInput(){ return document.getElementById('manSearch'); }
  function getSearchState(){
    var input = manInput();
    return {
      value: input ? input.value : '',
      focused: !!(input && document.activeElement === input),
      start: input && typeof input.selectionStart === 'number' ? input.selectionStart : null,
      end: input && typeof input.selectionEnd === 'number' ? input.selectionEnd : null,
      scrollTop: document.documentElement.scrollTop || document.body.scrollTop || 0
    };
  }
  function restoreSearchState(st){
    if(!isManPage() || !st) return;
    var input = manInput();
    if(input && typeof st.value === 'string' && input.value !== st.value){
      input.value = st.value;
    }
    if(input && st.focused){
      try { input.focus({preventScroll:true}); } catch(e){ try{ input.focus(); }catch(_){} }
      if(st.start !== null){
        try { input.setSelectionRange(st.start, st.end); } catch(e){}
      }
    }
    if(input && st.value && typeof window.renderManList === 'function'){
      try { window.renderManList(); } catch(e){}
    }
    if(st.focused){
      try { window.scrollTo({top:st.scrollTop, left:0, behavior:'auto'}); } catch(e){ window.scrollTo(0, st.scrollTop); }
    }
  }
  function userIsFilteringNow(){
    var input = manInput();
    var now = Date.now();
    return isManPage() && !!input && (document.activeElement === input || (now - lastManInputAt) < 2500);
  }
  function scheduleDelayedSync(){
    clearTimeout(delayedSyncTimer);
    delayedSyncTimer = setTimeout(async function(){
      if(!isManPage() || typeof window.carregarManutencoesSupabaseFonteUnica !== 'function') return;
      if(userIsFilteringNow()) { scheduleDelayedSync(); return; }
      runningDelayedSync = true;
      try { await window.carregarManutencoesSupabaseFonteUnica(); }
      catch(e){ console.warn('Sync de manutenções após filtro falhou:', e); }
      finally { runningDelayedSync = false; }
    }, 2800);
  }

  document.addEventListener('input', function(ev){
    if(ev && ev.target && ev.target.id === 'manSearch'){
      lastManInputAt = Date.now();
      scheduleDelayedSync();
    }
  }, true);

  function wrapRenderManutencoes(){
    var old = window.render_manutencoes || (typeof render_manutencoes === 'function' ? render_manutencoes : null);
    if(!old || old.__luizFiltroEstavelWrapped) return;
    var wrapped = function(){
      var st = getSearchState();
      var out = old.apply(this, arguments);
      restoreSearchState(st);
      setTimeout(function(){ restoreSearchState(st); }, 30);
      return out;
    };
    wrapped.__luizFiltroEstavelWrapped = true;
    window.render_manutencoes = wrapped;
    try { render_manutencoes = wrapped; } catch(e){}
  }

  function wrapShowPage(){
    var old = window.showPage || (typeof showPage === 'function' ? showPage : null);
    if(!old || old.__luizFiltroEstavelWrapped) return;
    var wrapped = function(page){
      var st = getSearchState();
      var out = old.apply(this, arguments);
      if((page || window.currentPage || '') === 'manutencoes'){
        restoreSearchState(st);
        setTimeout(function(){ restoreSearchState(st); }, 40);
      }
      return out;
    };
    wrapped.__luizFiltroEstavelWrapped = true;
    window.showPage = wrapped;
    try { showPage = wrapped; } catch(e){}
  }

  function wrapCarregarManutencoes(){
    var old = window.carregarManutencoesSupabaseFonteUnica;
    if(typeof old !== 'function' || old.__luizFiltroEstavelWrapped) return;
    var wrapped = async function(){
      if(!runningDelayedSync && userIsFilteringNow()){
        scheduleDelayedSync();
        return false;
      }
      var st = getSearchState();
      var out = await old.apply(this, arguments);
      restoreSearchState(st);
      setTimeout(function(){ restoreSearchState(st); }, 50);
      return out;
    };
    wrapped.__luizFiltroEstavelWrapped = true;
    window.carregarManutencoesSupabaseFonteUnica = wrapped;
  }

  function apply(){
    wrapRenderManutencoes();
    wrapShowPage();
    wrapCarregarManutencoes();
  }

  apply();
  document.addEventListener('DOMContentLoaded', apply);
  setTimeout(apply, 300);
  setTimeout(apply, 1200);
})();

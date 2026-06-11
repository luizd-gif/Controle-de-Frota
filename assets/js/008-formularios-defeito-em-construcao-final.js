(function(){
  function buildEmConstrucao(){
    if(typeof data!=='undefined') data.formularios_defeito=[];
    if(typeof selectedDefectMonth!=='undefined') selectedDefectMonth='';
    const html = `
      ${typeof stats==='function' ? stats([
        ['Status','Em construção','módulo reservado'],
        ['Registros','0','temporariamente vazio'],
        ['Cadastro','Em breve','relatórios de defeito'],
        ['Integração','Pendente','Supabase/arquivos']
      ]) : ''}
      <div class="table-card" style="padding:34px;min-height:300px;display:flex;align-items:center;justify-content:center;text-align:center;">
        <div style="max-width:640px;">
          <div style="font-size:46px;margin-bottom:14px;">🚧</div>
          <h3 style="margin:0 0 8px;font-size:22px;">Formulários de Defeito</h3>
          <p style="margin:0;color:var(--muted);line-height:1.55;">
            Esta aba está <strong>em construção</strong>. O layout foi mantido, mas os registros, PDFs,
            filtros e importações foram removidos temporariamente.
          </p>
        </div>
      </div>`;
    const el=document.getElementById('formularios_defeito');
    if(el) el.innerHTML=html;
  }
  window.carregarDefeitosSupabase = async function(){
    if(typeof data!=='undefined') data.formularios_defeito=[];
    if(typeof renderNav==='function') renderNav();
    if(window.currentPage==='formularios_defeito') buildEmConstrucao();
  };
  window.renderDefeitosList = function(){ buildEmConstrucao(); };
  window.selectDefectMonth = function(){ buildEmConstrucao(); };
  window.render_formularios_defeito = function(){
    if(typeof setActions==='function') setActions('');
    if(typeof data!=='undefined') data.formularios_defeito=[];
    buildEmConstrucao();
    if(typeof renderNav==='function') renderNav();
  };
  setTimeout(function(){
    if(typeof data!=='undefined') data.formularios_defeito=[];
    if(typeof renderNav==='function') renderNav();
    if(window.currentPage==='formularios_defeito') buildEmConstrucao();
  },0);
})();

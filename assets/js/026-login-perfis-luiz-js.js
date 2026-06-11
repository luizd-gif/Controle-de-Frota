(function(){
  const AUTH_USERS={
    admin:{senha:'1234',nome:'Gestão de Frota',perfil:'admin',label:'Administrador'},
    gestao:{senha:'1234',nome:'Gestão de Frota',perfil:'admin',label:'Administrador'},
    mecanico:{senha:'1234',nome:'Mecânico',perfil:'mecanico',label:'Somente leitura'}
  };
  const EDIT_PATTERNS=['openForm','removeItem','openAddMonth','saveModal','salvar','excluir','deletar','delete','editar','criar','novo','nova','toggleProdFolder','deleteProdFolder','editProdFolder','removeProdFolder'];
  function getSession(){try{return JSON.parse(sessionStorage.getItem('gf_user')||'null')}catch(e){return null}}
  function setSession(u){sessionStorage.setItem('gf_user',JSON.stringify(u));}
  function clearSession(){sessionStorage.removeItem('gf_user');}
  function isAdmin(){const u=getSession();return !!u && u.perfil==='admin';}
  function toastSafe(msg){try{ if(typeof toast==='function') toast(msg); else alert(msg); }catch(e){alert(msg)}}
  window.isAdminUser=isAdmin;
  window.requireAdmin=function(){ if(isAdmin()) return true; toastSafe('Acesso somente leitura: o usuário mecânico não pode editar.'); return false; };
  window.logoutGF=function(){ clearSession(); location.reload(); };
  function blockByOnclick(el){
    const btn=el.closest?.('button,a'); if(!btn) return false;
    const oc=String(btn.getAttribute('onclick')||'').toLowerCase();
    const txt=String(btn.textContent||'').toLowerCase();
    return EDIT_PATTERNS.some(p=>oc.includes(p.toLowerCase())) || /(^|\s)(\+|novo|nova|editar|excluir|salvar|apagar)(\s|$)/i.test(txt);
  }
  document.addEventListener('click',function(ev){
    if(isAdmin()) return;
    if(blockByOnclick(ev.target)){
      ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation();
      toastSafe('Modo mecânico: visualização liberada, edição bloqueada.');
    }
  },true);
  function addUserPanel(){
    const brand=document.querySelector('.sidebar .brand'); if(!brand || document.getElementById('userPanel')) return;
    const u=getSession(); if(!u) return;
    const div=document.createElement('div'); div.id='userPanel'; div.className='user-panel';
    div.innerHTML=`<span class="role-badge">${u.label}</span><b>${u.nome}</b><small>${u.perfil==='admin'?'Pode adicionar, editar e excluir registros.':'Pode observar todos os dados sem editar.'}</small><button class="btn" onclick="logoutGF()">Sair</button>`;
    brand.insertAdjacentElement('afterend',div);
  }
  function addReadonlyBanner(){
    if(isAdmin() || document.getElementById('readonlyBanner')) return;
    const top=document.querySelector('.content .topbar'); if(!top) return;
    const b=document.createElement('div'); b.id='readonlyBanner'; b.className='readonly-banner'; b.textContent='Modo mecânico: acesso somente para visualização. Botões de edição estão bloqueados.';
    top.insertAdjacentElement('afterend',b);
  }
  function markEditingButtons(){
    if(isAdmin()) return;
    document.querySelectorAll('button,a').forEach(btn=>{ if(blockByOnclick(btn)) btn.classList.add('admin-only'); });
    const actions=document.getElementById('pageActions'); if(actions) actions.classList.add('admin-only');
  }
  function applyAuthUI(){
    const u=getSession();
    document.body.classList.toggle('auth-locked',!u);
    document.body.classList.toggle('role-admin',!!u && u.perfil==='admin');
    document.body.classList.toggle('role-mecanico',!!u && u.perfil==='mecanico');
    if(u){ addUserPanel(); addReadonlyBanner(); markEditingButtons(); }
  }
  const form=document.getElementById('loginForm');
  if(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      const user=(document.getElementById('loginUser')?.value||'').trim().toLowerCase();
      const pass=document.getElementById('loginPass')?.value||'';
      const found=AUTH_USERS[user];
      if(!found || found.senha!==pass){ const er=document.getElementById('loginError'); if(er) er.textContent='Usuário ou senha incorretos.'; return; }
      setSession({usuario:user,nome:found.nome,perfil:found.perfil,label:found.label});
      applyAuthUI();
      try{ if(typeof showPage==='function') showPage(window.currentPage||'dashboard'); }catch(err){}
    });
  }
  const tryWrap=()=>{
    ['openForm','openAddMonth','removeItem','saveModal','salvarMultaSupabase','removerMultaSupabase'].forEach(name=>{
      const fn=window[name] || (typeof globalThis[name]==='function'?globalThis[name]:null);
      if(typeof fn==='function' && !fn.__authWrapped){
        const wrapped=function(){ if(!isAdmin()){ toastSafe('Acesso somente leitura: edição bloqueada.'); return false; } return fn.apply(this,arguments); };
        wrapped.__authWrapped=true; window[name]=wrapped; try{ eval(name+'=window[name]'); }catch(e){}
      }
    });
  };
  applyAuthUI();
  setTimeout(tryWrap,0);
  setInterval(()=>{applyAuthUI();tryWrap();},700);
})();

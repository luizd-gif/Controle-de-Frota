(function(){
  function applyIndustrialOps(){
    document.documentElement.setAttribute('data-industrial','ops');
    document.documentElement.setAttribute('data-theme','dark');
    try{ localStorage.setItem('gf_theme','dark'); }catch(e){}
    const brandTitle=document.querySelector('.sidebar .brand h1');
    const brandSub=document.querySelector('.sidebar .brand small');
    const loginTitle=document.querySelector('.login-card h1');
    const loginSub=document.querySelector('.login-card p');
    if(brandTitle && brandTitle.textContent.trim()!=='FROTA DIME') brandTitle.textContent='FROTA DIME';
    if(brandSub && brandSub.textContent.trim()!=='Gestão de Frota') brandSub.textContent='Gestão de Frota';
    if(loginTitle && loginTitle.textContent.trim()!=='FROTA DIME') loginTitle.textContent='FROTA DIME';
    if(loginSub && loginSub.textContent.trim()!=='Acesso ao painel operacional') loginSub.textContent='Acesso ao painel operacional';
    const themeBtn=document.getElementById('themeToggleBtn');
    if(themeBtn){ themeBtn.textContent='⚙️ FROTA DIME'; themeBtn.onclick=function(){document.documentElement.setAttribute('data-industrial','ops');document.documentElement.setAttribute('data-theme','dark');try{localStorage.setItem('gf_theme','dark')}catch(e){}}; }
  }
  applyIndustrialOps();
  document.addEventListener('DOMContentLoaded',applyIndustrialOps);
  setTimeout(applyIndustrialOps,400);
  setTimeout(applyIndustrialOps,1200);
})();

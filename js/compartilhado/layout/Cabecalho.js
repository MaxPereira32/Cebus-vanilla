(function () {
  Cebus.layout = Cebus.layout || {};

  Cebus.layout.cabecalho = {
    renderizar: function () {
      var tema = Cebus.servicos.tema.obterAtual();
      var temaIcone = tema === 'dark' ? 'sun' : 'moon';

      return '<header class="cabecalho" style="display:flex;align-items:center;justify-content:space-between;padding:0.75rem 1.5rem;background:var(--cor-superficie);border-bottom:1px solid var(--cor-borda);">' +
        '<div class="cabecalho-esquerda" style="display:flex;align-items:center;gap:1rem;">' +
          '<button class="btn-icone" data-acao="alternarMenu" style="background:none;border:none;cursor:pointer;color:var(--cor-texto);padding:0.25rem;display:none;" id="btnMenuMobile">' +
            '<i data-lucide="menu" size="24"></i>' +
          '</button>' +
          '<h1 class="cabecalho-titulo" style="margin:0;font-size:1.25rem;font-weight:700;color:var(--cor-primaria);">' + Cebus.config.nomeSistema + '</h1>' +
          '<span class="cabecalho-versao" style="font-size:0.75rem;color:var(--cor-texto-secundario);padding:0.125rem 0.5rem;background:var(--cor-fundo);border-radius:1rem;">v' + (Cebus.config.versao || '1.0') + '</span>' +
        '</div>' +
        '<div class="cabecalho-direita" style="display:flex;align-items:center;gap:1rem;">' +
          '<button class="btn-icone" data-acao="alternarTema" style="background:none;border:none;cursor:pointer;color:var(--cor-texto);padding:0.25rem;border-radius:0.375rem;" title="Alternar tema">' +
            '<i data-lucide="' + temaIcone + '" size="20"></i>' +
          '</button>' +
          '<div class="cabecalho-usuario" style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;" data-acao="navegar" data-rota="/configuracoes">' +
            '<div class="avatar" style="width:2rem;height:2rem;border-radius:50%;background:var(--cor-primaria);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:0.8rem;">U</div>' +
            '<span class="usuario-nome" style="font-size:0.875rem;color:var(--cor-texto);">Usuário</span>' +
          '</div>' +
          '<button class="btn-icone" data-acao="sair" style="background:none;border:none;cursor:pointer;color:var(--cor-texto-secundario);padding:0.25rem;border-radius:0.375rem;" title="Sair">' +
            '<i data-lucide="log-out" size="18"></i>' +
          '</button>' +
        '</div>' +
      '</header>';
    },
  };
})();

/* ==========================================================================
   ARQUIVO: Cabecalho.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  Cebus.layout = Cebus.layout || {};

  function _obterPaginaAtual() {
    var hash = (window.location.hash || '#/').slice(1) || '/painel';
    // Mapeamento forçado para garantir que "/painel" sempre exiba "Dashboard"
    if (hash === '/painel') return 'Dashboard';
    
    var rotas = Cebus.config.rotas || [];
    for (var i = 0; i < rotas.length; i++) {
      if (rotas[i].caminho === hash) return rotas[i].rotulo;
    }
    return hash.slice(1).charAt(0).toUpperCase() + hash.slice(2);
  }

  function _formatarData() {
    var dataAtual = new Date();
    var opcoesData = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var dataFormatada = dataAtual.toLocaleDateString('pt-BR', opcoesData);
    return dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);
  }

  Cebus.layout.cabecalho = {
    renderizar: function () {
      var tema = Cebus.servicos.tema.obterAtual();
      var temaIcone = tema === 'dark' ? 'sun' : 'moon';
      var paginaAtual = _obterPaginaAtual();
      var dataAtual = _formatarData();

      return '<header class="cabecalho" style="display:flex;align-items:center;justify-content:space-between;padding:1.25rem 2rem;background:transparent;border-bottom:none;">' +
        '<div class="cabecalho-esquerda" style="display:flex;align-items:flex-start;gap:1rem;">' +
          '<button class="btn-icone" data-acao="alternarMenu" style="background:none;border:none;cursor:pointer;color:var(--cor-texto);padding:0.25rem;display:none;margin-top:0.25rem;" id="btnMenuMobile">' +
            '<i data-lucide="menu" size="24"></i>' +
          '</button>' +
          '<div style="display:flex;flex-direction:column;gap:0.25rem;">' +
            '<h1 class="cabecalho-titulo" style="margin:0;font-size:1.8rem;font-weight:800;color:var(--cor-texto);letter-spacing:-0.02em;">' + paginaAtual + '</h1>' +
            '<div style="display:flex;align-items:center;gap:0.5rem;color:var(--cor-texto-secundario);font-weight:500;font-size:0.9rem;">' +
              '<i data-lucide="calendar" style="width:1rem;height:1rem;"></i>' +
              '<span>' + dataAtual + '</span>' +
            '</div>' +
          '</div>' +
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

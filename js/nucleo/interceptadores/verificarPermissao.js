/* ==========================================================================
   ARQUIVO: verificarPermissao.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  Cebus.interceptadores = Cebus.interceptadores || {};

  Cebus.interceptadores.verificarPermissao = function (caminho) {
    var rotasAdmin = ['/usuarios', '/logs'];
    if (rotasAdmin.indexOf(caminho) < 0) return true;

    var authStore = Cebus.registrador.obterStore('autenticacao');
    var nivel = authStore ? authStore.obterEstado().nivel : null;
    if (!nivel || nivel !== 'admin') {
      Cebus.roteador.navegar('/painel');
      return false;
    }
    return true;
  };
})();

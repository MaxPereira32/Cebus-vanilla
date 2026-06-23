/* ==========================================================================
   ARQUIVO: verificarAutenticacao.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  Cebus.interceptadores = Cebus.interceptadores || {};

  Cebus.interceptadores.verificarAutenticacao = function (caminho) {
    var rotasPublicas = ['/login'];
    if (rotasPublicas.indexOf(caminho) >= 0) return true;

    var authStore = Cebus.registrador.obterStore('autenticacao');
    if (!authStore) {
      Cebus.roteador.navegar('/login');
      return false;
    }

    var estado = authStore.obterEstado();
    if (estado.carregando) return true;
    if (!estado.estaLogado) {
      Cebus.roteador.navegar('/login');
      return false;
    }
    return true;
  };
})();

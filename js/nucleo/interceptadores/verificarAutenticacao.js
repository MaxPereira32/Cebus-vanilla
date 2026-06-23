(function () {
  Cebus.interceptadores = Cebus.interceptadores || {};

  Cebus.interceptadores.verificarAutenticacao = function (caminho) {
    var rotasPublicas = ['/login'];
    if (rotasPublicas.indexOf(caminho) >= 0) return true;

    var authStore = Cebus.registrador.obterStore('autenticacao');
    var estaLogado = authStore ? authStore.obterEstado().estaLogado : false;
    if (!estaLogado) {
      Cebus.roteador.navegar('/login');
      return false;
    }
    return true;
  };
})();

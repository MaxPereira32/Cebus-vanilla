(function () {
  Cebus.ganchos = Cebus.ganchos || {};

  Cebus.ganchos.autenticacao = {
    login: function (email, senha) {
      var store = Cebus.registrador.obterStore('autenticacao');
      if (!store) return Promise.reject('Store de autenticacao nao encontrada');
      return store.login(email, senha);
    },

    logout: function () {
      var store = Cebus.registrador.obterStore('autenticacao');
      if (store && store.logout) return store.logout();
      return Promise.resolve();
    },

    verificarSessao: function () {
      var store = Cebus.registrador.obterStore('autenticacao');
      if (store && store.verificarSessao) return store.verificarSessao();
      return Promise.resolve(null);
    },
  };
})();

(function () {
  var store = Cebus.util.criarStore({
    estadoInicial: { lista: [], carregando: false },
    metodos: function (store, set) {
      return {
        carregar: function () {
          set({ carregando: true });
          var historico = Cebus.servicos.log ? Cebus.servicos.log.obterHistorico() : [];
          set({ lista: historico, carregando: false });
          return Promise.resolve(historico);
        },
        registrar: function (acao, detalhes, usuario) {
          if (Cebus.servicos.log) {
            Cebus.servicos.log.info(acao, { detalhes: detalhes, usuario: usuario });
          }
          store.carregar();
          return Promise.resolve();
        },
        limpar: function () {
          if (Cebus.servicos.log) Cebus.servicos.log.limpar();
          set({ lista: [] });
          return Promise.resolve();
        },
      };
    },
  });

  Cebus.registrador.registrarStore('logs', store);

  Cebus.util.registrarLog = function (acao, detalhes) {
    var auth = Cebus.registrador.obterStore('autenticacao');
    var usuario = auth ? (auth.obterEstado().usuario ? auth.obterEstado().usuario.email : 'anonimo') : 'anonimo';
    store.registrar(acao, detalhes, usuario);
  };
})();

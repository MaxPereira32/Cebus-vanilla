(function () {
  var repo = Cebus.repositorios.criar('estoque');

  function _carregarLocal() {
    var dados = Cebus.servicos.armazenamento.obter('repo_estoque', []);
    return dados;
  }

  var store = Cebus.util.criarStore({
    estadoInicial: { lista: [], carregando: false, itemAtual: null },
    metodos: function (store, set) {
      return {
        carregar: function () {
          Cebus.servicos.debug.logFluxo('Store', 'carregar: estoque');
          var locais = _carregarLocal();
          if (locais.length) {
            set({ lista: locais });
          }
          set({ carregando: true });
          return repo.listar().then(function (dados) {
            set({ lista: dados, carregando: false });
            Cebus.servicos.debug.logFluxo('Store', 'carregar concluido: ' + dados.length + ' registros');
            Cebus.servicos.debug.fimFluxo();
            return dados;
          });
        },
        salvar: function (dados) {
          return repo.salvar(dados).then(function (item) {
            store.carregar();
            Cebus.barramento.emitir('estoque:salvo', item);
            return item;
          });
        },
        remover: function (id) {
          return repo.remover(id).then(function () {
            store.carregar();
            Cebus.barramento.emitir('estoque:removido', { id: id });
          });
        },
        definirItemAtual: function (item) { set({ itemAtual: item }); },
      };
    },
  });

  Cebus.registrador.registrarStore('estoque', store);

  Cebus.util.carregarEstoque = function () { return store.carregar(); };
})();

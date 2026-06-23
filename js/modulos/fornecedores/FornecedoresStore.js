(function () {
  var service = window.FornecedorService;

  var store = Cebus.util.criarStore({
    estadoInicial: { lista: [], carregando: false, itemAtual: null, erro: null },
    metodos: function (store, set) {
      return {
        carregar: function () {
          console.log("[Store] carregar");
          Cebus.servicos.debug.logFluxo('Store', 'carregar: fornecedores');
          set({ carregando: true, erro: null });
          return service.listar().then(function (dados) {
            set({ lista: dados, carregando: false });
            console.log("[Store] quantidade carregada", dados.length);
            Cebus.servicos.debug.logFluxo('Store', 'carregar concluido: ' + dados.length + ' registros');
            Cebus.servicos.debug.fimFluxo();
            return dados;
          }).catch(function (err) {
            set({ carregando: false, erro: err && err.message ? err.message : 'Erro ao carregar fornecedores' });
            Cebus.servicos.debug.logFluxo('Store', 'ERRO ao carregar', err && err.message ? err.message : err);
            Cebus.servicos.debug.fimFluxo();
            Cebus.servicos.log.erro('Falha ao carregar fornecedores', err);
            return [];
          });
        },

        salvar: function (dados) {
          console.log("[Store] salvar", dados.id || null, dados);
          set({ erro: null });
          return service.salvar(dados).then(function (item) {
            store.carregar();
            return item;
          }).catch(function (err) {
            if (err && err.tipo === 'validacao') {
              set({ erro: err.erros.join(', ') });
            }
            throw err;
          });
        },

        remover: function (id) {
          console.log("[Store] remover", id);
          return service.remover(id).then(function () {
            store.carregar();
          });
        },

        definirItemAtual: function (item) { set({ itemAtual: item }); },

        exportar: function () {
          return service.listar();
        }
      };
    },
  });

  Cebus.registrador.registrarStore('fornecedores', store);
  Cebus.util.carregarFornecedores = function () { return store.carregar(); };
})();

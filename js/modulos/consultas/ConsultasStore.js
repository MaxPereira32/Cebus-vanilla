(function () {
  var resultados = [];

  function _filtrarLocal(lista, filtros) {
    if (!filtros || (!filtros.termo && !filtros.tipo && !filtros.dataInicio && !filtros.dataFim)) return lista;
    var termo = (filtros.termo || '').toLowerCase().trim();
    var tipo = filtros.tipo || 'todos';
    var dataInicio = filtros.dataInicio;
    var dataFim = filtros.dataFim;

    return lista.filter(function (item) {
      if (termo) {
        var matchTermo = false;
        for (var key in item) {
          if (item[key] && String(item[key]).toLowerCase().indexOf(termo) !== -1) {
            matchTermo = true;
            break;
          }
        }
        if (!matchTermo) return false;
      }
      if (tipo !== 'todos' && tipo !== 'all') {
        var itemTipo = (item.tipo || item.Tipo || item.categoria || item.Categoria || '').toLowerCase();
        if (itemTipo.indexOf(tipo.toLowerCase()) === -1) return false;
      }
      if (dataInicio || dataFim) {
        var dataItem = item.Data || item.data || item.criadoEm || '';
        if (dataItem) {
          var d = dataItem.substring(0, 10);
          if (dataInicio && d < dataInicio) return false;
          if (dataFim && d > dataFim) return false;
        }
      }
      return true;
    });
  }

  var store = Cebus.util.criarStore({
    estadoInicial: { lista: [], carregando: false, itemAtual: null, resultados: [] },
    metodos: function (store, set) {
      return {
        carregar: function () {
          set({ carregando: true });
          if (!Cebus.firebase || !Cebus.firebase._inicializado) {
            set({ lista: [], carregando: false });
            return Promise.resolve([]);
          }
          var db = Cebus.firebase.obterDb();
          return Promise.all([
            db.collection('estoque').get(),
            db.collection('entradas').get(),
            db.collection('saidas').get(),
            db.collection('distribuicoes').get(),
            db.collection('fornecedores').get(),
          ]).then(function (results) {
            var dados = [];
            results.forEach(function (snap) {
              snap.forEach(function (doc) {
                dados.push(Object.assign({ id: doc.id }, doc.data()));
              });
            });
            set({ lista: dados, carregando: false });
            return dados;
          });
        },
        salvar: function (dados) {
          return Promise.resolve(dados);
        },
        remover: function (id) {
          return Promise.resolve();
        },
        pesquisar: function (filtros) {
          set({ carregando: true, resultados: [] });
          var self = this;
          return self.carregar().then(function (dados) {
            var filtrados = _filtrarLocal(dados, filtros);
            set({ resultados: filtrados, carregando: false });
            return filtrados;
          });
        },
        limparResultados: function () {
          set({ resultados: [] });
        },
      };
    },
  });

  Cebus.registrador.registrarStore('consultas', store);
})();

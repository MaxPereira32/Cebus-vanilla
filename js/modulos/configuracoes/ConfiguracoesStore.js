(function () {
  function _obterDoc() {
    var db = Cebus.firebase.obterDb();
    return db.collection('configuracoes').doc('instituicao');
  }

  var store = Cebus.util.criarStore({
    estadoInicial: {
      config: {
        nomeSistema: Cebus.config.nomeSistema,
        descricao: Cebus.config.descricao,
        versao: Cebus.config.versao,
        emailNotificacao: '',
        alertaEstoqueMinimo: true,
        horarioFuncionamentoInicio: '08:00',
        horarioFuncionamentoFim: '18:00',
      },
      carregando: false,
    },
    metodos: function (store, set) {
      return {
        carregar: function () {
          set({ carregando: true });
          if (!Cebus.firebase || !Cebus.firebase._inicializado) {
            set({ carregando: false });
            return Promise.resolve(null);
          }
          return _obterDoc().get().then(function (doc) {
            if (doc.exists) {
              set({ config: Object.assign({}, store.obterEstado().config, doc.data()), carregando: false });
            } else {
              set({ carregando: false });
            }
            return doc.exists ? doc.data() : null;
          }).catch(function () {
            set({ carregando: false });
            return null;
          });
        },
        salvar: function (dados) {
          if (!Cebus.firebase || !Cebus.firebase._inicializado) {
            set({ config: Object.assign({}, store.obterEstado().config, dados) });
            return Promise.resolve(dados);
          }
          dados.atualizadoEm = new Date().toISOString();
          return _obterDoc().set(dados, { merge: true }).then(function () {
            set({ config: Object.assign({}, store.obterEstado().config, dados) });
            Cebus.barramento.emitir('config:salvo', dados);
            return dados;
          });
        },
      };
    },
  });

  Cebus.registrador.registrarStore('configuracoes', store);
})();

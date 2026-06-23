(function () {
  Cebus.servicos = Cebus.servicos || {};

  var grupoAtivo = null;
  var monitorAtivo = false;

  function corDaCamada(camada) {
    return camada === 'Pagina' ? '#8b5cf6' :
      camada === 'Store' ? '#3b82f6' :
      camada === 'Service' ? '#06b6d4' :
      camada === 'Repository' ? '#10b981' :
      camada === 'Firebase' ? '#f59e0b' :
      camada === 'Cache' ? '#ec4899' :
      camada === 'Erro' ? '#ef4444' :
      '#6b7280';
  }

  function iniciarGrupo(camada) {
    if (grupoAtivo) return;
    console.group('%c[Fluxo] ' + camada, 'font-weight:bold;color:#3b82f6;');
    grupoAtivo = camada;
  }

  Cebus.servicos.debug = {
    logFluxo: function (camada, acao, dados) {
      iniciarGrupo(camada);
      console.log('%c[' + camada + ']', 'color:' + corDaCamada(camada) + ';font-weight:600;', acao, dados || '');
    },

    fimFluxo: function () {
      if (grupoAtivo) {
        console.groupEnd();
        grupoAtivo = null;
      }
    },

    fluxoAsync: function (nome, promise) {
      var self = this;
      self.logFluxo('---', 'Async: ' + nome);
      return promise.then(function (res) {
        self.fimFluxo();
        return res;
      }).catch(function (err) {
        console.error('%c[Fluxo] Erro em: ' + nome, 'color:#ef4444;', err);
        self.fimFluxo();
        throw err;
      });
    },

    monitorarRepositorios: function () {
      if (monitorAtivo) return;
      monitorAtivo = true;

      var criarOriginal = Cebus.repositorios.criar;
      Cebus.repositorios.criar = function (nomeColecao) {
        var repo = criarOriginal(nomeColecao);
        var metodos = ['listar', 'obterPorId', 'salvar', 'remover', 'consultar', 'importar', 'exportar'];

        metodos.forEach(function (metodo) {
          var original = repo[metodo];
          if (typeof original !== 'function') return;
          repo[metodo] = function () {
            var args = arguments;
            var nome = nomeColecao;
            var self = this;
            iniciarGrupo('Repository');
            console.log('%c[Repository]', 'color:' + corDaCamada('Repository') + ';font-weight:600;', metodo + ': ' + nome);

            var resultado = original.apply(self, args);

            if (resultado && typeof resultado.then === 'function') {
              return resultado.then(function (dados) {
                console.log('%c[Repository]', 'color:' + corDaCamada('Repository') + ';font-weight:600;', metodo + ' concluido: ' + (dados && dados.length !== undefined ? dados.length + ' registros' : 'ok'));
                return dados;
              }).catch(function (err) {
                console.error('%c[Repository]', 'color:#ef4444;font-weight:600;', metodo + ' ERRO em ' + nome, err && err.message ? err.message : err);
                throw err;
              });
            }
            return resultado;
          };
        });

        return repo;
      };
    },

    monitorarStores: function () {
      var registrarOriginal = Cebus.registrador.registrarStore;
      Cebus.registrador.registrarStore = function (nome, store) {
        if (store && store.carregar) {
          var carregarOriginal = store.carregar;
          store.carregar = function () {
            iniciarGrupo('Store');
            console.log('%c[Store]', 'color:' + corDaCamada('Store') + ';font-weight:600;', 'carregar: ' + nome);
            var p = carregarOriginal.apply(this, arguments);
            if (p && typeof p.then === 'function') {
              return p.then(function (dados) {
                console.log('%c[Store]', 'color:' + corDaCamada('Store') + ';font-weight:600;', 'carregar concluido: ' + nome + ' (' + (dados && dados.length !== undefined ? dados.length + ' registros' : 'ok') + ')');
                if (grupoAtivo) { console.groupEnd(); grupoAtivo = null; }
                return dados;
              }).catch(function (err) {
                console.error('%c[Store]', 'color:#ef4444;font-weight:600;', 'carregar ERRO em ' + nome, err && err.message ? err.message : err);
                if (grupoAtivo) { console.groupEnd(); grupoAtivo = null; }
                throw err;
              });
            }
            return p;
          };
        }
        return registrarOriginal.call(Cebus.registrador, nome, store);
      };
    },

    monitorarFirebase: function () {
      if (!Cebus.firebase || typeof Cebus.firebase.criarRepositorio !== 'function') return;
      var criarOriginal = Cebus.firebase.criarRepositorio;
      Cebus.firebase.criarRepositorio = function (colecao) {
        var repo = criarOriginal(colecao);
        var metodosFB = ['listar', 'salvar', 'salvarComId', 'atualizar', 'remover', 'consultar', 'obterPorId'];

        metodosFB.forEach(function (metodo) {
          var original = repo[metodo];
          if (typeof original !== 'function') return;
          repo[metodo] = function () {
            iniciarGrupo('Firebase');
            console.log('%c[Firebase]', 'color:' + corDaCamada('Firebase') + ';font-weight:600;', metodo + ': ' + colecao);
            return original.apply(this, arguments).then(function (dados) {
              console.log('%c[Firebase]', 'color:' + corDaCamada('Firebase') + ';font-weight:600;', metodo + ' concluido: ' + (dados && dados.length !== undefined ? dados.length + ' registros' : 'ok'));
              if (grupoAtivo) { console.groupEnd(); grupoAtivo = null; }
              return dados;
            }).catch(function (err) {
              console.error('%c[Firebase]', 'color:#ef4444;font-weight:600;', metodo + ' ERRO em ' + colecao, err && err.message ? err.message : err);
              if (grupoAtivo) { console.groupEnd(); grupoAtivo = null; }
              throw err;
            });
          };
        });

        return repo;
      };
    },

    habilitar: function () {
      this.monitorarRepositorios();
      this.monitorarStores();
      this.monitorarFirebase();
    },
  };

  console.log('[Cebus] ServicoDebug carregado');
})();

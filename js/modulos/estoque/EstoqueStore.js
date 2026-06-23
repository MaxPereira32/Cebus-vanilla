/* ==========================================================================
   ARQUIVO: EstoqueStore.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  var repo = Cebus.repositorios.criar('estoque');

  function _carregarLocal() {
    var dados = Cebus.servicos.armazenamento.obter('repo_estoque', []);
    return dados;
  }

  function _limparDuplicados(lista) {
    var mapa = {};
    lista.forEach(function (item) {
      var chave = item.ID_Produto || item.id;
      if (!chave) return;
      if (mapa[chave]) {
        var existente = mapa[chave];
        existente.EntradaTotal = Math.max(existente.EntradaTotal || 0, item.EntradaTotal || 0);
        existente.SaidaTotal = Math.max(existente.SaidaTotal || 0, item.SaidaTotal || 0);
        existente.Saldo = (existente.EntradaTotal || 0) - (existente.SaidaTotal || 0);
        existente.quantidade = existente.Saldo;
        if (!existente.Fornecedor && item.Fornecedor) existente.Fornecedor = item.Fornecedor;
      } else {
        mapa[chave] = Object.assign({}, item, { id: chave, ID_Produto: chave });
      }
    });
    var limpos = Object.values(mapa);
    if (limpos.length !== lista.length) {
      Cebus.servicos.armazenamento.salvar('repo_estoque', limpos);
    }
    return limpos;
  }

  function _sincronizarFornecedores(lista) {
    var repoEntradas = Cebus.repositorios.criar('entradas');
    repoEntradas.listar().then(function (entradas) {
      var precisaSalvar = false;
      var atualizados = lista.map(function (item) {
        if (!item.Fornecedor) {
          var entrada = entradas.find(function (e) {
            if (e.Fornecedor) {
              var matchId = e.ID_Produto && (e.ID_Produto === item.ID_Produto || e.ID_Produto === item.id);
              var matchNome = (e.Produto || '').toLowerCase() === (item.Produto || '').toLowerCase();
              return matchId || matchNome;
            }
            return false;
          });
          if (entrada && entrada.Fornecedor) {
            precisaSalvar = true;
            item.Fornecedor = entrada.Fornecedor;
          }
        }
        return item;
      });
      if (precisaSalvar) {
        Cebus.servicos.armazenamento.salvar('repo_estoque', atualizados);
      }
    }).catch(function () {});
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
            dados = _limparDuplicados(dados);
            _sincronizarFornecedores(dados);
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

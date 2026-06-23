(function () {
  var repo = Cebus.repositorios.criar('entradas');
  var repoEstoque = Cebus.repositorios.criar('estoque');

  function _atualizarEstoque(dados) {
    var id = dados.ID_Produto || dados.idProduto;
    if (!id) return Promise.resolve();
    var produto = dados.Produto || dados.produto || '';
    var unidade = dados.Unidade || dados.unidade || 'UN';
    var quantidade = parseFloat(dados.Quantidade || dados.quantidade || 0);

    return repoEstoque.obterPorId(id).then(function (item) {
      var novoItem;
      if (item) {
        var entTotal = (item.EntradaTotal || 0) + quantidade;
        var saiTotal = item.SaidaTotal || 0;
        var saldo = entTotal - saiTotal;
        var situacao = _definirSituacao(saldo, item.estoqueMinimo || 0, item.estoqueMaximo || 999999);
        novoItem = {
          id: item.id || id,
          ID_Produto: id, Produto: produto, Unidade: unidade,
          quantidade: saldo, unidade: unidade,
          EntradaTotal: entTotal, SaidaTotal: saiTotal,
          Saldo: saldo, Situacao: situacao,
          estoqueMinimo: item.estoqueMinimo || 0,
          estoqueMaximo: item.estoqueMaximo || 999999,
        };
        return repoEstoque.salvar(novoItem);
      } else {
        novoItem = {
          id: id,
          ID_Produto: id, Produto: produto, Unidade: unidade,
          quantidade: quantidade, unidade: unidade,
          EntradaTotal: quantidade, SaidaTotal: 0,
          Saldo: quantidade, Situacao: 'NORMAL',
          estoqueMinimo: 0, estoqueMaximo: 999999,
        };
        return repoEstoque.salvar(novoItem);
      }
    });
  }

  function _definirSituacao(saldo, min, max) {
    if (saldo <= 0) return 'ESGOTADO';
    if (min && saldo <= min) return 'BAIXO';
    if (max && saldo > max) return 'EXCEDENTE';
    return 'NORMAL';
  }

  var store = Cebus.util.criarStore({
    estadoInicial: { lista: [], carregando: false, itemAtual: null },
    metodos: function (store, set) {
      return {
        carregar: function () {
          Cebus.servicos.debug.logFluxo('Store', 'carregar: entradas');
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
            return _atualizarEstoque(item).then(function () {
              store.carregar();
              Cebus.barramento.emitir('entrada:salvo', item);
              Cebus.barramento.emitir('estoque:atualizado', { id: item.ID_Produto });
              return item;
            });
          });
        },
        remover: function (id) {
          return repo.remover(id).then(function () {
            store.carregar();
            Cebus.barramento.emitir('entrada:removido', { id: id });
          });
        },
        definirItemAtual: function (item) { set({ itemAtual: item }); },
      };
    },
  });

  Cebus.registrador.registrarStore('entradas', store);

  Cebus.util.carregarEntradas = function () { return store.carregar(); };
})();

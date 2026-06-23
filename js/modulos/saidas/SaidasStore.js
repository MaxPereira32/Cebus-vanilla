(function () {
  var repo = Cebus.repositorios.criar('saidas');
  var repoEstoque = Cebus.repositorios.criar('estoque');

  function _definirSituacao(saldo, min, max) {
    if (saldo <= 0) return 'ESGOTADO';
    if (min && saldo <= min) return 'BAIXO';
    if (max && saldo > max) return 'EXCEDENTE';
    return 'NORMAL';
  }

  function _atualizarEstoque(dados) {
    var id = dados.ID_Produto || dados.idProduto;
    if (!id) return Promise.resolve();
    var quantidade = parseFloat(dados.Quantidade || dados.quantidade || 0);

    return repoEstoque.obterPorId(id).then(function (item) {
      if (!item) {
        console.warn('[Saidas] Produto ' + id + ' nao encontrado no estoque');
        return Promise.resolve();
      }
      var entTotal = item.EntradaTotal || 0;
      var saiTotal = (item.SaidaTotal || 0) + quantidade;
      var saldo = entTotal - saiTotal;
      var situacao = _definirSituacao(saldo, item.estoqueMinimo || 0, item.estoqueMaximo || 999999);
      var novoItem = {
        id: item.id || id,
        ID_Produto: id, Produto: item.Produto, Unidade: item.Unidade,
        quantidade: saldo, unidade: item.Unidade,
        EntradaTotal: entTotal, SaidaTotal: saiTotal,
        Saldo: saldo, Situacao: situacao,
        estoqueMinimo: item.estoqueMinimo || 0,
        estoqueMaximo: item.estoqueMaximo || 999999,
      };
      return repoEstoque.salvar(novoItem);
    });
  }

  var store = Cebus.util.criarStore({
    estadoInicial: { lista: [], carregando: false, itemAtual: null },
    metodos: function (store, set) {
      return {
        carregar: function () {
          Cebus.servicos.debug.logFluxo('Store', 'carregar: saidas');
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
              Cebus.barramento.emitir('saida:salvo', item);
              Cebus.barramento.emitir('estoque:atualizado', { id: item.ID_Produto });
              return item;
            });
          });
        },
        remover: function (id) {
          return repo.remover(id).then(function () {
            store.carregar();
            Cebus.barramento.emitir('saida:removido', { id: id });
          });
        },
        definirItemAtual: function (item) { set({ itemAtual: item }); },
      };
    },
  });

  Cebus.registrador.registrarStore('saidas', store);

  Cebus.util.carregarSaidas = function () { return store.carregar(); };
})();

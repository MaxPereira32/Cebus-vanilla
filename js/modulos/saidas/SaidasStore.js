/* ==========================================================================
   ARQUIVO: SaidasStore.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  var repo = Cebus.repositorios.criar('saidas');
  var repoEstoque = Cebus.repositorios.criar('estoque');

  function _definirSituacao(saldo, min, max) {
    if (saldo <= 0) return 'ESGOTADO';
    if (min && saldo <= min) return 'BAIXO';
    if (max && saldo > max) return 'EXCEDENTE';
    return 'NORMAL';
  }

  function _resolverIdProduto(dados) {
    var id = dados.ID_Produto || dados.idProduto;
    if (id) return Promise.resolve(id);
    var produto = dados.Produto || dados.produto || '';
    if (!produto) return Promise.resolve(null);
    return repoEstoque.listar().then(function (lista) {
      var encontrado = lista.find(function (e) {
        return (e.Produto || '').toLowerCase() === produto.toLowerCase();
      });
      return encontrado ? (encontrado.ID_Produto || encontrado.id) : null;
    });
  }

  // delta: quantidade a somar ao SaidaTotal (positivo = nova saida, negativo = remoção/edição)
  function _atualizarEstoque(dados, delta) {
    return _resolverIdProduto(dados).then(function (id) {
      if (!id) {
        console.warn('[Saidas] Produto "' + (dados.Produto || dados.produto || '') + '" nao encontrado no estoque');
        return;
      }
      dados.ID_Produto = id;
      // Se delta não foi fornecido, usa a quantidade completa (comportamento original)
      var incremento = (delta !== undefined) ? delta : parseFloat(dados.Quantidade || dados.quantidade || 0);

      return repoEstoque.obterPorId(id).then(function (item) {
        if (!item) {
          console.warn('[Saidas] Produto ' + id + ' nao encontrado no estoque');
          return;
        }
        var entTotal = item.EntradaTotal || 0;
        var saiTotal = Math.max(0, (item.SaidaTotal || 0) + incremento);
        var saldo = entTotal - saiTotal;
        var situacao = _definirSituacao(saldo, item.estoqueMinimo || 0, item.estoqueMaximo || 999999);
        var novoItem = {
          ID_Produto: id, Produto: item.Produto, Unidade: item.Unidade,
          quantidade: saldo, unidade: item.Unidade,
          EntradaTotal: entTotal, SaidaTotal: saiTotal,
          Saldo: saldo, Situacao: situacao,
          estoqueMinimo: item.estoqueMinimo || 0,
          estoqueMaximo: item.estoqueMaximo || 999999,
          Fornecedor: item.Fornecedor || '',
        };
        console.log('[Saidas] _atualizarEstoque id=' + id + ' delta=' + incremento + ' entTotal=' + entTotal + ' saiTotal=' + saiTotal + ' saldo=' + saldo);
        return repoEstoque.salvarComId(id, novoItem);
      });
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
          var quantidadeAntiga = 0;
          var idEdicao = dados.id;
          // Se é edição, busca a quantidade antiga para calcular o delta correto
          var promessaAnterior = idEdicao
            ? repo.listar().then(function (lista) {
                var anterior = lista.find(function (r) { return r.id === idEdicao; });
                quantidadeAntiga = anterior ? parseFloat(anterior.Quantidade || anterior.quantidade || 0) : 0;
                if (anterior && !dados.ID_Produto) dados.ID_Produto = anterior.ID_Produto;
                console.log('[Saidas] salvar (edicao) quantidadeAntiga=' + quantidadeAntiga);
              })
            : Promise.resolve();

          return promessaAnterior.then(function () {
            return _resolverIdProduto(dados).then(function (id) {
              if (id) dados.ID_Produto = id;
              var docId = dados.ID_Saida || dados.id || Cebus.util.gerarId();
              dados.id = docId;
              return repo.salvarComId(docId, dados).then(function () {
                var qtdNova = parseFloat(dados.Quantidade || dados.quantidade || 0);
                var delta = idEdicao ? (qtdNova - quantidadeAntiga) : qtdNova;
                console.log('[Saidas] salvar delta=' + delta + ' qtdNova=' + qtdNova + ' qtdAntiga=' + quantidadeAntiga);
                return _atualizarEstoque(dados, delta).then(function () {
                  store.carregar();
                  Cebus.barramento.emitir('saida:salvo', dados);
                  Cebus.barramento.emitir('estoque:atualizado', { id: dados.ID_Produto });
                  return dados;
                });
              });
            });
          });
        },
        remover: function (id) {
          // Busca a saida antes de remover para reverter o estoque
          return repo.listar().then(function (lista) {
            var saida = lista.find(function (r) { return r.id === id; });
            return repo.remover(id).then(function () {
              if (saida) {
                var qtd = parseFloat(saida.Quantidade || saida.quantidade || 0);
                console.log('[Saidas] remover: revertendo ' + qtd + ' no estoque para produto ' + (saida.ID_Produto || saida.Produto));
                // delta negativo para decrementar SaidaTotal
                return _atualizarEstoque(saida, -qtd).then(function () {
                  store.carregar();
                  Cebus.barramento.emitir('saida:removido', { id: id });
                  Cebus.barramento.emitir('estoque:atualizado', { id: saida.ID_Produto });
                });
              }
              store.carregar();
              Cebus.barramento.emitir('saida:removido', { id: id });
            });
          });
        },
        definirItemAtual: function (item) { set({ itemAtual: item }); },
      };
    },
  });

  Cebus.registrador.registrarStore('saidas', store);

  Cebus.util.carregarSaidas = function () { return store.carregar(); };
})();

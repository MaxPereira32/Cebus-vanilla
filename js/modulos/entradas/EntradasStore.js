/* ==========================================================================
   ARQUIVO: EntradasStore.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  var repo = Cebus.repositorios.criar('entradas');
  var repoEstoque = Cebus.repositorios.criar('estoque');

  function _resolverIdProduto(dados) {
    var id = dados.ID_Produto || dados.idProduto;
    if (id) return Promise.resolve(id);
    var produto = dados.Produto || dados.produto || '';
    if (!produto) return Promise.resolve(null);
    return repoEstoque.listar().then(function (lista) {
      var encontrado = lista.find(function (e) {
        return (e.Produto || '').toLowerCase() === produto.toLowerCase();
      });
      return encontrado ? (encontrado.ID_Produto || encontrado.id) : Cebus.util.gerarIdComPrefixo('PR');
    });
  }

  // delta: quantidade a somar ao EntradaTotal (positivo = nova entrada, negativo = remoção/edição)
  function _atualizarEstoque(dados, delta) {
    return _resolverIdProduto(dados).then(function (id) {
      if (!id) return;
      var produto = dados.Produto || dados.produto || '';
      var unidade = dados.Unidade || dados.unidade || 'UN';
      // Se delta não foi fornecido, usa a quantidade completa (comportamento original para nova entrada)
      var incremento = (delta !== undefined) ? delta : parseFloat(dados.Quantidade || dados.quantidade || 0);
      var fornecedor = dados.Fornecedor || dados.fornecedor || dados.fornecedorNome || '';

      return repoEstoque.obterPorId(id).then(function (item) {
        var entTotal, saiTotal, estoqueMinimo, estoqueMaximo;
        if (item) {
          entTotal = (item.EntradaTotal || 0) + incremento;
          saiTotal = item.SaidaTotal || 0;
          estoqueMinimo = item.estoqueMinimo || 0;
          estoqueMaximo = item.estoqueMaximo || 999999;
        } else {
          entTotal = Math.max(0, incremento);
          saiTotal = 0;
          estoqueMinimo = 0;
          estoqueMaximo = 999999;
        }
        entTotal = Math.max(0, entTotal);
        var saldo = entTotal - saiTotal;
        var situacao = _definirSituacao(saldo, estoqueMinimo, estoqueMaximo);
        var novoItem = {
          ID_Produto: id, Produto: produto, Unidade: unidade,
          quantidade: saldo, unidade: unidade,
          EntradaTotal: entTotal, SaidaTotal: saiTotal,
          Saldo: saldo, Situacao: situacao,
          estoqueMinimo: estoqueMinimo,
          estoqueMaximo: estoqueMaximo,
          Fornecedor: item ? (item.Fornecedor || fornecedor) : fornecedor,
        };
        console.log('[Entradas] _atualizarEstoque id=' + id + ' delta=' + incremento + ' entTotal=' + entTotal + ' saiTotal=' + saiTotal + ' saldo=' + saldo);
        return repoEstoque.salvarComId(id, novoItem);
      });
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
          var quantidadeAntiga = 0;
          var idEdicao = dados.id;
          // Se é edição, busca a quantidade antiga para calcular o delta correto
          var promessaAnterior = idEdicao
            ? repo.listar().then(function (lista) {
                var anterior = lista.find(function (r) { return r.id === idEdicao; });
                quantidadeAntiga = anterior ? parseFloat(anterior.Quantidade || anterior.quantidade || 0) : 0;
                if (anterior && !dados.ID_Produto) dados.ID_Produto = anterior.ID_Produto;
                console.log('[Entradas] salvar (edicao) quantidadeAntiga=' + quantidadeAntiga);
              })
            : Promise.resolve();

          return promessaAnterior.then(function () {
            return _resolverIdProduto(dados).then(function (id) {
              if (id) dados.ID_Produto = id;
              var docId = dados.ID_Entrada || dados.id || Cebus.util.gerarId();
              dados.id = docId;
              return repo.salvarComId(docId, dados).then(function () {
                var qtdNova = parseFloat(dados.Quantidade || dados.quantidade || 0);
                var delta = idEdicao ? (qtdNova - quantidadeAntiga) : qtdNova;
                console.log('[Entradas] salvar delta=' + delta + ' qtdNova=' + qtdNova + ' qtdAntiga=' + quantidadeAntiga);
                return _atualizarEstoque(dados, delta).then(function () {
                  store.carregar();
                  Cebus.barramento.emitir('entrada:salvo', dados);
                  Cebus.barramento.emitir('estoque:atualizado', { id: dados.ID_Produto });
                  return dados;
                });
              });
            });
          });
        },
        remover: function (id) {
          // Busca a entrada antes de remover para decrementar o estoque
          return repo.listar().then(function (lista) {
            var entrada = lista.find(function (r) { return r.id === id; });
            return repo.remover(id).then(function () {
              if (entrada) {
                var qtd = parseFloat(entrada.Quantidade || entrada.quantidade || 0);
                console.log('[Entradas] remover: revertendo ' + qtd + ' do estoque para produto ' + (entrada.ID_Produto || entrada.Produto));
                // delta negativo para decrementar o EntradaTotal
                return _atualizarEstoque(entrada, -qtd).then(function () {
                  store.carregar();
                  Cebus.barramento.emitir('entrada:removido', { id: id });
                  Cebus.barramento.emitir('estoque:atualizado', { id: entrada.ID_Produto });
                });
              }
              store.carregar();
              Cebus.barramento.emitir('entrada:removido', { id: id });
            });
          });
        },
        definirItemAtual: function (item) { set({ itemAtual: item }); },
      };
    },
  });

  Cebus.registrador.registrarStore('entradas', store);

  Cebus.util.carregarEntradas = function () { return store.carregar(); };
})();

/* ==========================================================================
   ARQUIVO: RelatoriosStore.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  function _listarColecao(colecao) {
    var repo = Cebus.repositorios.criar(colecao);
    return repo.listar();
  }

  function _gerarEstoque() {
    return _listarColecao('estoque').then(function (dados) {
      var colunas = ['ID_Produto', 'Produto', 'Unidade', 'EntradaTotal', 'SaidaTotal', 'Saldo', 'Situacao', 'estoqueMinimo', 'estoqueMaximo'];
      return { titulo: 'Relatório de Estoque', colunas: colunas, dados: dados };
    });
  }

  function _gerarMovimentacaoPeriodo(params) {
    return Promise.all([
      _listarColecao('entradas'),
      _listarColecao('saidas'),
      _listarColecao('distribuicoes'),
    ]).then(function (results) {
      var entradas = results[0].map(function (i) { return Object.assign({}, i, { _tipo: 'ENTRADA' }); });
      var saidas = results[1].map(function (i) { return Object.assign({}, i, { _tipo: 'SAIDA' }); });
      var dists = results[2].map(function (i) { return Object.assign({}, i, { _tipo: 'DISTRIBUICAO' }); });
      var todos = entradas.concat(saias).concat(dists);

      if (params.dataInicio) {
        todos = todos.filter(function (i) { return (i.Data || '') >= params.dataInicio; });
      }
      if (params.dataFim) {
        todos = todos.filter(function (i) { return (i.Data || '') <= params.dataFim; });
      }

      todos.sort(function (a, b) { return (b.Data || '').localeCompare(a.Data || ''); });
      var colunas = ['Data', '_tipo', 'Produto', 'Quantidade', 'Fornecedor', 'Destino', 'Responsavel'];
      return { titulo: 'Relatório de Movimentações por Período', colunas: colunas, dados: todos };
    });
  }

  function _gerarEntradasFornecedor() {
    return _listarColecao('entradas').then(function (dados) {
      var agrupado = {};
      dados.forEach(function (item) {
        var key = item.Fornecedor || item.fornecedor || 'Sem fornecedor';
        if (!agrupado[key]) agrupado[key] = { fornecedor: key, total: 0, itens: [] };
        agrupado[key].total += parseFloat(item.Quantidade || item.quantidade || 0);
        agrupado[key].itens.push(item);
      });
      var lista = [];
      for (var k in agrupado) {
        lista.push({ Fornecedor: agrupado[k].fornecedor, TotalQuantidade: agrupado[k].total, Registros: agrupado[k].itens.length });
      }
      return { titulo: 'Relatório de Entradas por Fornecedor', colunas: ['Fornecedor', 'TotalQuantidade', 'Registros'], dados: lista };
    });
  }

  function _gerarSaidasDestino() {
    return _listarColecao('saidas').then(function (dados) {
      var agrupado = {};
      dados.forEach(function (item) {
        var key = item.Destino || item.destino || item.Responsavel || item.responsavel || 'Sem destino';
        if (!agrupado[key]) agrupado[key] = { destino: key, total: 0, itens: [] };
        agrupado[key].total += parseFloat(item.Quantidade || item.quantidade || 0);
        agrupado[key].itens.push(item);
      });
      var lista = [];
      for (var k in agrupado) {
        lista.push({ Destino: agrupado[k].destino, TotalQuantidade: agrupado[k].total, Registros: agrupado[k].itens.length });
      }
      return { titulo: 'Relatório de Saídas por Destino', colunas: ['Destino', 'TotalQuantidade', 'Registros'], dados: lista };
    });
  }

  function _gerarEstoqueBaixo() {
    return _listarColecao('estoque').then(function (dados) {
      var baixo = dados.filter(function (i) {
        return i.Situacao === 'BAIXO' || i.Situacao === 'ESGOTADO' || (i.Saldo !== undefined && i.Saldo <= (i.estoqueMinimo || 0));
      });
      return { titulo: 'Relatório de Estoque Baixo', colunas: ['ID_Produto', 'Produto', 'Saldo', 'estoqueMinimo', 'Situacao'], dados: baixo };
    });
  }

  var store = Cebus.util.criarStore({
    estadoInicial: { lista: [], carregando: false, itemAtual: null, relatorio: null },
    metodos: function (store, set) {
      return {
        carregar: function () {
          set({ carregando: true });
          return _listarColecao('estoque').then(function (dados) {
            set({ lista: dados, carregando: false });
            return dados;
          });
        },
        gerarRelatorio: function (tipo, params) {
          set({ carregando: true, relatorio: null });
          var promessa;
          switch (tipo) {
            case 'estoque': promessa = _gerarEstoque(); break;
            case 'movimentacao-periodo': promessa = _gerarMovimentacaoPeriodo(params || {}); break;
            case 'entradas-fornecedor': promessa = _gerarEntradasFornecedor(); break;
            case 'saidas-destino': promessa = _gerarSaidasDestino(); break;
            case 'estoque-baixo': promessa = _gerarEstoqueBaixo(); break;
            default: promessa = Promise.resolve({ titulo: 'Relatório', colunas: [], dados: [] });
          }
          return promessa.then(function (rel) {
            set({ relatorio: rel, carregando: false });
            return rel;
          }).catch(function (err) {
            console.warn('[Relatorios] Erro:', err);
            set({ carregando: false, relatorio: null });
          });
        },
        salvar: function (dados) { return Promise.resolve(dados); },
        remover: function (id) { return Promise.resolve(); },
        definirItemAtual: function (item) { set({ itemAtual: item }); },
      };
    },
  });

  Cebus.registrador.registrarStore('relatorios', store);
})();

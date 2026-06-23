/* ==========================================================================
   ARQUIVO: MovimentacoesStore.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  function _buscarColecao(colecao, tipo) {
    Cebus.servicos.debug.logFluxo('Service', 'buscarColecao: ' + colecao + ' (' + tipo + ')');
    var repo = Cebus.repositorios.criar(colecao);
    return repo.listar().then(function (dados) {
      Cebus.servicos.debug.logFluxo('Service', colecao + ' retornou ' + dados.length + ' registros');
      return dados.map(function (item) {
        return {
          id: item.id,
          ID: item.ID_Entrada || item.ID_Saida || item.id,
          Data: item.Data || item.data || '',
          Hora: item.Hora || item.hora || '-',
          Produto: item.Produto || item.produto || item.Nome || item.nome || '',
          ID_Produto: item.ID_Produto || '',
          Quantidade: item.Quantidade || item.quantidade || 0,
          Unidade: item.Unidade || item.unidade || '-',
          Tipo: tipo,
          OrigemDestino: tipo === 'ENTRADA' ? (item.Fornecedor || item.fornecedor || '-') : (item.Destino || item.destino || item.Responsavel || item.responsavel || '-'),
          Responsavel: item.Responsavel || item.responsavel || item.Usuario || item.usuario || '-',
          Observacao: item.Observacao || item.observacao || '',
          colecao: colecao,
        };
      });
    });
  }

  var store = Cebus.util.criarStore({
    estadoInicial: { lista: [], carregando: false, itemAtual: null },
    metodos: function (store, set) {
      return {
        carregar: function () {
          Cebus.servicos.debug.logFluxo('Store', 'carregar: movimentacoes');
          set({ carregando: true });
          return Promise.all([
            _buscarColecao('entradas', 'ENTRADA'),
            _buscarColecao('saidas', 'SAIDA'),
            _buscarColecao('distribuicoes', 'DISTRIBUICAO'),
          ]).then(function (results) {
            var todas = results[0].concat(results[1]).concat(results[2]);
            todas.sort(function (a, b) {
              if (a.Data !== b.Data) return (b.Data || '').localeCompare(a.Data || '');
              if (a.id > b.id) return -1;
              if (a.id < b.id) return 1;
              return 0;
            });
            set({ lista: todas, carregando: false });
            Cebus.servicos.debug.logFluxo('Store', 'carregar concluido: ' + todas.length + ' registros');
            Cebus.servicos.debug.fimFluxo();
            return todas;
          }).catch(function (err) {
            console.warn('[Movimentacoes] Erro ao carregar:', err);
            set({ lista: [], carregando: false });
            Cebus.servicos.debug.logFluxo('Store', 'ERRO ao carregar', err.message || err);
            Cebus.servicos.debug.fimFluxo();
            return [];
          });
        },
        salvar: function (dados) {
          return Promise.resolve(dados);
        },
        remover: function (id) {
          return Promise.resolve();
        },
        definirItemAtual: function (item) { set({ itemAtual: item }); },
      };
    },
  });

  Cebus.registrador.registrarStore('movimentacoes', store);
})();

/* ==========================================================================
   ARQUIVO: RelatoriosPagina.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  var relatorios = [
    { id: 'estoque', icone: 'package', nome: 'Relatório de Estoque', descricao: 'Relatório completo com a situação atual de todos os produtos em estoque.' },
    { id: 'movimentacao-periodo', icone: 'activity', nome: 'Movimentações por Período', descricao: 'Lista todas as movimentações realizadas em um período selecionado.' },
    { id: 'entradas-fornecedor', icone: 'truck', nome: 'Entradas por Fornecedor', descricao: 'Agrupa as entradas de produtos por fornecedor em um intervalo de datas.' },
    { id: 'saidas-destino', icone: 'map-pin', nome: 'Saídas por Destino', descricao: 'Relatório de saídas organizadas por destino ou rota de distribuição.' },
    { id: 'estoque-baixo', icone: 'alert-triangle', nome: 'Produtos com Estoque Baixo', descricao: 'Lista produtos com quantidade abaixo do mínimo configurado para alerta.' },
  ];

  function renderizarTabelaRelatorio(rel) {
    if (!rel || !rel.dados || !rel.dados.length) {
      return '<div style="padding:2rem;text-align:center;color:var(--cor-texto-secundario);"><p>Nenhum dado encontrado para este relatório.</p></div>';
    }
    var html = '<div style="overflow-x:auto;max-height:60vh;overflow-y:auto;padding:0.5rem;">';
    html += '<table style="width:100%;border-collapse:collapse;font-size:0.85rem;">';
    html += '<thead><tr>';
    rel.colunas.forEach(function (col) {
      html += '<th style="text-align:left;padding:0.5rem 0.75rem;border-bottom:2px solid var(--cor-borda);font-weight:600;color:var(--cor-texto-secundario);white-space:nowrap;">' + col + '</th>';
    });
    html += '</tr></thead><tbody>';
    rel.dados.forEach(function (linha) {
      html += '<tr>';
      rel.colunas.forEach(function (col) {
        var val = linha[col] !== undefined ? linha[col] : '';
        if (val !== null && val !== undefined && typeof val === 'number') {
          val = val.toFixed ? val.toFixed(2) : val;
        }
        html += '<td style="padding:0.5rem 0.75rem;border-bottom:1px solid var(--cor-borda);color:var(--cor-texto);">' + val + '</td>';
      });
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    return html;
  }

  var pagina = {
    mudarItensPorPagina: function(el) { if (paginacao) paginacao.mudarPorPagina(el.value); },
    css: '.relatorios-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;}',

    antesRenderizar: function () {
      document.title = 'Relatórios - ' + Cebus.config.nomeSistema;
    },

    renderar: function () {
      var conteudo = Cebus.layout.painelAcoes.renderizar({
        titulo: 'Relatórios',
        acoes: [
          { acao: 'recarregarRelatorios', rotulo: 'Atualizar', icone: 'refresh-cw', tipo: 'secundario' },
        ],
      });

      conteudo += '<p style="color:var(--cor-texto-secundario);font-size:0.875rem;margin:0 0 1.5rem;">Selecione um relatório para gerar:</p>';
      conteudo += '<div class="relatorios-grid">';

      relatorios.forEach(function (r) {
        conteudo += '<div class="cartao-item" style="background:var(--cor-superficie);border-radius:0.75rem;padding:1.5rem;border:1px solid var(--cor-borda);display:flex;flex-direction:column;">';
        conteudo += '<div style="width:2.5rem;height:2.5rem;border-radius:0.5rem;background:var(--cor-primaria);display:flex;align-items:center;justify-content:center;margin-bottom:1rem;">';
        conteudo += '<i data-lucide="' + r.icone + '" size="20" style="color:#fff;"></i></div>';
        conteudo += '<h3 style="margin:0 0 0.5rem;font-size:1rem;font-weight:600;color:var(--cor-texto);">' + r.nome + '</h3>';
        conteudo += '<p style="margin:0 0 1.25rem;font-size:0.8rem;color:var(--cor-texto-secundario);flex:1;">' + r.descricao + '</p>';
        conteudo += '<button class="btn btn-primario" data-acao="gerarRelatorio" data-relatorio="' + r.id + '" data-nome="' + r.nome + '"><i data-lucide="file-text" size="16"></i> Gerar</button>';
        conteudo += '</div>';
      });

      conteudo += '</div>';
      return Cebus.layout.renderizar(conteudo);
    },

    gerarRelatorio: function (el) {
      var relatorioId = el.getAttribute('data-relatorio');
      var nome = el.getAttribute('data-nome');
      var store = Cebus.registrador.obterStore('relatorios');

      var params = {};
      if (relatorioId === 'movimentacao-periodo') {
        params.dataInicio = prompt('Data de início (AAAA-MM-DD):') || '';
        params.dataFim = prompt('Data de fim (AAAA-MM-DD):') || '';
      }

      store.gerarRelatorio(relatorioId, params).then(function (rel) {
        Cebus.componentes.modal.abrir({
          titulo: nome,
          largura: 800,
          conteudo: renderizarTabelaRelatorio(rel),
          rodape: '<button class="btn btn-primario" data-acao="fecharModalRelatorio">Fechar</button>',
        });
      });
    },

    fecharModalRelatorio: function () {
      Cebus.componentes.modal.fechar();
    },

    destruir: function () {},

    recarregarRelatorios: function () {
      Cebus.roteador.recarregar();
    },
  };

  Cebus.registrador.registrarPagina('/relatorios', pagina);
})();

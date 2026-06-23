(function () {
  var pagina = {
    mudarItensPorPagina: function(el) { if (paginacao) paginacao.mudarPorPagina(el.value); },
    css: '.grid-dashboard{gap:1.5rem;}.cartao-dashboard{background:var(--cor-superficie);border-radius:0.75rem;padding:1.5rem;border:1px solid var(--cor-borda);}.dashboard-header{margin-bottom:1.5rem;}',

    antesRenderizar: function () {
      document.title = 'Dashboard - ' + Cebus.config.nomeSistema;
      var store = Cebus.registrador.obterStore('painel');
      if (store && store.carregarResumo) store.carregarResumo();
    },

    renderar: function () {
      var store = Cebus.registrador.obterStore('painel');
      var resumo = store ? store.obterEstado().resumo : {};

      var conteudo = Cebus.layout.painelAcoes.renderizar({
        titulo: 'Dashboard',
        acoes: [
          { acao: 'recarregarDashboard', rotulo: 'Atualizar', icone: 'refresh-cw', tipo: 'secundario' },
        ],
      });

      conteudo += '<div class="grid-dashboard" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.5rem;margin-bottom:1.5rem;">';

      conteudo += Cebus.widgets.cartaoResumo.renderizar({ icone: 'package', rotulo: 'Total de Produtos', valor: resumo.totalProdutos || 0, cor: '#10b981' });
      conteudo += Cebus.widgets.cartaoResumo.renderizar({ icone: 'truck', rotulo: 'Fornecedores', valor: resumo.totalFornecedores || 0, cor: '#3b82f6' });
      conteudo += Cebus.widgets.cartaoResumo.renderizar({ icone: 'arrow-down-to-line', rotulo: 'Entradas (mês)', valor: resumo.totalEntradas || 0, cor: '#8b5cf6' });
      conteudo += Cebus.widgets.cartaoResumo.renderizar({ icone: 'arrow-up-from-line', rotulo: 'Saídas (mês)', valor: resumo.totalSaidas || 0, cor: '#f59e0b' });
      conteudo += Cebus.widgets.cartaoResumo.renderizar({ icone: 'activity', rotulo: 'Movimentos Hoje', valor: resumo.movimentosHoje || 0, cor: '#ec4899' });
      conteudo += Cebus.widgets.cartaoResumo.renderizar({ icone: 'dollar-sign', rotulo: 'Valor em Estoque', valor: Cebus.util.mascaraMoeda(resumo.valorEstoque || 0), cor: '#06b6d4' });

      conteudo += '</div>';

      conteudo += '<div class="grid-dashboard" style="display:grid;grid-template-columns:2fr 1fr;gap:1.5rem;">';

      var estado = store ? store.obterEstado() : {};
      var ultimosMov = estado.ultimosMovimentos || [];
      var baixoEstoque = estado.produtosBaixoEstoque || [];

      conteudo += '<div class="cartao-dashboard"><h3 style="margin:0 0 1rem;font-size:1rem;font-weight:600;color:var(--cor-texto);">Últimas Movimentações</h3>';
      if (ultimosMov.length) {
        conteudo += '<div style="display:flex;flex-direction:column;gap:0.5rem;">';
        ultimosMov.forEach(function (m) {
          var tipoClasse = m.tipo === 'ENTRADA' ? 'badge-sucesso' : m.tipo === 'SAIDA' ? 'badge-perigo' : 'badge-info';
          conteudo += '<div style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--cor-borda);font-size:0.85rem;">';
          conteudo += '<span style="color:var(--cor-texto);">' + (m.Produto || m.produto || '-') + '</span>';
          conteudo += '<span class="badge ' + tipoClasse + '" style="font-size:0.7rem;">' + m.tipo + '</span>';
          conteudo += '<span style="color:var(--cor-texto-secundario);">' + (m.Quantidade || m.quantidade || '') + '</span>';
          conteudo += '<span style="color:var(--cor-texto-secundario);font-size:0.75rem;">' + (m.Data || m.data || '') + '</span>';
          conteudo += '</div>';
        });
        conteudo += '</div>';
      } else {
        conteudo += '<p style="color:var(--cor-texto-secundario);font-size:0.875rem;">Nenhuma movimentação recente</p>';
      }
      conteudo += '</div>';

      conteudo += '<div class="cartao-dashboard"><h3 style="margin:0 0 1rem;font-size:1rem;font-weight:600;color:var(--cor-texto);">Produtos com Estoque Baixo</h3>';
      if (baixoEstoque.length) {
        conteudo += '<div style="display:flex;flex-direction:column;gap:0.5rem;">';
        baixoEstoque.forEach(function (p) {
          conteudo += '<div style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--cor-borda);font-size:0.85rem;">';
          conteudo += '<span style="color:var(--cor-texto);">' + (p.Produto || p.produto || '-') + '</span>';
          conteudo += '<span style="color:var(--cor-perigo);font-weight:600;">' + (p.Saldo || p.saldo || 0) + '</span>';
          conteudo += '</div>';
        });
        conteudo += '</div>';
      } else {
        conteudo += '<p style="color:var(--cor-texto-secundario);font-size:0.875rem;">Nenhum produto crítico</p>';
      }
      conteudo += '</div>';

      conteudo += '</div>';

      return Cebus.layout.renderizar(conteudo);
    },

    destruir: function () {},

    recarregarDashboard: function () {
      var store = Cebus.registrador.obterStore('painel');
      if (store && store.carregarResumo) store.carregarResumo();
      Cebus.roteador.recarregar();
    },
  };

  Cebus.registrador.registrarPagina('/painel', pagina);
})();

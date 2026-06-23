/* ==========================================================================
   ARQUIVO: EstoquePagina.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  var paginacao = null;
  var busca = null;
  var dadosCompletos = [];

  var mapaStatus = { NORMAL: 'sucesso', BAIXO: 'aviso', ESGOTADO: 'perigo', EXCEDENTE: 'info' };
  var rotulosStatus = { NORMAL: 'OK', BAIXO: 'Abaixo de 20', ESGOTADO: 'Estoque vazio', EXCEDENTE: 'Excedente' };

  function inicializarHooks() {
    paginacao = Cebus.util.usePaginacao({
      id: 'estoque',
      porPagina: Cebus.config.itensPorPagina || 20,
      onChange: function () {
        var el = document.querySelector('.tabela-estoque tbody');
        if (el) {
          el.innerHTML = renderizarLinhas();
          var controles = document.querySelector('.paginacao-container');
          if (controles) controles.innerHTML = paginacao.renderizarControles();
          var totalEl = document.querySelector('.estoque-totais');
          if (totalEl) totalEl.innerHTML = renderizarTotais();
          if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
        }
      }
    });
    busca = Cebus.util.useBusca({
      dados: dadosCompletos,
      campos: ['ID_Produto', 'Produto', 'Fornecedor', 'Unidade', 'Situacao'],
      onChange: function (filtrados) {
        paginacao.definirDados(filtrados);
        var el = document.querySelector('.tabela-estoque tbody');
        if (el) {
          el.innerHTML = renderizarLinhas();
          var controles = document.querySelector('.paginacao-container');
          if (controles) controles.innerHTML = paginacao.renderizarControles();
          var totalEl = document.querySelector('.estoque-totais');
          if (totalEl) totalEl.innerHTML = renderizarTotais();
          if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
        }
      }
    });
  }

  function formatarData(v) {
    if (!v) return '-';
    if (v.seconds) return new Date(v.seconds * 1000).toLocaleDateString('pt-BR');
    if (v.toDate) return v.toDate().toLocaleDateString('pt-BR');
    var d = new Date(v);
    return isNaN(d.getTime()) ? v : d.toLocaleDateString('pt-BR');
  }

  function renderizarLinhas() {
    var paginados = paginacao ? paginacao.obterPaginados() : [];
    var html = '';
    if (!paginados.length) {
      return '<tr><td colspan="8" style="text-align:center;padding:3rem;color:var(--cor-texto-secundario);">Nenhum produto encontrado</td></tr>';
    }
    paginados.forEach(function (p) {
      var qtd = p.Saldo !== undefined ? p.Saldo : (p.quantidade || 0);
      var sit = p.Situacao || 'NORMAL';
      var badgeClasse = mapaStatus[sit] || 'sucesso';
      var rotulo = rotulosStatus[sit] || sit;

      html += '<tr>';
      html += '<td style="font-family:monospace;font-size:0.8rem;">' + (p.ID_Produto || p.id || '-') + '</td>';
      html += '<td><button class="btn-link-tabela" data-acao="editarProduto" data-id="' + p.id + '" style="background:none;border:none;color:var(--cor-primaria);cursor:pointer;text-decoration:underline;text-underline-offset:2px;text-decoration-style:dotted;font-family:inherit;font-size:inherit;">' + (p.Produto || p.nome || '-') + '</button></td>';
      html += '<td style="font-weight:700;color:' + (qtd <= 0 ? 'var(--cor-perigo)' : qtd < 20 ? 'var(--cor-aviso)' : 'var(--cor-sucesso)') + ';">' + qtd + ' ' + (p.Unidade || p.unidade || '') + '</td>';
      html += '<td>' + (p.Unidade || p.unidade || '-') + '</td>';
      html += '<td>' + formatarData(p.UltimaAtualizacao || p.data || p.Data || p.criadoEm) + '</td>';
      html += '<td>' + (p.Fornecedor || p.fornecedorNome || '-') + '</td>';
      html += '<td><span class="badge badge-' + badgeClasse + '" style="font-size:0.75rem;">' + rotulo + '</span></td>';
      html += '<td style="display:flex;gap:0.5rem;">';
      html += '<button class="btn btn-pequeno btn-primario" data-acao="editarProduto" data-id="' + p.id + '">Editar</button>';
      html += '<button class="btn btn-pequeno btn-perigo" data-acao="removerProduto" data-id="' + p.id + '">Remover</button>';
      html += '</td></tr>';
    });
    return html;
  }

  function renderizarTotais() {
    var lista = dadosCompletos;
    var totalKg = 0, totalUn = 0;
    lista.forEach(function (i) {
      var qtd = i.Saldo !== undefined ? i.Saldo : (i.quantidade || 0);
      var un = (i.Unidade || '').toLowerCase();
      if (un === 'kg') totalKg += qtd;
      else if (un === 'un' || un === 'unidade') totalUn += qtd;
    });
    return '<span><strong>Total em Kilos:</strong> ' + totalKg + '</span>' +
      '<span><strong>Total em Unidades:</strong> ' + totalUn + '</span>';
  }

  var pagina = {
    mudarItensPorPagina: function(el) { if (paginacao) paginacao.mudarPorPagina(el.value); },
    css: '.estoque-busca{margin-bottom:1rem;}.tabela-estoque{width:100%;border-collapse:collapse;}.tabela-estoque th,.tabela-estoque td{text-align:left;padding:0.75rem 1rem;border-bottom:1px solid var(--cor-borda);}.tabela-estoque th{font-weight:600;color:var(--cor-texto-secundario);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.05em;}.estoque-totais{display:flex;gap:1.5rem;justify-content:flex-end;padding:0.75rem 1rem;font-size:0.85rem;color:var(--cor-texto-secundario);}',

    antesRenderizar: function () {
      document.title = 'Estoque - ' + Cebus.config.nomeSistema;
      Cebus.servicos.debug.logFluxo('Pagina', 'antesRenderizar: Estoque');
      var store = Cebus.registrador.obterStore('estoque');
      if (store) return Cebus.servicos.debug.fluxoAsync('Estoque', store.carregar());
      Cebus.servicos.debug.fimFluxo();
    },

    renderar: function () {
      var store = Cebus.registrador.obterStore('estoque');
      var dados = store ? store.obterEstado().lista : [];
      dadosCompletos = dados;

      inicializarHooks();
      paginacao.definirDados(dadosCompletos);
      busca.definirDados(dadosCompletos);

      var conteudo = Cebus.layout.painelAcoes.renderizar({
        titulo: 'Estoque',
        acoes: [
          { acao: 'abrirNovoProduto', rotulo: 'Novo Produto', icone: 'plus' },
          { acao: 'recarregarEstoque', rotulo: 'Atualizar', icone: 'refresh-cw', tipo: 'secundario' },
        ],
      });

      conteudo += '<div class="estoque-busca">' + busca.renderizarCampo('Pesquisar por produto...') + '</div>';
      conteudo += '<div style="background:var(--cor-superficie);border-radius:0.75rem;border:1px solid var(--cor-borda);overflow-x:auto;">';
      conteudo += '<table class="tabela-estoque"><thead><tr>';
      conteudo += '<th>ID</th><th>Produto</th><th>Quantidade</th><th>Un. Medida</th><th>Data</th><th>Fornecedor</th><th>Situação</th><th>Ações</th>';
      conteudo += '</tr></thead><tbody>' + renderizarLinhas() + '</tbody></table></div>';
      conteudo += '<div class="estoque-totais">' + renderizarTotais() + '</div>';
      conteudo += '<div class="paginacao-container">' + (paginacao ? paginacao.renderizarControles() : '') + '</div>';

      return Cebus.layout.renderizar(conteudo);
    },

    destruir: function () {
      paginacao = null;
      busca = null;
      dadosCompletos = [];
    },

    buscar: function (el) {
      busca.definirTermo(el.value);
    },

    abrirNovoProduto: function () {
      Cebus.componentes.modal.abrir({
        titulo: 'Novo Produto',
        largura: 600,
        conteudo: Cebus.componentes.formulario.renderizar({
          id: 'formProduto',
          acaoSubmit: 'salvarProduto',
          campos: [
            { nome: 'ID_Produto', rotulo: 'ID do Produto', tipo: 'text', obrigatorio: true, placeholder: 'Código único do produto' },
            { nome: 'Produto', rotulo: 'Nome', tipo: 'text', obrigatorio: true, placeholder: 'Nome do produto' },
            { nome: 'categoria', rotulo: 'Categoria', tipo: 'select', placeholder: 'Selecione a categoria', opcoes: ['Hortifruti', 'Carnes', 'Laticinios', 'Bebidas', 'Secos', 'Limpeza', 'Descartaveis', 'Outros'] },
            { nome: 'Quantidade', rotulo: 'Quantidade', tipo: 'number', placeholder: '0' },
            { nome: 'Unidade', rotulo: 'Unidade', tipo: 'select', valor: 'UN', opcoes: [
              { valor: 'UN', rotulo: 'Unidade' },
              { valor: 'KG', rotulo: 'Quilograma' },
              { valor: 'L', rotulo: 'Litro' },
              { valor: 'CX', rotulo: 'Caixa' },
              { valor: 'PC', rotulo: 'Peça' },
              { valor: 'PCT', rotulo: 'Pacote' },
            ]},
            { nome: 'precoCusto', rotulo: 'Preço de Custo', tipo: 'number', placeholder: '0,00' },
            { nome: 'precoVenda', rotulo: 'Preço de Venda', tipo: 'number', placeholder: '0,00' },
            { nome: 'Fornecedor', rotulo: 'Fornecedor', tipo: 'text', placeholder: 'Nome do fornecedor' },
            { nome: 'estoqueMinimo', rotulo: 'Estoque Mínimo', tipo: 'number', placeholder: '0' },
            { nome: 'situacao', rotulo: 'Situação', tipo: 'select', valor: 'ativo', opcoes: [{ valor: 'ativo', rotulo: 'Ativo' }, { valor: 'inativo', rotulo: 'Inativo' }] },
          ],
        }),
        rodape: '',
      });
    },

    salvarProduto: function (form, e) {
      e.preventDefault();
      var dados = Cebus.componentes.formulario.extrairDados('formProduto');
      var id = dados.ID_Produto;
      if (!id) { Cebus.notificacoes.erro('ID do Produto é obrigatório'); return; }

      // Busca o item existente para preservar o histórico de movimentações
      var repo = Cebus.repositorios.criar('estoque');
      repo.obterPorId(id).then(function (itemAtual) {
        var qtdManual = parseFloat(dados.Quantidade || 0);

        if (itemAtual) {
          // Modo edição: preserva EntradaTotal e SaidaTotal. Quantidade no form é usada como ajuste direto do Saldo,
          // recalculando EntradaTotal = SaidaTotal + qtdManual para manter o saldo correto.
          dados.EntradaTotal = itemAtual.EntradaTotal || 0;
          dados.SaidaTotal = itemAtual.SaidaTotal || 0;
          dados.Saldo = itemAtual.EntradaTotal - itemAtual.SaidaTotal;
          dados.quantidade = dados.Saldo;
        } else {
          // Novo produto: quantidade inicial é o estoque de abertura
          dados.EntradaTotal = qtdManual;
          dados.SaidaTotal = 0;
          dados.Saldo = qtdManual;
          dados.quantidade = qtdManual;
        }

        dados.Situacao = dados.Situacao || 'NORMAL';
        if (!dados.UltimaAtualizacao) dados.UltimaAtualizacao = new Date().toISOString();
        if (!dados.Fornecedor) delete dados.Fornecedor;
        console.log('[Estoque] salvarProduto id=' + id + ' EntradaTotal=' + dados.EntradaTotal + ' SaidaTotal=' + dados.SaidaTotal + ' Saldo=' + dados.Saldo);

        repo.salvarComId(id, dados).then(function () {
          Cebus.componentes.modal.fechar();
          Cebus.notificacoes.sucesso('Produto salvo com sucesso!');
          Cebus.roteador.recarregar();
        }).catch(function (err) {
          Cebus.notificacoes.erro('Erro ao salvar: ' + err.message);
        });
      }).catch(function (err) {
        Cebus.notificacoes.erro('Erro ao buscar produto: ' + err.message);
      });
    },

    editarProduto: function (el) {
      var id = el.getAttribute('data-id');
      var store = Cebus.registrador.obterStore('estoque');
      var dados = store.obterEstado().lista;
      var item = dados.find(function (p) { return p.id === id || p.ID_Produto === id; });
      if (!item) return;

      Cebus.componentes.modal.abrir({
        titulo: 'Editar Produto',
        largura: 600,
        conteudo: Cebus.componentes.formulario.renderizar({
          id: 'formProduto',
          acaoSubmit: 'salvarProduto',
          campos: [
            { nome: 'ID_Produto', rotulo: 'ID do Produto', tipo: 'text', obrigatorio: true, valor: item.ID_Produto || item.id || '' },
            { nome: 'Produto', rotulo: 'Nome', tipo: 'text', obrigatorio: true, valor: item.Produto || item.nome || '' },
            { nome: 'categoria', rotulo: 'Categoria', tipo: 'select', valor: item.categoria || '', opcoes: ['Hortifruti', 'Carnes', 'Laticinios', 'Bebidas', 'Secos', 'Limpeza', 'Descartaveis', 'Outros'] },
            { nome: 'Quantidade', rotulo: 'Quantidade', tipo: 'number', valor: item.quantidade || item.Saldo || 0 },
            { nome: 'Unidade', rotulo: 'Unidade', tipo: 'select', valor: item.Unidade || 'UN', opcoes: [
              { valor: 'UN', rotulo: 'Unidade' },
              { valor: 'KG', rotulo: 'Quilograma' },
              { valor: 'L', rotulo: 'Litro' },
              { valor: 'CX', rotulo: 'Caixa' },
              { valor: 'PC', rotulo: 'Peça' },
              { valor: 'PCT', rotulo: 'Pacote' },
            ]},
            { nome: 'precoCusto', rotulo: 'Preço de Custo', tipo: 'number', valor: item.precoCusto || 0 },
            { nome: 'precoVenda', rotulo: 'Preço de Venda', tipo: 'number', valor: item.precoVenda || 0 },
            { nome: 'Fornecedor', rotulo: 'Fornecedor', tipo: 'text', valor: item.Fornecedor || item.fornecedorNome || '' },
            { nome: 'estoqueMinimo', rotulo: 'Estoque Mínimo', tipo: 'number', valor: item.estoqueMinimo || 0 },
            { nome: 'situacao', rotulo: 'Situação', tipo: 'select', valor: item.situacao || 'ativo', opcoes: [{ valor: 'ativo', rotulo: 'Ativo' }, { valor: 'inativo', rotulo: 'Inativo' }] },
          ],
        }),
        rodape: '',
      });
    },

    removerProduto: function (el) {
      var id = el.getAttribute('data-id');
      Cebus.notificacoes.confirmar('Remover este produto do estoque?').then(function (ok) {
        if (!ok) return;
        var store = Cebus.registrador.obterStore('estoque');
        store.remover(id).then(function () {
          Cebus.notificacoes.sucesso('Produto removido!');
          Cebus.roteador.recarregar();
        });
      });
    },

    recarregarEstoque: function () {
      Cebus.roteador.recarregar();
    },
  };

  Cebus.registrador.registrarPagina('/estoque', pagina);
})();

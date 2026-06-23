(function () {
  var paginacao = null;
  var busca = null;
  var dadosCompletos = [];
  var produtoModal = null;
  var editandoId = null;

  function fecharProdutoModal() {
    if (produtoModal) { produtoModal.remove(); produtoModal = null; }
  }

  function abrirProdutoModal(dados) {
    fecharProdutoModal();
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;';
    var card = document.createElement('div');
    card.style.cssText = 'background:var(--cor-superficie);border-radius:1rem;padding:2rem;min-width:360px;max-width:480px;box-shadow:0 20px 60px rgba(0,0,0,0.3);';
    card.innerHTML = '<h3 style="margin:0 0 1rem;font-weight:700;">' + (dados.Produto || 'Produto') + '</h3>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;font-size:0.9rem;">' +
      '<span style="color:var(--cor-texto-secundario);">ID:</span><span style="font-family:monospace;">' + (dados.ID_Produto || '-') + '</span>' +
      '<span style="color:var(--cor-texto-secundario);">Unidade:</span><span>' + (dados.Unidade || '-') + '</span>' +
      '</div>' +
      '<button style="margin-top:1.5rem;padding:0.5rem 1.5rem;border-radius:0.5rem;border:none;background:var(--cor-primaria);color:#fff;cursor:pointer;font-weight:600;" data-fechar-modal>Fechar</button>';
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    produtoModal = overlay;
    overlay.querySelector('[data-fechar-modal]').onclick = fecharProdutoModal;
    overlay.onclick = function (e) { if (e.target === overlay) fecharProdutoModal(); };
  }

  function inicializarHooks() {
    paginacao = Cebus.util.usePaginacao({
      id: 'saidas',
      porPagina: Cebus.config.itensPorPagina || 20,
      onChange: function () {
        var el = document.querySelector('.tabela-saidas tbody');
        if (el) {
          el.innerHTML = renderizarLinhas();
          var controles = document.querySelector('.paginacao-container');
          if (controles) controles.innerHTML = paginacao.renderizarControles();
          if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
        }
      }
    });

    busca = Cebus.util.useBusca({
      dados: dadosCompletos,
      campos: ['Produto'],
      onChange: function (filtrados) {
        paginacao.definirDados(filtrados);
        var el = document.querySelector('.tabela-saidas tbody');
        if (el) {
          el.innerHTML = renderizarLinhas();
          var controles = document.querySelector('.paginacao-container');
          if (controles) controles.innerHTML = paginacao.renderizarControles();
          if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
        }
      }
    });
  }

  function renderizarLinhas() {
    var paginados = paginacao ? paginacao.obterPaginados() : [];
    var html = '';
    if (!paginados.length) {
      return '<tr><td colspan="7" style="text-align:center;padding:3rem;color:var(--cor-texto-secundario);">Nenhuma saída encontrada</td></tr>';
    }
    paginados.forEach(function (s) {
      html += '<tr>';
      html += '<td style="font-family:monospace;font-size:0.8rem;">' + (s.ID_Saida || s.id || '-') + '</td>';
      html += '<td>' + (s.Data || s.data || '-') + '</td>';
      html += '<td>' + (s.Hora || s.hora || '-') + '</td>';
      html += '<td><button class="btn-link-produto" data-id="' + s.id + '" style="background:none;border:none;color:var(--cor-primaria);cursor:pointer;text-decoration:underline;text-underline-offset:2px;text-decoration-style:dotted;font-family:inherit;font-size:inherit;">' + (s.Produto || s.produto || '-') + '</button></td>';
      html += '<td>' + (s.Quantidade || s.quantidade || 0) + '</td>';
      html += '<td>' + (s.Unidade || s.unidade || '-') + '</td>';
      html += '<td style="display:flex;gap:0.5rem;">';
      html += '<button class="btn btn-pequeno btn-primario" data-acao="editarSaida" data-id="' + s.id + '">Editar</button>';
      html += '<button class="btn btn-pequeno btn-perigo" data-acao="removerSaida" data-id="' + s.id + '">Remover</button>';
      html += '</td></tr>';
    });
    return html;
  }

  var pagina = {
    mudarItensPorPagina: function(el) { if (paginacao) paginacao.mudarPorPagina(el.value); },
    css: '.saidas-busca{margin-bottom:1rem;}.tabela-saidas{width:100%;border-collapse:collapse;}.tabela-saidas th,.tabela-saidas td{text-align:left;padding:0.75rem 1rem;border-bottom:1px solid var(--cor-borda);}.tabela-saidas th{font-weight:600;color:var(--cor-texto-secundario);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.05em;}',

    antesRenderizar: function () {
      document.title = 'Saidas - ' + Cebus.config.nomeSistema;
      Cebus.servicos.debug.logFluxo('Pagina', 'antesRenderizar: Saidas');
      var store = Cebus.registrador.obterStore('saidas');
      if (store) return Cebus.servicos.debug.fluxoAsync('Saidas', store.carregar());
      Cebus.servicos.debug.fimFluxo();
    },

    renderar: function () {
      var store = Cebus.registrador.obterStore('saidas');
      var dados = store ? store.obterEstado().lista : [];
      dadosCompletos = dados;

      inicializarHooks();
      paginacao.definirDados(dadosCompletos);
      busca.definirDados(dadosCompletos);

      var conteudo = Cebus.layout.painelAcoes.renderizar({
        titulo: 'Saidas',
        acoes: [
          { acao: 'abrirNovaSaida', rotulo: 'Nova Saida', icone: 'plus' },
          { acao: 'recarregarSaidas', rotulo: 'Atualizar', icone: 'refresh-cw', tipo: 'secundario' },
        ],
      });

      conteudo += '<div class="saidas-busca">' + busca.renderizarCampo('Pesquisar por produto...') + '</div>';
      conteudo += '<div style="background:var(--cor-superficie);border-radius:0.75rem;border:1px solid var(--cor-borda);overflow-x:auto;">';
      conteudo += '<table class="tabela-saidas"><thead><tr>';
      conteudo += '<th>Código</th><th>Data</th><th>Hora</th><th>Produto</th><th>Quantidade</th><th>Un</th><th>Ações</th>';
      conteudo += '</tr></thead><tbody>' + renderizarLinhas() + '</tbody></table></div>';
      conteudo += '<div class="paginacao-container">' + (paginacao ? paginacao.renderizarControles() : '') + '</div>';

      return Cebus.layout.renderizar(conteudo);
    },

    depoisRenderizar: function () {
      document.querySelector('.tabela-saidas').addEventListener('click', function (e) {
        var btn = e.target.closest('.btn-link-produto');
        if (btn) {
          var store = Cebus.registrador.obterStore('saidas');
          var item = store.obterEstado().lista.find(function (s) { return s.id === btn.getAttribute('data-id'); });
          if (item) abrirProdutoModal({ ID_Produto: item.ID_Produto, Produto: item.Produto || item.produto, Unidade: item.Unidade || item.unidade });
        }
      });
    },

    destruir: function () { fecharProdutoModal(); paginacao = null; busca = null; dadosCompletos = []; },

    buscar: function (el) { busca.definirTermo(el.value); },

    abrirNovaSaida: function () {
      editandoId = null;
      Cebus.componentes.modal.abrir({
        titulo: 'Nova Saida',
        largura: 500,
        conteudo: Cebus.componentes.formulario.renderizar({
          id: 'formSaida',
          acaoSubmit: 'salvarSaida',
          campos: [
            { nome: 'ID_Produto', rotulo: 'ID do Produto', tipo: 'text', placeholder: 'Código do produto' },
            { nome: 'Produto', rotulo: 'Produto', tipo: 'text', obrigatorio: true, placeholder: 'Nome do produto' },
            { nome: 'Quantidade', rotulo: 'Quantidade', tipo: 'number', obrigatorio: true, placeholder: '0' },
            { nome: 'Unidade', rotulo: 'Unidade', tipo: 'select', valor: 'Kg', opcoes: [
              { valor: 'Kg', rotulo: 'Kg' },
              { valor: 'Un', rotulo: 'Un' },
            ]},
            { nome: 'Observacoes', rotulo: 'Observações', tipo: 'textarea', placeholder: 'Observações...' },
          ],
        }),
        rodape: '',
      });
    },

    salvarSaida: function (form, e) {
      e.preventDefault();
      var dados = Cebus.componentes.formulario.extrairDados('formSaida');
      if (editandoId) dados.id = editandoId;
      var agora = new Date();
      dados.Data = dados.Data || agora.toISOString().split('T')[0];
      dados.Hora = dados.Hora || agora.toTimeString().slice(0, 5);
      var store = Cebus.registrador.obterStore('saidas');
      store.salvar(dados).then(function () {
        Cebus.componentes.modal.fechar();
        editandoId = null;
        Cebus.notificacoes.sucesso('Saida registrada!');
        Cebus.roteador.recarregar();
      });
    },

    editarSaida: function (el) {
      editandoId = el.getAttribute('data-id');
      var store = Cebus.registrador.obterStore('saidas');
      var item = store.obterEstado().lista.find(function (s) { return s.id === editandoId; });
      if (!item) return;
      Cebus.componentes.modal.abrir({
        titulo: 'Editar Saida',
        largura: 500,
        conteudo: Cebus.componentes.formulario.renderizar({
          id: 'formSaida',
          acaoSubmit: 'salvarSaida',
          campos: [
            { nome: 'ID_Produto', rotulo: 'ID do Produto', tipo: 'text', valor: item.ID_Produto || '' },
            { nome: 'Produto', rotulo: 'Produto', tipo: 'text', obrigatorio: true, valor: item.Produto || item.produto || '' },
            { nome: 'Quantidade', rotulo: 'Quantidade', tipo: 'number', obrigatorio: true, valor: item.Quantidade || item.quantidade || 0 },
            { nome: 'Unidade', rotulo: 'Unidade', tipo: 'select', valor: item.Unidade || 'Kg', opcoes: [
              { valor: 'Kg', rotulo: 'Kg' },
              { valor: 'Un', rotulo: 'Un' },
            ]},
            { nome: 'Observacoes', rotulo: 'Observações', tipo: 'textarea', valor: item.Observacoes || '' },
          ],
        }),
        rodape: '',
      });
    },

    removerSaida: function (el) {
      var id = el.getAttribute('data-id');
      Cebus.notificacoes.confirmar('Remover esta saida?').then(function (ok) {
        if (!ok) return;
        var store = Cebus.registrador.obterStore('saidas');
        store.remover(id).then(function () {
          Cebus.notificacoes.sucesso('Saida removida!');
          Cebus.roteador.recarregar();
        });
      });
    },

    paginaAnterior: function () { if (paginacao) paginacao.paginaAnterior(); },
    paginaProxima: function () { if (paginacao) paginacao.proximaPagina(); },
    irParaPagina: function (el) { if (paginacao) paginacao.irParaPagina(parseInt(el.getAttribute('data-pagina'), 10)); },

    recarregarSaidas: function () { Cebus.roteador.recarregar(); },
  };

  Cebus.registrador.registrarPagina('/saidas', pagina);
})();

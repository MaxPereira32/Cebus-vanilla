/* ==========================================================================
   ARQUIVO: EntradasPagina.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  var paginacao = null;
  var busca = null;
  var dadosCompletos = [];
  var produtoModal = null;
  var editandoId = null;
  var listaFornecedores = [];
  var listaEstoque = [];

  function gerarProximoIdEntrada() {
    return Cebus.util.gerarIdComPrefixo('EN');
  }

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
      id: 'entradas',
      porPagina: Cebus.config.itensPorPagina || 20,
      onChange: function () {
        var el = document.querySelector('.tabela-entradas tbody');
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
      campos: ['Produto', 'Fornecedor', 'Categoria', 'ID_Entrada', 'ID_Produto'],
      onChange: function (filtrados) {
        paginacao.definirDados(filtrados);
        var el = document.querySelector('.tabela-entradas tbody');
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
      return '<tr><td colspan="9" style="text-align:center;padding:3rem;color:var(--cor-texto-secundario);">Nenhuma entrada encontrada</td></tr>';
    }
    paginados.forEach(function (e) {
      html += '<tr>';
      html += '<td style="font-family:monospace;font-size:0.8rem;">' + (e.ID_Entrada || e.id || '-') + '</td>';
      html += '<td>' + (Cebus.util.formatarData ? Cebus.util.formatarData(e.Data) : (e.Data || '-')) + '</td>';
      html += '<td>' + (e.Hora || '-') + '</td>';
      html += '<td><button class="btn-link-produto" data-id="' + e.id + '" style="background:none;border:none;color:var(--cor-primaria);cursor:pointer;text-decoration:underline;text-underline-offset:2px;text-decoration-style:dotted;font-family:inherit;font-size:inherit;">' + (e.Produto || e.produto || '-') + '</button></td>';
      html += '<td>' + (e.Categoria || '-') + '</td>';
      html += '<td>' + (e.Quantidade || e.quantidade || 0) + '</td>';
      html += '<td>' + (e.Unidade || e.unidade || '-') + '</td>';
      html += '<td>' + (e.Fornecedor || e.fornecedorNome || '-') + '</td>';
      html += '<td style="white-space:nowrap;">' +
        '<button class="btn btn-pequeno btn-primario" data-acao="editarEntrada" data-id="' + (e.id || e.ID_Entrada) + '">Editar</button> ' +
        '<button class="btn btn-pequeno btn-perigo" data-acao="removerEntrada" data-id="' + (e.id || e.ID_Entrada) + '">Remover</button>' +
        '</td>';
      html += '</tr>';
    });
    return html;
  }

  function renderizarProdutoAutocomplete(valor, idProduto, readonly) {
    var html = '<div class="form-group">';
    html += '<label class="form-label">Produto</label>';
    if (readonly) {
      html += '<input type="text" class="form-control" id="inputProdutoAutocomplete" value="' + (valor || '') + '" readonly style="margin-bottom:0.35rem; background: var(--cor-fundo);" />';
    } else {
      html += '<input type="text" class="form-control" id="inputProdutoAutocomplete" list="listaEstoqueDatalist" value="' + (valor || '') + '" placeholder="Digite ou selecione um produto..." required style="margin-bottom:0.35rem;" />';
      html += '<datalist id="listaEstoqueDatalist">';
      for (var i = 0; i < listaEstoque.length; i++) {
        var p = listaEstoque[i];
        html += '<option value="' + (p.Produto || '') + '" data-id="' + (p.ID_Produto || '') + '" data-un="' + (p.Unidade || '') + '">' + (p.ID_Produto || '') + ' - ' + (p.Unidade || '') + '</option>';
      }
      html += '</datalist>';
    }
    html += '<input type="hidden" id="inputEntradaID_Produto" name="ID_Produto" value="' + (idProduto || '') + '" />';
    if (idProduto) {
      html += '<span style="font-size:0.75rem;color:var(--cor-primaria);">' + idProduto + ' — produto vinculado</span>';
      if (readonly) html += '<span style="font-size:0.75rem;color:var(--cor-texto-secundario);display:block;margin-top:0.25rem;">(Para corrigir o nome, edite na aba Estoque)</span>';
    }
    html += '</div>';
    return html;
  }

  function renderizarSelectFornecedor(valor) {
    var html = '<div class="form-group">';
    html += '<label class="form-label">Fornecedor</label>';
    html += '<select class="form-control" id="selectFornecedor" name="Fornecedor">';
    html += '<option value="">Selecione</option>';
    for (var i = 0; i < listaFornecedores.length; i++) {
      var f = listaFornecedores[i];
      var nomeForn = f.Nome || f.nome || f.razaoSocial || '';
      var selected = (nomeForn === valor) ? ' selected' : '';
      html += '<option value="' + nomeForn + '"' + selected + '>' + nomeForn + '</option>';
    }
    html += '</select>';
    html += '</div>';
    return html;
  }

  function renderizarSelectCategoria(valor) {
    var html = '<div class="form-group">';
    html += '<label class="form-label">Categoria</label>';
    html += '<select class="form-control" id="selectCategoria" name="Categoria">';
    html += '<option value="">Selecione</option>';
    var categorias = ['Hortifrut', 'Laticínios', 'Ração'];
    for (var i = 0; i < categorias.length; i++) {
      var c = categorias[i];
      var selected = c === valor ? ' selected' : '';
      html += '<option value="' + c + '"' + selected + '>' + c + '</option>';
    }
    html += '</select>';
    html += '</div>';
    return html;
  }

  function vincularAutocomplete() {
    var input = document.getElementById('inputProdutoAutocomplete');
    var hidden = document.getElementById('inputEntradaID_Produto');
    if (!input || !hidden) return;
    input.addEventListener('input', function () {
      var val = input.value.toLowerCase();
      var encontrado = null;
      for (var i = 0; i < listaEstoque.length; i++) {
        if ((listaEstoque[i].Produto || '').toLowerCase() === val) {
          encontrado = listaEstoque[i];
          break;
        }
      }
      if (encontrado) {
        hidden.value = encontrado.ID_Produto || '';
        var unSelect = document.querySelector('[name="Unidade"]');
        if (unSelect) unSelect.value = encontrado.Unidade || 'Kg';
        var info = input.parentNode.querySelector('.produto-cadastrado-info');
        if (!info) {
          info = document.createElement('span');
          info.className = 'produto-cadastrado-info';
          info.style.cssText = 'font-size:0.75rem;color:var(--cor-primaria);display:block;';
          input.parentNode.appendChild(info);
        }
        info.textContent = hidden.value + ' â€” produto cadastrado';
      } else {
        hidden.value = '';
        var info = input.parentNode.querySelector('.produto-cadastrado-info');
        if (info) info.remove();
      }
    });
    input.addEventListener('change', function () {
      if (!hidden.value) {
        var dt = document.getElementById('listaEstoqueDatalist');
        if (dt) {
          var opts = dt.querySelectorAll('option');
          for (var i = 0; i < opts.length; i++) {
            if (opts[i].value === input.value) {
              hidden.value = opts[i].getAttribute('data-id') || '';
              var unSelect = document.querySelector('[name="Unidade"]');
              if (unSelect) unSelect.value = opts[i].getAttribute('data-un') || 'Kg';
              break;
            }
          }
        }
      }
    });
  }

  var pagina = {
    mudarItensPorPagina: function(el) { if (paginacao) paginacao.mudarPorPagina(el.value); },
    css: '.entradas-busca{margin-bottom:1rem;}.tabela-entradas{width:100%;border-collapse:collapse;}.tabela-entradas th,.tabela-entradas td{text-align:left;padding:0.75rem 1rem;border-bottom:1px solid var(--cor-borda);}.tabela-entradas th{font-weight:600;color:var(--cor-texto-secundario);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.05em;}.form-group{margin-bottom:1rem;}.form-group .form-label{display:block;font-size:0.85rem;font-weight:600;margin-bottom:0.35rem;color:var(--cor-texto-secundario);}.form-group .form-control{width:100%;padding:0.6rem 0.75rem;border:1px solid var(--cor-borda);border-radius:0.5rem;background:var(--cor-superficie);color:var(--cor-texto-primario);font-size:0.9rem;outline:none;box-sizing:border-box;}.form-group .form-control:focus{border-color:var(--cor-primaria);box-shadow:0 0 0 2px rgba(var(--cor-primaria-rgb),0.15);}',

    antesRenderizar: function () {
      document.title = 'Entradas - ' + Cebus.config.nomeSistema;
      Cebus.servicos.debug.logFluxo('Pagina', 'antesRenderizar: Entradas');
      var store = Cebus.registrador.obterStore('entradas');
      var promises = [];
      if (store) promises.push(Cebus.servicos.debug.fluxoAsync('Entradas', store.carregar()));
      var storeForn = Cebus.registrador.obterStore('fornecedores');
      if (storeForn) promises.push(storeForn.carregar());
      var storeEst = Cebus.registrador.obterStore('estoque');
      if (storeEst) promises.push(storeEst.carregar());
      if (promises.length) return Promise.all(promises).then(function () { Cebus.servicos.debug.fimFluxo(); });
      Cebus.servicos.debug.fimFluxo();
    },

    renderar: function () {
      var store = Cebus.registrador.obterStore('entradas');
      var dados = store ? store.obterEstado().lista : [];
      dadosCompletos = dados;

      var storeForn = Cebus.registrador.obterStore('fornecedores');
      listaFornecedores = storeForn ? storeForn.obterEstado().lista : [];

      var storeEst = Cebus.registrador.obterStore('estoque');
      listaEstoque = storeEst ? storeEst.obterEstado().lista : [];

      inicializarHooks();
      paginacao.definirDados(dadosCompletos);
      busca.definirDados(dadosCompletos);

      var conteudo = Cebus.layout.painelAcoes.renderizar({
        titulo: 'Entradas',
        acoes: [
          { acao: 'abrirNovaEntrada', rotulo: 'Registrar Entrada', icone: 'plus' },
          { acao: 'recarregarEntradas', rotulo: 'Atualizar', icone: 'refresh-cw', tipo: 'secundario' },
        ],
      });

      conteudo += '<div class="entradas-busca">' + busca.renderizarCampo('Pesquisar por produto ou fornecedor...') + '</div>';
      conteudo += '<div style="background:var(--cor-superficie);border-radius:0.75rem;border:1px solid var(--cor-borda);overflow-x:auto;">';
      conteudo += '<table class="tabela-entradas"><thead><tr>';
      conteudo += '<th>Código</th><th>Data</th><th>Hora</th><th>Produto</th><th>Categoria</th><th>Quantidade</th><th>Un</th><th>Fornecedor</th><th>Ações</th>';
      conteudo += '</tr></thead><tbody>' + renderizarLinhas() + '</tbody></table></div>';
      conteudo += '<div class="paginacao-container">' + (paginacao ? paginacao.renderizarControles() : '') + '</div>';

      return Cebus.layout.renderizar(conteudo);
    },

    depoisRenderizar: function () {
      document.querySelector('.tabela-entradas').addEventListener('click', function (e) {
        var btn = e.target.closest('.btn-link-produto');
        if (btn) {
          var store = Cebus.registrador.obterStore('entradas');
          var item = store.obterEstado().lista.find(function (f) { return f.id === btn.getAttribute('data-id'); });
          if (item) abrirProdutoModal({ ID_Produto: item.ID_Produto, Produto: item.Produto || item.produto, Unidade: item.Unidade || item.unidade });
          return;
        }
      });
    },

    destruir: function () { fecharProdutoModal(); paginacao = null; busca = null; dadosCompletos = []; },

    buscar: function (el) { busca.definirTermo(el.value); },

    abrirNovaEntrada: function () {
      editandoId = null;
      Cebus.componentes.modal.abrir({
        titulo: 'Registrar Entrada',
        largura: 550,
        conteudo: renderizarProdutoAutocomplete('', '') +
          renderizarSelectCategoria('') +
          renderizarSelectFornecedor('') +
          Cebus.componentes.formulario.renderizar({
            id: 'formEntrada',
            acaoSubmit: 'salvarEntrada',
            campos: [
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
      setTimeout(vincularAutocomplete, 50);
    },

    salvarEntrada: function (form, e) {
      e.preventDefault();
      var dados = {};
      dados.Produto = document.getElementById('inputProdutoAutocomplete')?.value || '';
      dados.ID_Produto = document.getElementById('inputEntradaID_Produto')?.value || '';
      dados.Categoria = document.getElementById('selectCategoria')?.value || '';
      var qtdEl = document.querySelector('[name="Quantidade"]');
      dados.Quantidade = qtdEl ? parseFloat(qtdEl.value) || 0 : 0;
      var unEl = document.querySelector('[name="Unidade"]');
      dados.Unidade = unEl ? unEl.value : 'Kg';
      var fornEl = document.getElementById('selectFornecedor');
      dados.Fornecedor = fornEl ? fornEl.value : '';
      var obsEl = document.querySelector('[name="Observacoes"]');
      dados.Observacoes = obsEl ? obsEl.value : '';

      if (!dados.Produto) { Cebus.notificacoes.erro('Informe o nome do produto'); return; }
      if (!dados.Quantidade || dados.Quantidade <= 0) { Cebus.notificacoes.erro('Quantidade deve ser maior que zero'); return; }

      var store = Cebus.registrador.obterStore('entradas');
      if (editandoId) {
        dados.id = editandoId;
        var itemOriginal = store.obterEstado().lista.find(function (f) { return f.id === editandoId; });
        if (itemOriginal) dados.ID_Entrada = itemOriginal.ID_Entrada;
      }
      if (!dados.ID_Entrada) dados.ID_Entrada = gerarProximoIdEntrada();
      var agora = new Date();
      dados.Data = agora.toISOString().split('T')[0];
      dados.Hora = agora.toTimeString().slice(0, 5);

      store.salvar(dados).then(function () {
        Cebus.componentes.modal.fechar();
        editandoId = null;
        Cebus.notificacoes.sucesso('Entrada registrada!');
        Cebus.roteador.recarregar();
      }).catch(function (err) {
        Cebus.notificacoes.erro('Erro ao salvar entrada');
      });
    },

    editarEntrada: function (el) {
      editandoId = el.getAttribute('data-id');
      var store = Cebus.registrador.obterStore('entradas');
      var item = store.obterEstado().lista.find(function (f) { return f.id === editandoId; });
      if (!item) return;
      var fornecedorValor = item.Fornecedor || item.fornecedorNome || '';

      Cebus.componentes.modal.abrir({
        titulo: 'Editar Entrada',
        largura: 550,
        conteudo: '<p style="font-size:0.85rem;color:var(--cor-texto-secundario);margin-bottom:1rem;">ID: ' + (item.ID_Entrada || '-') + '</p>' +
          renderizarProdutoAutocomplete(item.Produto || item.produto || '', item.ID_Produto || '', true) +
          renderizarSelectCategoria(item.Categoria || '') +
          renderizarSelectFornecedor(fornecedorValor) +
          Cebus.componentes.formulario.renderizar({
            id: 'formEntrada',
            acaoSubmit: 'salvarEntrada',
            campos: [
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
      setTimeout(vincularAutocomplete, 50);
    },

    removerEntrada: function (el) {
      var id = el.getAttribute('data-id');
      Cebus.notificacoes.confirmar('Remover esta entrada?').then(function (ok) {
        if (!ok) return;
        var store = Cebus.registrador.obterStore('entradas');
        store.remover(id).then(function () {
          Cebus.notificacoes.sucesso('Entrada removida!');
          Cebus.roteador.recarregar();
        });
      });
    },

    paginaAnterior: function () { if (paginacao) paginacao.paginaAnterior(); },
    paginaProxima: function () { if (paginacao) paginacao.proximaPagina(); },
    irParaPagina: function (el) { if (paginacao) paginacao.irParaPagina(parseInt(el.getAttribute('data-pagina'), 10)); },

    recarregarEntradas: function () { Cebus.roteador.recarregar(); },
  };

  Cebus.registrador.registrarPagina('/entradas', pagina);
})();



/* ==========================================================================
   ARQUIVO: MovimentacoesPagina.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  var paginacao = null;
  var dadosCompletos = [];
  var filtroTipo = '';
  var dataInicio = '';
  var dataFim = '';
  var produtoModal = null;

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

  function estiloTipo(tipo) {
    if (tipo === 'ENTRADA') return { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', rotulo: 'Entrada' };
    if (tipo === 'SAIDA') return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', rotulo: 'Saida' };
    return { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', rotulo: 'Distribuicao' };
  }

  function aplicarFiltros() {
    var filtrados = dadosCompletos.filter(function (m) {
      if (filtroTipo && m.Tipo !== filtroTipo) return false;
      if (dataInicio && m.Data < dataInicio) return false;
      if (dataFim && m.Data > dataFim) return false;
      return true;
    });
    paginacao.definirDados(filtrados);
    var el = document.querySelector('.tabela-movimentacoes tbody');
    if (el) {
      el.innerHTML = renderizarLinhas();
      var controles = document.querySelector('.paginacao-container');
      if (controles) controles.innerHTML = paginacao.renderizarControles();
      var totalEl = document.querySelector('.movimentacoes-total');
      if (totalEl) totalEl.textContent = filtrados.length + ' registro(s)';
    }
  }

  function inicializarHooks() {
    paginacao = Cebus.util.usePaginacao({
      id: 'movimentacoes',
      porPagina: Cebus.config.itensPorPagina || 20,
      onChange: function () {
        var el = document.querySelector('.tabela-movimentacoes tbody');
        if (el) el.innerHTML = renderizarLinhas();
        var controles = document.querySelector('.paginacao-container');
        if (controles) controles.innerHTML = paginacao.renderizarControles();
      }
    });
  }

  function renderizarLinhas() {
    var paginados = paginacao ? paginacao.obterPaginados() : [];
    if (!paginados.length) {
      return '<tr><td colspan="8" style="text-align:center;padding:3rem;color:var(--cor-texto-secundario);">Nenhuma movimentacao encontrada</td></tr>';
    }
    var html = '';
    paginados.forEach(function (m, i) {
      var estilo = estiloTipo(m.Tipo);
      var bg = i % 2 === 0 ? 'var(--cor-superficie)' : 'var(--cor-superficie-alt, var(--cor-superficie))';
      html += '<tr style="background:' + bg + ';">';
      html += '<td style="font-family:monospace;font-size:0.8rem;">' + (m.ID || m.id || '-') + '</td>';
      html += '<td>' + (m.Data || '-') + '</td>';
      html += '<td>' + (m.Hora || '-') + '</td>';
      html += '<td><span class="badge-tipo" style="display:inline-block;padding:0.15rem 0.6rem;border-radius:999px;font-size:0.75rem;font-weight:600;background:' + estilo.bg + ';color:' + estilo.color + ';">' + estilo.rotulo + '</span></td>';
      html += '<td>' + (m.ID_Produto ? '<button class="btn-link-produto" data-id="' + m.id + '" style="background:none;border:none;color:var(--cor-primaria);cursor:pointer;text-decoration:underline;text-underline-offset:2px;text-decoration-style:dotted;font-family:inherit;font-size:inherit;">' + (m.Produto || '-') + '</button>' : (m.Produto || '-')) + '</td>';
      html += '<td>' + (m.Quantidade ?? '-') + '</td>';
      html += '<td>' + (m.Unidade || '-') + '</td>';
      html += '<td>' + (m.OrigemDestino || '-') + '</td>';
      html += '</tr>';
    });
    return html;
  }

  var pagina = {
    mudarItensPorPagina: function(el) { if (paginacao) paginacao.mudarPorPagina(el.value); },
    css: '.tabela-movimentacoes{width:100%;border-collapse:collapse;}.tabela-movimentacoes th,.tabela-movimentacoes td{text-align:left;padding:0.75rem 1rem;border-bottom:1px solid var(--cor-borda);}.tabela-movimentacoes th{font-weight:600;color:var(--cor-texto-secundario);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.05em;}.filtros-mov{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;}.filtros-mov label{font-size:0.75rem;font-weight:600;color:var(--cor-texto-secundario);display:block;margin-bottom:0.25rem;}.filtros-mov select,.filtros-mov input{width:100%;}',

    antesRenderizar: function () {
      document.title = 'Movimentacoes - ' + Cebus.config.nomeSistema;
      Cebus.servicos.debug.logFluxo('Pagina', 'antesRenderizar: Movimentacoes');
      var store = Cebus.registrador.obterStore('movimentacoes');
      if (store) return Cebus.servicos.debug.fluxoAsync('Movimentacoes', store.carregar());
      filtroTipo = ''; dataInicio = ''; dataFim = '';
      Cebus.servicos.debug.fimFluxo();
    },

    renderar: function () {
      var store = Cebus.registrador.obterStore('movimentacoes');
      dadosCompletos = store ? store.obterEstado().lista : [];

      inicializarHooks();
      var filtrados = dadosCompletos.filter(function (m) {
        if (filtroTipo && m.Tipo !== filtroTipo) return false;
        if (dataInicio && m.Data < dataInicio) return false;
        if (dataFim && m.Data > dataFim) return false;
        return true;
      });
      paginacao.definirDados(filtrados);

      var conteudo = '<div class="painel-acoes" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">';
      conteudo += '<h2 style="margin:0;font-size:1.25rem;font-weight:700;">Movimentacoes</h2>';
      conteudo += '<button class="btn btn-secundario" onclick="Cebus.roteador.recarregar()" style="display:flex;align-items:center;gap:0.5rem;"><i data-lucide="refresh-cw" style="width:16px;height:16px;"></i> Atualizar</button>';
      conteudo += '</div>';

      conteudo += '<div class="filtros-mov neu-card" style="padding:1rem;border-radius:0.75rem;border:1px solid var(--cor-borda);margin-bottom:1rem;">';
      conteudo += '<div><label>Tipo</label><select class="neu-input" id="filtroTipo" style="width:100%;"><option value="">Todos</option><option value="ENTRADA">Entrada</option><option value="SAIDA">Saida</option><option value="DISTRIBUICAO">Distribuicao</option></select></div>';
      conteudo += '<div><label>Data Inicio</label><input type="date" class="neu-input" id="filtroDataInicio" style="width:100%;"></div>';
      conteudo += '<div><label>Data Fim</label><input type="date" class="neu-input" id="filtroDataFim" style="width:100%;"></div>';
      conteudo += '</div>';

      conteudo += '<div style="background:var(--cor-superficie);border-radius:0.75rem;border:1px solid var(--cor-borda);overflow-x:auto;">';
      conteudo += '<table class="tabela-movimentacoes"><thead><tr>';
      conteudo += '<th>ID</th><th>Data</th><th>Hora</th><th>Tipo</th><th>Produto</th><th>Quantidade</th><th>Un</th><th>Origem / Destino</th>';
      conteudo += '</tr></thead><tbody>' + renderizarLinhas() + '</tbody></table></div>';
      conteudo += '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.75rem;font-size:0.85rem;color:var(--cor-texto-secundario);">';
      conteudo += '<span class="movimentacoes-total">' + filtrados.length + ' registro(s)</span>';
      conteudo += '<div class="paginacao-container">' + (paginacao ? paginacao.renderizarControles() : '') + '</div>';
      conteudo += '</div>';

      return Cebus.layout.renderizar(conteudo);
    },

    depoisRenderizar: function () {
      var selTipo = document.getElementById('filtroTipo');
      var inpInicio = document.getElementById('filtroDataInicio');
      var inpFim = document.getElementById('filtroDataFim');
      if (selTipo) { selTipo.value = filtroTipo; selTipo.onchange = function () { filtroTipo = this.value; aplicarFiltros(); }; }
      if (inpInicio) { inpInicio.value = dataInicio; inpInicio.onchange = function () { dataInicio = this.value; aplicarFiltros(); }; }
      if (inpFim) { inpFim.value = dataFim; inpFim.onchange = function () { dataFim = this.value; aplicarFiltros(); }; }

      document.querySelector('.tabela-movimentacoes').addEventListener('click', function (e) {
        var btn = e.target.closest('.btn-link-produto');
        if (btn) {
          var store = Cebus.registrador.obterStore('movimentacoes');
          var item = store.obterEstado().lista.find(function (m) { return m.id === btn.getAttribute('data-id'); });
          if (item) abrirProdutoModal({ ID_Produto: item.ID_Produto, Produto: item.Produto, Unidade: item.Unidade });
        }
      });
      if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
    },

    destruir: function () { fecharProdutoModal(); paginacao = null; dadosCompletos = []; filtroTipo = ''; dataInicio = ''; dataFim = ''; },

    paginaAnterior: function () { if (paginacao) paginacao.paginaAnterior(); },
    paginaProxima: function () { if (paginacao) paginacao.proximaPagina(); },
    irParaPagina: function (el) { if (paginacao) paginacao.irParaPagina(parseInt(el.getAttribute('data-pagina'), 10)); },
  };

  Cebus.registrador.registrarPagina('/movimentacoes', pagina);
})();

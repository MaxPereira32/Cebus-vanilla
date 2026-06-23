/* ==========================================================================
   ARQUIVO: LogsPagina.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  var paginacao = null;
  var busca = null;
  var dadosCompletos = [];

  function inicializarHooks() {
    paginacao = Cebus.util.usePaginacao({
      id: 'logs',
      porPagina: Cebus.config.itensPorPagina || 20,
      onChange: function () {
        var el = document.querySelector('.logs-tabela tbody');
        if (el) {
          el.innerHTML = renderizarLinhas();
          var controles = document.querySelector('.paginacao-container');
          if (controles) controles.innerHTML = paginacao.renderizarControles();
          if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
          }
        }
      }
    });

    busca = Cebus.util.useBusca({
      dados: dadosCompletos,
      campos: ['usuario', 'acao', 'detalhes'],
      onChange: function (filtrados) {
        paginacao.definirDados(filtrados);
        var el = document.querySelector('.logs-tabela tbody');
        if (el) {
          el.innerHTML = renderizarLinhas();
          var controles = document.querySelector('.paginacao-container');
          if (controles) controles.innerHTML = paginacao.renderizarControles();
          if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
          }
        }
      }
    });
  }

  function renderizarLinhas() {
    var paginados = paginacao ? paginacao.obterPaginados() : [];
    var html = '';

    if (!paginados.length) {
      html += '<tr><td colspan="4" style="padding:2rem;text-align:center;color:var(--cor-texto-secundario);">Nenhum log encontrado</td></tr>';
      return html;
    }

    paginados.forEach(function (log) {
      var dataFormatada = Cebus.util.formatarDataHora(log.data);
      var badgeClass = 'badge-' + (log.acao === 'erro' ? 'perigo' : log.acao === 'aviso' ? 'aviso' : 'info');
      html += '<tr style="border-bottom:1px solid var(--cor-borda);">';
      html += '<td style="padding:0.625rem 1rem;color:var(--cor-texto-secundario);">' + dataFormatada + '</td>';
      html += '<td style="padding:0.625rem 1rem;color:var(--cor-texto);">' + (log.usuario || '-') + '</td>';
      html += '<td style="padding:0.625rem 1rem;"><span class="badge ' + badgeClass + '">' + (log.acao || '-') + '</span></td>';
      html += '<td style="padding:0.625rem 1rem;color:var(--cor-texto);max-width:300px;overflow:hidden;text-overflow:ellipsis;">' + (log.detalhes || '-') + '</td>';
      html += '</tr>';
    });

    return html;
  }

  var pagina = {
    mudarItensPorPagina: function(el) { if (paginacao) paginacao.mudarPorPagina(el.value); },
    css: '.logs-busca{margin-bottom:1rem;}.logs-tabela{font-family:monospace;font-size:0.85rem;}.logs-tabela{width:100%;border-collapse:collapse;}.logs-tabela th{text-align:left;padding:0.75rem 1rem;font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--cor-texto-secundario);border-bottom:2px solid var(--cor-borda);}',

    antesRenderizar: function () {
      document.title = 'Logs - ' + Cebus.config.nomeSistema;
      var store = Cebus.registrador.obterStore('logs');
      if (store) return store.carregar();
    },

    renderar: function () {
      var store = Cebus.registrador.obterStore('logs');
      var dados = store ? store.obterEstado().lista : [];
      dadosCompletos = dados;

      inicializarHooks();
      paginacao.definirDados(dadosCompletos);
      busca.definirDados(dadosCompletos);

      var conteudo = Cebus.layout.painelAcoes.renderizar({
        titulo: 'Logs do Sistema',
        acoes: [
          { acao: 'limparLogs', rotulo: 'Limpar Logs', icone: 'trash-2', tipo: 'perigo' },
          { acao: 'recarregarLogs', rotulo: 'Atualizar', icone: 'refresh-cw', tipo: 'secundario' },
        ],
      });

      conteudo += '<div class="logs-busca">' + busca.renderizarCampo('Buscar log...') + '</div>';
      conteudo += '<div style="overflow-x:auto;">';
      conteudo += '<table class="logs-tabela">';
      conteudo += '<thead><tr>';
      conteudo += '<th style="padding:0.75rem 1rem;text-align:left;font-weight:600;color:var(--cor-texto);">Data/Hora</th>';
      conteudo += '<th style="padding:0.75rem 1rem;text-align:left;font-weight:600;color:var(--cor-texto);">Usuário</th>';
      conteudo += '<th style="padding:0.75rem 1rem;text-align:left;font-weight:600;color:var(--cor-texto);">Ação</th>';
      conteudo += '<th style="padding:0.75rem 1rem;text-align:left;font-weight:600;color:var(--cor-texto);">Detalhes</th>';
      conteudo += '</tr></thead><tbody>' + renderizarLinhas() + '</tbody></table></div>';
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

    limparLogs: function () {
      Cebus.notificacoes.confirmar('Limpar todos os logs? Esta operação não pode ser desfeita.').then(function (ok) {
        if (!ok) return;
        var store = Cebus.registrador.obterStore('logs');
        store.limpar().then(function () {
          Cebus.notificacoes.sucesso('Logs limpos com sucesso!');
          Cebus.roteador.recarregar();
        });
      });
    },

    paginaAnterior: function () { if (paginacao) paginacao.paginaAnterior(); },
    paginaProxima: function () { if (paginacao) paginacao.proximaPagina(); },
    irParaPagina: function (el) { if (paginacao) paginacao.irParaPagina(parseInt(el.getAttribute('data-pagina'), 10)); },

    recarregarLogs: function () { Cebus.roteador.recarregar(); },
  };

  Cebus.registrador.registrarPagina('/logs', pagina);
})();

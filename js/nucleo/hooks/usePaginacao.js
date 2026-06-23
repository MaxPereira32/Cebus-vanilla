/* ==========================================================================
   ARQUIVO: usePaginacao.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  'use strict';

  Cebus.util.usePaginacao = function (opcoes) {
    var id = opcoes.id || 'padrao';
    var arm = Cebus.servicos.armazenamento;
    var estadoSalvo = arm.obter('paginacao_' + id, {});

    var porPagina = estadoSalvo.porPagina || opcoes.porPagina || 20;
    var pagina = estadoSalvo.pagina || 1;
    var total = 0;
    var dados = [];
    var onChange = opcoes.onChange || function () {};

    function salvarEstado() {
      arm.salvar('paginacao_' + id, { pagina: pagina, porPagina: porPagina });
    }

    function obterQtdNumerica() {
      if (porPagina === 'Todos') return 999999;
      return parseInt(porPagina, 10);
    }

    function totalPaginas() {
      if (total === 0) return 1;
      return Math.max(1, Math.ceil(total / obterQtdNumerica()));
    }

    function obterRegistrosPagina() {
      var qtd = obterQtdNumerica();
      var inicio = (pagina - 1) * qtd;
      return dados.slice(inicio, inicio + qtd);
    }

    return {
      definirDados: function (lista) {
        dados = lista;
        total = dados.length;
        if (pagina > totalPaginas()) {
          pagina = Math.max(1, totalPaginas());
          salvarEstado();
        }
        onChange();
      },
      mudarPorPagina: function (qtd) {
        porPagina = qtd === 'Todos' ? 'Todos' : parseInt(qtd, 10);
        pagina = 1;
        salvarEstado();
        onChange();
      },
      paginaAtual: function () { return pagina; },
      porPagina: function () { return porPagina; },
      registrosPorPagina: function () { return porPagina; },
      total: function () { return total; },
      totalRegistros: function () { return total; },
      totalPaginas: totalPaginas,
      obterPaginados: obterRegistrosPagina,
      obterRegistrosPagina: obterRegistrosPagina,
      temAnterior: function () { return pagina > 1; },
      temProximo: function () { return pagina < totalPaginas(); },
      irParaPagina: function (p) {
        if (p < 1 || p > totalPaginas() || p === pagina) return;
        pagina = p;
        salvarEstado();
        onChange();
      },
      proximaPagina: function () {
        if (this.temProximo()) { pagina++; salvarEstado(); onChange(); }
      },
      paginaAnterior: function () {
        if (this.temAnterior()) { pagina--; salvarEstado(); onChange(); }
      },
      info: function () {
        if (total === 0) return 'Nenhum registro';
        var qtd = obterQtdNumerica();
        var inicio = ((pagina - 1) * qtd) + 1;
        var fim = Math.min(inicio + qtd - 1, total);
        return 'Mostrando ' + inicio + ' at\u00e9 ' + fim + ' de ' + total + ' registros';
      },
      renderizarControles: function () {
        if (total === 0) return '';
        var tp = totalPaginas();
        
        var selectHtml = '<div style="display:flex;align-items:center;gap:0.5rem;font-size:0.85rem;color:var(--cor-texto-secundario);">';
        selectHtml += '<span>Exibir:</span>';
        selectHtml += '<select class="form-control" style="padding:0.25rem;border-radius:0.25rem;width:auto;cursor:pointer;" data-acao="mudarItensPorPagina">';
        var opcoesQtd = [10, 20, 50, 100, 'Todos'];
        opcoesQtd.forEach(function(o) {
          var selected = (porPagina == o) ? ' selected' : '';
          selectHtml += '<option value="' + o + '"' + selected + '>' + o + '</option>';
        });
        selectHtml += '</select></div>';

        var infoHtml = '<span style="font-size:0.85rem;color:var(--cor-texto-secundario);">' + this.info() + '</span>';

        var navHtml = '<div style="display:flex;align-items:center;gap:0.25rem;">';
        navHtml += '<button class="btn btn-pequeno btn-secundario" data-acao="paginaAnterior"' + (this.temAnterior() ? '' : ' disabled') + '>&laquo; Anterior</button>';
        
        for (var i = 1; i <= tp; i++) {
          if (tp > 7) {
            if (i !== 1 && i !== tp && Math.abs(i - pagina) > 2) {
              if (i === 2 || i === tp - 1) navHtml += '<span style="padding:0 0.25rem;color:var(--cor-texto-secundario);">...</span>';
              continue;
            }
          }
          var ativa = i === pagina ? ' btn-primario' : ' btn-secundario';
          var texto = i === pagina ? '[' + i + ']' : i;
          navHtml += '<button class="btn btn-pequeno' + ativa + '" data-acao="irParaPagina" data-pagina="' + i + '">' + texto + '</button>';
        }
        navHtml += '<button class="btn btn-pequeno btn-secundario" data-acao="paginaProxima"' + (this.temProximo() ? '' : ' disabled') + '>Pr\u00f3xima &raquo;</button>';
        navHtml += '</div>';

        return '<div class="paginacao" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;padding:1rem 0;border-top:1px solid var(--cor-borda);margin-top:1rem;">' +
               selectHtml + infoHtml + navHtml + '</div>';
      }
    };
  };

  console.log('[Cebus] Hook usePaginacao carregado');
})();

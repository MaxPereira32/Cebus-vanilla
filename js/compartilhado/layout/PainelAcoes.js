/* ==========================================================================
   ARQUIVO: PainelAcoes.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  Cebus.layout = Cebus.layout || {};

  Cebus.layout.painelAcoes = {
    renderizar: function (config) {
      var html = '<div class="painel-acoes" style="display:flex;align-items:center;justify-content:flex-end;margin-bottom:1.5rem;flex-wrap:wrap;gap:0.75rem;">';


      html += '<div style="display:flex;gap:0.5rem;flex-wrap:wrap;">';

      (config.acoes || []).forEach(function (acao) {
        var icone = acao.icone ? '<i data-lucide="' + acao.icone + '" size="16" style="margin-right:0.375rem;"></i>' : '';
        html += '<button class="btn btn-' + (acao.tipo || 'primario') + '" data-acao="' + acao.acao + '">' + icone + (acao.rotulo || acao.acao) + '</button>';
      });

      html += '</div></div>';
      return html;
    },
  };
})();

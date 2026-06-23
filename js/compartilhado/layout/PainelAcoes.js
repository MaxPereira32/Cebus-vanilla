(function () {
  Cebus.layout = Cebus.layout || {};

  Cebus.layout.painelAcoes = {
    renderizar: function (config) {
      var html = '<div class="painel-acoes" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:0.75rem;">';

      if (config.titulo) {
        html += '<h2 style="margin:0;font-size:1.5rem;font-weight:700;color:var(--cor-texto);">' + config.titulo + '</h2>';
      }

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

(function () {
  Cebus.widgets = Cebus.widgets || {};

  Cebus.widgets.cartaoResumo = {
    renderizar: function (config) {
      var icone = config.icone || 'file-text';
      var cor = config.cor || 'var(--cor-primaria)';
      var variacao = config.variacao || '';

      return '<div class="cartao-resumo" style="background:var(--cor-superficie);border-radius:0.75rem;padding:1.25rem;display:flex;align-items:center;gap:1rem;border:1px solid var(--cor-borda);transition:transform 0.2s,box-shadow 0.2s;" onmouseover="this.style.boxShadow=\'0 4px 12px rgba(0,0,0,0.1)\';this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.boxShadow=\'none\';this.style.transform=\'none\'">' +
        '<div class="cartao-icone" style="width:3rem;height:3rem;border-radius:0.75rem;background:' + cor + '20;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
          '<i data-lucide="' + icone + '" size="24" style="color:' + cor + ';"></i>' +
        '</div>' +
        '<div class="cartao-info" style="flex:1;min-width:0;">' +
          '<p class="cartao-valor" style="margin:0;font-size:1.5rem;font-weight:700;color:var(--cor-texto);">' + (config.valor || '-') + '</p>' +
          '<p class="cartao-rotulo" style="margin:0.125rem 0 0;font-size:0.8rem;color:var(--cor-texto-secundario);">' + (config.rotulo || '') + '</p>' +
        '</div>' +
        (variacao ? '<div class="cartao-variacao" style="font-size:0.8rem;font-weight:600;color:' + (variacao.startsWith('-') ? 'var(--cor-perigo)' : 'var(--cor-sucesso)') + ';">' + variacao + '</div>' : '') +
      '</div>';
    },
  };
})();

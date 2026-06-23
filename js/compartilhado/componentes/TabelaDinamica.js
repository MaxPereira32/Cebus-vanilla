(function () {
  Cebus.componentes = Cebus.componentes || {};

  Cebus.componentes.tabelaDinamica = {
    renderizar: function (config) {
      var colunas = config.colunas || [];
      var dados = config.dados || [];
      var acoes = config.acoes || [];
      var vazia = config.mensagemVazia || 'Nenhum registro encontrado';

      var html = '<div class="tabela-dinamica-container" style="overflow-x:auto;">';
      html += '<table class="tabela-dinamica" style="width:100%;border-collapse:collapse;">';
      html += '<thead><tr>';
      colunas.forEach(function (col) {
        html += '<th style="text-align:left;padding:0.75rem 1rem;font-weight:600;color:var(--cor-texto);border-bottom:2px solid var(--cor-borda);white-space:nowrap;">' + (col.rotulo || col.chave) + '</th>';
      });
      if (acoes.length) {
        html += '<th style="text-align:right;padding:0.75rem 1rem;font-weight:600;color:var(--cor-texto);border-bottom:2px solid var(--cor-borda);white-space:nowrap;">Ações</th>';
      }
      html += '</tr></thead><tbody>';

      if (!dados.length) {
        html += '<tr><td colspan="' + (colunas.length + (acoes.length ? 1 : 0)) + '" style="text-align:center;padding:2rem;color:var(--cor-texto-secundario);">' + vazia + '</td></tr>';
      } else {
        dados.forEach(function (item, idx) {
          html += '<tr style="border-bottom:1px solid var(--cor-borda);transition:background 0.15s;" onmouseover="this.style.background=\'var(--cor-hover)\'" onmouseout="this.style.background=\'transparent\'" data-indice="' + idx + '">';
          colunas.forEach(function (col) {
            var valor = item[col.chave];
            if (col.formatar) valor = col.formatar(valor, item);
            else if (valor === null || valor === undefined) valor = '-';
            html += '<td style="padding:0.75rem 1rem;color:var(--cor-texto);">' + valor + '</td>';
          });
          if (acoes.length) {
            html += '<td style="padding:0.75rem 1rem;text-align:right;white-space:nowrap;">';
            acoes.forEach(function (acao) {
              var classes = 'btn btn-pequeno btn-' + (acao.tipo || 'primario');
              var attrs = 'data-acao="' + acao.acao + '" data-id="' + (item.id || item._id || idx) + '"';
              html += '<button class="' + classes + '" ' + attrs + ' style="margin-left:0.5rem;">' + (acao.rotulo || acao.acao) + '</button>';
            });
            html += '</td>';
          }
          html += '</tr>';
        });
      }

      html += '</tbody></table></div>';
      return html;
    },
  };
})();

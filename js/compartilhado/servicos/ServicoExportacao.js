/* ==========================================================================
   ARQUIVO: ServicoExportacao.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  Cebus.servicos = Cebus.servicos || {};

  Cebus.servicos.exportacao = {
    exportarCSV: function (dados, nomeArquivo) {
      if (!dados || !dados.length) return;
      var cabecalhos = Object.keys(dados[0]);
      var linhas = dados.map(function (item) {
        return cabecalhos.map(function (chave) {
          var val = item[chave];
          if (val === null || val === undefined) return '';
          var str = String(val).replace(/"/g, '""');
          return str.indexOf(',') >= 0 || str.indexOf('"') >= 0 || str.indexOf('\n') >= 0
            ? '"' + str + '"'
            : str;
        }).join(',');
      });
      var csv = cabecalhos.join(',') + '\n' + linhas.join('\n');
      var bom = '\uFEFF';
      var blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
      this._baixar(blob, nomeArquivo || 'exportacao.csv');
    },

    exportarJSON: function (dados, nomeArquivo) {
      var json = JSON.stringify(dados, null, 2);
      var blob = new Blob([json], { type: 'application/json' });
      this._baixar(blob, nomeArquivo || 'exportacao.json');
    },

    _baixar: function (blob, nomeArquivo) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = nomeArquivo;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  };
})();

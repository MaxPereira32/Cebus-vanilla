/* ==========================================================================
   ARQUIVO: ServicoBackup.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  Cebus.servicos = Cebus.servicos || {};

  Cebus.servicos.backup = {
    exportarCompleto: function () {
      var dados = {};
      Object.keys(Cebus.estado).forEach(function (chave) {
        var store = Cebus.estado[chave];
        if (store && typeof store.obterEstado === 'function') {
          dados[chave] = store.obterEstado();
        }
      });
      dados._metadata = {
        versao: Cebus.config.versao,
        data: new Date().toISOString(),
        sistema: Cebus.config.nomeSistema,
      };
      Cebus.servicos.exportacao.exportarJSON(dados, 'backup-cebus-' + new Date().toISOString().split('T')[0] + '.json');
    },

    importar: function (arquivoJSON) {
      return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function (e) {
          try {
            var dados = JSON.parse(e.target.result);
            Object.keys(dados).forEach(function (chave) {
              if (chave === '_metadata') return;
              var store = Cebus.estado[chave];
              if (store && typeof store.definirEstado === 'function') {
                store.definirEstado(dados[chave]);
              }
            });
            resolve(dados._metadata || {});
          } catch (err) { reject(err); }
        };
        reader.onerror = reject;
        reader.readAsText(arquivoJSON);
      });
    },
  };
})();

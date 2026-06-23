/* ==========================================================================
   ARQUIVO: ServicoArmazenamento.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  Cebus.servicos = Cebus.servicos || {};

  Cebus.servicos.armazenamento = {
    salvar: function (chave, valor) {
      try {
        localStorage.setItem('cebus_' + chave, JSON.stringify(valor));
      } catch (e) { console.warn('[Storage] Erro ao salvar:', chave, e); }
    },
    obter: function (chave, padrao) {
      try {
        var val = localStorage.getItem('cebus_' + chave);
        return val ? JSON.parse(val) : (padrao !== undefined ? padrao : null);
      } catch (e) { return padrao !== undefined ? padrao : null; }
    },
    remover: function (chave) {
      localStorage.removeItem('cebus_' + chave);
    },
    limpar: function () {
      Object.keys(localStorage).forEach(function (k) {
        if (k.startsWith('cebus_')) localStorage.removeItem(k);
      });
    },
  };

  Cebus.util.salvarCache = function (chave, valor) {
    return Cebus.servicos.armazenamento.salvar(chave, valor);
  };
  Cebus.util.obterCache = function (chave, padrao) {
    return Cebus.servicos.armazenamento.obter(chave, padrao);
  };
})();

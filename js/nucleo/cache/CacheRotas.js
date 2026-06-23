/* ==========================================================================
   ARQUIVO: CacheRotas.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  Cebus.cache = Cebus.cache || {};

  var cache = {};

  Cebus.cache.rotas = {
    obter: function (chave) { return cache[chave] || null; },
    salvar: function (chave, valor) { cache[chave] = valor; },
    remover: function (chave) { delete cache[chave]; },
    limpar: function () { cache = {}; },
  };
})();

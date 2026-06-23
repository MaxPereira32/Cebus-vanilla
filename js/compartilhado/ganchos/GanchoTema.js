/* ==========================================================================
   ARQUIVO: GanchoTema.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  Cebus.ganchos = Cebus.ganchos || {};

  Cebus.ganchos.tema = {
    alternar: function () {
      return Cebus.servicos.tema.alternar();
    },

    obterAtual: function () {
      return Cebus.servicos.tema.obterAtual();
    },
  };
})();

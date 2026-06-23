/* ==========================================================================
   ARQUIVO: ids.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  Cebus.util = Cebus.util || {};

  Cebus.util.gerarId = function () {
    var timestamp = Date.now().toString(36);
    var aleatorio = Math.random().toString(36).substring(2, 8);
    return timestamp + aleatorio;
  };

  Cebus.util.gerarIdCurto = function () {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Gera um ID alfanumérico com prefixo de 2 letras do módulo.
  // Exemplo: gerarIdComPrefixo('FR') → 'FR-A7B3X9K2'
  // O prefixo identifica a página de origem (FR=Fornecedores, PR=Produtos, EN=Entradas, etc.)
  Cebus.util.gerarIdComPrefixo = function (prefixo) {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var resultado = '';
    for (var i = 0; i < 8; i++) {
      resultado += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return (prefixo || 'XX') + '-' + resultado;
  };
})();

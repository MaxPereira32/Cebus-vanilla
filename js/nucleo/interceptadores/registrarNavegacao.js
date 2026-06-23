/* ==========================================================================
   ARQUIVO: registrarNavegacao.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  Cebus.interceptadores = Cebus.interceptadores || {};

  Cebus.interceptadores.registrarNavegacao = function (caminho) {
    if (caminho === '/login') return;
    var log = {
      rota: caminho,
      data: new Date().toISOString(),
    };
    var historico = Cebus.util.obterCache('historico_rotas') || [];
    historico.push(log);
    if (historico.length > 50) historico.shift();
    Cebus.util.salvarCache('historico_rotas', historico);
  };
})();

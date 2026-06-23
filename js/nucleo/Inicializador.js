/* ==========================================================================
   ARQUIVO: Inicializador.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  'use strict';

  Cebus.registrador = {
    paginas: {},
    stores: {},
    repositorios: {},
    servicos: {},
    modulos: {},

    registrarPagina: function (rota, pagina) {
      this.paginas[rota] = pagina;
    },
    registrarStore: function (nome, store) {
      this.stores[nome] = store;
      Cebus.estado = Cebus.estado || {};
      Cebus.estado[nome] = store;
    },
    registrarModulo: function (nome, config) {
      this.modulos[nome] = config;
      if (config.store) this.registrarStore(nome, config.store);
      if (config.pagina) this.registrarPagina('/' + nome, config.pagina);
    },
    obterPagina: function (rota) { return this.paginas[rota] || null; },
    obterStore: function (nome) { return this.stores[nome] || null; },
  };

  Cebus.util = Cebus.util || {};

  console.log('[Cebus] Inicializador carregado');
})();

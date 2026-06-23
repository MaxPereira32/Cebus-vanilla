/* ==========================================================================
   ARQUIVO: FabricaEstado.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  'use strict';

  Cebus.util.criarStore = function (opcoes) {
    var estado = opcoes.estadoInicial || {};
    var listeners = [];
    var metodos = {};

    var store = {
      obterEstado: function () { return estado; },
      definirEstado: function (parcial) {
        if (typeof parcial === 'function') {
          estado = Object.assign({}, estado, parcial(estado));
        } else {
          estado = Object.assign({}, estado, parcial);
        }
        listeners.forEach(function (fn) { fn(estado); });
        return estado;
      },
      inscrever: function (fn) {
        listeners.push(fn);
        return function () {
          var idx = listeners.indexOf(fn);
          if (idx >= 0) listeners.splice(idx, 1);
        };
      },
      limparInscricoes: function () { listeners = []; },
    };

    if (opcoes.metodos && typeof opcoes.metodos === 'function') {
      metodos = opcoes.metodos(store, store.definirEstado) || {};
    }

    return Object.assign(store, metodos);
  };

  console.log('[Cebus] FabricaEstado carregada');
})();

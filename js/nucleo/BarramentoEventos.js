(function () {
  'use strict';

  var eventos = {};
  var Ctx = Cebus;

  Ctx.barramento = {
    emitir: function (nome, dados) {
      if (!eventos[nome]) return;
      eventos[nome].forEach(function (fn) {
        try { fn(dados); } catch (e) { console.error('[EventBus] Erro em:', nome, e); }
      });
    },
    on: function (nome, fn) {
      if (!eventos[nome]) eventos[nome] = [];
      eventos[nome].push(fn);
      return function () {
        var idx = eventos[nome].indexOf(fn);
        if (idx >= 0) eventos[nome].splice(idx, 1);
      };
    },
    off: function (nome, fn) {
      if (!eventos[nome]) return;
      var idx = eventos[nome].indexOf(fn);
      if (idx >= 0) eventos[nome].splice(idx, 1);
    },
    limpar: function (nome) {
      if (nome) { delete eventos[nome]; }
      else { eventos = {}; }
    }
  };

  console.log('[Cebus] BarramentoEventos carregado');
})();

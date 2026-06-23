/* ==========================================================================
   ARQUIVO: CacheEstilos.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  Cebus.cache = Cebus.cache || {};

  var estilosCache = {};

  Cebus.cache.estilos = {
    obter: function (chave) { return estilosCache[chave] || null; },
    salvar: function (chave, css) { estilosCache[chave] = css; },
    aplicar: function (chave, css) {
      if (estilosCache[chave]) return;
      this.salvar(chave, css);
      var style = document.createElement('style');
      style.id = 'cebus-estilo-' + chave;
      style.textContent = css;
      document.head.appendChild(style);
    },
  };
})();

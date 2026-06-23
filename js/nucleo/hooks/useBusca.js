(function () {
  'use strict';

  Cebus.util.useBusca = function (opcoes) {
    var termo = '';
    var dadosOriginais = opcoes.dados || [];
    var campos = opcoes.campos || [];
    var onChange = opcoes.onChange || function () {};
    var debounceMs = opcoes.debounceMs || 300;
    var timerId = null;

    function filtrar() {
      if (!termo.trim()) return dadosOriginais.slice();
      var t = termo.trim().toLowerCase();
      return dadosOriginais.filter(function (item) {
        for (var i = 0; i < campos.length; i++) {
          var valor = item[campos[i]];
          if (valor && String(valor).toLowerCase().indexOf(t) >= 0) return true;
        }
        return false;
      });
    }

    function notificar() {
      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(function () {
        onChange(filtrar());
      }, debounceMs);
    }

    return {
      definirDados: function (dados) {
        dadosOriginais = dados;
        notificar();
      },
      definirTermo: function (valor) {
        termo = valor;
        notificar();
      },
      obterTermo: function () { return termo; },
      filtrar: filtrar,
      renderizarCampo: function (placeholder) {
        return '<div class="campo-busca" style="position:relative;max-width:320px;">' +
          '<i data-lucide="search" size="16" style="position:absolute;left:0.75rem;top:50%;transform:translateY(-50%);color:var(--cor-texto-secundario);pointer-events:none;"></i>' +
          '<input type="text" class="input input-busca" data-acao="buscar" placeholder="' + (placeholder || 'Buscar...') + '" style="padding-left:2.25rem;" value="' + termo + '">' +
          '</div>';
      }
    };
  };

  console.log('[Cebus] Hook useBusca carregado');
})();

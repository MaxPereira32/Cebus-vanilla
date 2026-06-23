/* ==========================================================================
   ARQUIVO: mascaras.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  Cebus.util = Cebus.util || {};

  Cebus.util.mascaraCNPJ = function (valor) {
    var v = valor.replace(/\D/g, '').slice(0, 14);
    if (v.length <= 2) return v;
    if (v.length <= 5) return v.replace(/^(\d{2})(\d{0,3})/, '$1.$2');
    if (v.length <= 8) return v.replace(/^(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
    if (v.length <= 12) return v.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
    return v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5');
  };

  Cebus.util.mascaraTelefone = function (valor) {
    var v = valor.replace(/\D/g, '').slice(0, 11);
    if (v.length === 0) return '';
    if (v.length <= 2) return '(' + v;
    if (v.length <= 6) return v.replace(/^(\d{2})(\d{0,4})/, '($1) $2');
    if (v.length <= 10) return v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    return v.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  };

  Cebus.util.mascaraMoeda = function (valor) {
    var v = parseFloat(valor) || 0;
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  Cebus.util.mascaraNumero = function (valor) {
    return valor.toLocaleString('pt-BR');
  };

  Cebus.util.mascaraData = function (valor) {
    var v = valor.replace(/\D/g, '').slice(0, 8);
    if (v.length <= 2) return v;
    if (v.length <= 4) return v.replace(/^(\d{2})(\d{0,2})/, '$1/$2');
    return v.replace(/^(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
  };

  Cebus.util.somenteNumeros = function (valor) {
    return valor.replace(/\D/g, '');
  };

  Cebus.util.aplicarMascara = function (input, tipo) {
    if (!input) return;
    if (input.dataset.mascaraPronta) return;

    var tipoNormalizado = tipo;
    if (tipo && typeof tipo === 'string') {
      var lower = tipo.toLowerCase();
      if (lower === 'cnpj') tipoNormalizado = 'CNPJ';
      else if (lower === 'telefone') tipoNormalizado = 'Telefone';
      else if (lower === 'moeda') tipoNormalizado = 'Moeda';
      else if (lower === 'numero') tipoNormalizado = 'Numero';
      else if (lower === 'data') tipoNormalizado = 'Data';
    }

    var fn = this['mascara' + tipoNormalizado];
    if (fn) {
      input.dataset.mascaraPronta = '1';

      if (input.value) {
        input.value = fn(input.value);
      }

      if (typeof fn('a') === 'string' && fn('a') === '') {
        input.addEventListener('keydown', function (e) {
          if (e.key.length === 1 && /\D/.test(e.key) && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
          }
        });
      }

      input.addEventListener('input', function () {
        var cursor = input.selectionStart;
        var valor = input.value;
        input.value = fn(valor);
        var diff = input.value.length - valor.length;
        input.setSelectionRange(cursor + diff, cursor + diff);
      });
    }
  };

  function iniciarObservadorMascaras() {
    if (typeof MutationObserver === 'undefined') return;
    var observer = new MutationObserver(function (mutacoes) {
      mutacoes.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          if (node.matches && node.matches('[data-mascara]')) {
            Cebus.util.aplicarMascara(node, node.getAttribute('data-mascara'));
          }
          if (node.querySelectorAll) {
            node.querySelectorAll('[data-mascara]').forEach(function (el) {
              Cebus.util.aplicarMascara(el, el.getAttribute('data-mascara'));
            });
          }
        });
      });
    });
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        observer.observe(document.body, { childList: true, subtree: true });
      });
    }
  }
  if (typeof window !== 'undefined') iniciarObservadorMascaras();
})();

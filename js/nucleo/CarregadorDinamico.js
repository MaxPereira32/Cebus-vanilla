/* ==========================================================================
   ARQUIVO: CarregadorDinamico.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  'use strict';

  var cacheScripts = {};
  var cacheEstilos = {};
  var filaCarregamento = [];
  var carregando = false;

  function carregarScript(caminho) {
    return new Promise(function (resolve, reject) {
      if (cacheScripts[caminho]) {
        resolve();
        return;
      }

      var script = document.createElement('script');
      script.src = caminho + '?v=1.1.7';
      script.onload = function () {
        cacheScripts[caminho] = true;
        resolve();
      };
      script.onerror = function () {
        reject(new Error('Falha ao carregar: ' + caminho));
      };
      document.head.appendChild(script);
    });
  }

  function carregarCSS(caminho) {
    if (cacheEstilos[caminho]) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = caminho;
    document.head.appendChild(link);
    cacheEstilos[caminho] = true;
  }

  var CarregadorDinamico = {
    carregarScript: carregarScript,

    carregarScripts: function (caminhos) {
      var self = this;
      return new Promise(function (resolve, reject) {
        var pendentes = caminhos.filter(function (c) { return !cacheScripts[c]; });
        if (!pendentes.length) { resolve(); return; }

        var indice = 0;
        function proximo() {
          if (indice >= pendentes.length) { resolve(); return; }
          self.carregarScript(pendentes[indice]).then(function () {
            indice++;
            proximo();
          }).catch(reject);
        }
        proximo();
      });
    },

    carregarCSS: carregarCSS,

    carregarModulo: function (caminhoBase) {
      var self = this;
      return this.carregarScript(caminhoBase + 'Store.js').then(function () {
        return self.carregarScript(caminhoBase + 'Pagina.js');
      });
    },

    registrarCache: function (caminho) {
      cacheScripts[caminho] = true;
    },

    jaCarregado: function (caminho) {
      return !!cacheScripts[caminho];
    },

    limparCache: function () {
      cacheScripts = {};
      cacheEstilos = {};
    }
  };

  Cebus.carregador = CarregadorDinamico;
  console.log('[Cebus] CarregadorDinamico carregado');
})();

/* ==========================================================================
   ARQUIVO: GerenciadorPaginas.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  'use strict';

  var paginaAtual = null;
  var nomePaginaAtual = null;
  var timersAtivos = [];
  var intervalsAtivos = [];
  var listenersAtivos = [];

  var GerenciadorPaginas = {
    renderizar: function (caminho, params, pagina) {
      if (!pagina) return null;

      this.destruirAtual();

      nomePaginaAtual = caminho;
      paginaAtual = pagina;

      try {
        var resultadoAntes = null;
        if (typeof pagina.antesRenderizar === 'function') {
          resultadoAntes = pagina.antesRenderizar(params);
        }

        var html = typeof pagina.renderar === 'function' ? pagina.renderar(params) : '';

        this._injetarCSS(caminho, pagina);

        if (typeof pagina.depoisRenderizar === 'function') {
          pagina.depoisRenderizar(params);
        }

        return html;
      } catch (e) {
        this.destruirAtual();
        throw e;
      }
    },

    renderizarAsync: function (caminho, params, pagina, root) {
      if (!pagina) return;
      var self = this;
      this.destruirAtual();
      nomePaginaAtual = caminho;
      paginaAtual = pagina;

      try {
        var promise = null;
        if (typeof pagina.antesRenderizar === 'function') {
          promise = pagina.antesRenderizar(params);
        }

        if (promise && typeof promise.then === 'function') {
          root.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;"><div class="spinner"></div></div>';
          promise.then(function () {
            self._executarRender(caminho, params, pagina, root);
          }).catch(function (e) {
            console.error('[Gerenciador] Erro em antesRenderizar:', e);
            self._executarRender(caminho, params, pagina, root);
          });
        } else {
          self._executarRender(caminho, params, pagina, root);
        }
      } catch (e) {
        this.destruirAtual();
        if (root) root.innerHTML = '<div class="flex items-center justify-center p-6"><p>Erro ao carregar p\u00e1gina</p></div>';
      }
    },

    _executarRender: function (caminho, params, pagina, root) {
      try {
        this._injetarCSS(caminho, pagina);
        var html = typeof pagina.renderar === 'function' ? pagina.renderar(params) : '';
        if (html !== null) {
          root.innerHTML = html;
          if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
          }
        }
        if (typeof pagina.depoisRenderizar === 'function') {
          pagina.depoisRenderizar(params);
        }
      } catch (e) {
        console.error('[Gerenciador] Erro ao renderizar:', caminho, e);
        root.innerHTML = '<div class="flex items-center justify-center p-6"><p>Erro ao carregar p\u00e1gina</p></div>';
      }
    },

    destruirAtual: function () {
      if (paginaAtual) {
        if (typeof paginaAtual.destruir === 'function') {
          try { paginaAtual.destruir(); } catch (e) { console.warn('[Gerenciador] Erro ao destruir pagina:', e); }
        }
      }

      timersAtivos.forEach(function (id) { clearTimeout(id); });
      intervalsAtivos.forEach(function (id) { clearInterval(id); });
      timersAtivos = [];
      intervalsAtivos = [];

      listenersAtivos.forEach(function (remover) {
        try { remover(); } catch (e) { /* ignore */ }
      });
      listenersAtivos = [];

      paginaAtual = null;
      nomePaginaAtual = null;
    },

    _injetarCSS: function (caminho, pagina) {
      if (!pagina || !pagina.css) return;
      var chave = 'cebus-estilo-' + caminho.replace(/\//g, '-');
      if (document.getElementById(chave)) return;
      var style = document.createElement('style');
      style.id = chave;
      style.textContent = pagina.css;
      document.head.appendChild(style);
    },

    adicionarTimer: function (id) {
      if (typeof id === 'number') timersAtivos.push(id);
    },

    adicionarIntervalo: function (id) {
      if (typeof id === 'number') intervalsAtivos.push(id);
    },

    adicionarListener: function (removerFn) {
      if (typeof removerFn === 'function') listenersAtivos.push(removerFn);
    },

    obterAtual: function () { return paginaAtual; },
    obterNomeAtual: function () { return nomePaginaAtual; }
  };

  Cebus.gerenciadorPaginas = GerenciadorPaginas;
  console.log('[Cebus] GerenciadorPaginas carregado');
})();

/* ==========================================================================
   ARQUIVO: Roteador.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  'use strict';

  var cachePaginas = {};
  var rotaAtual = null;
  var carregando = false;

  function _carregarModulo(caminho) {
    var modulos = Cebus.config.modulos;
    var mapeamento = modulos.mapeamento[caminho];
    if (!mapeamento) return Promise.reject('Modulo nao encontrado: ' + caminho);

    var base = modulos.caminhoBase;
    var scripts = [];

    if (mapeamento.deps) {
      mapeamento.deps.forEach(function (dep) {
        scripts.push(base + dep + '.js');
      });
    }

    if (mapeamento.store) scripts.push(base + mapeamento.store + '.js');
    if (mapeamento.pagina) scripts.push(base + mapeamento.pagina + '.js');

    return Cebus.carregador.carregarScripts(scripts);
  }

  var Roteador = {
    iniciar: function () {
      window.addEventListener('hashchange', this.resolver.bind(this));
      this.resolver();
      console.log('[Cebus] Roteador iniciado');
    },

    navegar: function (caminho) {
      window.location.hash = '#' + caminho;
    },

    recarregar: function () {
      rotaAtual = null;
      this.resolver();
    },

    resolver: function () {
      var hash = window.location.hash.slice(1) || '/login';
      var partes = hash.split('?');
      var caminho = partes[0];
      var params = {};
      if (partes[1]) {
        partes[1].split('&').forEach(function (p) {
          var kv = p.split('=');
          params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
        });
      }

      if (caminho === rotaAtual && cachePaginas[caminho]) {
        return;
      }

      rotaAtual = caminho;
      this._resolverComCarregamento(caminho, params);
    },

    _executarInterceptadores: function (caminho) {
      if (Cebus.interceptadores) {
        if (Cebus.interceptadores.verificarAutenticacao && !Cebus.interceptadores.verificarAutenticacao(caminho)) return false;
        if (Cebus.interceptadores.verificarPermissao && !Cebus.interceptadores.verificarPermissao(caminho)) return false;
        if (Cebus.interceptadores.registrarNavegacao) Cebus.interceptadores.registrarNavegacao(caminho);
      }
      return true;
    },

    _resolverComCarregamento: function (caminho, params) {
      var root = document.getElementById('root');
      if (!root) return;

      var self = this;
      var pagina = Cebus.registrador.obterPagina(caminho);

      if (pagina) {
        if (!self._executarInterceptadores(caminho)) return;
        self._executarRenderizacao(caminho, params, pagina, root);
        return;
      }

      if (carregando) {
        setTimeout(function () { self._resolverComCarregamento(caminho, params); }, 100);
        return;
      }

      carregando = true;
      root.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;"><div class="spinner"></div></div>';

      _carregarModulo(caminho).then(function () {
        carregando = false;
        if (!self._executarInterceptadores(caminho)) return;
        var p = Cebus.registrador.obterPagina(caminho);
        if (p) {
          cachePaginas[caminho] = p;
          self._executarRenderizacao(caminho, params, p, root);
        } else {
          root.innerHTML = '<div class="flex items-center justify-center p-6"><p>Erro ao carregar m\u00f3dulo</p></div>';
        }
      }).catch(function (err) {
        carregando = false;
        console.error('[Cebus] Erro ao carregar modulo:', caminho, err);
        var fallback = Cebus.registrador.obterPagina('/login');
        if (fallback) {
          self._executarRenderizacao('/login', {}, fallback, root);
        } else {
          root.innerHTML = '<div class="flex items-center justify-center p-6"><p>Erro ao carregar p\u00e1gina</p></div>';
        }
      });
    },

    _executarRenderizacao: function (caminho, params, pagina, root) {
      if (typeof Cebus.servicos.log !== 'undefined') {
        Cebus.servicos.log.info('Navegacao: ' + caminho, { params: params });
      }
      Cebus.gerenciadorPaginas.renderizarAsync(caminho, params, pagina, root);
    },

    obterPaginaAtual: function () {
      return Cebus.gerenciadorPaginas.obterAtual();
    },

    obterRotaAtual: function () { return rotaAtual; },
    limparCache: function () { cachePaginas = {}; }
  };

  Cebus.roteador = Roteador;

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-acao]');
    if (!el) return;
    if (el.tagName === 'FORM') return;

    var acao = el.getAttribute('data-acao');

    switch (acao) {
      case 'navegar': {
        var rota = el.getAttribute('data-rota');
        if (rota) Cebus.roteador.navegar(rota);
        return;
      }
      case 'sair':
      case 'logout': {
        var auth = Cebus.registrador.obterStore('autenticacao');
        if (auth && auth.logout) auth.logout();
        Cebus.roteador.navegar('/login');
        return;
      }
      case 'alternarTema': {
        Cebus.servicos.tema.alternar();
        return;
      }
      case 'alternarMenu': {
        var bl = document.querySelector('.barra-lateral');
        if (bl) bl.classList.toggle('aberta');
        return;
      }
      case 'cancelarFormulario': {
        Cebus.componentes.modal ? Cebus.componentes.modal.fechar() : Cebus.componentes.modalBase.fechar();
        return;
      }
      case 'voltar':
      case 'cancelar': {
        window.history.back();
        return;
      }
    }

    var pagina = Cebus.gerenciadorPaginas.obterAtual();
    if (pagina && typeof pagina[acao] === 'function') {
      pagina[acao](el, e);
    }
  });

  document.addEventListener('submit', function (e) {
    var form = e.target.closest('[data-acao]');
    if (!form) return;
    var acao = form.getAttribute('data-acao');
    var pagina = Cebus.gerenciadorPaginas.obterAtual();
    if (pagina && typeof pagina[acao] === 'function') {
      pagina[acao](form, e);
    }
  });

  document.addEventListener('change', function (e) {
    var el = e.target.closest('[data-acao]');
    if (!el) return;
    if (el.tagName === 'FORM') return;
    var acao = el.getAttribute('data-acao');
    var pagina = Cebus.gerenciadorPaginas.obterAtual();
    if (pagina && typeof pagina[acao] === 'function') {
      pagina[acao](el, e);
    }
  });

  document.addEventListener('input', function (e) {
    var el = e.target.closest('[data-acao]');
    if (!el) return;
    if (el.tagName === 'FORM') return;
    var acao = el.getAttribute('data-acao');
    var pagina = Cebus.gerenciadorPaginas.obterAtual();
    if (pagina && typeof pagina[acao] === 'function') {
      pagina[acao](el, e);
    }
  });

  console.log('[Cebus] Roteador carregado');
})();

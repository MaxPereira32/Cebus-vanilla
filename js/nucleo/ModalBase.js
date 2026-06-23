/* ==========================================================================
   ARQUIVO: ModalBase.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  'use strict';

  var overlayAtual = null;
  var callbacksAbertos = {};

  function ModalBase() {}

  ModalBase.prototype.abrir = function (config) {
    this.fechar();
    callbacksAbertos = {};

    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9000;padding:1rem;animation:fadeIn 0.2s ease;';

    var modal = document.createElement('div');
    modal.className = 'modal-conteudo';
    modal.style.cssText = 'background:var(--cor-superficie);border-radius:1rem;max-width:' + (config.largura || 600) + 'px;width:100%;max-height:85vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.2);';

    var headerHtml = '';
    if (config.titulo) {
      headerHtml = '<div class="modal-header" style="display:flex;align-items:center;justify-content:space-between;padding:1rem 1.5rem;border-bottom:1px solid var(--cor-borda);background:var(--cor-superficie);position:sticky;top:0;z-index:1;">' +
        '<h3 style="margin:0;color:var(--cor-texto);font-size:1.1rem;">' + config.titulo + '</h3>' +
        '<button class="btn-icone" data-acao="fecharModal" style="background:none;border:none;cursor:pointer;color:var(--cor-texto-secundario);padding:0.25rem;border-radius:0.375rem;display:flex;align-items:center;justify-content:center;width:32px;height:32px;" onmouseover="this.style.background=\'var(--cor-hover)\'" onmouseout="this.style.background=\'none\'"><i data-lucide="x" size="20"></i></button>' +
        '</div>';
    }

    var footerHtml = '';
    if (config.rodape) {
      footerHtml = '<div class="modal-rodape" style="padding:1rem 1.5rem;border-top:1px solid var(--cor-borda);display:flex;gap:0.75rem;justify-content:flex-end;">' + config.rodape + '</div>';
    }

    modal.innerHTML = headerHtml +
      '<div class="modal-corpo" style="padding:1.5rem;">' + (config.conteudo || '') + '</div>' +
      footerHtml;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    overlayAtual = overlay;

    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      setTimeout(function () {
        lucide.createIcons({ attrs: { class: ['lucide-icon'] }, nodes: [modal] });
      }, 0);
    }

    var fecharBtn = modal.querySelector('[data-acao="fecharModal"]');
    if (fecharBtn) {
      var self = this;
      fecharBtn.addEventListener('click', function () { self.fechar(); });
    }
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay && config.clicarFora !== false) {
        self.fechar();
      }
    });

    this._registrarCallbacks(config);

    if (config.aoAbrir) config.aoAbrir(modal);

    modal.querySelectorAll('[data-mascara]').forEach(function (el) {
      if (typeof Cebus.util.aplicarMascara === 'function') {
        Cebus.util.aplicarMascara(el, el.getAttribute('data-mascara'));
      }
    });
  };

  ModalBase.prototype._registrarCallbacks = function (config) {
    if (config.aoConfirmar) callbacksAbertos.confirmar = config.aoConfirmar;
    if (config.aoCancelar) callbacksAbertos.cancelar = config.aoCancelar;
  };

  ModalBase.prototype.fechar = function () {
    if (overlayAtual) {
      if (overlayAtual.parentNode) overlayAtual.parentNode.removeChild(overlayAtual);
      overlayAtual = null;
      callbacksAbertos = {};
    }
  };

  ModalBase.prototype.definirConteudo = function (html) {
    if (!overlayAtual) return;
    var corpo = overlayAtual.querySelector('.modal-corpo');
    if (corpo) corpo.innerHTML = html;
  };

  ModalBase.prototype.definirCarregando = function (ativo) {
    if (!overlayAtual) return;
    var corpo = overlayAtual.querySelector('.modal-corpo');
    if (corpo) {
      corpo.innerHTML = ativo
        ? '<div style="display:flex;align-items:center;justify-content:center;padding:3rem;"><div class="spinner"></div></div>'
        : corpo.innerHTML;
    }
  };

  Cebus.componentes = Cebus.componentes || {};
  Cebus.componentes.modalBase = new ModalBase();
  console.log('[Cebus] ModalBase carregado');
})();

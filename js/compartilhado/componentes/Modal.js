/* ==========================================================================
   ARQUIVO: Modal.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  Cebus.componentes = Cebus.componentes || {};

  var overlayAtual = null;

  Cebus.componentes.modal = {
    abrir: function (config) {
      this.fechar();

      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9000;padding:1rem;';

      var modal = document.createElement('div');
      modal.className = 'modal-conteudo';
      modal.style.cssText = 'background:var(--cor-superficie);border-radius:1rem;max-width:' + (config.largura || 600) + 'px;width:100%;max-height:85vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.2);animation:fadeIn 0.2s ease;';

      modal.innerHTML = '<div class="modal-header" style="display:flex;align-items:center;justify-content:space-between;padding:1rem 1.5rem;border-bottom:1px solid var(--cor-borda);"><h3 style="margin:0;color:var(--cor-texto);font-size:1.1rem;">' + (config.titulo || '') + '</h3><button class="btn-icone" data-acao="fecharModal" style="background:none;border:none;cursor:pointer;color:var(--cor-texto-secundario);padding:0.25rem;"><i data-lucide="x" size="20"></i></button></div><div class="modal-corpo" style="padding:1.5rem;">' + (config.conteudo || '') + '</div>';

      if (config.rodape) {
        var footer = document.createElement('div');
        footer.className = 'modal-rodape';
        footer.style.cssText = 'padding:1rem 1.5rem;border-top:1px solid var(--cor-borda);display:flex;gap:0.75rem;justify-content:flex-end;';
        footer.innerHTML = config.rodape;
        modal.appendChild(footer);
      }

      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      overlayAtual = overlay;

      if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons({ attrs: { class: ['lucide-icon'] }, nodes: [modal] });
      }

      var fecharBtn = modal.querySelector('[data-acao="fecharModal"]');
      if (fecharBtn) fecharBtn.onclick = this.fechar.bind(this);
      overlay.onclick = function (e) {
        if (e.target === overlay && config.clicarFora !== false) {
          fechar();
        }
      };

      var self = this;
      function fechar() { self.fechar(); }

      if (config.aoAbrir) config.aoAbrir(modal);

      modal.querySelectorAll('[data-mascara]').forEach(function (el) {
        if (typeof Cebus.util.aplicarMascara === 'function') {
          Cebus.util.aplicarMascara(el, el.getAttribute('data-mascara'));
        }
      });
    },

    fechar: function () {
      if (overlayAtual) {
        if (overlayAtual.parentNode) overlayAtual.parentNode.removeChild(overlayAtual);
        overlayAtual = null;
      }
    },

    definirConteudo: function (html) {
      if (!overlayAtual) return;
      var corpo = overlayAtual.querySelector('.modal-corpo');
      if (corpo) corpo.innerHTML = html;
    },
  };
})();

/* ==========================================================================
   ARQUIVO: Confirmacao.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  Cebus.notificacoes = Cebus.notificacoes || {};

  Cebus.notificacoes.confirmar = function (mensagem, titulo) {
    titulo = titulo || 'Confirmar';
    return new Promise(function (resolve) {
      var overlay = document.createElement('div');
      overlay.className = 'confirmacao-overlay';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10000;';

      var modal = document.createElement('div');
      modal.className = 'confirmacao-modal';
      modal.style.cssText = 'background:var(--cor-superficie);border-radius:1rem;padding:1.5rem;max-width:400px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,0.2);';

      modal.innerHTML = '<h3 style="margin:0 0 0.75rem;color:var(--cor-texto);font-size:1.1rem;">' + titulo + '</h3><p style="margin:0 0 1.5rem;color:var(--cor-texto-secundario);">' + mensagem + '</p><div style="display:flex;gap:0.75rem;justify-content:flex-end;"><button class="btn btn-secundario" data-confirmacao="cancelar">Cancelar</button><button class="btn btn-primario" data-confirmacao="confirmar">Confirmar</button></div>';

      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      function fechar(resultado) {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        resolve(resultado);
      }

      modal.querySelector('[data-confirmacao="confirmar"]').onclick = function () { fechar(true); };
      modal.querySelector('[data-confirmacao="cancelar"]').onclick = function () { fechar(false); };
      overlay.onclick = function (e) { if (e.target === overlay) fechar(false); };
    });
  };
})();

/* ==========================================================================
   ARQUIVO: Notificacao.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  Cebus.notificacoes = Cebus.notificacoes || {};

  function criarContainer() {
    var container = document.getElementById('cebus-notificacoes');
    if (!container) {
      container = document.createElement('div');
      container.id = 'cebus-notificacoes';
      container.className = 'notificacoes-container';
      document.body.appendChild(container);

      var style = document.createElement('style');
      style.textContent = '.notificacoes-container{position:fixed;top:1rem;right:1rem;z-index:9999;display:flex;flex-direction:column;gap:0.5rem;max-width:400px;}.notificacao-item{padding:0.75rem 1rem;border-radius:0.5rem;display:flex;align-items:center;gap:0.75rem;box-shadow:0 4px 12px rgba(0,0,0,0.15);animation:slideIn 0.3s ease;transition:opacity 0.3s,transform 0.3s;cursor:pointer;}.notificacao-item.removendo{opacity:0;transform:translateX(100%);}.notificacao-item.sucesso{background:var(--cor-sucesso);color:#fff;}.notificacao-item.erro{background:var(--cor-perigo);color:#fff;}.notificacao-item.aviso{background:var(--cor-aviso);color:#fff;}.notificacao-item.info{background:var(--cor-info);color:#fff;}@keyframes slideIn{from{opacity:0;transform:translateX(100%);}to{opacity:1;transform:translateX(0);}}';
      document.head.appendChild(style);
    }
    return container;
  }

  Cebus.notificacoes.mostrar = function (mensagem, tipo) {
    tipo = tipo || 'info';
    var container = criarContainer();
    var item = document.createElement('div');
    item.className = 'notificacao-item ' + tipo;

    var icones = { sucesso: 'check-circle', erro: 'x-circle', aviso: 'alert-triangle', info: 'info' };
    var icone = icones[tipo] || 'info';

    item.innerHTML = '<i data-lucide="' + icone + '" size="18"></i><span>' + mensagem + '</span>';
    container.appendChild(item);

    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons({ attrs: { class: ['lucide-icon'] }, nodes: [item] });
    }

    item.addEventListener('click', function () {
      item.classList.add('removendo');
      setTimeout(function () { if (item.parentNode) item.parentNode.removeChild(item); }, 300);
    });

    setTimeout(function () {
      if (item.parentNode) {
        item.classList.add('removendo');
        setTimeout(function () { if (item.parentNode) item.parentNode.removeChild(item); }, 300);
      }
    }, 4000);
  };

  Cebus.notificacoes.sucesso = function (msg) { this.mostrar(msg, 'sucesso'); };
  Cebus.notificacoes.erro = function (msg) { this.mostrar(msg, 'erro'); };
  Cebus.notificacoes.aviso = function (msg) { this.mostrar(msg, 'aviso'); };
  Cebus.notificacoes.info = function (msg) { this.mostrar(msg, 'info'); };
})();

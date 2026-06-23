/* ==========================================================================
   ARQUIVO: BarraLateral.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  Cebus.layout = Cebus.layout || {};

  var itensMenu = [
    { rotulo: 'Dashboard', icone: 'layout-dashboard', rota: '/painel' },
    { rotulo: 'Fornecedores', icone: 'truck', rota: '/fornecedores' },
    { rotulo: 'Equipes', icone: 'users', rota: '/equipes' },
    { separador: true },
    { rotulo: 'Entradas', icone: 'arrow-down-to-line', rota: '/entradas' },
    { rotulo: 'Estoque', icone: 'package', rota: '/estoque' },
    { rotulo: 'Saídas', icone: 'arrow-up-from-line', rota: '/saidas' },
    { rotulo: 'Distribuição', icone: 'truck', rota: '/distribuicao' },
    { separador: true },
    { rotulo: 'Movimentações', icone: 'rotate-cw', rota: '/movimentacoes' },
    { rotulo: 'Consultas', icone: 'search', rota: '/consultas' },
    { rotulo: 'Relatórios', icone: 'bar-chart-3', rota: '/relatorios' },
    { separador: true },
    { rotulo: 'Usuários', icone: 'shield', rota: '/usuarios' },
    { rotulo: 'Logs', icone: 'scroll-text', rota: '/logs' },
    { rotulo: 'Configurações', icone: 'settings', rota: '/configuracoes' },
  ];

  Cebus.layout.barraLateral = {
    renderizar: function () {
      var rotaAtual = (window.location.hash || '#/').slice(1) || '/painel';

      var html = '<aside class="barra-lateral" style="width:250px;background:var(--cor-superficie);border-right:1px solid var(--cor-borda);display:flex;flex-direction:column;overflow-y:auto;flex-shrink:0;">';
      html += '<nav style="padding:0.75rem;flex:1;">';
      html += '<ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:0.125rem;">';

      itensMenu.forEach(function (item) {
        if (item.separador) {
          html += '<li style="height:1px;background:var(--cor-borda);margin:0.375rem 0.5rem;"></li>';
          return;
        }
        var ativo = rotaAtual === item.rota ? 'ativo' : '';
        html += '<li>';
        html += '<a href="#' + item.rota + '" class="nav-link ' + ativo + '">';
        html += '<i data-lucide="' + item.icone + '" size="18"></i>';
        html += '<span>' + item.rotulo + '</span>';
        html += '</a></li>';
      });

      html += '</ul></nav>';

      html += '<div style="padding:0.75rem;border-top:1px solid var(--cor-borda);">';
      html += '<button onclick="alternarBarraLateral()" class="nav-link toggle-sidebar">';
      html += '<i data-lucide="chevrons-left" size="18" id="iconeToggleSidebar"></i>';
      html += '<span class="texto-menu-lateral">Recolher Menu</span>';
      html += '</button></div>';

      html += '</aside>';
      
      html += `
        <style>
          .barra-lateral { transition: width 0.3s ease; }
          .barra-lateral.retraida { width: 72px !important; }
          .barra-lateral.retraida .texto-menu-lateral, 
          .barra-lateral.retraida nav span { display: none !important; }
          .barra-lateral.retraida nav a { justify-content: center; padding-left: 0; padding-right: 0; }
          .barra-lateral.retraida #iconeToggleSidebar { transform: rotate(180deg); }
          .nav-link {
            display:flex;align-items:center;gap:0.75rem;padding:0.625rem 0.75rem;border-radius:0.5rem;
            text-decoration:none;font-size:0.875rem;font-weight:500;
            color:var(--cor-texto);background:transparent;border:none;cursor:pointer;
            width:100%;transition:all 0.15s;
          }
          .nav-link:hover { background:var(--cor-hover); }
          .nav-link.ativo { background:var(--cor-primaria);color:#fff; }
          .nav-link.ativo:hover { background:var(--cor-primaria);color:#fff; }
        </style>
      `;

      if (window.localStorage && window.localStorage.getItem('sidebar_retraida') === 'sim') {
        html = html.replace('class="barra-lateral"', 'class="barra-lateral retraida"');
        // Usar setTimeout para garantir que o body exista e não travar o carregamento HTML
        setTimeout(() => document.body.classList.add('sidebar-retraida'), 0);
      }

      return html;
    },
  };

  // Função global para lidar com o click (pois o HTML é injetado via innerHTML)
  window.alternarBarraLateral = function () {
    var aside = document.querySelector('.barra-lateral');
    if (aside) {
      aside.classList.toggle('retraida');
      var recolhida = aside.classList.contains('retraida');
      
      // Toggla a classe no body para o conteudo-principal reagir
      document.body.classList.toggle('sidebar-retraida', recolhida);

      if (window.localStorage) {
        window.localStorage.setItem('sidebar_retraida', recolhida ? 'sim' : 'nao');
      }
    }
  };
})();

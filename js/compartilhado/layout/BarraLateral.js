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
        var ativo = rotaAtual === item.rota ? 'background:var(--cor-primaria);color:#fff;' : 'color:var(--cor-texto);';
        html += '<li>';
        html += '<a href="#' + item.rota + '" style="display:flex;align-items:center;gap:0.75rem;padding:0.625rem 0.75rem;border-radius:0.5rem;text-decoration:none;font-size:0.875rem;font-weight:500;transition:all 0.15s;' + ativo + '" onmouseover="this.style.background=\'var(--cor-hover)\'" onmouseout="this.style.background=\'transparent\'">';
        html += '<i data-lucide="' + item.icone + '" size="18"></i>';
        html += '<span>' + item.rotulo + '</span>';
        html += '</a></li>';
      });

      html += '</ul></nav></aside>';
      return html;
    },
  };
})();

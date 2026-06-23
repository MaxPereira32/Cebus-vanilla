/* ==========================================================================
   ARQUIVO: configRotas.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

Cebus.config = Cebus.config || {};
Cebus.config.rotas = Cebus.config.rotas || [];
Cebus.config.rotas.push(
  { caminho: '/login',         rotulo: 'Login',         icone: 'log-in',               auth: false },
  { caminho: '/painel',        rotulo: 'Painel',        icone: 'layout-dashboard',      auth: true },
  { caminho: '/produtos',      rotulo: 'Produtos',      icone: 'package',               auth: true },
  { caminho: '/fornecedores',  rotulo: 'Fornecedores',  icone: 'truck',                 auth: true },
  { caminho: '/equipes',       rotulo: 'Equipes',       icone: 'users',                 auth: true },
  { caminho: '/entradas',      rotulo: 'Entradas',      icone: 'arrow-down-to-line',    auth: true },
  { caminho: '/estoque',       rotulo: 'Estoque',       icone: 'warehouse',             auth: true },
  { caminho: '/saidas',        rotulo: 'Saídas',        icone: 'arrow-up-from-line',    auth: true },
  { caminho: '/distribuicao',  rotulo: 'Distribuição',  icone: 'truck',                 auth: true },
  { caminho: '/movimentacoes', rotulo: 'Movimentações', icone: 'arrow-left-right',      auth: true },
  { caminho: '/consultas',     rotulo: 'Consultas',     icone: 'search',                auth: true },
  { caminho: '/relatorios',    rotulo: 'Relatórios',    icone: 'file-text',             auth: true },
  { caminho: '/usuarios',      rotulo: 'Usuários',      icone: 'user-cog',              auth: true },
  { caminho: '/logs',          rotulo: 'Logs',          icone: 'scroll-text',           auth: true },
  { caminho: '/configuracoes', rotulo: 'Configurações', icone: 'settings',              auth: true }
);

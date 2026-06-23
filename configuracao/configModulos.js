/* ==========================================================================
   ARQUIVO: configModulos.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

Cebus.config = Cebus.config || {};
Cebus.config.modulos = {
  caminhoBase: 'js/modulos/',
  mapeamento: {
    '/login':          { store: 'autenticacao/AutenticacaoStore',         pagina: 'autenticacao/AutenticacaoPagina' },
    '/painel':         { store: 'painel/PainelStore',                     pagina: 'painel/PainelPagina' },
    '/fornecedores':   { deps: ['fornecedores/FornecedorValidator', 'fornecedores/FornecedorHelper', 'fornecedores/FornecedorService'], store: 'fornecedores/FornecedoresStore', pagina: 'fornecedores/FornecedoresPagina' },
    '/equipes':        { store: 'equipes/EquipesStore',                   pagina: 'equipes/EquipesPagina' },
    '/entradas':       { deps: ['estoque/EstoqueStore', 'fornecedores/FornecedorValidator', 'fornecedores/FornecedorHelper', 'fornecedores/FornecedorService', 'fornecedores/FornecedoresStore'], store: 'entradas/EntradasStore',                 pagina: 'entradas/EntradasPagina' },
    '/estoque':        { store: 'estoque/EstoqueStore',                   pagina: 'estoque/EstoquePagina' },
    '/saidas':         { deps: ['estoque/EstoqueStore'], store: 'saidas/SaidasStore',                     pagina: 'saidas/SaidasPagina' },
    '/distribuicao':   { store: 'distribuicao/DistribuicaoStore',         pagina: 'distribuicao/DistribuicaoPagina' },
    '/movimentacoes':  { store: 'movimentacoes/MovimentacoesStore',       pagina: 'movimentacoes/MovimentacoesPagina' },
    '/consultas':      { store: 'consultas/ConsultasStore',               pagina: 'consultas/ConsultasPagina' },
    '/relatorios':     { store: 'relatorios/RelatoriosStore',             pagina: 'relatorios/RelatoriosPagina' },
    '/usuarios':       { store: 'usuarios/UsuariosStore',                 pagina: 'usuarios/UsuariosPagina' },
    '/logs':           { store: 'logs/LogsStore',                         pagina: 'logs/LogsPagina' },
    '/configuracoes':  { store: 'configuracoes/ConfiguracoesStore',       pagina: 'configuracoes/ConfiguracoesPagina' },
  }
};

/* ==========================================================================
   ARQUIVO: UsuariosPagina.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  var paginacao = null;
  var busca = null;
  var dadosCompletos = [];
  var editandoId = null;

  function inicializarHooks() {
    paginacao = Cebus.util.usePaginacao({
      id: 'usuarios',
      porPagina: Cebus.config.itensPorPagina || 20,
      onChange: function () {
        var el = document.querySelector('.tabela-usuarios tbody');
        if (el) {
          el.innerHTML = renderizarLinhas();
          var controles = document.querySelector('.paginacao-container');
          if (controles) controles.innerHTML = paginacao.renderizarControles();
          if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
          }
        }
      }
    });

    busca = Cebus.util.useBusca({
      dados: dadosCompletos,
      campos: ['nome', 'email', 'nivel'],
      onChange: function (filtrados) {
        paginacao.definirDados(filtrados);
        var el = document.querySelector('.tabela-usuarios tbody');
        if (el) {
          el.innerHTML = renderizarLinhas();
          var controles = document.querySelector('.paginacao-container');
          if (controles) controles.innerHTML = paginacao.renderizarControles();
          if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
          }
        }
      }
    });
  }

  function renderizarLinhas() {
    var paginados = paginacao ? paginacao.obterPaginados() : [];
    var html = '';

    if (!paginados.length) {
      html += '<tr><td colspan="5" style="text-align:center;padding:3rem;color:var(--cor-texto-secundario);">Nenhum usuário encontrado</td></tr>';
      return html;
    }

    paginados.forEach(function (u) {
      var badgeNivel = u.nivel === 'admin' ? 'badge-perigo' : u.nivel === 'gerente' ? 'badge-atencao' : u.nivel === 'operador' ? 'badge-info' : 'badge-padrao';
      var badgeSituacao = u.situacao === 'ativo' ? 'badge-sucesso' : 'badge-perigo';
      html += '<tr>';
      html += '<td><strong>' + (u.nome || '-') + '</strong></td>';
      html += '<td style="color:var(--cor-texto-secundario);">' + (u.email || '-') + '</td>';
      html += '<td><span class="badge ' + badgeNivel + '">' + (u.nivel || '-') + '</span></td>';
      html += '<td><span class="badge ' + badgeSituacao + '">' + (u.situacao || '-') + '</span></td>';
      html += '<td>';
      html += '<button class="btn btn-pequeno btn-primario" data-acao="editarUsuario" data-id="' + u.id + '" style="margin-right:0.25rem;">Editar</button>';
      html += '<button class="btn btn-pequeno btn-perigo" data-acao="removerUsuario" data-id="' + u.id + '">Remover</button>';
      html += '</td></tr>';
    });

    return html;
  }

  var pagina = {
    mudarItensPorPagina: function(el) { if (paginacao) paginacao.mudarPorPagina(el.value); },
    css: '.usuarios-busca{margin-bottom:1rem;}.tabela-usuarios{width:100%;border-collapse:collapse;}.tabela-usuarios th{text-align:left;padding:0.75rem 1rem;font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--cor-texto-secundario);border-bottom:2px solid var(--cor-borda);}.tabela-usuarios td{padding:0.75rem 1rem;border-bottom:1px solid var(--cor-borda);font-size:0.875rem;color:var(--cor-texto);}',

    antesRenderizar: function () {
      document.title = 'Usuários - ' + Cebus.config.nomeSistema;
      var store = Cebus.registrador.obterStore('usuarios');
      if (store) return store.carregar();
    },

    renderar: function () {
      var store = Cebus.registrador.obterStore('usuarios');
      var dados = store ? store.obterEstado().lista : [];
      dadosCompletos = dados;

      inicializarHooks();
      paginacao.definirDados(dadosCompletos);
      busca.definirDados(dadosCompletos);

      var conteudo = Cebus.layout.painelAcoes.renderizar({
        titulo: 'Usuários',
        acoes: [
          { acao: 'abrirNovoUsuario', rotulo: 'Novo Usuário', icone: 'plus' },
          { acao: 'recarregarUsuarios', rotulo: 'Atualizar', icone: 'refresh-cw', tipo: 'secundario' },
        ],
      });

      conteudo += '<div class="usuarios-busca">' + busca.renderizarCampo('Buscar usuário...') + '</div>';
      conteudo += '<div style="background:var(--cor-superficie);border-radius:0.75rem;border:1px solid var(--cor-borda);overflow-x:auto;">';
      conteudo += '<table class="tabela-usuarios">';
      conteudo += '<thead><tr>';
      conteudo += '<th>Nome</th><th>E-mail</th><th>Nível</th><th>Situação</th><th>Ações</th>';
      conteudo += '</tr></thead><tbody>' + renderizarLinhas() + '</tbody></table></div>';
      conteudo += '<div class="paginacao-container">' + (paginacao ? paginacao.renderizarControles() : '') + '</div>';

      return Cebus.layout.renderizar(conteudo);
    },

    destruir: function () {
      paginacao = null;
      busca = null;
      dadosCompletos = [];
    },

    buscar: function (el) {
      busca.definirTermo(el.value);
    },

    abrirNovoUsuario: function () {
      Cebus.componentes.modal.abrir({
        titulo: 'Novo Usuário',
        largura: 500,
        conteudo: Cebus.componentes.formulario.renderizar({
          id: 'formUsuario',
          acaoSubmit: 'salvarUsuario',
          campos: [
            { nome: 'nome', rotulo: 'Nome', tipo: 'text', obrigatorio: true, placeholder: 'Nome completo' },
            { nome: 'email', rotulo: 'E-mail', tipo: 'email', obrigatorio: true, placeholder: 'email@exemplo.com' },
            { nome: 'senha', rotulo: 'Senha', tipo: 'password', placeholder: 'Mínimo 6 caracteres' },
            { nome: 'nivel', rotulo: 'Nível de Acesso', tipo: 'select', valor: 'operador', opcoes: [
              { valor: 'admin', rotulo: 'Administrador' },
              { valor: 'gerente', rotulo: 'Gerente' },
              { valor: 'operador', rotulo: 'Operador' },
              { valor: 'consulta', rotulo: 'Consulta' },
            ]},
            { nome: 'situacao', rotulo: 'Situação', tipo: 'select', valor: 'ativo', opcoes: [
              { valor: 'ativo', rotulo: 'Ativo' },
              { valor: 'inativo', rotulo: 'Inativo' },
            ]},
          ],
        }),
        rodape: '',
      });
    },

    salvarUsuario: function (form, e) {
      e.preventDefault();
      var dados = Cebus.componentes.formulario.extrairDados('formUsuario');
      if (editandoId) {
        dados.id = editandoId;
        if (!dados.senha) delete dados.senha;
      }
      var store = Cebus.registrador.obterStore('usuarios');
      store.salvar(dados).then(function () {
        editandoId = null;
        Cebus.componentes.modal.fechar();
        Cebus.notificacoes.sucesso('Usuário salvo com sucesso!');
        Cebus.roteador.recarregar();
      }).catch(function (err) {
        Cebus.notificacoes.erro('Erro ao salvar usuário');
      });
    },

    editarUsuario: function (el) {
      var id = el.getAttribute('data-id');
      editandoId = id;
      var store = Cebus.registrador.obterStore('usuarios');
      var dados = store.obterEstado().lista;
      var item = dados.find(function (u) { return u.id === id; });
      if (!item) { editandoId = null; return; }

      Cebus.componentes.modal.abrir({
        titulo: 'Editar Usuário',
        largura: 500,
        conteudo: Cebus.componentes.formulario.renderizar({
          id: 'formUsuario',
          acaoSubmit: 'salvarUsuario',
          campos: [
            { nome: 'nome', rotulo: 'Nome', tipo: 'text', obrigatorio: true, valor: item.nome || '' },
            { nome: 'email', rotulo: 'E-mail', tipo: 'email', obrigatorio: true, valor: item.email || '' },
            { nome: 'senha', rotulo: 'Nova Senha', tipo: 'password', placeholder: 'Deixe em branco para manter' },
            { nome: 'nivel', rotulo: 'Nível de Acesso', tipo: 'select', valor: item.nivel || 'operador', opcoes: [
              { valor: 'admin', rotulo: 'Administrador' },
              { valor: 'gerente', rotulo: 'Gerente' },
              { valor: 'operador', rotulo: 'Operador' },
              { valor: 'consulta', rotulo: 'Consulta' },
            ]},
            { nome: 'situacao', rotulo: 'Situação', tipo: 'select', valor: item.situacao || 'ativo', opcoes: [
              { valor: 'ativo', rotulo: 'Ativo' },
              { valor: 'inativo', rotulo: 'Inativo' },
            ]},
          ],
        }),
        rodape: '',
      });
    },

    removerUsuario: function (el) {
      var id = el.getAttribute('data-id');
      Cebus.notificacoes.confirmar('Remover este usuário?').then(function (ok) {
        if (!ok) return;
        var store = Cebus.registrador.obterStore('usuarios');
        store.remover(id).then(function () {
          Cebus.notificacoes.sucesso('Usuário removido!');
          Cebus.roteador.recarregar();
        }).catch(function (err) {
          Cebus.notificacoes.erro('Erro ao remover usuário');
        });
      });
    },

    paginaAnterior: function () { if (paginacao) paginacao.paginaAnterior(); },
    paginaProxima: function () { if (paginacao) paginacao.proximaPagina(); },
    irParaPagina: function (el) { if (paginacao) paginacao.irParaPagina(parseInt(el.getAttribute('data-pagina'), 10)); },

    recarregarUsuarios: function () {
      Cebus.roteador.recarregar();
    },
  };

  Cebus.registrador.registrarPagina('/usuarios', pagina);
})();

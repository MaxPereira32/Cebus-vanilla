/* ==========================================================================
   ARQUIVO: EquipesPagina.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  var busca = null;
  var dadosFiltrados = [];

  function renderizarCards(lista) {
    var html = '<div class="equipes-grid">';
    if (!lista.length) {
      html += '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--cor-texto-secundario);">Nenhuma equipe encontrada</div>';
    } else {
      lista.forEach(function (e) {
        var membrosCount = (e.membros && e.membros.length) ? e.membros.length : 0;
        html += '<div class="cartao-item" style="background:var(--cor-superficie);border-radius:0.75rem;padding:1.25rem;border:1px solid var(--cor-borda);">';
        html += '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:0.75rem;">';
        html += '<div><h3 style="margin:0;font-size:1rem;font-weight:600;color:var(--cor-texto);">' + (e.nome || '-') + '</h3>';
        html += '<span style="font-size:0.75rem;color:var(--cor-texto-secundario);">' + membrosCount + ' membro(s)</span></div>';
        html += '<span class="badge badge-' + (e.situacao || 'ativo') + '">' + (e.situacao || 'ativo') + '</span>';
        html += '</div>';
        if (e.descricao) {
          html += '<p style="margin:0 0 0.5rem;font-size:0.85rem;color:var(--cor-texto-secundario);line-height:1.4;">' + e.descricao + '</p>';
        }
        html += '<div style="margin-top:1rem;display:flex;gap:0.5rem;">';
        html += '<button class="btn btn-pequeno btn-primario" data-acao="editarEquipe" data-id="' + e.id + '">Editar</button>';
        html += '<button class="btn btn-pequeno btn-perigo" data-acao="removerEquipe" data-id="' + e.id + '">Remover</button>';
        html += '</div></div>';
      });
    }
    html += '</div>';
    return html;
  }

  var pagina = {
    mudarItensPorPagina: function(el) { if (paginacao) paginacao.mudarPorPagina(el.value); },
    css: '.equipes-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1rem;}.equipes-busca{margin-bottom:1rem;}',

    antesRenderizar: function () {
      document.title = 'Equipes - ' + Cebus.config.nomeSistema;
      var store = Cebus.registrador.obterStore('equipes');
      if (store) return store.carregar();
    },

    renderar: function () {
      var store = Cebus.registrador.obterStore('equipes');
      var dados = store ? store.obterEstado().lista : [];
      dadosFiltrados = dados;

      busca = Cebus.util.useBusca({
        dados: dados,
        campos: ['nome', 'descricao', 'situacao'],
        onChange: function (filtrados) {
          dadosFiltrados = filtrados;
          var grid = document.querySelector('.equipes-grid');
          if (grid) {
            var pai = grid.parentNode;
            var novo = document.createElement('div');
            novo.innerHTML = renderizarCards(filtrados);
            pai.replaceChild(novo.firstElementChild, grid);
          }
        }
      });

      var conteudo = Cebus.layout.painelAcoes.renderizar({
        titulo: 'Equipes',
        acoes: [
          { acao: 'abrirNovaEquipe', rotulo: 'Nova Equipe', icone: 'plus' },
          { acao: 'recarregarEquipes', rotulo: 'Atualizar', icone: 'refresh-cw', tipo: 'secundario' },
        ],
      });

      conteudo += '<div class="equipes-busca">' + busca.renderizarCampo('Buscar equipe...') + '</div>';
      conteudo += renderizarCards(dados);

      return Cebus.layout.renderizar(conteudo);
    },

    destruir: function () { busca = null; dadosFiltrados = []; },

    buscar: function (el) { busca.definirTermo(el.value); },

    abrirNovaEquipe: function () {
      Cebus.componentes.modal.abrir({
        titulo: 'Nova Equipe',
        largura: 500,
        conteudo: Cebus.componentes.formulario.renderizar({
          id: 'formEquipe',
          acaoSubmit: 'salvarEquipe',
          campos: [
            { nome: 'nome', rotulo: 'Nome', tipo: 'text', obrigatorio: true, placeholder: 'Nome da equipe' },
            { nome: 'descricao', rotulo: 'Descrição', tipo: 'textarea', placeholder: 'Descrição da equipe' },
            { nome: 'situacao', rotulo: 'Situação', tipo: 'select', valor: 'ativo', opcoes: [{ valor: 'ativo', rotulo: 'Ativo' }, { valor: 'inativo', rotulo: 'Inativo' }] },
          ],
        }),
        rodape: '',
      });
    },

    salvarEquipe: function (form, e) {
      e.preventDefault();
      var dados = Cebus.componentes.formulario.extrairDados('formEquipe');
      var store = Cebus.registrador.obterStore('equipes');
      store.salvar(dados).then(function () {
        Cebus.componentes.modal.fechar();
        Cebus.notificacoes.sucesso('Equipe salva com sucesso!');
        Cebus.roteador.recarregar();
      });
    },

    editarEquipe: function (el) {
      var id = el.getAttribute('data-id');
      var store = Cebus.registrador.obterStore('equipes');
      var dados = store.obterEstado().lista;
      var item = dados.find(function (e) { return e.id === id; });
      if (!item) return;

      Cebus.componentes.modal.abrir({
        titulo: 'Editar Equipe',
        largura: 500,
        conteudo: Cebus.componentes.formulario.renderizar({
          id: 'formEquipe',
          acaoSubmit: 'salvarEquipe',
          campos: [
            { nome: 'nome', rotulo: 'Nome', tipo: 'text', obrigatorio: true, valor: item.nome || '' },
            { nome: 'descricao', rotulo: 'Descrição', tipo: 'textarea', valor: item.descricao || '' },
            { nome: 'situacao', rotulo: 'Situação', tipo: 'select', valor: item.situacao || 'ativo', opcoes: [{ valor: 'ativo', rotulo: 'Ativo' }, { valor: 'inativo', rotulo: 'Inativo' }] },
          ],
        }),
        rodape: '',
      });
    },

    removerEquipe: function (el) {
      var id = el.getAttribute('data-id');
      Cebus.notificacoes.confirmar('Remover esta equipe?').then(function (ok) {
        if (!ok) return;
        var store = Cebus.registrador.obterStore('equipes');
        store.remover(id).then(function () {
          Cebus.notificacoes.sucesso('Equipe removida!');
          Cebus.roteador.recarregar();
        });
      });
    },

    recarregarEquipes: function () {
      Cebus.roteador.recarregar();
    },
  };

  Cebus.registrador.registrarPagina('/equipes', pagina);
})();

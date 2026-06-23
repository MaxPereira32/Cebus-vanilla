(function () {
  var busca = null;
  var dadosFiltrados = [];

  function renderizarCards(lista) {
    var html = '<div class="distribuicao-grid">';
    if (!lista.length) {
      html += '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--cor-texto-secundario);">Nenhuma rota de distribuição encontrada</div>';
    } else {
      lista.forEach(function (d) {
        var badgeCor = d.situacao === 'concluido' ? 'badge-sucesso' : d.situacao === 'em_andamento' ? 'badge-atencao' : d.situacao === 'cancelado' ? 'badge-perigo' : 'badge-info';
        var rotuloSituacao = d.situacao ? d.situacao.replace('_', ' ') : 'pendente';

        html += '<div class="cartao-item" style="background:var(--cor-superficie);border-radius:0.75rem;padding:1.25rem;border:1px solid var(--cor-borda);">';
        html += '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:0.75rem;">';
        html += '<div><h3 style="margin:0;font-size:1rem;font-weight:600;color:var(--cor-texto);">' + (d.rota || 'Rota sem nome') + '</h3>';
        html += '<span style="font-size:0.75rem;color:var(--cor-texto-secundario);">' + (d.veiculo || '-') + '</span></div>';
        html += '<span class="badge ' + badgeCor + '">' + rotuloSituacao + '</span>';
        html += '</div>';
        html += '<div style="display:flex;flex-direction:column;gap:0.25rem;font-size:0.8rem;color:var(--cor-texto-secundario);">';
        html += '<span><i data-lucide="user" size="12"></i> Motorista: ' + (d.motorista || '-') + '</span>';
        html += '<span><i data-lucide="calendar" size="12"></i> Saída: ' + Cebus.util.formatarData(d.dataSaida) + '</span>';
        html += '<span><i data-lucide="calendar-check" size="12"></i> Previsão: ' + Cebus.util.formatarData(d.dataPrevisao) + '</span>';
        html += '</div>';
        html += '<div style="margin-top:1rem;display:flex;gap:0.5rem;">';
        html += '<button class="btn btn-pequeno btn-primario" data-acao="editarDistribuicao" data-id="' + d.id + '">Editar</button>';
        html += '<button class="btn btn-pequeno btn-perigo" data-acao="removerDistribuicao" data-id="' + d.id + '">Remover</button>';
        html += '</div></div>';
      });
    }
    html += '</div>';
    return html;
  }

  var pagina = {
    mudarItensPorPagina: function(el) { if (paginacao) paginacao.mudarPorPagina(el.value); },
    css: '.distribuicao-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1rem;}.distribuicao-busca{margin-bottom:1rem;}',

    antesRenderizar: function () {
      document.title = 'Distribuição - ' + Cebus.config.nomeSistema;
      Cebus.servicos.debug.logFluxo('Pagina', 'antesRenderizar: Distribuicao');
      var store = Cebus.registrador.obterStore('distribuicao');
      if (store) return Cebus.servicos.debug.fluxoAsync('Distribuicao', store.carregar());
      Cebus.servicos.debug.fimFluxo();
    },

    renderar: function () {
      var store = Cebus.registrador.obterStore('distribuicao');
      var dados = store ? store.obterEstado().lista : [];
      dadosFiltrados = dados;

      busca = Cebus.util.useBusca({
        dados: dados,
        campos: ['rota', 'veiculo', 'motorista', 'situacao'],
        onChange: function (filtrados) {
          dadosFiltrados = filtrados;
          var grid = document.querySelector('.distribuicao-grid');
          if (grid) {
            var pai = grid.parentNode;
            var novo = document.createElement('div');
            novo.innerHTML = renderizarCards(filtrados);
            pai.replaceChild(novo.firstElementChild, grid);
          }
        }
      });

      var conteudo = Cebus.layout.painelAcoes.renderizar({
        titulo: 'Distribuição',
        acoes: [
          { acao: 'abrirNovaDistribuicao', rotulo: 'Nova Rota', icone: 'plus' },
          { acao: 'recarregarDistribuicao', rotulo: 'Atualizar', icone: 'refresh-cw', tipo: 'secundario' },
        ],
      });

      conteudo += '<div class="distribuicao-busca">' + busca.renderizarCampo('Buscar rota...') + '</div>';
      conteudo += renderizarCards(dados);

      return Cebus.layout.renderizar(conteudo);
    },

    destruir: function () { busca = null; dadosFiltrados = []; },

    buscar: function (el) { busca.definirTermo(el.value); },

    abrirNovaDistribuicao: function () {
      Cebus.componentes.modal.abrir({
        titulo: 'Nova Rota de Distribuição',
        largura: 500,
        conteudo: Cebus.componentes.formulario.renderizar({
          id: 'formDistribuicao',
          acaoSubmit: 'salvarDistribuicao',
          campos: [
            { nome: 'rota', rotulo: 'Rota', tipo: 'text', obrigatorio: true, placeholder: 'Ex: Zona Sul' },
            { nome: 'veiculo', rotulo: 'Veículo', tipo: 'text', placeholder: 'Ex: Fiorino AZB-1234' },
            { nome: 'motorista', rotulo: 'Motorista', tipo: 'text', placeholder: 'Nome do motorista' },
            { nome: 'dataSaida', rotulo: 'Data de Saída', tipo: 'date' },
            { nome: 'dataPrevisao', rotulo: 'Previsão de Retorno', tipo: 'date' },
            { nome: 'situacao', rotulo: 'Situação', tipo: 'select', valor: 'pendente', opcoes: [
              { valor: 'pendente', rotulo: 'Pendente' },
              { valor: 'em_andamento', rotulo: 'Em Andamento' },
              { valor: 'concluido', rotulo: 'Concluído' },
              { valor: 'cancelado', rotulo: 'Cancelado' },
            ]},
          ],
        }),
        rodape: '',
      });
    },

    salvarDistribuicao: function (form, e) {
      e.preventDefault();
      var dados = Cebus.componentes.formulario.extrairDados('formDistribuicao');
      var store = Cebus.registrador.obterStore('distribuicao');
      store.salvar(dados).then(function () {
        Cebus.componentes.modal.fechar();
        Cebus.notificacoes.sucesso('Rota de distribuição salva com sucesso!');
        Cebus.roteador.recarregar();
      });
    },

    editarDistribuicao: function (el) {
      var id = el.getAttribute('data-id');
      var store = Cebus.registrador.obterStore('distribuicao');
      var dados = store.obterEstado().lista;
      var item = dados.find(function (d) { return d.id === id; });
      if (!item) return;

      Cebus.componentes.modal.abrir({
        titulo: 'Editar Rota de Distribuição',
        largura: 500,
        conteudo: Cebus.componentes.formulario.renderizar({
          id: 'formDistribuicao',
          acaoSubmit: 'salvarDistribuicao',
          campos: [
            { nome: 'rota', rotulo: 'Rota', tipo: 'text', obrigatorio: true, valor: item.rota || '' },
            { nome: 'veiculo', rotulo: 'Veículo', tipo: 'text', valor: item.veiculo || '' },
            { nome: 'motorista', rotulo: 'Motorista', tipo: 'text', valor: item.motorista || '' },
            { nome: 'dataSaida', rotulo: 'Data de Saída', tipo: 'date', valor: item.dataSaida || '' },
            { nome: 'dataPrevisao', rotulo: 'Previsão de Retorno', tipo: 'date', valor: item.dataPrevisao || '' },
            { nome: 'situacao', rotulo: 'Situação', tipo: 'select', valor: item.situacao || 'pendente', opcoes: [
              { valor: 'pendente', rotulo: 'Pendente' },
              { valor: 'em_andamento', rotulo: 'Em Andamento' },
              { valor: 'concluido', rotulo: 'Concluído' },
              { valor: 'cancelado', rotulo: 'Cancelado' },
            ]},
          ],
        }),
        rodape: '',
      });
    },

    removerDistribuicao: function (el) {
      var id = el.getAttribute('data-id');
      Cebus.notificacoes.confirmar('Remover esta rota de distribuição?').then(function (ok) {
        if (!ok) return;
        var store = Cebus.registrador.obterStore('distribuicao');
        store.remover(id).then(function () {
          Cebus.notificacoes.sucesso('Rota removida!');
          Cebus.roteador.recarregar();
        });
      });
    },

    depoisRenderizar: function () {
      if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
    },

    recarregarDistribuicao: function () {
      Cebus.roteador.recarregar();
    },
  };

  Cebus.registrador.registrarPagina('/distribuicao', pagina);
})();

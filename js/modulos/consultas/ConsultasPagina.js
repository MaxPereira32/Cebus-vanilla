(function () {
  var pagina = {
    mudarItensPorPagina: function(el) { if (paginacao) paginacao.mudarPorPagina(el.value); },
    css: '.tabela-consultas{width:100%;border-collapse:collapse;}.tabela-consultas th{text-align:left;padding:0.75rem 1rem;font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--cor-texto-secundario);border-bottom:2px solid var(--cor-borda);}.tabela-consultas td{padding:0.75rem 1rem;border-bottom:1px solid var(--cor-borda);font-size:0.875rem;color:var(--cor-texto);}',

    antesRenderizar: function () {
      document.title = 'Consultas - ' + Cebus.config.nomeSistema;
    },

    renderar: function () {
      var store = Cebus.registrador.obterStore('consultas');
      var estado = store ? store.obterEstado() : {};
      var resultados = estado.resultados || [];

      var conteudo = Cebus.layout.painelAcoes.renderizar({
        titulo: 'Consultas',
        acoes: [
          { acao: 'executarPesquisa', rotulo: 'Pesquisar', icone: 'search' },
          { acao: 'limparPesquisa', rotulo: 'Limpar', icone: 'x', tipo: 'secundario' },
        ],
      });

      conteudo += '<div style="background:var(--cor-superficie);border-radius:0.75rem;border:1px solid var(--cor-borda);padding:1.5rem;margin-bottom:1.5rem;">';
      conteudo += '<form id="formConsulta" data-acao="executarPesquisa">';
      conteudo += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;">';
      conteudo += '<div class="campo-formulario"><label style="display:block;font-size:0.875rem;font-weight:500;color:var(--cor-texto);margin-bottom:0.375rem;">Termo</label>';
      conteudo += '<input type="text" name="termo" placeholder="Buscar..." style="width:100%;padding:0.625rem;border-radius:0.5rem;border:1px solid var(--cor-borda);background:var(--cor-fundo);color:var(--cor-texto);font-family:inherit;box-sizing:border-box;"></div>';
      conteudo += '<div class="campo-formulario"><label style="display:block;font-size:0.875rem;font-weight:500;color:var(--cor-texto);margin-bottom:0.375rem;">Tipo</label>';
      conteudo += '<select name="tipo" style="width:100%;padding:0.625rem;border-radius:0.5rem;border:1px solid var(--cor-borda);background:var(--cor-fundo);color:var(--cor-texto);font-family:inherit;box-sizing:border-box;">';
      conteudo += '<option value="">Todos</option><option value="produto">Produto</option><option value="fornecedor">Fornecedor</option><option value="entrada">Entrada</option><option value="saida">Saída</option>';
      conteudo += '</select></div>';
      conteudo += '<div class="campo-formulario"><label style="display:block;font-size:0.875rem;font-weight:500;color:var(--cor-texto);margin-bottom:0.375rem;">Período</label>';
      conteudo += '<select name="periodo" style="width:100%;padding:0.625rem;border-radius:0.5rem;border:1px solid var(--cor-borda);background:var(--cor-fundo);color:var(--cor-texto);font-family:inherit;box-sizing:border-box;">';
      conteudo += '<option value="">Todos</option><option value="hoje">Hoje</option><option value="7dias">Últimos 7 dias</option><option value="30dias">Últimos 30 dias</option><option value="mes">Este mês</option>';
      conteudo += '</select></div>';
      conteudo += '</div>';
      conteudo += '<div style="margin-top:1rem;display:flex;gap:0.5rem;">';
      conteudo += '<button type="submit" class="btn btn-primario"><i data-lucide="search" size="16"></i> Pesquisar</button>';
      conteudo += '</div>';
      conteudo += '</form></div>';

      conteudo += '<div style="background:var(--cor-superficie);border-radius:0.75rem;border:1px solid var(--cor-borda);overflow-x:auto;">';
      conteudo += '<table class="tabela-consultas">';
      conteudo += '<thead><tr><th>Tipo</th><th>Descrição</th><th>Data</th><th>Detalhes</th></tr></thead><tbody>';

      if (!resultados.length) {
        conteudo += '<tr><td colspan="4" style="text-align:center;padding:3rem;color:var(--cor-texto-secundario);">Utilize os filtros acima para realizar uma consulta</td></tr>';
      } else {
        resultados.forEach(function (r) {
          conteudo += '<tr>';
          conteudo += '<td><span class="badge badge-info">' + (r.tipo || '-') + '</span></td>';
          conteudo += '<td>' + (r.descricao || '-') + '</td>';
          conteudo += '<td>' + Cebus.util.formatarData(r.data) + '</td>';
          conteudo += '<td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + (r.detalhes || '-') + '</td>';
          conteudo += '</tr>';
        });
      }

      conteudo += '</tbody></table></div>';
      return Cebus.layout.renderizar(conteudo);
    },

    executarPesquisa: function (form, e) {
      if (e) e.preventDefault();
      var termo = form ? form.querySelector('[name="termo"]').value : document.querySelector('[name="termo"]').value;
      var tipo = form ? form.querySelector('[name="tipo"]').value : document.querySelector('[name="tipo"]').value;
      var periodo = form ? form.querySelector('[name="periodo"]').value : document.querySelector('[name="periodo"]').value;
      var dataInicio, dataFim;
      var hoje = new Date();
      if (periodo === 'hoje') {
        dataInicio = hoje.toISOString().substring(0, 10);
        dataFim = dataInicio;
      } else if (periodo === '7dias') {
        dataInicio = new Date(hoje.getTime() - 7 * 86400000).toISOString().substring(0, 10);
        dataFim = hoje.toISOString().substring(0, 10);
      } else if (periodo === '30dias') {
        dataInicio = new Date(hoje.getTime() - 30 * 86400000).toISOString().substring(0, 10);
        dataFim = hoje.toISOString().substring(0, 10);
      } else if (periodo === 'mes') {
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().substring(0, 10);
        dataFim = hoje.toISOString().substring(0, 10);
      }
      var store = Cebus.registrador.obterStore('consultas');
      store.pesquisar({ termo: termo, tipo: tipo, dataInicio: dataInicio, dataFim: dataFim }).then(function () {
        Cebus.roteador.recarregar();
      });
    },

    destruir: function () {},

    limparPesquisa: function () {
      var store = Cebus.registrador.obterStore('consultas');
      store.limparResultados();
      Cebus.roteador.recarregar();
    },
  };

  Cebus.registrador.registrarPagina('/consultas', pagina);
})();

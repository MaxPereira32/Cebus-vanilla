(function () {
  var pagina = {
    mudarItensPorPagina: function(el) { if (paginacao) paginacao.mudarPorPagina(el.value); },
    css: '.config-secao{margin-bottom:2rem;}',

    antesRenderizar: function () {
      document.title = 'Configurações - ' + Cebus.config.nomeSistema;
      var store = Cebus.registrador.obterStore('configuracoes');
      if (store) return store.carregar();
    },

    renderar: function () {
      var store = Cebus.registrador.obterStore('configuracoes');
      var config = store ? store.obterEstado().config : {};
      var temaAtual = Cebus.servicos.tema.obterAtual();

      var conteudo = Cebus.layout.painelAcoes.renderizar({
        titulo: 'Configurações',
        acoes: [
          { acao: 'exportarBackup', rotulo: 'Exportar Backup', icone: 'download', tipo: 'secundario' },
        ],
      });

      conteudo += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;">';

      // Config Geral
      conteudo += '<div class="config-secao" style="background:var(--cor-superficie);border-radius:0.75rem;padding:1.5rem;border:1px solid var(--cor-borda);">';
      conteudo += '<h3 style="margin:0 0 1rem;font-size:1rem;font-weight:600;color:var(--cor-texto);">Geral</h3>';
      conteudo += Cebus.componentes.formulario.renderizar({
        id: 'formConfigGeral',
        acaoSubmit: 'salvarConfigGeral',
        submitLabel: 'Salvar',
        campos: [
          { nome: 'nomeSistema', rotulo: 'Nome do Sistema', tipo: 'text', valor: config.nomeSistema || '' },
          { nome: 'descricao', rotulo: 'Descrição', tipo: 'text', valor: config.descricao || '' },
          { nome: 'emailNotificacao', rotulo: 'E-mail de Notificação', tipo: 'email', valor: config.emailNotificacao || '' },
        ],
      });
      conteudo += '</div>';

      // Tema
      conteudo += '<div class="config-secao" style="background:var(--cor-superficie);border-radius:0.75rem;padding:1.5rem;border:1px solid var(--cor-borda);">';
      conteudo += '<h3 style="margin:0 0 1rem;font-size:1rem;font-weight:600;color:var(--cor-texto);">Aparência</h3>';
      conteudo += '<div style="display:flex;flex-direction:column;gap:1rem;">';
      conteudo += '<div><p style="font-size:0.875rem;color:var(--cor-texto-secundario);margin:0 0 0.5rem;">Tema atual: <strong>' + (temaAtual === 'dark' ? 'Escuro' : 'Claro') + '</strong></p>';
      conteudo += '<button class="btn btn-secundario" data-acao="alternarTemaConfig"><i data-lucide="' + (temaAtual === 'dark' ? 'sun' : 'moon') + '" size="16"></i> Alternar Tema</button></div>';
      conteudo += '</div>';

      // Backup
      conteudo += '<h3 style="margin:1.5rem 0 0.75rem;font-size:0.9rem;font-weight:600;color:var(--cor-texto);">Backup</h3>';
      conteudo += '<div style="display:flex;flex-direction:column;gap:0.5rem;">';
      conteudo += '<button class="btn btn-primario" data-acao="exportarBackup"><i data-lucide="download" size="16"></i> Exportar Backup Completo</button>';
      conteudo += '<div><p style="color:var(--cor-texto-secundario);font-size:0.8rem;margin-bottom:0.5rem;">Importar Backup:</p><input type="file" accept=".json" id="inputImportBackup" style="display:none;" data-acao="importarBackup"><button class="btn btn-secundario" onclick="document.getElementById(\'inputImportBackup\').click()">Selecionar Arquivo</button></div>';
      conteudo += '</div>';

      // Informações
      conteudo += '<h3 style="margin:1.5rem 0 0.75rem;font-size:0.9rem;font-weight:600;color:var(--cor-texto);">Informações</h3>';
      conteudo += '<div style="font-size:0.85rem;color:var(--cor-texto-secundario);display:flex;flex-direction:column;gap:0.375rem;">';
      conteudo += '<span>Versão: <strong>v' + (config.versao || Cebus.config.versao) + '</strong></span>';
      conteudo += '<span>Ambiente: <strong>Offline-first</strong></span>';
      conteudo += '<span>Armazenamento: <strong>LocalStorage + Firebase</strong></span>';
      conteudo += '</div>';
      conteudo += '</div>';

      // Horário
      conteudo += '<div class="config-secao" style="background:var(--cor-superficie);border-radius:0.75rem;padding:1.5rem;border:1px solid var(--cor-borda);">';
      conteudo += '<h3 style="margin:0 0 1rem;font-size:1rem;font-weight:600;color:var(--cor-texto);">Funcionamento</h3>';
      conteudo += Cebus.componentes.formulario.renderizar({
        id: 'formConfigHorario',
        acaoSubmit: 'salvarConfigHorario',
        submitLabel: 'Salvar',
        campos: [
          { nome: 'horarioInicio', rotulo: 'Início do Expediente', tipo: 'time', valor: config.horarioFuncionamentoInicio || '08:00' },
          { nome: 'horarioFim', rotulo: 'Fim do Expediente', tipo: 'time', valor: config.horarioFuncionamentoFim || '18:00' },
          { nome: 'alertaMinimo', rotulo: 'Alerta de Estoque Baixo', tipo: 'checkbox', valor: config.alertaEstoqueMinimo !== false, placeholder: 'Ativar alerta automático' },
        ],
      });
      conteudo += '</div>';

      conteudo += '</div>';
      return Cebus.layout.renderizar(conteudo);
    },

    salvarConfigGeral: function (form, e) {
      e.preventDefault();
      var dados = Cebus.componentes.formulario.extrairDados('formConfigGeral');
      var store = Cebus.registrador.obterStore('configuracoes');
      store.salvar(dados).then(function () {
        Cebus.notificacoes.sucesso('Configurações salvas!');
      });
    },

    salvarConfigHorario: function (form, e) {
      e.preventDefault();
      var dados = Cebus.componentes.formulario.extrairDados('formConfigHorario');
      var store = Cebus.registrador.obterStore('configuracoes');
      store.salvar(dados).then(function () {
        Cebus.notificacoes.sucesso('Horários atualizados!');
      });
    },

    alternarTemaConfig: function () {
      Cebus.servicos.tema.alternar();
      Cebus.roteador.recarregar();
    },

    exportarBackup: function () {
      Cebus.servicos.backup.exportarCompleto();
      Cebus.notificacoes.sucesso('Backup exportado!');
    },

    destruir: function () {},

    importarBackup: function (el) {
      var file = el.files[0];
      if (!file) return;
      Cebus.servicos.backup.importar(file).then(function () {
        Cebus.notificacoes.sucesso('Backup importado!');
        Cebus.roteador.recarregar();
      }).catch(function () {
        Cebus.notificacoes.erro('Erro ao importar backup');
      });
    },
  };

  Cebus.registrador.registrarPagina('/configuracoes', pagina);
})();

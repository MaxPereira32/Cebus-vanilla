(function () {
  var paginacao = null;
  var busca = null;
  var dadosCompletos = [];
  var editandoId = null;

  var diasSemana = [
    'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira',
    'Sexta-feira', 'Sábado', 'Domingo'
  ];

  function gerarProximoIdDistribuicao() {
    return Cebus.util.gerarIdComPrefixo('DI');
  }

  function dataParaDiaSemana(dataStr) {
    if (!dataStr) return '';
    var partes = dataStr.split('-');
    var d = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
    return diasSemana[d.getDay() === 0 ? 6 : d.getDay() - 1];
  }

  function inicializarHooks() {
    paginacao = Cebus.util.usePaginacao({
      id: 'distribuicao',
      porPagina: Cebus.config.itensPorPagina || 20,
      onChange: function () {
        var el = document.querySelector('.tabela-distribuicao tbody');
        if (el) {
          el.innerHTML = renderizarLinhas();
          var controles = document.querySelector('.paginacao-container');
          if (controles) controles.innerHTML = paginacao.renderizarControles();
          if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
        }
      }
    });
    busca = Cebus.util.useBusca({
      dados: dadosCompletos,
      campos: ['ID_Distribuicao', 'Destino', 'DiaSemana', 'TipoCorte'],
      onChange: function (filtrados) {
        paginacao.definirDados(filtrados);
        var el = document.querySelector('.tabela-distribuicao tbody');
        if (el) {
          el.innerHTML = renderizarLinhas();
          var controles = document.querySelector('.paginacao-container');
          if (controles) controles.innerHTML = paginacao.renderizarControles();
          if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
        }
      }
    });
  }

  function formatarData(v) {
    if (!v) return '-';
    if (v.seconds) return new Date(v.seconds * 1000).toLocaleDateString('pt-BR');
    if (v.toDate) return v.toDate().toLocaleDateString('pt-BR');
    var d = new Date(v);
    return isNaN(d.getTime()) ? v : d.toLocaleDateString('pt-BR');
  }

  function criarToggle(valor, ativo) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-toggle' + (ativo ? ' ativo' : '');
    btn.textContent = ativo ? valor : '-';
    btn.setAttribute('data-valor', valor);
    btn.addEventListener('click', function () {
      var ligado = this.classList.toggle('ativo');
      this.textContent = ligado ? valor : '-';
    });
    return btn;
  }

  function renderizarPainelFormulario() {
    var agora = new Date();
    var dataAtual = agora.toISOString().split('T')[0];
    var horaAtual = agora.toTimeString().slice(0, 5);
    var diaAtual = dataParaDiaSemana(dataAtual);
    var estiloGrupo = 'display:flex;flex-direction:column;gap:0.25rem;';
    var estiloLabel = 'font-size:0.75rem;font-weight:600;color:var(--cor-texto-secundario);text-transform:uppercase;letter-spacing:0.03em;';
    var estiloInput = 'padding:0.45rem 0.6rem;border:1px solid var(--cor-borda);border-radius:0.4rem;background:var(--cor-superficie);color:var(--cor-texto-primario);font-size:0.85rem;outline:none;';
    var estiloSelect = estiloInput + 'cursor:pointer;';

    var html = '<div id="painelDistribuicao" class="painel-distribuicao" style="display:none;">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;">';
    html += '<h3 id="painelTitulo" style="margin:0;font-size:1rem;font-weight:700;">Novo Registro</h3>';
    html += '</div>';
    html += '<form id="formDistribuicao" style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;gap:0.75rem;">';

    html += '<div style="' + estiloGrupo + '"><label style="' + estiloLabel + '">Data</label>';
    html += '<input type="date" name="Data" value="' + dataAtual + '" required style="' + estiloInput + '"></div>';

    html += '<div style="' + estiloGrupo + '"><label style="' + estiloLabel + '">Hora</label>';
    html += '<input type="time" name="Hora" value="' + horaAtual + '" style="' + estiloInput + '"></div>';

    html += '<div style="' + estiloGrupo + '"><label style="' + estiloLabel + '">Destino</label>';
    html += '<input type="text" name="Destino" placeholder="Ex: Sítio Paraíso" required style="' + estiloInput + '"></div>';

    html += '<div style="' + estiloGrupo + '"><label style="' + estiloLabel + '">Dia da Semana</label>';
    html += '<select name="DiaSemana" style="' + estiloSelect + '">';
    diasSemana.forEach(function (d) { html += '<option value="' + d + '"' + (d === diaAtual ? ' selected' : '') + '>' + d + '</option>'; });
    html += '</select></div>';

    html += '<div style="' + estiloGrupo + '"><label style="' + estiloLabel + '">Qtd Animais</label>';
    html += '<input type="number" name="QtdAnimais" placeholder="0" min="0" style="' + estiloInput + '"></div>';

    html += '<div style="' + estiloGrupo + '"><label style="' + estiloLabel + '">Tipo de Corte</label>';
    html += '<input type="text" name="TipoCorte" placeholder="Ex: Frango inteiro" style="' + estiloInput + '"></div>';

    html += '<div style="' + estiloGrupo + '"><label style="' + estiloLabel + '">Enriquecimento</label>';
    html += '<div id="toggleEnriquecimento" style="display:flex;gap:0.35rem;"></div></div>';

    html += '<div style="' + estiloGrupo + '"><label style="' + estiloLabel + '">Ovos (unid)</label>';
    html += '<input type="number" name="Ovos" placeholder="0" min="0" style="' + estiloInput + '"></div>';

    html += '<div style="' + estiloGrupo + '"><label style="' + estiloLabel + '">Bolinho</label>';
    html += '<div id="toggleBolinho" style="display:flex;gap:0.35rem;"></div></div>';

    html += '<div style="' + estiloGrupo + '"><label style="' + estiloLabel + '">Ração (Kg)</label>';
    html += '<input type="number" name="Racao" placeholder="0" min="0" step="0.1" style="' + estiloInput + '"></div>';

    html += '<div style="grid-column:1/-1;display:flex;gap:0.5rem;padding-top:0.5rem;">';
    html += '<button type="submit" class="btn btn-primario">Salvar</button>';
    html += '<button type="button" class="btn btn-secundario" data-acao="fecharPainel">Cancelar</button>';
    html += '</div>';

    html += '</form></div>';
    return html;
  }

  function inicializarToggles() {
    var elEnri = document.getElementById('toggleEnriquecimento');
    if (elEnri && !elEnri.querySelector('button')) {
      elEnri.appendChild(criarToggle('Sim', false));
    }
    var elBol = document.getElementById('toggleBolinho');
    if (elBol && !elBol.querySelector('button')) {
      elBol.appendChild(criarToggle('X', false));
    }
  }

  function configurarAutomaticoDiaSemana() {
    var dataInput = document.querySelector('[name="Data"]');
    var diaSelect = document.querySelector('[name="DiaSemana"]');
    if (dataInput && diaSelect) {
      dataInput.addEventListener('change', function () {
        var dia = dataParaDiaSemana(this.value);
        if (dia && diaSelect) diaSelect.value = dia;
      });
    }
  }

  function abrirPainelNovo() {
    editandoId = null;
    var painel = document.getElementById('painelDistribuicao');
    if (!painel) return;
    painel.style.display = 'block';
    document.getElementById('painelTitulo').textContent = 'Novo Registro';
    painel.querySelector('form').reset();
    inicializarToggles();
    configurarAutomaticoDiaSemana();
    var agora = new Date();
    painel.querySelector('[name="Data"]').value = agora.toISOString().split('T')[0];
    painel.querySelector('[name="Hora"]').value = agora.toTimeString().slice(0, 5);
    painel.querySelector('[name="DiaSemana"]').value = dataParaDiaSemana(agora.toISOString().split('T')[0]);
    painel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function abrirPainelEditar(item) {
    editandoId = item.id;
    var painel = document.getElementById('painelDistribuicao');
    if (!painel) return;
    painel.style.display = 'block';
    document.getElementById('painelTitulo').textContent = 'Editando: ' + (item.Destino || '');
    painel.querySelector('[name="Data"]').value = item.Data || '';
    painel.querySelector('[name="Hora"]').value = item.Hora || '';
    painel.querySelector('[name="Destino"]').value = item.Destino || '';
    painel.querySelector('[name="QtdAnimais"]').value = item.QtdAnimais || 0;
    painel.querySelector('[name="DiaSemana"]').value = item.DiaSemana || '';
    painel.querySelector('[name="TipoCorte"]').value = item.TipoCorte || '';
    painel.querySelector('[name="Ovos"]').value = item.Ovos || 0;
    painel.querySelector('[name="Racao"]').value = item.Racao || 0;

    inicializarToggles();
    configurarAutomaticoDiaSemana();

    var enriBtn = document.querySelector('#toggleEnriquecimento button');
    if (enriBtn) {
      var enriAtivo = item.Enriquecimento === 'Sim';
      enriBtn.classList.toggle('ativo', enriAtivo);
      enriBtn.textContent = enriAtivo ? 'Sim' : '-';
    }
    var bolBtn = document.querySelector('#toggleBolinho button');
    if (bolBtn) {
      var bolAtivo = item.Bolinho === 'X';
      bolBtn.classList.toggle('ativo', bolAtivo);
      bolBtn.textContent = bolAtivo ? 'X' : '-';
    }

    painel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function fecharPainel() {
    var painel = document.getElementById('painelDistribuicao');
    if (painel) painel.style.display = 'none';
    editandoId = null;
  }

  function salvarDoPainel(e) {
    e.preventDefault();
    var painel = document.getElementById('painelDistribuicao');
    if (!painel) return;
    var dados = {};
    dados.Data = painel.querySelector('[name="Data"]').value;
    dados.Hora = painel.querySelector('[name="Hora"]').value;
    dados.Destino = painel.querySelector('[name="Destino"]').value;
    dados.QtdAnimais = parseFloat(painel.querySelector('[name="QtdAnimais"]').value) || 0;
    dados.DiaSemana = painel.querySelector('[name="DiaSemana"]').value;
    dados.TipoCorte = painel.querySelector('[name="TipoCorte"]').value;

    var enriBtn = document.querySelector('#toggleEnriquecimento button');
    dados.Enriquecimento = (enriBtn && enriBtn.classList.contains('ativo')) ? 'Sim' : '-';

    dados.Ovos = parseFloat(painel.querySelector('[name="Ovos"]').value) || 0;

    var bolBtn = document.querySelector('#toggleBolinho button');
    dados.Bolinho = (bolBtn && bolBtn.classList.contains('ativo')) ? 'X' : '-';

    dados.Racao = parseFloat(painel.querySelector('[name="Racao"]').value) || 0;

    if (!dados.Destino) { Cebus.notificacoes.erro('Informe o destino'); return; }

    if (!dados.ID_Distribuicao) dados.ID_Distribuicao = gerarProximoIdDistribuicao();
    if (editandoId) dados.id = editandoId;

    var store = Cebus.registrador.obterStore('distribuicao');
    store.salvar(dados).then(function () {
      fecharPainel();
      editandoId = null;
      Cebus.notificacoes.sucesso('Registro salvo!');
      Cebus.roteador.recarregar();
    });
  }

  function renderizarLinhas() {
    var paginados = paginacao ? paginacao.obterPaginados() : [];
    var html = '';
    if (!paginados.length) {
      return '<tr><td colspan="12" style="text-align:center;padding:3rem;color:var(--cor-texto-secundario);">Nenhum registro encontrado</td></tr>';
    }
    paginados.forEach(function (d) {
      html += '<tr>';
      html += '<td style="font-family:monospace;font-size:0.8rem;">' + (d.ID_Distribuicao || d.id || '-') + '</td>';
      html += '<td>' + formatarData(d.Data) + '</td>';
      html += '<td>' + (d.Hora || '-') + '</td>';
      html += '<td>' + (d.Destino || '-') + '</td>';
      html += '<td>' + (d.QtdAnimais || 0) + '</td>';
      html += '<td>' + (d.DiaSemana || '-') + '</td>';
      html += '<td>' + (d.TipoCorte || '-') + '</td>';
      html += '<td>' + (d.Enriquecimento === 'Sim' ? 'Sim' : '-') + '</td>';
      html += '<td>' + (d.Ovos || 0) + '</td>';
      html += '<td>' + (d.Bolinho === 'X' ? 'X' : '-') + '</td>';
      html += '<td>' + (d.Racao || 0) + '</td>';
      html += '<td style="display:flex;gap:0.5rem;">';
      html += '<button class="btn btn-pequeno btn-primario" data-acao="editarDistribuicao" data-id="' + d.id + '">Editar</button>';
      html += '<button class="btn btn-pequeno btn-perigo" data-acao="removerDistribuicao" data-id="' + d.id + '">Remover</button>';
      html += '</td></tr>';
    });
    return html;
  }

  var pagina = {
    mudarItensPorPagina: function(el) { if (paginacao) paginacao.mudarPorPagina(el.value); },
    css: '.distribuicao-busca{margin-bottom:1rem;}.tabela-distribuicao{width:100%;border-collapse:collapse;}.tabela-distribuicao th,.tabela-distribuicao td{text-align:left;padding:0.75rem 1rem;border-bottom:1px solid var(--cor-borda);}.tabela-distribuicao th{font-weight:600;color:var(--cor-texto-secundario);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.05em;white-space:nowrap;}.painel-distribuicao{background:var(--cor-superficie);border:1px solid var(--cor-primaria);border-radius:0.75rem;padding:1.25rem;margin-bottom:1rem;}.btn-toggle{width:100%;padding:0.45rem 0.6rem;border:1px solid var(--cor-borda);border-radius:0.4rem;background:var(--cor-superficie);color:var(--cor-texto-secundario);font-size:0.85rem;cursor:pointer;text-align:center;transition:all 0.15s;}.btn-toggle.ativo{background:var(--cor-primaria);color:#fff;border-color:var(--cor-primaria);font-weight:700;}',

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
      dadosCompletos = dados;

      inicializarHooks();
      paginacao.definirDados(dadosCompletos);
      busca.definirDados(dadosCompletos);

      var conteudo = Cebus.layout.painelAcoes.renderizar({
        titulo: 'Distribuição',
        acoes: [
          { acao: 'abrirNovaDistribuicao', rotulo: 'Novo Registro', icone: 'plus' },
          { acao: 'recarregarDistribuicao', rotulo: 'Atualizar', icone: 'refresh-cw', tipo: 'secundario' },
        ],
      });

      conteudo += renderizarPainelFormulario();

      conteudo += '<div class="distribuicao-busca">' + busca.renderizarCampo('Buscar...') + '</div>';
      conteudo += '<div style="background:var(--cor-superficie);border-radius:0.75rem;border:1px solid var(--cor-borda);overflow-x:auto;">';
      conteudo += '<table class="tabela-distribuicao"><thead><tr>';
      conteudo += '<th>ID</th><th>Data</th><th>Hora</th><th>Destino</th><th>Qtd Animais</th><th>Dia Semana</th><th>Tipo Corte</th><th>Enriquecimento</th><th>Ovos</th><th>Bolinho</th><th>Ração (Kg)</th><th>Ações</th>';
      conteudo += '</tr></thead><tbody>' + renderizarLinhas() + '</tbody></table></div>';
      conteudo += '<div class="paginacao-container">' + (paginacao ? paginacao.renderizarControles() : '') + '</div>';

      return Cebus.layout.renderizar(conteudo);
    },

    depoisRenderizar: function () {
      var painel = document.getElementById('painelDistribuicao');
      if (painel) {
        painel.addEventListener('submit', salvarDoPainel);
        painel.addEventListener('click', function (e) {
          var btn = e.target.closest('[data-acao]');
          if (btn && btn.getAttribute('data-acao') === 'fecharPainel') fecharPainel();
        });
      }
      if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
    },

    destruir: function () { editandoId = null; paginacao = null; busca = null; dadosCompletos = []; },

    buscar: function (el) { busca.definirTermo(el.value); },

    abrirNovaDistribuicao: function () {
      abrirPainelNovo();
    },

    editarDistribuicao: function (el) {
      var id = el.getAttribute('data-id');
      var store = Cebus.registrador.obterStore('distribuicao');
      var dados = store.obterEstado().lista;
      var item = dados.find(function (d) { return d.id === id; });
      if (!item) return;
      abrirPainelEditar(item);
    },

    removerDistribuicao: function (el) {
      var id = el.getAttribute('data-id');
      Cebus.notificacoes.confirmar('Remover este registro?').then(function (ok) {
        if (!ok) return;
        var store = Cebus.registrador.obterStore('distribuicao');
        store.remover(id).then(function () {
          Cebus.notificacoes.sucesso('Registro removido!');
          Cebus.roteador.recarregar();
        });
      });
    },

    recarregarDistribuicao: function () {
      Cebus.roteador.recarregar();
    },
  };

  Cebus.registrador.registrarPagina('/distribuicao', pagina);
})();

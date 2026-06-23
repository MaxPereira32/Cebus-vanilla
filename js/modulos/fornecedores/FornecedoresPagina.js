/* ==========================================================================
   ARQUIVO: FornecedoresPagina.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  var paginacao = null;
  var busca = null;
  var dadosCompletos = [];
  var _editando = null;

  function _formatarDataISO(valor) {
    if (!valor) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor;
    var partes = valor.split('/');
    if (partes.length === 3) return partes[2] + '-' + partes[1] + '-' + partes[0];
    return valor;
  }

  function gerarProximoIdFornecedor() {
    return Cebus.util.gerarIdComPrefixo('FR');
  }

  function inicializarHooks() {
    paginacao = Cebus.util.usePaginacao({
      id: 'fornecedores',
      porPagina: Cebus.config.itensPorPagina || 20,
      onChange: function () {
        var el = document.querySelector('.tabela-fornecedores tbody');
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
          campos: ['nome', 'cnpj', 'email', 'telefone', 'tipoProduto', 'idFornecedor', 'numeroContrato', 'dataValidade'],
      onChange: function (filtrados) {
        paginacao.definirDados(filtrados);
        var el = document.querySelector('.tabela-fornecedores tbody');
        if (el) {
          el.innerHTML = renderizarLinhas();
          var controles = document.querySelector('.paginacao-container');
          if (controles) controles.innerHTML = paginacao.renderizarControles();
          if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
        }
      }
    });
  }

  function renderizarLinhas() {
    var paginados = paginacao ? paginacao.obterPaginados() : [];
    console.log("[Page] renderizarLinhas", paginados.length, "itens");
    var html = '';
    if (!paginados.length) {
      return '<tr><td colspan="9" style="text-align:center;padding:3rem;color:var(--cor-texto-secundario);">Nenhum fornecedor encontrado</td></tr>';
    }
    paginados.forEach(function (f) {
      var cnpjFormatado = f.cnpjFormatado || f.CNPJ || f.cnpj || '-';
      var telefoneFormatado = f.telefoneFormatado || f.Telefone || f.telefone || '-';

      html += '<tr>';
      html += '<td style="font-family:monospace;font-size:0.8rem;">' + (f.idFornecedor || f.ID_Fornecedor || '-') + '</td>';
      html += '<td>' + (f.Nome || f.nome || f.razaoSocial || '-') + '</td>';
      html += '<td>' + (f.NumeroContrato || f.numeroContrato || '-') + '</td>';
      html += '<td style="font-family:monospace;font-size:0.8rem;">' + (f.dataValidadeFormatada || f.DataValidade || f.dataValidade || '-') + '</td>';
      html += '<td>' + (f.tipoProduto || f.TipoProduto || '-') + '</td>';
      html += '<td>' + telefoneFormatado + '</td>';
      html += '<td>' + (f.Email || f.email || '-') + '</td>';
      html += '<td style="font-family:monospace;font-size:0.8rem;">' + cnpjFormatado + '</td>';
      html += '<td style="white-space:nowrap;">' +
        '<button class="btn btn-pequeno btn-primario" data-acao="editarFornecedor" data-id="' + f.id + '">Editar</button> ' +
        '<button class="btn btn-pequeno btn-perigo" data-acao="removerFornecedor" data-id="' + f.id + '">Remover</button>' +
        '</td>';
      html += '</tr>';
    });
    return html;
  }

  function renderizarControles() {
    var controles = paginacao ? paginacao.renderizarControles() : '';
    return controles;
  }

  var pagina = {
    mudarItensPorPagina: function(el) { if (paginacao) paginacao.mudarPorPagina(el.value); },
    css: '.fornecedor-busca{margin-bottom:1rem;}.tabela-fornecedores{table-layout:fixed;width:100%;}.tabela-fornecedores th{text-align:left;}.tabela-fornecedores th:first-child,.tabela-fornecedores td:first-child{padding-left:1rem;}.tabela-fornecedores th:last-child,.tabela-fornecedores td:last-child{padding-right:1rem;}.tabela-fornecedores td{padding:0.625rem 0.5rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}.tabela-fornecedores th:nth-child(1),.tabela-fornecedores td:nth-child(1){width:8%;}.tabela-fornecedores th:nth-child(2),.tabela-fornecedores td:nth-child(2){width:14%;}.tabela-fornecedores th:nth-child(3),.tabela-fornecedores td:nth-child(3){width:10%;}.tabela-fornecedores th:nth-child(4),.tabela-fornecedores td:nth-child(4){width:10%;}.tabela-fornecedores th:nth-child(5),.tabela-fornecedores td:nth-child(5){width:10%;}.tabela-fornecedores th:nth-child(6),.tabela-fornecedores td:nth-child(6){width:10%;}.tabela-fornecedores th:nth-child(7),.tabela-fornecedores td:nth-child(7){width:13%;}.tabela-fornecedores th:nth-child(8),.tabela-fornecedores td:nth-child(8){width:10%;}.tabela-fornecedores th:nth-child(9),.tabela-fornecedores td:nth-child(9){width:15%;text-align:right;}.fornecedor-tabela-wrapper{padding:0;overflow-x:auto;}.fornecedor-tabela-wrapper table{margin-bottom:0;}.fornecedor-tabela-wrapper table tr:last-child td{border-bottom:none;}',

    antesRenderizar: function () {
      document.title = 'Fornecedores - ' + Cebus.config.nomeSistema;
      Cebus.servicos.debug.logFluxo('Pagina', 'antesRenderizar: Fornecedores');
      var store = Cebus.registrador.obterStore('fornecedores');
      if (store) return Cebus.servicos.debug.fluxoAsync('Fornecedores', store.carregar());
      Cebus.servicos.debug.fimFluxo();
    },

    renderar: function () {
      var store = Cebus.registrador.obterStore('fornecedores');
      var estado = store ? store.obterEstado() : { lista: [], carregando: false };
      dadosCompletos = window.FornecedorHelper ? window.FornecedorHelper.formatarLista(estado.lista) : estado.lista;

      inicializarHooks();
      paginacao.definirDados(dadosCompletos);
      busca.definirDados(dadosCompletos);

      var conteudo = Cebus.layout.painelAcoes.renderizar({
        titulo: 'Fornecedores',
        acoes: [
          { acao: 'abrirNovoFornecedor', rotulo: 'Novo Fornecedor', icone: 'plus' },
          { acao: 'recarregarFornecedores', rotulo: 'Atualizar', icone: 'refresh-cw', tipo: 'secundario' },
        ],
      });

      conteudo += '<div class="fornecedor-busca">' + busca.renderizarCampo('Buscar fornecedor...') + '</div>';
      conteudo += '<div class="fornecedor-tabela-wrapper" style="background:var(--cor-superficie);border-radius:0.75rem;border:1px solid var(--cor-borda);overflow-x:auto;">';
      conteudo += '<table class="tabela-fornecedores"><thead><tr>';
      conteudo += '<th>Código</th><th>Nome</th><th>Nº Contrato</th><th>Data/Validade</th><th>Tipo Produto</th><th>Telefone</th><th>Email</th><th>CNPJ</th><th>Ações</th>';
      conteudo += '</tr></thead><tbody>' + renderizarLinhas() + '</tbody></table></div>';
      conteudo += '<div class="paginacao-container">' + renderizarControles() + '</div>';

      return Cebus.layout.renderizar(conteudo);
    },

    depoisRenderizar: function () {
      if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
    },

    destruir: function () {
      paginacao = null;
      busca = null;
      dadosCompletos = [];
      _editando = null;
    },

    buscar: function (el) {
      busca.definirTermo(el.value);
    },

    abrirNovoFornecedor: function () {
      _editando = null;
      Cebus.componentes.modalBase.abrir({
        titulo: 'Novo Fornecedor',
        largura: 500,
        conteudo: Cebus.componentes.formulario.renderizar({
          id: 'formFornecedor',
          acaoSubmit: 'salvarFornecedor',
          campos: [
            { nome: 'Nome', rotulo: 'Nome', tipo: 'text', obrigatorio: true, placeholder: 'Nome do fornecedor' },
            { nome: 'NumeroContrato', rotulo: 'Nº Contrato', tipo: 'text', placeholder: 'Ex: CT-2024-001' },
            { nome: 'DataValidade', rotulo: 'Data/Validade', tipo: 'date', id: 'dataFornecedor', classe: 'campo-formulario', obrigatorio: true },
            { nome: 'TipoProduto', rotulo: 'Tipo de Produto', tipo: 'text', placeholder: 'Ex: Hortifrúti' },
            { nome: 'Telefone', rotulo: 'Telefone', tipo: 'text', placeholder: '(99) 99999-9999', mascara: 'telefone', obrigatorio: true },
            { nome: 'Email', rotulo: 'Email', tipo: 'email', placeholder: 'email@fornecedor.com' },
            { nome: 'CNPJ', rotulo: 'CNPJ', tipo: 'text', placeholder: '00.000.000/0000-00', mascara: 'cnpj', obrigatorio: true },
            { nome: 'Observacoes', rotulo: 'Observações', tipo: 'text', placeholder: 'Observações...' },
          ],
        }),
      });
    },

    salvarFornecedor: function (form, e) {
      e.preventDefault();
      console.log("[Page] botão salvar clicado");
      var dados = Cebus.componentes.formulario.extrairDados('formFornecedor');
      console.log("[Page] dados extraídos", dados);
      var editando = _editando;
      if (editando) {
        dados.id = editando.id;
        dados.ID_Fornecedor = editando.ID_Fornecedor;
      } else {
        dados.ID_Fornecedor = gerarProximoIdFornecedor();
      }
      var store = Cebus.registrador.obterStore('fornecedores');
      store.salvar(dados).then(function () {
        _editando = null;
        Cebus.componentes.modalBase.fechar();
        Cebus.notificacoes.sucesso('Fornecedor salvo com sucesso!');
        Cebus.roteador.recarregar();
      }).catch(function (err) {
        if (err && err.tipo === 'validacao') {
          Cebus.notificacoes.erro(err.erros.join(', '));
        } else {
          Cebus.notificacoes.erro('Erro ao salvar fornecedor');
        }
      });
    },

    editarFornecedor: function (el) {
      var id = el.getAttribute('data-id');
      console.log("[Page] editar fornecedor", id);
      var store = Cebus.registrador.obterStore('fornecedores');
      var item = store.obterEstado().lista.find(function (f) { return f.id === id; });
      if (!item) {
        console.warn("[Page] Fornecedor não encontrado na lista para o ID:", id);
        return;
      }
      var itemCompleto = dadosCompletos.find(function (f) { return f.id === id; });
      var idDisplay = itemCompleto ? (itemCompleto.idFornecedor || itemCompleto.ID_Fornecedor || 'FR---') : (item.idFornecedor || item.ID_Fornecedor || 'FR---');
      _editando = { id: item.id, ID_Fornecedor: item.ID_Fornecedor || '' };
      console.log("[Page] id edição", _editando);

      Cebus.componentes.modalBase.abrir({
        titulo: 'Editar Fornecedor',
        largura: 500,
        conteudo: '<p style="margin-bottom:1rem;font-size:0.85rem;color:var(--cor-texto-secundario);">ID: ' + idDisplay + '</p>' +
          Cebus.componentes.formulario.renderizar({
          id: 'formFornecedor',
          acaoSubmit: 'salvarFornecedor',
          campos: [
            { nome: 'Nome', rotulo: 'Nome', tipo: 'text', obrigatorio: true, valor: item.Nome || item.nome || item.razaoSocial || '' },
            { nome: 'NumeroContrato', rotulo: 'Nº Contrato', tipo: 'text', valor: item.NumeroContrato || item.numeroContrato || '' },
            { nome: 'DataValidade', rotulo: 'Data/Validade', tipo: 'date', id: 'dataFornecedor', classe: 'campo-formulario', obrigatorio: true, valor: _formatarDataISO(item.DataValidade || item.dataValidade || '') },
            { nome: 'TipoProduto', rotulo: 'Tipo de Produto', tipo: 'text', valor: item.TipoProduto || item.tipoProduto || '' },
            { nome: 'Telefone', rotulo: 'Telefone', tipo: 'text', valor: item.Telefone || item.telefone || '', mascara: 'telefone', obrigatorio: true },
            { nome: 'Email', rotulo: 'Email', tipo: 'email', valor: item.Email || item.email || '' },
            { nome: 'CNPJ', rotulo: 'CNPJ', tipo: 'text', valor: item.CNPJ || item.cnpj || '', mascara: 'cnpj', obrigatorio: true },
            { nome: 'Observacoes', rotulo: 'Observações', tipo: 'text', valor: item.Observacoes || item.observacoes || '' },
          ],
        }),
      });
    },

    removerFornecedor: function (el) {
      var id = el.getAttribute('data-id');
      Cebus.notificacoes.confirmar('Remover este fornecedor?').then(function (ok) {
        if (!ok) return;
        var store = Cebus.registrador.obterStore('fornecedores');
        store.remover(id).then(function () {
          Cebus.notificacoes.sucesso('Fornecedor removido!');
          Cebus.roteador.recarregar();
        }).catch(function (err) {
          Cebus.notificacoes.erro('Erro ao excluir fornecedor: ' + (err && err.message ? err.message : 'Permissão negada no Firebase ou erro de rede'));
        });
      });
    },

    paginaAnterior: function () { if (paginacao) paginacao.paginaAnterior(); },
    paginaProxima: function () { if (paginacao) paginacao.proximaPagina(); },
    irParaPagina: function (el) { if (paginacao) paginacao.irParaPagina(parseInt(el.getAttribute('data-pagina'), 10)); },

    recarregarFornecedores: function () {
      Cebus.roteador.recarregar();
    },
  };

  Cebus.registrador.registrarPagina('/fornecedores', pagina);
})();

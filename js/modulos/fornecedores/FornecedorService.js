(function () {
  var repo = Cebus.repositorios.criar('fornecedores');

  var FornecedorService = {
    listar: function () {
      Cebus.servicos.debug.logFluxo('Service', 'listar: fornecedores');
      return repo.listar().then(function (dados) {
        Cebus.servicos.debug.logFluxo('Service', 'retornou ' + dados.length + ' registros');
        Cebus.servicos.log.info('Fornecedores listados', { total: dados.length });
        return dados;
      });
    },

    obterPorId: function (id) {
      return repo.obterPorId(id);
    },

    salvar: function (dados) {
      var validacao = window.FornecedorValidator.validar(dados);
      if (!validacao.valido) {
        Cebus.servicos.log.aviso('Validacao falhou ao salvar fornecedor', validacao.erros);
        return Promise.reject({ tipo: 'validacao', erros: validacao.erros });
      }

      var normalizado = window.FornecedorValidator.normalizar(dados);
      return repo.salvar(normalizado).then(function (item) {
        Cebus.servicos.log.info('Fornecedor salvo', { id: item.id, nome: item.nome });
        Cebus.barramento.emitir('fornecedor:salvo', item);
        return item;
      });
    },

    remover: function (id) {
      return repo.remover(id).then(function () {
        Cebus.servicos.log.info('Fornecedor removido', { id: id });
        Cebus.barramento.emitir('fornecedor:removido', { id: id });
      });
    },

    consultar: function (campo, valor) {
      return repo.consultar(campo, valor);
    }
  };

  window.FornecedorService = FornecedorService;
})();

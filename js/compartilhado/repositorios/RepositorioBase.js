/* ==========================================================================
   ARQUIVO: RepositorioBase.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  Cebus.repositorios = Cebus.repositorios || {};

  function _estaOffline() {
    if (!Cebus.firebase || !Cebus.firebase._inicializado) return true;
    var auth = typeof Cebus.firebase.obterAuth === 'function' ? Cebus.firebase.obterAuth() : null;
    return !auth || !auth.currentUser;
  }

  function _comTimeout(promise, ms, erroMsg) {
    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () {
        reject(new Error(erroMsg || 'Tempo limite excedido na operação'));
      }, ms);

      promise.then(function (res) {
        clearTimeout(timer);
        resolve(res);
      }).catch(function (err) {
        clearTimeout(timer);
        reject(err);
      });
    });
  }

  function RepositorioBase(nomeColecao) {
    this.nomeColecao = nomeColecao;
    this._dados = [];
  }

  RepositorioBase.prototype._obterDadosLocais = function () {
    return Cebus.servicos.armazenamento.obter('repo_' + this.nomeColecao, []);
  };

  RepositorioBase.prototype._salvarDadosLocais = function (dados) {
    this._dados = dados;
    Cebus.servicos.armazenamento.salvar('repo_' + this.nomeColecao, dados);
  };

  RepositorioBase.prototype.listar = function () {
    var self = this;
    Cebus.servicos.debug.logFluxo('Repository', 'listar: ' + this.nomeColecao);
    if (_estaOffline()) {
      Cebus.servicos.debug.logFluxo('Repository', 'offline - dados locais');
      return Promise.resolve(self._obterDadosLocais());
    }
    Cebus.servicos.debug.logFluxo('Repository', 'chamando Firebase');
    var promise = Cebus.firebase.criarRepositorio(this.nomeColecao).listar();
    return _comTimeout(promise, 4000, 'Tempo limite excedido ao ler do Firebase')
      .then(function (dados) {
        Cebus.servicos.debug.logFluxo('Repository', 'Firebase retornou ' + dados.length + ' registros');
        self._salvarDadosLocais(dados);
        return dados;
      });
  };

  RepositorioBase.prototype.obterPorId = function (id) {
    var self = this;
    if (_estaOffline()) {
      var dados = self._obterDadosLocais();
      var item = dados.find(function (d) { return d.id === id; });
      return Promise.resolve(item || null);
    }
    var promise = Cebus.firebase.criarRepositorio(this.nomeColecao).obterPorId(id);
    return _comTimeout(promise, 4000, 'Tempo limite excedido ao ler do Firebase');
  };

  RepositorioBase.prototype.salvar = function (dados) {
    var self = this;
    var registros = self._obterDadosLocais();
    dados.id = dados.id || Cebus.util.gerarId();
    dados.criadoEm = dados.criadoEm || new Date().toISOString();
    dados.atualizadoEm = new Date().toISOString();

    console.log("[Repository] salvar", dados.id);
    var idx = registros.findIndex(function (r) { return r.id === dados.id; });
    console.log("[Repository] findIndex resultado", idx);
    var novosRegistros = registros.slice();
    if (idx >= 0) {
      console.log("[Repository] objeto antes", registros[idx]);
      novosRegistros[idx] = Object.assign({}, novosRegistros[idx], dados);
    } else {
      novosRegistros.push(dados);
    }
    console.log("[Repository] objeto depois", dados);

    if (!_estaOffline()) {
      var repo = Cebus.firebase.criarRepositorio(self.nomeColecao);
      var promise = (idx >= 0)
        ? repo.salvarComId(dados.id, dados)
        : repo.salvar(dados);

      return _comTimeout(promise, 4000, 'Tempo limite excedido ao salvar no Firebase')
        .then(function (syncResult) {
          var finalDados = Object.assign({}, dados, syncResult);
          var finalIdx = novosRegistros.findIndex(function (r) { return r.id === dados.id || r.id === finalDados.id; });
          if (finalIdx >= 0) {
            novosRegistros[finalIdx] = finalDados;
          } else {
            novosRegistros.push(finalDados);
          }
          self._salvarDadosLocais(novosRegistros);
          return finalDados;
        });
    }

    self._salvarDadosLocais(novosRegistros);
    return Promise.resolve(dados);
  };

  RepositorioBase.prototype.salvarComId = function (id, dados) {
    var self = this;
    var dadosComId = Object.assign({}, dados, { id: id });
    dadosComId.atualizadoEm = new Date().toISOString();

    // Atualiza o cache local
    var registros = self._obterDadosLocais();
    var idx = registros.findIndex(function (r) { return r.id === id; });
    var novosRegistros = registros.slice();
    if (idx >= 0) {
      novosRegistros[idx] = Object.assign({}, novosRegistros[idx], dadosComId);
    } else {
      dadosComId.criadoEm = dadosComId.criadoEm || dadosComId.atualizadoEm;
      novosRegistros.push(dadosComId);
    }

    console.log('[Repository] salvarComId', id, '- online:', !_estaOffline());

    if (!_estaOffline()) {
      var promise = Cebus.firebase.criarRepositorio(self.nomeColecao).salvarComId(id, dados);
      return _comTimeout(promise, 4000, 'Tempo limite excedido ao salvarComId no Firebase')
        .then(function (result) {
          self._salvarDadosLocais(novosRegistros);
          return result;
        }).catch(function (e) {
          console.error('[Repository] salvarComId erro Firebase, salvando local:', e);
          self._salvarDadosLocais(novosRegistros);
          return dadosComId;
        });
    }

    self._salvarDadosLocais(novosRegistros);
    return Promise.resolve(dadosComId);
  };

  RepositorioBase.prototype.remover = function (id) {
    var self = this;
    console.log("[Repository] remover", id);
    var registros = self._obterDadosLocais();
    var filtrados = registros.filter(function (r) { return r.id !== id; });

    if (!_estaOffline()) {
      var promise = Cebus.firebase.criarRepositorio(self.nomeColecao).remover(id);
      return _comTimeout(promise, 4000, 'Tempo limite excedido ao remover no Firebase')
        .then(function () {
          self._salvarDadosLocais(filtrados);
        });
    }

    self._salvarDadosLocais(filtrados);
    return Promise.resolve();
  };

  RepositorioBase.prototype.consultar = function (campo, valor) {
    var self = this;
    var dados = self._obterDadosLocais();
    return Promise.resolve(dados.filter(function (d) { return d[campo] === valor; }));
  };

  RepositorioBase.prototype.importar = function (dados) {
    this._salvarDadosLocais(dados);
    return Promise.resolve(dados);
  };

  RepositorioBase.prototype.exportar = function () {
    return Promise.resolve(this._obterDadosLocais());
  };

  Cebus.repositorios.criar = function (nomeColecao) {
    return new RepositorioBase(nomeColecao);
  };
})();

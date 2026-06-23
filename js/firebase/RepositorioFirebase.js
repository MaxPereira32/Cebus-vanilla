/* ==========================================================================
   ARQUIVO: RepositorioFirebase.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  Cebus.firebase = Cebus.firebase || {};

  function Repositorio(colecao) {
    this.colecao = colecao;
    this._db = null;
  }

  Repositorio.prototype._obterDb = function () {
    if (!this._db) this._db = Cebus.firebase.obterDb();
    return this._db;
  };

  // Remove o campo 'id' dos dados antes de gravar no Firestore.
  // O id do documento é controlado pelo Firestore (doc.id), não deve ser armazenado dentro do documento.
  function _limparIdParaFirestore(dados) {
    var copia = Object.assign({}, dados);
    delete copia.id;
    return copia;
  }

  Repositorio.prototype.listar = function () {
    var self = this;
    Cebus.servicos.debug.logFluxo('Firebase', 'listar: ' + this.colecao);
    var db = this._obterDb();
    Cebus.servicos.debug.logFluxo('Firebase', 'db disponivel:', !!db);
    if (!db) {
      Cebus.servicos.debug.logFluxo('Firebase', 'ERRO: db null');
      return Promise.reject(new Error('Firestore db nao inicializado'));
    }
    return db.collection(self.colecao).get()
      .then(function (snap) {
        var dados = [];
        snap.forEach(function (doc) {
          // doc.id (ID do Firestore) vem por último para garantir que sempre prevaleça
          dados.push(Object.assign({}, doc.data(), { id: doc.id }));
        });
        Cebus.servicos.debug.logFluxo('Firebase', 'snap.size=' + snap.size + ', dados=' + dados.length);
        return dados;
      });
  };

  Repositorio.prototype.obterPorId = function (id) {
    var self = this;
    return this._obterDb().collection(self.colecao).doc(id).get()
      .then(function (doc) {
        if (!doc.exists) return null;
        return Object.assign({}, doc.data(), { id: doc.id });
      });
  };

  Repositorio.prototype.salvar = function (dados) {
    var self = this;
    var dadosLimpos = _limparIdParaFirestore(dados);
    console.log("[Firebase] salvar", dadosLimpos);
    var ref = this._obterDb().collection(self.colecao).doc();
    dadosLimpos.criadoEm = new Date().toISOString();
    dadosLimpos.atualizadoEm = dadosLimpos.criadoEm;
    return ref.set(dadosLimpos).then(function () {
      console.log("[Firebase] salvar sucesso", ref.id);
      return Object.assign({}, dadosLimpos, { id: ref.id });
    }).catch(function (e) {
      console.error("[Firebase] erro em salvar", e);
      throw e;
    });
  };

  Repositorio.prototype.salvarComId = function (id, dados) {
    var self = this;
    var dadosLimpos = _limparIdParaFirestore(dados);
    console.log("[Firebase] salvarComId", id, dadosLimpos);
    return this._obterDb().collection(self.colecao).doc(id).get().then(function (doc) {
      dadosLimpos.atualizadoEm = new Date().toISOString();
      if (doc.exists) {
        console.log("[Firebase] salvarComId: doc existe, atualizando");
        console.log("ID enviado para update:", id);
        return self._obterDb().collection(self.colecao).doc(id).update(dadosLimpos).then(function () {
          console.log("[Firebase] salvarComId update sucesso");
          return Object.assign({}, dadosLimpos, { id: id });
        });
      } else {
        console.log("[Firebase] salvarComId: doc nao existe, criando");
        console.log("ID enviado para set:", id);
        dadosLimpos.criadoEm = dadosLimpos.atualizadoEm;
        return self._obterDb().collection(self.colecao).doc(id).set(dadosLimpos).then(function () {
          console.log("[Firebase] salvarComId set sucesso");
          return Object.assign({}, dadosLimpos, { id: id });
        });
      }
    }).catch(function (e) {
      console.error("[Firebase] erro em salvarComId", e);
      throw e;
    });
  };

  Repositorio.prototype.atualizar = function (id, dados) {
    var self = this;
    var dadosLimpos = _limparIdParaFirestore(dados);
    console.log("[Firebase] atualizar", id, dadosLimpos);
    console.log("ID enviado para update:", id);
    dadosLimpos.atualizadoEm = new Date().toISOString();
    return this._obterDb().collection(self.colecao).doc(id).update(dadosLimpos)
      .then(function () {
        console.log("[Firebase] atualizar sucesso");
        return Object.assign({}, dadosLimpos, { id: id });
      }).catch(function (e) {
        console.error("[Firebase] erro em atualizar", e);
        throw e;
      });
  };

  Repositorio.prototype.remover = function (id) {
    var self = this;
    console.log("[Firebase] remover", id);
    return this._obterDb().collection(self.colecao).doc(id).delete()
      .then(function () {
        console.log("[Firebase] remover sucesso");
      }).catch(function (e) {
        console.error("[Firebase] erro em remover", e);
        throw e;
      });
  };

  Repositorio.prototype.consultar = function (campo, operador, valor) {
    var self = this;
    return this._obterDb().collection(self.colecao).where(campo, operador, valor).get()
      .then(function (snap) {
        var dados = [];
        snap.forEach(function (doc) {
          dados.push(Object.assign({}, doc.data(), { id: doc.id }));
        });
        return dados;
      });
  };

  Repositorio.prototype.onChange = function (callback) {
    return this._obterDb().collection(this.colecao).onSnapshot(function (snap) {
      var dados = [];
      snap.forEach(function (doc) {
        dados.push(Object.assign({}, doc.data(), { id: doc.id }));
      });
      callback(dados);
    });
  };

  Cebus.firebase.criarRepositorio = function (colecao) {
    return new Repositorio(colecao);
  };
})();

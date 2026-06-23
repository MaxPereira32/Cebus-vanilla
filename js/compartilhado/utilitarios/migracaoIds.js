(function () {
  Cebus.util = Cebus.util || {};

  function obterDb() {
    return Cebus.firebase.obterDb();
  }

  function migrarColecao(nomeColecao, campoId) {
    var db = obterDb();
    if (!db) return Promise.reject(new Error('Firestore nao inicializado'));
    return db.collection(nomeColecao).get().then(function (snap) {
      var promises = [];
      snap.forEach(function (doc) {
        var dados = doc.data();
        var spaId = dados[campoId];
        if (spaId && doc.id !== spaId) {
          console.log('[Migracao] ' + nomeColecao + ': ' + doc.id + ' -> ' + spaId);
          dados.atualizadoEm = new Date().toISOString();
          promises.push(
            db.collection(nomeColecao).doc(spaId).set(dados).then(function () {
              return db.collection(nomeColecao).doc(doc.id).delete();
            })
          );
        }
      });
      return Promise.all(promises).then(function () {
        console.log('[Migracao] ' + nomeColecao + ': ' + promises.length + ' registros migrados');
        return promises.length;
      });
    });
  }

  Cebus.util.migrarIdsEntradas = function () {
    return migrarColecao('entradas', 'ID_Entrada');
  };

  Cebus.util.migrarIdsSaidas = function () {
    return migrarColecao('saidas', 'ID_Saida');
  };

  Cebus.util.migrarIdsTudo = function () {
    console.log('[Migracao] Iniciando migracao de IDs...');
    return Promise.all([
      Cebus.util.migrarIdsEntradas(),
      Cebus.util.migrarIdsSaidas(),
    ]).then(function (resultados) {
      console.log('[Migracao] Concluido! Entradas=' + resultados[0] + ', Saidas=' + resultados[1]);
      return resultados;
    });
  };
})();

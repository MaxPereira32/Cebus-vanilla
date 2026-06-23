(function () {
  Cebus.firebase = Cebus.firebase || {};

  Cebus.firebase.inicializar = function () {
    if (Cebus.firebase._inicializado) return;

    var config = Cebus.firebase.config || Cebus.config.firebase;
    if (!config || !config.apiKey) {
      console.warn('[Firebase] Configuracao ausente');
      return;
    }

    try {
      if (typeof firebase === 'undefined') {
        console.warn('[Firebase] SDK nao carregado');
        return;
      }
      firebase.initializeApp(config);
      Cebus.firebase.app = firebase.app();
      Cebus.firebase.db = firebase.firestore();
      Cebus.firebase.auth = firebase.auth();

      if (config.usarEmulador) {
        Cebus.firebase.db.settings({ host: 'localhost:8080', ssl: false });
      }

      Cebus.firebase._inicializado = true;
      console.log('[Firebase] Conectado');
    } catch (e) {
      console.error('[Firebase] Erro ao inicializar:', e);
    }
  };

  Cebus.firebase.obterDb = function () { return Cebus.firebase.db; };
  Cebus.firebase.obterAuth = function () { return Cebus.firebase.auth; };
})();

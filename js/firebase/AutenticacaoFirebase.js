(function () {
  Cebus.firebase = Cebus.firebase || {};

  Cebus.firebase.autenticacao = {
    _auth: null,

    inicializar: function () {
      this._auth = Cebus.firebase.obterAuth();
    },

    login: function (email, senha) {
      if (!this._auth) return Promise.reject(new Error('Firebase nao inicializado'));
      return this._auth.signInWithEmailAndPassword(email, senha)
        .then(function (cred) {
          return {
            uid: cred.user.uid,
            email: cred.user.email,
            nome: cred.user.displayName || email.split('@')[0],
          };
        });
    },

    logout: function () {
      if (!this._auth) return Promise.resolve();
      return this._auth.signOut();
    },

    ouvirEstado: function (callback) {
      if (!this._auth) return function () {};
      return this._auth.onAuthStateChanged(function (usuario) {
        if (usuario) {
          callback({
            uid: usuario.uid,
            email: usuario.email,
            nome: usuario.displayName || usuario.email.split('@')[0],
          });
        } else {
          callback(null);
        }
      });
    },

    obterUsuarioAtual: function () {
      if (!this._auth) return null;
      var u = this._auth.currentUser;
      return u ? { uid: u.uid, email: u.email, nome: u.displayName || u.email.split('@')[0] } : null;
    },

    // fallback para modo offline
    loginLocal: function (email, senha) {
      var usuarios = Cebus.servicos.armazenamento.obter('usuarios_locais', []);
      var usuario = usuarios.find(function (u) { return u.email === email && u.senha === senha; });
      if (usuario) {
        return Promise.resolve({ uid: usuario.id, email: usuario.email, nome: usuario.nome, nivel: usuario.nivel });
      }
      return Promise.reject(new Error('Credenciais invalidas'));
    },
  };
})();

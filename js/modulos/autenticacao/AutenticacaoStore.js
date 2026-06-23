(function () {
  function _buscarNivelUsuario(email) {
    if (!email) return Promise.resolve('operador');
    
    // 1. Verificar nos usuarios locais primeiro (caso de fallback/semente local)
    var arm = Cebus.servicos.armazenamento;
    var usuariosLocais = arm.obter('usuarios_locais', []);
    var local = usuariosLocais.find(function (u) {
      return (u.email || '').toLowerCase() === email.toLowerCase();
    });
    if (local) {
      return Promise.resolve(local.nivel || 'operador');
    }

    // 2. Se nao encontrar, verifica no repositorio (Firebase ou repo local)
    var repo = Cebus.repositorios.criar('usuarios');
    return repo.listar().then(function (lista) {
      var usr = lista.find(function (u) {
        var emailCadastrado = u.Email || u.email || '';
        return emailCadastrado.toLowerCase() === email.toLowerCase();
      });
      return usr ? (usr.Nivel || usr.nivel || 'operador') : 'operador';
    }).catch(function () {
      return 'operador';
    });
  }

  var store = Cebus.util.criarStore({
    estadoInicial: {
      usuario: null,
      estaLogado: false,
      nivel: null,
      carregando: false,
      erro: null,
    },
    metodos: function (store, set) {
      return {
        init: function () {
          if (!Cebus.firebase || !Cebus.firebase.autenticacao) return;
          var atual = Cebus.firebase.autenticacao.obterUsuarioAtual();
          if (atual) {
            _buscarNivelUsuario(atual.email).then(function (nivel) {
              set({ usuario: Object.assign({}, atual, { nivel: nivel }), estaLogado: true, nivel: nivel });
            });
          }
          Cebus.firebase.autenticacao.ouvirEstado(function (usuario) {
            if (usuario) {
              _buscarNivelUsuario(usuario.email).then(function (nivel) {
                set({
                  usuario: Object.assign({}, usuario, { nivel: nivel }),
                  estaLogado: true,
                  nivel: nivel,
                  carregando: false,
                  erro: null
                });
              });
            } else {
              set({ usuario: null, estaLogado: false, nivel: null, carregando: false, erro: null });
            }
          });
        },
        login: function (email, senha) {
          set({ carregando: true, erro: null });
          return Cebus.firebase.autenticacao.login(email, senha).then(function (usuario) {
            return _buscarNivelUsuario(usuario.email).then(function (nivel) {
              var usrComp = Object.assign({}, usuario, { nivel: nivel });
              set({ usuario: usrComp, estaLogado: true, nivel: nivel, carregando: false });
              return usrComp;
            });
          }).catch(function (err) {
            return Cebus.firebase.autenticacao.loginLocal(email, senha).then(function (usuario) {
              set({ usuario: usuario, estaLogado: true, nivel: usuario.nivel || 'operador', carregando: false });
              return usuario;
            }).catch(function () {
              set({ erro: 'Credenciais invalidas', carregando: false });
              throw err;
            });
          });
        },
        logout: function () {
          return Cebus.firebase.autenticacao.logout().then(function () {
            set({ usuario: null, estaLogado: false, nivel: null });
          });
        },
        verificarSessao: function () {
          var atual = Cebus.firebase.autenticacao.obterUsuarioAtual();
          if (atual) {
            return _buscarNivelUsuario(atual.email).then(function (nivel) {
              var usrComp = Object.assign({}, atual, { nivel: nivel });
              set({ usuario: usrComp, estaLogado: true, nivel: nivel });
              return usrComp;
            });
          }
          return Promise.resolve(null);
        },
        definirUsuario: function (usuario) {
          set({ usuario: usuario, estaLogado: !!usuario, nivel: usuario ? usuario.nivel || 'operador' : null });
        },
      };
    },
  });

  Cebus.registrador.registrarStore('autenticacao', store);
})();

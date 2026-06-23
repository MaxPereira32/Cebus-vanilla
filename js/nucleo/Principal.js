/* ==========================================================================
   ARQUIVO: Principal.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  'use strict';

  function iniciar() {
    var temaSalvo = Cebus.servicos.armazenamento.obter('tema') || Cebus.config.temaPadrao || 'dark';
    document.documentElement.setAttribute('data-tema', temaSalvo);

    console.log('[Cebus] Inicializando aplicacao...');

    if (typeof Cebus.servicos.debug.habilitar === 'function') {
      Cebus.servicos.debug.habilitar();
    }

    if (typeof Cebus.firebase.inicializar === 'function') {
      Cebus.firebase.inicializar();
    }
    if (typeof Cebus.firebase.autenticacao.inicializar === 'function') {
      Cebus.firebase.autenticacao.inicializar();
    }
    _semearUsuarioPadrao();

    var authStore = Cebus.registrador.obterStore('autenticacao');
    var promessa = authStore && authStore.init ? authStore.init() : Promise.resolve();
    promessa.then(function () {
      Cebus.roteador.iniciar();
    });
    console.log('[Cebus] Aplicacao iniciada com sucesso!');
  }

  function _semearUsuarioPadrao() {
    var arm = Cebus.servicos.armazenamento;
    var usuariosLocais = arm.obter('usuarios_locais', []);
    var jaExiste = usuariosLocais.some(function (u) { return u.email === 'max.softengineer@gmail.com'; });
    if (!jaExiste) {
      usuariosLocais = usuariosLocais.filter(function (u) { return u.email !== 'admin@cebus.com'; });
      usuariosLocais.push({
        id: 'admin-001',
        email: 'max.softengineer@gmail.com',
        senha: '123123',
        nome: 'Max',
        nivel: 'admin',
      });
      arm.salvar('usuarios_locais', usuariosLocais);
      console.log('[Cebus] Usuario local criado: max.softengineer@gmail.com / 123123');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();

/* ==========================================================================
   ARQUIVO: AutenticacaoPagina.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  var pagina = {
    mudarItensPorPagina: function(el) { if (paginacao) paginacao.mudarPorPagina(el.value); },
    antesRenderizar: function () {
      document.title = 'Login - ' + Cebus.config.nomeSistema;
    },

    renderar: function () {
      return '<div class="pagina-login" style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:var(--cor-fundo);padding:1rem;">' +
        '<div class="card-login" style="background:var(--cor-superficie);border-radius:1rem;padding:2.5rem;width:100%;max-width:400px;box-shadow:0 8px 32px rgba(0,0,0,0.1);">' +
          '<div style="text-align:center;margin-bottom:2rem;">' +
            '<div style="width:4rem;height:4rem;border-radius:1rem;background:var(--cor-primaria);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;">' +
              '<i data-lucide="utensils-crossed" size="28" style="color:#fff;"></i>' +
            '</div>' +
            '<h1 style="margin:0;font-size:1.5rem;font-weight:700;color:var(--cor-texto);">' + Cebus.config.nomeSistema + '</h1>' +
            '<p style="margin:0.25rem 0 0;color:var(--cor-texto-secundario);font-size:0.875rem;">' + Cebus.config.descricao + '</p>' +
          '</div>' +

          '<form id="formLogin" data-acao="submeterLogin">' +
            '<div class="campo-formulario" style="margin-bottom:1rem;">' +
              '<label style="display:block;font-size:0.875rem;font-weight:500;color:var(--cor-texto);margin-bottom:0.375rem;">E-mail</label>' +
              '<input type="email" name="email" required placeholder="seu@email.com" style="width:100%;padding:0.75rem;border-radius:0.5rem;border:1px solid var(--cor-borda);background:var(--cor-fundo);color:var(--cor-texto);font-family:inherit;box-sizing:border-box;">' +
            '</div>' +
            '<div class="campo-formulario" style="margin-bottom:1.5rem;">' +
              '<label style="display:block;font-size:0.875rem;font-weight:500;color:var(--cor-texto);margin-bottom:0.375rem;">Senha</label>' +
              '<input type="password" name="senha" required placeholder="Sua senha" style="width:100%;padding:0.75rem;border-radius:0.5rem;border:1px solid var(--cor-borda);background:var(--cor-fundo);color:var(--cor-texto);font-family:inherit;box-sizing:border-box;">' +
            '</div>' +
            '<button type="submit" class="btn btn-primario" style="width:100%;padding:0.75rem;font-size:1rem;">' +
              'Entrar' +
            '</button>' +
          '</form>' +

          '<div id="erroLogin" style="display:none;margin-top:1rem;padding:0.75rem;background:var(--cor-perigo);color:#fff;border-radius:0.5rem;font-size:0.875rem;text-align:center;"></div>' +
        '</div>' +
      '</div>';
    },

    destruir: function () {},

    submeterLogin: function (form, e) {
      e.preventDefault();
      var email = form.querySelector('[name="email"]').value;
      var senha = form.querySelector('[name="senha"]').value;
      var erroEl = document.getElementById('erroLogin');
      var btn = form.querySelector('button[type="submit"]');

      erroEl.style.display = 'none';
      btn.disabled = true;
      btn.textContent = 'Entrando...';

      var store = Cebus.registrador.obterStore('autenticacao');
      store.login(email, senha).then(function () {
        Cebus.roteador.navegar('/painel');
      }).catch(function (err) {
        console.error('[Login] Erro:', err && err.message ? err.message : err);
        erroEl.textContent = (err && err.message === 'Firebase nao inicializado')
          ? 'Servico offline. Tente novamente.'
          : 'Email ou senha incorretos';
        erroEl.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Entrar';
      });
    },
  };

  Cebus.registrador.registrarPagina('/login', pagina);
})();

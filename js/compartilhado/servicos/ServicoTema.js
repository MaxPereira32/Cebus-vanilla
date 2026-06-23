(function () {
  Cebus.servicos = Cebus.servicos || {};

  Cebus.servicos.tema = {
    alternar: function () {
      var atual = document.documentElement.getAttribute('data-tema') || 'dark';
      var novo = atual === 'dark' ? 'white' : 'dark';
      document.documentElement.setAttribute('data-tema', novo);
      Cebus.servicos.armazenamento.salvar('tema', novo);
      return novo;
    },
    definir: function (tema) {
      document.documentElement.setAttribute('data-tema', tema);
      Cebus.servicos.armazenamento.salvar('tema', tema);
    },
    obterAtual: function () {
      return document.documentElement.getAttribute('data-tema') || 'dark';
    },
  };
})();

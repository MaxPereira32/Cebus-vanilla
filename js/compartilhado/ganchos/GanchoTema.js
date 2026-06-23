(function () {
  Cebus.ganchos = Cebus.ganchos || {};

  Cebus.ganchos.tema = {
    alternar: function () {
      return Cebus.servicos.tema.alternar();
    },

    obterAtual: function () {
      return Cebus.servicos.tema.obterAtual();
    },
  };
})();

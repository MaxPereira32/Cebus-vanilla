(function () {
  Cebus.layout = Cebus.layout || {};

  Cebus.layout.renderizar = function (conteudo) {
    return Cebus.layout.cabecalho.renderizar() +
      '<div class="layout-corpo" style="display:flex;flex:1;overflow:hidden;">' +
        Cebus.layout.barraLateral.renderizar() +
        '<main class="conteudo-principal" style="flex:1;overflow-y:auto;padding:1.5rem;background:var(--cor-fundo);">' +
          conteudo +
        '</main>' +
      '</div>';
  };
})();

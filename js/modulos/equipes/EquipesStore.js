/* ==========================================================================
   ARQUIVO: EquipesStore.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  var repo = Cebus.repositorios.criar('equipe');

  var store = Cebus.util.criarStore({
    estadoInicial: { lista: [], carregando: false, itemAtual: null },
    metodos: function (store, set) {
      return {
        carregar: function () {
          set({ carregando: true });
          return repo.listar().then(function (dados) {
            set({ lista: dados, carregando: false });
            return dados;
          });
        },
        salvar: function (dados) {
          return repo.salvar(dados).then(function (item) {
            store.carregar();
            Cebus.barramento.emitir('equipe:salvo', item);
            return item;
          });
        },
        remover: function (id) {
          return repo.remover(id).then(function () {
            store.carregar();
            Cebus.barramento.emitir('equipe:removido', { id: id });
          });
        },
        definirItemAtual: function (item) { set({ itemAtual: item }); },
      };
    },
  });

  Cebus.registrador.registrarStore('equipes', store);
})();

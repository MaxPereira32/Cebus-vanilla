(function () {
  var store = Cebus.util.criarStore({
    estadoInicial: {
      resumo: {
        totalProdutos: 0,
        totalFornecedores: 0,
        totalEntradas: 0,
        totalSaidas: 0,
        movimentosHoje: 0,
        valorEstoque: 0,
      },
      ultimosMovimentos: [],
      produtosBaixoEstoque: [],
    },
    metodos: function (store, set) {
      return {
        carregarResumo: function () {
          set({ resumo: Object.assign({}, store.obterEstado().resumo) });
          
          var hoje = new Date().toISOString().split('T')[0];

          var estaOffline = true;
          if (Cebus.firebase && Cebus.firebase._inicializado) {
            var auth = typeof Cebus.firebase.obterAuth === 'function' ? Cebus.firebase.obterAuth() : null;
            if (auth && auth.currentUser) {
              estaOffline = false;
            }
          }

          if (estaOffline) {
            var arm = Cebus.servicos.armazenamento;
            var prodList = arm.obter('repo_produtos', []);
            var fornList = arm.obter('repo_fornecedores', []);
            var estList = arm.obter('repo_estoque', []);
            var entList = arm.obter('repo_entradas', []);
            var saiList = arm.obter('repo_saidas', []);
            var distList = arm.obter('repo_distribuicoes', []);

            var estoque = estList;
            var entradas = entList.map(function(d) { return { id: d.id, tipo: 'ENTRADA', Data: d.Data, Produto: d.Produto, Quantidade: d.Quantidade }; });
            var saidas = saiList.map(function(d) { return { id: d.id, tipo: 'SAIDA', Data: d.Data, Produto: d.Produto, Quantidade: d.Quantidade }; });
            var dists = distList.map(function(d) { return { id: d.id, tipo: 'DISTRIBUICAO', Data: d.Data, Produto: d.Destino || '-', Quantidade: d.Quantidade }; });

            var entradasHoje = entradas.filter(function (e) { return e.Data === hoje; }).length;
            var saidasHoje = saidas.filter(function (s) { return s.Data === hoje; }).length;
            var distHoje = dists.filter(function (d) { return d.Data === hoje; }).length;

            var baixoEstoque = estoque.filter(function (i) {
              return i.Situacao === 'BAIXO' || i.Situacao === 'ESGOTADO' || (i.Saldo !== undefined && i.Saldo <= 0);
            });

            var valorTotal = 0;
            estoque.forEach(function (i) {
              if (i.Saldo && i.precoVenda) valorTotal += i.Saldo * parseFloat(i.precoVenda);
            });

            var todas = entradas.slice(0, 5).concat(saidas.slice(0, 5)).concat(dists.slice(0, 5));
            todas.sort(function (a, b) {
              if (a.Data !== b.Data) return (b.Data || '').localeCompare(a.Data || '');
              return 0;
            });
            var ultimos = todas.slice(0, 10);

            set({
              resumo: {
                totalProdutos: prodList.length,
                totalFornecedores: fornList.length,
                totalEntradas: entradasHoje,
                totalSaidas: saidasHoje,
                movimentosHoje: entradasHoje + saidasHoje + distHoje,
                valorEstoque: valorTotal,
              },
              ultimosMovimentos: ultimos,
              produtosBaixoEstoque: baixoEstoque.slice(0, 10),
            });
            return;
          }

          var db = Cebus.firebase.obterDb();

          Promise.all([
            db.collection('produtos').get(),
            db.collection('fornecedores').get(),
            db.collection('estoque').get(),
            db.collection('entradas').get(),
            db.collection('saidas').get(),
            db.collection('distribuicoes').get(),
          ]).then(function (results) {
            var prodSnap = results[0], fornSnap = results[1], estSnap = results[2];
            var entSnap = results[3], saiSnap = results[4], distSnap = results[5];

            var estoque = [];
            estSnap.forEach(function (d) { estoque.push(d.data()); });

            var entradas = [];
            entSnap.forEach(function (d) { entradas.push({ id: d.id, tipo: 'ENTRADA', Data: d.data().Data, Produto: d.data().Produto, Quantidade: d.data().Quantidade }); });

            var saidas = [];
            saiSnap.forEach(function (d) { saidas.push({ id: d.id, tipo: 'SAIDA', Data: d.data().Data, Produto: d.data().Produto, Quantidade: d.data().Quantidade }); });

            var dists = [];
            distSnap.forEach(function (d) { dists.push({ id: d.id, tipo: 'DISTRIBUICAO', Data: d.data().Data, Produto: d.data().Destino || '-', Quantidade: d.data().Quantidade }); });

            var entradasHoje = entradas.filter(function (e) { return e.Data === hoje; }).length;
            var saidasHoje = saidas.filter(function (s) { return s.Data === hoje; }).length;
            var distHoje = dists.filter(function (d) { return d.Data === hoje; }).length;

            var baixoEstoque = estoque.filter(function (i) {
              return i.Situacao === 'BAIXO' || i.Situacao === 'ESGOTADO' || (i.Saldo !== undefined && i.Saldo <= 0);
            });

            var valorTotal = 0;
            estoque.forEach(function (i) {
              if (i.Saldo && i.precoVenda) valorTotal += i.Saldo * parseFloat(i.precoVenda);
            });

            var todas = entradas.slice(0, 5).concat(saidas.slice(0, 5)).concat(dists.slice(0, 5));
            todas.sort(function (a, b) {
              if (a.Data !== b.Data) return (b.Data || '').localeCompare(a.Data || '');
              return 0;
            });
            var ultimos = todas.slice(0, 10);

            set({
              resumo: {
                totalProdutos: prodSnap.size,
                totalFornecedores: fornSnap.size,
                totalEntradas: entradasHoje,
                totalSaidas: saidasHoje,
                movimentosHoje: entradasHoje + saidasHoje + distHoje,
                valorEstoque: valorTotal,
              },
              ultimosMovimentos: ultimos,
              produtosBaixoEstoque: baixoEstoque.slice(0, 10),
            });
          }).catch(function (err) {
            console.warn('[Painel] Erro ao carregar dashboard:', err);
          });
        },
        definirResumo: function (parcial) {
          set({ resumo: Object.assign({}, store.obterEstado().resumo, parcial) });
        },
      };
    },
  });

  Cebus.registrador.registrarStore('painel', store);
})();

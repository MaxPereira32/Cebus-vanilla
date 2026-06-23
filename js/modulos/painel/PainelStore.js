/* ==========================================================================
   ARQUIVO: PainelStore.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  var store = Cebus.util.criarStore({
    estadoInicial: {
      resumo: {
        totalProdutos: 0,
        totalEntradasKg: 0,
        totalSaidasKg: 0,
        estoqueTotalKg: 0,
      },
      movimentacoesChartData: { labels: [], entradas: [], saidas: [] },
      categoriasChartData: { labels: [], data: [], colors: [] },
      alertasEstoque: [],
      ultimosProdutos: [],
    },
    metodos: function (store, set) {
      return {
        carregarResumo: function () {
          var hoje = new Date();
          var db = Cebus.firebase && Cebus.firebase.obterDb ? Cebus.firebase.obterDb() : null;

          function processarDados(produtos, estoque, entradas, saidas) {
            var resumo = { totalProdutos: estoque.length, totalEntradasKg: 0, totalSaidasKg: 0, estoqueTotalKg: 0 };
            var ultimosProds = [];
            var alertas = [];
            var porCategoria = {};

            // Entradas e saídas para o total (em Kg/Unidades)
            entradas.forEach(function(e) { resumo.totalEntradasKg += parseFloat(e.Quantidade || e.quantidade || 0); });
            saidas.forEach(function(s) { resumo.totalSaidasKg += parseFloat(s.Quantidade || s.quantidade || 0); });

            // Processar Estoque
            estoque.forEach(function(item) {
              resumo.estoqueTotalKg += parseFloat(item.Saldo || item.saldo || item.quantidade || 0);
              
              var cat = item.Categoria || 'Outros';
              if (!porCategoria[cat]) porCategoria[cat] = 0;
              porCategoria[cat] += parseFloat(item.Saldo || item.saldo || item.quantidade || 0);

              // Alertas
              var saldo = parseFloat(item.Saldo || item.saldo || item.quantidade || 0);
              var sit = item.Situacao || (saldo <= 0 ? 'ESGOTADO' : 'BAIXO');
              if (saldo <= (item.estoqueMinimo || 5)) {
                alertas.push({
                  id: item.id || item.ID_Produto,
                  Produto: item.Produto || item.produto || '-',
                  Saldo: saldo,
                  Unidade: item.Unidade || 'Kg',
                  Situacao: saldo <= 0 ? 'Zerado' : 'Baixo',
                  classe: saldo <= 0 ? 'perigo' : 'aviso'
                });
              }

              // Últimos Produtos (simplificado)
              ultimosProds.push({
                id: item.id || item.ID_Produto,
                ID_Produto: item.ID_Produto || item.id,
                Produto: item.Produto || item.produto || '-',
                Categoria: item.Categoria || 'Alimentos',
                Quantidade: saldo,
                Unidade: item.Unidade || 'Kg',
                UltimaMovimentacao: item.atualizadoEm || item.criadoEm || '-',
                Situacao: saldo > (item.estoqueMinimo || 5) ? 'OK' : 'BAIXO'
              });
            });

            // Ordenar alertas por gravidade (zerados primeiro)
            alertas.sort(function(a, b) { return a.Saldo - b.Saldo; });
            // Últimos produtos (pegar os 5 mais recentes pela data de atualização)
            ultimosProds.sort(function(a, b) { return (b.UltimaMovimentacao || '').localeCompare(a.UltimaMovimentacao || ''); });

            // Dados do gráfico de rosca (Categorias)
            var catLabels = Object.keys(porCategoria);
            var catData = catLabels.map(function(l) { return porCategoria[l]; });
            var catColors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899']; // Verde, Azul, Laranja, Roxo, Rosa

            // Dados do gráfico de linha (Movimentações dos últimos 7 dias)
            var diasLabels = [];
            var dataEntradas = [];
            var dataSaidas = [];
            for (var i = 6; i >= 0; i--) {
              var d = new Date(hoje);
              d.setDate(d.getDate() - i);
              var dataISO = d.toISOString().split('T')[0];
              var formatoDia = d.getDate().toString().padStart(2, '0') + '/' + (d.getMonth() + 1).toString().padStart(2, '0');
              diasLabels.push(formatoDia);
              
              var sumEntrada = 0;
              entradas.forEach(function(e) { if (e.Data === dataISO) sumEntrada += parseFloat(e.Quantidade || e.quantidade || 0); });
              dataEntradas.push(sumEntrada);

              var sumSaida = 0;
              saidas.forEach(function(s) { if (s.Data === dataISO) sumSaida += parseFloat(s.Quantidade || s.quantidade || 0); });
              dataSaidas.push(sumSaida);
            }

            set({
              resumo: resumo,
              alertasEstoque: alertas.slice(0, 3),
              ultimosProdutos: ultimosProds.slice(0, 5),
              movimentacoesChartData: { labels: diasLabels, entradas: dataEntradas, saidas: dataSaidas },
              categoriasChartData: { labels: catLabels, data: catData, colors: catColors }
            });
          }

          if (db && !Cebus.repositorios.criar('estoque')._estaOffline) { // Simplificado para usar Firebase se disponivel
            Promise.all([
              db.collection('produtos').get(),
              db.collection('estoque').get(),
              db.collection('entradas').get(),
              db.collection('saidas').get()
            ]).then(function(results) {
              var produtos = [], estoque = [], entradas = [], saidas = [];
              results[0].forEach(function(d) { produtos.push(d.data()); });
              results[1].forEach(function(d) { var dt = d.data(); dt.id = d.id; estoque.push(dt); });
              results[2].forEach(function(d) { entradas.push(d.data()); });
              results[3].forEach(function(d) { saidas.push(d.data()); });
              processarDados(produtos, estoque, entradas, saidas);
            }).catch(function(e) { console.error('[Painel] Erro ao carregar do Firebase', e); });
          } else {
            // Modo Local
            var arm = Cebus.servicos.armazenamento;
            processarDados(
              arm.obter('repo_produtos', []),
              arm.obter('repo_estoque', []),
              arm.obter('repo_entradas', []),
              arm.obter('repo_saidas', [])
            );
          }
        }
      };
    }
  });

  Cebus.registrador.registrarStore('painel', store);
})();

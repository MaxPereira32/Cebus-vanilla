/* ==========================================================================
   ARQUIVO: ServicoDebug.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  Cebus.servicos = Cebus.servicos || {};

  var grupoAtivo = null;
  var monitorAtivo = false;

  function corDaCamada(camada) {
    return camada === 'Pagina' ? '#8b5cf6' :
      camada === 'Store' ? '#3b82f6' :
      camada === 'Service' ? '#06b6d4' :
      camada === 'Repository' ? '#10b981' :
      camada === 'Firebase' ? '#f59e0b' :
      camada === 'Cache' ? '#ec4899' :
      camada === 'Erro' ? '#ef4444' :
      '#6b7280';
  }

  function iniciarGrupo(camada) {
    if (grupoAtivo) return;
    console.group('%c[Fluxo] ' + camada, 'font-weight:bold;color:#3b82f6;');
    grupoAtivo = camada;
  }

  Cebus.servicos.debug = {
    logFluxo: function (camada, acao, dados) {
      iniciarGrupo(camada);
      console.log('%c[' + camada + ']', 'color:' + corDaCamada(camada) + ';font-weight:600;', acao, dados || '');
    },

    fimFluxo: function () {
      if (grupoAtivo) {
        console.groupEnd();
        grupoAtivo = null;
      }
    },

    fluxoAsync: function (nome, promise) {
      var self = this;
      self.logFluxo('---', 'Async: ' + nome);
      return promise.then(function (res) {
        self.fimFluxo();
        return res;
      }).catch(function (err) {
        console.error('%c[Fluxo] Erro em: ' + nome, 'color:#ef4444;', err);
        self.fimFluxo();
        throw err;
      });
    },

    monitorarRepositorios: function () {
      if (monitorAtivo) return;
      monitorAtivo = true;

      var criarOriginal = Cebus.repositorios.criar;
      Cebus.repositorios.criar = function (nomeColecao) {
        var repo = criarOriginal(nomeColecao);
        var metodos = ['listar', 'obterPorId', 'salvar', 'remover', 'consultar', 'importar', 'exportar'];

        metodos.forEach(function (metodo) {
          var original = repo[metodo];
          if (typeof original !== 'function') return;
          repo[metodo] = function () {
            var args = arguments;
            var nome = nomeColecao;
            var self = this;
            iniciarGrupo('Repository');
            console.log('%c[Repository]', 'color:' + corDaCamada('Repository') + ';font-weight:600;', metodo + ': ' + nome);

            var resultado = original.apply(self, args);

            if (resultado && typeof resultado.then === 'function') {
              return resultado.then(function (dados) {
                console.log('%c[Repository]', 'color:' + corDaCamada('Repository') + ';font-weight:600;', metodo + ' concluido: ' + (dados && dados.length !== undefined ? dados.length + ' registros' : 'ok'));
                return dados;
              }).catch(function (err) {
                console.error('%c[Repository]', 'color:#ef4444;font-weight:600;', metodo + ' ERRO em ' + nome, err && err.message ? err.message : err);
                throw err;
              });
            }
            return resultado;
          };
        });

        return repo;
      };
    },

    monitorarStores: function () {
      var registrarOriginal = Cebus.registrador.registrarStore;
      Cebus.registrador.registrarStore = function (nome, store) {
        if (store && store.carregar) {
          var carregarOriginal = store.carregar;
          store.carregar = function () {
            iniciarGrupo('Store');
            console.log('%c[Store]', 'color:' + corDaCamada('Store') + ';font-weight:600;', 'carregar: ' + nome);
            var p = carregarOriginal.apply(this, arguments);
            if (p && typeof p.then === 'function') {
              return p.then(function (dados) {
                console.log('%c[Store]', 'color:' + corDaCamada('Store') + ';font-weight:600;', 'carregar concluido: ' + nome + ' (' + (dados && dados.length !== undefined ? dados.length + ' registros' : 'ok') + ')');
                if (grupoAtivo) { console.groupEnd(); grupoAtivo = null; }
                return dados;
              }).catch(function (err) {
                console.error('%c[Store]', 'color:#ef4444;font-weight:600;', 'carregar ERRO em ' + nome, err && err.message ? err.message : err);
                if (grupoAtivo) { console.groupEnd(); grupoAtivo = null; }
                throw err;
              });
            }
            return p;
          };
        }
        return registrarOriginal.call(Cebus.registrador, nome, store);
      };
    },

    monitorarFirebase: function () {
      if (!Cebus.firebase || typeof Cebus.firebase.criarRepositorio !== 'function') return;
      var criarOriginal = Cebus.firebase.criarRepositorio;
      Cebus.firebase.criarRepositorio = function (colecao) {
        var repo = criarOriginal(colecao);
        var metodosFB = ['listar', 'salvar', 'salvarComId', 'atualizar', 'remover', 'consultar', 'obterPorId'];

        metodosFB.forEach(function (metodo) {
          var original = repo[metodo];
          if (typeof original !== 'function') return;
          repo[metodo] = function () {
            iniciarGrupo('Firebase');
            console.log('%c[Firebase]', 'color:' + corDaCamada('Firebase') + ';font-weight:600;', metodo + ': ' + colecao);
            return original.apply(this, arguments).then(function (dados) {
              console.log('%c[Firebase]', 'color:' + corDaCamada('Firebase') + ';font-weight:600;', metodo + ' concluido: ' + (dados && dados.length !== undefined ? dados.length + ' registros' : 'ok'));
              if (grupoAtivo) { console.groupEnd(); grupoAtivo = null; }
              return dados;
            }).catch(function (err) {
              console.error('%c[Firebase]', 'color:#ef4444;font-weight:600;', metodo + ' ERRO em ' + colecao, err && err.message ? err.message : err);
              if (grupoAtivo) { console.groupEnd(); grupoAtivo = null; }
              throw err;
            });
          };
        });

        return repo;
      };
    },

    habilitar: function () {
      this.monitorarRepositorios();
      this.monitorarStores();
      this.monitorarFirebase();
    },

    // Reconstrói o estoque lendo todas as entradas e saídas do Firestore.
    // Execute no console: Cebus.servicos.debug.recalcularEstoque()
    recalcularEstoque: function () {
      var db = Cebus.firebase && Cebus.firebase.db;
      if (!db) { console.error('[Recalc] Firestore não disponível'); return; }

      console.group('%c[RECALCULAR ESTOQUE]', 'font-size:14px;font-weight:bold;color:#10b981;');
      console.log('Buscando entradas e saídas no Firestore...');

      function _situacao(saldo, min, max) {
        if (saldo <= 0) return 'ESGOTADO';
        if (min && saldo <= min) return 'BAIXO';
        if (max && saldo > max) return 'EXCEDENTE';
        return 'NORMAL';
      }

      var pEntradas = db.collection('entradas').get();
      var pSaidas   = db.collection('saidas').get();
      var pEstoque  = db.collection('estoque').get();

      Promise.all([pEntradas, pSaidas, pEstoque]).then(function (resultados) {
        var snapEntradas = resultados[0];
        var snapSaidas   = resultados[1];
        var snapEstoque  = resultados[2];

        // Mapa atual do estoque para preservar metadados (estoqueMinimo, Fornecedor, etc.)
        var mapaEstoqueAtual = {};
        snapEstoque.forEach(function (doc) {
          mapaEstoqueAtual[doc.id] = doc.data();
        });

        // Agrupa entradas por produto
        var mapa = {};
        snapEntradas.forEach(function (doc) {
          var d = doc.data();
          var id = d.ID_Produto || d.idProduto;
          if (!id) { console.warn('[Recalc] Entrada sem ID_Produto:', doc.id, d.Produto); return; }
          if (!mapa[id]) {
            mapa[id] = { ID_Produto: id, Produto: d.Produto || d.produto || '', Unidade: d.Unidade || d.unidade || 'UN', Fornecedor: d.Fornecedor || '', EntradaTotal: 0, SaidaTotal: 0 };
          }
          mapa[id].EntradaTotal += parseFloat(d.Quantidade || d.quantidade || 0);
          if (!mapa[id].Fornecedor && d.Fornecedor) mapa[id].Fornecedor = d.Fornecedor;
        });

        // Agrupa saídas por produto
        snapSaidas.forEach(function (doc) {
          var d = doc.data();
          var id = d.ID_Produto || d.idProduto;
          if (!id) { console.warn('[Recalc] Saída sem ID_Produto:', doc.id, d.Produto); return; }
          if (!mapa[id]) {
            mapa[id] = { ID_Produto: id, Produto: d.Produto || d.produto || '', Unidade: d.Unidade || d.unidade || 'UN', Fornecedor: '', EntradaTotal: 0, SaidaTotal: 0 };
          }
          mapa[id].SaidaTotal += parseFloat(d.Quantidade || d.quantidade || 0);
        });

        var ids = Object.keys(mapa);
        console.log('[Recalc] Produtos encontrados:', ids.length);

        if (!ids.length) {
          console.warn('[Recalc] Nenhum produto com ID_Produto nas entradas. Verifique se o campo ID_Produto está preenchido.');
          console.groupEnd();
          return;
        }

        // Salva cada produto no estoque
        var batch = db.batch();
        ids.forEach(function (id) {
          var p = mapa[id];
          var atual = mapaEstoqueAtual[id] || {};
          var saldo = p.EntradaTotal - p.SaidaTotal;
          var novoDoc = {
            ID_Produto:    id,
            Produto:       p.Produto || atual.Produto || '',
            Unidade:       p.Unidade || atual.Unidade || 'UN',
            Fornecedor:    p.Fornecedor || atual.Fornecedor || '',
            EntradaTotal:  p.EntradaTotal,
            SaidaTotal:    p.SaidaTotal,
            Saldo:         saldo,
            quantidade:    saldo,
            estoqueMinimo: atual.estoqueMinimo || 0,
            estoqueMaximo: atual.estoqueMaximo || 999999,
            Situacao:      _situacao(saldo, atual.estoqueMinimo || 0, atual.estoqueMaximo || 999999),
            atualizadoEm:  new Date().toISOString(),
          };
          console.log('  📦', id, '|', novoDoc.Produto, '| Entradas:', novoDoc.EntradaTotal, '| Saídas:', novoDoc.SaidaTotal, '| Saldo:', novoDoc.Saldo);
          batch.set(db.collection('estoque').doc(id), novoDoc, { merge: false });
        });

        return batch.commit().then(function () {
          console.log('%c✅ Estoque recalculado com sucesso! (' + ids.length + ' produtos)', 'color:#10b981;font-weight:bold;font-size:13px;');
          console.log('Recarregue a página de estoque para ver os dados atualizados.');
          console.groupEnd();
        });
      }).catch(function (e) {
        console.error('[Recalc] Erro:', e.message);
        console.groupEnd();
      });
    },


    // Execute no console do browser: Cebus.servicos.debug.diagnosticar()
    diagnosticar: function () {
      console.group('%c[DIAGNÓSTICO CEBUS]', 'font-size:14px;font-weight:bold;color:#8b5cf6;');

      // 1. Firebase inicializado?
      var fbOk = !!(Cebus.firebase && Cebus.firebase._inicializado);
      console.log('%c Firebase inicializado:', 'font-weight:600;', fbOk ? '✅ SIM' : '❌ NÃO');

      // 2. Usuário autenticado?
      var auth = Cebus.firebase && typeof Cebus.firebase.obterAuth === 'function' ? Cebus.firebase.obterAuth() : null;
      var user = auth && auth.currentUser;
      console.log('%c Usuário autenticado:', 'font-weight:600;', user ? '✅ ' + user.email : '❌ NÃO — rodando OFFLINE (dados vêm do localStorage)');

      // 3. Status offline?
      var offline = !fbOk || !user;
      console.log('%c Modo de leitura:', 'font-weight:600;', offline ? '⚠️  OFFLINE (localStorage)' : '✅ ONLINE (Firestore)');

      // 4. Dados locais
      var localEntradas = JSON.parse(localStorage.getItem('repo_entradas') || '[]');
      var localEstoque  = JSON.parse(localStorage.getItem('repo_estoque')  || '[]');
      var localSaidas   = JSON.parse(localStorage.getItem('repo_saidas')   || '[]');
      console.log('%c localStorage entradas:', 'font-weight:600;', localEntradas.length, 'registros');
      console.log('%c localStorage estoque:', 'font-weight:600;',  localEstoque.length,  'registros');
      console.log('%c localStorage saidas:', 'font-weight:600;',   localSaidas.length,   'registros');

      // 5. Se online, busca direto do Firestore para comparar
      if (!offline && Cebus.firebase.db) {
        var db = Cebus.firebase.db;
        var colecoes = ['entradas', 'estoque', 'saidas'];
        colecoes.forEach(function (col) {
          db.collection(col).get().then(function (snap) {
            console.log('%c Firestore ' + col + ':', 'font-weight:600;color:#f59e0b;', snap.size, 'documentos');
            snap.forEach(function (doc) {
              var d = doc.data();
              if (col === 'estoque') {
                console.log('  📦', doc.id, '| Produto:', d.Produto, '| EntradaTotal:', d.EntradaTotal, '| SaidaTotal:', d.SaidaTotal, '| Saldo:', d.Saldo);
              } else if (col === 'entradas') {
                console.log('  ➕', doc.id, '| Produto:', d.Produto, '| Qtd:', d.Quantidade, '| ID_Produto:', d.ID_Produto);
              } else {
                console.log('  ➖', doc.id, '| Produto:', d.Produto, '| Qtd:', d.Quantidade, '| ID_Produto:', d.ID_Produto);
              }
            });
          }).catch(function (e) {
            console.error('%c Firestore ' + col + ' ERRO:', 'color:#ef4444;', e.message);
          });
        });
      } else if (offline) {
        console.warn('%c ⚠️  ATENÇÃO: sem usuário autenticado — os repositórios usam APENAS localStorage. Nenhum dado é lido/gravado no Firestore enquanto _estaOffline() === true.', 'color:#f59e0b;font-weight:600;');
      }

      console.groupEnd();
    },

  };

  console.log('[Cebus] ServicoDebug carregado');
})();

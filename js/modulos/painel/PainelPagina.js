/* ==========================================================================
   ARQUIVO: PainelPagina.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  var pagina = {
    mudarItensPorPagina: function(el) { if (paginacao) paginacao.mudarPorPagina(el.value); },
    css: `
      .painel-header { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 2rem; }
      .painel-header h1 { font-size: 1.5rem; font-weight: 700; color: var(--cor-texto); margin: 0; }
      .painel-header p { font-size: 0.9rem; color: var(--cor-texto-secundario); margin: 0; }
      
      .grid-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
      .card-resumo { 
        background: var(--cor-superficie); 
        border-radius: 1.5rem; 
        padding: 1.25rem; 
        display: flex; align-items: center; gap: 1rem; 
        box-shadow: var(--neu-elevated);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        border: none;
      }
      .card-resumo:hover { transform: translateY(-3px); }
      .card-resumo:active { box-shadow: var(--neu-pressed); transform: translateY(0); }
      
      .card-icone { 
        width: 42px; height: 42px; 
        border-radius: 14px; 
        display: flex; align-items: center; justify-content: center; 
        background: var(--cor-superficie);
        box-shadow: var(--neu-elevated);
      }
      .card-info { display: flex; flex-direction: column; gap: 0.25rem; }
      .card-info span { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--cor-texto-secundario); letter-spacing: 0.05em; }
      .card-info strong { font-size: 1.5rem; font-weight: 700; color: var(--cor-texto); line-height: 1; }
      .card-info small { font-size: 0.75rem; font-weight: 600; } 
      
      .grid-meio { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
      .card-dashboard { 
        background: var(--cor-superficie); 
        border: none; 
        border-radius: 1.5rem; 
        padding: 1.5rem; 
        display: flex; flex-direction: column;
        box-shadow: var(--neu-elevated);
      }
      .card-dashboard h3 { font-size: 1rem; font-weight: 600; color: var(--cor-texto); margin: 0 0 1.5rem 0; }
      
      .alerta-item { 
        display: flex; align-items: center; justify-content: space-between; 
        padding: 0.75rem; border-radius: 0.75rem; margin-bottom: 0.75rem;
        box-shadow: var(--neu-pressed);
        background: var(--cor-fundo);
      }
      .alerta-item:last-child { margin-bottom: 0; }
      .alerta-info { display: flex; align-items: center; gap: 0.75rem; }
      .alerta-icone { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 10px; background: var(--cor-superficie); box-shadow: var(--neu-elevated); }
      .alerta-textos { display: flex; flex-direction: column; gap: 0.1rem; }
      .alerta-textos span { font-size: 0.85rem; font-weight: 600; color: var(--cor-texto); }
      .alerta-textos small { font-size: 0.75rem; color: var(--cor-texto-secundario); }
      .alerta-qtd { font-size: 0.8rem; font-weight: 600; }
      .link-ver-todos { font-size: 0.8rem; color: var(--cor-primaria); text-decoration: none; display: inline-flex; align-items: center; gap: 0.25rem; align-self: flex-end; margin-top: auto; padding-top: 1rem; font-weight: 600; }
      
      /* Agenda e Calendario */
      .grid-calendario-agenda { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
      
      .agenda-item-card {
        border-radius: 1.25rem; background: var(--cor-fundo); padding: 10px 12px;
        box-shadow: var(--neu-pressed); display: flex; gap: 1rem; align-items: center; margin-bottom: 0.75rem;
      }
      .agenda-date-badge {
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        min-width: 48px; height: 48px; border-radius: 14px; font-weight: 800;
        background: var(--cor-superficie); box-shadow: var(--neu-elevated); line-height: 1.2;
      }
      .agenda-date-badge span { font-size: 0.7rem; text-transform: uppercase; color: var(--cor-texto-secundario); font-weight: 600; }
      .agenda-date-badge strong { font-size: 1rem; color: var(--cor-primaria); }
      .agenda-content { display: flex; flex-direction: column; }
      .agenda-content strong { font-size: 0.85rem; color: var(--cor-texto); }
      .agenda-content small { font-size: 0.75rem; color: var(--cor-texto-secundario); }

      .calendario-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem; margin-top: 1rem; }
      .cal-dia-header { text-align: center; font-size: 0.7rem; font-weight: 700; color: var(--cor-texto-secundario); text-transform: uppercase; }
      .cal-dia { 
        height: 38px; display: flex; align-items: center; justify-content: center; 
        border-radius: 12px; font-size: 0.8rem; font-weight: 600; color: var(--cor-texto);
        background: var(--cor-fundo); box-shadow: var(--neu-pressed); cursor: pointer; transition: all 0.2s;
      }
      .cal-dia:hover { transform: translateY(-2px); box-shadow: var(--neu-elevated); }
      .cal-dia.hoje { color: var(--cor-primaria); font-weight: 800; background: var(--cor-superficie); box-shadow: var(--neu-elevated); border: 2px solid var(--cor-hover); }
      .cal-dia.has-event { position: relative; }
      .cal-dia.has-event::after { content: ''; position: absolute; bottom: 4px; width: 4px; height: 4px; background: var(--cor-primaria); border-radius: 50%; }
      .cal-dia.empty { background: transparent; box-shadow: none; cursor: default; }
      
      .tabela-ultimos { width: 100%; border-collapse: collapse; }
      .tabela-ultimos th { text-align: left; padding: 0.75rem 1rem; font-size: 0.75rem; font-weight: 600; color: var(--cor-texto-secundario); text-transform: uppercase; border-bottom: 1px solid var(--cor-borda); }
      .tabela-ultimos td { padding: 1rem; font-size: 0.85rem; color: var(--cor-texto); border-bottom: 1px solid var(--cor-borda); }
      .tabela-ultimos tr:last-child td { border-bottom: none; }
      
      .dashboard-layout { display: grid; grid-template-columns: 2.3fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
      .coluna-principal { display: flex; flex-direction: column; gap: 1.5rem; }
      .coluna-lateral { display: flex; flex-direction: column; gap: 1.5rem; }
      .grid-graficos { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
      
      @media (max-width: 1200px) { .grid-cards { grid-template-columns: repeat(2, 1fr); } .dashboard-layout { grid-template-columns: 1fr; } }
      @media (max-width: 768px) { .grid-cards { grid-template-columns: 1fr; } .grid-graficos { grid-template-columns: 1fr; } }
    `,

    antesRenderizar: function () {
      document.title = 'Dashboard - ' + Cebus.config.nomeSistema;
      var store = Cebus.registrador.obterStore('painel');
      if (store && store.carregarResumo) store.carregarResumo();
    },

    renderar: function () {
      var store = Cebus.registrador.obterStore('painel');
      var estado = store ? store.obterEstado() : {};
      var resumo = estado.resumo || {};
      var alertas = estado.alertasEstoque || [];
      var produtos = estado.ultimosProdutos || [];

      var conteudo = `
        <div class="grid-cards">
          <div class="card-resumo">
            <div class="card-icone" style="color: #10b981;">
              <i data-lucide="package"></i>
            </div>
            <div class="card-info">
              <span>Produtos Cadastrados</span>
              <strong>${resumo.totalProdutos || 0}</strong>
              <small>+8 este mês</small>
            </div>
          </div>
          <div class="card-resumo">
            <div class="card-icone" style="color: #3b82f6;">
              <i data-lucide="arrow-down-to-line"></i>
            </div>
            <div class="card-info">
              <span>Entradas (Kg)</span>
              <strong>${resumo.totalEntradasKg || 0}</strong>
              <small style="color: #3b82f6;">+12% este mês</small>
            </div>
          </div>
          <div class="card-resumo">
            <div class="card-icone" style="color: #f59e0b;">
              <i data-lucide="arrow-up-from-line"></i>
            </div>
            <div class="card-info">
              <span>Saídas (Kg)</span>
              <strong>${resumo.totalSaidasKg || 0}</strong>
              <small style="color: #f59e0b;">-5% este mês</small>
            </div>
          </div>
          <div class="card-resumo">
            <div class="card-icone" style="color: #8b5cf6;">
              <i data-lucide="layers"></i>
            </div>
            <div class="card-info">
              <span>Estoque Total (Kg)</span>
              <strong>${resumo.estoqueTotalKg || 0}</strong>
              <small style="color: var(--cor-texto-secundario);">Total em estoque</small>
            </div>
          </div>
        </div>

        <div class="dashboard-layout">
          <div class="coluna-principal">
            <div class="grid-graficos">
              <div class="card-dashboard">
                <h3>Movimentações (Kg)</h3>
                <div style="flex: 1; min-height: 250px; position: relative;">
                  <canvas id="chartMovimentacoes"></canvas>
                </div>
              </div>
              <div class="card-dashboard">
                <h3>Estoque por Categoria (Kg)</h3>
                <div style="flex: 1; display: flex; align-items: center; justify-content: center; position: relative; min-height: 250px;">
                  <canvas id="chartCategorias"></canvas>
                </div>
              </div>
            </div>

            <div class="card-dashboard">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="margin: 0;">Últimos Produtos</h3>
                <button class="btn btn-pequeno btn-secundario" onclick="Cebus.roteador.navegar('/estoque');">Ver todos os produtos</button>
              </div>
              <div style="overflow-x: auto;">
                <table class="tabela-ultimos">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Produto</th>
                      <th>Categoria</th>
                      <th>Quantidade</th>
                      <th>Unidade</th>
                      <th>Situação</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${produtos.length ? produtos.map(p => `
                      <tr>
                        <td style="font-family: monospace; color: var(--cor-texto-secundario);">${p.ID_Produto}</td>
                        <td style="font-weight: 500;">${p.Produto}</td>
                        <td>${p.Categoria}</td>
                        <td style="color: #10b981; font-weight: 600;">${p.Quantidade}</td>
                        <td>${p.Unidade}</td>
                        <td><span class="badge ${p.Situacao === 'OK' ? 'badge-sucesso' : 'badge-perigo'}" style="font-size:0.7rem;">${p.Situacao}</span></td>
                        <td>
                          <button class="btn btn-pequeno btn-secundario" title="Visualizar" style="padding: 0.25rem 0.5rem;"><i data-lucide="eye" style="width:1rem;height:1rem;"></i></button>
                        </td>
                      </tr>
                    `).join('') : '<tr><td colspan="7" style="text-align:center; color:var(--cor-texto-secundario);">Nenhum produto cadastrado.</td></tr>'}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="coluna-lateral">
            <div class="card-dashboard">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="margin: 0;">Calendário</h3>
                <span style="font-size:0.8rem; color:var(--cor-texto-secundario); font-weight:600;">JUNHO</span>
              </div>
              <div class="calendario-grid">
                <div class="cal-dia-header">Dom</div><div class="cal-dia-header">Seg</div><div class="cal-dia-header">Ter</div><div class="cal-dia-header">Qua</div><div class="cal-dia-header">Qui</div><div class="cal-dia-header">Sex</div><div class="cal-dia-header">Sáb</div>
                <div class="cal-dia empty"></div>
                <div class="cal-dia">1</div><div class="cal-dia">2</div><div class="cal-dia">3</div><div class="cal-dia">4</div><div class="cal-dia">5</div><div class="cal-dia">6</div>
                <div class="cal-dia">7</div><div class="cal-dia">8</div><div class="cal-dia">9</div><div class="cal-dia">10</div><div class="cal-dia">11</div><div class="cal-dia">12</div><div class="cal-dia">13</div>
                <div class="cal-dia">14</div><div class="cal-dia has-event">15</div><div class="cal-dia">16</div><div class="cal-dia">17</div><div class="cal-dia">18</div><div class="cal-dia">19</div><div class="cal-dia">20</div>
                <div class="cal-dia">21</div><div class="cal-dia">22</div><div class="cal-dia hoje has-event">23</div><div class="cal-dia">24</div><div class="cal-dia">25</div><div class="cal-dia">26</div><div class="cal-dia">27</div>
                <div class="cal-dia">28</div><div class="cal-dia">29</div><div class="cal-dia">30</div>
                <div class="cal-dia empty"></div><div class="cal-dia empty"></div><div class="cal-dia empty"></div><div class="cal-dia empty"></div>
              </div>
            </div>

            <div class="card-dashboard">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="margin: 0;">Agenda Rápida</h3>
                <button class="btn-icone" title="Nova Tarefa"><i data-lucide="plus" style="width:1.2rem;height:1.2rem;"></i></button>
              </div>
              <div style="flex: 1; display: flex; flex-direction: column;">
                <div class="agenda-item-card">
                  <div class="agenda-date-badge"><span>Jun</span><strong>23</strong></div>
                  <div class="agenda-content">
                    <strong>Revisão de Estoque Crítico</strong>
                    <small><i data-lucide="clock" style="width:10px;height:10px;display:inline;"></i> 14:00 - Equipe B</small>
                  </div>
                </div>
                <div class="agenda-item-card">
                  <div class="agenda-date-badge"><span>Jun</span><strong>23</strong></div>
                  <div class="agenda-content">
                    <strong>Entrega Fornecedores</strong>
                    <small><i data-lucide="truck" style="width:10px;height:10px;display:inline;"></i> 16:30 - Doca Principal</small>
                  </div>
                </div>
                <div class="agenda-item-card">
                  <div class="agenda-date-badge"><span>Jun</span><strong>25</strong></div>
                  <div class="agenda-content">
                    <strong>Auditoria Mensal</strong>
                    <small><i data-lucide="file-text" style="width:10px;height:10px;display:inline;"></i> 09:00 - Administração</small>
                  </div>
                </div>
              </div>
            </div>

            <div class="card-dashboard">
              <h3>Alertas de Estoque</h3>
              <div style="flex: 1; display: flex; flex-direction: column;">
                ${alertas.length ? alertas.map(a => `
                  <div class="alerta-item">
                    <div class="alerta-info">
                      <div class="alerta-icone" style="color: ${a.classe === 'perigo' ? '#ef4444' : '#f59e0b'};">
                        <i data-lucide="${a.classe === 'perigo' ? 'alert-circle' : 'alert-triangle'}" style="width:1.2rem;height:1.2rem;"></i>
                      </div>
                      <div class="alerta-textos">
                        <span>Estoque ${a.Situacao.toLowerCase()}</span>
                        <small>${a.Produto}</small>
                      </div>
                    </div>
                    <div class="alerta-qtd" style="color: ${a.classe === 'perigo' ? '#ef4444' : '#f59e0b'};">
                      ${a.Saldo <= 0 ? 'Sem estoque' : a.Saldo + ' restantes'}
                    </div>
                  </div>
                `).join('') : '<p style="color:var(--cor-texto-secundario);font-size:0.85rem;">Nenhum alerta.</p>'}
                <a href="#/estoque" class="link-ver-todos" onclick="Cebus.roteador.navegar('/estoque'); return false;">Ver todos <i data-lucide="arrow-right" style="width:1rem;height:1rem;"></i></a>
              </div>
            </div>
          </div>
        </div>
      `;

      return Cebus.layout.renderizar(conteudo);
    },

    depoisRenderizar: function () {
      if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();

      // Renderizar Gráficos
      var store = Cebus.registrador.obterStore('painel');
      var estado = store ? store.obterEstado() : {};

      if (typeof Chart !== 'undefined') {
        Chart.defaults.color = '#9ca3af';
        Chart.defaults.font.family = 'Inter, sans-serif';
        
        // Gráfico de Linha (Movimentações)
        var ctxMov = document.getElementById('chartMovimentacoes');
        if (ctxMov && estado.movimentacoesChartData && estado.movimentacoesChartData.labels.length) {
          new Chart(ctxMov, {
            type: 'line',
            data: {
              labels: estado.movimentacoesChartData.labels,
              datasets: [
                {
                  label: 'Entradas',
                  data: estado.movimentacoesChartData.entradas,
                  borderColor: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderWidth: 2,
                  tension: 0.4,
                  fill: true
                },
                {
                  label: 'Saídas',
                  data: estado.movimentacoesChartData.saidas,
                  borderColor: '#3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderWidth: 2,
                  tension: 0.4,
                  fill: true
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } }
              },
              scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' }, border: { display: false } },
                x: { grid: { display: false }, border: { display: false } }
              }
            }
          });
        }

        // Gráfico de Rosca (Categorias)
        var ctxCat = document.getElementById('chartCategorias');
        if (ctxCat && estado.categoriasChartData && estado.categoriasChartData.labels.length) {
          new Chart(ctxCat, {
            type: 'doughnut',
            data: {
              labels: estado.categoriasChartData.labels,
              datasets: [{
                data: estado.categoriasChartData.data,
                backgroundColor: estado.categoriasChartData.colors,
                borderWidth: 0,
                hoverOffset: 4
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              cutout: '70%',
              plugins: {
                legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 8, padding: 20 } }
              }
            }
          });
        }
      }
    },

    destruir: function () {},
  };

  Cebus.registrador.registrarPagina('/painel', pagina);
})();

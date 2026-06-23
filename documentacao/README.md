# Cebus (Estoque Kitchen)

Sistema web de gestão de estoque para cozinhas profissionais. Aplicação SPA (Single Page Application) em JavaScript puro (vanilla) com Firebase opcional.

---

## Índice

1. [Visão Geral](#vis%C3%A3o-geral)
2. [Arquitetura](#arquitetura)
3. [Namespace Cebus](#namespace-cebus)
4. [Fluxo de Inicialização](#fluxo-de-inicializa%C3%A7%C3%A3o)
5. [Sistema de Roteamento](#sistema-de-roteamento)
6. [Sistema de Ações (data-acao)](#sistema-de-a%C3%A7%C3%B5es-data-acao)
7. [Ciclo de Vida das Páginas](#ciclo-de-vida-das-p%C3%A1ginas)
8. [Estrutura de Diretórios](#estrutura-de-diret%C3%B3rios)
9. [Documentação de Cada Arquivo](#documenta%C3%A7%C3%A3o-de-cada-arquivo)
   - [Configuração](#configura%C3%A7%C3%A3o)
   - [Núcleo](#n%C3%BAcleo)
   - [Firebase](#firebase)
   - [Compartilhado](#compartilhado)
   - [Módulos](#m%C3%B3dulos)
10. [Fluxo de Dados](#fluxo-de-dados)
11. [Sistema de Eventos](#sistema-de-eventos)
12. [Estratégia Offline-First](#estrat%C3%A9gia-offline-first)
13. [Ferramentas de Debug](#ferramentas-de-debug)
14. [Como Criar um Novo Módulo](#como-criar-um-novo-m%C3%B3dulo)
15. [CSS e Temas](#css-e-temas)
16. [Tecnologias](#tecnologias)

---

## Visão Geral

**Cebus** é um SPA voltado ao controle de insumos, entradas, saídas, distribuição e movimentações de estoque em cozinhas profissionais. Opera com um namespace global `window.Cebus` e carregamento dinâmico de scripts por rota.

### Funcionalidades Principais

- Gestão de fornecedores, equipes
- Controle de entradas, saídas, distribuição e movimentações
- Estoque com atualização automática de saldos
- Dashboard com indicadores (KPIs)
- Consultas e relatórios
- Administração de usuários com níveis de permissão
- Logs de auditoria
- Tema claro/escuro
- Autenticação via Firebase ou local (fallback offline)
- Persistência local via `localStorage` com sincronização opcional ao Firebase
- Exportação CSV/JSON
- Backup completo do sistema

---

## Arquitetura

A arquitetura segue o padrão de **namespace global** (`Cebus`) com subnamespaces para cada camada. Nenhum framework ou bundler é utilizado — todo o código é JavaScript vanilla (ES5/ES6).

### Princípios

- **Vanilla JS** (sem frameworks ou bundlers)
- **Carregamento sob demanda** via injeção de `<script>` no DOM
- **Roteamento por hash** (`#/rota`)
- **Offline-first**: dados salvos em `localStorage`; Firebase usado como sync opcional
- **Namespace único** `Cebus` evita poluição global
- **Separação Store + Página**: cada módulo separa estado/negócio (Store) da interface (Página)
- **Níveis de acesso**: admin, gerente, operador, consulta
- **Comunicação entre módulos**: via barramento de eventos pub/sub

---

## Namespace Cebus

```
window.Cebus
├── .config                  # Configurações globais
│   ├── nomeSistema          # "Estoque Kitchen"
│   ├── nomeCurto            # "Cebus"
│   ├── versao               # "1.0.0"
│   ├── temaPadrao           # "dark"
│   ├── itensPorPagina       # 20
│   ├── animacoesAtivadas    # true
│   ├── rotas[]              # Array de {caminho, rotulo, icone, auth}
│   ├── modulos              # {mapeamento: {rota: {store, pagina, deps[]}}, caminhoBase}
│   └── tema                 # Opções de tema (['dark', 'white'])
│
├── .registrador             # Registro central (Inicializador)
│   ├── paginas              # {rota: paginaObj}
│   ├── stores               # {nome: storeObj}
│   ├── repositorios         # repositórios registrados
│   ├── servicos             # serviços registrados
│   ├── modulos              # módulos registrados
│   ├── registrarPagina(rota, pagina)
│   ├── registrarStore(nome, store)
│   ├── registrarModulo(nome, config)
│   ├── obterPagina(rota)
│   └── obterStore(nome)
│
├── .roteador                # Roteador hash-based
│   ├── iniciar()
│   ├── navegar(caminho)
│   ├── recarregar()
│   ├── resolver()
│   ├── obterPaginaAtual()
│   └── obterRotaAtual()
│
├── .gerenciadorPaginas      # Gerenciador de ciclo de vida
│   ├── renderizarAsync(caminho, params, pagina, root)
│   ├── destruirAtual()
│   ├── obterAtual()
│   ├── obterNomeAtual()
│   ├── adicionarTimer(id)
│   ├── adicionarIntervalo(id)
│   └── adicionarListener(removerFn)
│
├── .barramento              # Event Bus (pub/sub)
│   ├── emitir(nome, dados)
│   ├── on(nome, fn)
│   ├── off(nome, fn)
│   └── limpar(nome)
│
├── .carregador              # Carregador dinâmico de scripts
│   ├── carregarScript(caminho)
│   ├── carregarScripts(caminhos[])
│   ├── carregarCSS(caminho)
│   ├── carregarModulo(caminhoBase)
│   ├── registrarCache(caminho)
│   ├── jaCarregado(caminho)
│   └── limparCache()
│
├── .componentes             # Componentes reutilizáveis
│   ├── modal                # Modal compartilhado (abrir, fechar, definirConteudo)
│   ├── modalBase            # Modal base para extensão
│   ├── formulario           # Construtor dinâmico de formulários
│   └── tabelaDinamica       # Renderizador de tabelas dinâmicas
│
├── .layout                  # Componentes de layout
│   ├── cabecalho            # Cabeçalho do app
│   ├── barraLateral         # Menu de navegação lateral
│   ├── layout               # Compositor do layout completo
│   └── painelAcoes          # Barra de título + ações
│
├── .notificacoes            # Sistema de notificações
│   ├── sucesso(msg)
│   ├── erro(msg)
│   ├── aviso(msg)
│   ├── info(msg)
│   └── confirmar(msg)       # Retorna Promise<boolean>
│
├── .servicos                # Serviços do sistema
│   ├── armazenamento        # localStorage wrapper (salvar, obter, remover, limpar)
│   ├── tema                 # Alternância de tema (alternar, definir, obterAtual)
│   ├── exportacao           # Exportar CSV/JSON (exportarCSV, exportarJSON)
│   ├── backup               # Backup completo (exportarCompleto, importar)
│   ├── log                  # Logging estruturado (info, aviso, erro)
│   └── debug                # Debug mode (habilitar, logFluxo, fimFluxo)
│
├── .ganchos                 # Facades para operações comuns
│   ├── autenticacao         # login, logout, verificarSessao
│   └── tema                 # alternar, obterAtual
│
├── .constantes              # Constantes do sistema
│   ├── rotas                # Nomes das rotas
│   ├── situacoes            # Status (ativo, inativo, pendente, etc.)
│   ├── permissoes           # Níveis (admin, gerente, operador, consulta)
│   └── colecoes             # Nomes das coleções Firestore
│
├── .widgets                 # Widgets reutilizáveis
│   └── cartaoResumo         # Cartão de resumo (KPI card)
│
├── .interceptadores         # Interceptadores de rota
│   ├── verificarAutenticacao# Redireciona para /login se não autenticado
│   ├── verificarPermissao   # Bloqueia rotas admin para não-admin
│   └── registrarNavegacao   # Loga navegação do usuário
│
├── .cache                   # Caches
│   ├── rotas                # Cache de dados de rota
│   └── estilos              # Cache de CSS injetado
│
├── .util                    # Utilitários
│   ├── criarStore(opcoes)   # Fábrica de stores reativas
│   ├── usePaginacao(opcoes) # Hook de paginação
│   ├── useBusca(opcoes)     # Hook de busca com debounce
│   ├── formatarData()       # Formatação de datas
│   ├── gerarId()            # Geração de IDs
│   ├── gerarIdCurto()       # Geração de IDs curtos
│   ├── aplicarMascara()     # Máscaras de input
│   ├── salvarCache()        # Atalho para armazenamento.salvar
│   └── obterCache()         # Atalho para armazenamento.obter
│
├── .firebase                # Camada Firebase
│   ├── _inicializado        # Flag de inicialização
│   ├── inicializar()
│   ├── obterAuth()
│   ├── criarRepositorio()   # Factory de repositórios Firestore
│   └── autenticacao         # login, logout, ouvirEstado, obterUsuarioAtual, loginLocal
│
├── .repositorios            # Repositórios (dados)
│   └── criar(nomeColecao)   # Factory de RepositorioBase
│
└── .estado                  # Atalho para todas as stores registradas
    └── (nome)               # Igual a registrador.stores[nome]
```

---

## Fluxo de Inicialização

```
1. index.html carrega scripts na ordem sequencial:

   CDNs:
   ├── Firebase (App, Firestore, Auth) — v8.10.1
   └── Lucide Icons

   CSS:
   ├── reset.css
   ├── temas.css (variáveis CSS para dark/white)
   ├── animacoes.css (keyframes: fadeIn, slideUp, scaleIn, slideDown)
   └── componentes.css (todos os estilos da aplicação)

   JavaScript (ordem rigorosa):
   ├── configuracao/configApp.js
   ├── configuracao/configFirebase.js
   ├── configuracao/configRotas.js
   ├── configuracao/configModulos.js
   ├── configuracao/configTema.js
   │
   ├── js/nucleo/Inicializador.js       ← Cria Cebus.registrador
   ├── js/nucleo/FabricaEstado.js       ← Cria Cebus.util.criarStore()
   ├── js/nucleo/BarramentoEventos.js   ← Cria Cebus.barramento
   ├── js/nucleo/CarregadorDinamico.js  ← Cria Cebus.carregador
   ├── js/nucleo/ModalBase.js           ← Cria Cebus.componentes.modalBase
   ├── js/nucleo/GerenciadorPaginas.js  ← Cria Cebus.gerenciadorPaginas
   │
   ├── constantes (Rotas, Situacoes, Permissoes, Colecoes)
   ├── utilitários (datas, ids, mascaras)
   ├── ServicoArmazenamento.js
   ├── ServicoTema.js
   ├── ServicoExportacao.js
   ├── ServicoBackup.js
   ├── ServicoLog.js
   ├── ServicoDebug.js
   │
   ├── Componentes (Modal, Formulario, TabelaDinamica)
   ├── Layout (Cabecalho, BarraLateral, Layout, PainelAcoes)
   ├── Notificações (Notificacao, Confirmacao)
   ├── Widgets (CartaoResumo)
   ├── Ganchos (GanchoAutenticacao, GanchoTema)
   │
   ├── Firebase (index, ConexaoFirebase, AutenticacaoFirebase, RepositorioFirebase)
   ├── RepositorioBase.js
   │
   ├── Módulo de autenticação (AutenticacaoStore, AutenticacaoPagina)
   ├── Interceptadores
   ├── Hooks (usePaginacao, useBusca)
   ├── Caches (CacheRotas, CacheEstilos)
   │
   ├── Roteador.js                       ← Cria Cebus.roteador
   └── Principal.js                      ← Bootstrap final

2. Principal.iniciar() (executa no DOMContentLoaded):
   a. Aplica tema salvo (localStorage > configPadrao)
   b. Habilita debug mode (se disponível)
   c. Inicializa Firebase (se credenciais configuradas)
   d. Inicializa autenticação Firebase
   e. Inicializa store de autenticação
   f. Cria usuário padrão local (max.softengineer@gmail.com / 123123)
   g. Inicia roteador (setTimeout 100ms)

3. Roteador.iniciar():
   a. Adiciona listener para hashchange
   b. Resolve rota atual (hash ou /login como fallback)

4. Roteador.resolver():
   a. Lê hash da URL (window.location.hash)
   b. Extrai caminho e query params (?chave=valor)
   c. Ignora se mesma rota já carregada (cache)
   d. Verifica se módulo já foi carregado
   e. Se não, CarregadorDinamico carrega scripts (deps, store, pagina)
   f. Executa interceptadores em ordem:
      1. verificarAutenticacao
      2. verificarPermissao
      3. registrarNavegacao
   g. GerenciadorPaginas.renderizarAsync() executa o ciclo de vida
```

---

## Sistema de Roteamento

### Resolução de Rotas

O roteador é baseado em hash (`#/rota`) e funciona através do evento `window.hashchange`.

```javascript
// Exemplo de URLs
http://app/#/login
http://app/#/painel
http://app/#/entradas
http://app/#/fornecedores?busca=xyz
```

### Cache de Módulos

Após o carregamento bem-sucedido de um módulo, a página é armazenada em `cachePaginas`. Navegações subsequentes para a mesma rota ignoram recarregamento. O cache pode ser limpo com `Cebus.roteador.limparCache()`.

### Carregamento Sob Demanda (Lazy Loading)

O `CarregadorDinamico` injeta tags `<script>` no `<head>` do documento:

1. **Cache**: Scripts já carregados não são recarregados (cache interno `cacheScripts`)
2. **Sequencial**: Scripts dependentes carregam um após o outro
3. **Versionamento**: URLs recebem query string `?v=1.0.3` para evitar cache do navegador
4. **Fila**: Se um carregamento estiver em andamento, novas requisições entram em fila (polling a cada 100ms)

### Interceptadores

São funções executadas em sequência antes da renderização de cada rota:

| Interceptador | Arquivo | Função |
|---|---|---|
| `verificarAutenticacao` | `interceptadores/verificarAutenticacao.js` | Verifica se a rota requer auth. Se sim e usuário não logado, redireciona para `/login` |
| `verificarPermissao` | `interceptadores/verificarPermissao.js` | Bloqueia rotas `/usuarios` e `/logs` para usuários não-admin |
| `registrarNavegacao` | `interceptadores/registrarNavegacao.js` | Persiste histórico de navegação (últimas 50 entradas) no localStorage |

Se um interceptador retorna `false`, o carregamento da rota é abortado.

### Fallback

Se o carregamento de um módulo falha (erro de script, rota não encontrada), o roteador tenta renderizar `/login` como fallback.

---

## Sistema de Ações (data-acao)

O roteador instala event listeners **globais** no `document` que delegam eventos à página ativa através do atributo `data-acao`. Isso elimina a necessidade de registrar/remover listeners manualmente.

### Eventos Capturados

| Evento | Elemento alvo | Disparo |
|---|---|---|
| `click` | Qualquer elemento com `[data-acao]` (exceto `<form>`) | Ação do usuário |
| `submit` | Formulários com `[data-acao]` | Submit do formulário |
| `change` | Inputs/selects com `[data-acao]` | Mudança de valor |
| `input` | Inputs com `[data-acao]` | Digitação |

### Ações Embutidas (Built-in)

Estas ações são tratadas diretamente pelo Roteador, sem passar pela página:

| `data-acao` | Comportamento |
|---|---|
| `navegar` | Lê `data-rota` e navega (`Cebus.roteador.navegar(rota)`) |
| `sair` / `logout` | Desloga (chama auth.logout()) e navega para `/login` |
| `alternarTema` | Alterna entre tema dark/white |
| `alternarMenu` | Abre/fecha barra lateral (toggle class `aberta`) |
| `cancelarFormulario` | Fecha o modal atual |
| `voltar` / `cancelar` | `window.history.back()` |

### Ações Customizadas

Qualquer outro valor de `data-acao` é procurado como método no objeto da página ativa:

```html
<!-- Exemplo: click chama pagina.abrirNovoUsuario() -->
<button data-acao="abrirNovoUsuario">Novo</button>

<!-- Exemplo: submit chama pagina.salvarUsuario(form, event) -->
<form data-acao="salvarUsuario">
  <!-- campos -->
</form>

<!-- Exemplo: input chama pagina.buscar(inputElement, event) -->
<input data-acao="buscar" placeholder="Buscar...">
```

Os parâmetros recebidos variam por evento:
- **click**: `(elemento, evento)` — o elemento clicado e o event object
- **submit**: `(formulario, evento)` — o formulário e o event object (e.preventDefault() já deve ser chamado pela página)
- **change**: `(elemento, evento)` — o elemento alterado
- **input**: `(elemento, evento)` — o elemento que recebeu input

---

## Ciclo de Vida das Páginas

Cada página segue um ciclo de vida gerenciado pelo `GerenciadorPaginas`:

```
ANTES DE RENDERIZAR (antesRenderizar)
  |
  ├── Síncrono: retorna undefined
  │   └── Segue direto para renderizar
  │
  └── Assíncrono: retorna Promise
      ├── Mostra spinner na tela
      ├── Aguarda Promise resolver
      └── Segue para renderizar

RENDERIZAR (renderar)
  ├── Deve retornar HTML string
  ├── CSS é injetado no <head> (CSS scoped da página)
  ├── HTML é inserido no #root
  └── Lucide icons são recriados

DEPOIS DE RENDERIZAR (depoisRenderizar)
  ├── Ideal para: bindings adicionais, gráficos, timers
  └── Executado após DOM estar pronto

DESTRUIR (destruir)
  ├── Chamado ao navegar para outra rota
  ├── Limpa: timers, intervals, listeners, referências
  └── GerenciadorPaginas também limpa automaticamente
```

### Estrutura de uma Página

```javascript
(function () {
  // Estado local (closures)
  var paginacao = null;
  var busca = null;
  var dadosCompletos = [];

  var pagina = {
    // CSS específico da página (injetado automaticamente no <head>)
    css: '.minha-classe { ... }',

    // Carrega dados antes de renderizar (pode retornar Promise)
    antesRenderizar: function () {
      var store = Cebus.registrador.obterStore('meuModulo');
      if (store) return store.carregar();
    },

    // Renderiza o HTML da página
    renderar: function () {
      // Lê dados da store
      // Inicializa hooks (pagination, busca)
      // Monta HTML com componentes compartilhados
      return Cebus.layout.renderizar(conteudo);
    },

    // Limpeza ao sair da página
    destruir: function () {
      paginacao = null;
      busca = null;
      dadosCompletos = [];
    },

    // Ações (chamadas via data-acao)
    minhaAcao: function (el, e) {
      // ...
    },
  };

  Cebus.registrador.registrarPagina('/minhaRota', pagina);
})();
```

---

## Estrutura de Diretórios

```
cebus-vanilla/
├── index.html                         ← ÚNICO ponto de entrada SPA
│
├── configuracao/                      ← Configurações do sistema
│   ├── configApp.js                   ← Nome, versão, tema, paginação
│   ├── configFirebase.js              ← Credenciais Firebase
│   ├── configModulos.js               ← Mapa rota → módulo (store + pagina)
│   ├── configRotas.js                 ← Definição das rotas (path, label, icon)
│   └── configTema.js                  ← Opções de tema disponíveis
│
├── css/                               ← Estilos
│   ├── nucleo/
│   │   ├── reset.css                  ← Reset CSS básico
│   │   ├── temas.css                  ← Variáveis CSS para temas dark/white
│   │   └── animacoes.css              ← Keyframes e classes de animação
│   └── compartilhado/
│       └── componentes.css            ← Estilos de todos os componentes
│
├── js/
│   ├── nucleo/                        ← FRAMEWORK CORE
│   │   ├── Inicializador.js           ← Registrador central
│   │   ├── Principal.js               ← Bootstrap (tema, firebase, auth, router)
│   │   ├── Roteador.js                ← Router hash + delegador de eventos
│   │   ├── GerenciadorPaginas.js      ← Lifecycle manager
│   │   ├── FabricaEstado.js           ← Reactive store factory
│   │   ├── BarramentoEventos.js       ← Pub/sub event bus
│   │   ├── CarregadorDinamico.js      ← Dynamic script loader
│   │   ├── ModalBase.js               ← Base modal component
│   │   ├── hooks/
│   │   │   ├── usePaginacao.js        ← Pagination hook
│   │   │   └── useBusca.js            ← Search hook with debounce
│   │   ├── cache/
│   │   │   ├── CacheRotas.js          ← Route data cache
│   │   │   └── CacheEstilos.js        ← Injected CSS cache
│   │   └── interceptadores/
│   │       ├── verificarAutenticacao.js  ← Auth guard
│   │       ├── verificarPermissao.js     ← Permission guard
│   │       └── registrarNavegacao.js     ← Navigation logger
│   │
│   ├── firebase/                      ← Firebase integration
│   │   ├── index.js                   ← Namespace Cebus.firebase
│   │   ├── ConexaoFirebase.js         ← Firebase initialization
│   │   ├── AutenticacaoFirebase.js    ← Auth (Firebase + local fallback)
│   │   └── RepositorioFirebase.js     ← Firestore CRUD
│   │
│   ├── compartilhado/                 ← SHARED CODE
│   │   ├── servicos/
│   │   │   ├── ServicoArmazenamento.js  ← localStorage wrapper
│   │   │   ├── ServicoTema.js           ← Theme toggle
│   │   │   ├── ServicoExportacao.js     ← CSV/JSON export
│   │   │   ├── ServicoBackup.js         ← Full backup/restore
│   │   │   ├── ServicoLog.js            ← Structured logging
│   │   │   └── ServicoDebug.js          ← Debug/monitoring
│   │   ├── constantes/
│   │   │   ├── Rotas.js               ← Route constants
│   │   │   ├── Situacoes.js           ← Status constants
│   │   │   ├── Permissoes.js          ← Permission levels
│   │   │   └── Colecoes.js            ← Firestore collection names
│   │   ├── componentes/
│   │   │   ├── Modal.js               ← Shared modal dialog
│   │   │   ├── Formulario.js          ← Dynamic form builder
│   │   │   └── TabelaDinamica.js      ← Dynamic table renderer
│   │   ├── layout/
│   │   │   ├── Cabecalho.js           ← App header
│   │   │   ├── BarraLateral.js        ← Sidebar navigation
│   │   │   ├── Layout.js              ← Layout composer
│   │   │   └── PainelAcoes.js         ← Action bar
│   │   ├── notificacoes/
│   │   │   ├── Notificacao.js         ← Toast notifications
│   │   │   └── Confirmacao.js         ← Confirmation dialog
│   │   ├── ganchos/
│   │   │   ├── GanchoAutenticacao.js  ← Auth facade
│   │   │   └── GanchoTema.js          ← Theme facade
│   │   ├── utilitarios/
│   │   │   ├── datas.js               ← Date formatting (pt-BR)
│   │   │   ├── ids.js                 ← ID generation
│   │   │   └── mascaras.js            ← Input masks (CNPJ, phone, currency)
│   │   ├── widgets/
│   │   │   └── CartaoResumo.js        ← KPI summary card
│   │   └── repositorios/
│   │       └── RepositorioBase.js     ← Offline-first repository
│   │
│   └── modulos/                       ← FEATURE MODULES
│       ├── autenticacao/              ← Login
│       │   ├── AutenticacaoStore.js
│       │   └── AutenticacaoPagina.js
│       ├── painel/                    ← Dashboard
│       │   ├── PainelStore.js
│       │   └── PainelPagina.js
│       ├── fornecedores/              ← Suppliers (mais complexo)
│       │   ├── FornecedorValidator.js
│       │   ├── FornecedorService.js
│       │   ├── FornecedorHelper.js
│       │   ├── FornecedoresStore.js
│       │   └── FornecedoresPagina.js
│       ├── equipes/                   ← Teams
│       │   ├── EquipesStore.js
│       │   └── EquipesPagina.js
│       ├── entradas/                  ← Stock entries
│       │   ├── EntradasStore.js
│       │   └── EntradasPagina.js
│       ├── estoque/                   ← Stock
│       │   ├── EstoqueStore.js
│       │   └── EstoquePagina.js
│       ├── saidas/                    ← Stock exits
│       │   ├── SaidasStore.js
│       │   └── SaidasPagina.js
│       ├── distribuicao/              ← Distribution
│       │   ├── DistribuicaoStore.js
│       │   └── DistribuicaoPagina.js
│       ├── movimentacoes/             ← Movements
│       │   ├── MovimentacoesStore.js
│       │   └── MovimentacoesPagina.js
│       ├── consultas/                 ← Queries
│       │   ├── ConsultasStore.js
│       │   └── ConsultasPagina.js
│       ├── relatorios/                ← Reports
│       │   ├── RelatoriosStore.js
│       │   └── RelatoriosPagina.js
│       ├── usuarios/                  ← User management (admin only)
│       │   ├── UsuariosStore.js
│       │   └── UsuariosPagina.js
│       ├── logs/                      ← Audit logs (admin only)
│       │   ├── LogsStore.js
│       │   └── LogsPagina.js
│       └── configuracoes/            ← Settings
│           ├── ConfiguracoesStore.js
│           └── ConfiguracoesPagina.js
│
├── recursos/
│   └── logo.svg                       ← App logo
│
└── documentacao/
    └── README.md                      ← Este documento
```

---

## Documentação de Cada Arquivo

### Configuração

#### `configApp.js`

Define os metadados da aplicação no objeto `Cebus.config`:

| Propriedade | Valor | Descrição |
|---|---|---|
| `versao` | `'1.0.0'` | Versão do sistema |
| `nomeSistema` | `'Estoque Kitchen'` | Nome completo |
| `nomeCurto` | `'Cebus'` | Nome abreviado |
| `descricao` | `'Gestão de Estoque...'` | Descrição |
| `temaPadrao` | `'dark'` | Tema inicial |
| `itensPorPagina` | `20` | Paginação padrão |
| `animacoesAtivadas` | `true` | Controle global de animações |

#### `configFirebase.js`

Contém as credenciais do Firebase (apiKey, authDomain, projectId, etc.). Se vazio ou ausente, o Firebase não é inicializado e todo o sistema opera offline com localStorage.

#### `configRotas.js`

Define o array de rotas disponíveis:
```javascript
Cebus.config.rotas = [
  { caminho: '/painel', rotulo: 'Painel', icone: 'layout-dashboard', auth: true },
  { caminho: '/fornecedores', rotulo: 'Fornecedores', icone: 'truck', auth: true },
  // ... mais rotas
];
```

Cada rota possui:
- `caminho`: path da URL hash
- `rotulo`: texto exibido na barra lateral
- `icone`: nome do ícone Lucide
- `auth`: se `true`, requer autenticação

#### `configModulos.js`

Mapeia cada rota aos arquivos necessários:
```javascript
Cebus.config.modulos = {
  caminhoBase: 'js/modulos/',
  mapeamento: {
    '/fornecedores': {
      store: 'fornecedores/FornecedoresStore',
      pagina: 'fornecedores/FornecedoresPagina',
      deps: ['fornecedores/FornecedorValidator',
             'fornecedores/FornecedorHelper',
             'fornecedores/FornecedorService']
    },
    // ...
  }
};
```

- `store`: caminho relativo ao arquivo *Store.js (sem extensão)
- `pagina`: caminho relativo ao arquivo *Pagina.js (sem extensão)
- `deps`: array opcional de dependências adicionais a carregar antes

#### `configTema.js`

```javascript
Cebus.config.tema = {
  opcoes: ['dark', 'white'],
  padrao: 'dark'
};
```

---

### Núcleo

#### `Inicializador.js` — Registrador Central

Cria o `Cebus.registrador`, que mantém registros de:
- `paginas`: mapa de rota → objeto página
- `stores`: mapa de nome → store
- `repositorios`: repositórios registrados
- `servicos`: serviços registrados
- `modulos`: módulos registrados (registra store + página automaticamente)

Métodos principais:
- `registrarPagina(rota, paginaObj)` — registra uma página por rota
- `registrarStore(nome, storeObj)` — registra store e expõe em `Cebus.estado[nome]`
- `registrarModulo(nome, {store, pagina})` — registra ambos de uma vez
- `obterPagina(rota)` — recupera página da rota
- `obterStore(nome)` — recupera store pelo nome

#### `Principal.js` — Bootstrap

Função `iniciar()` executada no `DOMContentLoaded`:

1. **Tema**: carrega tema salvo do localStorage (padrão: dark)
2. **Debug**: ativa `ServicoDebug.habilitar()` se disponível
3. **Firebase**: inicializa Firebase app e autenticação se configurado
4. **AuthStore**: inicializa store de autenticação
5. **Seed**: cria usuário padrão `max.softengineer@gmail.com / 123123` no localStorage
6. **Router**: inicia `Cebus.roteador.iniciar()` com 100ms de delay

#### `Roteador.js` — Roteador + Delegador de Eventos

O coração do SPA. Duas responsabilidades principais:

**Roteamento** (hash-based):
- Escuta `window.hashchange`
- `resolver()`: lê hash, extrai caminho e query params, carrega módulo, executa interceptadores, renderiza página
- `navegar(caminho)`: altera `window.location.hash`
- `recarregar()`: força recarregamento da rota atual (limpa cache)

**Delegação de Eventos**:
Instala 4 listeners globais no `document`:
- `click`: captura qualquer clique em `[data-acao]`
- `submit`: captura submit de formulários `[data-acao]`
- `change`: captura mudanças em `[data-acao]`
- `input`: captura input em `[data-acao]`

Cada listener verifica se a ação é embutida (navegar, sair, alternarTema, etc.) ou delegada a um método da página atual.

#### `GerenciadorPaginas.js` — Gerenciador de Ciclo de Vida

Gerencia o ciclo de vida completo das páginas:

- `renderizarAsync(caminho, params, pagina, root)`: método principal
  - Chama `destruirAtual()` para limpar página anterior
  - Define página atual
  - Chama `antesRenderizar()` — se retorna Promise, mostra spinner e aguarda
  - Injeta CSS da página
  - Chama `renderar()`, insere HTML no `#root`
  - Recria ícones Lucide
  - Chama `depoisRenderizar()`

- `destruirAtual()`: limpa timers, intervals, listeners e chama `destruir()` da página

- `adicionarTimer(id)`, `adicionarIntervalo(id)`: registra timers para limpeza automática

- `adicionarListener(removerFn)`: registra função de cleanup de listener

#### `FabricaEstado.js` — Fábrica de Stores Reativas

`Cebus.util.criarStore({ estadoInicial, metodos })` cria stores reativas:

```javascript
var store = Cebus.util.criarStore({
  estadoInicial: { lista: [], carregando: false },
  metodos: function (store, set) {
    return {
      carregar: function () { /* ... */ },
      salvar: function (dados) { /* ... */ },
    };
  }
});
```

**API da Store**:
- `obterEstado()`: retorna o estado atual (imutável)
- `definirEstado(parcial)`: mescla parcial no estado, notifica listeners
- `inscrever(fn)`: subscribe a mudanças de estado, retorna unsubscribe function
- `limparInscricoes()`: remove todos os listeners
- Métodos customizados (definidos em `metodos`)

#### `BarramentoEventos.js` — Event Bus Pub/Sub

Sistema de comunicação entre módulos:

```javascript
// Emitir evento
Cebus.barramento.emitir('entrada:salvo', { id: '123', produto: 'Arroz' });

// Ouvir evento
var cancelar = Cebus.barramento.on('entrada:salvo', function(dados) {
  console.log('Entrada registrada:', dados);
});

// Parar de ouvir
cancelar(); // ou Cebus.barramento.off('entrada:salvo', fn);
```

Eventos emitidos pelo sistema:
- `entrada:salvo` — quando uma entrada de estoque é salva
- `estoque:atualizado` — quando o saldo de estoque é alterado
- `usuario:salvo` — quando um usuário é criado/atualizado
- `usuario:removido` — quando um usuário é removido
- `log:novo` — quando um novo log é registrado

#### `CarregadorDinamico.js` — Carregador de Scripts Sob Demanda

Carrega scripts JavaScript dinamicamente:

- `carregarScript(caminho)`: injeta `<script>` no `<head>`, retorna Promise
- `carregarScripts(caminhos[])`: carrega múltiplos scripts em sequência
- `carregarCSS(caminho)`: injeta `<link rel="stylesheet">`
- `carregarModulo(caminhoBase)`: carrega Store.js + Pagina.js em sequência
- Cache interno evita recarregamento de scripts já carregados

#### `ModalBase.js` — Componente Modal Base

Modal reutilizável de baixo nível:

```javascript
Cebus.componentes.modalBase.abrir({
  titulo: 'Título',
  largura: 600,
  conteudo: '<p>Conteúdo HTML</p>',
  rodape: '<button>Ação</button>',
  clicarFora: true,         // fechar ao clicar fora (padrão: true)
  aoAbrir: function(modal) {}, // callback após abrir
});
```

- `fechar()`: remove o modal do DOM
- `definirConteudo(html)`: atualiza conteúdo do modal aberto
- `definirCarregando(ativo)`: mostra/esconde spinner

#### Hooks

##### `usePaginacao.js`

```javascript
var paginacao = Cebus.util.usePaginacao({
  porPagina: 20,
  onChange: function() { /* re-renderizar tabela */ }
});

paginacao.definirDados(arrayCompleto);  // alimenta com dados
paginacao.obterPaginados();             // retorna página atual
paginacao.renderizarControles();        // HTML dos botões de navegação
paginacao.paginaAnterior();              // navega para trás
paginacao.proximaPagina();               // navega para frente
paginacao.irParaPagina(3);               // vai para página 3
paginacao.info();                        // "Página 1 de 5 (100 registros)"
```

##### `useBusca.js`

```javascript
var busca = Cebus.util.useBusca({
  dados: dadosCompletos,
  campos: ['nome', 'email'],  // campos para filtrar
  onChange: function(filtrados) { /* re-renderizar */ },
  debounceMs: 300             // delay após digitar (padrão: 300ms)
});

busca.definirTermo('termo');          // define termo de busca
busca.renderizarCampo('Placeholder'); // HTML do input de busca
busca.filtrar();                      // executa filtro manualmente
```

#### Interceptadores

##### `verificarAutenticacao.js`

Guarda de autenticação. Rotas públicas (`/login`) são permitidas sem auth. Qualquer outra rota requer `authStore.obterEstado().estaLogado === true`. Se falso, redireciona para `/login`.

##### `verificarPermissao.js`

Guarda de permissão. Rotas administrativas (`/usuarios`, `/logs`) requerem `usuario.nivel === 'admin'`. Usuários sem permissão são redirecionados para `/painel`.

##### `registrarNavegacao.js`

Registra histórico de navegação no localStorage. Mantém até 50 entradas com timestamp, rota e usuário.

---

### Firebase

#### `ConexaoFirebase.js`

Inicializa Firebase App, Firestore e Auth. Marca `Cebus.firebase._inicializado = true` se bem-sucedido. Se as credenciais estiverem ausentes, o Firebase não é inicializado (sistema opera offline).

#### `AutenticacaoFirebase.js`

Camada de autenticação com fallback offline:

- `login(email, senha)`: tenta Firebase Auth primeiro. Se falha (Firebase não configurado, erro de rede), faz fallback para `loginLocal()` — verifica credenciais no localStorage (`usuarios_locais`).
- `logout()`: desloga do Firebase e limpa sessão local.
- `ouvirEstado(callback)`: `onAuthStateChanged` do Firebase.
- `obterUsuarioAtual()`: retorna usuário atual do Firebase ou sessão local.
- `loginLocal(email, senha)`: verifica credenciais contra `localStorage.usuarios_locais`.

#### `RepositorioFirebase.js`

CRUD para coleções Firestore:

- `listar()`: retorna todos os documentos (forEach + push)
- `obterPorId(id)`: `doc(id).get().then(doc => doc.data())`
- `salvar(dados)`: `add(dados)` e retorna com `id`
- `salvarComId(id, dados)`: `doc(id).set(dados)` com merge
- `atualizar(id, dados)`: `doc(id).update(dados)`
- `remover(id)`: `doc(id).delete()`
- `consultar(campo, valor)`: `where(campo, '==', valor).get()`
- `onChange(callback)`: `onSnapshot` (tempo real)

---

### Compartilhado

#### Serviços

##### `ServicoArmazenamento.js` — localStorage Wrapper

Todas as chaves são prefixadas com `cebus_` para evitar conflitos:

| Método | Descrição |
|---|---|
| `salvar(chave, valor)` | Serializa e salva (JSON.stringify) |
| `obter(chave, padrao)` | Recupera e desserializa (JSON.parse), retorna `padrao` se não existir |
| `remover(chave)` | Remove chave |
| `limpar()` | Remove todas as chaves `cebus_*` |

Expõe também `Cebus.util.salvarCache(chave, valor)` e `Cebus.util.obterCache(chave, padrao)` como atalhos.

##### `ServicoTema.js` — Alternância de Tema

```javascript
Cebus.servicos.tema.alternar();  // dark ↔ white, salva preferência
Cebus.servicos.tema.definir('dark');  // define tema específico
Cebus.servicos.tema.obterAtual();  // retorna 'dark' ou 'white'
```

O tema é aplicado via `document.documentElement.setAttribute('data-tema', tema)` e a preferência é persisitida no localStorage.

##### `ServicoExportacao.js` — Exportação de Dados

```javascript
Cebus.servicos.exportacao.exportarCSV(dados, 'arquivo.csv');
Cebus.servicos.exportacao.exportarJSON(dados, 'arquivo.json');
```

Gera um arquivo para download via Blob + ObjectURL. CSV inclui BOM para acentos em Excel.

##### `ServicoBackup.js` — Backup Completo

- `exportarCompleto()`: percorre todas as stores registradas, serializa estado + metadados, exporta como JSON
- `importar(arquivoJSON)`: lê arquivo JSON e restaura estados das stores via `FileReader`

##### `ServicoLog.js` — Logging Estruturado

```javascript
Cebus.servicos.log.info('Mensagem', { dados: 'extras' });
Cebus.servicos.log.aviso('Aviso');
Cebus.servicos.log.erro('Erro', { stack: err.stack });
```

Cada entrada inclui: id, nível, mensagem, dados, usuário, rota, timestamp. Persiste no localStorage (até 1000 entradas) e emite `log:novo` no barramento.

##### `ServicoDebug.js` — Modo Debug

Quando `habilitar()` é chamado, wrappeia:

1. **`Cebus.repositorios.criar`**: cada método (listar, salvar, etc.) loga entrada/saída com console.group
2. **`Cebus.registrador.registrarStore`**: wrappeia `carregar()` da store com logging
3. **`Cebus.firebase.criarRepositorio`**: wrappeia métodos Firebase com logging colorido

Cada chamada aparece no console com cores por camada:
- Página: roxo
- Store: azul
- Service: ciano
- Repository: verde
- Firebase: laranja
- Cache: rosa
- Erro: vermelho

#### Componentes

##### `Modal.js` — Modal Compartilhado

```javascript
// Abrir modal
Cebus.componentes.modal.abrir({
  titulo: 'Novo Registro',
  largura: 500,
  conteudo: '<p>HTML do conteúdo</p>',
  rodape: '<button>Ações</button>',
});

// Fechar
Cebus.componentes.modal.fechar();
```

##### `Formulario.js` — Construtor Dinâmico de Formulários

```javascript
// Renderizar formulário
var html = Cebus.componentes.formulario.renderizar({
  id: 'formUsuario',
  acaoSubmit: 'salvarUsuario',  // data-acao do form
  campos: [
    { nome: 'nome', rotulo: 'Nome', tipo: 'text', obrigatorio: true, placeholder: 'Nome completo' },
    { nome: 'nivel', rotulo: 'Nível', tipo: 'select', valor: 'operador', opcoes: [
      { valor: 'admin', rotulo: 'Administrador' },
      { valor: 'operador', rotulo: 'Operador' },
    ]},
    { nome: 'ativo', rotulo: 'Ativo', tipo: 'checkbox', valor: true },
  ],
  mostrarCancelar: true,
  labelSubmit: 'Salvar',
});

// Extrair dados do formulário
var dados = Cebus.componentes.formulario.extrairDados('formUsuario');

// Preencher formulário
Cebus.componentes.formulario.preencher('formUsuario', { nome: 'João', nivel: 'admin' });

// Limpar formulário
Cebus.componentes.formulario.limpar('formUsuario');
```

Tipos de campo suportados: `text`, `number`, `email`, `password`, `date`, `select`, `checkbox`, `textarea`, `color`.

##### `TabelaDinamica.js` — Tabela Dinâmica

```javascript
var html = Cebus.componentes.tabelaDinamica.renderizar({
  colunas: [
    { chave: 'nome', rotulo: 'Nome' },
    { chave: 'email', rotulo: 'E-mail' },
    { chave: 'nivel', rotulo: 'Nível', formatar: function(valor) { return '<b>'+valor+'</b>'; } },
  ],
  dados: [{ nome: 'João', email: 'joao@email.com', nivel: 'admin' }],
  acoes: [
    { acao: 'editar', rotulo: 'Editar', tipo: 'primario' },
    { acao: 'remover', rotulo: 'Remover', tipo: 'perigo' },
  ],
  mensagemVazia: 'Nenhum registro encontrado',
});
```

#### Layout

##### `Cabecalho.js` — Cabeçalho

Renderiza o header do app: logo/nome do sistema, botão de alternar tema, avatar do usuário logado e botão de logout.

##### `BarraLateral.js` — Barra Lateral

Renderiza o menu de navegação baseado em `Cebus.config.rotas`. Filtra rotas por permissão (esconde `/usuarios` e `/logs` para não-admin). Destaca rota ativa. Usa ícones Lucide.

##### `Layout.js` — Compositor de Layout

```javascript
Cebus.layout.renderizar(conteudoHTML);
// Retorna: header + sidebar + main content wrapper
```

##### `PainelAcoes.js` — Barra de Ações

```javascript
Cebus.layout.painelAcoes.renderizar({
  titulo: 'Usuários',
  acoes: [
    { acao: 'abrirNovoUsuario', rotulo: 'Novo', icone: 'plus' },
    { acao: 'atualizar', rotulo: 'Atualizar', icone: 'refresh-cw', tipo: 'secundario' },
  ],
});
```

#### Notificações

##### `Notificacao.js` — Toast Notifications

```javascript
Cebus.notificacoes.sucesso('Operação concluída!');
Cebus.notificacoes.erro('Erro ao salvar');
Cebus.notificacoes.aviso('Atenção: campo obrigatório');
Cebus.notificacoes.info('Sistema atualizado');
```

Notificações aparecem no canto superior direito, com animação slideIn, e somem automaticamente após 4 segundos. Cores: verde (sucesso), vermelho (erro), amarelo (aviso), azul (info).

##### `Confirmacao.js` — Diálogo de Confirmação

```javascript
Cebus.notificacoes.confirmar('Deseja remover este item?').then(function(confirmou) {
  if (confirmou) { /* executar ação */ }
});
```

Retorna uma Promise que resolve para `true` (confirmou) ou `false` (cancelou). Modal com overlay, título, mensagem e botões Sim/Não.

#### Ganchos

##### `GanchoAutenticacao.js`

```javascript
Cebus.ganchos.autenticacao.login(email, senha);
Cebus.ganchos.autenticacao.logout();
Cebus.ganchos.autenticacao.verificarSessao();
```

##### `GanchoTema.js`

```javascript
Cebus.ganchos.tema.alternar();
Cebus.ganchos.tema.obterAtual();
```

#### Utilitários

##### `datas.js`

| Função | Descrição |
|---|---|
| `formatarData(data)` | `dd/mm/aaaa` |
| `formatarDataISO(data)` | ISO string |
| `formatarDataHora(data)` | `dd/mm/aaaa HH:mm` |
| `calcularDiferenca(data1, data2)` | Dias entre datas |
| `obterPeriodo(tipo)` | Retorna datas pré-definidas (hoje, 7d, 30d, mês) |

##### `ids.js`

| Função | Descrição |
|---|---|
| `gerarId()` | Timestamp + random (ex: `1705000123456-a1b2c`) |
| `gerarIdCurto()` | 6 caracteres aleatórios |

##### `mascaras.js`

Máscaras aplicadas via `MutationObserver` automático em elementos com `data-mascara`:

| Máscara | Descrição | Exemplo |
|---|---|---|
| `cnpj` | `XX.XXX.XXX/XXXX-XX` | `11.222.333/0001-81` |
| `telefone` | `(XX) XXXXX-XXXX` | `(11) 91234-5678` |
| `moeda` | `1.234,56` (pt-BR) | `R$ 1.234,56` |
| `numero` | Apenas dígitos | --- |
| `data` | `XX/XX/XXXX` | `31/12/2024` |

#### Widgets

##### `CartaoResumo.js` — Cartão de Resumo (KPI)

```javascript
var html = Cebus.widgets.cartaoResumo.renderizar({
  icone: 'package',       // nome do ícone Lucide
  valor: '150',           // valor principal
  rotulo: 'Produtos',     // label
  variacao: '+12%',       // opcional: indicador de variação
  tipoVariacao: 'positivo' // 'positivo' ou 'negativo' (define cor)
});
```

#### Repositórios

##### `RepositorioBase.js` — Repositório Offline-First

Camada de abstração de dados que implementa a estratégia offline-first (detalhada na seção [Estratégia Offline-First](#estratégia-offline-first)).

```javascript
var repo = Cebus.repositorios.criar('minhaColecao');

repo.listar().then(function(dados) { ... });
repo.obterPorId('123').then(function(item) { ... });
repo.salvar({ nome: 'João' }).then(function(item) { ... });
repo.remover('123').then(function() { ... });
repo.consultar('nivel', 'admin').then(function(filtrados) { ... });
repo.importar(arrayDeDados).then(function() { ... });
repo.exportar().then(function(dados) { ... });
```

---

### Módulos (Feature Modules)

Cada módulo reside em `js/modulos/<nome>/` e segue o padrão **Store + Página**:

| Módulo | Store | Página | Rota | Diferenciais |
|---|---|---|---|---|
| **Autenticação** | `AutenticacaoStore.js` | `AutenticacaoPagina.js` | `/login` | Gerencia sessão, login local |
| **Painel** | `PainelStore.js` | `PainelPagina.js` | `/painel` | KPIs agregados de várias stores |
| **Fornecedores** | `FornecedoresStore.js` | `FornecedoresPagina.js` | `/fornecedores` | + Validator, Service, Helper |
| **Equipes** | `EquipesStore.js` | `EquipesPagina.js` | `/equipes` | CRUD simples |
| **Entradas** | `EntradasStore.js` | `EntradasPagina.js` | `/entradas` | Auto-atualiza estoque |
| **Estoque** | `EstoqueStore.js` | `EstoquePagina.js` | `/estoque` | Saldos, situação |
| **Saídas** | `SaidasStore.js` | `SaidasPagina.js` | `/saidas` | CRUD com validação |
| **Distribuição** | `DistribuicaoStore.js` | `DistribuicaoPagina.js` | `/distribuicao` | CRUD |
| **Movimentações** | `MovimentacoesStore.js` | `MovimentacoesPagina.js` | `/movimentacoes` | Histórico |
| **Consultas** | `ConsultasStore.js` | `ConsultasPagina.js` | `/consultas` | Leitura de dados |
| **Relatórios** | `RelatoriosStore.js` | `RelatoriosPagina.js` | `/relatorios` | Geração de relatórios |
| **Usuários** | `UsuariosStore.js` | `UsuariosPagina.js` | `/usuarios` | Admin-only, CRUD de usuários |
| **Logs** | `LogsStore.js` | `LogsPagina.js` | `/logs` | Admin-only, auditoria |
| **Configurações** | `ConfiguracoesStore.js` | `ConfiguracoesPagina.js` | `/configuracoes` | Ajustes do sistema |

#### Anatomia de uma Store (ex: `UsuariosStore.js`)

```javascript
(function () {
  // Cria repositório para a coleção 'usuarios'
  var repo = Cebus.repositorios.criar('usuarios');

  // Cria store reativa
  var store = Cebus.util.criarStore({
    estadoInicial: {
      lista: [],          // dados carregados
      carregando: false,  // flag de loading
      itemAtual: null     // item selecionado
    },
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
            store.carregar();                          // recarrega lista
            Cebus.barramento.emitir('usuario:salvo', item);  // notifica sistema
            return item;
          });
        },
        remover: function (id) {
          return repo.remover(id).then(function () {
            store.carregar();
            Cebus.barramento.emitir('usuario:removido', { id: id });
          });
        },
        definirItemAtual: function (item) { set({ itemAtual: item }); },
      };
    },
  });

  Cebus.registrador.registrarStore('usuarios', store);
})();
```

#### Anatomia de uma Página (ex: `UsuariosPagina.js`)

```javascript
(function () {
  // Estado local da página (closures, não exposto globalmente)
  var paginacao = null;
  var busca = null;
  var dadosCompletos = [];
  var editandoId = null;

  function inicializarHooks() {
    paginacao = Cebus.util.usePaginacao({ ... });
    busca = Cebus.util.useBusca({ ... });
  }

  function renderizarLinhas() { /* gera HTML das linhas da tabela */ }

  var pagina = {
    // CSS específico injetado automaticamente
    css: '.usuarios-busca{ ... }.tabela-usuarios{ ... }',

    // 1. ANTES DE RENDERIZAR: carrega dados (pode ser assíncrono)
    antesRenderizar: function () {
      return Cebus.registrador.obterStore('usuarios').carregar();
    },

    // 2. RENDERIZAR: gera HTML
    renderar: function () {
      var dados = Cebus.registrador.obterStore('usuarios').obterEstado().lista;
      // monta HTML com painel de ações, busca, tabela, paginação
      return Cebus.layout.renderizar(conteudo);
    },

    // 3. DESTRUIR: limpeza
    destruir: function () { paginacao = null; busca = null; dadosCompletos = []; },

    // AÇÕES (chamadas via data-acao)
    abrirNovoUsuario: function () { /* abre modal com formulário vazio */ },
    editarUsuario: function (el) { /* abre modal preenchido */ },
    salvarUsuario: function (form, e) { /* extrai dados, valida, salva */ },
    removerUsuario: function (el) { /* confirma e remove */ },
    buscar: function (el) { busca.definirTermo(el.value); },
    paginaAnterior: function () { paginacao.paginaAnterior(); },
    paginaProxima: function () { paginacao.proximaPagina(); },
    irParaPagina: function (el) { paginacao.irParaPagina(...); },
    recarregarUsuarios: function () { Cebus.roteador.recarregar(); },
  };

  Cebus.registrador.registrarPagina('/usuarios', pagina);
})();
```

---

## Fluxo de Dados

### Ação do Usuário → Persistência

```
Usuário clica "Salvar"
  │
  ▼
data-acao="salvarUsuario" no botão/form
  │
  ├── Roteador captura evento (click/submit)
  │
  ▼
Roteador chaga página.salvarUsuario(form, event)
  │
  ▼
Página extrai dados via Cebus.componentes.formulario.extrairDados('formId')
  │
  ▼
Página chaca store.salvar(dados)
  │
  ▼
Store chaca repo.salvar(dados)
  │
  ├── RepositorioBase:
  │   ├── Gera ID se novo
  │   ├── Timestamps (criadoEm, atualizadoEm)
  │   ├── Verifica conexão Firebase
  │   │
  │   ├── Online:
  │   │   ├── Salva no Firestore (com timeout de 4s)
  │   │   ├── Atualiza cache localStorage
  │   │   └── Retorna dados sincronizados
  │   │
  │   └── Offline:
  │       ├── Salva apenas no localStorage
  │       └── Retorna dados locais
  │
  ▼
Store recarrega lista (store.carregar())
  │
  ▼
Store emite evento no barramento (ex: 'usuario:salvo')
  │
  ▼
Página fecha modal e mostra notificação de sucesso
```

### Renderização de Página

```
Usuário navega para #/rota
  │
  ▼
Roteador.resolver()
  │
  ├── Carrega módulo (se necessário) via CarregadorDinamico
  ├── Executa interceptadores (auth, permissão, log)
  │
  ▼
GerenciadorPaginas.renderizarAsync()
  │
  ├── destruirAtual() → limpa página anterior
  ├── pagina.antesRenderizar() → carrega dados (store.carregar())
  ├── pagina.renderar() → gera HTML
  ├── Injeta CSS da página no <head>
  ├── HTML inserido no #root
  ├── Lucide.createIcons() recria ícones
  └── pagina.depoisRenderizar() → pós-renderização
```

---

## Sistema de Eventos

O `BarramentoEventos` implementa um padrão pub/sub para comunicação desacoplada entre módulos.

### Eventos do Sistema

| Evento | Emissor | Ouvintes | Finalidade |
|---|---|---|---|
| `entrada:salvo` | EntradasStore | EstoqueStore | Atualizar saldo do estoque |
| `estoque:atualizado` | EntradasStore | PainelStore | Atualizar KPIs do dashboard |
| `usuario:salvo` | UsuariosStore | — | Notificar criação/alteração |
| `usuario:removido` | UsuariosStore | — | Notificar remoção |
| `log:novo` | ServicoLog | LogsStore | Notificar novo log |

### Como Usar

```javascript
// Emitir evento (em qualquer lugar)
Cebus.barramento.emitir('meuEvento', { chave: 'valor' });

// Ouvir evento (em stores ou páginas)
var unsubscribe = Cebus.barramento.on('meuEvento', function(dados) {
  console.log('Evento recebido:', dados);
});

// Cancelar inscrição
unsubscribe();

// Remover listener específico
Cebus.barramento.off('meuEvento', minhaFuncao);

// Limpar todos os listeners de um evento
Cebus.barramento.limpar('meuEvento');

// Limpar todos os eventos
Cebus.barramento.limpar();
```

---

## Estratégia Offline-First

O `RepositorioBase` implementa uma estratégia offline-first em 3 camadas:

### 1. Detecção de Status

```javascript
function _estaOffline() {
  if (!Cebus.firebase || !Cebus.firebase._inicializado) return true;
  var auth = Cebus.firebase.obterAuth();
  return !auth || !auth.currentUser;
}
```

O sistema é considerado offline quando:
- Firebase não foi inicializado (sem credenciais)
- Firebase Auth não tem usuário logado

### 2. Operações Locais (Offline)

Quando offline, todas as operações usam apenas `localStorage`:
- Dados salvos em `localStorage['cebus_repo_<colecao>']`
- Mesma estrutura de dados (arrays de objetos com `id`)
- Operações retornam Promises (simulando async)

### 3. Operações Híbridas (Online)

Quando online, o fluxo é:
1. Escreve no Firebase primeiro (com timeout de 4 segundos)
2. Atualiza cache local com dados sincronizados
3. Se o Firebase excede o timeout, a operação falha (não faz fallback para localStorage)

### 4. Cache Local como Fonte Primária

Mesmo online, `listar()` retorna dados do Firebase mas **sempre atualiza o cache local**. Isso garante que:
- Navegações subsequentes sejam rápidas
- Dados estejam disponíveis offline
- Haja consistência entre localStorage e Firebase

### Chaves de localStorage

| Chave | Conteúdo |
|---|---|
| `cebus_tema` | Tema selecionado ('dark' / 'white') |
| `cebus_logs` | Histórico de logs (até 1000) |
| `cebus_navegacao` | Histórico de navegação (até 50) |
| `cebus_usuarios_locais` | Usuários para login local |
| `cebus_sessao` | Sessão atual do usuário |
| `cebus_repo_<colecao>` | Dados da coleção (cada módulo) |

---

## Ferramentas de Debug

O `ServicoDebug` oferece monitoramento em tempo real via console do navegador.

### Ativação

O debug é ativado automaticamente no bootstrap (`Principal.js`). Para desativar, remova ou comente a chamada:

```javascript
// Em Principal.js
if (typeof Cebus.servicos.debug.habilitar === 'function') {
  Cebus.servicos.debug.habilitar();
}
```

### O que é Monitorado

1. **Repositórios**: toda chamada a `listar()`, `salvar()`, `remover()`, etc. é logada com grupo no console
2. **Stores**: chamadas a `carregar()` são wrappeiadas com logging
3. **Firebase**: chamadas Firestore são monitoradas com logging colorido

### Output no Console

```
▼ [Fluxo] Repository
    [Repository] listar: usuarios
    [Repository] listar concluido: 3 registros
  ▲

▼ [Fluxo] Store
    [Store] carregar: usuarios
    [Store] carregar concluido: usuarios
  ▲
```

Cada camada tem uma cor distinta para fácil identificação visual.

### API

```javascript
Cebus.servicos.debug.logFluxo('Store', 'ação', dados);
Cebus.servicos.debug.fimFluxo();
Cebus.servicos.debug.fluxoAsync('nome', promise);
Cebus.servicos.debug.monitorarRepositorios();
Cebus.servicos.debug.monitorarStores();
Cebus.servicos.debug.monitorarFirebase();
```

---

## Como Criar um Novo Módulo

Para adicionar um novo módulo (ex: "categorias"), siga estes passos:

### 1. Criar Store

`js/modulos/categorias/CategoriasStore.js`:
```javascript
(function () {
  var repo = Cebus.repositorios.criar('categorias');

  var store = Cebus.util.criarStore({
    estadoInicial: { lista: [], carregando: false },
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
            return item;
          });
        },
        remover: function (id) {
          return repo.remover(id).then(function () { store.carregar(); });
        },
      };
    },
  });

  Cebus.registrador.registrarStore('categorias', store);
})();
```

### 2. Criar Página

`js/modulos/categorias/CategoriasPagina.js`:
```javascript
(function () {
  var pagina = {
    css: '.categorias-grid { ... }',

    antesRenderizar: function () {
      var store = Cebus.registrador.obterStore('categorias');
      if (store) return store.carregar();
    },

    renderar: function () {
      // ... montar HTML
      return Cebus.layout.renderizar(conteudo);
    },

    destruir: function () { /* limpeza */ },

    // ações data-acao
    abrirNovaCategoria: function () { ... },
    salvarCategoria: function (form, e) { ... },
    removerCategoria: function (el) { ... },
  };

  Cebus.registrador.registrarPagina('/categorias', pagina);
})();
```

### 3. Registrar no Config

Em `configRotas.js`:
```javascript
{ caminho: '/categorias', rotulo: 'Categorias', icone: 'tags', auth: true },
```

Em `configModulos.js`:
```javascript
mapeamento: {
  '/categorias': {
    store: 'categorias/CategoriasStore',
    pagina: 'categorias/CategoriasPagina',
  },
  // ... outros módulos
}
```

### 4. (Opcional) Adicionar Constantes

Em `constantes/Colecoes.js`:
```javascript
Cebus.constantes.colecoes.CATEGORIAS = 'categorias';
```

### Checklist de Módulo

- [ ] Store criada com `Cebus.util.criarStore()`
- [ ] Store tem `carregar()`, `salvar()`, `remover()`
- [ ] Store registrada com `Cebus.registrador.registrarStore()`
- [ ] Página tem `antesRenderizar()`, `renderar()`, `destruir()`
- [ ] Página registrada com `Cebus.registrador.registrarPagina()`
- [ ] Rota adicionada em `configRotas.js`
- [ ] Mapeamento adicionado em `configModulos.js`
- [ ] (Se necessário) Constante de coleção adicionada

---

## CSS e Temas

### Arquitetura CSS

| Arquivo | Finalidade | Tamanho estimado |
|---|---|---|
| `reset.css` | Reset básico (box-sizing, font, list-style) | ~20 linhas |
| `temas.css` | Variáveis CSS para dark e white themes | ~100 linhas |
| `animacoes.css` | Keyframes e classes utilitárias | ~60 linhas |
| `componentes.css` | Estilos de todos os componentes | ~600+ linhas |

### Sistema de Temas

O tema é controlado pelo atributo `data-tema` no `<html>`:

```html
<html data-tema="dark">   <!-- tema escuro (padrão) -->
<html data-tema="white">  <!-- tema claro -->
```

As variáveis CSS são definidas em `temas.css`:

```css
[data-tema="dark"] {
  --cor-primaria: #10B981;
  --cor-fundo: #0f1117;
  --cor-superficie: #1a1d27;
  --cor-texto: #e8eaed;
  --cor-texto-secundario: #9ca3af;
  --cor-borda: #2a2d3a;
  /* ... mais variáveis */
}

[data-tema="white"] {
  --cor-primaria: #059669;
  --cor-fundo: #f5f5f5;
  --cor-superficie: #ffffff;
  --cor-texto: #1f2937;
  --cor-texto-secundario: #6b7280;
  --cor-borda: #e5e7eb;
  /* ... mais variáveis */
}
```

### Paleta de Cores (Tema Dark)

| Variável | Cor | Uso |
|---|---|---|
| `--cor-primaria` | `#10B981` | Botões primários, links, destaque |
| `--cor-fundo` | `#0f1117` | Fundo da página |
| `--cor-superficie` | `#1a1d27` | Cards, modais, tabelas |
| `--cor-borda` | `#2a2d3a` | Bordas de elementos |
| `--cor-texto` | `#e8eaed` | Texto principal |
| `--cor-texto-secundario` | `#9ca3af` | Texto secundário |
| `--cor-sucesso` | `#10B981` | Badges e indicadores positivos |
| `--cor-perigo` | `#ef4444` | Ações destrutivas, erros |
| `--cor-atencao` | `#f59e0b` | Alertas e avisos |

### Classes de Status

| Classe | Cor | Uso |
|---|---|---|
| `badge-sucesso` | Verde | status: ativo, concluído |
| `badge-perigo` | Vermelho | status: inativo, cancelado |
| `badge-atencao` | Amarelo | status: pendente |
| `badge-info` | Azul | status: processando |
| `badge-padrao` | Cinza | status genérico |

### Componentes CSS

O arquivo `componentes.css` contém estilos para:
- **Layout**: grid layout, sidebar, header, main content
- **Botões**: `.neu-btn`, `.btn`, `.btn-primario`, `.btn-secundario`, `.btn-perigo`, `.btn-pequeno`
- **Inputs**: `.input`, `.input-busca`, `.select`
- **Modais**: `.modal-overlay`, `.modal-conteudo`, `.modal-header`, `.modal-corpo`
- **Notificações**: `.notificacao-container`, `.notificacao`, `.notificacao-sucesso`, etc.
- **Tabelas**: `.tabela-dinamica`, cabeçalho, linhas, hover
- **Cards**: `.kpi-card`, `.neu-card` (efeito neumorphism)
- **Spinner**: `.spinner` (animação de carregamento)
- **Badges**: `.badge`, `.badge-sucesso`, `.badge-perigo`, etc.
- **Utilitários**: `.flex`, `.gap-*`, `.text-*`, `.mt-*`, `.mb-*`, etc.

### CSS por Página

Cada página pode definir CSS específico na propriedade `css` do objeto página. Esse CSS é injetado automaticamente no `<head>` pelo `GerenciadorPaginas` quando a página é renderizada, e é cacheado para não ser reinjetado.

---

## Tecnologias

| Recurso | Tecnologia |
|---|---|
| Runtime | JavaScript puro (Vanilla, ES5/ES6) |
| Banco local | `localStorage` |
| Banco cloud | Firebase Firestore v8.10.1 (opcional) |
| Autenticação | Firebase Auth + login local (fallback) |
| Ícones | [Lucide](https://lucide.dev/) via CDN |
| Hospedagem | Firebase Hosting (por config) |
| Estilização | CSS puro com variáveis customizadas |

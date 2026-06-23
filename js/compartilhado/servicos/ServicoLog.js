(function () {
  'use strict';

  var NIVEL_INFO = 'info';
  var NIVEL_AVISO = 'aviso';
  var NIVEL_ERRO = 'erro';

  function ServicoLog() {
    this._historico = [];
    this._limite = 500;
    this._nivelMinimo = NIVEL_INFO;
  }

  ServicoLog.prototype._registrar = function (nivel, mensagem, dados) {
    if (!this._deveRegistrar(nivel)) return;

    var entrada = {
      id: Cebus.util.gerarId(),
      nivel: nivel,
      mensagem: mensagem,
      dados: dados || null,
      usuario: this._obterUsuario(),
      rota: this._obterRota(),
      timestamp: new Date().toISOString()
    };

    this._historico.unshift(entrada);
    if (this._historico.length > this._limite) this._historico.pop();

    this._logConsole(entrada);
    this._persistir(entrada);

    Cebus.barramento.emitir('log:novo', entrada);
  };

  ServicoLog.prototype._deveRegistrar = function (nivel) {
    var niveis = [NIVEL_INFO, NIVEL_AVISO, NIVEL_ERRO];
    return niveis.indexOf(nivel) >= niveis.indexOf(this._nivelMinimo);
  };

  ServicoLog.prototype._obterUsuario = function () {
    var auth = Cebus.registrador.obterStore('autenticacao');
    return auth ? auth.obterEstado().usuario : null;
  };

  ServicoLog.prototype._obterRota = function () {
    var rota = Cebus.roteador ? Cebus.roteador.obterRotaAtual() : null;
    return rota || window.location.hash || '/';
  };

  ServicoLog.prototype._logConsole = function (entrada) {
    var cor = entrada.nivel === NIVEL_ERRO ? 'color:#ef4444' :
              entrada.nivel === NIVEL_AVISO ? 'color:#f59e0b' :
              'color:#6b7280';
    console.log('%c[' + entrada.nivel.toUpperCase() + ']', cor, entrada.mensagem, entrada.dados || '');
  };

  ServicoLog.prototype._persistir = function (entrada) {
    try {
      var logs = Cebus.servicos.armazenamento.obter('logs', []);
      logs.unshift(entrada);
      if (logs.length > 1000) logs.length = 1000;
      Cebus.servicos.armazenamento.salvar('logs', logs);
    } catch (e) {
      console.warn('[Log] Falha ao persistir:', e);
    }
  };

  ServicoLog.prototype.info = function (mensagem, dados) {
    this._registrar(NIVEL_INFO, mensagem, dados);
  };

  ServicoLog.prototype.aviso = function (mensagem, dados) {
    this._registrar(NIVEL_AVISO, mensagem, dados);
  };

  ServicoLog.prototype.erro = function (mensagem, dados) {
    this._registrar(NIVEL_ERRO, mensagem, dados);
  };

  ServicoLog.prototype.obterHistorico = function (nivel) {
    if (!nivel) return this._historico.slice();
    return this._historico.filter(function (e) { return e.nivel === nivel; });
  };

  ServicoLog.prototype.definirNivelMinimo = function (nivel) {
    this._nivelMinimo = nivel;
  };

  ServicoLog.prototype.limpar = function () {
    this._historico = [];
    Cebus.servicos.armazenamento.remover('logs');
  };

  Cebus.servicos = Cebus.servicos || {};
  Cebus.servicos.log = new ServicoLog();

  console.log('[Cebus] ServicoLog carregado');
})();

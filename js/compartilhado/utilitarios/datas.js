/* ==========================================================================
   ARQUIVO: datas.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  Cebus.util = Cebus.util || {};

  Cebus.util.formatarData = function (data) {
    if (!data) return '-';
    var d = data instanceof Date ? data : new Date(data);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('pt-BR');
  };

  Cebus.util.formatarDataISO = function (data) {
    if (!data) return '';
    var d = data instanceof Date ? data : new Date(data);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  Cebus.util.formatarDataHora = function (data) {
    if (!data) return '-';
    var d = data instanceof Date ? data : new Date(data);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  Cebus.util.calcularDiferenca = function (inicio, fim) {
    var diff = new Date(fim) - new Date(inicio);
    var dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    var horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return dias + 'd ' + horas + 'h';
  };

  Cebus.util.obterPeriodo = function (periodo) {
    var agora = new Date();
    var inicio, fim;
    switch (periodo) {
      case 'hoje':
        inicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
        fim = new Date(inicio);
        fim.setDate(fim.getDate() + 1);
        break;
      case '7dias':
        inicio = new Date(agora);
        inicio.setDate(inicio.getDate() - 7);
        fim = new Date(agora);
        break;
      case '30dias':
        inicio = new Date(agora);
        inicio.setDate(inicio.getDate() - 30);
        fim = new Date(agora);
        break;
      case 'mes':
        inicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
        fim = new Date(agora);
        break;
      default:
        inicio = new Date(agora);
        inicio.setDate(inicio.getDate() - 30);
        fim = new Date(agora);
    }
    return { inicio: inicio, fim: fim };
  };
})();

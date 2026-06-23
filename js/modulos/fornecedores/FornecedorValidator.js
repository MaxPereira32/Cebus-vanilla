(function () {
  function _extrair(obj, chaves) {
    for (var i = 0; i < chaves.length; i++) {
      if (obj[chaves[i]] !== undefined && obj[chaves[i]] !== null) return obj[chaves[i]];
    }
    return '';
  }

  function _validarCNPJ(cnpj) {
    var cnpjLimpo = cnpj.replace(/\D/g, '');
    if (cnpjLimpo.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cnpjLimpo)) return false;

    function _calcularDigito(base) {
      var soma = 0;
      var pos = base.length - 7;
      for (var i = base.length; i >= 1; i--) {
        soma += parseInt(base.charAt(base.length - i)) * pos--;
        if (pos < 2) pos = 9;
      }
      return soma % 11 < 2 ? 0 : 11 - (soma % 11);
    }

    var dig1 = _calcularDigito(cnpjLimpo.substring(0, 12));
    if (dig1 !== parseInt(cnpjLimpo.charAt(12))) return false;

    var dig2 = _calcularDigito(cnpjLimpo.substring(0, 13));
    if (dig2 !== parseInt(cnpjLimpo.charAt(13))) return false;

    return true;
  }

  function _formatarDataISO(valor) {
    if (!valor) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor;
    var partes = valor.split('/');
    if (partes.length === 3) return partes[2] + '-' + partes[1] + '-' + partes[0];
    return valor;
  }

  function _formatarDataBR(valor) {
    if (!valor) return '';
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) return valor;
    var partes = valor.split('-');
    if (partes.length === 3) return partes[2] + '/' + partes[1] + '/' + partes[0];
    return valor;
  }

  function _validarData(valor) {
    if (!valor) return false;
    var regISO = /^\d{4}-\d{2}-\d{2}$/;
    var regBR = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regISO.test(valor) && !regBR.test(valor)) return false;
    
    var partes = regISO.test(valor) ? valor.split('-') : valor.split('/');
    var ano = parseInt(regISO.test(valor) ? partes[0] : partes[2], 10);
    var mes = parseInt(regISO.test(valor) ? partes[1] : partes[1], 10) - 1;
    var dia = parseInt(regISO.test(valor) ? partes[2] : partes[0], 10);
    
    var d = new Date(ano, mes, dia);
    return d.getFullYear() === ano && d.getMonth() === mes && d.getDate() === dia;
  }
 
  var FornecedorValidator = {
    validar: function (dados) {
      var erros = [];
      var nome = _extrair(dados, ['Nome', 'nome', 'razaoSocial']);
      if (!nome || !nome.trim()) {
        erros.push('Nome/Razão Social é obrigatório');
      }
 
      var data = _extrair(dados, ['DataValidade', 'dataValidade']);
      if (!data) {
        erros.push('Data/Validade é obrigatória');
      } else if (!_validarData(data)) {
        erros.push('Data/Validade inválida');
      }
 
      var cnpj = _extrair(dados, ['CNPJ', 'cnpj']);
      if (!cnpj) {
        erros.push('CNPJ inválido.');
      } else {
        var cnpjLimpo = cnpj.replace(/\D/g, '');
        if (cnpjLimpo.length !== 14 || !_validarCNPJ(cnpjLimpo)) {
          erros.push('CNPJ inválido.');
        }
      }
 
      var email = _extrair(dados, ['Email', 'email']);
      if (email && email.indexOf('@') === -1) {
        erros.push('E-mail inválido');
      }
 
      var tel = _extrair(dados, ['Telefone', 'telefone']);
      if (!tel) {
        erros.push('Telefone inválido.');
      } else {
        var telLimpo = tel.replace(/\D/g, '');
        if (telLimpo.length < 10 || telLimpo.length > 11) {
          erros.push('Telefone inválido.');
        }
      }
 
      return {
        valido: erros.length === 0,
        erros: erros
      };
    },

    normalizar: function (dados) {
      var item = Object.assign({}, dados);
      item.Nome = _extrair(dados, ['Nome', 'nome', 'razaoSocial']);
      item.NumeroContrato = _extrair(dados, ['NumeroContrato', 'numeroContrato']);
      item.DataValidade = _formatarDataISO(_extrair(dados, ['DataValidade', 'dataValidade']));
      item.TipoProduto = _extrair(dados, ['TipoProduto', 'tipoProduto']);
      var cnpj = _extrair(dados, ['CNPJ', 'cnpj']);
      if (cnpj) item.CNPJ = cnpj.replace(/\D/g, '');
      var tel = _extrair(dados, ['Telefone', 'telefone']);
      if (tel) item.Telefone = tel.replace(/\D/g, '');
      item.Email = _extrair(dados, ['Email', 'email']);
      item.Observacoes = _extrair(dados, ['Observacoes', 'observacoes']);
      return item;
    }
  };

  window.FornecedorValidator = FornecedorValidator;
})();

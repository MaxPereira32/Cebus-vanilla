/* ==========================================================================
   ARQUIVO: FornecedorHelper.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  var FornecedorHelper = {
    formatarLista: function (fornecedores) {
      return fornecedores.map(function (f) {
        var cnpj = f.CNPJ || f.cnpj || '';
        var tel = f.Telefone || f.telefone || '';
        return Object.assign({}, f, {
          nome: f.Nome || f.nome || f.razaoSocial || '',
          cnpj: cnpj,
          telefone: tel,
          email: f.Email || f.email || '',
          tipoProduto: f.TipoProduto || f.tipoProduto || '',
          numeroContrato: f.NumeroContrato || f.numeroContrato || '',
          dataValidade: f.DataValidade || f.dataValidade || '',
          dataValidadeFormatada: (function (v) {
            if (!v) return '-';
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) return v;
            var p = v.split('-');
            if (p.length === 3) return p[2] + '/' + p[1] + '/' + p[0];
            return v;
          })(f.DataValidade || f.dataValidade || ''),
          idFornecedor: f.ID_Fornecedor || f.idFornecedor || '',
          situacao: f.situacao || 'ativo',
          cnpjFormatado: cnpj ? cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5') : '-',
          telefoneFormatado: tel
            ? (tel.length === 11
              ? tel.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
              : tel.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3'))
            : '-',
          rotuloSituacao: f.situacao === 'ativo' || f.situacao === 'Ativo' ? 'Ativo' : 'Inativo'
        });
      });
    },

    statusParaCor: function (situacao) {
      return situacao === 'ativo' ? 'sucesso' : 'neutro';
    }
  };

  window.FornecedorHelper = FornecedorHelper;
})();

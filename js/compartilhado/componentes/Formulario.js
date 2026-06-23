/* ==========================================================================
   ARQUIVO: Formulario.js
   GERADO EM: 21/06/2026
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== */

(function () {
  Cebus.componentes = Cebus.componentes || {};

  var campoCount = 0;

  Cebus.componentes.formulario = {
    renderizar: function (config) {
      var campos = config.campos || [];
      var botoes = config.botoes !== false;
      var submitLabel = config.labelSubmit || 'Salvar';
      var cancelLabel = config.labelCancelar || 'Cancelar';
      var id = config.id || 'form_' + (++campoCount);

      var html = '<form id="' + id + '" class="formulario-dinamico" data-acao="' + (config.acaoSubmit || 'submeterFormulario') + '">';
      html += '<div class="formulario-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1rem;">';

      campos.forEach(function (campo) {
        html += Cebus.componentes.formulario._renderizarCampo(campo);
      });

      html += '</div>';

      if (botoes) {
        html += '<div class="formulario-acoes" style="display:flex;gap:0.75rem;justify-content:flex-end;margin-top:1.5rem;">';
        if (config.mostrarCancelar !== false) {
          html += '<button type="button" class="btn btn-secundario" data-acao="cancelarFormulario">' + cancelLabel + '</button>';
        }
        html += '<button type="submit" class="btn btn-primario">' + submitLabel + '</button>';
        html += '</div>';
      }

      html += '</form>';
      return html;
    },

    _renderizarCampo: function (campo) {
      var tipo = campo.tipo || 'text';
      var nome = campo.nome || campo.chave || '';
      var valor = campo.valor || '';
      var obrigatorio = campo.obrigatorio ? 'required' : '';
      var placeholder = campo.placeholder || '';
      var label = campo.rotulo || nome;
      var dica = campo.dica || '';
      var desabilitado = campo.desabilitado ? 'disabled' : '';

      var html = '<div class="campo-formulario" style="display:flex;flex-direction:column;gap:0.375rem;">';
      html += '<label style="font-size:0.875rem;font-weight:500;color:var(--cor-texto);">' + label + (obrigatorio ? ' <span style="color:var(--cor-perigo);">*</span>' : '') + '</label>';

      var idAttr = campo.id ? ' id="' + campo.id + '"' : '';
      var classAttr = campo.classe ? ' class="' + campo.classe + '"' : '';

      switch (tipo) {
        case 'textarea':
          html += '<textarea name="' + nome + '"' + idAttr + classAttr + ' ' + obrigatorio + ' ' + desabilitado + ' placeholder="' + placeholder + '" style="padding:0.625rem;border-radius:0.5rem;border:1px solid var(--cor-borda);background:var(--cor-fundo);color:var(--cor-texto);resize:vertical;min-height:100px;font-family:inherit;">' + valor + '</textarea>';
          break;
        case 'select':
          html += '<select name="' + nome + '"' + idAttr + classAttr + ' ' + obrigatorio + ' ' + desabilitado + ' style="padding:0.625rem;border-radius:0.5rem;border:1px solid var(--cor-borda);background:var(--cor-fundo);color:var(--cor-texto);font-family:inherit;">';
          html += '<option value="">' + (placeholder || 'Selecione...') + '</option>';
          (campo.opcoes || []).forEach(function (op) {
            var sel = (typeof op === 'string' ? op : op.valor) === valor ? 'selected' : '';
            html += '<option value="' + (typeof op === 'string' ? op : op.valor) + '" ' + sel + '>' + (typeof op === 'string' ? op : op.rotulo) + '</option>';
          });
          html += '</select>';
          break;
        case 'checkbox':
          html += '<label class="campo-checkbox" style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;">';
          html += '<input type="checkbox" name="' + nome + '"' + idAttr + classAttr + ' ' + (valor ? 'checked' : '') + ' ' + desabilitado + ' style="width:1rem;height:1rem;accent-color:var(--cor-primaria);">';
          html += '<span style="color:var(--cor-texto);font-size:0.875rem;">' + placeholder + '</span></label>';
          break;
        case 'color':
          html += '<div style="display:flex;align-items:center;gap:0.5rem;"><input type="color" name="' + nome + '"' + idAttr + classAttr + ' value="' + (valor || '#10b981') + '" style="width:2.5rem;height:2.5rem;border:none;border-radius:0.5rem;cursor:pointer;background:none;"><span style="color:var(--cor-texto-secundario);font-size:0.8rem;">' + valor + '</span></div>';
          break;
        default:
          var inputType = tipo === 'number' ? 'number' : tipo === 'email' ? 'email' : tipo === 'password' ? 'password' : tipo === 'date' ? 'date' : 'text';
          var mascaraAttr = campo.mascara ? ' data-mascara="' + campo.mascara + '"' : '';
          html += '<input type="' + inputType + '" name="' + nome + '"' + idAttr + classAttr + ' value="' + valor + '" ' + obrigatorio + ' ' + desabilitado + ' placeholder="' + placeholder + '"' + mascaraAttr + ' style="padding:0.625rem;border-radius:0.5rem;border:1px solid var(--cor-borda);background:var(--cor-fundo);color:var(--cor-texto);font-family:inherit;width:100%;box-sizing:border-box;">';
      }

      if (dica) {
        html += '<span style="font-size:0.75rem;color:var(--cor-texto-secundario);">' + dica + '</span>';
      }
      html += '</div>';
      return html;
    },

    extrairDados: function (formId) {
      var form = document.getElementById(formId);
      if (!form) return {};
      var dados = {};
      var elementos = form.querySelectorAll('input, select, textarea');
      elementos.forEach(function (el) {
        if (el.type === 'checkbox') {
          dados[el.name] = el.checked;
        } else if (el.type === 'number') {
          dados[el.name] = parseFloat(el.value) || 0;
        } else {
          dados[el.name] = el.value;
        }
      });
      return dados;
    },

    preencher: function (formId, dados) {
      var form = document.getElementById(formId);
      if (!form) return;
      Object.keys(dados).forEach(function (chave) {
        var el = form.querySelector('[name="' + chave + '"]');
        if (!el) return;
        if (el.type === 'checkbox') { el.checked = !!dados[chave]; }
        else { el.value = dados[chave]; }
      });
    },

    limpar: function (formId) {
      var form = document.getElementById(formId);
      if (!form) return;
      form.querySelectorAll('input:not([type="checkbox"]), select, textarea').forEach(function (el) {
        el.value = '';
      });
      form.querySelectorAll('input[type="checkbox"]').forEach(function (el) {
        el.checked = false;
      });
    },
  };
})();

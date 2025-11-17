    // Script simples para alternar entre CPF e CNPJ
    document.getElementById('tipo').addEventListener('change', function () {
      const tipo = this.value;
      document.getElementById('campo-cpf').style.display = tipo === 'fisica' ? 'block' : 'none';
      document.getElementById('campo-cnpj').style.display = tipo === 'juridica' ? 'block' : 'none';
    });
const tipo = document.getElementById('tipo');
    const campoCpf = document.getElementById('campo-cpf');
    const campoCnpj = document.getElementById('campo-cnpj');

    tipo.addEventListener('change', () => {
      if (tipo.value === 'fisica') {
        campoCpf.style.display = 'block';
        campoCnpj.style.display = 'none';
      } else if (tipo.value === 'juridica') {
        campoCpf.style.display = 'none';
        campoCnpj.style.display = 'block';
      } else {
        campoCpf.style.display = 'none';
        campoCnpj.style.display = 'none';
      }
    });
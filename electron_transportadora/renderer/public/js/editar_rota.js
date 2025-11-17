const funcInput = document.getElementById('funcionario');
const sugestoesFunc = document.getElementById('sugestoes-func');

funcInput.addEventListener('input', async () => {
  const termo = funcInput.value.trim();
  if (!termo) {
    sugestoesFunc.innerHTML = '';
    return;
  }

  try {
    // 🔥 Corrigido: caminho direto para /funcionarios/buscar
    const res = await fetch(`${window.location.origin}/funcionarios/buscar?q=${encodeURIComponent(termo)}`);
    const dados = await res.json();

    sugestoesFunc.innerHTML = '';
    dados.forEach(f => {
      const div = document.createElement('div');
      div.textContent = f.nome;
      div.classList.add('suggestion-item');

      div.addEventListener('click', () => {
        funcInput.value = f.nome;
        sugestoesFunc.innerHTML = '';
      });

      sugestoesFunc.appendChild(div);
    });
  } catch (err) {
    console.error('Erro ao buscar funcionários:', err);
  }
});

// ==========================
// AUTOCOMPLETE VEÍCULO
// ==========================
const modeloInput = document.getElementById('modelo');
const sugestoesVeic = document.getElementById('sugestoes-veic');
const placaInput = document.getElementById('placa');

modeloInput.addEventListener('input', async () => {
  const termo = modeloInput.value.trim();
  if (!termo) {
    sugestoesVeic.innerHTML = '';
    placaInput.value = '';
    return;
  }

  try {
    // 🔥 Corrigido: caminho direto para /veiculos/buscar
    const res = await fetch(`${window.location.origin}/veiculos/buscar?q=${encodeURIComponent(termo)}`);
    const dados = await res.json();

    sugestoesVeic.innerHTML = '';
    dados.forEach(v => {
      const div = document.createElement('div');
      div.textContent = `${v.modelo} (${v.placa})`;
      div.classList.add('suggestion-item');

      div.addEventListener('click', () => {
        modeloInput.value = v.modelo;
        placaInput.value = v.placa;
        sugestoesVeic.innerHTML = '';
      });

      sugestoesVeic.appendChild(div);
    });
  } catch (err) {
    console.error('Erro ao buscar veículos:', err);
  }
});
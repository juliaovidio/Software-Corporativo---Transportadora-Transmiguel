// debug autocomplete - public/js/adicionar_f_rota.js
const inputTrajeto = document.getElementById('trajeto');
const hiddenTrajetoId = document.getElementById('trajetos_idTrajetos');
const sugestoesDiv = document.getElementById('sugestoes-trajeto');

console.log('autocomplete script carregado', { inputTrajeto, hiddenTrajetoId, sugestoesDiv });

if (!inputTrajeto) {
  console.error('Elemento #trajeto não encontrado. Verifique o id no HTML e o caminho do script.');
}

inputTrajeto && inputTrajeto.addEventListener('input', async () => {
  const query = inputTrajeto.value.trim();
  // limpa id quando usuário muda o texto (seleção anterior não vale mais)
  if (hiddenTrajetoId) hiddenTrajetoId.value = '';

  if (!query) {
    sugestoesDiv && (sugestoesDiv.innerHTML = '');
    return;
  }

  try {
    console.log('Buscando trajetos para:', query);
    const res = await fetch(`/financeiro_rota/trajetos/buscar?q=${encodeURIComponent(query)}`);
    if (!res.ok) {
      throw new Error(`Resposta não OK: ${res.status}`);
    }
    const trajetos = await res.json();
    console.log('Resposta trajetos:', trajetos);

    if (!sugestoesDiv) {
      console.warn('#sugestoes-trajeto não encontrado');
      return;
    }
    sugestoesDiv.innerHTML = '';

    trajetos.forEach(t => {
      const div = document.createElement('div');
      div.className = 'suggestion-item';
      div.textContent = t.descricao ?? t.trajeto_text ?? String(t);
      div.dataset.id = t.id ?? '';
      // usa pointerdown / mousedown para garantir que o valor seja setado antes do document click
      div.addEventListener('pointerdown', (ev) => {
        ev.preventDefault(); // evita focus/blur estranho
        ev.stopPropagation();
        console.log('sugestão clicada (pointerdown):', div.textContent, div.dataset.id);
        if (inputTrajeto) inputTrajeto.value = div.textContent;
        if (hiddenTrajetoId) hiddenTrajetoId.value = div.dataset.id || '';
        // limpa sugestões
        sugestoesDiv.innerHTML = '';
      });
      sugestoesDiv.appendChild(div);
    });

  } catch (err) {
    console.error('Erro ao buscar trajetos:', err);
    sugestoesDiv && (sugestoesDiv.innerHTML = '');
  }
});

// Fecha sugestões ao clicar fora (mantém, mas não limpa o input)
document.addEventListener('click', (e) => {
  if (!sugestoesDiv) return;
  if (!sugestoesDiv.contains(e.target) && e.target !== inputTrajeto) {
    sugestoesDiv.innerHTML = '';
  }
});
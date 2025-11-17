// Autocomplete simples para o campo "nome" com preenchimento automático da rota
document.addEventListener('DOMContentLoaded', () => {
  const nomeInput = document.getElementById('nome');
  const suggestionsEl = document.getElementById('suggestions');
  const passageiroIdInput = document.getElementById('passageiro_idPassageiro');
  const rotaInput = document.getElementById('rota');       // campo visível da rota
  const rotaHidden = document.getElementById('rota_hidden'); // campo hidden para envio

  let debounceTimer = null;
  let currentItems = [];
  let selectedIndex = -1;

  function clearSuggestions() {
    suggestionsEl.innerHTML = '';
    currentItems = [];
    selectedIndex = -1;
  }

  function renderSuggestions(items) {
    clearSuggestions();
    if (!items.length) return;

    items.forEach((it, idx) => {
      const li = document.createElement('li');
      li.textContent = `${it.nome}${it.rota ? ' — ' + it.rota : ''}`;
      li.tabIndex = 0;
      li.dataset.index = idx;

      li.addEventListener('click', () => selectItem(idx));
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') selectItem(idx);
      });

      suggestionsEl.appendChild(li);
    });

    currentItems = items;
  }

  function selectItem(idx) {
    const item = currentItems[idx];
    if (!item) return;

    nomeInput.value = item.nome;
    passageiroIdInput.value = item.idPassageiro;

    // Preenche os campos da rota
    rotaInput.value = item.rota || '';
    if (rotaHidden) rotaHidden.value = item.rota || '';

    clearSuggestions();
  }

  function fetchSuggestions(term) {
    const url = `/financeiro_passageiro/api/passageiros?term=${encodeURIComponent(term)}`;
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Erro na requisição');
        return res.json();
      })
      .then(data => renderSuggestions(data))
      .catch(err => {
        console.error('Erro ao buscar passageiros:', err);
        clearSuggestions();
      });
  }

  nomeInput.addEventListener('input', (e) => {
    const term = e.target.value.trim();
    passageiroIdInput.value = '';
    rotaInput.value = '';
    if (rotaHidden) rotaHidden.value = '';

    if (debounceTimer) clearTimeout(debounceTimer);
    if (!term) {
      clearSuggestions();
      return;
    }

    debounceTimer = setTimeout(() => fetchSuggestions(term), 250);
  });

  // Navegação por teclado nas sugestões
  nomeInput.addEventListener('keydown', (e) => {
    const items = suggestionsEl.querySelectorAll('li');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
      updateActive(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 0, 0);
      updateActive(items);
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < currentItems.length) {
        e.preventDefault();
        selectItem(selectedIndex);
      }
    } else if (e.key === 'Escape') {
      clearSuggestions();
    }
  });

  function updateActive(items) {
    items.forEach((li, i) => {
      li.classList.toggle('active', i === selectedIndex);
    });
  }

  // Fechar sugestões ao clicar fora
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.campo')) clearSuggestions();
  });
});
document.addEventListener('DOMContentLoaded', () => {
  const nomeInput = document.getElementById('nome');
  const hiddenId = document.getElementById('passageiro_idPassageiro');
  const suggestions = document.getElementById('suggestions');

  nomeInput.addEventListener('input', async () => {
    const term = nomeInput.value.trim();
    suggestions.innerHTML = '';

    if (term.length < 2) return; // espera digitar pelo menos 2 letras

    const res = await fetch(`/financeiro_passageiro/api/passageiros?term=${encodeURIComponent(term)}`);
    const data = await res.json();

    data.forEach(p => {
      const li = document.createElement('li');
      li.textContent = p.nome + (p.rota ? ` (${p.rota})` : '');
      li.dataset.id = p.idPassageiro;

      li.addEventListener('click', () => {
        nomeInput.value = p.nome;
        hiddenId.value = p.idPassageiro;
        suggestions.innerHTML = '';
      });

      suggestions.appendChild(li);
    });
  });

  document.addEventListener('click', (e) => {
    if (!suggestions.contains(e.target) && e.target !== nomeInput) {
      suggestions.innerHTML = '';
    }
  });
});


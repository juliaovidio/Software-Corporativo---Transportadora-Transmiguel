const searchInput = document.getElementById('search-input');
    const resultsDiv = document.getElementById('autocomplete-results');
    let timeout = null;

    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim();
      clearTimeout(timeout);

      if (!query) {
        resultsDiv.style.display = 'none';
        return;
      }

      timeout = setTimeout(() => {
        fetch(`/motoristas/buscar?q=${encodeURIComponent(query)}`)
          .then(res => res.json())
          .then(data => {
            if (data.length === 0) {
              resultsDiv.style.display = 'none';
              return;
            }

            resultsDiv.innerHTML = '';
            data.forEach(item => {
              const div = document.createElement('div');
              div.textContent = item;
              div.addEventListener('click', () => {
                searchInput.value = item;
                resultsDiv.style.display = 'none';
              });
              resultsDiv.appendChild(div);
            });
            resultsDiv.style.display = 'block';
          })
          .catch(() => resultsDiv.style.display = 'none');
      }, 300);
    });

    document.addEventListener('click', (e) => {
      if (!resultsDiv.contains(e.target) && e.target !== searchInput) {
        resultsDiv.style.display = 'none';
      }
    });
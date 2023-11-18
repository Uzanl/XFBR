function toggleSidebar() {
  var sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('active');
  var toggleBtn = document.querySelector('.toggle-btn');
  toggleBtn.classList.toggle('active');
}

document.addEventListener('DOMContentLoaded', function () {
  const searchBox = document.querySelector('.search-box');
  const ClearButton = document.querySelector('.clear-button');
  const suggestionContainer = document.querySelector('.suggestion-container');
  const suggestionList = document.querySelector('.suggestion-list');

  searchBox.addEventListener('input', function () {
    const inputText = searchBox.value.trim().toLowerCase();

    if (inputText === '') {
      suggestionContainer.style.display = 'none';
      ClearButton.style.display = 'none';
      return;
    }

    (inputText.length > 0) ? ClearButton.style.display = 'block' : ClearButton.style.display = 'none';

    fetch(`/search?term=${inputText}`)
      .then(response => response.json())
      .then(data => {
        const suggestions = data.results;
        suggestionList.innerHTML = '';
        suggestions.forEach(suggestion => {
          const suggestionItem = document.createElement('li');
          suggestionItem.classList.add('suggestion-item');
          (suggestion.tipo === 'usuário') ? suggestionItem.textContent = `Usuário: ${suggestion.resultado}` : suggestionItem.textContent = `Artigo: ${suggestion.resultado}`;

          suggestionItem.addEventListener('click', function () {
            (suggestion.tipo === 'usuário') ? window.location.href = `perfil.html?id=${suggestion.id}` : window.location.href = `artigo.html?id=${suggestion.id}`;
          });

          suggestionList.appendChild(suggestionItem);
        });

        if (suggestions.length > 0) {
          suggestionContainer.style.display = 'block';
          ClearButton.style.display = 'block';

        } else {
          suggestionContainer.style.display = 'none';
        }
      })
      .catch(error => {
        console.error('Erro ao obter sugestões do servidor:', error);
      });
  });
  
  // Fechar a lista de sugestões quando clicar fora dela
  document.addEventListener('click', function (event) {
    if (!event.target.closest('.suggestion-container')) {
      suggestionContainer.style.display = 'none';
    }
  });
});

function clearSearch() {
  const ClearButton = document.querySelector('.clear-button');
  ClearButton.style.display = 'none';
  document.querySelector('.search-box').value = '';
}
// search.js (módulo JavaScript)
const toggleBtn = document.querySelector('.toggle-btn');
const searchBox = document.querySelector('.search-box');
const clearButton = document.querySelector('.clear-button');
const suggestionList = document.querySelector('.suggestion-list');
const sidebar = document.querySelector('.sidebar');

document.addEventListener('click', function (event) {
  if (!event.target.closest('.suggestion-list') && !event.target.closest('.search-box')) {
    suggestionList.style.display = 'none';
  }
});

clearButton.addEventListener('click', function () {
  clearButton.style.display = 'none';
  searchBox.value = '';
  suggestionList.style.display = 'none';
});

toggleBtn.addEventListener('click', function () {
  sidebar.classList.toggle('active');
  toggleBtn.classList.toggle('active');
});

searchBox.addEventListener('input', async function () {
  const inputText = searchBox.value.trim().toLowerCase();

  if (inputText === '') {
    suggestionList.style.display = 'none';
    clearButton.style.display = 'none';
    return;
  }

  clearButton.style.display = inputText.length > 0 ? 'block' : 'none';

  try {
    const response = await fetch(`/search?term=${inputText}`);
    const data = await response.json();
    const suggestions = data.results;

    suggestionList.innerHTML = '';

    suggestions.forEach((suggestion, index) => {
      const suggestionItem = document.createElement('li');
      suggestionItem.classList.add('suggestion-item');
      suggestionItem.textContent = suggestion.tipo === 'usuário' ? `Usuário: ${suggestion.resultado}` : `Artigo: ${suggestion.resultado}`;

      suggestionItem.addEventListener('click', function () {
        window.location.href = suggestion.tipo === 'usuário' ? `perfil?id=${suggestion.id}` : `artigo?id=${suggestion.id}`;
      });

      suggestionItem.addEventListener('mouseenter', function () {
        highlightSuggestion(index);
      });

      suggestionList.appendChild(suggestionItem);
    });

    suggestionList.style.display = suggestions.length > 0 ? 'block' : 'none';
  } catch (error) {
    console.error('Erro ao obter sugestões do servidor:', error);
  }
});

let highlightedIndex = -1;

searchBox.addEventListener('keydown', function (e) {
  const suggestions = suggestionList.querySelectorAll('.suggestion-item');
  if (e.key === 'ArrowDown') {
    highlightedIndex = Math.min(highlightedIndex + 1, suggestions.length - 1);
    highlightSuggestion(highlightedIndex);
  } else if (e.key === 'ArrowUp') {
    highlightedIndex = Math.max(highlightedIndex - 1, -1);
    highlightSuggestion(highlightedIndex);
  } else if (e.key === 'Enter') {
    if (highlightedIndex >= 0) {
      const selectedItem = suggestions[highlightedIndex];
      selectedItem.click();
    }
  }
});

function highlightSuggestion(index) {
  const suggestions = suggestionList.querySelectorAll('.suggestion-item');
  suggestions.forEach((item, idx) => {
    item.classList.toggle('active', idx === index);
  });
}

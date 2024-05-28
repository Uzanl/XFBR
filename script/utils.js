// script.js
const toggleBtn = document.querySelector('.toggle-btn');
const searchBox = document.querySelector('.search-box');
const clearButton = document.querySelector('.clear-button');
const suggestionContainer = document.querySelector('.suggestion-container');
const suggestionList = document.querySelector('.suggestion-list');

let currentIndex = -1;

document.addEventListener('click', function (event) {
  if (!event.target.closest('.suggestion-container') && !event.target.closest('.search-box')) {
    suggestionContainer.style.display = 'none';
  }
});

clearButton.addEventListener('click', function () {
  clearButton.style.display = 'none';
  searchBox.value = '';
  suggestionContainer.style.display = 'none';
});

toggleBtn.addEventListener('click', function () {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('active');
  toggleBtn.classList.toggle('active');
});

searchBox.addEventListener('input', async function () {
  const inputText = searchBox.value.trim().toLowerCase();

  if (inputText === '') {
    suggestionContainer.style.display = 'none';
    clearButton.style.display = 'none';
    return;
  }

  clearButton.style.display = inputText.length > 0 ? 'block' : 'none';

  try {
    const response = await fetch(`/search?term=${inputText}`);
    const data = await response.json();
    const suggestions = data.results;

    suggestionList.innerHTML = '';

    suggestions.forEach(suggestion => {
      const suggestionItem = document.createElement('li');
      suggestionItem.classList.add('suggestion-item');
      suggestionItem.textContent = suggestion.tipo === 'usuário' ? `Usuário: ${suggestion.resultado}` : `Artigo: ${suggestion.resultado}`;

      suggestionItem.addEventListener('click', function () {
        window.location.href = suggestion.tipo === 'usuário' ? `perfil.html?id=${suggestion.id}` : `artigo.html?id=${suggestion.id}`;
      });

      suggestionList.appendChild(suggestionItem);
    });

    suggestionContainer.style.display = suggestions.length > 0 ? 'block' : 'none';
    currentIndex = -1; // Reset index after fetching new suggestions
  } catch (error) {
    console.error('Erro ao obter sugestões do servidor:', error);
  }
});

searchBox.addEventListener('keydown', function (e) {
 
  const suggestions = suggestionList.querySelectorAll('.suggestion-item');
  if (e.key === 'ArrowDown') {
    if (currentIndex < suggestions.length - 1) {
      currentIndex++;
    }
    highlightSuggestion(suggestions, currentIndex);
  } else if (e.key === 'ArrowUp') {
    if (currentIndex > 0) {
      currentIndex--;
    }
    highlightSuggestion(suggestions, currentIndex);
  } else if (e.key === 'Enter') {
    if (currentIndex >= 0) {
      const selectedItem = suggestions[currentIndex];
      selectedItem.click();
    }
  }
});

function highlightSuggestion(suggestions, index) {
  suggestions.forEach((item, idx) => {
    item.classList.toggle('active', idx === index);
  });
}
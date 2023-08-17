import { updateLoginButtonVisibility } from './auth.js';

// Chamar a função para atualizar a visibilidade do botão de login ao carregar a página
updateLoginButtonVisibility();

import { redirectToArticlePage } from './articleRedirect.js';


const publishButton = document.getElementById("publish-link");

// Adicione um ouvinte de evento para o botão de publicação
publishButton.addEventListener('click', redirectToArticlePage);




//const publishButtons = document.querySelectorAll('.publish-button');
//publishButtons.forEach((button) => {
//  button.addEventListener('click', redirectToArticlePage);
//});



document.addEventListener('DOMContentLoaded', function() {
    const searchBox = document.querySelector('.search-box');
    const suggestionContainer = document.querySelector('.suggestion-container');
    const suggestionList = document.querySelector('.suggestion-list');
  
    // Sugestões de exemplo
    const suggestions = ['Sugestão 1', 'Sugestão 2', 'Sugestão 3', 'Sugestão 4'];
  
    searchBox.addEventListener('input', function() {
      const inputText = searchBox.value.toLowerCase();
      const filteredSuggestions = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(inputText)
      );
  
      suggestionList.innerHTML = '';
  
      filteredSuggestions.forEach(suggestion => {
        const suggestionItem = document.createElement('li');
        suggestionItem.classList.add('suggestion-item');
        suggestionItem.textContent = suggestion;
        suggestionList.appendChild(suggestionItem);
      });
  
      if (inputText.trim() === '') {
        suggestionContainer.style.display = 'none';
      } else if (filteredSuggestions.length > 0) {
        suggestionContainer.style.display = 'block';
      } else {
        suggestionContainer.style.display = 'none';
      }
    });
  
    // Fechar a lista de sugestões quando clicar fora dela
    document.addEventListener('click', function(event) {
      if (!event.target.closest('.suggestion-container')) {
        suggestionContainer.style.display = 'none';
      }
    });
  });
  
  


  
  

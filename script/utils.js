const toggleBtn = document.querySelector('.toggle-btn');
const searchBox = document.querySelector('.search-box');
const clearButton = document.querySelector('.clear-button');
const suggestionList = document.querySelector('.suggestion-list');
const aside = document.querySelector('aside');
const logoutButton = document.getElementById('btnLogout');
const upBtn = document.querySelector('.up');


if (upBtn) {
  upBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.body.scrollHeight;
    const scrollPercent = (scrollPosition / (documentHeight - windowHeight)) * 100;

    if (scrollPercent > 25) {
      upBtn.classList.add('show');
    } else {
      upBtn.classList.remove('show');
    }
  });

}

document.addEventListener('click', function (event) {
  if (!event.target.closest('.suggestion-list') && !event.target.closest('.search-box')) {
    suggestionList.style.display = 'none';
  }
});

clearButton.addEventListener('click', () => {
  clearButton.style.display = 'none';
  searchBox.value = '';
  suggestionList.style.display = 'none';
});

toggleBtn.addEventListener('click', function () {
  aside.classList.toggle('active');
  toggleBtn.classList.toggle('active');
  const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';

  toggleBtn.setAttribute('aria-expanded', !isExpanded);
  aside.hidden = isExpanded;
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
        const path = suggestion.tipo === 'usuário'
          ? `/perfil?page=1&id=${suggestion.id}`
          : `/artigo/${suggestion.id}`;
        window.location.href = path; // Caminho relativo a partir da raiz do site
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

if (logoutButton) {
  logoutButton.addEventListener('click', async () => {
    const shouldLogout = window.confirm("Tem certeza de que deseja sair?");
    if (shouldLogout) {
      try {
        const response = await fetch("/logout");
        if (!response.ok) {
          throw new Error("Erro ao fazer logout");
        }
        window.location.href = "/login";
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
      }
    }
  });
}

document.querySelectorAll('.submenu').forEach(menu => {
  menu.addEventListener('mouseenter', () => {
      menu.setAttribute('aria-expanded', 'true');
  });
  menu.addEventListener('mouseleave', () => {
      menu.setAttribute('aria-expanded', 'false');
  });
});

document.querySelector('.submenu-page-pallet').addEventListener('click', function() {
  const img = document.getElementById('toggle-img');
  const moonSrc = '/moon.png';
  const sunSrc = '/sun.png';
  const htmlElement = document.documentElement;

  // Verifica se a imagem atual é a lua
  if (img.src.endsWith(moonSrc)) {
    // Troca para o sol e adiciona a classe 'sun'
    img.src = sunSrc;
    htmlElement.classList.add('sun');

    // Troca as imagens twitter e discord para as versões do dia
    document.getElementById('twitter-img').src = '/tt-day.webp';
    document.getElementById('discord-img').src = '/dc-day.webp';
    document.getElementById('img-up').src = '/up.webp';
  } else {
    // Caso contrário, troca para a lua e remove a classe 'sun'
    img.src = moonSrc;
    htmlElement.classList.remove('sun');

    // Volta as imagens twitter e discord para as versões originais
    document.getElementById('twitter-img').src = '/tt.webp';
    document.getElementById('discord-img').src = '/dc.webp';
    document.getElementById('img-up').src = '/upw.webp';
  }
});

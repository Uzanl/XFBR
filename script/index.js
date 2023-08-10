import { updateLoginButtonVisibility } from './auth.js';

// Chamar a função para atualizar a visibilidade do botão de login ao carregar a página
updateLoginButtonVisibility();

import { redirectToArticlePage } from './articleRedirect.js';

const publishButtons = document.querySelectorAll('.publish-button');
publishButtons.forEach((button) => {
  button.addEventListener('click', redirectToArticlePage);
});





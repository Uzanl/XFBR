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





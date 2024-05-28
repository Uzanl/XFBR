import { isLoggedIn, updateLoginButtonVisibility } from './auth.js';

async function redirectToArticlePage() {
  document.querySelector('#publish-link').addEventListener('click', async () => {
    await updateLoginButtonVisibility(); // Certifique-se de que o status de login está atualizado
    isLoggedIn ? window.location.href = "/editor.html" : window.location.href = "/login.html";
  });
}

redirectToArticlePage();

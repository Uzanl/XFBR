
import { updateLoginButtonVisibility } from './auth.js';

// Chamar a função para atualizar a visibilidade do botão de login ao carregar a página
updateLoginButtonVisibility();



document.getElementById('login-form').addEventListener('submit', function (event) {
  event.preventDefault(); // Evita o envio tradicional do formulário
 
  
  const formData = new FormData(this);


  fetch("/login", {
    method: "POST",
    credentials: 'include', 
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(Object.fromEntries(formData)) // Envia os dados no formato JSON
    // Incluir cookies na solicitação
  })
  .then(response => response.json()) // Espera uma resposta JSON do servidor
  .then(data => {
    if (data.error) {
      document.getElementById('error-message').textContent = data.error;
    } else if (data.success) {
      console.log('Login bem-sucedido');
      window.location.href = data.redirect; // Redireciona em caso de sucesso
    } else {
      console.log('Login falhou');
      document.getElementById('error-message').textContent = 'Login falhou. Verifique seu email e senha.';
    }
  }) 
});



function redirectToArticlePage() {
  fetch("http://localhost:3000/checkLoginStatus", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Response from server:", data); // Adicionando o console.log para verificar a resposta do servidor
      if (data.isLoggedIn) {
        window.location.href = "/editor.html"; // Redirecionar para a página de edição
      } else {
        window.location.href = "/login.html"; // Redirecionar para a página de login
      }
    })
    .catch((error) => {
      console.error("Error checking login status:", error);
    });
}

const publishButtons = document.querySelectorAll('.publish-button');
publishButtons.forEach((button) => {
  button.addEventListener('click', redirectToArticlePage);
});



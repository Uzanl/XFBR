


import { updateLoginButtonVisibility } from './auth.js';

// Chamar a função para atualizar a visibilidade do botão de login ao carregar a página
updateLoginButtonVisibility();


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

function toggleSidebar() {
  var sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('active');
  var toggleBtn = document.querySelector('.toggle-btn');
  toggleBtn.classList.toggle('active');
}



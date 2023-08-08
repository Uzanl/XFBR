function submitLoginForm() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  fetch("http://localhost:3000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include', // Incluir cookies na solicitação
  })
    .then((response) => response.json())
    .then((data) => {
      // Aqui você pode tratar a resposta do servidor após a autenticação
      if (data.message === "Login successful") {
        // Redirecionar para a página de notícias
        window.location.href = data.redirect;
      } else {
        alert("Login falhou. Verifique seu email e senha.");
      }
    })
    .catch((error) => {
      console.error("Erro no envio do formulário:", error);
    });
}

function toggleSidebar() {
  var sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('active');
  var toggleBtn = document.querySelector('.toggle-btn');
  toggleBtn.classList.toggle('active');
}

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

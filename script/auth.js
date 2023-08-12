// auth.js

function updateLoginButtonVisibility() {
  fetch("http://localhost:3000/checkLoginStatus")
    .then((response) => response.json())
    .then((data) => {
      console.log("Response from server:", data);
      const loginButton = document.querySelector('.login-list-item'); // Botão de login
      const logoutButton = document.querySelector('.logout-button'); // Botão de logout
      
      if (data.isLoggedIn) {
        //loginButton.style.display = 'none'; // Ocultar o botão de login se o usuário estiver autenticado
        logoutButton.style.visibility = 'visible';
        loginButton.style.display = 'none'; // Exibir o botão de logout se o usuário estiver autenticado
      } else {
        loginButton.style.visibility = 'visible';
        logoutButton.style.visibility = 'none' // Exibir o botão de login se o usuário não estiver autenticado
        //logoutButton.style.display = 'none'; // Ocultar o botão de logout se o usuário não estiver autenticado
      }
    })
    .catch((error) => {
      console.error("Error checking login status:", error);
    });
}

// Mostrar o botão após o carregamento completo da página
document.addEventListener("DOMContentLoaded", () => {
  updateLoginButtonVisibility();
});

export { updateLoginButtonVisibility };

document.addEventListener("DOMContentLoaded", () => {
  updateLoginButtonVisibility();

  const logoutButtonListItem = document.querySelector('.logout-button'); // Pegar o elemento <li> com a classe logout-button
  
  if (logoutButtonListItem) { // Verificar se o elemento existe
    logoutButtonListItem.addEventListener('click', () => {
      const shouldLogout = window.confirm("Tem certeza de que deseja sair?"); // Mostrar um alerta de confirmação
    
      if (shouldLogout) {
        fetch("http://localhost:3000/logout")
          .then((response) => response.json())
          .then((data) => {
            // Redirecionar o usuário para a página de login após o logout
            window.location.href = "/login.html";
          })
          .catch((error) => {
            console.error("Error logging out:", error);
          });
      }
    });
  }
});


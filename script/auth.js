// auth.js

function updateLoginButtonVisibility() {
  fetch("http://localhost:3000/checkLoginStatus")
    .then((response) => response.json())
    .then((data) => {
      console.log("Response from server:", data);
      const loginButton = document.querySelector('.login-list-item');
      if (!data.isLoggedIn) { // Exibir o botão somente se o usuário não estiver autenticado
        loginButton.style.display = 'block';
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

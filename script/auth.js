  const loginButton = document.querySelector('.login-list-item');
  const logoutButton = document.querySelector('.logout-button');
  const profileButton = document.getElementById('item-profile');
  const cmbStatusNews = document.querySelector('.status-news'); // Certifique-se de que este seletor está correto

  let isLoggedIn = false; // Variável para armazenar o status de login

  async function updateLoginButtonVisibility() {
    try {
      const response = await fetch("/getUserStatus");
      const data = await response.json();
      console.log("Response from server:", data);

      isLoggedIn = data.isLoggedIn; // Atualiza a variável com o status de login
      const { tipoUsuario } = data;
      const isLoginPage = window.location.pathname.includes('login.html');

      if (isLoginPage) {
        if (loginButton) loginButton.style.display = isLoggedIn ? 'none' : 'flex';
      } else {
        if (loginButton) loginButton.style.display = isLoggedIn ? 'none' : 'flex';

        logoutButton.style.display = isLoggedIn ? 'flex' : 'none';
        profileButton.style.display = isLoggedIn ? 'flex' : 'none';
        cmbStatusNews.style.display = tipoUsuario === "administrador" ? 'flex' : 'none';
      }
    } catch (error) {
      console.error("Error checking login status:", error);
    }
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
          window.location.href = "/login.html";
        } catch (error) {
          console.error("Erro ao fazer logout:", error);
        }
      }
    });
  }

  updateLoginButtonVisibility();

  // Exportando as variáveis e funções se necessário
  window.isLoggedIn = isLoggedIn;
  window.updateLoginButtonVisibility = updateLoginButtonVisibility;
  export{isLoggedIn, updateLoginButtonVisibility}


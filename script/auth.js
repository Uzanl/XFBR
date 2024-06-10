const loginButton = document.querySelector('.login-list-item');
const logoutButton = document.querySelector('.logout-button');
const profileButton = document.getElementById('item-profile');
const cmbStatusNews = document.querySelector('.status-news'); // Certifique-se de que este seletor está correto

let isLoggedIn = false; // Variável para armazenar o status de login

async function updateLoginButtonVisibility() {
  try {
    const response = await fetch("/getUserStatus");
    const data = await response.json();
    //console.log("Response from server:", data);
   
    isLoggedIn = data.isLoggedIn; // Atualiza a variável com o status de login
    const { tipoUsuario } = data;
    const isLoginPage = window.location.pathname.includes('login.html');


    
    // Atualizar a imagem do perfil com a URL recebida do servidor
    const profileImage = document.querySelector('.logout-image');
    if (profileImage && data.imgpath) {
      profileImage.src = data.imgpath;
    } else {
      profileImage.src = "/profile.png"
    }

    if (isLoginPage) {
      if (loginButton) loginButton.style.display = isLoggedIn ? 'none' : 'flex';
    } else {
      if (loginButton) loginButton.style.display = isLoggedIn ? 'none' : 'flex';

      logoutButton.style.display = isLoggedIn ? 'flex' : 'none';
      profileButton.style.display = isLoggedIn ? 'flex' : 'none';

      if (cmbStatusNews) cmbStatusNews.style.display = tipoUsuario === "administrador" ? 'flex' : 'none';
      

      // Adicionar link no botão de perfil se o usuário estiver autenticado
     if (isLoggedIn) {
        const userId = data.idUsu; // Supondo que você tenha o ID do usuário disponível
        const pageNumber = 1; // Definir o número da página como 1
        const perfilLink = `perfil.html?page=${pageNumber}&id=${userId}`;
        const profileButton = document.getElementById('item-profile').querySelector('a');
        profileButton.href = perfilLink;
      }


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
export { isLoggedIn, updateLoginButtonVisibility }


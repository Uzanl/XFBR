// auth.js

//import Cookies from 'js-cookie';

// auth.js

function updateLoginButtonVisibility() {
  fetch("http://localhost:3000/checkLoginStatus")
    .then((response) => response.json())
    .then((data) => {
      console.log("Response from server:", data);
      const loginButton = document.querySelector('.login-list-item');
      const logoutButton = document.querySelector('.logout-button');
      const profileButton = document.getElementById('item-profile');
      
      if (data.isLoggedIn) {
        logoutButton.style.display = 'flex';
        loginButton.style.display = 'none';
        profileButton.style.display = 'flex';
        localStorage.setItem('isLoggedIn', 'true');
      } else if(loginButton || logoutButton){
        
          loginButton.style.display = 'flex';
        
       
        logoutButton.style.display = 'none';
       // profileButton.style.display = 'none';
        localStorage.setItem('isLoggedIn', 'false');
      }
    })
    .catch((error) => {
      console.error("Error checking login status:", error);
    });
}



export { updateLoginButtonVisibility };

const logoutButtonListItem = document.querySelector('.logout-button'); // Pegar o elemento <li> com a classe logout-button

if (logoutButtonListItem) { // Verificar se o elemento existe
  logoutButtonListItem.addEventListener('click', () => {
  
      const shouldLogout = window.confirm("Tem certeza de que deseja sair?"); // Mostrar um alerta de confirmação
    
      if (shouldLogout) {
        localStorage.removeItem('isLoggedIn');
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



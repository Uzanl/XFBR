async function updateLoginButtonVisibility() {
  fetch("http://localhost:3000/checkLoginStatus")
    .then(response => response.json())
    .then(data => {
      console.log("Response from server:", data);
      const { isLoggedIn } = data;
      const loginButton = document.querySelector('.login-list-item');
      const logoutButton = document.querySelector('.logout-button');
      const profileButton = document.getElementById('item-profile');

      loginButton.style.display = isLoggedIn ? 'none' : 'flex';
      logoutButton.style.display = isLoggedIn ? 'flex' : 'none';
      profileButton.style.display = isLoggedIn ? 'flex' : 'none';
      localStorage.setItem('isLoggedIn', isLoggedIn ? 'true' : 'false');
    })
    .catch(error => {
      console.error("Error checking login status:", error);
    });
}

export { updateLoginButtonVisibility };

const logoutButtonListItem = document.querySelector('.logout-button');

if (logoutButtonListItem) {
  logoutButtonListItem.addEventListener('click', () => {
    const shouldLogout = window.confirm("Tem certeza de que deseja sair?");
    if (shouldLogout) {
      localStorage.removeItem('isLoggedIn');
      fetch("http://localhost:3000/logout")
        .then(response => response.json())
        .then(data => {
          window.location.href = "/login.html";
        })
        .catch(error => {
          console.error("Error logging out:", error);
        });
    }
  });
}

function redirectToArticlePage() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  (isLoggedIn)?window.location.href = "/editor.html":  window.location.href = "/login.html";
}
document.querySelector('#publish-link').addEventListener('click', redirectToArticlePage);


  
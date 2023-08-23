function redirectToArticlePage() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (isLoggedIn) {
    window.location.href = "/editor.html";
  } else {
    window.location.href = "/login.html";
  }
}

document.querySelector('#publish-link').addEventListener('click', redirectToArticlePage);


  
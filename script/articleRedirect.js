async function redirectToArticlePage() {
  document.querySelector('#publish-link').addEventListener('click', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    isLoggedIn ? window.location.href = "/editor.html":  window.location.href = "/login.html";
  });
  
}
redirectToArticlePage();
/*  export{redirectToArticlePage};*/
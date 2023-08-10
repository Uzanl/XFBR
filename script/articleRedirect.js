function redirectToArticlePage() {
    fetch("http://localhost:3000/checkLoginStatus", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response from server:", data);
        if (data.isLoggedIn) {
          window.location.href = "/editor.html";
        } else {
          window.location.href = "/login.html";
        }
      })
      .catch((error) => {
        console.error("Error checking login status:", error);
      });
  }
  
  export { redirectToArticlePage };
  
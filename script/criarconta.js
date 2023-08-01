 // Código para medir a força da senha
 document.getElementById("password").addEventListener("input", function () {
    var password = this.value;
    var passwordStrength = document.getElementById("passwordStrength");
    var strength = 0;

    // Verificar o tamanho da senha
    if (password.length >= 8) {
      strength += 1;
    }

    // Verificar se a senha contém letras maiúsculas e minúsculas
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) {
      strength += 1;
    }

    // Verificar se a senha contém números
    if (password.match(/\d+/)) {
      strength += 1;
    }

    // Verificar se a senha contém caracteres especiais
    if (password.match(/[!@#$%^&*(),.?":{}|<>]/)) {
      strength += 1;
    }

    // Exibir a força da senha
    switch (strength) {
      case 0:
        passwordStrength.innerHTML = "Senha Fraca";
        break;
      case 1:
        passwordStrength.innerHTML = "Senha Moderada";
        break;
      case 2:
      case 3:
        passwordStrength.innerHTML = "Senha Forte";
        break;
      case 4:
        passwordStrength.innerHTML = "Senha Muito Forte";
        break;
      default:
        passwordStrength.innerHTML = "";
        break;
    }
  });

  // Código para verificar se a senha e a confirmação de senha coincidem
  document.getElementById("confirmPassword").addEventListener("input", function () {
    togglePasswordValidationMessages();
  });

  // Função para exibir ou ocultar as mensagens de validação de senha e confirmação de senha
  function togglePasswordValidationMessages() {
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirmPassword").value;
    var passwordMatchMessage = document.getElementById("passwordMatchMessage");
    var passwordStrength = document.getElementById("passwordStrength");

    if (password === "") {
      passwordStrength.innerHTML = "";
    } else {
      var strength = 0;

      // Verificar o tamanho da senha
      if (password.length >= 8) {
        strength += 1;
      }

      // Verificar se a senha contém letras maiúsculas e minúsculas
      if (password.match(/[a-z]/) && password.match(/[A-Z]/)) {
        strength += 1;
      }

      // Verificar se a senha contém números
      if (password.match(/\d+/)) {
        strength += 1;
      }

      // Verificar se a senha contém caracteres especiais
      if (password.match(/[!@#$%^&*(),.?":{}|<>]/)) {
        strength += 1;
      }

      // Exibir a força da senha
      switch (strength) {
        case 0:
          passwordStrength.innerHTML = "Senha Fraca";
          break;
        case 1:
          passwordStrength.innerHTML = "Senha Moderada";
          break;
        case 2:
        case 3:
          passwordStrength.innerHTML = "Senha Forte";
          break;
        case 4:
          passwordStrength.innerHTML = "Senha Muito Forte";
          break;
        default:
          passwordStrength.innerHTML = "";
          break;
      }
    }

    if (password === "" && confirmPassword === "") {
      passwordMatchMessage.innerHTML = "";
    } else if (password === confirmPassword) {
      passwordMatchMessage.innerHTML = "Senhas coincidem";
      passwordMatchMessage.style.color = "green";
    } else {
      passwordMatchMessage.innerHTML = "Senhas não coincidem";
      passwordMatchMessage.style.color = "red";
    }
  }

  // Adicionamos um evento input para o campo de senha também
  document.getElementById("password").addEventListener("input", function () {
    togglePasswordValidationMessages();
  });

  // Chamamos a função inicialmente para garantir que as mensagens estejam corretas no início
  togglePasswordValidationMessages();

  function toggleSidebar() {
    var sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
    var toggleBtn = document.querySelector('.toggle-btn');
    toggleBtn.classList.toggle('active');
  }  

  function submitForm() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Crie um objeto para armazenar os dados do formulário
  const formData = {
    name: name,
    email: email,
    password: password,
  };

  console.log("Data to be sent:", formData);

  // Crie uma requisição HTTP POST para enviar os dados do formulário ao servidor
  fetch("http://localhost:3000/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then((data) => {
    console.log("Response from the server:", data);
    // Aqui você pode fazer qualquer manipulação adicional ou exibir mensagens de sucesso
    alert("Account created successfully");
  })
  .catch((error) => {
    console.error("Error inserting data into the database:", error);
    // Aqui você pode tratar o erro de acordo com suas necessidades
    alert("Error creating account");
  });
}
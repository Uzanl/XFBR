
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

 
  
  
  document.getElementById('signup-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Evita o envio tradicional do formulário
  
    const formData = new FormData(this);
  
    // Imprime os dados do formulário no console (para depuração)
    console.log('Dados do formulário:', Object.fromEntries(formData));
  
    // Enviar dados via AJAX
    fetch('/submit', {
      method: 'POST',
      credentials: 'same-origin', // Mantém as credenciais no mesmo domínio
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(Object.fromEntries(formData)) // Envia os dados no formato JSON
    })
    .then(response => response.json()) // Espera uma resposta JSON do servidor
    .then(data => {
      if (data.error) {
        document.getElementById('error-message').textContent = data.error;
      } else {
        window.location.href = '/login.html'; // Redireciona em caso de sucesso
      }
    });
  });
  
  
  

  // Adicionamos um evento input para o campo de senha também
  document.getElementById("password").addEventListener("input", function () {
    togglePasswordValidationMessages();
  });

  // Chamamos a função inicialmente para garantir que as mensagens estejam corretas no início
  togglePasswordValidationMessages();

 
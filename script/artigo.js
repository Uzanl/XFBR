
import { updateLoginButtonVisibility } from './auth.js';

// Chamar a função para atualizar a visibilidade do botão de login ao carregar a página
updateLoginButtonVisibility();


  //function getParameterByName(name) {
  //  const url = window.location.href;
 //   name = name.replace(/[\[\]]/g, '\\$&');
 //   const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
 //   const results = regex.exec(url);
 //   if (!results) return null;
 //   if (!results[2]) return '';
 //   return decodeURIComponent(results[2].replace(/\+/g, ' '));
//  }

  

  //const id = getParameterByName('id');
  //const artigoTituloElement = document.getElementById('noticia-titulo');
  //const artigoConteudoElement = document.getElementById('noticia-conteudo');

  //if (id) {
    // Aqui você pode usar a lógica para obter os dados do artigo com base no ID e preencher os elementos correspondentes
  //  const articleData = getArticleDataById(id); // Supondo que você tenha uma função que retorna os dados do artigo com base no ID

  //  if (articleData) {
   //   artigoTituloElement.textContent = articleData.title;
   //   artigoConteudoElement.textContent = articleData.content;
      // Preencha os outros elementos com os dados do artigo, como o vídeo e o carrossel de imagens
  //  }
 // }

 // function getArticleDataById(id) {
    // Aqui você pode implementar a lógica para buscar os dados do artigo com base no ID
    // Por exemplo, você pode fazer uma requisição AJAX para obter os dados de um servidor
    // ou obter os dados de uma fonte de dados local (array, objeto, banco de dados, etc.)
    // Retorna os dados do artigo ou null se o ID não for encontrado
  //  const articles = [
 //     { id: "artigo1", title: "The Witcher 3", content: "Conteúdo do Artigo 1..." },
  //    { id: "artigo2", title: "Forza Horizon 5", content: "Conteúdo do Artigo 2..." },
  //    { id: "artigo3", title: "Resident Evil 4 Remake", content: "Conteúdo do Artigo 3..." },
  //    { id: "artigo4", title: "Star Wars Jedi: Survivor", content: "Nesse jogo, acompanhamos Cal e suas dúvidas sobre se sua luta contra o império está fazendo alguma diferença, pois ao obter informações confidenciais a pedido de Saw Gerrera, ele descobre que o Império está mais forte do que nunca. Ao longo dessa jornada, ele encontrará velhos amigos e inimigos, além de fazer novas alianças para alcançar seus objetivos e resistir à tentação do lado sombrio da Força. Visitaremos novos planetas e também locais conhecidos dentro do universo Star Wars, desvendando um mistério que remonta a 200 anos atrás.\n\nPara aqueles que jogaram o jogo anterior ou qualquer outro com mecânicas semelhantes ao estilo Souls Like, encontrarão uma mecânica de combate familiar, que foi expandida com novas habilidades. Falando em habilidades, já começamos o jogo com a maioria delas aprendidas no jogo anterior, o que é positivo e bem-vindo, pois agora você não é mais um Padawan, mas sim um Cavaleiro Jedi com certa experiência em combate. A exploração do mundo do jogo foi ampliada e se tornou mais convidativa, com a inclusão de colecionáveis de cosméticos e habilidades, o que torna a exploração gratificante. Agora, nos pontos de meditação, é possível realizar viagens rápidas e o mapa holográfico está muito mais fácil de ser compreendido.\n\nNo entanto, é importante mencionar que o jogo foi lançado com vários problemas técnicos de otimização, que podem prejudicar a experiência dependendo da plataforma utilizada. No meu caso, por exemplo, o jogo travou duas vezes em momentos cruciais da minha gameplay. Além disso, houve problemas de demora no carregamento das texturas e, em uma ocasião, uma queda considerável na taxa de quadros por segundo.\n\nTirando esses problemas técnicos de otimização do jogo é um bom jogo de ação e aventura e um prato cheio para os fãs do universo Star Wars.\n\nE que a força esteja com vocês nessa galáxia muito distante." },
  //    { id: "artigo5", title: "Título do Artigo 5", content: "Conteúdo do Artigo 5..." },
  //    { id: "artigo6", title: "Título do Artigo 6", content: "Conteúdo do Artigo 6..." },
  //    { id: "artigo7", title: "Título do Artigo 7", content: "Conteúdo do Artigo 7..." }
 //   ];

//    return articles.find(article => article.id === id);
//  }


document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const titulo = decodeURIComponent(params.get('titulo'));
  const conteudoHtml = decodeURIComponent(params.get('conteudo'));

  const tituloElement = document.querySelector('.noticia-titulo');
  const conteudoElement = document.querySelector('.noticia-conteudo');

  tituloElement.textContent = titulo;
  conteudoElement.innerHTML = conteudoHtml; // Usando innerText em vez de textContent
});


  
function redirectToArticlePage() {
  fetch("http://localhost:3000/checkLoginStatus", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Response from server:", data); // Adicionando o console.log para verificar a resposta do servidor
      if (data.isLoggedIn) {
        window.location.href = "/editor.html"; // Redirecionar para a página de edição
      } else {
        window.location.href = "/login.html"; // Redirecionar para a página de login
      }
    })
    .catch((error) => {
      console.error("Error checking login status:", error);
    });
}

const publishButtons = document.querySelectorAll('.publish-button');
publishButtons.forEach((button) => {
  button.addEventListener('click', redirectToArticlePage);
});
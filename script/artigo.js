
import { updateLoginButtonVisibility } from './auth.js';

updateLoginButtonVisibility();

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  //console.log(id);
  if (id) {
    try {
      const response = await fetch(`/get-article-by-id/${id}`);
      if (response.ok) {
        const articleData = await response.json();
        console.log(articleData);
        const { titulo, conteudo,login_usu, descricao, imagem_url, gamertag, gamerscore, imagem_url_xbox } = articleData;
       
        const tituloElement = document.querySelector('.noticia-titulo');
        const conteudoElement = document.querySelector('.noticia-conteudo');
        const descricaoPerfilElement = document.querySelector('.descricao_perfil');
        const imagemPerfil = document.querySelector('.imagem-perfil');
        const gamertagElement = document.querySelector('.gamertag');
        const gamerscoreElement = document.querySelector('.gamerscore');
     //   const imagemPerfilElement = document.querySelector('.imagem_perfil');

          
        if(gamertag){
          gamertagElement.textContent = `Gamertag: ${gamertag}`;
         }

         if(gamerscore){
          gamerscoreElement.textContent = gamerscore;
         }
         
        tituloElement.textContent = titulo;
        conteudoElement.innerHTML = conteudo;


// Verifica se a imagem do usuário comum é nula ou vazia
if (!imagem_url) {
  imagemPerfil.src = imagem_url_xbox; // Se for nula ou vazia, usa a imagem do Xbox
} else {
  imagemPerfil.src = imagem_url; // Caso contrário, usa a imagem do usuário comum
}

      //  descricaoPerfilElement.textContent = descricao;
        //imagemPerfil.src = imagem_url;
    //    imagemPerfilElement.src = imagem_url;
    //    imagemPerfilElement.alt = `Imagem`; // Defina uma descrição adequada para a imagem
      } else {
        throw new Error('Erro ao obter detalhes do artigo');
      }
    } catch (error) {
      console.error('Erro ao obter detalhes do artigo:', error);
    }
  }
});



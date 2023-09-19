
import { updateLoginButtonVisibility } from './auth.js';

updateLoginButtonVisibility();

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  console.log(id);
  if (id) {
    try {
      const response = await fetch(`/get-article-by-id/${id}`);
      if (response.ok) {
        const articleData = await response.json();
        const { titulo, conteudo, descricao, imagem_url } = articleData;

        const tituloElement = document.querySelector('.noticia-titulo');
        const conteudoElement = document.querySelector('.noticia-conteudo');
        const descricaoPerfilElement = document.querySelector('.descricao_perfil');
        const imagemPerfil = document.querySelector('.imagem-perfil');
     //   const imagemPerfilElement = document.querySelector('.imagem_perfil');

        tituloElement.textContent = titulo;
        conteudoElement.innerHTML = conteudo;
        descricaoPerfilElement.textContent = descricao;
        imagemPerfil.src = imagem_url;
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



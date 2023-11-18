import { updateLoginButtonVisibility } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  updateLoginButtonVisibility();

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const deleteButton = document.querySelector('.delete-image-container');
  deleteButton.addEventListener('click', handleExclusao);

  async function handleExclusao() {
    const confirmacao = confirm('Tem certeza que deseja excluir este artigo?');
    if (confirmacao) {
      try {
        const response = await fetch(`/excluir-artigo/${id}`, {
          method: 'DELETE',
        });
  
        if (response.ok) {
          // Artigo excluído com sucesso
          alert('Artigo excluído com sucesso!');
          window.location.href = '/perfil.html';
        } else {
          throw new Error('Erro ao excluir o artigo');
        }
      } catch (error) {
        console.error('Erro ao excluir o artigo:', error);
      }
    }
  }

  const editElement = document.querySelector('.edit-image-container')

  editElement.addEventListener('click', () => {
    openArticle(id);
  });

  function openArticle(id) {
    window.location.href = `editor.html?id=${id}`;
  }

  try {
    const temPermissao = await verificarPermissaoEditarArtigo(id);

    if (temPermissao) {
      handlePermissaoEditar();
    } else {
      console.log("Não tem permissão de editar");
    }

    await getArticleDetails(id);
  } catch (error) {
    console.error('Erro:', error);
  }
});

async function verificarPermissaoEditarArtigo(id) {
  try {
    const response = await fetch(`/verificar-permissao-editar-artigo/${id}`);
    const result = await response.json();
    return result.temPermissao;
  } catch (error) {
    throw new Error('Erro ao verificar permissão de edição do artigo');
  }
}

function handlePermissaoEditar() {
  const editContainer = document.querySelector('.edit-container');
  editContainer.style.display = 'flex';
}

async function getArticleDetails(id) {
  try {
    const response = await fetch(`/get-article-by-id/${id}`);
    const articleData = await response.json();
    displayArticleDetails(articleData);
  } catch (error) {
    throw new Error('Erro ao obter detalhes do artigo');
  }
}

function displayArticleDetails(articleData) {
  const { titulo, conteudo, id_usu, login_usu, descricao, imagem_url, gamertag, gamerscore, imagem_url_xbox } = articleData;

  const tituloElement = document.querySelector('.noticia-titulo');
  const conteudoElement = document.querySelector('.noticia-conteudo');
  const descricaoPerfilElement = document.querySelector('.descricao_perfil');
  const imagemPerfil = document.querySelector('.imagem-perfil');
  const gamertagElement = document.querySelector('.gamertag');
  const gamerscoreElement = document.querySelector('.gamerscore');

  if (gamertag) {
    gamertagElement.textContent = gamertag;
  }

  if (gamerscore) {
    gamerscoreElement.textContent = gamerscore;
  }

  tituloElement.textContent = titulo;
  conteudoElement.innerHTML = conteudo;
  (!imagem_url)?imagemPerfil.src = imagem_url_xbox: imagemPerfil.src = imagem_url;
}

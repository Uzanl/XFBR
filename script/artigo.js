const tituloElement = document.querySelector('.noticia-titulo');
const conteudoElement = document.querySelector('.noticia-conteudo');
const imagemPerfil = document.querySelector('.imagem-perfil');
const gamertagElement = document.querySelector('.gamertag');
const gamerscoreElement = document.querySelector('.gamerscore');
const deleteButton = document.querySelector('.delete-image-container');
const approveButton = document.querySelector('.approve-image-container');
const declineButton = document.querySelector('.decline-image-container');
const editElement = document.querySelector('.edit-image-container')

const params = new URLSearchParams(window.location.search);
const id = params.get('id');

deleteButton.addEventListener('click', handleExclusao);

approveButton.addEventListener('click', () => {
  handleStatusChange(id, 'aprovado');
});

declineButton.addEventListener('click', () => {
  handleStatusChange(id, 'reprovado');
});

editElement.addEventListener('click', ()=>{
openArticle(id);
});

function openArticle(id){
  window.location.href = `editor.html?id=${id}`;
}

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

// Função para lidar com a alteração de status
async function handleStatusChange(articleId, status) {
  const confirmacao = confirm(`Tem certeza que deseja ${status === 'aprovado' ? 'aprovar' : 'reprovar'} este artigo?`);

  if (confirmacao) {
    try {
      const response = await fetch(`/alterar-status-artigo/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }), // Envie o novo status para o servidor
      });

      if (response.ok) {
        // Status do artigo alterado com sucesso
        alert(`Artigo ${status === 'aprovado' ? 'aprovado' : 'reprovado'} com sucesso!`);
        // Recarregue a página ou faça outras ações necessárias após a alteração do status
        window.location.reload();
      } else {
        throw new Error(`Erro ao ${status === 'aprovado' ? 'aprovar' : 'reprovar'} o artigo`);
      }
    } catch (error) {
      console.error(`Erro ao ${status === 'aprovado' ? 'aprovar' : 'reprovar'} o artigo:`, error);
    }
  }
}

async function verificarPermissaoEditarArtigo(id) {
  try {
    const response = await fetch(`/verificar-permissao-editar-artigo/${id}`);
    const result = await response.json();

    const editContainer = document.querySelector('.edit-container');
    const editButtons = editContainer.querySelectorAll('.edit-image-container, .delete-image-container');

    if (result.temPermissao) {
      // Se o usuário tem permissão
      editContainer.style.display = 'flex';  // ou editContainer.style.visibility = 'visible';

      // Verificar se é um administrador
      if (result.isAdmin) {
        // Exibir todos os botões (editar, excluir, aprovar, reprovar)
        editButtons.forEach(button => {
          button.style.display = 'flex';  // ou button.style.visibility = 'visible';
        });
      } else if (result.isAuthor) {
        // Esconder botões de aprovação e reprovação, se não for administrador
        const approveButton = editContainer.querySelector('.approve-image-container');
        const declineButton = editContainer.querySelector('.decline-image-container');

        approveButton.style.display = 'none';  // ou approveButton.style.visibility = 'hidden';
        declineButton.style.display = 'none';  // ou declineButton.style.visibility = 'hidden';
      }
    } else {
      // Se o usuário não tem permissão, esconder todo o container
      editContainer.style.display = 'none';  // ou editContainer.style.visibility = 'hidden';
    }
  } catch (error) {
    console.error('Erro ao verificar permissão de edição do artigo:', error);
    throw new Error('Erro ao verificar permissão de edição do artigo');
  }
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
  if (gamertag) gamertagElement.textContent = gamertag;
  if (gamerscore) gamerscoreElement.textContent = gamerscore;
  tituloElement.textContent = titulo;
  conteudoElement.innerHTML = conteudo;
  (!imagem_url) ? imagemPerfil.src = imagem_url_xbox : imagemPerfil.src = imagem_url;
}

(async () => {
  try {
    verificarPermissaoEditarArtigo(id);
    await getArticleDetails(id);
  } catch (error) {
    console.error('Erro:', error);
  }
})();
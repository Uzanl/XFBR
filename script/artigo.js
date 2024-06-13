const tituloElement = document.querySelector('.noticia-titulo');
const conteudoElement = document.querySelector('.noticia-conteudo');
const imagemPerfil = document.querySelector('.imagem-perfil');
const gamertagElement = document.querySelector('.gamertag');
const gamerscoreElement = document.querySelector('.gamerscore');
const deleteButton = document.querySelector('.delete-image-container');
const approveButton = document.querySelector('.approve-image-container');
const declineButton = document.querySelector('.decline-image-container');
const editElement = document.querySelector('.edit-image-container')


const urlParams = new URL(window.location.href);
const id = urlParams.pathname.split('/').pop(); // Obter o último segmento da URL como o id

if (deleteButton) deleteButton.addEventListener('click', handleExclusao);

if (approveButton) {
  approveButton.addEventListener('click', () => {
    handleStatusChange(id, 'aprovado');
  });
}

if (declineButton) {
  declineButton.addEventListener('click', () => {
    handleStatusChange(id, 'reprovado');
  });
}

if(editElement){
  editElement.addEventListener('click', () => {
    openArticle(id);
  });
}

function openArticle(id) {
  window.location.href = `/editor?id=${id}`;
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
        window.location.href = '/perfil';
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
const articleContainer = document.querySelector('.article-container');
const descriptionParagraph = document.querySelector('.desc-profile2');

window.addEventListener("resize", handleImageResolution);

function handleImageResolution() {
  const screenWidth = window.innerWidth;
  const images = document.querySelectorAll(".article img");

  images.forEach(function (image, index) {
    const originalSrc = image.dataset.originalSrc;
    if (screenWidth > 1199) {
      (index === 0) ? image.src = originalSrc.replace(".webp", "_firstchild.webp") : image.src = originalSrc.replace("_firstchild.webp", ".webp");

    } else if (screenWidth > 768 && screenWidth < 992) {
      image.src = originalSrc.replace(".webp", "_firstchild.webp");
    }
    else if (screenWidth >= 992 && screenWidth <= 1199) {
      image.src = originalSrc.replace(".webp", "_firstchild.webp");
    } else if (screenWidth > 320 && screenWidth <= 480) {
      image.src = originalSrc.replace(".webp", "_432.webp");
    } else if (screenWidth > 480 && screenWidth <= 768) {
      image.src = originalSrc.replace(".webp", "_720.webp");
    } else if (screenWidth <= 320) {
      image.src = originalSrc.replace("_firstchild.webp", ".webp");
    }
  });
}

//Adicionando o evento para atualização da descrição
descriptionParagraph.addEventListener('input', async (event) => {
  try {
    const newDescription = event.target.value;
    console.log(newDescription);
    const csrfToken = getCsrfToken(); // Obtém o token CSRF dos cookies

    console.log(csrfToken);
    const updateResponse = await fetch(`/update-description/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'csrf-token': csrfToken // Adiciona o token CSRF no cabeçalho
      },
      body: JSON.stringify({ description: newDescription })
    });

    if (!updateResponse.ok) throw new Error('Erro ao atualizar a descrição do perfil');

    console.log('Descrição atualizada com sucesso:', newDescription);
  } catch (error) {
    console.error('Erro ao atualizar a descrição do perfil:', error);
  }
});

descriptionParagraph.parentElement.addEventListener('click', () => {
  descriptionParagraph.removeAttribute('readonly');
});

function openArticle(id) {
  window.location.href = `artigo/${id}`;
}











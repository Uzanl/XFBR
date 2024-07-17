const imageInput = document.getElementById("image");
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content-preview");
const imagePreviewContainer = document.querySelector(".image-preview");
const titlePreview = document.querySelector(".title-preview h1");
const contentPreview = document.querySelector(".title-preview p");
const removeImageBtn = document.getElementById("removeImageBtn");

tinymce.init({
  selector: '#editor',
  plugins: 'advlist autolink lists link image charmap print preview anchor',
  toolbar: 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | image link',
  image_title: true,
  automatic_uploads: true,
  file_picker_types: 'image',
  file_picker_callback: function (cb, value, meta) {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.onchange = function () {
      const file = this.files[0];
      const reader = new FileReader();
      reader.onload = function () {
        const id = 'blobid' + (new Date()).getTime();
        const blobCache = tinymce.activeEditor.editorUpload.blobCache;
        const base64 = reader.result.split(',')[1];
        const blobInfo = blobCache.create(id, file, base64);
        blobCache.add(blobInfo);
        cb(blobInfo.blobUri(), { title: file.name });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  },
  setup: function (editor) {
    editor.on('input', () => updatePreview());

    editor.on('PostProcess', function (e) {
      if (e.get) {
        const content = e.content;
        const div = document.createElement('div');
        div.innerHTML = content;

        const youtubeLinks = div.querySelectorAll('a[href*="youtube.com"]');
        for (let i = 0; i < youtubeLinks.length; i++) {
          const link = youtubeLinks[i];
          const videoId = getVideoIdFromUrl(link.href);
          if (videoId) {
            const videoContainer = document.createElement('div');
            videoContainer.setAttribute('class', 'video-container');
            const iframe = createYouTubeIframe(videoId);
            videoContainer.appendChild(iframe);
            link.parentNode.replaceChild(videoContainer, link);
          }
        }
        e.content = div.innerHTML;
      }
    });

    editor.on('init', function () {
      const params = new URLSearchParams(window.location.search);
      const idArtigo = params.get('id');

      if(idArtigo){
        fetch(`/get-article-edit-by-id/${idArtigo}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Erro ao obter dados do artigo');
          }
          return response.json();
        })
        .then(artigoData => {
          document.getElementById('title').value = artigoData.titulo;
          document.getElementById('content-preview').value = artigoData.previa_conteudo;

          const titlePreview = document.querySelector(".title-preview h1");
          const contentPreview = document.querySelector(".title-preview p");

          titlePreview.textContent = artigoData.titulo;
          contentPreview.textContent = artigoData.previa_conteudo;

          const imagePreview = new Image();
          imagePreview.src = artigoData.imagem_url;
          imagePreview.style.width = "256px";
          imagePreview.style.height = "144px";

          const imagePreviewContainer = document.querySelector(".image-preview");
          imagePreviewContainer.innerHTML = "";
          imagePreviewContainer.appendChild(imagePreview);

          editor.setContent(artigoData.conteudo);
          updatePreview();
        })
        .catch(error => {
          console.error('Erro ao preencher dados do artigo:', error);
        });
      }

     
    });
  }
});

function updatePreview() {
  const content = tinymce.activeEditor.getContent();
  document.getElementById('preview').innerHTML = content;
}

function getVideoIdFromUrl(url) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\??v?=?))([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : false;
}

function createYouTubeIframe(videoId) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('width', '100%');
  iframe.setAttribute('height', '100%');
  iframe.setAttribute('src', 'https://www.youtube.com/embed/' + videoId);
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allowfullscreen', 'true');
  iframe.setAttribute('title', 'Vídeo do Youtube');
  return iframe;
}

document.querySelector('form').addEventListener('submit', function (event) {
  event.preventDefault();

  const formData = new FormData(this);
  const params = new URLSearchParams(window.location.search);
  const idArtigo = params.get('id');

  const fetchUrl = idArtigo ? `/update-article/${idArtigo}` : '/insert-news';

  fetch(fetchUrl, {
    method: 'POST',
    credentials: 'same-origin',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      const errorMessage = document.getElementById('error-message');
      if (data.error) {
        errorMessage.textContent = data.error;
      } else {
        if (data.redirect) {
          window.location.href = data.redirect;
        } else {
          alert(idArtigo ? "Notícia atualizada com sucesso!" : "Notícia inserida com sucesso!");
          window.location.reload();
        }
      }
    })
    .catch(error => {
      console.error("Erro na atualização do formulário:", error);
    });
});


  const params = new URLSearchParams(window.location.search);
  const idArtigo = params.get('id');

  if (idArtigo) {
    document.querySelector('.inserir input[type="submit"]').value = 'Salvar';
  }



  imageInput.addEventListener("change", (event) => {
    const selectedImage = event.target.files[0];

    if (selectedImage) {
      const image = new Image();
      image.src = URL.createObjectURL(selectedImage);

      image.onload = () => {
        if (image.width >= 1280 && image.height >= 720) {
          const imagePreview = new Image();
          imagePreview.src = URL.createObjectURL(selectedImage);
          imagePreview.style.width = "256px";
          imagePreview.style.height = "144px";
          imagePreviewContainer.innerHTML = "";
          imagePreviewContainer.appendChild(imagePreview);
        } else {
          alert("A imagem precisa ter no mínimo 1280x720 pixels de resolução.");
          imageInput.value = "";
          imagePreviewContainer.innerHTML = "";
        }
      };
    }
  });

  titleInput.addEventListener("input", (event) => {
    const titleValue = event.target.value;
    titlePreview.textContent = titleValue;
  });

  removeImageBtn.addEventListener("click", (event) => {
    event.preventDefault();
    imageInput.value = "";
    imagePreviewContainer.innerHTML = "";
  });

  contentInput.addEventListener("input", (event) => {
    const contentValue = event.target.value;
    contentPreview.textContent = contentValue;
  });


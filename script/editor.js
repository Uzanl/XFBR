import { updateLoginButtonVisibility } from './auth.js';

// Chamar a função para atualizar a visibilidade do botão de login ao carregar a página
updateLoginButtonVisibility();

tinymce.init({
    selector: '#editor',
    plugins: 'advlist autolink lists link image charmap print preview anchor',
    toolbar: 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | image link',
    image_title: true,
    automatic_uploads: true,
    file_picker_types: 'image',
    file_picker_callback: function (cb, value, meta) {
      var input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.onchange = function () {
        var file = this.files[0];
        var reader = new FileReader();
        reader.onload = function () {
          var id = 'blobid' + (new Date()).getTime();
          var blobCache = tinymce.activeEditor.editorUpload.blobCache;
          var base64 = reader.result.split(',')[1];
          var blobInfo = blobCache.create(id, file, base64);
          blobCache.add(blobInfo);
          cb(blobInfo.blobUri(), { title: file.name });
        };
        reader.readAsDataURL(file);
      };
      input.click();
    },
    setup: function (editor) {
      editor.on('input', function () {
        updatePreview();
      });

      editor.on('PostProcess', function (e) {
        if (e.get) {
          var content = e.content;
          var div = document.createElement('div');
          div.innerHTML = content;

          var youtubeLinks = div.querySelectorAll('a[href*="youtube.com"]');
          for (var i = 0; i < youtubeLinks.length; i++) {
            var link = youtubeLinks[i];
            var videoId = getVideoIdFromUrl(link.href);
            if (videoId) {
              var videoContainer = document.createElement('div');
              videoContainer.setAttribute('class', 'video-container');
              var iframe = createYouTubeIframe(videoId);
              videoContainer.appendChild(iframe);
              link.parentNode.replaceChild(videoContainer, link);
            }
          }

          e.content = div.innerHTML;
        }
      });
    }
  });

 

  function updatePreview() {
    var content = tinymce.activeEditor.getContent();
    document.getElementById('preview').innerHTML = content;
  }

  function getVideoIdFromUrl(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\??v?=?))([^#&?]*).*/;
    var match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : false;
  }

  function createYouTubeIframe(videoId) {
    var iframe = document.createElement('iframe');
    iframe.setAttribute('width', '100%');
    iframe.setAttribute('height', '100%');
    iframe.setAttribute('src', 'https://www.youtube.com/embed/' + videoId);
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    return iframe;
  }

 

  document.querySelector('form').addEventListener('submit', function (event) {
    event.preventDefault(); // Evita o envio tradicional do formulário
  
    const formData = new FormData(this);
   // console.log(formData);

    
    const title = formData.get('title');
    const image = formData.get('image');
    const contentpreview = formData.get('content-preview');
    const content = tinymce.activeEditor.getContent(); // Obtém o conteúdo do editor
  
    // Imprime os dados do formulário no console (para depuração)
    console.log('Título:', title);
    console.log('URL imagem:', image);
    console.log('Preview Conteúdo:', contentpreview)
    console.log('Conteúdo:', content)
  
    // Enviar dados via AJAX
    fetch('/insert-news', {
      method: 'POST',
      credentials: 'same-origin', // Mantém as credenciais no mesmo domínio
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, image, contentpreview, content }) // Envia o título e o conteúdo no formato JSON
    })
    .then(response => response.json()) // Espera uma resposta JSON do servidor
    .then(data => {
      if (data.error) {
        document.getElementById('error-message').textContent = data.error; // Exibe o erro na div error-message
      } else {
        alert("Notícia inserida com sucesso!");
        window.location.reload(); // Recarrega a página em caso de sucesso
      }
    })
    .catch(error => {
      console.error("Erro no envio do formulário:", error);
    });
  });
  

  document.addEventListener("DOMContentLoaded", () => {
    const imageInput = document.getElementById("image");
    const titleInput = document.getElementById("title");
    const contentInput = document.getElementById("content-preview")
    const imagePreviewContainer = document.querySelector(".image-preview");
    const titlePreview = document.querySelector(".title-preview h1");
    const contentPreview = document.querySelector(".title-preview p")
    const removeImageBtn = document.getElementById("removeImageBtn");
   
    
    imageInput.addEventListener("change", (event) => {
      const selectedImage = event.target.files[0];
    
      if (selectedImage) {
        const image = new Image();
        image.src = URL.createObjectURL(selectedImage);
    
        image.onload = () => {
          if (image.width >= 1280 && image.height >= 720) {
            const imagePreview = new Image();
            imagePreview.src = URL.createObjectURL(selectedImage);
            imagePreview.style.width = "243.33px";
            imagePreview.style.height = "193.95px";
            imagePreviewContainer.innerHTML = ""; // Limpar o conteúdo anterior, se houver
            imagePreviewContainer.appendChild(imagePreview);
          } else {
            alert("A imagem precisa ter no mínimo 1280x720 pixels de resolução.");
            imageInput.value = ""; // Limpar a seleção de imagem
            imagePreviewContainer.innerHTML = ""; // Limpar a prévia da imagem
          }
        };
      }
    });
    
    titleInput.addEventListener("input", (event) => {
      const titleValue = event.target.value;
      titlePreview.textContent = titleValue; // Atualiza o conteúdo do h1 na prévia
    });

    removeImageBtn.addEventListener("click", (event) => {
      event.preventDefault(); // Evita que o evento de clique seja propagado para o formulário
      imageInput.value = ""; // Limpar a seleção de imagem
      imagePreviewContainer.innerHTML = ""; // Limpar o conteúdo da prévia da imagem
      
    });

    contentInput.addEventListener("input", (event) => {
      const contentValue = event.target.value;
      contentPreview.textContent = contentValue; // Atualiza o conteúdo do parágrafo na prévia
    });
  
  
    // Evento para o envio do formulário
    document.querySelector('form').addEventListener('submit', function (event) {
      event.preventDefault(); // Evita o envio tradicional do formulário
      // Restante do código de envio do formulário
    });
  });
  
  
  
  
  
  
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

  function toggleSidebar() {
    var sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
    var toggleBtn = document.querySelector('.toggle-btn');
    toggleBtn.classList.toggle('active');
  }

  document.querySelector('form').addEventListener('submit', function (event) {
    event.preventDefault(); // Evita o envio tradicional do formulário
    
    const formData = new FormData(this);
    const title = formData.get('title');
    const content = tinymce.activeEditor.getContent(); // Obtém o conteúdo do editor
    
    // Imprime os dados do formulário no console (para depuração)
    console.log('Título:', title);
    console.log('Conteúdo:', content);
    
    // Enviar dados via AJAX
    fetch('/insert-news', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, content }) // Envia o título e o conteúdo no formato JSON
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
      } else {
        alert("Notícia inserida com sucesso!");
        window.location.reload();
      }
    })
    .catch(error => {
      console.error("Erro no envio do formulário:", error);
    });
  });
  
  
  
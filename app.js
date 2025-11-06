const openCameraBtn = document.getElementById('openCamera');
const cameraContainer = document.getElementById('cameraContainer');
const video = document.getElementById('video');
const takePhotoBtn = document.getElementById('takePhoto');
const retakePhotoBtn = document.getElementById('retakePhoto');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let stream = null;

async function openCamera() {
  try {
    const constraints = {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };

    stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;

    // Esperar a que el video cargue sus dimensiones reales
    await new Promise(resolve => {
      video.onloadedmetadata = () => {
        video.play();
        // Ajustar canvas al tamaño real del video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        resolve();
      };
    });

    // Forzar que el video se vea horizontal (aunque el móvil esté en vertical)
    video.style.transform = 'rotate(0deg)';
    cameraContainer.style.display = 'block';
    openCameraBtn.disabled = true;

    console.log('Cámara abierta:', video.videoWidth, 'x', video.videoHeight);
  } catch (error) {
    console.error('Error al acceder a la cámara:', error);
    alert('No se pudo acceder a la cámara. Da permisos por favor.');
  }
}

function takePhoto() {
  if (!stream) {
    alert('Primero abre la cámara');
    return;
  }

  const vw = video.videoWidth;
  const vh = video.videoHeight;

  // Aseguramos que el canvas tenga las mismas proporciones
  canvas.width = vw;
  canvas.height = vh;

  // Si la cámara está en orientación vertical, rotamos la imagen
  if (vh > vw) {
    ctx.save();
    ctx.translate(vh / 2, vw / 2);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(video, -vw / 2, -vh / 2, vw, vh);
    ctx.restore();
  } else {
    ctx.drawImage(video, 0, 0, vw, vh);
  }

  video.pause();
  video.style.display = 'none';
  canvas.style.display = 'block';
  takePhotoBtn.style.display = 'none';
  retakePhotoBtn.style.display = 'inline-block';

  console.log('Foto capturada');
}

function retakePhoto() {
  canvas.style.display = 'none';
  video.style.display = 'block';
  video.play();
  takePhotoBtn.style.display = 'inline-block';
  retakePhotoBtn.style.display = 'none';
}

function closeCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  video.srcObject = null;
  video.style.display = 'block';
  canvas.style.display = 'none';
  cameraContainer.style.display = 'none';
  openCameraBtn.disabled = false;
}

openCameraBtn.addEventListener('click', openCamera);
takePhotoBtn.addEventListener('click', takePhoto);
retakePhotoBtn.addEventListener('click', retakePhoto);

window.addEventListener('beforeunload', closeCamera);

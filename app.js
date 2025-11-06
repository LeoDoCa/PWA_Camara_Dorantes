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
        width: { ideal: 320 },
        height: { ideal: 240 }
      }
    };

    stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;

    cameraContainer.style.display = 'block';
    openCameraBtn.disabled = true;

    console.log('Cámara abierta');
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

  // Dibujar el frame del video en el canvas
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Pausar la vista previa y mostrar la foto
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

// Referencias a elementos del DOM
const openCameraBtn = document.getElementById('openCamera');
const cameraContainer = document.getElementById('cameraContainer');
const video = document.getElementById('video');
const takePhotoBtn = document.getElementById('takePhoto');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const switchCameraBtn = document.getElementById('switchCamera');
const gallery = document.getElementById('gallery');

let stream = null;
let currentFacingMode = 'environment'; // Inicialmente usar cámara trasera

async function checkCameraCapabilities() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    return videoDevices.length > 1;
}

async function openCamera() {
    try {
        // Verificar si hay múltiples cámaras
        const hasMultipleCameras = await checkCameraCapabilities();
        switchCameraBtn.style.display = hasMultipleCameras ? 'block' : 'none';

        // 1. Definición de Restricciones (Constraints)
        const constraints = {
            video: {
                facingMode: { ideal: currentFacingMode },
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };

        // 2. Obtener el Stream de Medios
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // 3. Asignar el Stream al Elemento <video>
        video.srcObject = stream;
        
        // 4. Actualización de la UI
        cameraContainer.style.display = 'block';
        openCameraBtn.textContent = 'Cámara Abierta';
        openCameraBtn.disabled = true;
        
        console.log('Cámara abierta exitosamente');
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        alert('No se pudo acceder a la cámara. Asegúrate de dar permisos.');
    }
}

function takePhoto() {
    if (!stream) {
        alert('Primero debes abrir la cámara');
        return;
    }

    // 1. Ajustar el tamaño del canvas al tamaño real del video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 2. Dibujar el Frame de Video en el Canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // 2. Conversión a Data URL
    const imageDataURL = canvas.toDataURL('image/png');
    
    // 3. Mostrar la foto capturada
    const photoContainer = document.getElementById('photo-container');
    const capturedPhoto = document.getElementById('captured-photo');
    const videoContainer = document.getElementById('video-container');
    
    capturedPhoto.src = imageDataURL;
    videoContainer.style.display = 'none';
    photoContainer.style.display = 'block';
    
    // 4. Añadir a la galería
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    const img = document.createElement('img');
    img.src = imageDataURL;
    img.alt = 'Foto capturada';
    galleryItem.appendChild(img);
    gallery.insertBefore(galleryItem, gallery.firstChild);
    
    // 5. Mostrar botón de volver a tomar
    document.getElementById('retakePhoto').style.display = 'inline-block';
    takePhotoBtn.style.display = 'none';
}

function closeCamera() {
    if (stream) {
        // Detener todos los tracks del stream (video, audio, etc.)
        stream.getTracks().forEach(track => track.stop());
        stream = null; // Limpiar la referencia

        // Limpiar y ocultar UI
        video.srcObject = null;
        cameraContainer.style.display = 'none';
        
        // Restaurar el botón 'Abrir Cámara'
        openCameraBtn.textContent = 'Abrir Cámara';
        openCameraBtn.disabled = false;
        
        console.log('Cámara cerrada');
    }
}

function retakePhoto() {
    const videoContainer = document.getElementById('video-container');
    const photoContainer = document.getElementById('photo-container');
    
    // Mostrar el video y ocultar la foto
    videoContainer.style.display = 'block';
    photoContainer.style.display = 'none';
    
    // Mostrar/ocultar botones correspondientes
    document.getElementById('retakePhoto').style.display = 'none';
    takePhotoBtn.style.display = 'inline-block';
}

async function switchCamera() {
    if (stream) {
        // Detener el stream actual
        stream.getTracks().forEach(track => track.stop());
        
        // Cambiar el modo de la cámara
        currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
        
        // Reabrir la cámara con la nueva configuración
        await openCamera();
    }
}

// Event listeners para la interacción del usuario
openCameraBtn.addEventListener('click', openCamera);
takePhotoBtn.addEventListener('click', takePhoto);
document.getElementById('retakePhoto').addEventListener('click', retakePhoto);
switchCameraBtn.addEventListener('click', switchCamera);

// Limpiar stream cuando el usuario cierra o navega fuera de la página
window.addEventListener('beforeunload', () => {
    closeCamera();
});
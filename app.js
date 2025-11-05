// Referencias a elementos del DOM
const openCameraBtn = document.getElementById('openCamera');
const cameraContainer = document.getElementById('cameraContainer');
const video = document.getElementById('video');
const takePhotoBtn = document.getElementById('takePhoto');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d'); // Contexto 2D para dibujar en el Canvas

let stream = null; // Variable para almacenar el MediaStream de la cámara

async function openCamera() {
    try {
        // 1. Definición de Restricciones (Constraints)
        const constraints = {
            video: {
                facingMode: { ideal: 'environment' }, // Solicita la cámara trasera
                width: { ideal: 320 },
                height: { ideal: 240 }
            }
        };

        // 2. Obtener el Stream de Medios
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // 3. Asignar el Stream al Elemento <video>
        video.srcObject = stream;
        
        // 4. Actualización de la UI
        cameraContainer.style.display = 'block';
        video.style.display = 'block';
        canvas.style.display = 'none';
        openCameraBtn.textContent = 'Cámara Abierta';
        openCameraBtn.disabled = true;
        takePhotoBtn.style.display = 'block';
        
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

    // 1. Dibujar el Frame de Video en el Canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // 2. Conversión a Data URL
    const imageDataURL = canvas.toDataURL('image/png');
    
    // 3. Mostrar la foto capturada
    video.style.display = 'none';
    canvas.style.display = 'block';
    takePhotoBtn.style.display = 'none';
    
    // 4. Detener el stream para liberar recursos
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
        video.srcObject = null;
    }
    
    // 5. Habilitar el botón para abrir cámara nuevamente
    openCameraBtn.textContent = 'Tomar Otra Foto';
    openCameraBtn.disabled = false;
    
    console.log('Foto capturada en base64:', imageDataURL.length, 'caracteres');
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

// Event listeners para la interacción del usuario
openCameraBtn.addEventListener('click', openCamera);
takePhotoBtn.addEventListener('click', takePhoto);

// Limpiar stream cuando el usuario cierra o navega fuera de la página
window.addEventListener('beforeunload', () => {
    closeCamera();
});
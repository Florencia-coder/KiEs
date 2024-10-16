const videoFeed = document.getElementById("videoFeed");
const capturedImage = document.getElementById("capturedImage");

// Función para capturar la imagen del video feed
function captureImageFromFeed() {
  // Crear un canvas temporal
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = videoFeed.width;
  canvas.height = videoFeed.height;

  // Dibujar la imagen del feed en el canvas
  context.drawImage(videoFeed, 0, 0, canvas.width, canvas.height);

  // Convertir el canvas a una URL de imagen
  const imageURL = canvas.toDataURL("image/png");
  capturedImage.src = imageURL;
  capturedImage.style.display = "block"; // Mostrar la imagen capturada
}

// Escuchar la tecla "Enter" para capturar la imagen
window.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault(); // Evita el envío del formulario
    captureImageFromFeed(); // Captura la imagen del feed
  }
});

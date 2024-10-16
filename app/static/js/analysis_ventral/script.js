const videoFeed = document.getElementById("videoFeed");
const capturedImage = document.getElementById("capturedImage");
const liveAnalysisBtn = document.getElementById("liveAnalysisBtn");
const captureButton = document.getElementById("captureImageButton");
const uploadButton = document.getElementById("uploadButton");
const uploadImageInput = document.getElementById("uploadImage");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d"); // Inicializa el contexto del canvas
let points = [];

canvas.width = 640; // Debe coincidir con el width en CSS
canvas.height = 480; // Debe coincidir con el height en CSS
const analyzeButton = document.getElementById("analyzeButton");

analyzeButton.addEventListener("click", () => {
  drawLinesBetweenPoints(points);
});

// Función para calcular el ángulo entre dos líneas
function calculateAngle(p1, p2, p3, p4) {
  const line1 = { x: p2.x - p1.x, y: p2.y - p1.y };
  const line2 = { x: p4.x - p3.x, y: p4.y - p3.y };

  const dotProduct = line1.x * line2.x + line1.y * line2.y;
  const magnitude1 = Math.sqrt(line1.x ** 2 + line1.y ** 2);
  const magnitude2 = Math.sqrt(line2.x ** 2 + line2.y ** 2);

  const angleInRadians = Math.acos(dotProduct / (magnitude1 * magnitude2));
  const angleInDegrees = angleInRadians * (180 / Math.PI); // Convertir a grados

  return angleInDegrees;
}

// Función para dibujar líneas entre los puntos
function drawLinesBetweenPoints(points) {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas

  // Redibujar la imagen subida en el canvas primero (mantener la imagen existente)
  if (uploadedImage) {
    ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
  }

  ctx.fillStyle = "red"; // Color de los puntos
  points.forEach((point) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  if (points.length === 4) {
    ctx.strokeStyle = "blue"; // Color de las líneas
    ctx.lineWidth = 2; // Ancho de las líneas

    // Dibuja la primera línea entre los dos primeros puntos
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.stroke();

    // Dibuja la segunda línea entre los dos últimos puntos
    ctx.beginPath();
    ctx.moveTo(points[2].x, points[2].y);
    ctx.lineTo(points[3].x, points[3].y);
    ctx.stroke();

    // Dibuja la línea de simetría de los hombros (horizontal)
    const shoulderY = points[0].y; // Altura del primer punto
    ctx.beginPath();
    ctx.moveTo(0, shoulderY);
    ctx.lineTo(canvas.width, shoulderY);
    ctx.strokeStyle = "green"; // Color de la línea de simetría
    ctx.lineWidth = 1; // Grosor de la línea
    ctx.stroke();

    // Dibuja la línea de simetría para la cadera (horizontal)
    const hipY = (points[2].y + points[3].y) / 2; // Altura media de los dos últimos puntos
    ctx.beginPath();
    ctx.moveTo(0, hipY);
    ctx.lineTo(canvas.width, hipY);
    ctx.strokeStyle = "orange"; // Color de la línea de simetría de la cadera
    ctx.lineWidth = 1; // Grosor de la línea
    ctx.stroke();

    // Calcular y mostrar el ángulo entre las líneas
    const shoulderAngle = calculateAngle(
      points[0],
      points[1],
      { x: points[0].x, y: shoulderY },
      { x: points[1].x, y: shoulderY }
    );
    const hipAngle = calculateAngle(
      points[2],
      points[3],
      { x: points[2].x, y: hipY },
      { x: points[3].x, y: hipY }
    );

    // Crear la lista ordenada (ol) en el DOM
    const angleList = document.getElementById("angleList");

    // Crear los elementos de la lista (li)
    const shoulderAngleLi = document.createElement("li");
    shoulderAngleLi.textContent = `Ángulo entre los hombros: ${shoulderAngle.toFixed(
      2
    )}°`;

    const hipAngleLi = document.createElement("li");
    hipAngleLi.textContent = `Ángulo entre las caderas: ${hipAngle.toFixed(
      2
    )}°`;

    // Agregar los elementos li a la lista ol
    angleList.appendChild(shoulderAngleLi);
    angleList.appendChild(hipAngleLi);
  }
}

// Función para calcular los ángulos de Cobb
function calculateCobbAngle(points) {
  // Envía los puntos al servidor para calcular el ángulo
  fetch("/calculate_cobb_angle", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ points }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Aquí puedes manejar la respuesta que contenga los ángulos calculados
      console.log("Ángulos de Cobb:", data.angles);
    })
    .catch((error) => {
      console.error("Error al calcular los ángulos:", error);
    });
}

// Manejar el clic en el canvas
canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect(); // Obtener las dimensiones reales del canvas
  const scaleX = canvas.width / rect.width; // Calcular el factor de escala en el eje X
  const scaleY = canvas.height / rect.height; // Calcular el factor de escala en el eje Y

  // Ajustar las coordenadas del clic para tener en cuenta el redimensionamiento
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;

  if (points.length < 4) {
    points.push({ x, y });
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  if (points.length === 4) {
    analyzeButton.style.display = "block";
  }
});

// Agregar evento al botón "Subir imagen"
uploadButton.addEventListener("click", () => {
  canvas.style.display = "block";
  uploadImageInput.click();
});

// Manejar la carga de la imagen
let uploadedImage = null;

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      uploadedImage = new Image();
      uploadedImage.onload = function () {
        ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
      };
      uploadedImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  document.getElementById("containerCard").style.display = "none";
}
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

// Mostrar el video feed cuando se presiona "Análisis en vivo"
liveAnalysisBtn.addEventListener("click", () => {
  videoFeed.style.display = "block"; // Mostrar el video feed
  captureImageButton.style.display = "block";
});

captureImageButton.addEventListener("click", () => {
  event.preventDefault(); // Evita el envío del formulario
  captureImageFromFeed(); // Captura la imagen del feed
});

// Escuchar la tecla "Enter" para capturar la imagen
window.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault(); // Evita el envío del formulario
    captureImageFromFeed(); // Captura la imagen del feed
  }
});

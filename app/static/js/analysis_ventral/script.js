const containerVideo = document.getElementById("container-video");
const videoFeed = document.getElementById("videoFeed");
const capturedImage = document.getElementById("capturedImage");
const liveAnalysisBtn = document.getElementById("liveAnalysisBtn");
const captureImageButton = document.getElementById("captureImageButton");
const uploadButton = document.getElementById("uploadButton");
const uploadImageInput = document.getElementById("uploadImage");
const backButton = document.getElementById("backImg");
const analyzeButton = document.getElementById("analyzeButton");
const ouputCanvas = document.getElementById("output_canvas");
const containerLive = document.getElementById("containerLive");
const angleList = document.getElementById("angleList");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d"); // Inicializa el contexto del canvas

let points = [];
// Manejar la carga de la imagen
let uploadedImage = null;

canvas.width = 640; // Debe coincidir con el width en CSS
canvas.height = 480; // Debe coincidir con el height en CSS

analyzeButton.addEventListener("click", () => {
  drawLinesBetweenPoints(points);
});

function handleRemoveLastPoint() {
  points.pop();

  if (points.length < 4) {
    angleList.style.display = "none";
    document.getElementById("generateButton").style.display = "none";
  }
  // Limpiar el canvas antes de redibujar
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Redibujar la imagen manteniendo la proporción
  if (uploadedImage) {
    const imgWidth = uploadedImage.width;
    const imgHeight = uploadedImage.height;
    const aspectRatio = imgWidth / imgHeight;

    let drawWidth, drawHeight;
    if (canvas.width / canvas.height > aspectRatio) {
      drawHeight = canvas.height;
      drawWidth = canvas.height * aspectRatio;
    } else {
      drawWidth = canvas.width;
      drawHeight = canvas.width / aspectRatio;
    }

    // Centrar la imagen
    const xOffset = (canvas.width - drawWidth) / 2;
    const yOffset = (canvas.height - drawHeight) / 2;
    ctx.drawImage(uploadedImage, xOffset, yOffset, drawWidth, drawHeight);
  }

  // Redibujar los puntos restantes
  points.forEach((point) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "green";
    ctx.fill();
    ctx.closePath();
  });

  if (points.length === 0) {
    document.getElementById("removeLastPoint").style.display = "none";
  }
}

function calculateAngle(p1, p2, p3, p4) {
  const line1 = { x: p2.x - p1.x, y: p2.y - p1.y };
  const line2 = { x: p4.x - p3.x, y: p4.y - p3.y };

  const dotProduct = line1.x * line2.x + line1.y * line2.y;
  const magnitude1 = Math.sqrt(line1.x ** 2 + line1.y ** 2);
  const magnitude2 = Math.sqrt(line2.x ** 2 + line2.y ** 2);

  let angleInRadians = Math.acos(dotProduct / (magnitude1 * magnitude2));

  if (isNaN(angleInRadians)) {
    angleInRadians = 0; // Si el valor está fuera de rango, lo dejamos en 0
  }
  const angleInDegrees = angleInRadians * (180 / Math.PI);

  return angleInDegrees;
}
// Función para dibujar líneas entre los puntos
function drawLinesBetweenPoints(points) {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas

  // Redibujar la imagen subida en el canvas primero (mantener la imagen existente)
  if (uploadedImage) {
    // Obtener las dimensiones de la imagen original
    const imgWidth = uploadedImage.width;
    const imgHeight = uploadedImage.height;

    // Calcular el factor de escalado para que la imagen se ajuste al canvas
    const scale = Math.min(canvas.width / imgWidth, canvas.height / imgHeight);

    // Calcular nuevas dimensiones
    const newWidth = imgWidth * scale;
    const newHeight = imgHeight * scale;

    // Calcular la posición para centrar la imagen en el canvas
    const x = (canvas.width - newWidth) / 2;
    const y = (canvas.height - newHeight) / 2;

    // Dibujar la imagen escalada en el canvas
    ctx.drawImage(uploadedImage, x, y, newWidth, newHeight);
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
    addAngleList(shoulderAngle, hipAngle);
  }
  analyzeButton.style.display = "none";
  containerLive.style.display = "none";
  document.getElementById("removeLastPoint").style.display = "none";
}

function addAngleList(shoulderAngle, hipAngle) {
  angleList.style.display = "block";
  angleList.innerText = "";
  console.log("angleList:", angleList.style.display);

  // Crear los elementos de la lista (li)
  const shoulderAngleLi = document.createElement("li");
  shoulderAngleLi.textContent = `Ángulo interno entre los hombros: ${shoulderAngle.toFixed(
    2
  )}°`;

  const hipAngleLi = document.createElement("li");
  hipAngleLi.textContent = `Ángulo interno entre las caderas: ${hipAngle.toFixed(
    2
  )}°`;

  // Agregar los elementos li a la lista ol
  angleList.appendChild(shoulderAngleLi);
  angleList.appendChild(hipAngleLi);
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

// Agregar evento al botón "Subir imagen"
uploadButton.addEventListener("click", () => {
  canvas.style.display = "block";
  document.getElementById("containerCard").style.display = "none";
  document.getElementById("infoBox").style.display = "flex";
  document.getElementById("backImg").style.display = "flex";
  document.getElementById("infoImgBox").style.display = "none";
  uploadImageInput.click();
});

// Función para manejar la carga de la imagen
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      uploadedImage = new Image();
      uploadedImage.onload = function () {
        // Limpiar el canvas y los puntos cada vez que se carga una nueva imagen
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        points = [];

        let maxWidth, maxHeight;
        if (window.innerWidth < 768) {
          // Dispositivo móvil
          maxWidth = 250;
          maxHeight = 250;
        } else if (window.innerWidth < 1024) {
          // Pa  ntallas medianas (tablet)
          maxWidth = 400;
          maxHeight = 350;
        } else {
          // Pantallas grandes (desktop)
          maxWidth = 600;
          maxHeight = 500;
        }
        let width = uploadedImage.width;
        let height = uploadedImage.height;

        // Escalar la imagen manteniendo la relación de aspecto
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(uploadedImage, 0, 0, width, height);

        // Opcional: Restablecer el botón "analizar" y otros elementos
        analyzeButton.style.display = "none";
        document.getElementById("removeLastPoint").style.display = "none";
      };
      uploadedImage.src = e.target.result;
    };
    reader.readAsDataURL(file);

    // Restablece el valor del input para que se pueda seleccionar la misma imagen
    uploadImageInput.value = "";
  }
}

// Agregar evento de cambio al input de archivo
uploadImageInput.addEventListener("change", handleImageUpload);

// Mostrar el video feed cuando se presiona "Análisis en vivo"
liveAnalysisBtn.addEventListener("click", () => {
  document.getElementById("containerCard").style.display = "none";
  canvas.style.display = "none";
  backButton.style.display = "block";
  containerVideo.style.display = "block";
  containerLive.style.display = "block";
  captureImageButton.style.display = "block";
});

// Escuchar la tecla "Enter" para capturar la imagen
window.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault(); // Evita el envío del formulario
    captureImageFromFeed(); // Captura la imagen del feed
  }
});

backButton.addEventListener("click", () => {
  // Mostrar elementos iniciales
  document.getElementById("containerCard").style.display = "flex";
  canvas.style.display = "none";
  document.getElementById("infoBox").style.display = "none";
  backButton.style.display = "none";
  analyzeButton.style.display = "none";
  const removeButton = document.querySelector(".remove-button");
  removeButton.style.display = "none";
  document.getElementById("infoImgBox").style.display = "block";
  containerLive.style.display = "none";
  document.getElementById("generateButton").style.display = "none";
  document.getElementById("generateLiveButton").style.display = "none";

  // Limpiar el canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpia el canvas por completo
  uploadedImage = null;

  // Reiniciar el array de puntos
  points = [];

  // Limpiar la lista de ángulos
  const angleList = document.getElementById("angleList");
  angleList.innerHTML = ""; // Limpiar el contenido de la lista

  captureImageButton.style.display = "none";
  capturedImage.style.display = "none";
});

function generatePDF(imgData, shoulderAngle, hipAngle) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let lineSpacing = 8;
  const marginLeft = 15;
  let yPosition = 20; // Posición inicial

  // Título del documento
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.text("ANÁLISIS VENTRAL - DORSAL", 105, 20, {
    align: "center",
  });
  doc.setLineWidth(0.5);
  doc.line(67, 21, 142, 21); // Subrayado del título

  // Agregar logo
  const logoImg = new Image();
  logoImg.src = "static/img/logo.png";

  logoImg.onload = function () {
    const logoWidth = 16;
    const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
    doc.addImage(logoImg, "PNG", 10, 8, logoWidth, logoHeight);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.text("KiEs", 18, 28, { align: "center" });

    // Información del paciente
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
    doc.text("DATOS DEL PACIENTE:", 15, 45);
    doc.setLineWidth(0.3);
    doc.line(15, 46, 62, 46); // Línea debajo de "DATOS DEL PACIENTE"

    const datosPacienteY = 52;
    lineSpacing = 4;
    doc.setFontSize(10);
    doc.setFont("Helvetica", "Oblique");
    doc.text(`DNI: ${pacienteDatos["dni"]}`, 15, datosPacienteY);
    doc.text(`Nombre: ${pacienteDatos.name}`, 15, datosPacienteY + lineSpacing);
    doc.text(
      `Edad: ${pacienteDatos.age}`,
      15,
      datosPacienteY + 2 * lineSpacing
    );
    doc.text(
      `Altura: ${pacienteDatos.height}`,
      15,
      datosPacienteY + 3 * lineSpacing
    );
    doc.text(
      `Peso: ${pacienteDatos.weight}`,
      15,
      datosPacienteY + 4 * lineSpacing
    );
    doc.text(
      `Fecha de consulta: ${pacienteDatos.consultaDate}`,
      15,
      datosPacienteY + 5 * lineSpacing
    );
    doc.text(
      `Historial: ${pacienteDatos.historial}`,
      15,
      datosPacienteY + 6 * lineSpacing
    );

    const imageYPosition = datosPacienteY + 6 * lineSpacing + 5; // Ajuste para la línea superior de la imagen

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const pdfWidth = doc.internal.pageSize.getWidth();
    const scaleFactor = 0.4;

    let imgScaledWidth = pdfWidth * scaleFactor;
    let imgScaledHeight = (imgHeight * imgScaledWidth) / imgWidth;

    const posX = (pdfWidth - imgScaledWidth) / 2;
    const posY = imageYPosition + 5;

    // Línea superior de la imagen
    doc.line(15, imageYPosition, pdfWidth - 15, imageYPosition);

    // Agregar la imagen escalada y centrada
    const imgData = canvas.toDataURL("image/png");
    doc.addImage(imgData, "PNG", posX, posY, imgScaledWidth, imgScaledHeight);

    // Línea inferior de la imagen
    const lineBelowImage = posY + imgScaledHeight + 5;
    doc.line(15, lineBelowImage, pdfWidth - 15, lineBelowImage);

    // Título "RESULTADOS DE ANÁLISIS" debajo de la imagen
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
    doc.text("RESULTADOS DE ANÁLISIS:", 15, lineBelowImage + 10);
    doc.setLineWidth(0.3);
    doc.line(15, lineBelowImage + 11, 71, lineBelowImage + 11);

    // Lista de angulos
    yPosition = lineBelowImage + 18;
    doc.setFontSize(10);
    doc.setFont("Helvetica", "Oblique");

    // Agregar detalles de puntos en el PDF
    if (points.length >= 4) {
      doc.text(`Ángulos internos:`, 15, yPosition - 1);
      yPosition += lineSpacing;
      doc.text(
        `• Ángulo interno entre los Hombros: ${shoulderAngle.toFixed(2)}°`,
        15,
        yPosition
      );
      yPosition += lineSpacing;
      doc.text(
        `• Ángulo interno entre las Caderas: ${hipAngle.toFixed(2)}°`,
        15,
        yPosition
      );
      yPosition += lineSpacing;
    }

    // Guardar el PDF
    doc.save("Análisis_ventral_dorsal.pdf");
  };
}

// Ajustar el botón de "Guardar Análisis"
document.getElementById("generateButton").addEventListener("click", (event) => {
  event.preventDefault(); // Evita el envío del formulario
  generatePDF(
    canvas.toDataURL("image/png"),
    calculateAngleAndDraw(points[0], points[1], true),
    calculateAngleAndDraw(points[2], points[3], false)
  ); // Genera y descarga el PDF
});

// Función para capturar el clic y agregar los puntos de los hombros y caderas
canvas.addEventListener("click", (event) => {
  if (points.length < 4) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width; // Calcular el factor de escala en el eje X
    const scaleY = canvas.height / rect.height; // Calcular el factor de escala en el eje Y

    // Ajustar las coordenadas del clic para tener en cuenta el redimensionamiento
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    points.push({ x, y });

    // Dibuja un círculo en el punto seleccionado
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "green";
    ctx.fill();
    ctx.closePath();

    // Cuando hayamos seleccionado 4 puntos, dibujamos las líneas y calculamos los ángulos
    if (points.length === 4) {
      const shoulderAngle = calculateAngleAndDraw(points[0], points[1], true);
      const hipAngle = calculateAngleAndDraw(points[2], points[3], false);

      // Crear la lista ordenada (ol) en el DOM
      const angleList = document.getElementById("angleList");
      angleList.style.display = "block";
      angleList.innerText = "";

      // Crear los elementos de la lista (li)
      const shoulderAngleLi = document.createElement("li");
      shoulderAngleLi.textContent = `Ángulo interno entre los Hombros: ${shoulderAngle.toFixed(
        2
      )}°`;

      const hipAngleLi = document.createElement("li");
      hipAngleLi.textContent = `Ángulo interno entre las Caderas: ${hipAngle.toFixed(
        2
      )}°`;

      // Agregar los elementos li a la lista ol
      angleList.appendChild(shoulderAngleLi);
      angleList.appendChild(hipAngleLi);
      containerLive.style.display = "none";
      document.getElementById("generateButton").style.display = "block";
    }
    if (points.length >= 1) {
      const removeButton = document.querySelector(".remove-button");
      removeButton.style.display = "block";
    }
  }
});

// Función para calcular el ángulo interno y dibujar en el canvas
function calculateAngleAndDraw(point1, point2, isShoulder) {
  // Dibuja la línea entre los puntos seleccionados
  ctx.beginPath();
  ctx.moveTo(point1.x, point1.y);
  ctx.lineTo(point2.x, point2.y);
  ctx.strokeStyle = "green";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();

  // Línea horizontal de referencia
  const referenceY = isShoulder ? point1.y : points[2].y; // Toma el penúltimo punto como referencia para la cadera
  ctx.beginPath();
  ctx.moveTo(point1.x, referenceY);
  ctx.lineTo(point2.x, referenceY);
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();

  // Vectores para el cálculo del ángulo
  const vector1 = { x: point2.x - point1.x, y: point2.y - point1.y };
  const vector2 = { x: point2.x - point1.x, y: 0 };

  // Cálculo del producto punto y las normas de los vectores
  const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
  const norm1 = Math.sqrt(vector1.x ** 2 + vector1.y ** 2);
  const norm2 = Math.sqrt(vector2.x ** 2 + 0);

  // Cálculo del ángulo en radianes y conversión a grados
  const cosTheta = dotProduct / (norm1 * norm2);
  const angleRadians = Math.acos(Math.min(Math.max(cosTheta, -1), 1)); // Clipping para evitar errores numéricos
  const angleDegrees = (angleRadians * 180) / Math.PI;

  // Ángulo interno (menor entre el ángulo calculado y su complemento)
  const internalAngle = Math.min(angleDegrees, 180 - angleDegrees);

  // Centro y dimensiones de la elipse para dibujar el ángulo
  const centerX = (point1.x + point2.x) / 2;
  const centerY = (point1.y + referenceY) / 2;
  const distance =
    Math.sqrt((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2) / 3;

  // Configuración del ángulo de inicio y fin en función de la posición de los puntos
  const startAngle = point1.y > referenceY ? 0 : Math.PI;
  const endAngle = startAngle + (internalAngle * Math.PI) / 180;

  // Dibuja el arco representando el ángulo interno
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, distance, distance, 0, startAngle, endAngle);
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();

  return internalAngle;
}

document.getElementById("captureImageButton").addEventListener("click", () => {
  event.preventDefault();
  captureImageFromFeed();
});

function captureImageFromFeed() {
  // Crear un canvas temporal
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  // Establecer el tamaño del canvas temporal igual al tamaño del video o del output_canvas
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  // Dibujar el video en el canvas temporal
  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  // Dibujar el contenido del output_canvas encima del video
  const outputCanvas = document.getElementById("output_canvas");
  context.drawImage(outputCanvas, 0, 0, canvas.width, canvas.height);

  // Convertir el canvas temporal en una URL de imagen
  const imageURL = canvas.toDataURL("image/png");

  // Asignar la URL de imagen al elemento img para mostrar la captura
  const capturedImage = document.getElementById("capturedImage");
  capturedImage.src = imageURL;
  capturedImage.style.display = "block"; // Mostrar la imagen capturada
  document.getElementById("generateButton").style.display = "block";
}

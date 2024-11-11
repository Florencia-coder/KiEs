let points = [];
let scale = 1;
const removeButton = document.querySelector(".remove-button");
// const pacienteDatos = JSON.parse('paciente');
// const pacienteDatoss = JSON.parse('{"paciente"}');
function removePoint() {
  points.pop();
  // Remover último punto visual (elemento HTML)
  const imageContainer = document.querySelector(".image-container");
  const lastPoint = imageContainer.querySelector(".point:last-child");
  const removeButton = document.querySelector(".remove-button");
  if (lastPoint) {
    lastPoint.remove();
  }

  if (points.length === 0) {
    removeButton.style.display = "none";
  }
}

function previewImage(event) {
  const input = event.target;
  const preview = document.getElementById("imagePreview");
  const imageContainer = document.getElementById("imageContainer");
  const removeImg = document.getElementById("removeImg");
  document.getElementById("infoBox").style.display = "block";
  document.getElementById("infoImgBox").style.display = "none";

  removeImg.style.display = "block";
  document.getElementById("uploadCard").style.display = "none"; // Ocultar tarjeta
  const reader = new FileReader();
  reader.onload = function () {
    const dataURL = reader.result;
    const img = new Image();
    img.src = dataURL;

    img.onload = function () {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const maxWidth = 800; // Ancho máximo deseado
      const maxHeight = 500; // Alto máximo deseado
      let width = img.width;
      let height = img.height;

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
      ctx.drawImage(img, 0, 0, width, height);

      // Actualizar la vista previa
      preview.src = canvas.toDataURL("image/png");
      preview.style.display = "block";
      imageContainer.style.display = "block"; // Mostrar contenedor cuando se seleccione una imagen
    };
  };
  reader.readAsDataURL(input.files[0]);

  // Reset points if a new image is selected
  points = [];
  imageContainer.querySelectorAll(".point").forEach((point) => point.remove());
  imageContainer.querySelectorAll(".line").forEach((line) => line.remove()); // Remove previous lines
}

function markPoint(event) {
  if (points.length >= 4) {
    alert("Se ha alcanzado el número máximo de puntos (4).");
    return; // Exit the function if the limit is reached
  }

  const image = event.target;
  const rect = image.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Create a red dot
  const point = document.createElement("div");
  point.classList.add("point");
  point.style.left = `${x}px`;
  point.style.top = `${y}px`;

  // Append the point to the image container
  const imageContainer = document.querySelector(".image-container");
  imageContainer.appendChild(point);

  // Store the coordinates in an array
  points.push({ x, y });
  // Check if points array has at least one point and show the remove button
  const removeButton = document.querySelector(".remove-button");
  if (points.length >= 1) {
    removeButton.style.display = "block";
  }
}

function calcularAngulo(p1, p2, p3) {
  const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
  let angle = (angle2 - angle1) * (180 / Math.PI);

  // Normalizar el ángulo
  if (angle < 0) angle += 360;
  return angle;
}

function analyzePoints() {
  const asymmetries = [];
  const symmetries = []; // almacenamiento de asimetria de puntos
  const removeButton = document.querySelector(".remove-button");

  removeButton.style.display = "none";
  if (points.length < 3) {
    alert("Se requieren al menos 3 puntos para realizar el análisis.");
    return;
  }

  // Calcular los ángulos
  const anguloCervical = calcularAngulo(points[0], points[1], points[2]);

  // Evaluar postura cervical
  const evaluacionCervical = evaluarCervical(anguloCervical);

  let anguloDorsal = null;
  let evaluacionDorsal = "";
  if (points.length == 4) {
    anguloDorsal = calcularAngulo(points[1], points[2], points[3]);
    evaluacionDorsal = evaluarDorsal(anguloDorsal);
  }

  // Verificar asimetrías
  for (let i = 0; i < points.length - 2; i++) {
    const { x: x1, y: y1 } = points[i];
    const { x: x2, y: y2 } = points[i + 1];
    const { x: x3, y: y3 } = points[i + 2];

    const angle1 = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
    const angle2 = Math.atan2(y3 - y2, x3 - x2) * (180 / Math.PI);

    // Comparar los ángulos para encontrar asimetrías
    if (Math.abs(angle2 - angle1) > 5) {
      asymmetries.push([i + 1, i + 2]);
    } else {
      symmetries.push([i, i + 1]); // Almacenar puntos simétricos
    }
  }

  console.log({ symmetries });
  console.log({ asymmetries });

  // Dibujar los puntos que están entre ambas asimetrías
  drawSymmetryLines(asymmetries);

  // Mostrar resultado de los ángulos y las evaluaciones
  const resultList = document.getElementById("asymmetryList");
  resultList.style.display = "block";
  resultList.innerHTML = ""; // Borrar resultados anteriores
  const cervicalItem = document.createElement("li");
  cervicalItem.textContent = `Ángulo Cervical: ${anguloCervical.toFixed(
    2
  )} grados - ${evaluacionCervical}`;
  resultList.appendChild(cervicalItem);

  if (anguloDorsal !== null) {
    const dorsalItem = document.createElement("li");
    dorsalItem.textContent = `Ángulo Dorsal: ${anguloDorsal.toFixed(
      2
    )} grados - ${evaluacionDorsal}`;
    resultList.appendChild(dorsalItem);
  }
  document.getElementById("generateButton").style.display = "block";
}

function drawSymmetryLines(asymmetries) {
  const imageContainer = document.querySelector(".image-container");

  // Limpiar líneas anteriores
  const existingLines = document.querySelectorAll(".line");
  existingLines.forEach((line) => line.remove());

  // Dibujar líneas entre todos los puntos consecutivos
  for (let i = 0; i < points.length - 1; i++) {
    const { x: x1, y: y1 } = points[i];
    const { x: x2, y: y2 } = points[i + 1];

    const line = document.createElement("div");
    line.classList.add("line");
    const length = Math.hypot(x2 - x1, y2 - y1);
    line.style.width = `${length}px`;

    const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
    line.style.transform = `rotate(${angle}deg)`;
    line.style.left = `${x1}px`;
    line.style.top = `${y1}px`;

    imageContainer.appendChild(line);
  }
}

// Función para evaluar la postura cervical
function evaluarCervical(angulo) {
  if (angulo >= 160 && angulo <= 180) {
    return "Postura cervical: Dentro de rango normal (160 a 180 grados).";
  } else if (angulo < 160) {
    return "Postura cervical: Hiperlordosis cervical (Ángulo menor a 160 grados).";
  } else if (angulo > 180) {
    return "Postura cervical: Hipocifosis cervical (Ángulo mayor a 180 grados).";
  }
}

// Función para evaluar la postura dorsal
function evaluarDorsal(angulo) {
  if (angulo >= 170 && angulo <= 180) {
    return "Postura dorsal: Dentro de rango normal (170 a 180 grados).";
  } else if (angulo < 170) {
    return "Postura dorsal: Hipercifosis dorsal (Ángulo menor a 170 grados).";
  } else if (angulo > 180) {
    return "Postura dorsal: Hipolordosis dorsal (Ángulo mayor a 180 grados).";
  }
}

// Asignar eventos a los botones y elementos de la página
document.getElementById("removeImg").addEventListener("click", () => {
  removeButton.style.display = "none";
  const resultList = document.getElementById("asymmetryList");
  resultList.style.display = "none";
  resultList.innerHTML = "";
  document.getElementById("generateButton").style.display = "none";
  document.getElementById("imagePreview").src = "#";
  document.getElementById("imagePreview").style.display = "none";
  document.getElementById("imageContainer").style.display = "none";
  document.getElementById("infoBox").style.display = "none";
  document.getElementById("infoImgBox").style.display = "block";
  document.getElementById("uploadCard").style.display = "block";
  points = [];
});
// document.getElementById("markImage").addEventListener("click", markPoint);
// document.getElementById("analyzeBtn").addEventListener("click", analyzePoints);
// document.getElementById("removeButton").addEventListener("click", removePoint);

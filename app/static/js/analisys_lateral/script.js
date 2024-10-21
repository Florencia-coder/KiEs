let points = [];
let scale = 1;

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
  // const evaluacionCervical = evaluarCervical(anguloCervical);
  let anguloDorsal = null;
  let evaluacionDorsal = "";
  if (points.length == 4) {
    anguloDorsal = calcularAngulo(points[1], points[2], points[3] || points[2]);
    evaluacionDorsal = evaluarDorsal(anguloDorsal);
  }

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

  // Dibujar los puntos que estan entre ambas asimetrias
  drawSymmetryLines(asymmetries);

  // Mostrar resultado de los angulos
  const resultList = document.getElementById("asymmetryList");
  resultList.innerHTML = ""; // borrar resultados anteriores
  if (asymmetries.length > 0) {
    asymmetries.forEach(([anguloCervical, evaluacionCervical]) => {
      const cervicalItem = document.createElement("li");
      cervicalItem.textContent = `Ángulo Cervical: ${anguloCervical.toFixed(
        2
      )} grados - ${evaluacionCervical}`;
      resultList.appendChild(cervicalItem);
    });
  } else {
    if (anguloDorsal !== null) {
      const dorsalItem = document.createElement("li");
      dorsalItem.textContent = `Ángulo Dorsal: ${anguloDorsal.toFixed(
        2
      )} grados - ${evaluacionDorsal}`;
      resultList.appendChild(dorsalItem);
    }
  }
}

function drawSymmetryLines() {
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
  } else {
    return "Postura cervical: Hipocifosis cervical (Ángulo mayor a 180 grados).";
  }
}

// Función para evaluar la postura dorsal
function evaluarDorsal(angulo) {
  if (angulo >= 170 && angulo <= 180) {
    return "Postura dorsal: Dentro de rango normal (170 a 180 grados).";
  } else if (angulo < 170) {
    return "Postura dorsal: Hipercifosis dorsal (Ángulo menor a 170 grados).";
  } else {
    return "Postura dorsal: Hipolordosis dorsal (Ángulo mayor a 180 grados).";
  }
}

document
  .getElementById("analyzeButton")
  .addEventListener("click", async function () {
    const fileInput = document.getElementById("fileInput");
    if (fileInput.files.length === 0) {
      alert("Por favor, selecciona una imagen.");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    formData.append("puntos_marcados", JSON.stringify(puntosMarcados));

    const response = await fetch("/analysis_lateral", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (response.ok) {
      processedImage.src = `uploads/${data.processed_image}`;
      processedImage.onload = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(processedImage, 0, 0);
        mostrarEvaluaciones(data);
      };
    } else {
      alert(data.error);
    }
  });

function mostrarEvaluaciones(data) {
  ctx.fillStyle = "green";
  ctx.font = "16px Arial";
  ctx.fillText(`Ángulo Cervical: ${data.angulo_cervical}`, 10, 30);
  ctx.fillText(`Ángulo Dorsal: ${data.angulo_dorsal}`, 10, 60);

  // Mostrar las evaluaciones
  ctx.fillStyle = "blue"; // Cambia el color si es necesario
  ctx.fillText(data.evaluacion_cervical, 10, 100);
  ctx.fillText(data.evaluacion_dorsal, 10, 130);
}

function removeImage() {
  // Eliminar imagen, puntos y líneas, y mostrar tarjeta de nuevo
  const imgPreview = document.getElementById("imagePreview");
  imgPreview.src = "#";
  imgPreview.style.display = "none";
  document.getElementById("uploadCard").style.display = "block"; // Mostrar tarjeta
  document.getElementById("removeImg").style.display = "none"; // Ocultar botón de eliminar imagen
  document.querySelector(".remove-button").style.display = "none";
  document.getElementById("infoBox").style.display = "none";
  document.getElementById("infoImgBox").style.display = "block";

  const imageContainer = document.querySelector(".image-container");
  imageContainer.style.display = "none"; // Ocultar contenedor de imagen
  document.getElementById("file").value = ""; // Limpiar input de archivo

  // Eliminar puntos y líneas dibujadas
  points = [];
  imageContainer.querySelectorAll(".point").forEach((point) => point.remove());
  imageContainer.querySelectorAll(".line").forEach((line) => line.remove());

  // Eliminar las listas de asimetrías previas
  const resultList = document.getElementById("asymmetryList");
  resultList.innerHTML = ""; // Vaciar la lista de resultados de asimetría
}

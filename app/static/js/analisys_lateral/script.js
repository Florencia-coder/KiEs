let points = [];
let scale = 1;
const removeButton = document.querySelector(".remove-button");

function removePoint() {
  points.pop();
  const imageContainer = document.querySelector(".image-container");
  const lastPointContainer = imageContainer.querySelector(".point-container:last-child");
  
  if (lastPointContainer) {
    lastPointContainer.remove(); // Eliminar el contenedor del punto y el número
  }

  const removeButton = document.querySelector(".remove-button");
  if (points.length === 0) {
    removeButton.style.display = "none";
  }
}
function removeImage() {
  const imagePreview = document.getElementById("imagePreview");
  const removeImgButton = document.getElementById("removeImg");
  const fileInput = document.getElementById("fileInput"); 
  const imageContainer = document.querySelector(".image-container");

  if (!fileInput) {
    console.error("fileInput no encontrado");
    return;
  }

  // Ocultar imagen y botón de eliminar
  imagePreview.style.display = "none";
  imagePreview.src = "#";
  removeImgButton.style.display = "none";

  // Limpiar el input de archivo
  fileInput.value = "";
  fileInput.disabled = false;

  // Limpiar el array de puntos
  points = [];
  // Eliminar los textos (elementos <span>) en el contenedor de la imagen
  const texts = imageContainer.querySelectorAll("span");
  texts.forEach(text => text.remove());
  imageContainer.querySelectorAll("span").forEach((text) => text.remove());
  
  // También puedes eliminar los puntos si es necesario
  const pointsElements = imageContainer.querySelectorAll(".point-container");
  pointsElements.forEach(point => point.remove());
  // Limpiar el contenido del contenedor de imagen (eliminando cualquier otro elemento)
  imageContainer.innerHTML = ""; 
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

      // Determinar maxWidth y maxHeight según el ancho de pantalla
      let maxWidth, maxHeight;
      if (window.innerWidth < 768) { // Dispositivo móvil
        maxWidth = 250;
        maxHeight = 250;
      } else if (window.innerWidth < 1024) { // Pantallas medianas (tablet)
        maxWidth = 400;
        maxHeight = 350;
      } else { // Pantallas grandes (desktop)
        maxWidth = 600;
        maxHeight = 500;
      }
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
  // Eliminar los textos (elementos <span>) en el contenedor de la imagen
  imageContainer.querySelectorAll("span").forEach((text) => text.remove());
}


// Función para manejar los clics y guardar los puntos
function markPoint(event) {
  // Limitar el número de puntos a 8
  if (points.length >= 6) {
    alert("Se ha alcanzado el número máximo de puntos (6).");
    return; 
  }

  const image = event.target;
  const rect = image.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Crear un contenedor para el punto y el número
  const pointContainer = document.createElement("div");
  pointContainer.classList.add("point-container");
  pointContainer.style.position = "absolute";
  pointContainer.style.left = `${x}px`;
  pointContainer.style.top = `${y}px`;

  // Crear el punto (div)
  const point = document.createElement("div");
  point.classList.add("point");

  // Determinar el texto y color para cada punto
  let label = "";
  let labelColor = "";

  if (points.length === 0 || points.length === 1) {
    label = `${points.length + 1}`; // Puntos 1 y 2
    labelColor = "orange"; // Naranja
  } else if (points.length === 2 || points.length === 3) {
    label = `${points.length + 1}`; // Puntos 3 y 4
    labelColor = "red"; // Rojo
  } else if (points.length === 4 || points.length === 5) {
    label = `${points.length + 1}`; // Puntos 5 y 6
    labelColor = "violet"; // Violeta
  }

  // Crear el texto con el color correspondiente cerca del punto
  const text = document.createElement("span");
  text.textContent = label;
  text.style.color = labelColor;
  text.style.position = "relative";
  text.style.left = "10px"; // Posición relativa respecto al punto
  text.style.top = "10px";

  // Añadir el punto y el texto al contenedor
  pointContainer.appendChild(point);
  pointContainer.appendChild(text);

  // Añadir el contenedor a la imagen
  const imageContainer = document.querySelector(".image-container");
  imageContainer.appendChild(pointContainer);

  // Almacenar las coordenadas en un array
  points.push({ x, y });

  // Mostrar el botón de eliminar si hay al menos un punto
  const removeButton = document.querySelector(".remove-button");
  if (points.length >= 1) {
    removeButton.style.display = "flex";
  }
}

function calcularAngulo(p1, p2, p3, p4) {

  // Cálculo de las pendientes
  const angle1 = (p2.y - p1.y) / (p2.x - p1.x);
  const angle2 = (p4.y - p3.y) / (p4.x - p3.x);

  // Manejo de pendientes verticales
  const pendiente1 = p2.x !== p1.x ? angle1 : Infinity;
  const pendiente2 = p4.x !== p3.x ? angle2 : Infinity;

  // Fórmula para calcular el ángulo
  const angle = Math.atan(Math.abs((pendiente2 - pendiente1) / (1 + pendiente1 * pendiente2)));

  // Convertir a grados
  return (angle * 180) / Math.PI;
}

// Extender las rectas y ajustar la longitud
function extenderLinea(p1, p2, height) {
  // Extendemos la línea en ambas direcciones
  x1, y1 = p1
  x2, y2 = p2
  //  Calcular las pendientes de la línea
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  // Extendemos un poco las líneas, pero no tanto
  if (dx !== 0) {
    const m = dy / dx;
    const xStart = p1.x - 50;
    const yStart = Math.round(p1.y - m * (p1.x - xStart));
    const xEnd = p2.x + 50;
    const yEnd = Math.round(p2.y + m * (xEnd - p2.x));
    return [{ x: xStart, y: yStart }, { x: xEnd, y: yEnd }];
  } else {
    return [{ x: p1.x, y: 0 }, { x: p1.x, y: height }];
  }
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
  const anguloCervical = calcularAngulo(points[0], points[1], points[2], points[3]);

  // Evaluar postura cervical
  const evaluacionCervical = evaluarCervical(anguloCervical);

  let anguloDorsal = null;
  let evaluacionDorsal = "";
  if (points.length >= 4) {
    anguloDorsal = calcularAngulo(points[2], points[3], points[4], points[5]);
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
  cervicalItem.textContent = `Ángulo Dosal: ${anguloCervical.toFixed(2)} grados - ${evaluacionCervical}`;
  resultList.appendChild(cervicalItem);

 
  const dorsalItem = document.createElement("li");
  dorsalItem.textContent = `Ángulo Lumbar: ${anguloDorsal.toFixed(2)} grados - ${evaluacionDorsal}`;
  resultList.appendChild(dorsalItem);
  
  document.getElementById("generateButton").style.display = "block";
}

function drawSymmetryLines(asymmetries) {
  const imageContainer = document.querySelector(".image-container");

  // Limpiar líneas anteriores
  const existingLines = document.querySelectorAll(".line");
  existingLines.forEach((line) => line.remove());


  // Dibujar líneas extendidas entre puntos 2-3, 4-5, 6-7
  if (points.length >= 2) {
    const lineNaranja = drawExtendedLine(points[0], points[1], "orange");
    imageContainer.appendChild(lineNaranja);
  }

  if (points.length >= 4) {
    const lineRoja = drawExtendedLine(points[2], points[3], "red"); // Cambié de blanco a rojo
    imageContainer.appendChild(lineRoja);
  }

  if (points.length >= 6) {
    const lineAzul = drawExtendedLine(points[4], points[5], "deepskyblue"); // Cambié de amarillo a azul eléctrico
    imageContainer.appendChild(lineAzul);
  }

  // Dibujar las líneas entre los puntos que corresponden a asimetrías
  // modifique algo acá
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

function drawExtendedLine(point1, point2, color) {
  const { x: x1, y: y1 } = point1;
  const { x: x2, y: y2 } = point2;

  // Calcular la longitud de la línea
  const length = Math.hypot(x2 - x1, y2 - y1);

  // Calcular el ángulo de la línea en grados
  const angle = Math.atan2(y2 - y1, x2 - x1);

  // Definir cuánto quieres extender la línea (puedes ajustar este valor según el tamaño que desees)
  const extensionLength = 100;  // Valor para extender la línea más allá de los puntos

  // Calcular las posiciones de inicio y fin extendidas
  const extendedX1 = x1 - extensionLength * Math.cos(angle);
  const extendedY1 = y1 - extensionLength * Math.sin(angle);
  const extendedX2 = x2 + extensionLength * Math.cos(angle);
  const extendedY2 = y2 + extensionLength * Math.sin(angle);

  // Calcular la longitud total de la línea extendida
  const extendedLength = Math.hypot(extendedX2 - extendedX1, extendedY2 - extendedY1);

  // Crear un div para la línea
  const line = document.createElement("div");
  line.classList.add("line");

  // Configurar el estilo de la línea
  line.style.position = "absolute";
  line.style.width = `${extendedLength}px`;
  line.style.transform = `rotate(${angle}rad)`; // Rotar la línea según el ángulo
  line.style.left = `${extendedX1}px`; // Posición horizontal de la línea extendida
  line.style.top = `${extendedY1}px`; // Posición vertical de la línea extendida
  line.style.backgroundColor = color; // Color de la línea

  return line;
}

// Función para evaluar la curvatura Dorsal
function evaluarCervical(angulo) {
  if (angulo >= 20 && angulo <= 40) {
    return "Dentro de rango normal (20 a 40 grados).\n";

  } else if (angulo >40){
    return "Se estima una hipercifosis dorsal (Ángulo mayor a 40 grados).";
  }
}

// Función para evaluar la curvatura Lumbar
function evaluarDorsal(angulo) {
  if (angulo >= 40 && angulo <= 60) {
    return " Dentro de rango normal (40 a 60 grados).\n";
  } else if (angulo >60) {
    return " Hipercifosis lumbar (Ángulo mayor a 60 grados).";
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
  label = [];
  labelColor = [];
});
// document.getElementById("markImage").addEventListener("click", markPoint);
// document.getElementById("analyzeBtn").addEventListener("click", analyzePoints);
// document.getElementById("removeButton").addEventListener("click", removePoint);

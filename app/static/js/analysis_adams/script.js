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
      imageContainer.style.display = "block"; // Mostrar imagen
      document.getElementById("uploadCard").style.display = "none"; // Ocultar tarjeta
    };
  };
  reader.readAsDataURL(input.files[0]);

  // Reset points if a new image is selected
  points = [];
  imageContainer.querySelectorAll(".point").forEach((point) => point.remove());
  imageContainer.querySelectorAll(".line").forEach((line) => line.remove()); // Remove previous lines
}

function markPoint(event) {
  if (points.length >= 12) {
    alert("Se ha alcanzado el número máximo de puntos (12).");
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

function analyzePoints() {
  const asymmetries = [];
  const symmetries = []; // Store symmetrical points
  const removeButton = document.querySelector(".remove-button");

  removeButton.style.display = "none";
  if(points.length < 12){
    return alert("Agrege la información necesaria")
  }

  for (let i = 0; i < points.length - 2; i++) {
    const { x: x1, y: y1 } = points[i];
    const { x: x2, y: y2 } = points[i + 1];
    const { x: x3, y: y3 } = points[i + 2];

    const angle1 = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
    const angle2 = Math.atan2(y3 - y2, x3 - x2) * (180 / Math.PI);
    if (Math.abs(angle2 - angle1) > 5) {
      asymmetries.push([i + 1, i + 2]);
    } else {
      symmetries.push([i, i + 1]); // Store symmetrical points
    }
  }

  // Dibujar los puntos que estan entre ambas asimetrias
  drawSymmetryLines(asymmetries);
  document.getElementById("generateButton").style.display = "block"
  // Mostrar resultado de asimetria
  const resultList = document.getElementById("asymmetryList");
  resultList.innerHTML = ""; // borrar resultados anteriores
  if (asymmetries.length > 0) {
    asymmetries.forEach(([point1, point2]) => {
      const listItem = document.createElement("li");
      listItem.textContent = `Asimetría entre los puntos ${point1} y ${point2}`;
      resultList.appendChild(listItem);
    });
  } else {
    const noAsymmetryItem = document.createElement("li");
    noAsymmetryItem.textContent = "No se detectaron asimetrías significativas.";
    resultList.appendChild(noAsymmetryItem);
  }
}

function drawSymmetryLines(asymmetries) {
  const imageContainer = document.querySelector(".image-container");
  asymmetries.forEach(([index1, index2]) => {
    const { x: x1, y: y1 } = points[index1 - 1];
    const { x: x2, y: y2 } = points[index2 - 1];

    const line = document.createElement("div");
    line.classList.add("line");
    const length = Math.hypot(x2 - x1, y2 - y1);
    line.style.width = `${length}px`;

    const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
    line.style.transform = `rotate(${angle}deg)`;
    line.style.left = `${x1}px`;
    line.style.top = `${y1}px`;

    imageContainer.appendChild(line);
  });
}

function removeImage() {
  // Eliminar imagen, puntos y líneas, y mostrar tarjeta de nuevo
  const imgPreview = document.getElementById("imagePreview");
  imgPreview.src = "#";
  imgPreview.style.display = "none";
  document.getElementById("uploadCard").style.display = "block"; // Mostrar tarjeta
  document.getElementById("removeImg").style.display = "none"; // Ocultar botón de eliminar imagen
  document.querySelector(".remove-button").style.display = "none";
  document.getElementById("infoImgBox").style.display = "block";
  document.getElementById("infoBox").style.display = "none";
  document.getElementById("generateButton").style.display ="none"

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

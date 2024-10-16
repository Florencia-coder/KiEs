from flask import render_template, request, redirect, current_app
from werkzeug.utils import secure_filename
import numpy as np
import cv2
import os

# Extensiones permitidas para subir archivos
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def init_analysis_adams_routes(app):
    @app.route('/analysis_adams', methods=['GET', 'POST'])
    def analysis_adams():
        analyzed_image = None
        if request.method == 'POST':
            if 'file' not in request.files:
                print('No se ha subido ninguna imagen')
                return redirect(request.url)
        
            file = request.files['file']
            if file.filename == '':
                return redirect(request.url)
        
            if file and allowed_file(file.filename):
                filepath = save_image(file)
                if filepath:
                    # Procesar la imagen con OpenCV
                    image = cv2.imread(filepath)

                    # Verificar que la imagen se haya cargado correctamente
                    if image is None:
                        print("Error al cargar la imagen.")
                        return redirect(request.url)

                    # Puntos de ejemplo para el análisis (ajustar lógica según tus necesidades)
                    points = [(100, 200), (150, 250), (200, 300)]  # Puntos de ejemplo
                    asymmetries = analyze_spine(points)

                    # Dibuja líneas entre puntos con asimetrías en la imagen
                    for (i, j) in asymmetries:
                        if i <= len(points) and j <= len(points):
                            pt1 = points[i - 1]
                            pt2 = points[j - 1]
                            cv2.line(image, pt1, pt2, (0, 0, 255), 2)
                            cv2.putText(image, f"Asimetría {i}-{j}", (pt1[0], pt1[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1, cv2.LINE_AA)

                    # Guardar la imagen procesada
                    result_filename = 'result_' + os.path.basename(filepath)
                    result_image_path = os.path.join(app.config['UPLOAD_FOLDER'], result_filename)
                    cv2.imwrite(result_image_path, image)

                    # Establecer la ruta de la imagen procesada para mostrarla
                    analyzed_image = result_filename

                    return render_template('analysis_adams.html', analyzed_image=analyzed_image)

        return render_template('analysis_adams.html', analyzed_image=analyzed_image)

    
# Función para guardar la imagen en el servidor
def save_image(file):
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        return filepath
    return None

# Verificar si el archivo tiene una extensión permitida
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Función para analizar los puntos de la columna vertebral
def analyze_spine(points):
    asymmetries = []
    for i in range(len(points) - 2):
        x1, y1 = points[i]
        x2, y2 = points[i + 1]
        x3, y3 = points[i + 2]

        angle1 = np.degrees(np.arctan2(y2 - y1, x2 - x1))
        angle2 = np.degrees(np.arctan2(y3 - y2, x3 - x2))

        if np.abs(angle2 - angle1) > 5:
            asymmetries.append((i + 1, i + 2))
    return asymmetries
from flask import Flask, render_template, request, jsonify
import cv2
import numpy as np
import base64

# Funcion para calcular el angulo entre tres puntos
def calcular_angulo(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)

    angulo = np.degrees(
        np.arctan2(c[1] - b[1], c[0] - b[0]) - 
        np.arctan2(a[1] - b[1], a[0] - b[0])
    )

    angulo = abs(angulo)
    if angulo > 180:
        angulo = 360 - angulo

    return angulo

def init_analysis_lateral_routes(app):
    @app.route('/analysis_lateral', methods=['GET', 'POST'])
    def analysis_lateral():
        if request.method == 'POST':
            # Obtener la imagen del formulario
            image_data = request.form.get('image_data')
            
            if image_data is None:
                return jsonify({"error": "No se recibió imagen"}), 400
            
            # Decodificar la imagen en base64
            image_data = image_data.split(',')[1]
            img_bytes = base64.b64decode(image_data)
            np_arr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            
            # Listas para almacenar los puntos marcados (deberían venir del frontend)
            puntos_marcados = [
                (100, 200), (150, 250), (200, 300)  # Ejemplo de puntos, reemplaza con los reales
            ]
            
            # Procesar la imagen y hacer el análisis
            if len(puntos_marcados) >= 3:
                angulo_cervical = calcular_angulo(puntos_marcados[0], puntos_marcados[1], puntos_marcados[2])
                evaluacion_cervical = ""
                if 160 <= angulo_cervical <= 180:
                    evaluacion_cervical = "Postura cervical: Dentro de rango normal (160 a 180 grados)."
                elif angulo_cervical < 160:
                    evaluacion_cervical = "Postura cervical: Hiperlordosis cervical (Angulo menor a 160 grados)."
                else:
                    evaluacion_cervical = "Postura cervical: Hipocifosis cervical (Angulo mayor a 180 grados)."

                # Evaluacion dorsal solo si hay al menos 4 puntos
                evaluacion_dorsal = ""
                if len(puntos_marcados) >= 4:
                    angulo_dorsal = calcular_angulo(puntos_marcados[1], puntos_marcados[2], puntos_marcados[3])
                    if 170 <= angulo_dorsal <= 180:
                        evaluacion_dorsal = "Postura dorsal: Dentro de rango normal (170 a 180 grados)."
                    elif angulo_dorsal < 170:
                        evaluacion_dorsal = "Postura dorsal: Hipercifosis dorsal (Angulo menor a 170 grados)."
                    else:
                        evaluacion_dorsal = "Postura dorsal: Hipolordosis dorsal (Angulo mayor a 180 grados)."

                # Dibujar líneas y añadir texto
                for i in range(len(puntos_marcados) - 1):
                    cv2.line(img, tuple(puntos_marcados[i]), tuple(puntos_marcados[i + 1]), (0, 255, 0), 2)

                # Mostrar evaluaciones en la imagen con fondo transparente
                overlay = img.copy()
                cv2.rectangle(overlay, (0, img.shape[0] - 120), (img.shape[1], img.shape[0]), (0, 0, 0), -1)
                alpha = 0.6
                img = cv2.addWeighted(overlay, alpha, img, 1 - alpha, 0)

                y0, dy = img.shape[0] - 100, 20
                font_scale = 0.6
                font_thickness = 1
                cv2.putText(img, f'Angulo Cervical: {angulo_cervical:.2f} grados', (10, y0), cv2.FONT_HERSHEY_SIMPLEX, font_scale, (0, 255, 0), font_thickness, cv2.LINE_AA)
                cv2.putText(img, evaluacion_cervical, (10, y0 + dy), cv2.FONT_HERSHEY_SIMPLEX, font_scale, (0, 255, 0), font_thickness, cv2.LINE_AA)

                if evaluacion_dorsal:
                    cv2.putText(img, f'Angulo Dorsal: {angulo_dorsal:.2f} grados', (10, y0 + 2 * dy), cv2.FONT_HERSHEY_SIMPLEX, font_scale, (0, 255, 0), font_thickness, cv2.LINE_AA)
                    cv2.putText(img, evaluacion_dorsal, (10, y0 + 3 * dy), cv2.FONT_HERSHEY_SIMPLEX, font_scale, (0, 255, 0), font_thickness, cv2.LINE_AA)

                # Codificar la imagen procesada en base64 para enviarla de vuelta al frontend
                _, img_encoded = cv2.imencode('.png', img)
                img_base64 = base64.b64encode(img_encoded).decode('utf-8')

                return jsonify({'processed_image': img_base64, 'evaluacion_cervical': evaluacion_cervical, 'evaluacion_dorsal': evaluacion_dorsal})
            else:
                return jsonify({"error": "Se necesitan al menos 3 puntos para el análisis"}), 400

        return render_template('analysis_lateral.html')

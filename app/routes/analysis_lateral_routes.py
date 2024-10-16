from flask import Flask, render_template, request, redirect, url_for, jsonify
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
            
            # Listas para almacenar los puntos marcados y los puntos deshechos
            puntos_marcados = []
            puntos_deshechos = []
            
            def realizar_analisis():
            # Procesar la imagen y hacer el análisis
                angulo_cervical = calcular_angulo(puntos_marcados[0], puntos_marcados[1], puntos_marcados[2])
                evaluacion_cervical = ""
                if 160 <= angulo_cervical <= 180:
                    evaluacion_cervical = "Postura cervical: Dentro de rango normal (160 a 180 grados)."
                elif angulo_cervical < 160:
                    evaluacion_cervical = "Postura cervical: Hiperlordosis cervical (Angulo menor a 160 grados)."
                else:
                    evaluacion_cervical = "Postura cervical: Hipocifosis cervical (Angulo mayor a 180 grados)."
            # Evaluacion dorsal solo si hay 4 puntos
                evaluacion_dorsal = ""
                if len(puntos_marcados) >= 3:
                    angulo_dorsal = calcular_angulo(puntos_marcados[1], puntos_marcados[2], puntos_marcados[3] if len(puntos_marcados) == 4 else puntos_marcados[2])
                if 170 <= angulo_dorsal <= 180:
                    evaluacion_dorsal = "Postura dorsal: Dentro de rango normal (170 a 180 grados)."
                elif angulo_dorsal < 170:
                    evaluacion_dorsal = "Postura dorsal: Hipercifosis dorsal (Angulo menor a 170 grados)."
                else:
                    evaluacion_dorsal = "Postura dorsal: Hipolordosis dorsal (Angulo mayor a 180 grados)."
                # Dibujar líneas y añadir texto
                for i in range(len(puntos_marcados) - 1):
                    cv2.line(img, tuple(puntos_marcados[i]), tuple(puntos_marcados[i + 1]), (0, 255, 0), 2)

            # Codificar la imagen procesada en base64 para enviarla de vuelta al frontend
                _, img_encoded = cv2.imencode('.png', img)
                img_base64 = base64.b64encode(img_encoded).decode('utf-8')
            
                return jsonify({'processed_image': img_base64, 'angulo_cervical': evaluacion_cervical, 'angulo_dorsal': evaluacion_dorsal})

        return render_template('analysis_lateral.html')
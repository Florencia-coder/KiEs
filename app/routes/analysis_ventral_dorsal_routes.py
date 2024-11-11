from flask import render_template, Response, session,redirect,url_for
import mediapipe as mp
import numpy as np
import cv2
import math

# Configuración de MediaPipe
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

def init_analysis_ventral_dorsal_routes(app):
    @app.route('/analysis_ventral_dorsal')
    def analysis_ventral_dorsal():
                # Recuperar datos del paciente desde la sesión (asegurarse que exista)
        paciente = session.get('paciente', None)
        if not paciente:
            return redirect(url_for('data_entry'))  # Redirige a la página de entrada de datos si no hay paciente
        
        return render_template('analysis_ventral_dorsal.html', paciente=paciente)
    
    @app.route('/video_feed')
    def video_feed():
        return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')


def calculate_angle(point1, point2, horizontal_line_y):
    vector1 = np.array([point1[0] - point2[0], point1[1] - point2[1]])
    vector2 = np.array([point2[0] - point1[0], horizontal_line_y - point1[1]])

    dot_product = np.dot(vector1, vector2)
    norm1 = np.linalg.norm(vector1)
    norm2 = np.linalg.norm(vector2)

    cos_theta = dot_product / (norm1 * norm2)
    angle_radians = np.arccos(np.clip(cos_theta, -1.0, 1.0))
    angle_degrees = np.degrees(angle_radians)

    return angle_degrees

def generate_frames():
    cap = cv2.VideoCapture(0)  # Captura desde la webcam
    while True:
        success, frame = cap.read()  # Lee un frame de la webcam
        if not success:
            break

        # Procesar la imagen y detectar poses
        results = pose.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        if results.pose_landmarks:
            frame = visualize_landmarks(frame, results.pose_landmarks)

        # Codificar el frame en JPEG
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')  # Retornar frame
        
def visualize_landmarks(image, landmarks):
    # Dibujar los landmarks en la imagen
    mp_drawing.draw_landmarks(image, landmarks, mp_pose.POSE_CONNECTIONS,
                              mp_drawing.DrawingSpec(color=(0, 255, 255), thickness=2, circle_radius=2),
                              mp_drawing.DrawingSpec(color=(255, 0, 255), thickness=2, circle_radius=2))

    # Obtener coordenadas de los hombros y las caderas
    left_shoulder = (int(landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER].x * image.shape[1]), 
                     int(landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER].y * image.shape[0]))
    right_shoulder = (int(landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER].x * image.shape[1]), 
                      int(landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER].y * image.shape[0]))
    left_hip = (int(landmarks.landmark[mp_pose.PoseLandmark.LEFT_HIP].x * image.shape[1]), 
                int(landmarks.landmark[mp_pose.PoseLandmark.LEFT_HIP].y * image.shape[0]))
    right_hip = (int(landmarks.landmark[mp_pose.PoseLandmark.RIGHT_HIP].x * image.shape[1]), 
                 int(landmarks.landmark[mp_pose.PoseLandmark.RIGHT_HIP].y * image.shape[0]))

    # Dibujar líneas entre hombros y caderas (patológicas)
    cv2.line(image, left_shoulder, right_shoulder, (0, 0, 255), 2)  # Línea roja
    cv2.line(image, left_hip, right_hip, (0, 0, 255), 2)  # Línea roja

    # Dibujar líneas horizontales fisiológicas
    cv2.line(image, (left_shoulder[0], left_shoulder[1]), (right_shoulder[0], left_shoulder[1]), (0, 255, 0), 2)  # Línea verde
    cv2.line(image, (left_hip[0], left_hip[1]), (right_hip[0], left_hip[1]), (0, 255, 0), 2)  # Línea verde

    # Calcular ángulos entre las líneas patológicas y fisiológicas
    shoulder_angle = calculate_angle(left_shoulder, right_shoulder, left_shoulder[1])
    hip_angle = calculate_angle(left_hip, right_hip, left_hip[1])

    # Calcular ángulos internos
    internal_shoulder_angle = 180 - shoulder_angle
    internal_hip_angle = 180 - hip_angle
     # Validar el ángulo antes de restar
    if internal_hip_angle is None or math.isnan(internal_hip_angle):
        internal_hip_angle = 0  # Establecer un valor predeterminado
        print("El ángulo es NaN, se establece a 0.")
    image = np.fliplr(image).copy()
    # Mostrar ángulos internos en la imagen
    cv2.putText(image, f'Angulo Interno Hombros: {int(internal_shoulder_angle)}', 
                (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2, cv2.LINE_AA)
    cv2.putText(image, f'Angulo Interno Caderas: {int(internal_hip_angle)}', 
                (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2, cv2.LINE_AA)

    # Detectar la orientación de la pose
    orientation = detect_orientation(landmarks)

    # Mostrar la orientación en la imagen
    cv2.putText(image, f'Orientacion: {orientation}', (10, 110), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2, cv2.LINE_AA)

    return image


def detect_orientation(landmarks):
    nose = landmarks.landmark[mp_pose.PoseLandmark.NOSE]
    left_shoulder = landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
    right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
    left_ear = landmarks.landmark[mp_pose.PoseLandmark.LEFT_EAR]
    right_ear = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_EAR]

    if nose.visibility < 0.5:
        return "Dorsal"
    elif abs(left_ear.x - right_ear.x) < 0.1:
        return "Lateral"
    elif nose.x < left_shoulder.x:
        return "Frontal"
    elif nose.x > right_shoulder.x:
        return "Lateral"
    else:
        return "Indeterminado"

from flask import render_template, request, redirect, url_for, session

def init_data_entry_routes(app):
    @app.route('/data_entry', methods=['GET', 'POST'])
    def data_entry():
        if request.method == 'POST':
            paciente = {
                "dni": request.form.get('dni'),
                "name": request.form.get('name'),
                "age": request.form.get('age'),
                "height": request.form.get('height'),
                "weight": request.form.get('weight'),
                "consultaDate": request.form.get('consultaDate'),
                "historial": request.form.get('historial')
            }
            # Guardar datos en la sesión
            session['paciente'] = paciente
            # Redirigir a la siguiente página después del POST
            return redirect(url_for('analysis_selection'))
        
        # Si es GET, intenta cargar `paciente` de la sesión o asigna un valor vacío
        paciente = session.get('paciente', {})
        
        return render_template('data_entry.html', today='2024-09-19', paciente=paciente)

    
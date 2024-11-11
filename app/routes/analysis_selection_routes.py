from flask import render_template, session, redirect, url_for

def init_analysis_selection_routes(app):
    @app.route('/analysis_selection', methods=['GET'])
    def analysis_selection():
        paciente = session.get('paciente', None)  # Recuperar los datos del paciente
        if paciente is None:
            return redirect(url_for('data_entry'))  # Si no hay datos del paciente, redirige al formulario
        # Pasar los datos del paciente al template
        return render_template('analysis_selection.html', paciente=paciente)

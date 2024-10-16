from flask import render_template, request, redirect, url_for

def init_data_entry_routes(app):
    @app.route('/data_entry', methods=['GET', 'POST'])
    def data_entry():
        if request.method == 'POST':
            # Procesar datos del formulario
            return redirect(url_for('analysis_selection'))
        #Si es GET muestra el data_entry.html
        return render_template('data_entry.html', today='2024-09-19')
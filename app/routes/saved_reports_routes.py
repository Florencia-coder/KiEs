from flask import render_template

def init_saved_reports_routes(app):
    @app.route('/saved_reports')
    def saved_reports():
        reports = []  # Reemplaza con la lógica para cargar informes
        return render_template('saved_reports.html', reports=reports)
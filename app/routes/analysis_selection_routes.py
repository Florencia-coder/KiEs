from flask import render_template

def init_analysis_selection_routes(app):
    @app.route('/analysis_selection', methods=['GET'])
    def analysis_selection():
        return render_template('analysis_selection.html')
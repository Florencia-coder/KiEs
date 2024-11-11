from flask_bootstrap import Bootstrap4
from flask import Flask
from config import Config  

def create_app():
    app = Flask(__name__)
    bootstrap = Bootstrap4(app)
    
    # Cargando configuración
    app.config.from_pyfile('../config.py')
    
    # Cargar la configuración desde la clase Config
    app.config.from_object(Config)


    # Registrando las rutas
    from .routes.index_routes import init_index_routes
    from .routes.analysis_selection_routes import init_analysis_selection_routes
    from .routes.data_entry_routes import init_data_entry_routes
    from .routes.analysis_adams_routes import init_analysis_adams_routes
    from .routes.analysis_ventral_dorsal_routes import init_analysis_ventral_dorsal_routes
    from .routes.analysis_lateral_routes import init_analysis_lateral_routes
    from .routes.saved_reports_routes import init_saved_reports_routes

    init_index_routes(app)
    init_analysis_selection_routes(app)
    init_data_entry_routes(app)
    init_analysis_adams_routes(app)
    init_analysis_ventral_dorsal_routes(app)
    init_analysis_lateral_routes(app)
    init_saved_reports_routes(app)

    return app

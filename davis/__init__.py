from flask import Flask
from flask_debugtoolbar import DebugToolbarExtension
from sassutils.wsgi import SassMiddleware
import jinja2
import os

app = Flask(__name__)

app.wsgi_app = SassMiddleware(app.wsgi_app, {
    'davis': ('static/sass', 'static/css', '/static/css')
})

from davis.views import views

app.register_blueprint(views)

# debug
app.debug = True
app.config['SECRET_KEY'] = '12345'
# app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False
# toolbar = DebugToolbarExtension(app)

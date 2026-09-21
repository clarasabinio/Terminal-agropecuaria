"""
WSGI config for agro_terminal project.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agro_terminal.settings')

application = get_wsgi_application()

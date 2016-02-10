#!/usr/bin/env python
import os
import sys

# django-admin.py makemessages -l ru-ru
# django-admin.py compilemessages -l ru-ru

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "rosach.settings")

    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)

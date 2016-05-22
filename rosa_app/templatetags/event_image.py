from django import template
from django.template.defaultfilters import stringfilter
from easy_thumbnails.files import get_thumbnailer

from rosa_app import models

register = template.Library()

@register.filter
def event_image(event_id):
    ei = models.EventImage.objects.filter(event_id=event_id).first()
    if ei:
        thumbnail_options = {'crop': True, 'size': (560, 309)}
        thumbnailer = get_thumbnailer(ei.image)
        return thumbnailer.get_thumbnail(thumbnail_options).url
    else:
        return '/static/images/event-default.jpg'

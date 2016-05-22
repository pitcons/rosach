from django.db import models
from happenings.models import Event
from ajaximage.fields import AjaxImageField


class EventImage(models.Model):
    event = models.OneToOneField(Event, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='event_images')

# -*- coding: utf-8 -*-
from datetime import datetime
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render_to_response
from django.contrib.auth.decorators import login_required
from django.template.context import RequestContext
from happenings.models import Event
import models


@login_required()
def upload_event_image(request):
    image = request.FILES['image']
    ei, _ = models.EventImage.objects.get_or_create(event_id=request.POST['event_id'])
    ei.image.save(image.name, image)
    ei.save()

    return JsonResponse({})


def show_event(request, when, event_id):
    event = Event.objects.get(id=event_id)
    return render_to_response(
        'show_event.html',
        {'event': event,
         'date': datetime.strptime(when, settings.RU_DATETIME_FORMAT),
         'current_page': ''},
        context_instance=RequestContext(request)
    )

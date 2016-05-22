# -*- coding: utf-8 -*-
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
import models


@login_required()
def upload_event_image(request):
    image = request.FILES['image']
    ei, _ = models.EventImage.objects.get_or_create(event_id=request.POST['event_id'])
    ei.image.save(image.name, image)
    ei.save()

    return JsonResponse({})

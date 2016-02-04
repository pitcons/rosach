# -*- coding: utf-8 -*-
from django.utils import timezone
from django.conf.urls import url, include
from django.contrib.auth.models import User
import happenings.models as hm
from rest_framework import routers, serializers, viewsets

router = routers.DefaultRouter()

class DateTimeTzAwareField(serializers.DateTimeField):

    def to_representation(self, value):
        value = timezone.localtime(value)
        return super(DateTimeTzAwareField, self).to_representation(value)


# Serializers define the API representation.
class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('url', 'username', 'email', 'is_staff')


# ViewSets define the view behavior.
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

router.register(r'users', UserViewSet)


# Serializers define the API representation.
class EventSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = hm.Event
        fields = ('start_date', 'end_date', 'all_day',
                  'repeat','end_repeat', 'title', 'description')

    start_date = DateTimeTzAwareField()
    end_date = DateTimeTzAwareField()


# ViewSets define the view behavior.
class EventViewSet(viewsets.ModelViewSet):
    queryset = hm.Event.objects.all()
    serializer_class = EventSerializer

# Routers provide an easy way of automatically determining the URL conf.
router.register(r'events', EventViewSet)

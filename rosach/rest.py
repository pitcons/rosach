# -*- coding: utf-8 -*-
from django.contrib.auth.models import User
from django.utils import timezone
from django.conf.urls import url, include
from django.conf import settings
from django.contrib.auth.models import User
import happenings.models as hm
from rest_framework.authentication import SessionAuthentication
from rest_framework import routers, serializers, viewsets

router = routers.DefaultRouter()

class CsrfExemptSessionAuthentication(SessionAuthentication):

    def enforce_csrf(self, request):
        return  # To not perform the csrf check previously happening

authentication_classes = (CsrfExemptSessionAuthentication, )


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
# class EventSerializer(serializers.HyperlinkedModelSerializer):
class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = hm.Event
        fields = ('id', 'start_date', 'end_date', 'all_day',
                  'created_by', 'categories',
                  'repeat','end_repeat', 'title', 'description')

    created_by = serializers.PrimaryKeyRelatedField(
        queryset = User.objects.all(),
        many=False,
        read_only=False
    )

    #tags = serializers.StringRelatedField(
    categories = serializers.PrimaryKeyRelatedField(
        queryset = hm.Category.objects.all(),
        many=True,
        read_only=False
    )

    start_date = DateTimeTzAwareField(
        input_formats=([settings.RU_DATETIME_FORMAT]))
    end_date = DateTimeTzAwareField(
        input_formats=([settings.RU_DATETIME_FORMAT]))
    end_repeat = serializers.DateField(
        required=False,
        input_formats=([settings.RU_DATE_FORMAT, '']))


# ViewSets define the view behavior.
class EventViewSet(viewsets.ModelViewSet):
    queryset = hm.Event.objects.all()
    serializer_class = EventSerializer

    # def update(self, request, pk=None):
    #     print "OLOLOLOLO", request

# Routers provide an easy way of automatically determining the URL conf.
router.register(r'events', EventViewSet)

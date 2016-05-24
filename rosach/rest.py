# -*- coding: utf-8 -*-
import hashlib
from django.contrib.auth.models import User
from django.utils import timezone
from django.conf.urls import url, include
from django.conf import settings
from django.contrib.auth.models import User
from django.template.defaultfilters import slugify
from django.db import IntegrityError
from unidecode import unidecode
import happenings.models as hm
import newsletter.models as nm
import rosa_app.models as rm
from django.utils.translation import ugettext as _
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import SessionAuthentication
from rest_framework import routers, serializers, viewsets
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import FileUploadParser
from rest_framework.generics import RetrieveUpdateAPIView


router = routers.DefaultRouter()

class CsrfExemptSessionAuthentication(SessionAuthentication):

    def enforce_csrf(self, request):
        return  # To not perform the csrf check previously happening

authentication_classes = (CsrfExemptSessionAuthentication, )


class DateTimeTzAwareField(serializers.DateTimeField):

    def to_representation(self, value):
        value = timezone.localtime(value)
        return super(DateTimeTzAwareField, self).to_representation(value)


class CancellationSerializer(serializers.ModelSerializer):

    class Meta:
        model = hm.Cancellation
        fields = ('id', 'event', 'date')

    event = serializers.PrimaryKeyRelatedField(
        queryset = hm.Event.objects.all(),
        many=False,
        read_only=False
    )

    date = serializers.DateField(
        required=False,
        input_formats=([settings.RU_DATE_FORMAT, '']))


class CancellationViewSet(viewsets.ModelViewSet):
    queryset = hm.Cancellation.objects.all()
    serializer_class = CancellationSerializer


# Routers provide an easy way of automatically determining the URL conf.
router.register(r'cancellations', CancellationViewSet)


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
    # queryset = hm.Event.objects.all()
    serializer_class = EventSerializer

    def get_queryset(self):
        queryset = hm.Event.objects.all()
        if not self.request.user.is_authenticated():
            internal = hm.Category.objects.get(title='Internal')
            queryset = queryset.exclude(categories=internal)
        return queryset


# Routers provide an easy way of automatically determining the URL conf.
router.register(r'events', EventViewSet, base_name='events')

class SubscriptionSerializer(serializers.ModelSerializer):

    class Meta:
        model = nm.Subscription
        fields = ('email_field', 'newsletter', 'subscribed')

    email_field = serializers.EmailField(required=True)
    newsletter = serializers.PrimaryKeyRelatedField(
        queryset = nm.Newsletter.objects.all(),
        many=False,
        read_only=False
    )


class Subscription(APIView):
    permission_classes = [AllowAny, ]

    def put(self, request, pk=None, format=None):
        data = request.data.copy()
        data['newsletter'] = nm.Newsletter.objects.all()[0].id
        data['subscribed'] = True

        serializer = SubscriptionSerializer(data=data)
        if nm.Subscription.objects.filter(newsletter_id=data['newsletter'],
                                          email_field=data['email_field'])\
                                  .exists():
            return Response({'email_field': [_('Already subscribed')]},
                            status=status.HTTP_400_BAD_REQUEST)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SendMessage(APIView):
    permission_classes = [IsAuthenticated, ]

    def post(self, request, pk=None, format=None):
        data = request.data.copy()

        try:
            slug = hashlib.md5(data['subject'].encode('utf-8')).hexdigest()
            message = nm.Message(title=data['subject'],
                                 slug=slug)
            # message = nm.Message(title=data['subject'],
            #                      slug=slugify(unidecode(data['subject'])))
            message.save()
        except IntegrityError:
            return Response({'message': [_('That subject is alredy sended')]},
                            status=status.HTTP_400_BAD_REQUEST)

        article = nm.Article(sortorder=0,
                             title=data['subject'],
                             text=data['email-message'],
                             post=message)
        article.save()
        submission = nm.Submission.from_message(message)
        submission.prepared = True
        submission.save()

        return Response({}, status=status.HTTP_201_CREATED)


class EventImageUploadView(APIView):
    permission_classes = [AllowAny, ]
    parser_classes = (FileUploadParser, )
    # permission_classes = [IsAuthenticated, ]

    def post(self, request, format='jpg'):
        return Response({}, status=status.HTTP_201_CREATED)


class EventImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = rm.EventImage
        fields = ('image', 'event')


class EventImageView(RetrieveUpdateAPIView):
    model = rm.EventImage
    serializer_class = EventImageSerializer
    permission_classes = (IsAuthenticated, )

# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals

from cms.sitemaps import CMSSitemap
from django.conf import settings
from django.conf.urls import *  # NOQA
from django.conf.urls.i18n import i18n_patterns
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

admin.autodiscover()

from .rest import *
from rosa_app import views

urlpatterns = i18n_patterns('',
    url(r'^admin/', include(admin.site.urls)),
    url(r'^taggit_autosuggest/', include('taggit_autosuggest.urls')),
    url(r'^newsletter/', include('newsletter.urls')),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^sitemap\.xml$', 'django.contrib.sitemaps.views.sitemap',
        {'sitemaps': {'cmspages': CMSSitemap}}),
    url(r'^select2/', include('django_select2.urls')),
    url(r'^ecalendar/', include('happenings.urls', namespace='calendar')),
    url(r'^api/send_message/$', SendMessage.as_view()),
    url(r'^api/subscriptions/$', Subscription.as_view()),
    url(r'^api/', include(router.urls)),
#    url(r'^event-image$', EventImageUploadView.as_view()),
#    url(r'^event-image$', EventImageView.as_view()),
    url(r'^event-image$', views.upload_event_image),

    url(r'^', include('cms.urls')),
)

# This is only needed when using runserver.
if settings.DEBUG:
    urlpatterns = patterns('',
        url(r'^media/(?P<path>.*)$', 'django.views.static.serve',  # NOQA
            {'document_root': settings.MEDIA_ROOT, 'show_indexes': True}),
        ) + staticfiles_urlpatterns() + urlpatterns  # NOQA

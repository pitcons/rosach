from cms.plugin_base import CMSPluginBase
from cms.plugin_pool import plugin_pool
from cms.models.pluginmodel import CMSPlugin
from django.utils.translation import ugettext_lazy as _

class CalendarPlugin(CMSPluginBase):
    model = CMSPlugin
    render_template = "calendar/main.html"
    cache = False

plugin_pool.register_plugin(CalendarPlugin)

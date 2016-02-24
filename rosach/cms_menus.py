from menus.base import Modifier
from menus.base import Menu, NavigationNode
from django.utils.translation import ugettext_lazy as _
from cms.menu_bases import CMSAttachMenu
from menus.menu_pool import menu_pool


class TestMenu(Menu):

    name = _("test menu")

    def get_nodes(self, request):
        nodes = []
        n = NavigationNode(_('Blog'), "/blog", 1)
        nodes.append(n)
        return nodes

menu_pool.register_menu(TestMenu)


class MyMode(Modifier):
    """

    """
    def modify(self, request, nodes, namespace, root_id, post_cut, breadcrumb):

        # print '-------'
        # print nodes
        # for node in nodes:
        #     print node, node.url

        # blog = NavigationNode(_('Blog'), "/blog", 1)
        # blog.selected = False
        # nodes.insert(1, blog)

        return nodes

menu_pool.register_modifier(MyMode)

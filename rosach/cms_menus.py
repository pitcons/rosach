from menus.base import Modifier
from menus.menu_pool import menu_pool

class MyMode(Modifier):
    """

    """
    def modify(self, request, nodes, namespace, root_id, post_cut, breadcrumb):
        return nodes

menu_pool.register_modifier(MyMode)

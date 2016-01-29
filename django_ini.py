# -*- encoding: utf-8 -*-
import inspect


def autodiscover():

    stack = inspect.stack()
    print 'STACK'
    print stack[1][0].f_locals['DATABASES']

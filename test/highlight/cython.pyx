cdef foo(int bar):
# <- keyword
#    ^ function
#        ^ type
#            ^ variable
    return bar
    # <- keyword
    #      ^ variable

cdef void foo(int bar):
# <- keyword
#    ^ type
#         ^ function
#             ^ type
#                 ^ variable
    return bar


cdef foo(bar, int baz) nogil:
#        ^ variable
#             ^ type
#                 ^ variable
#                      ^ keyword
    cdef int qux
    # <- keyword
    #    ^ type
    #        ^ variable
    return bar

cpdef enum Color:
# ^ keyword
#     ^ keyword
#          ^ constructor
    RED = 0
    # <- constant
    GREEN = 1
    # <- constant
    BLUE = 2
    # <- constant

cdef int[:] get_memory_view(int size)
# <- keyword
#    ^ type
#           ^ function
#                           ^ type
#                               ^ variable


ctypedef fused numeric:
# <- keyword
#        ^ keyword
#              ^ variable
    int
    # <- type
    float
    # <- type
    double
    # <- type

cdef numeric add(numeric a, numeric b)
# <- keyword
#    ^ type
#            ^ function
#                ^ type
#                        ^ variable
#                           ^ type
#                                   ^ variable

cdef extern from "math.h":
# <- keyword
#    ^ keyword
#           ^ keyword
#                ^ string
    double ok(bool x)
    # <- type
    #      ^ function
    #         ^ type
    #              ^ variable
    double cos(double x)
    # <- type
    #      ^ function
    #          ^ type
    #                 ^ variable
    double M_PI
    # <- type
    #      ^ constant

cdef extern from "stdlib.h" namespace "std" nogil:
# <- keyword
#    ^ keyword
#           ^ keyword
#                ^ string
#                           ^ keyword
#                                     ^ string
#                                           ^ keyword
    void* malloc(size_t size)
    # <- type
    #     ^ function
    #            ^ type
    #                   ^ variable
    void free(void* ptr)
    # <- type
    #    ^ function
    #         ^ type
    #               ^ variable

cdef class MyClass:
# <- keyword
#    ^ keyword
#          ^ constructor
    cdef int x
    # <- keyword
    #    ^ type
    #        ^ variable
    cdef double y
    # <- keyword
    #    ^ type
    #           ^ variable

    cdef int __cinit__(self, int x, double y):
    # <- keyword
    #    ^ type
    #        ^ function
    #                  ^ variable
    #                        ^ type
    #                            ^ variable
    #                               ^ type
    #                                      ^ variable
        self.x = x
        # <- variable
        #    ^ property
        #      ^ operator
        #        ^ property
        self.y = y
        # <- variable
        #    ^ property
        #      ^ operator
        #        ^ property

    cdef int get_x(self):
    # <- keyword
    #    ^ type
    #        ^ function
    #              ^ variable
        return self.x
        # <- keyword
        #      ^ variable
        #           ^ property

    def add(self, PyObject* other):
    # <- keyword
    #   ^ function
    #       ^ variable
    #             ^ type
    #                     ^ operator
    #                       ^ variable
        cdef MyClass* other_ptr = <MyClass*>other
        # <- keyword
        #    ^ constructor
        #           ^ operator
        #             ^ variable
        #                       ^ operator
        #                         ^ operator
        #                          ^ constructor
        #                                 ^ operator
        #                                  ^ operator
        #                                   ^ variable
        return self.x + other_ptr.x
        # <- keyword
        #      ^ variable
        #           ^ property
        #             ^ operator
        #               ^ variable
        #                         ^ property



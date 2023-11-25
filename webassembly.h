#include <stdarg.h>

extern int printf_js(const char *format, void *args);
int printf(const char *format, ...)
{
    va_list args_va;
    va_start(args_va, format);
    void *args_arr[2];

    for (unsigned int i = 0; i < 2; i++)
    {
        args_arr[i] = va_arg(args_va, void *);
    }

    va_end(args_va);

    printf_js(format, args_arr);
    return 0;
}

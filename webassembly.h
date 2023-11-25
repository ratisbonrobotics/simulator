#include <stdarg.h>

extern int printf_js(const char *format, void *args);
int count_format_specifiers(const char *format)
{
    int count = 0;
    while (*format != '\0')
    {
        if (*format == '%')
        {
            if (*(format + 1) != '\0')
            {
                if (*(format + 1) == 'd' || *(format + 1) == 's')
                {
                    count++;
                    format++;
                }
            }
        }
        format++;
    }
    return count;
}
int printf(const char *format, ...)
{
    unsigned int count = count_format_specifiers(format);
    va_list args_va;
    va_start(args_va, format);
    void *args_arr[count];

    for (unsigned int i = 0; i < count; i++)
    {
        args_arr[i] = va_arg(args_va, void *);
    }

    va_end(args_va);

    printf_js(format, args_arr);
    return 0;
}

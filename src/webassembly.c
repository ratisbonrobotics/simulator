#include "webassembly.h"
#include <stdarg.h>

int printf(const char *format, ...)
{
    unsigned int count = 0;
    char *format_ptr = (char *)format;
    while (*format_ptr != '\0')
    {
        if (*format_ptr == '%')
        {
            if (*(format_ptr + 1) != '\0')
            {
                if (*(format_ptr + 1) == 'd' || *(format_ptr + 1) == 's' || *(format_ptr + 1) == 'f')
                {
                    count++;
                    format_ptr++;
                }
            }
        }
        format_ptr++;
    }

    va_list args_va;
    va_start(args_va, format);
    void *args_arr[count];

    for (unsigned int i = 0; i < count; i++)
    {
        args_arr[i] = va_arg(args_va, void *); // float has to be correctly interpreted here I believe
    }

    va_end(args_va);

    print(format, args_arr);
    return 0;
}

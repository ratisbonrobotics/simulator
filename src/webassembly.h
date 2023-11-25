#include <stdarg.h>

// Printing
extern int print(const char *format, void *args);
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
                if (*(format_ptr + 1) == 'd' || *(format_ptr + 1) == 's')
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
        args_arr[i] = va_arg(args_va, void *);
    }

    va_end(args_va);

    print(format, args_arr);
    return 0;
}

// WebGL
extern unsigned int gl_getContext(const char *canvas);
extern unsigned int gl_createProgram(unsigned int gl);
extern unsigned int gl_attachShader(unsigned int gl, unsigned int program, const char *shader);
extern unsigned int gl_linkProgram(unsigned int gl, unsigned int program);

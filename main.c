#include <stdarg.h>
#include <stdint.h>

extern int printf_js(const char *format, void *args);
int printf(const char *format, ...)
{
    va_list args_va;
    va_start(args_va, format);
    void *args_arr[3];

    for (unsigned int i = 0; i < 3; i++)
    {
        args_arr[i] = va_arg(args_va, void *);
    }

    va_end(args_va);

    printf_js(format, args_arr);
    return 0;
}

int main()
{
    const char *asd = "asd";
    int drei = 3;

    printf(asd);
    printf("The answer is %f and %i and %d \n", 1222.3, drei, 20 + 4);
    return 0;
}

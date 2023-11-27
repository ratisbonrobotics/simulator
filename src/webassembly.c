#include "webassembly.h"
#include <stdarg.h>
#include <stdbool.h>

#define PI 3.14159265358979323846

extern int print(const char *format, void *args);
extern double pow(double x, double y);

void reverseString(char *str, int length)
{
    int start = 0;
    int end = length - 1;
    while (start < end)
    {
        char temp = str[start];
        str[start] = str[end];
        str[end] = temp;
        start++;
        end--;
    }
}

int intToStr(int x, char str[], int d)
{
    int i = 0;
    while (x)
    {
        str[i++] = (x % 10) + '0';
        x = x / 10;
    }

    // If number of digits required is more, then
    // add 0s at the beginning
    while (i < d)
        str[i++] = '0';

    reverseString(str, i);
    str[i] = '\0';
    return i;
}

void ftoa(float n, char *res, int afterpoint)
{
    // Check if the number is negative
    bool isNegative = false;
    if (n < 0)
    {
        isNegative = true;
        n = -n;
    }

    // Extract integer part
    int ipart = (int)n;

    // Extract floating part
    float fpart = n - (float)ipart;

    // convert integer part to string
    int i = intToStr(ipart, res, 0);

    // If the number is negative, shift the string one position to the right
    // and place '-' at the beginning
    if (isNegative)
    {
        for (int j = i; j >= 0; j--)
        {
            res[j + 1] = res[j];
        }
        res[0] = '-';
        i++;
    }

    // check for display option after point
    if (afterpoint != 0)
    {
        res[i] = '.'; // add dot

        // Get the value of fraction part up to given no.
        // of points after dot. The third parameter is needed
        // to handle cases like 233.007
        fpart = fpart * pow(10, afterpoint);

        intToStr((int)fpart, res + i + 1, afterpoint);
    }
}

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

    unsigned int i = 0;
    format_ptr = (char *)format;
    while (*format_ptr != '\0')
    {
        if (*format_ptr == '%')
        {
            if (*(format_ptr + 1) != '\0')
            {
                if (*(format_ptr + 1) == 'd' || *(format_ptr + 1) == 's')
                {
                    args_arr[i] = va_arg(args_va, void *);
                }
                else if (*(format_ptr + 1) == 'f')
                {
                    char res[512];
                    ftoa(va_arg(args_va, double), res, 3);
                    args_arr[i] = res;
                }
                format_ptr++;
            }
        }
        format_ptr++;
    }

    va_end(args_va);
    print(format, args_arr);
    return 0;
}

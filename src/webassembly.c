#include "webassembly.h"
#include <stdarg.h>
#include <stdbool.h>

#define PI 3.14159265358979323846

extern int print(const char *format, void *args);

double pow(double x, double y)
{
    double result = 1;
    for (int i = 0; i < y; i++)
    {
        result *= x;
    }
    return result;
}

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

double fmod(double x, double y)
{
    if (y == 0.0f)
    {
        return 0.0f; // Ideally, handle this as an error or special case
    }

    float quotient = x / y;
    int wholePart = (int)quotient; // Extracting the whole part of the quotient

    // Calculate the remainder
    float remainder = x - wholePart * y;
    return remainder;
}

// Factorial function
long double factorial(int n)
{
    long double result = 1;
    for (int i = 2; i <= n; i++)
    {
        result *= i;
    }
    return result;
}

// Function to compute sine using Taylor series
float sinf(float x)
{
    // Reduce x to [-PI, PI]
    x = fmod(x, 2 * PI);

    // Further reduce x to [-PI/2, PI/2]
    if (x < -PI)
    {
        x += 2 * PI;
    }
    else if (x > PI)
    {
        x -= 2 * PI;
    }

    // Use the Taylor series
    long double sum = 0;
    for (int i = 0; i < 10; i++)
    {
        long double term = pow(x, 2 * i + 1) / factorial(2 * i + 1);
        if (i % 2 == 1)
        {
            sum -= term;
        }
        else
        {
            sum += term;
        }
    }

    return (float)sum;
}

// Cosine function using Taylor series
float cosf(float x)
{
    // Reduce x to [-PI, PI]
    x = fmod(x, 2 * PI);

    // Further reduce x to [-PI/2, PI/2]
    if (x < -PI)
    {
        x += 2 * PI;
    }
    else if (x > PI)
    {
        x -= 2 * PI;
    }

    long double sum = 0;
    for (int i = 0; i < 10; i++)
    {
        long double term = pow(x, 2 * i) / factorial(2 * i);
        if (i % 2 == 1)
        {
            sum -= term;
        }
        else
        {
            sum += term;
        }
    }

    return (float)sum;
}

// Tangent function as sine over cosine
float tanf(float x)
{
    float sin_x = sinf(x);
    float cos_x = cosf(x);

    if (cos_x == 0)
    {
        return 0; // Ideally, handle this as an error or special case (tangent undefined)
    }

    return sin_x / cos_x;
}

double fabs(double x)
{
    if (x < 0)
    {
        return -x;
    }
    return x;
}

float sqrtf(float x)
{
    if (x < 0)
    {
        return -1; // Return an error for negative inputs
    }
    if (x == 0 || x == 1)
    {
        return x; // Handle these cases directly
    }

    float guess = x / 2;     // Initial guess
    float epsilon = 0.00001; // Tolerance for accuracy

    while (1)
    {
        float nextGuess = 0.5 * (guess + x / guess);

        // Check if the approximation is within the desired tolerance
        if (fabs(nextGuess - guess) < epsilon)
        {
            break;
        }

        guess = nextGuess;
    }

    return guess;
}

long double __floatsitf(int x)
{
    return (long double)x;
}

long double __multf3(long double x, long double y)
{
    return x * y;
}

long double __extenddftf2(double x)
{
    return (long double)x;
}

long double __divtf3(long double x, long double y)
{
    if (y == 0)
    {
        return 0;
    }
    return x / y;
}

long double __subtf3(long double x, long double y)
{
    return x - y;
}

long double __addtf3(long double x, long double y)
{
    return x + y;
}

long double __trunctfdf2(long double x)
{
    return (long double)(int)x;
}

float __trunctfsf2(long double x)
{
    return (float)x;
}

bool __eqtf2(long double x, long double y)
{
    return x == y;
}

int __fixtfsi(long double x)
{
    return (int)x;
}
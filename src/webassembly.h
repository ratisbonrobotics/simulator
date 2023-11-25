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
typedef enum
{
    VERTEX_SHADER = 0x8B31,
    FRAGMENT_SHADER = 0x8B30,
    COMPILE_STATUS = 0x8B81,
    ARRAY_BUFFER = 0x8892,
    STATIC_DRAW = 0x88E4,
    FLOAT = 0x1406,
    LINK_STATUS = 0x8B82,
} GLenum;

extern unsigned int gl_getContext(const char *canvas);
extern unsigned int gl_createProgram(unsigned int gl);
extern unsigned int gl_attachShader(unsigned int gl, unsigned int program, const char *shader);
extern unsigned int gl_linkProgram(unsigned int gl, unsigned int program);
extern unsigned int gl_createShader(unsigned int gl, GLenum type);
extern void gl_shaderSource(unsigned int gl, unsigned int shader, const char *source);
extern void gl_compileShader(unsigned int gl, unsigned int shader);
extern int gl_getShaderParameter(unsigned int gl, unsigned int shader, GLenum pname);
extern void gl_getShaderInfoLog(unsigned int gl, unsigned int shader, char *infoLog);
extern unsigned int gl_createBuffer(unsigned int gl);
extern void gl_bindBuffer(unsigned int gl, GLenum target, unsigned int buffer);
extern void gl_bufferData(unsigned int gl, GLenum target, unsigned int size, const void *data, GLenum usage);

// Uniforms and Attributes
typedef struct
{
    unsigned int location;
} GLUniformLocation;

extern GLUniformLocation gl_getUniformLocation(unsigned int gl, unsigned int program, const char *name);
extern void gl_uniformMatrix4fv(unsigned int gl, GLUniformLocation location, int count, int transpose, const float *value);
extern int gl_getAttribLocation(unsigned int gl, unsigned int program, const char *name);
extern void gl_vertexAttribPointer(unsigned int gl, int index, int size, GLenum type, int normalized, int stride, const void *pointer);
extern void gl_enableVertexAttribArray(unsigned int gl, int index);

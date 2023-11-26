#include "webgl.h"
#include "webassembly.h"

static unsigned int compileShader(unsigned int gl, GLenum type, const char *source)
{
    unsigned int shader = gl_createShader(gl, type);
    gl_shaderSource(gl, shader, source);
    gl_compileShader(gl, shader);

    if (gl_getShaderParameter(gl, shader, COMPILE_STATUS))
    {
        return shader;
    }
    else
    {
        char infoLog[1024];
        gl_getShaderInfoLog(gl, shader, infoLog, 1024);
        printf("Error compiling shader: %s\n", infoLog);
        return 0;
    }
}

static unsigned int createProgram(unsigned int gl, unsigned int vertexShader, unsigned int fragmentShader)
{
    unsigned int program = gl_createProgram(gl);
    gl_attachShader(gl, program, vertexShader);
    gl_attachShader(gl, program, fragmentShader);
    gl_linkProgram(gl, program);

    if (gl_getProgramParameter(gl, program, LINK_STATUS))
    {
        return program;
    }
    else
    {
        char infoLog[1024];
        gl_getProgramInfoLog(gl, program, infoLog, 1024);
        printf("Error linking program: %s\n", infoLog);
        return 0;
    }
}

unsigned int createShaderProgram(unsigned int gl, const char *vertexShaderSource, const char *fragmentShaderSource)
{
    unsigned int vertexShader = compileShader(gl, VERTEX_SHADER, vertexShaderSource);
    unsigned int fragmentShader = compileShader(gl, FRAGMENT_SHADER, fragmentShaderSource);
    return createProgram(gl, vertexShader, fragmentShader);
}

unsigned int init3D(unsigned int gl, unsigned int height, unsigned int width, char *vertexShaderSource, const char *fragmentShaderSource)
{
    gl_viewport(gl, 0, 0, height, width);
    gl_clearColor(gl, 0.0f, 0.0f, 0.0f, 1.0f);
    gl_clear(gl, COLOR_BUFFER_BIT | DEPTH_BUFFER_BIT);
    gl_enable(gl, CULL_FACE);
    gl_enable(gl, DEPTH_TEST);
    return createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
}

void getAttribLocations(unsigned int gl, unsigned int program, unsigned int *locations, const char **name, unsigned int length)
{
    for (int i = 0; i < length; i++)
    {
        locations[i] = gl_getAttribLocation(gl, program, name[i]);
    }
}

void getUniformLocations(unsigned int gl, unsigned int program, unsigned int *locations, const char **name, unsigned int length)
{
    for (int i = 0; i < length; i++)
    {
        locations[i] = gl_getUniformLocation(gl, program, name[i]);
    }
}

unsigned int createBuffer(unsigned int gl, GLenum target, unsigned int size, const void *data, GLenum usage)
{
    unsigned int buffer = gl_createBuffer(gl);
    gl_bindBuffer(gl, target, buffer);
    gl_bufferData(gl, target, size, data, usage);
    return buffer;
}
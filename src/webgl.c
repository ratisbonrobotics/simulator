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
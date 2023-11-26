#include "webgl.h"
#include "webassembly.h"

unsigned int compileShader(unsigned int gl, GLenum type, const char *source)
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

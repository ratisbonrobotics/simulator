#include "webassembly.h"

unsigned int createProgram(unsigned int gl, unsigned int vertexShader, unsigned int fragmentShader)
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
        char infoLog[1024]; // Adjust size as needed
        gl_getProgramInfoLog(gl, program, infoLog);
        printf("Error linking program: %s\n", infoLog);
        // Add code to delete the program if necessary
        // Depending on your implementation you might need a gl_deleteProgram function
        return 0; // Return 0 or an appropriate error code
    }
}

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
        char infoLog[1024]; // Adjust size as needed
        gl_getShaderInfoLog(gl, shader, infoLog);
        printf("Error compiling shader: %s\n", infoLog);
        // Add code to delete the shader if necessary
        return 0; // Return 0 or an appropriate error code
    }
}

unsigned int createShaderProgram(unsigned int gl, const char *vertexShaderSource, const char *fragmentShaderSource)
{
    unsigned int vertexShader = compileShader(gl, VERTEX_SHADER, vertexShaderSource);
    unsigned int fragmentShader = compileShader(gl, FRAGMENT_SHADER, fragmentShaderSource);
    return createProgram(gl, vertexShader, fragmentShader);
}

// Assuming a predefined max number of attributes
#define MAX_ATTRIBS 10

typedef struct
{
    int locations[MAX_ATTRIBS];
} AttribLocations;

AttribLocations getAttribLocations(unsigned int gl, unsigned int program, const char **names, int count)
{
    AttribLocations attribs;
    for (int i = 0; i < count && i < MAX_ATTRIBS; i++)
    {
        attribs.locations[i] = gl_getAttribLocation(gl, program, names[i]);
    }
    return attribs;
}

void init3D(unsigned int gl, int width, int height)
{
    gl_viewport(gl, 0, 0, width, height);
    gl_clearColor(gl, 0.0, 0.0, 0.0, 1.0);
    gl_clear(gl, COLOR_BUFFER_BIT | DEPTH_BUFFER_BIT);
    gl_enable(gl, CULL_FACE);
    gl_enable(gl, DEPTH_TEST);
}

unsigned int createBuffer(unsigned int gl, GLenum type, const float *data, unsigned int size)
{
    unsigned int buffer = gl_createBuffer(gl);
    gl_bindBuffer(gl, type, buffer);
    gl_bufferData(gl, type, size, data, STATIC_DRAW);
    return buffer;
}

void connectBufferToAttribute(unsigned int gl, GLenum type, unsigned int buffer, int attribLocation, int valuesPerVertex, int enable)
{
    if (enable)
        gl_enableVertexAttribArray(gl, attribLocation);
    gl_bindBuffer(gl, type, buffer);
    gl_vertexAttribPointer(gl, attribLocation, valuesPerVertex, FLOAT, 0, 0, 0);
}

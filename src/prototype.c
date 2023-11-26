#include "webassembly.h"
#include "webgl.h"

int main_simulator(void)
{
    unsigned int gl = gl_getContext("canvas");

    const char *vertexShaderSource = "attribute vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); }";
    const char *fragmentShaderSource = "void main() { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); }";
    unsigned int program = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);

    return 0;
}

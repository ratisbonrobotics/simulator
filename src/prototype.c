#include "webassembly.h"
#include "webgl.h"

int main_simulator(void)
{
    unsigned int gl = gl_getContext("canvas");
    unsigned int vertexShader = compileShader(gl, VERTEX_SHADER, "attribute vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); }");
    unsigned int fragmentShader = compileShader(gl, FRAGMENT_SHADER, "void main() { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); }");

    return 0;
}

#include "webassembly.h"
#include "webgl.h"

int main_simulator(void)
{
    unsigned int gl = gl_getContext("canvas");
    unsigned int gl1 = gl_getContext("canvas");
    printf("gl: %d, gl1: %d\n", gl, gl1);
    unsigned int program = gl_createProgram(gl);
    unsigned int program1 = gl_createProgram(gl1);
    printf("program: %d, program1: %d\n", program, program1);

    return 0;
}

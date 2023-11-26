#include "webassembly.h"
#include "webgl.h"

int main_simulator(void)
{
    unsigned int gl = gl_getContext("canvas");
    unsigned int gl1 = gl_getContext("canvas");
    printf("gl: %d, gl1: %d\n", gl, gl1);

    return 0;
}

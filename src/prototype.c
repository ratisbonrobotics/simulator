#include "webassembly.h"
#include "webgl.h"
#include "matrix.h"

int main_simulator(void)
{
    float m[16];
    createIdentityMatrix(m);
    printMatrix(m);
    printf("Hello, world!\n");

    return 0;
}

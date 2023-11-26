#include "webassembly.h"
#include "webgl.h"
#include "matrix.h"

int main_simulator(void)
{
    float m[16];
    createIdentityMatrix(m);
    printf("%f\n", m[0]);
    printf("%d\n", 1);

    return 0;
}

#include "webassembly.h"
#include "webgl.h"
#include "matrix.h"

int main_simulator(void)
{
    float m[16];
    createIdentityMatrix(m);
    printMatrix(m);
    createTranslationMatrix(m, 1, 2, 3);
    printMatrix(m);
    createXRotationMatrix(m, 1.5708);
    printMatrix(m);
    createYRotationMatrix(m, 1.5708);
    printMatrix(m);
    createZRotationMatrix(m, 1.5708);
    printMatrix(m);
    createScaleMatrix(m, 1, 2, 3);
    printMatrix(m);
    createPerspectiveMatrix(m, 1.5708, 1, 0.1, 100);
    printMatrix(m);
    createOrthographicMatrix(m, -1, 1, -1, 1, 0.1, 100);
    printMatrix(m);
    createLookAtMatrix(m, (float[]){0, 0, 0}, (float[]){0, 0, 0}, (float[]){0, 0, 0});
    printMatrix(m);
    mult(m, (float[]){1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16},
         (float[]){1, 2, 3, 4,
                   5, 6, 7, 8,
                   9, 10, 11, 12,
                   13, 14, 15, 16});
    printMatrix(m);

    return 0;
}

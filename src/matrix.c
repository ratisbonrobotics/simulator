#include "matrix.h"

void createIdentityMatrix(float *m)
{
    for (int i = 0; i < 16; i++)
    {
        m[i] = (i % 5 == 0) ? 1.0f : 0.0f;
    }
}

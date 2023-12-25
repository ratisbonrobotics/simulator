#ifndef MATRIX_H
#define MATRIX_H

double degreeToRadians(double degree);
void printMatrix(float *m);
void createIdentityMatrix(float *m);
void mult(float *result, float *a, float *b);
void createTranslationMatrix(float *m, float tx, float ty, float tz);
void createXRotationMatrix(float *m, float angleInRadians);
void createYRotationMatrix(float *m, float angleInRadians);
void createZRotationMatrix(float *m, float angleInRadians);
void createScaleMatrix(float *m, float sx, float sy, float sz);
void createPerspectiveMatrix(float *m, float fov, float aspect, float near, float far);
void createOrthographicMatrix(float *m, float left, float right, float bottom, float top, float near, float far);
void createLookAtMatrix(float *m, float *eye, float *center, float *up);

#endif // MATRIX_H
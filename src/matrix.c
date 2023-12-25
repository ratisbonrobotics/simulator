#include "matrix.h"
#include "webassembly.h"

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

double degreeToRadians(double degree)
{
    return degree * (M_PI / 180.0);
}

void printMatrix(float *m)
{
    char buffer[1024] = {0}; // Large enough buffer to hold the entire matrix as a string
    char floatString[50];    // Buffer for individual floats
    int bufIndex = 0;        // Index for the main buffer

    for (int i = 0; i < 16; i++)
    {
        ftoa(m[i], floatString, 3); // Convert float to string with 3 decimal places

        // Append the float string to the main buffer
        int j = 0;
        while (floatString[j] != '\0' && bufIndex < 1023)
        {
            buffer[bufIndex++] = floatString[j++];
        }

        // Add space or newline to the buffer
        if ((i + 1) % 4 == 0)
            buffer[bufIndex++] = '\n';
        else
            buffer[bufIndex++] = ' ';

        buffer[bufIndex] = '\0'; // Ensure null-termination
    }

    printf("%s\n", buffer); // Print the entire matrix at once
}

void createIdentityMatrix(float *m)
{
    for (int i = 0; i < 16; i++)
    {
        m[i] = (i % 5 == 0) ? 1.0f : 0.0f;
    }
}

// Function to multiply two 4x4 matrices
void mult(float *result, float *a, float *b)
{
    for (int i = 0; i < 4; i++)
    {
        for (int j = 0; j < 4; j++)
        {
            result[i * 4 + j] = a[i * 4 + 0] * b[0 * 4 + j] +
                                a[i * 4 + 1] * b[1 * 4 + j] +
                                a[i * 4 + 2] * b[2 * 4 + j] +
                                a[i * 4 + 3] * b[3 * 4 + j];
        }
    }
}

// Function to create a translation matrix
void createTranslationMatrix(float *m, float tx, float ty, float tz)
{
    createIdentityMatrix(m);
    m[12] = tx;
    m[13] = ty;
    m[14] = tz;
}

// Function to create a rotation matrix around the X axis
void createXRotationMatrix(float *m, float angleInRadians)
{
    float s = sinf(angleInRadians);
    float c = cosf(angleInRadians);

    createIdentityMatrix(m);
    m[5] = c;
    m[6] = s;
    m[9] = -s;
    m[10] = c;
}

// Function to create a rotation matrix around the Y axis
void createYRotationMatrix(float *m, float angleInRadians)
{
    float s = sinf(angleInRadians);
    float c = cosf(angleInRadians);

    createIdentityMatrix(m);
    m[0] = c;
    m[2] = -s;
    m[8] = s;
    m[10] = c;
}

// Function to create a rotation matrix around the Z axis
void createZRotationMatrix(float *m, float angleInRadians)
{
    float s = sinf(angleInRadians);
    float c = cosf(angleInRadians);

    createIdentityMatrix(m);
    m[0] = c;
    m[1] = s;
    m[4] = -s;
    m[5] = c;
}

// Function to create a scale matrix
void createScaleMatrix(float *m, float sx, float sy, float sz)
{
    createIdentityMatrix(m);
    m[0] = sx;
    m[5] = sy;
    m[10] = sz;
}

void createOrthographicMatrix(float *m, float left, float right, float bottom, float top, float near, float far)
{
    m[0] = 2.0f / (right - left);
    m[1] = 0.0f;
    m[2] = 0.0f;
    m[3] = 0.0f;

    m[4] = 0.0f;
    m[5] = 2.0f / (top - bottom);
    m[6] = 0.0f;
    m[7] = 0.0f;

    m[8] = 0.0f;
    m[9] = 0.0f;
    m[10] = 2.0f / (near - far);
    m[11] = 0.0f;

    m[12] = (left + right) / (left - right);
    m[13] = (bottom + top) / (bottom - top);
    m[14] = (near + far) / (near - far);
    m[15] = 1.0f;
}

void createSimpleProjectionMatrix(float *m, float width, float height, float depth)
{
    m[0] = 2.0f / width;
    m[1] = 0.0f;
    m[2] = 0.0f;
    m[3] = 0.0f;

    m[4] = 0.0f;
    m[5] = -2.0f / height;
    m[6] = 0.0f;
    m[7] = 0.0f;

    m[8] = 0.0f;
    m[9] = 0.0f;
    m[10] = 2.0f / depth;
    m[11] = 0.0f;

    m[12] = -1.0f;
    m[13] = 1.0f;
    m[14] = 0.0f;
    m[15] = 1.0f;
}

void createPerspectiveMatrix(float *m, float fovInRadians, float aspect, float near, float far)
{
    float f = 1.0f / tanf(fovInRadians / 2.0f);
    float rangeInv = 1.0f / (near - far);

    m[0] = f / aspect;
    m[1] = 0.0f;
    m[2] = 0.0f;
    m[3] = 0.0f;

    m[4] = 0.0f;
    m[5] = f;
    m[6] = 0.0f;
    m[7] = 0.0f;

    m[8] = 0.0f;
    m[9] = 0.0f;
    m[10] = (near + far) * rangeInv;
    m[11] = -1.0f;

    m[12] = 0.0f;
    m[13] = 0.0f;
    m[14] = near * far * rangeInv * 2.0f;
    m[15] = 0.0f;
}

void inverse(float *result, float *m)
{
    float m00 = m[0];
    float m01 = m[1];
    float m02 = m[2];
    float m03 = m[3];
    float m10 = m[4];
    float m11 = m[5];
    float m12 = m[6];
    float m13 = m[7];
    float m20 = m[8];
    float m21 = m[9];
    float m22 = m[10];
    float m23 = m[11];
    float m30 = m[12];
    float m31 = m[13];
    float m32 = m[14];
    float m33 = m[15];

    float tmp_0 = m22 * m33;
    float tmp_1 = m32 * m23;
    float tmp_2 = m12 * m33;
    float tmp_3 = m32 * m13;
    float tmp_4 = m12 * m23;
    float tmp_5 = m22 * m13;
    float tmp_6 = m02 * m33;
    float tmp_7 = m32 * m03;
    float tmp_8 = m02 * m23;
    float tmp_9 = m22 * m03;
    float tmp_10 = m02 * m13;
    float tmp_11 = m12 * m03;
    float tmp_12 = m20 * m31;
    float tmp_13 = m30 * m21;
    float tmp_14 = m10 * m31;
    float tmp_15 = m30 * m11;
    float tmp_16 = m10 * m21;
    float tmp_17 = m20 * m11;
    float tmp_18 = m00 * m31;
    float tmp_19 = m30 * m01;
    float tmp_20 = m00 * m21;
    float tmp_21 = m20 * m01;
    float tmp_22 = m00 * m11;
    float tmp_23 = m10 * m01;

    float t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) - (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
    float t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) - (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
    float t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) - (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
    float t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) - (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

    float d = 1.0f / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

    result[0] = d * t0;
    result[1] = d * t1;
    result[2] = d * t2;
    result[3] = d * t3;
    result[4] = d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) - (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30));
    result[5] = d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) - (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30));
    result[6] = d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) - (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30));
    result[7] = d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) - (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20));
    result[8] = d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) - (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33));
    result[9] = d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) - (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33));
    result[10] = d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) - (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33));
    result[11] = d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) - (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23));
    result[12] = d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) - (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22));
    result[13] = d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) - (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02));
    result[14] = d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) - (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12));
    result[15] = d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) - (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02));
}

void transposeMatrix(float *result, float *m)
{
    for (int i = 0; i < 4; ++i)
    {
        for (int j = 0; j < 4; ++j)
        {
            result[j * 4 + i] = m[i * 4 + j];
        }
    }
}

void crossProduct(float *result, float *a, float *b)
{
    result[0] = a[1] * b[2] - a[2] * b[1];
    result[1] = a[2] * b[0] - a[0] * b[2];
    result[2] = a[0] * b[1] - a[1] * b[0];
}

void subtractVectors(float *result, float *a, float *b)
{
    result[0] = a[0] - b[0];
    result[1] = a[1] - b[1];
    result[2] = a[2] - b[2];
}

void normalizeVector(float *result, float *v)
{
    float length = sqrtf(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    if (length > 0.000001f)
    {
        result[0] = v[0] / length;
        result[1] = v[1] / length;
        result[2] = v[2] / length;
    }
    else
    {
        result[0] = 0.0f;
        result[1] = 0.0f;
        result[2] = 0.0f;
    }
}

void createLookAtMatrix(float *result, float *cameraPosition, float *target, float *up)
{
    float zAxis[3], xAxis[3], yAxis[3], temp[3];

    subtractVectors(temp, cameraPosition, target);
    normalizeVector(zAxis, temp);
    crossProduct(temp, up, zAxis);
    normalizeVector(xAxis, temp);
    crossProduct(yAxis, zAxis, xAxis);

    result[0] = xAxis[0];
    result[1] = xAxis[1];
    result[2] = xAxis[2];
    result[3] = 0.0f;

    result[4] = yAxis[0];
    result[5] = yAxis[1];
    result[6] = yAxis[2];
    result[7] = 0.0f;

    result[8] = zAxis[0];
    result[9] = zAxis[1];
    result[10] = zAxis[2];
    result[11] = 0.0f;

    result[12] = cameraPosition[0];
    result[13] = cameraPosition[1];
    result[14] = cameraPosition[2];
    result[15] = 1.0f;
}
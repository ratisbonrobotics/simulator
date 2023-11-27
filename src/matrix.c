#include "matrix.h"
#include "webassembly.h"

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

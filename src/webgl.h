#define bool int
#define true 1
#define false 0

// INTERFACE
typedef enum
{
    VERTEX_SHADER = 0x8B31,
    FRAGMENT_SHADER = 0x8B30,
    COMPILE_STATUS = 0x8B81,
    ARRAY_BUFFER = 0x8892,
    STATIC_DRAW = 0x88E4,
    FLOAT = 0x1406,
    LINK_STATUS = 0x8B82,
    DEPTH_BUFFER_BIT = 0x0100,
    COLOR_BUFFER_BIT = 0x4000,
    CULL_FACE = 0x0B44,
    DEPTH_TEST = 0x0B71,
} GLenum; /* https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants */

extern unsigned int gl_getContext(const char *canvas);
/*extern unsigned int gl_createProgram(unsigned int gl);
extern unsigned int gl_attachShader(unsigned int gl, unsigned int program, unsigned int shader);
extern unsigned int gl_linkProgram(unsigned int gl, unsigned int program);
extern unsigned int gl_createShader(unsigned int gl, GLenum type);
extern void gl_getProgramInfoLog(unsigned int gl, unsigned int program, char *infoLog);
extern bool gl_getProgramParameter(unsigned int gl, unsigned int program, GLenum pname);
extern void gl_shaderSource(unsigned int gl, unsigned int shader, const char *source);
extern void gl_compileShader(unsigned int gl, unsigned int shader);
extern int gl_getShaderParameter(unsigned int gl, unsigned int shader, GLenum pname);
extern void gl_getShaderInfoLog(unsigned int gl, unsigned int shader, char *infoLog);
extern unsigned int gl_createBuffer(unsigned int gl);
extern void gl_bindBuffer(unsigned int gl, GLenum target, unsigned int buffer);
extern void gl_bufferData(unsigned int gl, GLenum target, unsigned int size, const void *data, GLenum usage);

typedef struct
{
    unsigned int location;
} GLUniformLocation;

extern GLUniformLocation gl_getUniformLocation(unsigned int gl, unsigned int program, const char *name);
extern void gl_uniformMatrix4fv(unsigned int gl, GLUniformLocation location, int count, int transpose, const float *value);
extern int gl_getAttribLocation(unsigned int gl, unsigned int program, const char *name);
extern void gl_vertexAttribPointer(unsigned int gl, int index, int size, GLenum type, int normalized, int stride, const void *pointer);
extern void gl_enableVertexAttribArray(unsigned int gl, int index);

// IMPLEMENTATION
unsigned int createProgram(unsigned int gl, unsigned int vertexShader, unsigned int fragmentShader);
unsigned int compileShader(unsigned int gl, GLenum type, const char *source);
unsigned int createShaderProgram(unsigned int gl, const char *vertexShaderSource, const char *fragmentShaderSource);

// Assuming a predefined max number of attributes
#define MAX_ATTRIBS 10

typedef struct
{
    int locations[MAX_ATTRIBS];
} AttribLocations;

AttribLocations getAttribLocations(unsigned int gl, unsigned int program, const char **names, int count);
void init3D(unsigned int gl, int width, int height);
unsigned int createBuffer(unsigned int gl, GLenum type, const float *data, unsigned int size);
void connectBufferToAttribute(unsigned int gl, GLenum type, unsigned int buffer, int attribLocation, int valuesPerVertex, int enable);
*/
typedef enum
{
    DEPTH_BUFFER_BIT = 0x0100,
    CULL_FACE = 0x0B44,
    DEPTH_TEST = 0x0B71,
    FLOAT = 0x1406,
    COLOR_BUFFER_BIT = 0x4000,
    ARRAY_BUFFER = 0x8892,
    STATIC_DRAW = 0x88E4,
    FRAGMENT_SHADER = 0x8B30,
    VERTEX_SHADER = 0x8B31,
    COMPILE_STATUS = 0x8B81,
    LINK_STATUS = 0x8B82,
} GLenum;

extern unsigned int gl_getContext(const char *canvas);
extern unsigned int gl_createShader(unsigned int gl, GLenum type);
extern void gl_shaderSource(unsigned int gl, unsigned int shader, const char *source);
extern void gl_compileShader(unsigned int gl, unsigned int shader);
extern int gl_getShaderParameter(unsigned int gl, unsigned int shader, GLenum pname);
extern void gl_getShaderInfoLog(unsigned int gl, unsigned int shader, char *infoLog, unsigned int maxLength);

unsigned int compileShader(unsigned int gl, GLenum type, const char *source);
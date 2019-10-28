attribute vec3 a_position;
attribute vec4 a_color;

uniform mat4 u_view;
uniform mat4 u_proj;

varying lowp vec4 v_color;

void main (void)
{
    vec4 view_space = u_view * vec4(a_position, 1.0);
    gl_Position = u_proj * view_space;
    v_color = a_color;
}

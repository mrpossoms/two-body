attribute vec3 a_position;
attribute vec2 a_tex_coord;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_proj;

varying lowp vec2 v_tex_coord;
varying mediump float v_depth;

void main (void)
{
    vec4 view_space = u_view * u_model * vec4(a_position, 1.0);
    gl_Position = u_proj * view_space;
    v_depth = view_space.z;
    v_tex_coord = a_tex_coord;
}

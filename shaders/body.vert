attribute vec3 a_position;
//attribute vec2 a_tex_coord;
// attribute vec3 a_normal;

uniform mat4 u_model;
uniform mat4 u_normal_model;
uniform mat4 u_view;
uniform mat4 u_proj;

uniform float u_mass;

// varying lowp vec2 v_tex_coord;
// varying lowp vec3 v_normal;

void main (void)
{
    vec4 view_space = u_view * u_model * vec4(a_position, 1.0);
    gl_Position = u_proj * view_space;
    gl_PointSize = u_mass * 100.0 / gl_Position.w;
    // v_tex_coord = a_tex_coord;
    // v_normal = a_normal;
}

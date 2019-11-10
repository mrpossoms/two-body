attribute vec3 a_position;

uniform mat4 u_model;
uniform mat4 u_normal_model;
uniform mat4 u_view;
uniform mat4 u_proj;
uniform float u_mass;

varying lowp mat3 v_rotation_mat;


void main (void)
{
    mat4 vm = u_view * u_model;
    vec4 view_space = vm * vec4(a_position, 1.0);

    v_rotation_mat = mat3(
        normalize(vm[0].xyz),
        normalize(vm[1].xyz),
        normalize(vm[2].xyz)
    );

    gl_Position = u_proj * view_space;
    gl_PointSize = u_mass * 100.0 / gl_Position.w;
}

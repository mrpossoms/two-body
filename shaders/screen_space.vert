attribute vec3 a_position;
attribute vec2 a_tex_coord;

varying lowp vec2 v_tex_coord;

void main (void)
{
  gl_Position = vec4(a_position, 1.0);
  v_tex_coord = a_tex_coord;
}

varying lowp vec2 v_tex_coord;

void main (void)
{
    gl_FragColor = vec4(v_tex_coord, 0.0, 1.0);
}

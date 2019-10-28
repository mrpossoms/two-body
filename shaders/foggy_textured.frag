varying lowp vec2 v_tex_coord;
varying mediump float v_depth;

uniform sampler2D u_texture;

void main (void)
{

    mediump float dim = 1.0 / max(1.0, -v_depth / 40.0);
    lowp vec4 rgba = texture2D(u_texture, vec2(v_tex_coord.x,1.0 - v_tex_coord.y));
    gl_FragColor = rgba * vec4(dim, dim, dim, 1.0);
}

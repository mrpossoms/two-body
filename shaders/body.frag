varying lowp vec2 v_tex_coord;
varying lowp vec3 v_normal;

void main (void)
{
	lowp vec2 t_coord = (v_tex_coord - vec2(0.5)) * 2.0;
	lowp float alpha_mask = ceil(max(0.0, 1.0 - sqrt(dot(t_coord, t_coord))));

	lowp vec3 normal = normalize(vec3(t_coord, 0.0) + vec3(0.0, 0.0, 1.0));

	lowp vec3 color = (normal + vec3(1.0)) * 0.5;

	gl_FragColor = vec4(color, alpha_mask);
}
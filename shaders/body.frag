uniform lowp vec3 u_light_dir;
uniform lowp mat4 u_rot;

varying lowp mat3 v_rotation_mat;


void main (void)
{
	lowp vec2 t_coord = (gl_PointCoord - vec2(0.5)) * vec2(2.0, -2.0);
	lowp float alpha_mask = ceil(max(0.0, 1.0 - sqrt(dot(t_coord, t_coord))));
	lowp vec3 normal = v_rotation_mat * normalize(vec3(t_coord, 1.0));
    //  lowp vec3 normal = (u_rot * vec4(normalize(vec3(t_coord, 0.0) + vec3(0.0, 0.0, 1.0)), 1.0)).xyz;
	lowp vec3 color = (normal + vec3(1.0)) * 0.5;
    lowp float light = dot(-normal, u_light_dir);

	if (alpha_mask <= 0.0 ) { discard; }

	gl_FragColor = vec4(color * light, alpha_mask);
}

function orbital_elements()
{
    // basis vectors
    this.I = [1, 0, 0];
    this.J = [0, 0, 1];
    this.K = [0, 1, 0];

    this.µ = 1; // gravitational parameter
    this.a = 0; // semi major axis

    this.e = 0; // eccentricity
    this.i = 0; // inclination
    this.ω = 0; // argument of periapsis
    this.Ω = 0; // longitude of the ascending node
    this.l = 0; // longitude of periapsis
    this.ν = 0; // true anomaly

    this.r0 = [1, 0, 0];
    this.v0 = [0, 0, 1];

    this.control = {
        _proxy: this,
        _set: {},
        for_prop: function(id, prop)
        {
            const el = document.getElementById(id);

            if (!el) { console.error('no element ' + id); return; }

            function handler(proxy, id)
            {
                var chain = prop.replace('[', '.').replace(']', '').split('.');

                var targ = proxy;
                var val = chain[0];
                for (var j = 1; j < chain.length; j++)
                {
                    targ = targ[val];
                    val = chain[j];
                }

                var compute_call = 'none';
                for (var k in el.attributes)
                {
                    const attr = el.attributes[k];
                    if (attr.name === 'vectors_from_elements' ||
                        attr.name === 'elements_from_vectors')
                    {
                        compute_call = attr.name
                    }
                }

                el.oninput = function(event)
                {
                    console.log(event.target.valueAsNumber);

                    if (typeof(targ[val]) === 'function')
                    {
                        targ[val](event.target.valueAsNumber);
                    }
                    else
                    {
                        targ[val] = event.target.valueAsNumber;
                    }
                    proxy.compute[compute_call]();
                    // compute_call();
                };

                proxy.control._set[prop] = {
                    element: el,
                    target: targ,
                    prop: val,
                };
            }

            el.handler = new handler(this._proxy, prop);
        },
        update_all: function()
        {
            for (var prop in this._set)
            {
                const p = this._set[prop];
                const el = p.element;
                el.value = p.target[p.prop];
            }
        }
    };

    this.compute = {
        _proxy: this,
        elements_from_vectors: function()
        {
            with (this._proxy)
            {
                const rtd = 180 / Math.PI;

                // compute eccentricity
                const v_mag = v0.len();
                const r_mag = r0.len();
                const r_scl = v_mag * v_mag - µ / r_mag;
                const e_v = r0.mul(r_scl).sub(v0.mul(r0.dot(v0)));
                e = e_v.len();

                // compute inclination
                i = Math.acos(h().norm().dot(K)) * rtd;

                // compute the argument of periapsis
                const n_mag = n().len();
                if (n_mag > 0)
                {
                    ω = Math.acos(e_v.dot(n()) / e * n_mag) * rtd;
                }
                else
                {
                    ω = NaN;
                }

                // compute the longitude of periapsis

                // compute the longitude of the ascending node

                // compute the semi-major axis
                const h2 = h(0).dot(h(0));
                a = h2 / (1 - e * e) * µ;

                this._proxy.control.update_all();
            }
        },
        vectors_from_elements: function()
        {
            with (this._proxy)
            {
                const dtr = Math.PI / 180;
                var w = isNaN(ω) ? 0 : ω;

                const c_Ω = Math.cos(Ω * dtr), s_Ω = Math.sin(Ω * dtr);
                const c_ω = Math.cos(w * dtr), s_ω = Math.sin(w * dtr);
                const c_i = Math.cos(i * dtr), s_i = Math.sin(i * dtr);

                // transformation matrix between perifocal coords to geocentric
                const R = [
                    [ c_Ω * c_ω - s_Ω * s_ω * c_i,   s_Ω * s_i, -c_Ω * s_ω - s_Ω * c_ω * c_i,],
                    [ s_Ω * c_ω + c_Ω * s_ω * c_i,  -c_Ω * s_i, -s_Ω * s_ω + c_Ω * c_ω * c_i,],
                    [ s_ω * s_i,                     c_i      , c_ω * s_i,                   ],
                ];

                r_mag = p() / (1 + e * Math.cos(ν * dtr)); // scalar length of perifocal 'r' vector
                r_p = [r_mag * Math.cos(ν * dtr), r_mag * Math.sin(ν * dtr), 0];              // perifocal 'r' vector
                v_p = [-Math.sin(ν * dtr), e + Math.cos(ν * dtr), 0].mul(Math.sqrt(µ / p())); // perifocal 'v' vector
                r0.assign(R.mat_mul(r_p).flatten());
                v0.assign(R.mat_mul(v_p).flatten());

                this._proxy.control.update_all();
            }
        },
        none: function() {}
    };

    this.r = function(t)
    {
        with (this)
        {
            const dtr = Math.PI / 180;
            const w = isNaN(ω) ? 0 : ω;
            const q_i = [].quat_rotation(I, i * dtr);
            const q_ω = [].quat_rotation(K, w * dtr);
            return q_ω.quat_mul(q_i).quat_rotate_vector([
                Math.cos(t) * a - (a - r_per()),
                0,
                Math.sin(t) * p()
            ]);
        }
    };

    this.v = function(t)
    {
        with (this)
        {
            const dtr = Math.PI / 180;
            const w = isNaN(ω) ? 0 : ω;
            const q_i = [].quat_rotation(I, i * dtr);
            const q_ω = [].quat_rotation(K, w * dtr);
            return q_ω.quat_mul(q_i).quat_rotate_vector([
                -a * Math.sin(t),
                0,
                Math.cos(t) * p()
            ]);
        }
    };

    this.h = function(t)
    {
        return this.r0.cross(this.v0);
    };

    this.p = function()
    {
        with (this)
        {
            return a * Math.sqrt(1 - e * e);
        }
    };

    this.r_per = function()
    {
        with (this)
        {
            return (1 - e) * this.a;
        }
    };

    this.r_ap = function()
    {
        with (this)
        {
            return (1 + e) * this.a;
        }
    };

    this.n = function(t)
    {
        with (this)
        {
            return K.cross(h());
        }
    };
}

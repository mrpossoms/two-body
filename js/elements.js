const dtr = Math.PI / 180;
const rtd = 180 / Math.PI;

function orbital_elements()
{
    // basis vectors
    this.I = [1, 0, 0];
    this.J = [0, 1, 0];
    this.K = [0, 0, 1];

    this.µ = 1; // gravitational parameter

    this.e = 0; // eccentricity
    this.e_v = [0, 0, 0]; // eccentricity vector
    this.i = 0; // inclination
    this.ω = 0; // argument of periapsis
    this.Ω = 0; // longitude of the ascending node
    this.l = 0; // longitude of periapsis
    this.ν = 0; // true anomaly
    this.p = 1; // semi-major axis

    this.r0 = [1, 0, 0.2];
    this.v0 = [0, 1.2, 0];
    this.h = this.K.slice();

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
                };

                if (!proxy.control._set[prop])
                {
                    proxy.control._set[prop] = {
                        elements: [el],
                        target: targ,
                        prop: val,
                    };
                }
                else
                {
                    proxy.control._set[prop].elements.push(el);
                }

            }

            el.handler = new handler(this._proxy, prop);
        },
        update_all: function()
        {
            for (var prop in this._set)
            {
                const p = this._set[prop];

                for (var i = p.elements.length; i--;)
                {
                    var val = p.target[p.prop];
                    const el = p.elements[i];
                    el.value = Math.round(val * 1000) / 1000;
                }

            }
        }
    };

    this.compute = {
        _proxy: this,
        eccentricity: function()
        {
            with (this._proxy)
            {
                const v_mag = v0.len();
                const r_mag = r0.len();
                const r_scl = v_mag * v_mag - µ / r_mag;
                e_v.assign((r0.mul(r_scl).sub(v0.mul(r0.dot(v0)))).mul(1 / µ));
                e_v.round(3);
                e = e_v.len();
            }
        },

        elements_from_vectors: function()
        {
            with (this._proxy)
            {
                // angular momentum
                h.assign(r0.cross(v0));

                // semi major axis
                p = Math.pow(h.len(), 2.0) / µ;

                // compute inclination
                i = Math.acos(h.norm().dot(K)) * rtd;

                // compute eccentricity
                compute.eccentricity();

                // compute the longitude of the ascending node
                Ω = Math.acos(n().norm().dot(I)) * rtd;
                if (n()[1] < 0)
                {
                    Ω += 180;
                }

                // compute the argument of periapsis
                ω = Math.acos(e_v.norm().dot(n().norm())) * rtd;
                if (e_v[2] < 0)
                {
                    ω += 180;
                }

                // compute the true anomaly
                ν = Math.acos(e_v.norm().dot(r0.norm())) * rtd;
                if (r0.dot(v0) < 0)
                {
                    ν += 180;
                }

                ω = isNaN(ω) ? 0 : ω;
                Ω = isNaN(Ω) ? 0 : Ω;
                ν = isNaN(ν) ? 0 : ν;

                this._proxy.control.update_all();
            }
        },
        vectors_from_elements: function()
        {
            with (this._proxy)
            {
                const R = M_perifocal_to_geo();

                const _ν = isNaN(ν) ? 0 : ν;
                const r_mag = p / (1 + e * Math.cos(_ν * dtr)); // scalar length of perifocal 'r' vector
                const r_p = [r_mag * Math.cos(_ν * dtr), r_mag * Math.sin(_ν * dtr), 0];              // perifocal 'r' vector
                const v_p = [-Math.sin(_ν * dtr), e + Math.cos(_ν * dtr), 0].mul(Math.sqrt(µ / p)); // perifocal 'v' vector

                r0.assign(R.mat_mul(r_p).flatten());
                v0.assign(R.mat_mul(v_p).flatten());
                h.assign(r0.cross(v0));

                compute.eccentricity();

                this._proxy.control.update_all();
            }
        },
        none: function() {}
    };

    this.r = function(t)
    {
        with (this)
        {
            const _ν = isNaN(ν) ? 0 : ν;
            t += _ν * dtr;

            const r_mag = p / (1 + e * Math.cos(t)); // scalar length of perifocal 'r' vector
            const r_p = [r_mag * Math.cos(t), r_mag * Math.sin(t), 0];              // perifocal 'r' vector

            return M_perifocal_to_geo().mat_mul(r_p);
        }
    };

    this.periapsis = function()
    {
        with (this)
        {
            const r_mag = p / (1 + e * Math.cos(0)); // scalar length of perifocal 'r' vector
            const r_p = [r_mag * Math.cos(0), r_mag * Math.sin(0), 0];              // perifocal 'r' vector

            return M_perifocal_to_geo().mat_mul(r_p);
        }
    };

    this.v = function(t)
    {
        with (this)
        {
            const _ν = isNaN(ν) ? 0 : ν;
            t += _ν * dtr;
            const v_p = [-Math.sin(t), e + Math.cos(t), 0].mul(Math.sqrt(µ / p)); // perifocal 'v' vector

            return M_perifocal_to_geo().mat_mul(v_p);
        }
    };

    this.n = function(t)
    {
        with (this)
        {
            return K.cross(h);
        }
    };

    this.M_perifocal_to_geo = function()
    {
        with (this)
        {
            var w = isNaN(ω) ? 0 : ω;
            var o = isNaN(Ω) ? 0 : Ω;

            const c_Ω = Math.cos(o * dtr), s_Ω = Math.sin(o * dtr);
            const c_ω = Math.cos(w * dtr), s_ω = Math.sin(w * dtr);
            const c_i = Math.cos(i * dtr), s_i = Math.sin(i * dtr);

            // transformation matrix between perifocal coords to geocentric
            return [
                [ c_Ω * c_ω - s_Ω * s_ω * c_i, -c_Ω * s_ω - s_Ω * c_ω * c_i,  s_Ω * s_i, ],
                [ s_Ω * c_ω + c_Ω * s_ω * c_i, -s_Ω * s_ω + c_Ω * c_ω * c_i, -c_Ω * s_i, ],
                [ s_ω * s_i,                   c_ω * s_i,                     c_i      , ],
            ];// .transpose();
        }
    }
}

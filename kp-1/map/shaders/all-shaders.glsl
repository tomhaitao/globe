// stars //
attribute vec4 position;
uniform mat4 mvp;
uniform vec4 color;

// stars.vertex //
void main() {
    gl_PointSize = position.w;
    gl_Position = mvp * vec4(position.xyz, 1.0);
}

// stars.fragment //
void main() {
    gl_FragColor = color;
}

// corona //
attribute vec4 vertex;
varying vec2 v_texcoord;
uniform mat4 mvp;
uniform mat3 bill;
uniform vec4 color;
uniform sampler2D t_smoke;
uniform float time;

uniform vec3 color0;
uniform vec3 color1;
uniform float zoff;

// corona.vertex //
void main() {
    float s = 10.0 + (10.0 * vertex.w);
    vec3 P = vec3(s * vertex.xy, zoff);
    P = bill * P;
    gl_Position = mvp * vec4(P, 1.0);
    v_texcoord = vertex.zw;
}

// corona.fragment //
void main() {
    vec2 uv = vec2(5.0*v_texcoord.x + 0.01*time, 0.8 - 1.5*v_texcoord.y);
    float smoke = texture2D(t_smoke, uv).r;
    uv = vec2(3.0*v_texcoord.x - 0.007*time, 0.9 - 0.5*v_texcoord.y);
    smoke *= 1.5*texture2D(t_smoke, uv).r;

    float t = pow(v_texcoord.y, 0.25);
    gl_FragColor.rgb = mix(color0, color1, t) + 0.3*smoke;
    gl_FragColor.a = 1.0;
}

// icon //
attribute vec3 vertex;
varying float v_alpha;
uniform mat4 mvp;
uniform mat4 mat;
uniform vec3 color;
uniform float time;
uniform float scale;

// icon.vertex //
void main() {
    float spread = 1.0 + (time * 0.3*vertex.z);
    vec3 P = scale * spread * vec3(vertex.xy, -2.50*(vertex.z)*time);
    P = P.xzy;
    P.y = -P.y;
    gl_Position = mvp * mat * vec4(P, 1.0);
    v_alpha = 1.0 - vertex.z/6.0;
}

// icon.fragment //
void main() {
    gl_FragColor.rgb = color;
    gl_FragColor.a = (1.0 - pow(time, 7.0)) * (v_alpha * time);
}

// missile //
attribute vec4 position;
varying vec3 v_normal;
varying vec3 v_view_vec;
varying float v_alpha;
varying float v_v;
uniform mat4 mvp;
uniform vec3 view_position;
uniform vec3 color;
uniform float time;
uniform float width;

// missile.vertex //
void main() {
    float u = abs(position.w);
    float v = sign(position.w);
    v_v = v;

    float w = 0.2 + 0.3*(1.0 - pow(2.0*abs(u - 0.5), 2.0));
    w = width * w * (v - 0.5);

    vec3 P = position.xyz;
    P.x += w;

    v_normal = normalize(P);
    v_view_vec = normalize(view_position - P);
    v_alpha = u;
    gl_Position = mvp * vec4(P, 1.0);
}

// missile.fragment //
void main() {
    vec3 N = normalize(v_normal);
    vec3 V = normalize(v_view_vec);
    float NdotV = max(0.0, dot(N, V));
    float w = 1.0 - pow(abs(v_v), 4.0);
    gl_FragColor.rgb = color.rgb;
    gl_FragColor.a = pow(max(0.0, sin(3.14159 * (v_alpha + (1.0 - 2.0*time)))), 3.5);
    gl_FragColor.a *= w;
}

// map_pick //
attribute vec3 position;
uniform mat4 mvp;
uniform float color;

// map_pick.vertex //
void main() {
    vec3 P = position;
    gl_Position = mvp * vec4(P, 1.0);
}

// map_pick.fragment //
void main() {
    gl_FragColor = vec4(color, 0.0, 0.0, 1.0);
}

// map_main //
attribute vec3 position;
attribute vec3 normal;
attribute vec3 position2;
attribute vec3 normal2;
attribute vec2 texcoord;
varying vec3 v_normal;
varying vec2 v_texcoord;
varying vec3 v_light_vec;
varying vec3 v_view_vec;
uniform mat4 mvp;
uniform float offset_x;

uniform sampler2D t_blur;
uniform float blend;
uniform vec3 light_pos;
uniform vec3 view_pos;

uniform vec3 color0;
uniform vec3 color1;
uniform float tone;
uniform float height;

// map_main.vertex //
void main() {
    vec3 P = mix(position, position2, blend);
    P.x += offset_x;

    v_normal = mix(normal, normal2, blend);
    P += height * v_normal;

    gl_Position = mvp * vec4(P, 1.0);

    v_texcoord = texcoord;
    v_light_vec = light_pos - P;
    v_view_vec = view_pos - P;
}

// map_main.fragment //
void main() {
    vec3 N = normalize(-v_normal);
    vec3 V = normalize(v_view_vec);
    vec3 L = normalize(v_light_vec);
    vec3 H = normalize(L + V);
    float NdotL = max(0.0, dot(N, L));
    float NdotH = max(0.0, dot(N, H));

    float blur = texture2D(t_blur, v_texcoord).r;
    blur = 1.0*pow(blur, 2.0);

    float diffuse = 0.5 + 0.5*NdotL;
    float specular = 0.75 * pow(NdotH, 15.0);

    gl_FragColor.rgb = diffuse * mix(color0, color1, tone) + vec3(specular);
    gl_FragColor.a = 1;
}

// map_grid //
attribute vec3 position;
attribute vec3 position2;
attribute vec2 texcoord;
varying vec2 v_texcoord;
uniform mat4 mvp;
uniform vec2 pattern_scale;
uniform sampler2D t_blur;
uniform sampler2D t_pattern;
uniform float blend;
uniform vec3 color0;
uniform vec3 color1;
uniform float offset_x;

// map_grid.vertex //
void main() {
    vec3 P = mix(position, position2, blend);
    P.x += offset_x;
    gl_Position = mvp * vec4(P, 1.0);
    v_texcoord = texcoord;
}

// map_grid.fragment //
void main() {
    float pattern = texture2D(t_pattern, pattern_scale * v_texcoord).r;
    float blur = texture2D(t_blur, v_texcoord).r;

    gl_FragColor.rgb = mix(color0, color1, blur) + vec3(pattern);
    gl_FragColor.a = 1.0;
}

// map_line //
attribute vec3 position;
attribute vec3 normal;
attribute vec3 position2;
attribute vec3 normal2;
uniform mat4 mvp;
uniform vec4 color;
uniform float blend;
uniform float height;

// map_line.vertex //
void main() {
    vec3 P = mix(position, position2, blend);
    vec3 N = mix(normal, normal2, blend);
    P += height * N;
    gl_Position = mvp * vec4(P, 1.0);
}

// map_line.fragment //
void main() {
    gl_FragColor = color;
}


// label //
attribute vec3 position;
attribute vec2 texcoord;
varying float v_alpha;
varying vec2 v_texcoord;
uniform mat4 mvp;
uniform vec4 color;
uniform vec4 circle_of_interest;
uniform bool inside;
uniform sampler2D t_color;

// label.vertex //
void main() {
    gl_Position = mvp * vec4(position, 1.0);
    v_alpha = max(0.0, 1.0 - distance(position, circle_of_interest.xyz)/circle_of_interest.a);
    if (!inside)
        v_alpha = pow(1.0 - v_alpha, 6.0);
    v_texcoord = texcoord;
}

// label.fragment //
void main() {
    gl_FragColor = texture2D(t_color, v_texcoord);
    gl_FragColor.a = 0.7 * v_alpha;
}

// impact //
attribute vec2 position;
varying vec2 v_texcoord0;
varying vec2 v_texcoord;
varying vec2 v_texcoord2;
varying vec2 v_texcoord3;
uniform mat4 mvp;
uniform vec3 color;
uniform sampler2D t_color;
uniform float time;
uniform mat4 mat;

// impact.vertex //
#define PI 3.14159265359

vec2 rotate_vec2(vec2 v, float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return vec2(c*v.x - s*v.y, s*v.x + c*v.y);
}

void main() {
    const float SCALE = 0.08 * 1.25;
    vec3 P = SCALE * vec3(2.0 * (position.x - 0.5), 0.01, 2.0 * (position.y - 0.5));
    gl_Position = mvp * mat * vec4(P, 1.0);
    v_texcoord0 = position.xy;
    float impact_scale = 1.0 / (time + 0.1);
    v_texcoord = impact_scale*rotate_vec2(position.xy - 0.5, time) + 0.5;
    v_texcoord2 = impact_scale*rotate_vec2(position.xy - 0.5, -time) + 0.5;
    float scale = 1.5 + 0.3*sin(2.0*time);
    v_texcoord3 = scale * impact_scale*rotate_vec2(position.xy - 0.5, -0.32323 * time) + 0.5;
}

// impact.fragment //
void main() {
    vec3 C = texture2D(t_color, v_texcoord).rgb;
    vec3 C2 = texture2D(t_color, v_texcoord2).rgb;
    vec3 C3 = 0.6*texture2D(t_color, v_texcoord3).rgb;
    gl_FragColor.rgb = color.rgb * (C * C2) + C3;

    // grid
    {
        float x = 0.0;
        vec2 t = 5.0 * (v_texcoord0 - 0.5);
        t = t - floor(t);
        if (t.x < 0.10)
            x += 2.0;
        if (t.y < 0.10)
            x += 2.0;
        x *= 1.0 - 2.0*length(v_texcoord0 - 0.5);
        gl_FragColor.rgb += 0.5 * x * color.rgb;
    }

    gl_FragColor.a = 1.0 - pow(2.0*abs(time - 0.5), 2.0);
}

// cone //
attribute vec3 position;
varying vec2 v_coord;
uniform mat4 mvp;
uniform vec3 color;
uniform mat4 mat;
uniform float time;

// cone.vertex //
void main() {
    v_coord = vec2(0.0, position.y);
    float scale = 0.07 * mix(0.15, 0.4, position.y);
    vec3 P = scale * position;
    P.y *= 5.0;
    gl_Position = mvp * mat * vec4(P, 1.0);
}

// cone.fragment //
void main() {
    gl_FragColor.rgb = color;
    gl_FragColor.rgb += (1.0 - vec3(v_coord.y)) * 0.2;
    gl_FragColor.a = (1.0 - v_coord.y) * 1.0;
    gl_FragColor.a *= 1.0 - pow(2.0*abs(time - 0.5), 2.0);
}


// marker //
attribute vec2 coord;
varying vec2 v_texcoord;
uniform mat4 mvp;
uniform mat3 bill;
uniform mat4 mat;
uniform vec3 pos;
uniform sampler2D t_sharp;
uniform sampler2D t_fuzzy;
uniform vec4 color;
uniform float scale;
uniform float fuzz;

// marker.vertex //
void main() {
    v_texcoord = vec2(coord.x, 1.0 - coord.y);
    vec3 P = (bill * scale * vec3(2.0*(coord.x-0.5), 2.0*coord.y, 0.0)) + pos;
    gl_Position = mvp * vec4(P, 1.0);
}

// marker.fragment //
void main() {
    vec4 C = mix(texture2D(t_sharp, v_texcoord), texture2D(t_fuzzy, v_texcoord), fuzz);
    float alpha = C.x;
    gl_FragColor = vec4(color.xyz, alpha);
}


// simple //
attribute vec3 position;
uniform mat4 mvp;
uniform vec4 color;

// simple.vertex //
void main() {
    gl_Position = mvp * vec4(position, 1.0);
}

// simple.fragment //
void main() {
    gl_FragColor = color;
}


// gnomon //
attribute vec3 position;
attribute vec3 color;
varying vec3 v_color;
uniform mat4 mvp;
uniform vec4 rotation;
uniform vec3 location;
uniform float scale;

// gnomon.vertex //
vec3 transform_quat(vec3 v, vec4 q) {
    vec3 t = 2.0 * cross(q.xyz, v);
    return v + q.w*t + cross(q.xyz, t);
}

void main() {
    v_color = color;
    vec3 P = location + scale * transform_quat(position, rotation);
    gl_Position = mvp * vec4(P, 1.0);
}

// gnomon.fragment //
void main() {
    gl_FragColor.rgb = v_color;
    gl_FragColor.a = 1.0;
}


// scape //
attribute vec4 position;
attribute vec2 texcoord;
varying vec2 v_texcoord;
uniform mat4 mvp;
uniform vec4 color;
uniform vec3 fog_color;
uniform sampler2D pattern;

// scape.vertex //
void main() {
    vec3 P = position.xyz;
    gl_Position = mvp * vec4(P, 1.0);
    v_texcoord = texcoord + 0.5;
}

// scape.fragment //
void main() {
    gl_FragColor = color + 0.2 * texture2D(pattern, v_texcoord);

#define USE_FOG
#ifdef USE_FOG
    {
        // fog
        const float LOG2 = 1.442695;
        const float fog_density = 0.1;
        float z = gl_FragCoord.z / gl_FragCoord.w;
        float fog_factor = exp2(-fog_density * fog_density * z * z * LOG2);
        gl_FragColor.rgb = mix(fog_color, gl_FragColor.rgb, fog_factor);
        gl_FragColor.a = 1.0;
    }
#endif
}

// scape_lines //
attribute vec3 position;
uniform mat4 mvp;
uniform vec4 color;

// scape_lines.vertex //
void main() {
    vec3 P = position.xyz;
    gl_Position = mvp * vec4(P, 1.0);
}

// scape_lines.fragment //
void main() {
    gl_FragColor = color;

#define USE_FOG
#ifdef USE_FOG
    {
        // fog
        const float LOG2 = 1.442695;
        const float fog_density = 0.1;
        float z = gl_FragCoord.z / gl_FragCoord.w;
        float fog_factor = exp2(-fog_density * fog_density * z * z * LOG2);
        gl_FragColor.a *= fog_factor;
    }
#endif
}


// rings //
attribute vec4 position;
varying float v_side;
uniform mat4 mvp;
uniform vec3 color;

// rings.vertex //
void main() {
    vec3 P = position.xyz;
    v_side = sign(position.w);
    gl_Position = mvp * vec4(P, 1.0);
}

// rings.fragment //
void main() {
    float x = 1.0 - v_side*v_side;
    gl_FragColor = vec4(color, x);
}


// missile_tube //
attribute vec4 position;
varying float v_alpha;
uniform mat4 mvp;
uniform vec3 color;
uniform float time;

// missile_tube.vertex //
void main() {
    vec3 P = position.xyz;
    v_alpha = abs(position.w);
    gl_Position = mvp * vec4(P, 1.0);
}

// missile_tube.fragment //
void main() {
    gl_FragColor.rgb = color;
    gl_FragColor.a = pow(max(0.0, sin(3.14159 * (v_alpha + (1.0 - 2.0*time)))), 3.5);
}

// connector //
attribute vec4 position;
uniform mat4 mvp;
uniform vec4 color;

// connector.vertex //
void main() {
    vec3 P = position.xyz;
    float side = position.w;
    if (side > 0.5)
        gl_Position = mvp * vec4(P, 1.0);
    else
        gl_Position = vec4(P, 1.0);
}

// connector.fragment //
void main() {
    gl_FragColor = color;
}



// hedgehog //
attribute vec2 coord;
varying vec2 v_coord;
uniform mat4 mvp;
uniform mat3 bill;
uniform vec3 position;
uniform vec2 scale;
uniform sampler2D t_color;
uniform float fade;

// hedgehog.vertex //
void main() {
    vec3 P = vec3(2.0*(coord - 0.5), 0.0);
    P.xy *= scale;
    P = bill * P;
    P += position;
    gl_Position = mvp * vec4(P, 1.0);
    v_coord = vec2(coord.x, 1.0-coord.y);
}

// hedgehog.fragment //
void main() {
    gl_FragColor = texture2D(t_color, v_coord);
    if(gl_FragColor.r == 0.0 && gl_FragColor.g == 0.0 && gl_FragColor.b == 0.0)
        gl_FragColor.a = 0.0;
    else
        gl_FragColor.a = fade;
}

// logo //
attribute vec2 coord;
varying vec2 v_texcoord;
uniform mat4 mvp;
uniform mat3 bill;
uniform vec3 pos;
uniform sampler2D t_sharp;
uniform float scale;

// logo.vertex //
void main() {
   v_texcoord = vec2(coord.x, 1.0 - coord.y);
   vec3 P = (bill * scale * vec3(2.0*(coord.x-0.5), 2.0*coord.y, 0.0)) + pos;
   gl_Position = mvp * vec4(P, 1.0);
}

// logo.fragment //
void main() {
  gl_FragColor = texture2D(t_sharp, v_texcoord);
}

// logo_pick //
attribute vec2 coord;
varying vec2 v_texcoord;
uniform mat4 mvp;
uniform mat3 bill;
uniform vec3 pos;
uniform float scale;
uniform float color;

// logo_pick.vertex //
void main() {
     v_texcoord = vec2(coord.x, 1.0 - coord.y);
     vec3 P = (bill * scale * vec3(2.0*(coord.x-0.5), 2.0*coord.y, 0.0)) + pos;
     gl_Position = mvp * vec4(P, 1.0);
}

// logo_pick.fragment //
void main() {
    gl_FragColor = vec4(color, 0.0, 0.0, 1.0);
}
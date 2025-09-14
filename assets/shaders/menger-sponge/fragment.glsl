precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;

// Camera settings
#define MAX_STEPS 100
#define MIN_DIST 0.001
#define MAX_DIST 100.0

// Rotation matrix
mat3 rotateY(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat3(
        c, 0.0, s,
        0.0, 1.0, 0.0,
        -s, 0.0, c
    );
}

mat3 rotateX(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat3(
        1.0, 0.0, 0.0,
        0.0, c, -s,
        0.0, s, c
    );
}

// Distance function for a box
float boxSDF(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

// Menger Sponge distance function
float mengerSponge(vec3 p, int iterations) {
    float d = boxSDF(p, vec3(1.0));

    float s = 1.0;
    for (int i = 0; i < 4; i++) {
        if (i >= iterations) break;

        vec3 a = mod(p * s, 2.0) - 1.0;
        s *= 3.0;
        vec3 r = abs(1.0 - 3.0 * abs(a));

        float da = max(r.x, r.y);
        float db = max(r.y, r.z);
        float dc = max(r.z, r.x);
        float c = (min(da, min(db, dc)) - 1.0) / s;

        d = max(d, c);
    }

    return d;
}

// Scene distance function
float map(vec3 p) {
    // Rotate the Menger sponge
    p = rotateY(u_time * 0.5) * rotateX(u_time * 0.3) * p;

    return mengerSponge(p, 4);
}

// Normal calculation
vec3 getNormal(vec3 p) {
    float d = map(p);
    vec2 e = vec2(0.01, 0.0);

    vec3 n = d - vec3(
        map(p - e.xyy),
        map(p - e.yxy),
        map(p - e.yyx)
    );

    return normalize(n);
}

// Ray marching
float rayMarch(vec3 ro, vec3 rd) {
    float dO = 0.0;

    for (int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * dO;
        float dS = map(p);
        dO += dS;

        if (dO > MAX_DIST || abs(dS) < MIN_DIST) break;
    }

    return dO;
}

// Lighting
float getLight(vec3 p) {
    vec3 lightPos = vec3(2.0, 4.0, -3.0);
    vec3 l = normalize(lightPos - p);
    vec3 n = getNormal(p);

    float dif = clamp(dot(n, l), 0.0, 1.0);

    // Shadow
    float d = rayMarch(p + n * 0.02, l);
    if (d < length(lightPos - p)) dif *= 0.1;

    return dif;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

    // Camera
    vec3 ro = vec3(0.0, 0.0, 3.0);  // ray origin
    vec3 rd = normalize(vec3(uv, -1.0));  // ray direction

    // Ray marching
    float d = rayMarch(ro, rd);

    vec3 col = vec3(0.0);

    if (d < MAX_DIST) {
        vec3 p = ro + rd * d;
        float dif = getLight(p);

        // Color based on position and lighting
        vec3 baseColor = vec3(0.8, 0.3, 0.1);  // Orange-red color
        col = baseColor * dif;

        // Add some ambient occlusion
        float ao = 1.0 - (float(MAX_STEPS) - d) * 0.01;
        col *= ao;

        // Add fresnel effect
        vec3 n = getNormal(p);
        float fresnel = pow(1.0 - dot(-rd, n), 2.0);
        col += fresnel * vec3(0.1, 0.4, 0.8) * 0.3;
    }

    // Gamma correction
    col = pow(col, vec3(0.4545));

    gl_FragColor = vec4(col, 1.0);
}
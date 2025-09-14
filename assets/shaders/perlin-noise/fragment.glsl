precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;

// Random function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Noise function
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth interpolation
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// Fractal Brownian Motion (FBM)
float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 0.0;

    // Loop of octaves
    for (int i = 0; i < 5; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    // Scale the coordinate system
    vec2 pos = uv * 8.0;

    // Add time for animation
    pos += vec2(u_time * 0.1, u_time * 0.05);

    // Get noise value
    float n = fbm(pos);

    // Create cloud-like colors
    vec3 color = vec3(n);

    // Color mapping for cloud effect
    color = mix(vec3(0.1, 0.2, 0.5), vec3(1.0, 0.9, 0.8), n);

    // Add some blue tint
    color.b += 0.2;

    // Increase contrast
    color = smoothstep(0.0, 1.0, color);

    gl_FragColor = vec4(color, 1.0);
}
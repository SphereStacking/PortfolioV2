precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

    // Convert to polar coordinates
    float r = length(uv);
    float a = atan(uv.y, uv.x);

    // Create tunnel effect
    float z = u_time * 2.0;
    float tunnel = 1.0 / r;

    // Add depth
    vec2 tuv = vec2(a / 3.14159 * 4.0, tunnel + z);

    // Create grid pattern
    vec2 gv = fract(tuv * 8.0) - 0.5;
    float d = length(gv);

    // Create glow effect
    float glow = 0.02 / d;

    // Add color variation based on position
    vec3 col = vec3(0.0);
    col.r = sin(tuv.y * 0.5 + u_time) * 0.5 + 0.5;
    col.g = sin(tuv.y * 0.7 + u_time * 1.2) * 0.5 + 0.5;
    col.b = sin(tuv.y * 0.3 + u_time * 0.8) * 0.5 + 0.5;

    col *= glow;

    // Add tunnel walls
    float wall = smoothstep(0.3, 0.7, abs(sin(tuv.x * 3.14159)));
    col *= wall;

    // Fade out at center
    col *= smoothstep(0.0, 0.2, r);

    // Add some fog effect
    col *= exp(-r * 0.5);

    gl_FragColor = vec4(col, 1.0);
}
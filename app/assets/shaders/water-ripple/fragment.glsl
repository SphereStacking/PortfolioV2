precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 center = vec2(0.5);
  
  float dist = distance(uv, center);
  float ripple = sin(dist * 30.0 - u_time * 5.0) * 0.5 + 0.5;
  ripple *= 1.0 - smoothstep(0.0, 0.5, dist);
  
  vec3 color = vec3(0.2, 0.5, 0.8) + vec3(ripple * 0.3);
  gl_FragColor = vec4(color, 1.0);
}
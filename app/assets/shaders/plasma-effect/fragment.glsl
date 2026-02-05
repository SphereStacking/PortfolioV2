precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
  
  float t = u_time * 0.5;
  float v1 = sin(p.x * 10.0 + t);
  float v2 = sin(10.0 * (p.x * sin(t * 0.5) + p.y * cos(t * 0.3)) + t);
  float cx = p.x + 0.5 * sin(t * 0.5);
  float cy = p.y + 0.5 * cos(t * 0.3);
  float v3 = sin(sqrt(100.0 * (cx * cx + cy * cy) + 1.0) + t);
  
  float v = v1 + v2 + v3;
  vec3 col = vec3(sin(v * 3.14), sin(v * 3.14 + 2.0), sin(v * 3.14 + 4.0));
  
  gl_FragColor = vec4(col * 0.5 + 0.5, 1.0);
}
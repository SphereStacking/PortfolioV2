precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  
  vec3 color = vec3(0.0);
  color.r = sin((uv.x + uv.y) * 3.14159 + u_time * 0.5) * 0.5 + 0.5;
  color.g = sin((uv.x - uv.y) * 3.14159 + u_time * 0.3) * 0.5 + 0.5;
  color.b = sin((uv.x + uv.y) * 3.14159 + u_time * 0.7) * 0.5 + 0.5;
  
  gl_FragColor = vec4(color, 1.0);
}
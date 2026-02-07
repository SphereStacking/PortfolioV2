precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vec2 z = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y * 3.0;
  vec2 c = vec2(0.355, 0.355) + 0.1 * vec2(cos(u_time), sin(u_time));
  
  int iter = 0;
  const int maxIter = 100;
  
  for (int i = 0; i < maxIter; i++) {
    if (dot(z, z) > 4.0) break;
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    iter++;
  }
  
  float hue = float(iter) / float(maxIter);
  vec3 color = iter == maxIter ? vec3(0.0) : hsv2rgb(vec3(hue, 1.0, 1.0));
  
  gl_FragColor = vec4(color, 1.0);
}
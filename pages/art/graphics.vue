<script setup>
// 直接コンテンツを定義
const shaders = [
  {
    id: '01-rotating-cube',
    title: 'Rotating Cube',
    description: 'A classic WebGL demo featuring a rotating colorful cube',
    type: 'webgl',
    tags: ['3D', 'basic', 'geometry'],
    vertexShader: `
attribute vec4 a_position;
attribute vec4 a_color;
varying vec4 v_color;
uniform mat4 u_matrix;

void main() {
  gl_Position = u_matrix * a_position;
  v_color = a_color;
}`,
    fragmentShader: `
precision mediump float;
varying vec4 v_color;

void main() {
  gl_FragColor = v_color;
}`,
    geometry: 'cube',
    animation: 'rotate-y',
  },
  {
    id: '02-wave-effect',
    title: 'Wave Effect',
    description: 'Animated wave effect using vertex shader displacement',
    type: 'webgl',
    tags: ['animation', 'vertex-shader', 'wave'],
    vertexShader: `
attribute vec3 a_position;
uniform float u_time;
uniform mat4 u_matrix;
varying vec3 v_position;

void main() {
  vec3 pos = a_position;
  float wave = sin(pos.x * 5.0 + u_time) * 0.1;
  wave += sin(pos.z * 3.0 + u_time * 0.8) * 0.05;
  pos.y += wave;
  
  gl_Position = u_matrix * vec4(pos, 1.0);
  v_position = pos;
}`,
    fragmentShader: `
precision mediump float;
varying vec3 v_position;

void main() {
  vec3 color = vec3(0.2, 0.6, 1.0);
  color *= (v_position.y + 0.5);
  gl_FragColor = vec4(color, 1.0);
}`,
    geometry: 'plane',
    animation: 'time',
  },
  {
    id: '03-fractal',
    title: 'Fractal Shader',
    description: 'Mandelbrot set visualization using fragment shaders',
    type: 'webgl',
    tags: ['fractal', 'fragment-shader', 'math'],
    vertexShader: `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_uv = a_position * 0.5 + 0.5;
}`,
    fragmentShader: `
precision highp float;
varying vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vec2 c = (v_uv - 0.5) * 3.0 - vec2(0.5, 0.0);
  c *= 1.0 + sin(u_time * 0.1) * 0.5;
  
  vec2 z = vec2(0.0);
  float iter = 0.0;
  
  for(int i = 0; i < 100; i++) {
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    if(length(z) > 2.0) break;
    iter++;
  }
  
  float hue = iter / 100.0;
  vec3 color = hsv2rgb(vec3(hue + u_time * 0.01, 0.8, 1.0));
  
  gl_FragColor = vec4(color * (1.0 - iter / 100.0), 1.0);
}`,
    geometry: 'fullscreen',
    animation: 'time',
  },
  {
    id: '04-raymarching',
    title: 'Raymarching Scene',
    description: '3D scene rendered using raymarching technique',
    type: 'webgl',
    tags: ['raymarching', '3D', 'advanced'],
    vertexShader: `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_uv = a_position;
}`,
    fragmentShader: `
precision highp float;
varying vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;

float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float map(vec3 p) {
  float sphere = sdSphere(p - vec3(0.0, 0.0, 0.0), 1.0);
  float box = sdBox(p - vec3(2.0 * sin(u_time), 0.0, 0.0), vec3(0.5));
  float ground = p.y + 1.5;
  
  return min(min(sphere, box), ground);
}

vec3 getNormal(vec3 p) {
  float e = 0.001;
  return normalize(vec3(
    map(p + vec3(e, 0, 0)) - map(p - vec3(e, 0, 0)),
    map(p + vec3(0, e, 0)) - map(p - vec3(0, e, 0)),
    map(p + vec3(0, 0, e)) - map(p - vec3(0, 0, e))
  ));
}

void main() {
  vec3 ro = vec3(0.0, 1.0, 3.0);
  vec3 rd = normalize(vec3(v_uv, -1.0));
  
  float angle = u_time * 0.5;
  mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  ro.xz = rot * ro.xz;
  rd.xz = rot * rd.xz;
  
  float t = 0.0;
  for(int i = 0; i < 100; i++) {
    vec3 p = ro + rd * t;
    float d = map(p);
    if(d < 0.001) break;
    t += d;
    if(t > 20.0) break;
  }
  
  vec3 color = vec3(0.1, 0.1, 0.2);
  
  if(t < 20.0) {
    vec3 p = ro + rd * t;
    vec3 n = getNormal(p);
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    
    float diff = max(dot(n, lightDir), 0.0);
    vec3 objColor = vec3(0.8, 0.5, 0.3);
    color = objColor * diff + vec3(0.1) * objColor;
  }
  
  gl_FragColor = vec4(color, 1.0);
}`,
    geometry: 'fullscreen',
    animation: 'time',
  },
]

const selectedShader = ref(null)
const showDemo = ref(false)

function selectShader(shader) {
  selectedShader.value = shader
  showDemo.value = true
}
</script>

<template>
  <div class="min-h-screen pb-16">
    <PageHeader :ui="{ headerColor: 'bg-gradient-to-r from-purple-800/70 via-blue-600/70 to-pink-500/70' }">
      <template #title>
        Graphics Programming
      </template>
    </PageHeader>

    <div class="container md:mx-auto px-2 mb-16 mt-8">
      <div class="space-y-8">
        <!-- Introduction -->
        <Card>
          <CardHeader>
            <CardTitle>Shader Gallery</CardTitle>
          </CardHeader>
          <CardContent class="prose prose-zinc dark:prose-invert max-w-none">
            <p>
              WebGL shader experiments showcasing various GPU programming techniques.
              Click on any card to see the live demo and shader code.
            </p>
          </CardContent>
        </Card>

        <!-- Shader Gallery -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            v-for="shader in shaders"
            :key="shader.id"
            class="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            @click="selectShader(shader)">
            <CardHeader>
              <CardTitle class="text-lg">
                {{ shader.title }}
              </CardTitle>
              <CardDescription>{{ shader.description }}</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="flex flex-wrap gap-2">
                <Badge
                  v-for="tag in shader.tags" :key="tag" variant="outline"
                  class="text-xs">
                  {{ tag }}
                </Badge>
              </div>
            </CardContent>
            <CardFooter>
              <Badge :variant="shader.type === 'webgl' ? 'default' : 'secondary'">
                {{ shader.type.toUpperCase() }}
              </Badge>
            </CardFooter>
          </Card>
        </div>

        <!-- Selected Shader Demo -->
        <Card v-if="selectedShader && showDemo" class="mt-8">
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>{{ selectedShader.title }}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                @click="showDemo = false">
                <Icon name="lucide:x" class="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ShaderDemo
              :type="selectedShader.type"
              :vertex-shader="selectedShader.vertexShader"
              :fragment-shader="selectedShader.fragmentShader"
              :geometry="selectedShader.geometry"
              :animation="selectedShader.animation" />
          </CardContent>
        </Card>

        <!-- Shader Code -->
        <div v-if="selectedShader && showDemo" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">
                Vertex Shader
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre class="bg-zinc-900 p-4 rounded-lg overflow-x-auto text-sm"><code>{{ selectedShader.vertexShader }}</code></pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle class="text-lg">
                Fragment Shader
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre class="bg-zinc-900 p-4 rounded-lg overflow-x-auto text-sm"><code>{{ selectedShader.fragmentShader }}</code></pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
pre {
  font-family: 'Fira Code', 'Consolas', monospace;
  line-height: 1.5;
}

code {
  color: #e4e4e7;
}
</style>

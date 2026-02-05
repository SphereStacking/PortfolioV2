<template>
  <div ref="containerRef" class="relative h-full w-full bg-black group">
    <canvas
      ref="canvasRef"
      class="block h-full w-full cursor-pointer"
      @click="handleCanvasClick"></canvas>

    <!-- Center play button when paused -->
    <div
      v-if="!isPlaying && !error"
      class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div
        class="bg-black/70 rounded-full p-4 pointer-events-auto cursor-pointer hover:bg-black/80 transition-colors"
        @click="togglePlayPause">
        <Icon name="lucide:play" class="h-12 w-12 text-white" />
      </div>
    </div>

    <!-- YouTube-style gradient overlays -->
    <div class="absolute inset-0 pointer-events-none">
      <!-- Top gradient -->
      <div class="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
      <!-- Bottom gradient -->
      <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
    </div>

    <!-- Top bar with title -->
    <div class="absolute top-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <h3 class="text-white font-medium">
        {{ shader.title }}
      </h3>
    </div>

    <!-- YouTube-style bottom controls -->
    <div class="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <!-- Progress bar -->
      <div class="px-3 pb-1">
        <div class="relative group/progress">
          <div
            class="h-1 bg-white/30 rounded-full cursor-pointer hover:h-1.5 transition-all"
            @mousedown="startSeeking"
            @click="seekTo">
            <div
              class="h-full bg-primary rounded-full relative"
              :style="{ width: `${progressPercentage}%` }">
              <div class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Control buttons -->
      <div class="flex items-center justify-between px-3 pb-3">
        <!-- Left controls -->
        <div class="flex items-center gap-3">
          <!-- Play/Pause -->
          <button
            class="text-white hover:text-white/80 transition-colors"
            @click="togglePlayPause">
            <Icon :name="isPlaying ? 'lucide:pause' : 'lucide:play'" class="h-6 w-6" />
          </button>

          <!-- Volume (styled as quality control) -->
          <div class="flex items-center gap-2 group/volume">
            <button class="text-white hover:text-white/80 transition-colors">
              <Icon name="lucide:volume-2" class="h-6 w-6" />
            </button>
            <div class="w-0 group-hover/volume:w-20 overflow-hidden transition-all duration-200">
              <Slider
                v-model="volumeValue"
                :max="100"
                :step="1"
                class="w-full" />
            </div>
          </div>

          <!-- Time display -->
          <div class="text-white text-sm font-mono">
            {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
          </div>
        </div>

        <!-- Right controls -->
        <div class="flex items-center gap-2">
          <!-- Settings -->
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <button class="text-white hover:text-white/80 transition-colors">
                <Icon name="lucide:settings" class="h-6 w-6" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-48">
              <DropdownMenuLabel>再生速度</DropdownMenuLabel>
              <DropdownMenuRadioGroup v-model="playbackSpeed">
                <DropdownMenuRadioItem value="0.25">
                  0.25x
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="0.5">
                  0.5x
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="1">
                  標準
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="1.5">
                  1.5x
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="2">
                  2x
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>画質</DropdownMenuLabel>
              <DropdownMenuRadioGroup v-model="quality">
                <DropdownMenuRadioItem value="low">
                  低画質 (360p)
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="medium">
                  中画質 (720p)
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="high">
                  高画質 (1080p)
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="auto">
                  自動
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>FPS制限</DropdownMenuLabel>
              <DropdownMenuRadioGroup v-model="targetFps">
                <DropdownMenuRadioItem value="30">
                  30 FPS
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="60">
                  60 FPS
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="120">
                  120 FPS
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <!-- Fullscreen -->
          <button
            class="text-white hover:text-white/80 transition-colors"
            title="フルスクリーン"
            @click="toggleFullscreen">
            <Icon :name="isFullscreen ? 'lucide:minimize' : 'lucide:maximize'" class="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- FPS counter (top right) -->
    <div
      v-if="showFps"
      class="absolute right-4 top-4 bg-black/70 rounded px-2 py-1 text-xs font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      {{ fps }} FPS
    </div>

    <!-- Error state -->
    <div v-if="error" class="absolute inset-0 flex items-center justify-center bg-black/90">
      <div class="text-center">
        <Icon name="lucide:alert-circle" class="mx-auto mb-2 h-12 w-12 text-red-500" />
        <p class="text-white">
          {{ error }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShaderMetadata } from '~/data/shaderMetadata'
import { Slider } from '~/components/ui/slider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

interface Props {
  shader: ShaderMetadata
  autoplay?: boolean
  showFps?: boolean
  initialQuality?: 'low' | 'medium' | 'high' | 'auto'
}

const props = withDefaults(defineProps<Props>(), {
  autoplay: false,
  showFps: true,
  initialQuality: 'auto',
})

const containerRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLCanvasElement>()
const isPlaying = ref(props.autoplay)
const quality = ref(props.initialQuality)
const fps = ref(0)
const error = ref<string>()
const playbackSpeed = ref('1')
const targetFps = ref('60')
const startTime = ref(0)
const currentTime = ref(0)
const duration = ref(30) // Default 30 seconds duration for shaders
const volumeValue = ref([75]) // Volume control (visual only for shaders)
const isFullscreen = ref(false)
const progressPercentage = ref(0)
const isSeeking = ref(false)
const wasPlayingBeforeSeek = ref(false)

let gl: WebGLRenderingContext | null = null
let program: WebGLProgram | null = null
let animationId: number | null = null
let lastTime = 0
let frameCount = 0

// Quality settings
const qualitySettings = {
  low: { scale: 0.5, targetFps: 30 },
  medium: { scale: 0.75, targetFps: 30 },
  high: { scale: 1, targetFps: 60 },
  auto: { scale: 1, targetFps: 60 }, // Will be determined based on device
}

// FPS throttling
let lastFrameTime = 0
const getFrameInterval = () => 1000 / Number(targetFps.value)

// Shader loading
async function loadShader(type: 'vertex' | 'fragment'): Promise<string> {
  const shaderSources = useShaderSources()
  const shaderSet = shaderSources[props.shader.id]
  if (!shaderSet) {
    throw new Error(`Shader ${props.shader.id} not found in registry`)
  }
  return shaderSet[type]
}

// WebGL initialization
async function initWebGL() {
  if (!canvasRef.value)
    return

  try {
    gl = canvasRef.value.getContext('webgl') || canvasRef.value.getContext('experimental-webgl')
    if (!gl)
      throw new Error('WebGL not supported')

    // Load shaders
    const vertexSource = await loadShader('vertex')
    const fragmentSource = await loadShader('fragment')

    // Create shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource)

    if (!vertexShader || !fragmentShader)
      throw new Error('Failed to create shaders')

    // Create program
    program = createProgram(gl, vertexShader, fragmentShader)
    if (!program)
      throw new Error('Failed to create shader program')

    // Initialize shader-specific setup
    setupShader()

    // Initialize start time
    startTime.value = performance.now()

    // Start render loop if autoplay
    if (isPlaying.value) {
      startRenderLoop()
    }
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to initialize WebGL'
    console.error('WebGL initialization error:', e)
  }
}

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader)
    return null

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(`Shader compile error for ${props.shader.id}:`, gl.getShaderInfoLog(shader))
    console.error('Shader source:', source)
    gl.deleteShader(shader)
    return null
  }

  return shader
}

function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
  const program = gl.createProgram()
  if (!program)
    return null

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }

  return program
}

// Shader-specific setup
function setupShader() {
  if (!gl || !program)
    return

  // Setup based on shader type
  if (props.shader.id === 'rotating-cube') {
    setupCubeGeometry()
  }
  else if (props.shader.id === 'wave-effect') {
    setupWaveGeometry()
  }
  else if (props.shader.id === 'particle-flow' || props.shader.id === 'starfield') {
    setupParticleGeometry()
  }
  else if (props.shader.id === 'noise-terrain') {
    setupTerrainGeometry()
  }
  else if (props.shader.id === 'torus-knot') {
    setupTorusKnotGeometry()
  }
  else if (props.shader.id === 'galaxy-spiral') {
    setupGalaxyGeometry()
  }
  else {
    // Default to fullscreen quad for 2D effects
    setupFullscreenQuad()
  }
}

function setupCubeGeometry() {
  if (!gl) return
  const positions = new Float32Array([
    // Front face
    -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
    // Back face
    -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1,
    // Top face
    -1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1,
    // Bottom face
    -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1,
    // Right face
    1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1,
    // Left face
    -1, -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1,
  ])

  const colors = new Float32Array([
    // Front face - red
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
    // Back face - green
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
    // Top face - blue
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    // Bottom face - yellow
    1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0,
    // Right face - purple
    1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
    // Left face - cyan
    0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1,
  ])

  const indices = new Uint16Array([
    0, 1, 2, 0, 2, 3, // front
    4, 5, 6, 4, 6, 7, // back
    8, 9, 10, 8, 10, 11, // top
    12, 13, 14, 12, 14, 15, // bottom
    16, 17, 18, 16, 18, 19, // right
    20, 21, 22, 20, 22, 23, // left
  ])

  // Create buffers
  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

  const colorBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW)

  const indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

  // Store buffers for render loop
  const glWithBuffers = gl as WebGLRenderingContext & {
    buffers: {
      position: WebGLBuffer | null
      color: WebGLBuffer | null
      index: WebGLBuffer | null
      count: number
    }
  }
  glWithBuffers.buffers = {
    position: positionBuffer,
    color: colorBuffer,
    index: indexBuffer,
    count: indices.length,
  }
}

function setupParticleGeometry() {
  if (!gl) return

  // Create random particle positions and velocities
  const particleCount = 1000
  const positions = new Float32Array(particleCount * 3)
  const velocities = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 10
    positions[i + 1] = (Math.random() - 0.5) * 10
    positions[i + 2] = (Math.random() - 0.5) * 10

    velocities[i] = (Math.random() - 0.5) * 0.1
    velocities[i + 1] = Math.random() * 0.2
    velocities[i + 2] = (Math.random() - 0.5) * 0.1
  }

  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

  const velocityBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, velocityBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, velocities, gl.STATIC_DRAW)

  const glWithBuffers = gl as WebGLRenderingContext & {
    buffers: {
      position: WebGLBuffer | null
      velocity?: WebGLBuffer | null
      color?: WebGLBuffer | null
      index?: WebGLBuffer | null
      count: number
      drawMode?: number
    }
  }
  glWithBuffers.buffers = {
    position: positionBuffer,
    velocity: velocityBuffer,
    color: null,
    index: null,
    count: particleCount,
    drawMode: gl.POINTS,
  }
}

function setupFullscreenQuad() {
  if (!gl) return

  const positions = new Float32Array([
    -1, -1,
    1, -1,
    1, 1,
    -1, 1,
  ])

  const indices = new Uint16Array([0, 1, 2, 0, 2, 3])

  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

  const indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

  const glWithBuffers = gl as WebGLRenderingContext & {
    buffers: {
      position: WebGLBuffer | null
      color: WebGLBuffer | null
      index: WebGLBuffer | null
      count: number
      positionSize?: number
    }
  }
  glWithBuffers.buffers = {
    position: positionBuffer,
    color: null,
    index: indexBuffer,
    count: indices.length,
    positionSize: 2, // 2D positions
  }
}

function setupWaveGeometry() {
  if (!gl) return

  const gridSize = 50
  const positions: number[] = []
  const colors: number[] = []
  const indices: number[] = []

  // Create grid vertices
  for (let z = 0; z < gridSize; z++) {
    for (let x = 0; x < gridSize; x++) {
      const xPos = (x / (gridSize - 1) - 0.5) * 10
      const zPos = (z / (gridSize - 1) - 0.5) * 10

      positions.push(xPos, 0, zPos)

      // Create gradient colors
      const r = x / (gridSize - 1)
      const g = 0.5
      const b = z / (gridSize - 1)
      colors.push(r, g, b)
    }
  }

  // Create indices for triangles
  for (let z = 0; z < gridSize - 1; z++) {
    for (let x = 0; x < gridSize - 1; x++) {
      const topLeft = z * gridSize + x
      const topRight = topLeft + 1
      const bottomLeft = (z + 1) * gridSize + x
      const bottomRight = bottomLeft + 1

      indices.push(topLeft, bottomLeft, topRight)
      indices.push(topRight, bottomLeft, bottomRight)
    }
  }

  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

  const colorBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)

  const indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

  const glWithBuffers = gl as WebGLRenderingContext & {
    buffers: {
      position: WebGLBuffer | null
      color: WebGLBuffer | null
      index: WebGLBuffer | null
      count: number
    }
  }
  glWithBuffers.buffers = {
    position: positionBuffer,
    color: colorBuffer,
    index: indexBuffer,
    count: indices.length,
  }
}

function setupTerrainGeometry() {
  if (!gl) return

  const gridSize = 50
  const positions: number[] = []
  const indices: number[] = []

  // Create grid vertices
  for (let z = 0; z < gridSize; z++) {
    for (let x = 0; x < gridSize; x++) {
      positions.push(
        (x / (gridSize - 1) - 0.5) * 10,
        0,
        (z / (gridSize - 1) - 0.5) * 10,
      )
    }
  }

  // Create indices
  for (let z = 0; z < gridSize - 1; z++) {
    for (let x = 0; x < gridSize - 1; x++) {
      const topLeft = z * gridSize + x
      const topRight = topLeft + 1
      const bottomLeft = (z + 1) * gridSize + x
      const bottomRight = bottomLeft + 1

      indices.push(topLeft, bottomLeft, topRight)
      indices.push(topRight, bottomLeft, bottomRight)
    }
  }

  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

  const indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

  const glWithBuffers = gl as WebGLRenderingContext & {
    buffers: {
      position: WebGLBuffer | null
      color: WebGLBuffer | null
      index: WebGLBuffer | null
      count: number
    }
  }
  glWithBuffers.buffers = {
    position: positionBuffer,
    color: null,
    index: indexBuffer,
    count: indices.length,
  }
}

function setupTorusKnotGeometry() {
  if (!gl) return

  const positions: number[] = []
  const normals: number[] = []
  const indices: number[] = []

  const p = 3, q = 2
  const _torusRadius = 1.5
  const tubeRadius = 0.5
  const segments = 100
  const tubeSegments = 30

  for (let i = 0; i <= segments; i++) {
    const u = (i / segments) * Math.PI * 2 * p
    const cu = Math.cos(u)
    const su = Math.sin(u)

    const x1 = (2 + Math.cos(q * u / p)) * cu / 3
    const y1 = Math.sin(q * u / p) / 3
    const z1 = (2 + Math.cos(q * u / p)) * su / 3

    for (let j = 0; j <= tubeSegments; j++) {
      const v = (j / tubeSegments) * Math.PI * 2
      const cv = Math.cos(v)
      const sv = Math.sin(v)

      positions.push(x1 + tubeRadius * cv * cu, y1 + tubeRadius * sv, z1 + tubeRadius * cv * su)
      normals.push(cv * cu, sv, cv * su)
    }
  }

  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < tubeSegments; j++) {
      const a = i * (tubeSegments + 1) + j
      const b = a + tubeSegments + 1

      indices.push(a, b, a + 1)
      indices.push(b, b + 1, a + 1)
    }
  }

  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

  const normalBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW)

  const indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

  const glWithBuffers = gl as WebGLRenderingContext & {
    buffers: {
      position: WebGLBuffer | null
      normal?: WebGLBuffer | null
      color: WebGLBuffer | null
      index: WebGLBuffer | null
      count: number
    }
  }
  glWithBuffers.buffers = {
    position: positionBuffer,
    normal: normalBuffer,
    color: null,
    index: indexBuffer,
    count: indices.length,
  }
}

function setupGalaxyGeometry() {
  if (!gl) return

  const particleCount = 5000
  const positions = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount * 3; i += 3) {
    const angle = Math.random() * Math.PI * 2
    const radius = Math.random() * 5
    const offset = Math.random()

    positions[i] = angle
    positions[i + 1] = radius
    positions[i + 2] = offset
  }

  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

  const glWithBuffers = gl as WebGLRenderingContext & {
    buffers: {
      position: WebGLBuffer | null
      color: WebGLBuffer | null
      index: WebGLBuffer | null
      count: number
      drawMode?: number
    }
  }
  glWithBuffers.buffers = {
    position: positionBuffer,
    color: null,
    index: null,
    count: particleCount,
    drawMode: gl.POINTS,
  }
}

// Render loop
function render(time: number) {
  if (!gl || !program || !isPlaying.value)
    return

  // FPS throttling
  if (time - lastFrameTime < getFrameInterval()) {
    animationId = requestAnimationFrame(render)
    return
  }
  lastFrameTime = time

  // FPS calculation
  frameCount++
  if (time - lastTime >= 1000) {
    fps.value = Math.round((frameCount * 1000) / (time - lastTime))
    frameCount = 0
    lastTime = time
  }

  // Update time and progress (only if not seeking)
  if (!isSeeking.value) {
    const elapsedTime = (time - startTime.value) * Number(playbackSpeed.value) * 0.001
    currentTime.value = elapsedTime % duration.value
    progressPercentage.value = (currentTime.value / duration.value) * 100
  }

  // Clear canvas
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.enable(gl.DEPTH_TEST)

  // Use program
  gl.useProgram(program)

  // Get uniform locations
  const projectionLocation = gl.getUniformLocation(program, 'u_projectionMatrix')
  const modelViewLocation = gl.getUniformLocation(program, 'u_modelViewMatrix')
  const timeLocation = gl.getUniformLocation(program, 'u_time')
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')

  // Set time uniform with speed control
  if (timeLocation !== null) {
    const adjustedTime = (time - startTime.value) * Number(playbackSpeed.value) * 0.001
    gl.uniform1f(timeLocation, adjustedTime)
  }

  // Set resolution uniform
  if (resolutionLocation !== null) {
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height)
  }

  // Set matrix uniforms for 3D shaders
  if (projectionLocation !== null && modelViewLocation !== null) {
    const aspect = gl.canvas.width / gl.canvas.height
    const projectionMatrix = perspective(45 * Math.PI / 180, aspect, 0.1, 100)
    const adjustedTime = (time - startTime.value) * Number(playbackSpeed.value) * 0.001
    const modelViewMatrix = multiply(
      translate([0, 0, -6]),
      multiply(
        rotateY(adjustedTime),
        rotateX(adjustedTime * 0.7),
      ),
    )
    gl.uniformMatrix4fv(projectionLocation, false, projectionMatrix)
    gl.uniformMatrix4fv(modelViewLocation, false, modelViewMatrix)
  }

  // Bind buffers and draw
  const glWithBuffers = gl as WebGLRenderingContext & {
    buffers?: {
      position: WebGLBuffer | null
      color: WebGLBuffer | null
      index: WebGLBuffer | null
      count: number
    }
  }
  const buffers = glWithBuffers.buffers
  if (buffers) {
    // Position attribute
    const positionLocation = gl.getAttribLocation(program, 'a_position')
    if (positionLocation >= 0 && buffers.position) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
      gl.enableVertexAttribArray(positionLocation)
      // Use 2D positions for fullscreen shaders
      const positionSize = ('positionSize' in buffers && buffers.positionSize)
        || ['fractal-explorer', 'color-gradient', 'plasma-effect', 'rainbow-vortex', 'julia-set', 'matrix-rain', 'fire-effect', 'water-ripple'].includes(props.shader.id)
        ? 2
        : 3
      gl.vertexAttribPointer(positionLocation, positionSize, gl.FLOAT, false, 0, 0)
    }

    // Color attribute
    const colorLocation = gl.getAttribLocation(program, 'a_color')
    if (colorLocation >= 0 && buffers.color) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color)
      gl.enableVertexAttribArray(colorLocation)
      gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0)
    }

    // Normal attribute for torus knot
    if ('normal' in buffers) {
      const normalLocation = gl.getAttribLocation(program, 'a_normal')
      if (normalLocation >= 0 && buffers.normal) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal)
        gl.enableVertexAttribArray(normalLocation)
        gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0)
      }
    }

    // Draw
    if (buffers.index) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index)
      gl.drawElements(gl.TRIANGLES, buffers.count, gl.UNSIGNED_SHORT, 0)
    }
    else {
      // For particle systems or other non-indexed geometry
      const drawMode = 'drawMode' in buffers && buffers.drawMode ? buffers.drawMode : gl.TRIANGLES
      gl.drawArrays(drawMode, 0, buffers.count)
    }
  }

  animationId = requestAnimationFrame(render)
}

function startRenderLoop() {
  if (animationId !== null)
    return
  animationId = requestAnimationFrame(render)
}

function stopRenderLoop() {
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
}

// Controls
function togglePlayPause() {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    startRenderLoop()
  }
  else {
    stopRenderLoop()
  }
}

function toggleFullscreen() {
  if (!containerRef.value)
    return

  if (document.fullscreenElement) {
    document.exitFullscreen()
    isFullscreen.value = false
  }
  else {
    containerRef.value.requestFullscreen()
    isFullscreen.value = true
  }
}

// Format time for display
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Seek to position on progress bar click
function seekTo(event: MouseEvent) {
  if (isSeeking.value) return // Skip if already seeking via drag

  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const percentage = clickX / rect.width
  const seekTime = percentage * duration.value

  // Update start time to simulate seeking
  startTime.value = performance.now() - (seekTime / Number(playbackSpeed.value)) * 1000
  currentTime.value = seekTime
  progressPercentage.value = percentage * 100
}

// Start seeking (mousedown on progress bar)
function startSeeking(event: MouseEvent) {
  event.preventDefault()
  isSeeking.value = true
  wasPlayingBeforeSeek.value = isPlaying.value

  // Pause playback during seeking
  if (isPlaying.value) {
    isPlaying.value = false
    stopRenderLoop()
  }

  // Handle initial position
  updateSeekPosition(event)

  // Add document-level listeners for drag
  document.addEventListener('mousemove', handleSeekDrag)
  document.addEventListener('mouseup', endSeeking)
}

// Handle seek dragging
function handleSeekDrag(event: MouseEvent) {
  if (!isSeeking.value) return
  updateSeekPosition(event)
}

// Update seek position during drag
function updateSeekPosition(event: MouseEvent) {
  const progressBar = containerRef.value?.querySelector('[class*="bg-white/30"]') as HTMLElement
  if (!progressBar) return

  const rect = progressBar.getBoundingClientRect()
  const clickX = Math.max(0, Math.min(event.clientX - rect.left, rect.width))
  const percentage = clickX / rect.width
  const seekTime = percentage * duration.value

  // Update visual progress immediately
  progressPercentage.value = percentage * 100
  currentTime.value = seekTime
}

// End seeking (mouseup)
function endSeeking() {
  if (!isSeeking.value) return

  isSeeking.value = false

  // Update the actual playback position
  const seekTime = currentTime.value
  startTime.value = performance.now() - (seekTime / Number(playbackSpeed.value)) * 1000

  // Resume playback if it was playing before
  if (wasPlayingBeforeSeek.value) {
    isPlaying.value = true
    startRenderLoop()
  }

  // Remove document-level listeners
  document.removeEventListener('mousemove', handleSeekDrag)
  document.removeEventListener('mouseup', endSeeking)
}

function handleCanvasClick() {
  togglePlayPause()
}

// Resize handling
function handleResize() {
  if (!canvasRef.value || !gl)
    return

  const settings = qualitySettings[quality.value]
  const rect = canvasRef.value.getBoundingClientRect()
  const width = rect.width * settings.scale
  const height = rect.height * settings.scale

  canvasRef.value.width = width
  canvasRef.value.height = height
  gl.viewport(0, 0, width, height)
}

// Matrix utilities (simplified)
function perspective(fov: number, aspect: number, near: number, far: number): Float32Array {
  const f = Math.tan(Math.PI * 0.5 - 0.5 * fov)
  const rangeInv = 1.0 / (near - far)

  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (near + far) * rangeInv, -1,
    0, 0, near * far * rangeInv * 2, 0,
  ])
}

function translate(t: number[]): Float32Array {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    t[0], t[1], t[2], 1,
  ])
}

function rotateX(angle: number): Float32Array {
  const s = Math.sin(angle)
  const c = Math.cos(angle)

  return new Float32Array([
    1, 0, 0, 0,
    0, c, s, 0,
    0, -s, c, 0,
    0, 0, 0, 1,
  ])
}

function rotateY(angle: number): Float32Array {
  const s = Math.sin(angle)
  const c = Math.cos(angle)

  return new Float32Array([
    c, 0, -s, 0,
    0, 1, 0, 0,
    s, 0, c, 0,
    0, 0, 0, 1,
  ])
}

function multiply(a: Float32Array, b: Float32Array): Float32Array {
  const result = new Float32Array(16)

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      let sum = 0
      for (let k = 0; k < 4; k++) {
        sum += a[i * 4 + k] * b[k * 4 + j]
      }
      result[i * 4 + j] = sum
    }
  }

  return result
}

// Lifecycle
onMounted(() => {
  initWebGL()
  handleResize()
  window.addEventListener('resize', handleResize)

  // Listen for fullscreen changes
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
})

onUnmounted(() => {
  stopRenderLoop()
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })

  if (gl && program) {
    gl.deleteProgram(program)
  }
})

// Watch quality changes
watch(quality, () => {
  handleResize()
})
</script>

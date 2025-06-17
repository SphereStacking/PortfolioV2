<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: value => ['webgl', 'webgpu'].includes(value),
  },
  vertexShader: String,
  fragmentShader: String,
  computeShader: String,
  geometry: {
    type: String,
    default: 'cube',
  },
  animation: {
    type: String,
    default: 'rotate-y',
  },
  particleCount: {
    type: Number,
    default: 1000,
  },
})

const canvasRef = ref(null)
const errorMessage = ref('')
let animationId = null
let gl = null
let gpuDevice = null
let gpuContext = null

// Common utilities
function createRotationMatrix(angleX, angleY, angleZ) {
  const cx = Math.cos(angleX)
  const sx = Math.sin(angleX)
  const cy = Math.cos(angleY)
  const sy = Math.sin(angleY)
  const cz = Math.cos(angleZ)
  const sz = Math.sin(angleZ)

  return new Float32Array([
    cy * cz, sx * sy * cz - cx * sz, cx * sy * cz + sx * sz, 0,
    cy * sz, sx * sy * sz + cx * cz, cx * sy * sz - sx * cz, 0,
    -sy, sx * cy, cx * cy, 0,
    0, 0, 0, 1,
  ])
}

// Geometry generators
function createCubeGeometry() {
  const positions = new Float32Array([
    // Front face
    -0.5, -0.5, 0.5,
    0.5, -0.5, 0.5,
    0.5, 0.5, 0.5,
    -0.5, 0.5, 0.5,
    // Back face
    -0.5, -0.5, -0.5,
    -0.5, 0.5, -0.5,
    0.5, 0.5, -0.5,
    0.5, -0.5, -0.5,
    // Top face
    -0.5, 0.5, -0.5,
    -0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, -0.5,
    // Bottom face
    -0.5, -0.5, -0.5,
    0.5, -0.5, -0.5,
    0.5, -0.5, 0.5,
    -0.5, -0.5, 0.5,
    // Right face
    0.5, -0.5, -0.5,
    0.5, 0.5, -0.5,
    0.5, 0.5, 0.5,
    0.5, -0.5, 0.5,
    // Left face
    -0.5, -0.5, -0.5,
    -0.5, -0.5, 0.5,
    -0.5, 0.5, 0.5,
    -0.5, 0.5, -0.5,
  ])

  const colors = new Float32Array([
    1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0,
    1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0,
    1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0,
    0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0,
  ])

  const indices = new Uint16Array([
    0, 1, 2, 0, 2, 3,
    4, 5, 6, 4, 6, 7,
    8, 9, 10, 8, 10, 11,
    12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19,
    20, 21, 22, 20, 22, 23,
  ])

  return { positions, colors, indices }
}

function createPlaneGeometry() {
  const size = 20
  const divisions = 50
  const positions = []

  for (let i = 0; i <= divisions; i++) {
    for (let j = 0; j <= divisions; j++) {
      const x = (i / divisions - 0.5) * size
      const z = (j / divisions - 0.5) * size
      positions.push(x, 0, z)
    }
  }

  const indices = []
  for (let i = 0; i < divisions; i++) {
    for (let j = 0; j < divisions; j++) {
      const a = i * (divisions + 1) + j
      const b = a + 1
      const c = a + divisions + 1
      const d = c + 1
      indices.push(a, b, c, b, d, c)
    }
  }

  return {
    positions: new Float32Array(positions),
    colors: null,
    indices: new Uint16Array(indices),
  }
}

function createFullscreenGeometry() {
  return {
    positions: new Float32Array([
      -1, -1,
      1, -1,
      1, 1,
      -1, 1,
    ]),
    indices: new Uint16Array([0, 1, 2, 0, 2, 3]),
  }
}

// WebGL implementation
function createWebGLShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compilation error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }

  return shader
}

function createWebGLProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program linking error:', gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }

  return program
}

function initWebGL() {
  if (!canvasRef.value || !props.vertexShader || !props.fragmentShader) return

  gl = canvasRef.value.getContext('webgl') || canvasRef.value.getContext('experimental-webgl')
  if (!gl) {
    errorMessage.value = 'WebGL is not supported in your browser'
    return
  }

  const vertexShader = createWebGLShader(gl, gl.VERTEX_SHADER, props.vertexShader)
  const fragmentShader = createWebGLShader(gl, gl.FRAGMENT_SHADER, props.fragmentShader)
  if (!vertexShader || !fragmentShader) return

  const program = createWebGLProgram(gl, vertexShader, fragmentShader)
  if (!program) return

  // Get geometry
  let geometry
  if (props.geometry === 'plane') {
    geometry = createPlaneGeometry()
  }
  else if (props.geometry === 'fullscreen') {
    geometry = createFullscreenGeometry()
  }
  else {
    geometry = createCubeGeometry()
  }

  // Create buffers
  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, geometry.positions, gl.STATIC_DRAW)

  let colorBuffer = null
  if (geometry.colors) {
    colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, geometry.colors, gl.STATIC_DRAW)
  }

  const indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW)

  // Get attribute/uniform locations
  const positionLocation = gl.getAttribLocation(program, 'a_position')
  const colorLocation = geometry.colors ? gl.getAttribLocation(program, 'a_color') : -1
  const matrixLocation = gl.getUniformLocation(program, 'u_matrix')
  const timeLocation = gl.getUniformLocation(program, 'u_time')
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')

  const rotation = { x: 0, y: 0, z: 0 }
  const startTime = Date.now()

  function render() {
    const width = canvasRef.value.clientWidth
    const height = canvasRef.value.clientHeight
    if (canvasRef.value.width !== width || canvasRef.value.height !== height) {
      canvasRef.value.width = width
      canvasRef.value.height = height
    }

    gl.viewport(0, 0, width, height)
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    if (props.geometry !== 'fullscreen') {
      gl.enable(gl.DEPTH_TEST)
      gl.enable(gl.CULL_FACE)
    }

    gl.useProgram(program)

    // Set up attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.enableVertexAttribArray(positionLocation)
    const posSize = props.geometry === 'fullscreen' ? 2 : 3
    gl.vertexAttribPointer(positionLocation, posSize, gl.FLOAT, false, 0, 0)

    if (colorBuffer && colorLocation >= 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
      gl.enableVertexAttribArray(colorLocation)
      gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0)
    }

    // Update uniforms
    const time = (Date.now() - startTime) / 1000

    if (props.animation === 'rotate-y') {
      rotation.y += 0.01
    }
    else if (props.animation === 'rotate-xyz') {
      rotation.x += 0.01
      rotation.y += 0.011
      rotation.z += 0.009
    }

    if (matrixLocation) {
      const matrix = createRotationMatrix(rotation.x, rotation.y, rotation.z)
      gl.uniformMatrix4fv(matrixLocation, false, matrix)
    }

    if (timeLocation) {
      gl.uniform1f(timeLocation, time)
    }

    if (resolutionLocation) {
      gl.uniform2f(resolutionLocation, width, height)
    }

    // Draw
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.drawElements(gl.TRIANGLES, geometry.indices.length, gl.UNSIGNED_SHORT, 0)

    animationId = requestAnimationFrame(render)
  }

  render()
}

// WebGPU implementation
async function initWebGPU() {
  if (!canvasRef.value) return

  if (!navigator.gpu) {
    errorMessage.value = 'WebGPU is not supported in your browser'
    return
  }

  try {
    const adapter = await navigator.gpu.requestAdapter()
    if (!adapter) {
      errorMessage.value = 'Failed to get WebGPU adapter'
      return
    }

    gpuDevice = await adapter.requestDevice()
    gpuContext = canvasRef.value.getContext('webgpu')

    const presentationFormat = navigator.gpu.getPreferredCanvasFormat()
    gpuContext.configure({
      device: gpuDevice,
      format: presentationFormat,
      alphaMode: 'premultiplied',
    })

    // Implementation for WebGPU demos would go here
    // This is a simplified version - full implementation would be quite extensive
    errorMessage.value = 'WebGPU demo implementation in progress'
  }
  catch (error) {
    console.error('WebGPU initialization error:', error)
    errorMessage.value = `WebGPU initialization failed: ${error.message}`
  }
}

onMounted(() => {
  if (props.type === 'webgl') {
    initWebGL()
  }
  else {
    initWebGPU()
  }
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (gpuDevice) {
    gpuDevice.destroy()
  }
})
</script>

<template>
  <div class="shader-demo my-8">
    <div v-if="errorMessage" class="mb-4">
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{{ errorMessage }}</AlertDescription>
      </Alert>
    </div>
    <canvas
      ref="canvasRef"
      class="w-full h-96 border rounded-lg bg-zinc-950"></canvas>
  </div>
</template>

<style scoped>
canvas {
  image-rendering: crisp-edges;
  image-rendering: pixelated;
}
</style>

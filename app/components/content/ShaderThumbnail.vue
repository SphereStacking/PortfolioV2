<template>
  <div
    class="group relative aspect-video cursor-pointer overflow-hidden rounded-lg border bg-zinc-900 transition-all hover:shadow-lg hover:-translate-y-1"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleClick">
    <!-- Canvas for WebGL preview -->
    <canvas
      ref="canvasRef"
      class="h-full w-full"></canvas>

    <!-- Loading indicator -->
    <div
      v-if="isLoading"
      class="absolute inset-0 flex items-center justify-center bg-background/50">
      <Icon name="lucide:loader-2" class="h-8 w-8 animate-spin text-muted-foreground" />
    </div>

    <!-- Shader info overlay -->
    <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/80 to-transparent p-4">
      <h3 class="text-base font-semibold">
        {{ shader?.metadata?.title || 'Untitled' }}
      </h3>
    </div>

    <!-- Error state -->
    <div v-if="error" class="absolute inset-0 flex items-center justify-center bg-background/90">
      <div class="text-center">
        <Icon name="lucide:alert-circle" class="mx-auto mb-2 h-6 w-6 text-destructive" />
        <p class="text-xs text-muted-foreground">
          Failed to load
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShaderData } from '~/composables/useShaderSources'

interface Props {
  shader: ShaderData
  previewOnHover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  previewOnHover: true,
})

const emit = defineEmits<{
  click: []
}>()

const canvasRef = ref<HTMLCanvasElement>()
const isHovered = ref(false)
const isLoading = ref(false)
const error = ref(false)

let gl: WebGLRenderingContext | null = null
let program: WebGLProgram | null = null
let animationId: number | null = null
interface ShaderBuffers {
  position: WebGLBuffer | null
  color?: WebGLBuffer | null
  index: WebGLBuffer | null
  count: number
  drawMode?: number
}

let buffers: ShaderBuffers | null = null

// Simple preview shader rendering
async function initPreview() {
  if (!canvasRef.value || gl) return

  isLoading.value = true
  error.value = false

  try {
    const canvas = canvasRef.value
    gl = canvas.getContext('webgl') as WebGLRenderingContext | null || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null

    if (!gl) {
      throw new Error('WebGL not supported')
    }

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * 0.5 // Low resolution for preview
    canvas.height = rect.height * 0.5
    gl.viewport(0, 0, canvas.width, canvas.height)

    // Load and compile shaders
    const shaderSources = props.shader.sources

    if (!shaderSources) {
      throw new Error(`Shader ${props.shader.id} not found`)
    }

    // Create shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, shaderSources.vertex)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, shaderSources.fragment)

    if (!vertexShader || !fragmentShader) {
      console.error(`Shader compilation failed for ${props.shader.id}`)
      throw new Error('Failed to create shaders')
    }

    // Create program
    program = createProgram(gl, vertexShader, fragmentShader)
    if (!program) {
      throw new Error('Failed to create shader program')
    }

    // Setup geometry based on shader type
    setupGeometry()

    // Render single frame
    renderSingleFrame()
  }
  catch (e) {
    console.error('Preview init error:', e)
    error.value = true
  }
  finally {
    isLoading.value = false
  }
}

function renderSingleFrame() {
  if (!gl || !program) return

  // Use a fixed time for consistent thumbnails
  const fixedTime = 5000 // 5 seconds worth of animation
  render(fixedTime)
}

function startPreviewAnimation() {
  if (!gl || !program || animationId !== null) return

  const animate = (currentTime: number) => {
    if (!gl || !program || !isHovered.value) {
      animationId = null
      return
    }

    // Use currentTime directly for continuous animation
    render(currentTime)
    animationId = requestAnimationFrame(animate)
  }

  animationId = requestAnimationFrame(animate)
}

function stopPreviewAnimation() {
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  // Return to static thumbnail
  renderSingleFrame()
}

// Hover handling
function handleMouseEnter() {
  isHovered.value = true
  startPreviewAnimation()
}

function handleMouseLeave() {
  isHovered.value = false
  stopPreviewAnimation()
}

function handleClick() {
  emit('click')
}

// Shader creation functions
function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null

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
  if (!program) return null

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

// Setup geometry based on shader type
function setupGeometry() {
  if (!gl) return

  // Simple fullscreen quad for 2D shaders
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

  buffers = {
    position: positionBuffer,
    index: indexBuffer,
    count: indices.length,
  }
}

// Render function
function render(time: number) {
  if (!gl || !program) return

  // Clear canvas
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  // Use program
  gl.useProgram(program)

  // Set uniforms
  const timeLocation = gl.getUniformLocation(program, 'u_time')
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')

  if (timeLocation !== null) {
    gl.uniform1f(timeLocation, time * 0.001)
  }

  if (resolutionLocation !== null) {
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height)
  }

  // Bind buffers and draw
  if (buffers) {
    const positionLocation = gl.getAttribLocation(program, 'a_position')
    if (positionLocation >= 0 && buffers.position) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
      gl.enableVertexAttribArray(positionLocation)
      const positionSize = 2
      gl.vertexAttribPointer(positionLocation, positionSize, gl.FLOAT, false, 0, 0)
    }

    // Draw based on buffer type
    if (buffers.drawMode === gl.POINTS) {
      gl.drawArrays(gl.POINTS, 0, buffers.count)
    }
    else if (buffers.index) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index)
      gl.drawElements(gl.TRIANGLES, buffers.count, gl.UNSIGNED_SHORT, 0)
    }
  }
}

// Lifecycle
onMounted(() => {
  // Start preview when component is mounted
  nextTick(() => initPreview())
})

// Cleanup
onUnmounted(() => {
  stopPreviewAnimation()
  if (gl && program) {
    gl.deleteProgram(program)
  }
  if (gl && canvasRef.value) {
    const loseContext = gl.getExtension('WEBGL_lose_context')
    if (loseContext) {
      loseContext.loseContext()
    }
  }
})
</script>

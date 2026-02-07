// Dynamic imports using import.meta.glob
const shaderFiles = import.meta.glob('/assets/shaders/*/*.glsl', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const metadataFiles = import.meta.glob('/assets/shaders/*/metadata.ts', {
  import: 'metadata',
  eager: true,
})

export interface ShaderMetadata {
  id: string
  title: string
  description: string
  type: 'webgl' | 'webgpu'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  performance: 'low' | 'medium' | 'high'
  tags: string[]
  thumbnail?: string
}

export interface ShaderSet {
  vertex: string
  fragment: string
}

export interface ShaderData {
  id: string
  metadata: ShaderMetadata
  sources: ShaderSet
}

// Process and organize shader data
function processShaderData() {
  const shaderSources: Record<string, ShaderSet> = {}
  const shaderMetadata: ShaderMetadata[] = []
  const shaders: ShaderData[] = []

  // Process shader files
  Object.entries(shaderFiles).forEach(([path, content]) => {
    const match = path.match(/\/assets\/shaders\/([^/]+)\/(vertex|fragment)\.glsl$/)
    if (match) {
      const [, shaderId, shaderType] = match

      if (!shaderSources[shaderId]) {
        shaderSources[shaderId] = { vertex: '', fragment: '' }
      }

      shaderSources[shaderId][shaderType as 'vertex' | 'fragment'] = content as string
    }
  })

  // Process metadata files
  Object.entries(metadataFiles).forEach(([path, metadata]) => {
    const match = path.match(/\/assets\/shaders\/([^/]+)\/metadata\.ts$/)
    if (match) {
      const [, shaderId] = match
      const meta = metadata as ShaderMetadata

      shaderMetadata.push(meta)

      // Create combined shader data
      if (shaderSources[shaderId]) {
        shaders.push({
          id: shaderId,
          metadata: meta,
          sources: shaderSources[shaderId],
        })
      }
    }
  })

  return { shaderSources, shaderMetadata, shaders }
}

const { shaderSources, shaderMetadata, shaders } = processShaderData()

// Export for backward compatibility
export function useShaderSources() {
  return shaderSources
}

// New unified composable
export function useShaders() {
  return {
    shaders,
    shaderSources,
    shaderMetadata,
  }
}

// Export individual arrays for direct use
export { shaders, shaderSources as sources, shaderMetadata as metadata }

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  radius: number
  color: string
  velocity: { x: number; y: number }
}

export function useAudioVisualization(audioContext: AudioContext | null, analyserNode: AnalyserNode | null, isDarkMode: boolean, isPlaying: boolean) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (!audioContext || !analyserNode) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      return
    }

    const canvas = document.getElementById('visualizer') as HTMLCanvasElement
    if (!canvas) return

    canvasRef.current = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    analyserNode.fftSize = 256
    const bufferLength = analyserNode.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const createParticles = () => {
      particlesRef.current = []
      for (let i = 0; i < 100; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 3 + 1,
          color: `hsla(${Math.random() * 360}, 70%, 60%, 0.8)`,
          velocity: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 }
        })
      }
    }

    createParticles()

    const draw = () => {
      if (!ctx || !isPlaying) return

      analyserNode.getByteFrequencyData(dataArray)

      // Clear the canvas with a fade effect
      ctx.fillStyle = isDarkMode ? 'rgba(15, 23, 42, 0.2)' : 'rgba(241, 245, 249, 0.2)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particlesRef.current.forEach((particle, index) => {
        particle.x += particle.velocity.x
        particle.y += particle.velocity.y

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.velocity.x *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.velocity.y *= -1

        const freq = dataArray[index % bufferLength] / 255
        const radius = particle.radius * (1 + freq * 2)

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()
      })

      animationFrameRef.current = requestAnimationFrame(draw)
    }

    if (isPlaying) {
      draw()
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      // Clear the canvas when not playing
      ctx.fillStyle = isDarkMode ? 'rgb(15, 23, 42)' : 'rgb(241, 245, 249)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [audioContext, analyserNode, isDarkMode, isPlaying])

  return canvasRef
}


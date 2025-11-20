'use client'

import { useRef, Suspense, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, Float, useGLTF } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'

gsap.registerPlugin(ScrollTrigger)

// 3D camera model component with subtle floating animation
function CameraModel() {
  const mesh = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/camera.glb') // Load GLB model from public folder

  // Animate camera rotation with smooth sine wave
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
    }
  })

  return <primitive ref={mesh} object={scene} scale={0.9} position={[0, -1, 0]} />
}

// Preload camera model to prevent loading delay
useGLTF.preload('/camera.glb')

export function CameraHero() {
  const titleRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Smooth scroll to albums section when CTA button is clicked
  const scrollToContent = () => {
    const albumsSection = document.getElementById('albums-section')
    albumsSection?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    // Animate text elements on page load with staggered delays
    gsap.fromTo(
      titleRef.current,
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }
    )
    gsap.fromTo(
      subtitleRef.current,
      { y: 80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, delay: 0.3, ease: 'power3.out' }
    )
    gsap.fromTo(
      ctaRef.current,
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, delay: 0.6, ease: 'power3.out' }
    )

    // Fade out hero section as albums section scrolls over it
    const heroSection = document.querySelector('.hero-section')
    if (heroSection) {
      gsap.to(heroSection, {
        opacity: 0,
        scrollTrigger: {
          trigger: '#albums-section',
          start: 'top top', // Start when albums section reaches top
          end: 'bottom top', // Complete when albums section bottom reaches top
          scrub: true, // Smooth scrubbing animation
        },
      })
    }

    // Scale down and fade canvas as user scrolls
    if (canvasRef.current) {
      gsap.to(canvasRef.current, {
        scale: 0.8,
        y: 100,
        opacity: 0.5,
        scrollTrigger: {
          trigger: '#albums-section',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    }
  }, [])

  return (
    <section className="hero-section fixed top-0 left-0 h-screen w-full overflow-hidden bg-gradient-to-b from-black via-zinc-900 to-black z-0">
      {/* 3D Canvas */}
      <div ref={canvasRef} className="canvas-container absolute inset-0">
        <Canvas shadows dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
          <spotLight position={[-10, 15, 10]} angle={0.3} intensity={2} />

          <Suspense fallback={null}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
              <CameraModel />
            </Float>
            <Environment preset="night" />
          </Suspense>

          <EffectComposer>
            <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.5} />
            <Vignette offset={0.1} darkness={0.6} />
          </EffectComposer>

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>

      {/* Text Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 pointer-events-none z-10">
        <h1
          ref={titleRef}
          className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white drop-shadow-2xl mb-4"
          style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
        >
          Manuel
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
            Barriga
          </span>
        </h1>

        <p ref={subtitleRef} className="text-xl md:text-2xl text-zinc-300 max-w-2xl mt-6 font-light tracking-wide">
          Ljósmyndir
        </p>

        <div ref={ctaRef} className="mt-12 pointer-events-auto">
          <button
            onClick={scrollToContent}
            className="group relative px-10 py-5 bg-white text-black font-bold text-lg rounded-full overflow-hidden transition-all hover:scale-105"
          >
            <span className="relative z-10">Skoða myndir</span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {/* Attribution - small and unobtrusive */}
      <div className="absolute bottom-2 right-2 text-[8px] text-white/20 hover:text-white/40 transition-colors pointer-events-auto z-10">
        <a
          href="https://poly.pizza/m/0nfSsetwy0Z"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          Camera by Poly by Google [CC-BY] via Poly Pizza
        </a>
      </div>
    </section>
  )
}

'use client'
import { useRef, useCallback } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Grid, TransformControls } from '@react-three/drei'
import * as THREE from 'three'
import { useEditorStore } from '@/store/editorStore'
import { SceneObject3D } from '@/lib/types'

function Room() {
  const { scene } = useEditorStore()
  const { roomWidth, roomDepth, roomHeight } = scene

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[roomWidth, roomDepth]} />
        <meshStandardMaterial color="#f5f5f0" />
      </mesh>

      {/* Walls */}
      <mesh position={[0, roomHeight / 2, -roomDepth / 2]}>
        <planeGeometry args={[roomWidth, roomHeight]} />
        <meshStandardMaterial color="#e8e8e8" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-roomWidth / 2, roomHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[roomDepth, roomHeight]} />
        <meshStandardMaterial color="#ebebeb" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[roomWidth / 2, roomHeight / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[roomDepth, roomHeight]} />
        <meshStandardMaterial color="#ebebeb" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function SceneObjectMesh({ obj }: { obj: SceneObject3D }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { selectedId, selectObject, updateObject } = useEditorStore()
  const isSelected = selectedId === obj.id

  const getGeometry = () => {
    switch (obj.type) {
      case 'mannequin': return <capsuleGeometry args={[0.2, 1.2, 4, 8]} />
      case 'hanger': return <boxGeometry args={[1.2, 0.05, 0.4]} />
      case 'shelf': return <boxGeometry args={[1.0, 0.05, 0.4]} />
      case 'lighting': return <sphereGeometry args={[0.15, 8, 8]} />
      case 'prop': return <boxGeometry args={[0.4, 0.4, 0.4]} />
      case 'sign': return <boxGeometry args={[1.0, 0.6, 0.05]} />
      default: return <boxGeometry args={[0.5, 0.5, 0.5]} />
    }
  }

  return (
    <mesh
      ref={meshRef}
      position={obj.position}
      rotation={obj.rotation}
      scale={obj.scale}
      onClick={(e) => { e.stopPropagation(); selectObject(obj.id) }}
      castShadow
    >
      {getGeometry()}
      <meshStandardMaterial
        color={obj.color}
        emissive={isSelected ? '#4488ff' : '#000000'}
        emissiveIntensity={isSelected ? 0.3 : 0}
      />
    </mesh>
  )
}

function SceneObjects() {
  const { scene, selectObject } = useEditorStore()
  return (
    <group onClick={(e) => { e.stopPropagation(); selectObject(null) }}>
      {scene.objects.map((obj) => (
        <SceneObjectMesh key={obj.id} obj={obj} />
      ))}
    </group>
  )
}

function TopViewCamera() {
  const { camera } = useThree()
  const { scene } = useEditorStore()
  camera.position.set(0, 15, 0)
  camera.lookAt(0, 0, 0)
  return null
}

interface SceneCanvasProps {
  viewMode: '3d' | 'top'
}

export function SceneCanvas({ viewMode }: SceneCanvasProps) {
  const { selectObject } = useEditorStore()

  return (
    <Canvas
      shadows
      camera={{ position: [8, 6, 8], fov: 50 }}
      onClick={(e) => { if (e.target === e.currentTarget) selectObject(null) }}
      className="w-full h-full"
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.4} />

      <Room />
      <SceneObjects />

      {viewMode === '3d' ? (
        <OrbitControls makeDefault />
      ) : (
        <>
          <TopViewCamera />
          <OrbitControls enableRotate={false} />
        </>
      )}

      <Grid
        position={[0, 0.001, 0]}
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#cccccc"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#aaaaaa"
        fadeDistance={25}
        fadeStrength={1}
        infiniteGrid={false}
      />
    </Canvas>
  )
}

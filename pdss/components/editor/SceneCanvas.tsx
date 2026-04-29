'use client'
import { useRef, useState, useCallback } from 'react'
import { Canvas, useThree, ThreeEvent } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import * as THREE from 'three'
import { useEditorStore } from '@/store/editorStore'
import { SceneObject3D } from '@/lib/types'

// ─── 오브젝트 전용 모델 ──────────────────────────────────────
function MannequinModel({ color }: { color: string }) {
  return (
    <group>
      {/* 다리 */}
      <mesh position={[-0.1, 0.4, 0]}><cylinderGeometry args={[0.06, 0.06, 0.8, 8]} /><meshStandardMaterial color={color} /></mesh>
      <mesh position={[0.1, 0.4, 0]}><cylinderGeometry args={[0.06, 0.06, 0.8, 8]} /><meshStandardMaterial color={color} /></mesh>
      {/* 몸통 */}
      <mesh position={[0, 1.05, 0]}><cylinderGeometry args={[0.18, 0.14, 0.5, 12]} /><meshStandardMaterial color={color} /></mesh>
      {/* 가슴 */}
      <mesh position={[0, 1.4, 0]}><sphereGeometry args={[0.2, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.6]} /><meshStandardMaterial color={color} /></mesh>
      {/* 어깨 바 */}
      <mesh position={[0, 1.55, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.03, 0.03, 0.55, 8]} /><meshStandardMaterial color={color} /></mesh>
      {/* 목 */}
      <mesh position={[0, 1.65, 0]}><cylinderGeometry args={[0.05, 0.05, 0.15, 8]} /><meshStandardMaterial color={color} /></mesh>
      {/* 머리 */}
      <mesh position={[0, 1.82, 0]}><sphereGeometry args={[0.14, 12, 12]} /><meshStandardMaterial color={color} /></mesh>
    </group>
  )
}

function HangerRackModel({ color }: { color: string }) {
  return (
    <group>
      {/* 바닥 프레임 가로 */}
      <mesh position={[0, 0.04, 0.38]}><boxGeometry args={[0.85, 0.06, 0.06]} /><meshStandardMaterial color={color} metalness={0.6} roughness={0.3} /></mesh>
      <mesh position={[0, 0.04, -0.38]}><boxGeometry args={[0.85, 0.06, 0.06]} /><meshStandardMaterial color={color} metalness={0.6} roughness={0.3} /></mesh>
      {/* 바닥 프레임 세로 */}
      <mesh position={[0.38, 0.04, 0]}><boxGeometry args={[0.06, 0.06, 0.82]} /><meshStandardMaterial color={color} metalness={0.6} roughness={0.3} /></mesh>
      <mesh position={[-0.38, 0.04, 0]}><boxGeometry args={[0.06, 0.06, 0.82]} /><meshStandardMaterial color={color} metalness={0.6} roughness={0.3} /></mesh>
      {/* 수직 기둥 좌우 */}
      <mesh position={[-0.38, 0.9, 0]}><cylinderGeometry args={[0.025, 0.025, 1.75, 8]} /><meshStandardMaterial color={color} metalness={0.6} roughness={0.3} /></mesh>
      <mesh position={[0.38, 0.9, 0]}><cylinderGeometry args={[0.025, 0.025, 1.75, 8]} /><meshStandardMaterial color={color} metalness={0.6} roughness={0.3} /></mesh>
      {/* 상단 가로 봉 */}
      <mesh position={[0, 1.78, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.022, 0.022, 0.88, 8]} /><meshStandardMaterial color={color} metalness={0.7} roughness={0.2} /></mesh>
      {/* 바퀴 4개 */}
      {[[-0.35, 0.03, 0.35], [0.35, 0.03, 0.35], [-0.35, 0.03, -0.35], [0.35, 0.03, -0.35]].map((pos, i) => (
        <mesh key={i} position={pos as [number,number,number]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.03, 12]} />
          <meshStandardMaterial color="#333" metalness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

function ShelfModel({ color }: { color: string }) {
  const shelves = [0.28, 0.62, 0.96, 1.3]
  return (
    <group>
      {/* 좌우 측판 */}
      <mesh position={[-0.43, 0.82, 0]}><boxGeometry args={[0.04, 1.64, 0.38]} /><meshStandardMaterial color={color} roughness={0.7} /></mesh>
      <mesh position={[0.43, 0.82, 0]}><boxGeometry args={[0.04, 1.64, 0.38]} /><meshStandardMaterial color={color} roughness={0.7} /></mesh>
      {/* 선반 판 */}
      {shelves.map((y, i) => (
        <mesh key={i} position={[0, y, 0]}><boxGeometry args={[0.86, 0.04, 0.38]} /><meshStandardMaterial color={color} roughness={0.7} /></mesh>
      ))}
      {/* 상단 */}
      <mesh position={[0, 1.62, 0]}><boxGeometry args={[0.9, 0.04, 0.4]} /><meshStandardMaterial color={color} roughness={0.7} /></mesh>
      {/* 뒷판 */}
      <mesh position={[0, 0.82, -0.18]}><boxGeometry args={[0.86, 1.64, 0.03]} /><meshStandardMaterial color={color} roughness={0.8} /></mesh>
    </group>
  )
}

function LightingModel({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.12, 0.08, 0.25, 12]} /><meshStandardMaterial color="#aaa" metalness={0.8} /></mesh>
      <mesh position={[0, -0.1, 0]}><sphereGeometry args={[0.1, 12, 12]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} /></mesh>
      <pointLight position={[0, -0.15, 0]} intensity={0.8} distance={4} color={color} />
    </group>
  )
}

function PropModel({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.2, 0]}><boxGeometry args={[0.35, 0.35, 0.35]} /><meshStandardMaterial color={color} roughness={0.5} /></mesh>
      <mesh position={[0, 0.395, 0]}><cylinderGeometry args={[0.04, 0.04, 0.04, 8]} /><meshStandardMaterial color="#888" /></mesh>
    </group>
  )
}

function SignModel({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0, 0]}><boxGeometry args={[1.1, 0.65, 0.06]} /><meshStandardMaterial color={color} roughness={0.3} /></mesh>
      <mesh position={[0.48, -0.5, 0]}><cylinderGeometry args={[0.03, 0.03, 1.0, 8]} /><meshStandardMaterial color="#888" metalness={0.7} /></mesh>
      <mesh position={[-0.48, -0.5, 0]}><cylinderGeometry args={[0.03, 0.03, 1.0, 8]} /><meshStandardMaterial color="#888" metalness={0.7} /></mesh>
    </group>
  )
}

function getModel(type: string, color: string) {
  switch (type) {
    case 'mannequin': return <MannequinModel color={color} />
    case 'hanger': return <HangerRackModel color={color} />
    case 'shelf': return <ShelfModel color={color} />
    case 'lighting': return <LightingModel color={color} />
    case 'prop': return <PropModel color={color} />
    case 'sign': return <SignModel color={color} />
    default: return <mesh><boxGeometry args={[0.5,0.5,0.5]} /><meshStandardMaterial color={color} /></mesh>
  }
}

// ─── 씬 오브젝트 ──────────────────────────────────────────────
function SceneObjectMesh({ obj }: { obj: SceneObject3D }) {
  const { selectedId, selectObject } = useEditorStore()
  const isSelected = selectedId === obj.id

  return (
    <group
      position={obj.position}
      rotation={obj.rotation}
      scale={obj.scale}
      onClick={(e) => { e.stopPropagation(); selectObject(obj.id) }}
    >
      {getModel(obj.type, obj.color)}
      {isSelected && (
        <mesh>
          <boxGeometry args={[1.1, 1.9, 1.1]} />
          <meshBasicMaterial color="#4488ff" transparent opacity={0.08} depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}

// ─── 방 (클릭으로 오브젝트 이동) ─────────────────────────────
function Room() {
  const { scene, selectedId, updateObject, selectObject } = useEditorStore()
  const { roomWidth, roomDepth, roomHeight } = scene

  function handleFloorClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation()
    if (selectedId) {
      const obj = scene.objects.find(o => o.id === selectedId)
      if (!obj) return
      const y = obj.position[1]
      updateObject(selectedId, { position: [e.point.x, y, e.point.z] })
    } else {
      selectObject(null)
    }
  }

  return (
    <group>
      {/* 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow onClick={handleFloorClick}>
        <planeGeometry args={[roomWidth, roomDepth]} />
        <meshStandardMaterial color="#f0ede8" />
      </mesh>
      {/* 뒷벽 */}
      <mesh position={[0, roomHeight / 2, -roomDepth / 2]} receiveShadow>
        <planeGeometry args={[roomWidth, roomHeight]} />
        <meshStandardMaterial color="#e5e1dc" side={THREE.FrontSide} />
      </mesh>
      {/* 왼쪽 벽 */}
      <mesh position={[-roomWidth / 2, roomHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[roomDepth, roomHeight]} />
        <meshStandardMaterial color="#e8e4df" side={THREE.FrontSide} />
      </mesh>
      {/* 오른쪽 벽 */}
      <mesh position={[roomWidth / 2, roomHeight / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[roomDepth, roomHeight]} />
        <meshStandardMaterial color="#e8e4df" side={THREE.FrontSide} />
      </mesh>
      {/* 바닥 몰딩 */}
      <mesh position={[0, 0.04, -roomDepth / 2 + 0.02]}>
        <boxGeometry args={[roomWidth, 0.08, 0.04]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>
    </group>
  )
}

// ─── 탑뷰 카메라 ──────────────────────────────────────────────
function TopViewSetup() {
  const { camera } = useThree()
  const { scene } = useEditorStore()
  ;(camera as THREE.PerspectiveCamera).fov = 60
  camera.position.set(0, scene.roomHeight * 4, 0)
  camera.lookAt(0, 0, 0)
  camera.updateProjectionMatrix()
  return null
}

// ─── 오브젝트 목록 (반응형) ───────────────────────────────────
function SceneObjectList() {
  const { scene } = useEditorStore()
  return (
    <group>
      {scene.objects.map((obj) => (
        <SceneObjectMesh key={obj.id} obj={obj} />
      ))}
    </group>
  )
}

// ─── 배치 힌트 ────────────────────────────────────────────────
function PlacementHint() {
  const { selectedId } = useEditorStore()
  if (!selectedId) return null
  return (
    <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.3, 0.35, 32]} />
      <meshBasicMaterial color="#4488ff" transparent opacity={0.5} />
    </mesh>
  )
}

// ─── 메인 캔버스 ──────────────────────────────────────────────
export function SceneCanvas({ viewMode }: { viewMode: '3d' | 'top' }) {
  const { selectObject } = useEditorStore()

  return (
    <Canvas
      shadows
      gl={{ preserveDrawingBuffer: true }}
      camera={{ position: [7, 5, 7], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
      onClick={() => selectObject(null)}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[8, 10, 5]} intensity={0.9} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-5, 8, -5]} intensity={0.3} />
      <pointLight position={[0, 3, 0]} intensity={0.4} />

      <Room />

      <SceneObjectList />

      <PlacementHint />

      {viewMode === 'top' ? (
        <>
          <TopViewSetup />
          <OrbitControls enableRotate={false} makeDefault />
        </>
      ) : (
        <OrbitControls makeDefault minDistance={1} maxDistance={30} />
      )}

      <Grid
        position={[0, 0.001, 0]}
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.4}
        cellColor="#d0ccc8"
        sectionSize={5}
        sectionThickness={0.8}
        sectionColor="#b0aca8"
        fadeDistance={25}
        infiniteGrid={false}
      />
    </Canvas>
  )
}

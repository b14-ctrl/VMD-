'use client'
import { motion } from 'framer-motion'
import { useEditorStore } from '@/store/editorStore'
import { ObjectCategory, SceneObject3D } from '@/lib/types'

const LIBRARY_ITEMS: {
  category: ObjectCategory
  name: string
  emoji: string
  color: string
  defaultY: number
}[] = [
  { category: 'mannequin', name: '마네킹',  emoji: '🧍', color: '#d4b896', defaultY: 0 },
  { category: 'hanger',    name: '행거',    emoji: '🧥', color: '#aaaaaa', defaultY: 0 },
  { category: 'shelf',     name: '선반',    emoji: '📦', color: '#c8a882', defaultY: 0 },
  { category: 'lighting',  name: '조명',    emoji: '💡', color: '#fffacd', defaultY: 2.6 },
  { category: 'prop',      name: '소품',    emoji: '🎁', color: '#ff9999', defaultY: 0 },
  { category: 'sign',      name: '사이니지',emoji: '🪧', color: '#ffffff', defaultY: 1.2 },
]

export function ObjectLibraryPanel() {
  const { addObject, scene } = useEditorStore()

  function handleAdd(item: typeof LIBRARY_ITEMS[0]) {
    // 이미 배치된 오브젝트 수 기반으로 위치 분산
    const count = scene.objects.filter(o => o.type === item.category).length
    const offset = count * 0.8
    const x = (Math.random() - 0.5) * (scene.roomWidth * 0.6) + offset * 0.3
    const z = (Math.random() - 0.5) * (scene.roomDepth * 0.6) + offset * 0.3

    const obj: SceneObject3D = {
      id: crypto.randomUUID(),
      type: item.category,
      name: item.name,
      position: [
        Math.max(-scene.roomWidth / 2 + 1, Math.min(scene.roomWidth / 2 - 1, x)),
        item.defaultY,
        Math.max(-scene.roomDepth / 2 + 1, Math.min(scene.roomDepth / 2 - 1, z)),
      ],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: item.color,
    }
    addObject(obj)
  }

  return (
    <div className="w-56 border-r border-border bg-card flex flex-col">
      <div className="p-3 border-b border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">오브젝트 라이브러리</h3>
      </div>
      <div className="p-2 flex flex-col gap-1 overflow-y-auto flex-1">
        {LIBRARY_ITEMS.map((item) => (
          <motion.button
            key={item.category}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleAdd(item)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent text-sm text-left transition-colors"
          >
            <span className="text-lg">{item.emoji}</span>
            <div>
              <span className="font-medium">{item.name}</span>
              <p className="text-[10px] text-muted-foreground">
                {item.category === 'mannequin' && '클릭 후 바닥 클릭으로 이동'}
                {item.category === 'hanger' && '의류 행거 랙'}
                {item.category === 'shelf' && '4단 선반장'}
                {item.category === 'lighting' && '천장 조명'}
                {item.category === 'prop' && '장식 소품'}
                {item.category === 'sign' && '사이니지 보드'}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
      <div className="p-3 border-t border-border">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          💡 오브젝트 선택 후 바닥 클릭으로 위치 이동
        </p>
      </div>
    </div>
  )
}

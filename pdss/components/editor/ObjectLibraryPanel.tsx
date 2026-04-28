'use client'
import { motion } from 'framer-motion'
import { useEditorStore } from '@/store/editorStore'
import { ObjectCategory, SceneObject3D } from '@/lib/types'

const LIBRARY_ITEMS: { category: ObjectCategory; name: string; emoji: string; color: string }[] = [
  { category: 'mannequin', name: '마네킹', emoji: '🧍', color: '#d4b896' },
  { category: 'hanger', name: '행거', emoji: '🧥', color: '#888888' },
  { category: 'shelf', name: '선반', emoji: '📦', color: '#c8a882' },
  { category: 'lighting', name: '조명', emoji: '💡', color: '#fffacd' },
  { category: 'prop', name: '소품', emoji: '🎁', color: '#ff9999' },
  { category: 'sign', name: '사이니지', emoji: '🪧', color: '#ffffff' },
]

export function ObjectLibraryPanel() {
  const { addObject } = useEditorStore()

  function handleAdd(item: typeof LIBRARY_ITEMS[0]) {
    const obj: SceneObject3D = {
      id: crypto.randomUUID(),
      type: item.category,
      name: item.name,
      position: [0, item.category === 'mannequin' ? 0.8 : item.category === 'hanger' ? 1.6 : 0.5, 0],
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
            <span className="font-medium">{item.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

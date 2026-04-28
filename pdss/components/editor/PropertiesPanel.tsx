'use client'
import { useEditorStore } from '@/store/editorStore'

export function PropertiesPanel() {
  const { scene, selectedId, updateObject, removeObject, duplicateObject } = useEditorStore()
  const obj = scene.objects.find((o) => o.id === selectedId)

  if (!obj) {
    return (
      <div className="w-56 border-l border-border bg-card flex flex-col">
        <div className="p-3 border-b border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">속성</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 text-center">
          <p className="text-xs text-muted-foreground">오브젝트를 선택하면<br />속성을 편집할 수 있습니다</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-56 border-l border-border bg-card flex flex-col">
      <div className="p-3 border-b border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">속성</h3>
      </div>
      <div className="p-3 flex flex-col gap-3 overflow-y-auto flex-1 text-sm">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">이름</label>
          <input
            value={obj.label ?? obj.name}
            onChange={(e) => updateObject(obj.id, { label: e.target.value })}
            className="w-full px-2 py-1.5 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="block text-xs text-muted-foreground mb-1">색상</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={obj.color}
              onChange={(e) => updateObject(obj.id, { color: e.target.value })}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <span className="text-xs text-muted-foreground">{obj.color}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs text-muted-foreground mb-1">위치</label>
          <div className="grid grid-cols-3 gap-1">
            {(['X', 'Y', 'Z'] as const).map((axis, i) => (
              <div key={axis}>
                <label className="block text-[10px] text-muted-foreground text-center">{axis}</label>
                <input
                  type="number"
                  step="0.1"
                  value={obj.position[i].toFixed(1)}
                  onChange={(e) => {
                    const pos = [...obj.position] as [number, number, number]
                    pos[i] = parseFloat(e.target.value) || 0
                    updateObject(obj.id, { position: pos })
                  }}
                  className="w-full px-1.5 py-1 border border-border rounded text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-muted-foreground mb-1">회전 Y</label>
          <input
            type="range"
            min={0}
            max={360}
            value={((obj.rotation[1] * 180) / Math.PI) % 360}
            onChange={(e) => {
              const rot = [...obj.rotation] as [number, number, number]
              rot[1] = (parseFloat(e.target.value) * Math.PI) / 180
              updateObject(obj.id, { rotation: rot })
            }}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-xs text-muted-foreground mb-1">크기</label>
          <input
            type="range"
            min={0.1}
            max={3}
            step={0.05}
            value={obj.scale[0]}
            onChange={(e) => {
              const s = parseFloat(e.target.value)
              updateObject(obj.id, { scale: [s, s, s] })
            }}
            className="w-full"
          />
          <span className="text-xs text-muted-foreground">{obj.scale[0].toFixed(2)}x</span>
        </div>

        <div className="flex flex-col gap-1.5 pt-2 border-t border-border">
          <button
            onClick={() => duplicateObject(obj.id)}
            className="w-full py-1.5 text-xs border border-border rounded-md hover:bg-accent transition-colors"
          >
            복제
          </button>
          <button
            onClick={() => removeObject(obj.id)}
            className="w-full py-1.5 text-xs border border-red-200 text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  )
}

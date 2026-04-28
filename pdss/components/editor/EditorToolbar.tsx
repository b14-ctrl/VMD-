'use client'
import { motion } from 'framer-motion'
import { Undo2, Redo2, Layers, Eye, Download, Sparkles, Save } from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import { cn } from '@/lib/utils'

interface EditorToolbarProps {
  projectName: string
  isSaving: boolean
  onSave: () => void
  onAISuggest: () => void
  onExport: () => void
}

export function EditorToolbar({ projectName, isSaving, onSave, onAISuggest, onExport }: EditorToolbarProps) {
  const { viewMode, setViewMode, undo, redo, history, historyIndex, isDirty } = useEditorStore()

  return (
    <div className="h-12 border-b border-border bg-card flex items-center px-4 gap-2 justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold mr-2 max-w-48 truncate">{projectName}</h2>

        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded hover:bg-accent disabled:opacity-30 transition-colors"
            title="실행 취소 (Ctrl+Z)"
          >
            <Undo2 size={15} />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded hover:bg-accent disabled:opacity-30 transition-colors"
            title="다시 실행 (Ctrl+Y)"
          >
            <Redo2 size={15} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* View toggle */}
        <div className="flex items-center bg-muted rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('3d')}
            className={cn(
              'px-3 py-1 text-xs rounded-md transition-colors',
              viewMode === '3d' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            3D
          </button>
          <button
            onClick={() => setViewMode('top')}
            className={cn(
              'px-3 py-1 text-xs rounded-md transition-colors',
              viewMode === 'top' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            탑뷰
          </button>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onAISuggest}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium"
        >
          <Sparkles size={13} />
          AI 연출 제안
        </motion.button>

        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs hover:bg-accent transition-colors"
        >
          <Download size={13} />
          내보내기
        </button>

        <button
          onClick={onSave}
          disabled={isSaving || !isDirty}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium disabled:opacity-50 transition-opacity"
        >
          <Save size={13} />
          {isSaving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  )
}

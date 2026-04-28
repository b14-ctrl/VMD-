'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import { Project, Scene } from '@/lib/types'
import { useEditorStore } from '@/store/editorStore'
import { ObjectLibraryPanel } from '@/components/editor/ObjectLibraryPanel'
import { PropertiesPanel } from '@/components/editor/PropertiesPanel'
import { EditorToolbar } from '@/components/editor/EditorToolbar'
import { AISuggestionPanel } from '@/components/editor/AISuggestionPanel'

const SceneCanvas = dynamic(
  () => import('@/components/editor/SceneCanvas').then((m) => m.SceneCanvas),
  { ssr: false }
)

export default function EditorPage() {
  const params = useParams()
  const projectId = params.id as string
  const supabase = createClient()

  const [project, setProject] = useState<Project | null>(null)
  const [sceneId, setSceneId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showAI, setShowAI] = useState(false)

  const { setScene, scene, isDirty, markClean, undo, redo } = useEditorStore()
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    loadProject()
  }, [projectId])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveScene() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [scene])

  // Auto-save every 30s when dirty
  useEffect(() => {
    if (!isDirty) return
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    autoSaveRef.current = setTimeout(() => { saveScene() }, 30000)
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current) }
  }, [isDirty, scene])

  async function loadProject() {
    const [{ data: proj }, { data: scenes }] = await Promise.all([
      supabase.from('projects').select('*').eq('id', projectId).single(),
      supabase.from('scenes').select('*').eq('project_id', projectId).order('created_at').limit(1),
    ])

    if (proj) setProject(proj)
    if (scenes && scenes.length > 0) {
      const s = scenes[0] as Scene
      setSceneId(s.id)
      setScene(s.scene_json)
    }
    setLoading(false)
  }

  const saveScene = useCallback(async () => {
    if (!sceneId) return
    setIsSaving(true)
    await supabase
      .from('scenes')
      .update({ scene_json: scene, updated_at: new Date().toISOString() })
      .eq('id', sceneId)
    markClean()
    setIsSaving(false)
  }, [sceneId, scene])

  function handleExport() {
    const canvas = document.querySelector('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${project?.name ?? 'scene'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">프로젝트 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <EditorToolbar
        projectName={project?.name ?? '프로젝트'}
        isSaving={isSaving}
        onSave={saveScene}
        onAISuggest={() => setShowAI(true)}
        onExport={handleExport}
      />

      <div className="flex flex-1 overflow-hidden">
        <ObjectLibraryPanel />

        <div className="flex-1 bg-muted/20 relative">
          <SceneCanvas viewMode={useEditorStore.getState().viewMode} />
        </div>

        <PropertiesPanel />
      </div>

      <AnimatePresence>
        {showAI && (
          <AISuggestionPanel
            projectId={projectId}
            storeName={project?.store_name ?? undefined}
            storeArea={project?.store_area_m2 ?? undefined}
            eventDate={project?.event_date ?? undefined}
            seasonTag={project?.season_tag ?? undefined}
            onClose={() => setShowAI(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

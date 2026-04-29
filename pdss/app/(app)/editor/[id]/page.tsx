'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Project } from '@/lib/types'
import { useEditorStore } from '@/store/editorStore'
import { ObjectLibraryPanel } from '@/components/editor/ObjectLibraryPanel'
import { PropertiesPanel } from '@/components/editor/PropertiesPanel'
import { EditorToolbar } from '@/components/editor/EditorToolbar'
import { AISuggestionPanel } from '@/components/editor/AISuggestionPanel'

const SceneCanvas = dynamic(
  () => import('@/components/editor/SceneCanvas').then((m) => m.SceneCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
        3D 뷰어 로딩 중...
      </div>
    ),
  }
)

const DEFAULT_SCENE = { objects: [], roomWidth: 10, roomDepth: 8, roomHeight: 3, walls: [] }

export default function EditorPage() {
  const params = useParams()
  const projectId = params.id as string
  const isMock = projectId.startsWith('mock-')

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showAI, setShowAI] = useState(false)

  const { setScene, scene, isDirty, markClean, undo, redo, viewMode } = useEditorStore()
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    loadProject()
  }, [projectId])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveScene() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [scene])

  useEffect(() => {
    if (!isDirty) return
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    autoSaveRef.current = setTimeout(() => saveScene(), 30000)
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current) }
  }, [isDirty, scene])

  async function loadProject() {
    if (isMock) {
      const raw = sessionStorage.getItem(`project-${projectId}`)
      if (raw) {
        const meta = JSON.parse(raw)
        setProject({
          id: projectId,
          user_id: 'mock-user',
          name: meta.name,
          store_name: meta.store_name,
          store_area_m2: meta.store_area_m2,
          event_date: meta.event_date,
          season_tag: meta.season_tag,
          floor_plan_url: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      } else {
        setProject({ id: projectId, user_id: 'mock-user', name: '새 프로젝트', created_at: '', updated_at: '' })
      }
      const savedScene = sessionStorage.getItem(`scene-${projectId}`)
      setScene(savedScene ? JSON.parse(savedScene) : DEFAULT_SCENE)
      setLoading(false)
      return
    }

    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const [{ data: proj }, { data: scenes }] = await Promise.all([
      supabase.from('projects').select('*').eq('id', projectId).single(),
      supabase.from('scenes').select('*').eq('project_id', projectId).order('created_at').limit(1),
    ])
    if (proj) setProject(proj as Project)
    if (scenes && scenes.length > 0) setScene((scenes[0] as { scene_json: typeof DEFAULT_SCENE }).scene_json)
    setLoading(false)
  }

  const saveScene = useCallback(async () => {
    setIsSaving(true)
    if (isMock) {
      sessionStorage.setItem(`scene-${projectId}`, JSON.stringify(scene))
      markClean()
      setIsSaving(false)
      return
    }
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { data: scenes } = await supabase.from('scenes').select('id').eq('project_id', projectId).limit(1)
    if (scenes && scenes.length > 0) {
      await supabase.from('scenes').update({ scene_json: scene }).eq('id', (scenes[0] as { id: string }).id)
    }
    markClean()
    setIsSaving(false)
  }, [projectId, isMock, scene])

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
        projectName={project?.name ?? '새 프로젝트'}
        isSaving={isSaving}
        onSave={saveScene}
        onAISuggest={() => setShowAI(true)}
        onExport={handleExport}
      />

      <div className="flex flex-1 overflow-hidden">
        <ObjectLibraryPanel />
        <div className="flex-1 bg-muted/20 relative overflow-hidden">
          <SceneCanvas viewMode={viewMode} />
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

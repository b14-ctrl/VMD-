'use client'
import { create } from 'zustand'
import { SceneObject3D, SceneJSON } from '@/lib/types'

interface EditorState {
  scene: SceneJSON
  selectedId: string | null
  viewMode: '3d' | 'top'
  isDirty: boolean
  history: SceneJSON[]
  historyIndex: number

  setScene: (scene: SceneJSON) => void
  selectObject: (id: string | null) => void
  addObject: (obj: SceneObject3D) => void
  updateObject: (id: string, changes: Partial<SceneObject3D>) => void
  removeObject: (id: string) => void
  duplicateObject: (id: string) => void
  setViewMode: (mode: '3d' | 'top') => void
  undo: () => void
  redo: () => void
  saveSnapshot: () => void
  markClean: () => void
}

const defaultScene: SceneJSON = {
  objects: [],
  roomWidth: 10,
  roomDepth: 8,
  roomHeight: 3,
  walls: [],
}

export const useEditorStore = create<EditorState>((set, get) => ({
  scene: defaultScene,
  selectedId: null,
  viewMode: '3d',
  isDirty: false,
  history: [defaultScene],
  historyIndex: 0,

  setScene: (scene) => {
    set({ scene, history: [scene], historyIndex: 0, isDirty: false })
  },

  selectObject: (id) => set({ selectedId: id }),

  addObject: (obj) => {
    const { scene } = get()
    const next = { ...scene, objects: [...scene.objects, obj] }
    get().saveSnapshot()
    set({ scene: next, isDirty: true })
  },

  updateObject: (id, changes) => {
    const { scene } = get()
    const next = {
      ...scene,
      objects: scene.objects.map((o) => (o.id === id ? { ...o, ...changes } : o)),
    }
    set({ scene: next, isDirty: true })
  },

  removeObject: (id) => {
    const { scene } = get()
    get().saveSnapshot()
    const next = { ...scene, objects: scene.objects.filter((o) => o.id !== id) }
    set({ scene: next, selectedId: null, isDirty: true })
  },

  duplicateObject: (id) => {
    const { scene } = get()
    const obj = scene.objects.find((o) => o.id === id)
    if (!obj) return
    const copy: SceneObject3D = {
      ...obj,
      id: crypto.randomUUID(),
      position: [obj.position[0] + 0.5, obj.position[1], obj.position[2] + 0.5],
    }
    get().saveSnapshot()
    set({ scene: { ...scene, objects: [...scene.objects, copy] }, isDirty: true })
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  saveSnapshot: () => {
    const { scene, history, historyIndex } = get()
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(scene)
    if (newHistory.length > 10) newHistory.shift()
    set({ history: newHistory, historyIndex: newHistory.length - 1 })
  },

  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex <= 0) return
    const prev = history[historyIndex - 1]
    set({ scene: prev, historyIndex: historyIndex - 1, isDirty: true })
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex >= history.length - 1) return
    const next = history[historyIndex + 1]
    set({ scene: next, historyIndex: historyIndex + 1, isDirty: true })
  },

  markClean: () => set({ isDirty: false }),
}))

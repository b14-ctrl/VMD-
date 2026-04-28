export type ObjectCategory = 'mannequin' | 'hanger' | 'shelf' | 'lighting' | 'prop' | 'sign'
export type ObjectSource = 'ai' | 'manual'

export interface Project {
  id: string
  user_id: string
  name: string
  store_name?: string
  store_area_m2?: number
  event_date?: string
  season_tag?: string
  floor_plan_url?: string
  created_at: string
  updated_at: string
}

export interface Scene {
  id: string
  project_id: string
  name: string
  version: number
  scene_json: SceneJSON
  thumbnail_url?: string
  created_at: string
}

export interface SceneJSON {
  objects: SceneObject3D[]
  roomWidth: number
  roomDepth: number
  roomHeight: number
  walls: Wall[]
}

export interface Wall {
  start: [number, number]
  end: [number, number]
}

export interface SceneObject3D {
  id: string
  object_lib_id?: string
  type: ObjectCategory | 'custom'
  name: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  color: string
  label?: string
  model_url?: string
}

export interface ObjectLibraryItem {
  id: string
  category: ObjectCategory
  name: string
  model_url?: string
  thumbnail_url?: string
  tags: string[]
  source: ObjectSource
}

export interface AISuggestion {
  id: string
  project_id: string
  variation_index: number
  prompt_used?: string
  result_json?: SuggestionResult
  image_url?: string
  selected: boolean
  created_at: string
}

export interface SuggestionResult {
  title: string
  concept: string
  description: string
  colorPalette: string[]
  props: string[]
  mannequinCount: number
  zones: string[]
  scene_json?: SceneJSON
}

export interface SeasonEvent {
  id: string
  name: string
  date_start: string
  date_end: string
  theme_tags: string[]
  color_palette_json: Record<string, string>
}

'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Plus, Calendar, Store, Clock, Trash2, Copy } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Project } from '@/lib/types'
import { formatDate, getStoreSizeLabel, detectSeason } from '@/lib/utils'
import { cn } from '@/lib/utils'

const SEASON_COLORS: Record<string, string> = {
  '크리스마스': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  '설날·신년': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  '발렌타인': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  '봄시즌': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  '여름': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  '가을': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  '겨울': 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false })
    setProjects(data ?? [])
    setLoading(false)
  }

  async function deleteProject(id: string, e: React.MouseEvent) {
    e.preventDefault()
    if (!confirm('프로젝트를 삭제하시겠어요?')) return
    await supabase.from('projects').delete().eq('id', id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  async function duplicateProject(project: Project, e: React.MouseEvent) {
    e.preventDefault()
    const { data } = await supabase
      .from('projects')
      .insert({ ...project, id: undefined, name: `${project.name} (복사본)`, created_at: undefined, updated_at: undefined })
      .select()
      .single()
    if (data) setProjects((prev) => [data, ...prev])
  }

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold">팝업 디자인 시뮬레이터</h1>
          <p className="text-muted-foreground mt-1">이랜드 리테일 VMD팀</p>
        </div>
        <Link href="/projects/new">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Plus size={16} />
            새 프로젝트
          </motion.button>
        </Link>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center h-96 text-center"
        >
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
            <Store size={28} className="text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-2">프로젝트가 없습니다</h2>
          <p className="text-muted-foreground text-sm mb-6">새 프로젝트를 만들어 팝업 연출을 시작하세요</p>
          <Link href="/projects/new">
            <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">
              <Plus size={16} />
              새 프로젝트 만들기
            </button>
          </Link>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {projects.map((project, i) => {
            const season = project.event_date ? detectSeason(project.event_date) : null
            const seasonColor = season ? SEASON_COLORS[season] ?? SEASON_COLORS['겨울'] : null
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2 }}
              >
                <Link href={`/editor/${project.id}`} className="block">
                  <div className="bg-card border border-border rounded-xl p-5 h-48 flex flex-col justify-between hover:border-primary/50 transition-colors group">
                    <div>
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-sm line-clamp-1">{project.name}</h3>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => duplicateProject(project, e)}
                            className="p-1 rounded hover:bg-muted"
                            title="복제"
                          >
                            <Copy size={14} className="text-muted-foreground" />
                          </button>
                          <button
                            onClick={(e) => deleteProject(project.id, e)}
                            className="p-1 rounded hover:bg-muted"
                            title="삭제"
                          >
                            <Trash2 size={14} className="text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                      {project.store_name && (
                        <p className="text-xs text-muted-foreground mt-1">{project.store_name}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-1">
                        {season && (
                          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', seasonColor)}>
                            {season}
                          </span>
                        )}
                        {project.store_area_m2 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {getStoreSizeLabel(project.store_area_m2)} · {project.store_area_m2}m²
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {project.event_date && (
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {project.event_date}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {formatDate(project.updated_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}

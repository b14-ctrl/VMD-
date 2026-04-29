'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Plus, Calendar, Clock, Trash2, Copy } from 'lucide-react'
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

const MOCK_PROJECTS: Project[] = [
  {
    id: 'mock-1',
    user_id: 'mock-user',
    name: '2025 크리스마스 팝업',
    store_name: '강남점',
    store_area_m2: 80,
    event_date: '2025-12-15',
    season_tag: '크리스마스',
    floor_plan_url: undefined,
    created_at: '2025-11-20T09:00:00Z',
    updated_at: '2025-11-22T14:30:00Z',
  },
  {
    id: 'mock-2',
    user_id: 'mock-user',
    name: '발렌타인 팝업 연출',
    store_name: '홍대점',
    store_area_m2: 45,
    event_date: '2025-02-10',
    season_tag: '발렌타인',
    floor_plan_url: undefined,
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-18T11:00:00Z',
  },
  {
    id: 'mock-3',
    user_id: 'mock-user',
    name: '봄 시즌 플라워 팝업',
    store_name: '신촌점',
    store_area_m2: 120,
    event_date: '2025-04-05',
    season_tag: '봄시즌',
    floor_plan_url: undefined,
    created_at: '2025-03-01T09:00:00Z',
    updated_at: '2025-03-10T16:00:00Z',
  },
  {
    id: 'mock-4',
    user_id: 'mock-user',
    name: '설날 한복 팝업',
    store_name: '명동점',
    store_area_m2: 200,
    event_date: '2025-01-25',
    season_tag: '설날·신년',
    floor_plan_url: undefined,
    created_at: '2025-01-05T08:00:00Z',
    updated_at: '2025-01-08T13:00:00Z',
  },
  {
    id: 'mock-5',
    user_id: 'mock-user',
    name: '여름 비치 컬렉션',
    store_name: '부산점',
    store_area_m2: 160,
    event_date: '2025-07-01',
    season_tag: '여름',
    floor_plan_url: undefined,
    created_at: '2025-06-01T09:00:00Z',
    updated_at: '2025-06-15T10:00:00Z',
  },
  {
    id: 'mock-6',
    user_id: 'mock-user',
    name: '가을 트렌치코트 팝업',
    store_name: '잠실점',
    store_area_m2: 90,
    event_date: '2025-10-10',
    season_tag: '가을',
    floor_plan_url: undefined,
    created_at: '2025-09-20T09:00:00Z',
    updated_at: '2025-09-25T17:00:00Z',
  },
]

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS)

  function deleteProject(id: string, e: React.MouseEvent) {
    e.preventDefault()
    if (!confirm('프로젝트를 삭제하시겠어요?')) return
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  function duplicateProject(project: Project, e: React.MouseEvent) {
    e.preventDefault()
    const copy: Project = {
      ...project,
      id: `mock-${Date.now()}`,
      name: `${project.name} (복사본)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setProjects((prev) => [copy, ...prev])
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
              transition={{ delay: i * 0.06 }}
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
    </div>
  )
}

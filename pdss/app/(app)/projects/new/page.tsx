'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Upload, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { detectSeason } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function NewProjectPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    name: '',
    store_name: '',
    store_area_m2: '',
    event_date: '',
  })
  const [floorPlanFile, setFloorPlanFile] = useState<File | null>(null)
  const [floorPlanPreview, setFloorPlanPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const season = form.event_date ? detectSeason(form.event_date) : null

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 30 * 1024 * 1024) {
      setError('파일 크기는 30MB 이하여야 합니다')
      return
    }
    setFloorPlanFile(file)
    setFloorPlanPreview(URL.createObjectURL(file))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('프로젝트 이름을 입력해주세요'); return }
    setLoading(true)
    setError('')

    // Supabase 미연결 시 mock ID로 에디터 이동
    const mockId = `mock-${Date.now()}`
    const projectMeta = {
      name: form.name,
      store_name: form.store_name || undefined,
      store_area_m2: form.store_area_m2 ? Number(form.store_area_m2) : undefined,
      event_date: form.event_date || undefined,
      season_tag: season || undefined,
    }
    sessionStorage.setItem(`project-${mockId}`, JSON.stringify(projectMeta))

    if (floorPlanPreview) {
      sessionStorage.setItem(`floorplan-${mockId}`, floorPlanPreview)
    }

    router.push(`/editor/${mockId}`)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 w-fit">
          <ArrowLeft size={16} />
          대시보드로 돌아가기
        </Link>

        <h1 className="text-2xl font-bold mb-8">새 프로젝트</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">프로젝트 이름 *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="예: 2025 크리스마스 팝업 - 강남점"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">매장명</label>
                <input
                  type="text"
                  value={form.store_name}
                  onChange={(e) => setForm({ ...form, store_name: e.target.value })}
                  placeholder="예: 강남점"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">매장 크기 (m²)</label>
                <input
                  type="number"
                  value={form.store_area_m2}
                  onChange={(e) => setForm({ ...form, store_area_m2: e.target.value })}
                  placeholder="예: 80"
                  min={1}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">팝업 운영 날짜</label>
              <input
                type="date"
                value={form.event_date}
                onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {season && (
                <p className="text-xs text-muted-foreground mt-1">
                  🎯 감지된 시즌: <span className="font-medium text-foreground">{season}</span> — AI 제안에 자동 반영됩니다
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">매장 도면 (PNG, 최대 30MB)</label>
            <label
              className={cn(
                'flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors',
                floorPlanPreview
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              )}
            >
              {floorPlanPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={floorPlanPreview} alt="도면 미리보기" className="h-full w-full object-contain rounded-xl p-2" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload size={24} />
                  <span className="text-sm">도면 PNG 파일을 업로드하세요</span>
                  <span className="text-xs">클릭하거나 파일을 드래그하세요</span>
                </div>
              )}
              <input type="file" accept="image/png,image/jpeg" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                프로젝트 생성 중...
              </>
            ) : (
              '프로젝트 생성 및 에디터 열기'
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}

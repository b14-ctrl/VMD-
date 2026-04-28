'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Loader2, ChevronRight } from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import { SuggestionResult } from '@/lib/types'

interface AISuggestionPanelProps {
  projectId: string
  storeName?: string
  storeArea?: number
  eventDate?: string
  seasonTag?: string
  onClose: () => void
}

export function AISuggestionPanel({
  projectId, storeName, storeArea, eventDate, seasonTag, onClose
}: AISuggestionPanelProps) {
  const [suggestions, setSuggestions] = useState<SuggestionResult[]>([])
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const { setScene, scene } = useEditorStore()

  async function generate(feedbackText?: string) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          storeName,
          storeArea,
          eventDate,
          seasonTag,
          feedback: feedbackText,
          currentRoomWidth: scene.roomWidth,
          currentRoomDepth: scene.roomDepth,
        }),
      })
      if (!res.ok) throw new Error('AI 제안 생성에 실패했습니다')
      const data = await res.json()
      setSuggestions(data.suggestions)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  function applyVariation(suggestion: SuggestionResult) {
    if (suggestion.scene_json) {
      setScene({ ...scene, ...suggestion.scene_json })
    }
    onClose()
  }

  const PALETTE_COLORS = ['bg-red-400', 'bg-pink-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-purple-400', 'bg-gray-400']

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border z-40 flex flex-col shadow-xl"
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-purple-600" />
          <h3 className="font-semibold text-sm">AI 연출 제안</h3>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-accent transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 border-b border-border bg-muted/30">
        <div className="text-xs text-muted-foreground space-y-0.5">
          {storeName && <p>📍 {storeName}</p>}
          {storeArea && <p>📐 {storeArea}m²</p>}
          {eventDate && <p>📅 {eventDate}</p>}
          {seasonTag && <p>🎯 시즌: {seasonTag}</p>}
        </div>
        {suggestions.length === 0 && (
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => generate()}
            disabled={loading}
            className="mt-3 w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {loading ? '생성 중...' : '아이디어 생성하기'}
          </motion.button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}

        {loading && (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Loader2 size={24} className="animate-spin text-purple-600" />
            <p className="text-sm text-muted-foreground">AI가 연출 아이디어를 생성하고 있습니다...</p>
          </div>
        )}

        {suggestions.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="border border-border rounded-xl p-4 hover:border-purple-400 transition-colors cursor-pointer group"
            onClick={() => applyVariation(s)}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-xs text-muted-foreground">바리에이션 {i + 1}</span>
                <h4 className="font-semibold text-sm">{s.title}</h4>
              </div>
              <ChevronRight size={14} className="text-muted-foreground mt-1 group-hover:text-purple-600 transition-colors" />
            </div>
            <p className="text-xs text-muted-foreground mb-3">{s.concept}</p>

            {s.colorPalette && s.colorPalette.length > 0 && (
              <div className="flex gap-1 mb-3">
                {s.colorPalette.map((color, ci) => (
                  <div
                    key={ci}
                    className="w-5 h-5 rounded-full border border-border"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-1">
              {s.props?.slice(0, 4).map((prop, pi) => (
                <span key={pi} className="text-xs bg-muted px-2 py-0.5 rounded-full">{prop}</span>
              ))}
              {s.mannequinCount > 0 && (
                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                  마네킹 {s.mannequinCount}개
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {suggestions.length > 0 && (
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <input
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="예: 좀 더 미니멀하게, 핑크 계열로..."
              className="flex-1 px-3 py-2 border border-border rounded-lg text-xs bg-background focus:outline-none focus:ring-1 focus:ring-purple-500"
              onKeyDown={(e) => { if (e.key === 'Enter' && feedback.trim()) { generate(feedback); setFeedback('') } }}
            />
            <button
              onClick={() => { generate(feedback); setFeedback('') }}
              disabled={loading}
              className="px-3 py-2 bg-purple-600 text-white rounded-lg text-xs disabled:opacity-50"
            >
              재생성
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

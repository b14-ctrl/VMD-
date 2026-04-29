'use client'
import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Loader2, ChevronRight, Info, ImagePlus, Trash2 } from 'lucide-react'
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
  const [isMock, setIsMock] = useState(false)
  const [imageAnalyzed, setImageAnalyzed] = useState(false)
  const [imageStyle, setImageStyle] = useState('')

  // 이미지 업로드 상태
  const [referenceImage, setReferenceImage] = useState<{ base64: string; type: string; preview: string } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { setScene, scene } = useEditorStore()

  function readFileAsBase64(file: File): Promise<{ base64: string; type: string; preview: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        // dataUrl = "data:image/jpeg;base64,XXXX"
        const [header, base64] = dataUrl.split(',')
        const type = header.split(':')[1].split(';')[0]
        resolve({ base64, type, preview: dataUrl })
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function handleFileSelect(file: File) {
    if (!file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) {
      setError('이미지는 5MB 이하만 업로드 가능합니다')
      return
    }
    const result = await readFileAsBase64(file)
    setReferenceImage(result)
    setError('')
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) await handleFileSelect(file)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => setIsDragging(false), [])

  async function generate(feedbackText?: string) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId, storeName, storeArea, eventDate, seasonTag,
          feedback: feedbackText,
          currentRoomWidth: scene.roomWidth,
          currentRoomDepth: scene.roomDepth,
          referenceImageBase64: referenceImage?.base64,
          referenceImageType: referenceImage?.type,
        }),
      })
      if (!res.ok) throw new Error('서버 오류가 발생했습니다')
      const data = await res.json()
      setSuggestions(data.suggestions ?? [])
      setIsMock(!!data.isMock)
      setImageAnalyzed(!!data.imageAnalyzed)
      // imageStyle은 첫 번째 제안에서 추출
      if (data.suggestions?.[0]?.imageStyle) {
        setImageStyle(data.suggestions[0].imageStyle)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  function applyVariation(suggestion: SuggestionResult) {
    if (suggestion.scene_json) {
      setScene({
        ...scene,
        objects: suggestion.scene_json.objects ?? [],
        roomWidth: suggestion.scene_json.roomWidth ?? scene.roomWidth,
        roomDepth: suggestion.scene_json.roomDepth ?? scene.roomDepth,
      })
    }
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border z-40 flex flex-col shadow-xl"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-purple-600" />
          <h3 className="font-semibold text-sm">AI 연출 제안</h3>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-accent transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* 프로젝트 정보 */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="text-xs text-muted-foreground space-y-0.5">
          {storeName && <p>📍 {storeName}</p>}
          {storeArea && <p>📐 {storeArea}m²</p>}
          {eventDate && <p>📅 {eventDate}</p>}
          {seasonTag && <p>🎯 시즌: {seasonTag}</p>}
          {!storeName && !storeArea && !eventDate && (
            <p className="text-amber-600 dark:text-amber-400">프로젝트 정보를 입력하면 더 정확한 제안을 받을 수 있습니다</p>
          )}
        </div>

        {/* 레퍼런스 이미지 업로드 */}
        <div className="mt-3">
          <p className="text-[10px] text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">레퍼런스 이미지 (선택)</p>

          {referenceImage ? (
            <div className="relative rounded-lg overflow-hidden border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={referenceImage.preview} alt="레퍼런스" className="w-full h-28 object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => { setReferenceImage(null); setImageStyle('') }}
                  className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded text-xs"
                >
                  <Trash2 size={11} /> 제거
                </button>
              </div>
              {imageAnalyzed && imageStyle && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                  <p className="text-[10px] text-white truncate">✨ {imageStyle}</p>
                </div>
              )}
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-border hover:border-purple-400 hover:bg-muted/50'
              }`}
            >
              <ImagePlus size={18} className="mx-auto mb-1 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground">
                핀터레스트 스크린샷, VMD 레퍼런스 사진 등<br />
                드래그하거나 클릭해서 업로드 (최대 5MB)
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]) }}
          />
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
            {loading ? '생성 중...' : referenceImage ? '이미지 기반 아이디어 생성' : '아이디어 생성하기'}
          </motion.button>
        )}
      </div>

      {/* 배너들 */}
      <AnimatePresence>
        {isMock && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mx-4 mt-3 flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2.5"
          >
            <Info size={13} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              샘플 제안입니다. <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">.env.local</code>에 <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">ANTHROPIC_API_KEY</code>를 추가하면 AI가 직접 생성합니다.
            </p>
          </motion.div>
        )}

        {imageAnalyzed && imageStyle && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mx-4 mt-2 flex items-start gap-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-2.5"
          >
            <Sparkles size={13} className="text-purple-600 mt-0.5 shrink-0" />
            <p className="text-xs text-purple-700 dark:text-purple-300">
              <span className="font-medium">이미지 분석 완료:</span> {imageStyle}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 제안 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Loader2 size={24} className="animate-spin text-purple-600" />
            <p className="text-sm text-muted-foreground">
              {referenceImage ? '이미지 분석 중...' : '연출 아이디어 생성 중...'}
            </p>
          </div>
        )}

        {suggestions.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="border border-border rounded-xl p-4 hover:border-purple-400 transition-colors cursor-pointer group"
            onClick={() => applyVariation(s)}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-[10px] text-muted-foreground">바리에이션 {i + 1}</span>
                <h4 className="font-semibold text-sm">{s.title}</h4>
              </div>
              <ChevronRight size={14} className="text-muted-foreground mt-1 group-hover:text-purple-600 transition-colors shrink-0" />
            </div>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{s.concept}</p>

            {s.colorPalette?.length > 0 && (
              <div className="flex gap-1.5 mb-3">
                {s.colorPalette.map((color, ci) => (
                  <div key={ci} className="w-5 h-5 rounded-full border border-border shadow-sm" style={{ backgroundColor: color }} title={color} />
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

      {/* 피드백 재생성 */}
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
              className="px-3 py-2 bg-purple-600 text-white rounded-lg text-xs disabled:opacity-50 whitespace-nowrap"
            >
              재생성
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

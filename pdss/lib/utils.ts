import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getStoreSizeLabel(m2?: number): '소형' | '중형' | '대형' | '미입력' {
  if (!m2) return '미입력'
  if (m2 <= 50) return '소형'
  if (m2 <= 150) return '중형'
  return '대형'
}

export function detectSeason(dateStr: string): string {
  const [month, day] = dateStr.split('-').slice(1).map(Number)
  const md = month * 100 + day
  if (md >= 1201 && md <= 1225) return '크리스마스'
  if (md >= 1226 || md <= 120) return '설날·신년'
  if (md >= 201 && md <= 214) return '발렌타인'
  if (md >= 301 && md <= 515) return '봄시즌'
  if (md >= 516 && md <= 731) return '여름'
  if (md >= 801 && md <= 930) return '가을'
  return '겨울'
}

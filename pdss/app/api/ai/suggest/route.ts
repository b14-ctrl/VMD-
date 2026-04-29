import { NextRequest, NextResponse } from 'next/server'

interface RequestBody {
  storeName?: string
  storeArea?: number
  eventDate?: string
  seasonTag?: string
  feedback?: string
  currentRoomWidth?: number
  currentRoomDepth?: number
  referenceImageBase64?: string
  referenceImageType?: string
}

// ─── Mock 데이터 ─────────────────────────────────────────────
function getMockSuggestions(season: string, area: number, name: string, styleHints?: string) {
  const isMinimal = styleHints?.includes('미니멀') || styleHints?.includes('minimal')
  const isColorful = styleHints?.includes('컬러풀') || styleHints?.includes('화려')

  return [
    {
      title: `${season} 포컬 포인트 연출${styleHints ? ' (참고 이미지 반영)' : ''}`,
      concept: '입구 정면에 강렬한 시즌 포컬 포인트를 만들어 시선을 집중시키는 연출',
      description: `${name || '매장'} 중앙 마네킹 그룹을 중심으로 양쪽 행거를 배치해 자연스러운 동선을 유도합니다.`,
      colorPalette: season === '크리스마스' ? ['#C41E3A','#FFD700','#228B22','#FFFFFF'] :
                    season === '발렌타인'  ? ['#FF69B4','#C41E3A','#FFB6C1','#FFFFFF'] :
                    season === '봄시즌'   ? ['#98FB98','#FFB6C1','#87CEEB','#FFFACD'] :
                    isColorful            ? ['#FF6B6B','#FFE66D','#4ECDC4','#45B7D1'] :
                    ['#4A90D9','#F5F5F5','#888888','#333333'],
      props: ['시즌 사이니지', '포인트 조명', '장식 소품', '플로어 러그'],
      mannequinCount: area <= 50 ? 2 : area <= 150 ? 4 : 6,
      zones: ['메인 포컬 존', '사이드 행거 존', '악세서리 선반 존'],
      scene_json: {
        objects: [
          { id: crypto.randomUUID(), type: 'mannequin', name: '마네킹1', position: [-1,0,-1] as [number,number,number], rotation: [0,0.3,0] as [number,number,number], scale: [1,1,1] as [number,number,number], color: '#d4b896' },
          { id: crypto.randomUUID(), type: 'mannequin', name: '마네킹2', position: [1,0,-1] as [number,number,number], rotation: [0,-0.2,0] as [number,number,number], scale: [1,1,1] as [number,number,number], color: '#c8a070' },
          { id: crypto.randomUUID(), type: 'hanger', name: '행거1', position: [-3,0,0] as [number,number,number], rotation: [0,0,0] as [number,number,number], scale: [1,1,1] as [number,number,number], color: '#aaaaaa' },
          { id: crypto.randomUUID(), type: 'hanger', name: '행거2', position: [3,0,0] as [number,number,number], rotation: [0,0,0] as [number,number,number], scale: [1,1,1] as [number,number,number], color: '#aaaaaa' },
          { id: crypto.randomUUID(), type: 'shelf', name: '선반1', position: [3.5,0,-2.5] as [number,number,number], rotation: [0,Math.PI/2,0] as [number,number,number], scale: [1,1,1] as [number,number,number], color: '#c8a882' },
          { id: crypto.randomUUID(), type: 'sign', name: '사이니지', position: [0,1.2,-3] as [number,number,number], rotation: [0,0,0] as [number,number,number], scale: [1,1,1] as [number,number,number], color: '#ffffff' },
          { id: crypto.randomUUID(), type: 'lighting', name: '조명', position: [0,2.6,0] as [number,number,number], rotation: [0,0,0] as [number,number,number], scale: [1,1,1] as [number,number,number], color: '#fffacd' },
        ],
        roomWidth: 10, roomDepth: 8, roomHeight: 3, walls: [],
      },
    },
    {
      title: `${season} ${isMinimal ? '미니멀' : '미니멀 그리드'} 연출`,
      concept: '정갈한 그리드 배치로 제품을 돋보이게 하는 모던 스타일',
      description: '행거와 선반을 격자형으로 배치해 깔끔하고 공간감 있는 연출을 만듭니다.',
      colorPalette: ['#F5F5F5','#333333','#E8E0D8','#C0B8B0'],
      props: ['미니멀 사이니지', '스팟 조명', '우드 소품'],
      mannequinCount: area <= 50 ? 1 : 2,
      zones: ['행거 그리드 존', '선반 디스플레이 존'],
      scene_json: {
        objects: [
          { id: crypto.randomUUID(), type: 'mannequin', name: '마네킹1', position: [0,0,0] as [number,number,number], rotation: [0,0,0] as [number,number,number], scale: [1,1,1] as [number,number,number], color: '#d4b896' },
          { id: crypto.randomUUID(), type: 'hanger', name: '행거1', position: [-2.5,0,1] as [number,number,number], rotation: [0,0,0] as [number,number,number], scale: [1,1,1] as [number,number,number], color: '#888888' },
          { id: crypto.randomUUID(), type: 'hanger', name: '행거2', position: [2.5,0,1] as [number,number,number], rotation: [0,0,0] as [number,number,number], scale: [1,1,1] as [number,number,number], color: '#888888' },
          { id: crypto.randomUUID(), type: 'shelf', name: '선반1', position: [-3.5,0,-2] as [number,number,number], rotation: [0,Math.PI/2,0] as [number,number,number], scale: [1,1,1] as [number,number,number], color: '#c8a882' },
          { id: crypto.randomUUID(), type: 'shelf', name: '선반2', position: [3.5,0,-2] as [number,number,number], rotation: [0,-Math.PI/2,0] as [number,number,number], scale: [1,1,1] as [number,number,number], color: '#c8a882' },
          { id: crypto.randomUUID(), type: 'lighting', name: '조명1', position: [-2,2.6,0] as [number,number,number], rotation: [0,0,0] as [number,number,number], scale: [1,1,1] as [number,number,number], color: '#ffffff' },
          { id: crypto.randomUUID(), type: 'lighting', name: '조명2', position: [2,2.6,0] as [number,number,number], rotation: [0,0,0] as [number,number,number], scale: [1,1,1] as [number,number,number], color: '#ffffff' },
        ],
        roomWidth: 10, roomDepth: 8, roomHeight: 3, walls: [],
      },
    },
    {
      title: `${season} 스토리텔링 존 연출`,
      concept: '입구→중간→후면 3존 구성의 몰입형 팝업',
      description: '고객이 시즌 스토리를 체험하며 이동하도록 3존으로 구성합니다. 각 존마다 포컬 포인트를 설정합니다.',
      colorPalette: season === '크리스마스' ? ['#8B0000','#DAA520','#006400','#F5F5F5'] : ['#E8C5A0','#8B6914','#5C4827','#F0EAE0'],
      props: ['테마 소품 세트', '분위기 조명', '텍스처 러그', '포토존 프레임'],
      mannequinCount: area <= 50 ? 2 : area <= 150 ? 5 : 8,
      zones: ['입구 웰컴 존', '메인 체험 존', '포토 존'],
      scene_json: {
        objects: [
          { id: crypto.randomUUID(), type: 'mannequin', name: '마네킹1', position: [-2,0,-2] as [number,number,number], rotation: [0,0.5,0] as [number,number,number], scale: [1,1,1] as [number,number,number], color: '#d4b896' },
          { id: crypto.randomUUID(), type: 'mannequin', name: '마네킹2', position: [0,0,-2] as [number,number,number], rotation: [0,0,0] as [number,number,number], scale: [1,1,1] as [number,number,number], color: '#c8a070' },
          { id: crypto.randomUUID(), type: 'mannequin', name: '마네킹3', position: [2,0,-2] as [number,number,number], rotation: [0,-0.5,0] as [number,number,number], scale: [1,1,1] as [number,number,number], color: '#bfa080' },
          { id: crypto.randomUUID(), type: 'hanger', name: '행거1', position: [-3.5,0,1] as [number,number,number], rotation: [0,0,0] as [number,number,number], scale: [1,1,1] as [number,number,number], color: '#aaaaaa' },
          { id: crypto.randomUUID(), type: 'hanger', name: '행거2', position: [3.5,0,1] as [number,number,number], rotation: [0,0,0] as [number,number,number], scale: [1,1,1] as [number,number,number], color: '#aaaaaa' },
          { id: crypto.randomUUID(), type: 'prop', name: '소품', position: [0,0,0] as [number,number,number], rotation: [0,0,0] as [number,number,number], scale: [1.2,1.2,1.2] as [number,number,number], color: '#ffcc88' },
          { id: crypto.randomUUID(), type: 'sign', name: '사이니지', position: [0,1.2,-3.5] as [number,number,number], rotation: [0,0,0] as [number,number,number], scale: [1.3,1.3,1.3] as [number,number,number], color: '#fff8ee' },
          { id: crypto.randomUUID(), type: 'lighting', name: '조명1', position: [-2,2.6,-2] as [number,number,number], rotation: [0,0,0] as [number,number,number], scale: [1,1,1] as [number,number,number], color: '#ffe4b5' },
          { id: crypto.randomUUID(), type: 'lighting', name: '조명2', position: [2,2.6,-2] as [number,number,number], rotation: [0,0,0] as [number,number,number], scale: [1,1,1] as [number,number,number], color: '#ffe4b5' },
        ],
        roomWidth: 10, roomDepth: 8, roomHeight: 3, walls: [],
      },
    },
  ]
}

// ─── Vision 분석 프롬프트 ────────────────────────────────────
function buildVisionPrompt(body: RequestBody) {
  return `당신은 패션 리테일 VMD(Visual Merchandising) 전문가입니다.
이 레퍼런스 이미지를 분석하고, 아래 매장 조건에 맞는 팝업 연출 바리에이션 3개를 JSON으로 생성해주세요.

[매장 조건]
- 매장명: ${body.storeName ?? '미입력'}
- 면적: ${body.storeArea ? `${body.storeArea}m²` : '미입력'}
- 날짜: ${body.eventDate ?? '미입력'}
- 시즌: ${body.seasonTag ?? '일반'}
${body.feedback ? `- 추가 요청: ${body.feedback}` : ''}

[이미지 분석 → 제안 반영 방법]
1. 이미지의 컬러 팔레트를 추출해 각 바리에이션에 적용
2. 집기 배치 스타일(미니멀/맥시멀/그리드/포컬)을 파악해 반영
3. 조명 무드, 소품 종류, 마네킹 포즈 스타일을 제안에 반영
4. 이 이미지의 분위기를 "imageStyle" 필드에 한 줄로 요약

JSON 배열로만 응답 (다른 텍스트 없이):
[
  {
    "title": "",
    "concept": "",
    "description": "",
    "imageStyle": "이미지에서 감지된 스타일 한 줄 요약",
    "colorPalette": ["#hex", ...],
    "props": ["소품1", ...],
    "mannequinCount": 숫자,
    "zones": ["존 설명", ...],
    "scene_json": {
      "objects": [
        {"id":"uuid","type":"mannequin|hanger|shelf|lighting|prop|sign","name":"","position":[x,y,z],"rotation":[0,0,0],"scale":[1,1,1],"color":"#hex"}
      ],
      "roomWidth": ${body.currentRoomWidth ?? 10},
      "roomDepth": ${body.currentRoomDepth ?? 8},
      "roomHeight": 3,
      "walls": []
    }
  }
]

Y 위치 기준: mannequin=0, hanger=0, shelf=0, lighting=2.6, prop=0, sign=1.2`
}

function buildTextPrompt(body: RequestBody) {
  const sizeLabel = !body.storeArea ? '미입력'
    : body.storeArea <= 50 ? '소형(~50m²)'
    : body.storeArea <= 150 ? '중형(50~150m²)'
    : '대형(150m²+)'

  return `한국 패션 리테일 VMD 전문가로서 팝업 연출 바리에이션 3개를 JSON으로 생성해주세요.

매장명: ${body.storeName ?? '미입력'}, 면적: ${body.storeArea ? `${body.storeArea}m² (${sizeLabel})` : '미입력'}
날짜: ${body.eventDate ?? '미입력'}, 시즌: ${body.seasonTag ?? '일반'}
${body.feedback ? `추가 요청: ${body.feedback}` : ''}

JSON 배열로만 응답:
[{"title":"","concept":"","description":"","colorPalette":["#hex"],"props":[""],"mannequinCount":숫자,"zones":[""],"scene_json":{"objects":[{"id":"uuid","type":"mannequin|hanger|shelf|lighting|prop|sign","name":"","position":[x,y,z],"rotation":[0,0,0],"scale":[1,1,1],"color":"#hex"}],"roomWidth":${body.currentRoomWidth ?? 10},"roomDepth":${body.currentRoomDepth ?? 8},"roomHeight":3,"walls":[]}}]
Y 기준: mannequin=0,hanger=0,shelf=0,lighting=2.6,prop=0,sign=1.2`
}

// ─── Route Handler ────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body: RequestBody = await req.json()
  const { referenceImageBase64, referenceImageType } = body

  const apiKey = process.env.ANTHROPIC_API_KEY
  const hasApiKey = apiKey && apiKey !== 'your_anthropic_api_key' && apiKey.startsWith('sk-')

  if (!hasApiKey) {
    const suggestions = getMockSuggestions(
      body.seasonTag || '일반',
      body.storeArea || 80,
      body.storeName || '매장',
      body.feedback
    )
    return NextResponse.json({
      suggestions,
      isMock: true,
      imageAnalyzed: false,
      message: 'ANTHROPIC_API_KEY가 없어 샘플 제안을 반환합니다.',
    })
  }

  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const client = new Anthropic({ apiKey })

    let messages: Parameters<typeof client.messages.create>[0]['messages']

    if (referenceImageBase64) {
      // Vision 모드: 이미지 포함
      const mediaType = (referenceImageType || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
      messages = [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: referenceImageBase64 },
          },
          { type: 'text', text: buildVisionPrompt(body) },
        ],
      }]
    } else {
      // 텍스트 모드
      messages = [{ role: 'user', content: buildTextPrompt(body) }]
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages,
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('JSON 파싱 실패')

    const suggestions = JSON.parse(jsonMatch[0])
    return NextResponse.json({ suggestions, imageAnalyzed: !!referenceImageBase64 })

  } catch (err) {
    console.error('AI suggest error:', err)
    const suggestions = getMockSuggestions(body.seasonTag || '일반', body.storeArea || 80, body.storeName || '매장')
    return NextResponse.json({ suggestions, isMock: true, imageAnalyzed: false })
  }
}

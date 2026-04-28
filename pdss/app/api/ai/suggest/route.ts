import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { storeName, storeArea, eventDate, seasonTag, feedback, currentRoomWidth, currentRoomDepth } = await req.json()

  const sizeLabel = !storeArea ? '미입력'
    : storeArea <= 50 ? '소형(~50m²)'
    : storeArea <= 150 ? '중형(50~150m²)'
    : '대형(150m²+)'

  const systemPrompt = `당신은 한국 패션 리테일 VMD(Visual Merchandising) 전문가입니다. 매장 팝업 연출 아이디어를 JSON 형식으로 생성해주세요. 항상 한국어로 응답하세요.`

  const userPrompt = `
다음 조건에 맞는 팝업 연출 바리에이션 3개를 생성해주세요.

**매장 정보:**
- 매장명: ${storeName ?? '미입력'}
- 면적: ${storeArea ? `${storeArea}m² (${sizeLabel})` : '미입력'}
- 팝업 날짜: ${eventDate ?? '미입력'}
- 시즌: ${seasonTag ?? '일반'}
${feedback ? `- 피드백: ${feedback}` : ''}

**응답 형식 (JSON 배열):**
[
  {
    "title": "바리에이션 제목",
    "concept": "한 줄 컨셉 설명",
    "description": "상세 연출 설명 (2-3문장)",
    "colorPalette": ["#hex1", "#hex2", "#hex3"],
    "props": ["소품1", "소품2", "소품3", "소품4"],
    "mannequinCount": 숫자,
    "zones": ["존1 설명", "존2 설명"],
    "scene_json": {
      "objects": [
        {
          "id": "uuid-1",
          "type": "mannequin",
          "name": "마네킹",
          "position": [x, y, z],
          "rotation": [0, 0, 0],
          "scale": [1, 1, 1],
          "color": "#hex"
        }
      ],
      "roomWidth": ${currentRoomWidth ?? 10},
      "roomDepth": ${currentRoomDepth ?? 8},
      "roomHeight": 3,
      "walls": []
    }
  }
]

type 값은 "mannequin", "hanger", "shelf", "lighting", "prop", "sign" 중 하나여야 합니다.
position Y값: mannequin=0.8, hanger=1.6, shelf=0.5, lighting=2.8, prop=0.3, sign=1.5
JSON만 반환하고 다른 텍스트는 포함하지 마세요.`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('AI 응답 파싱 실패')

    const suggestions = JSON.parse(jsonMatch[0])
    return NextResponse.json({ suggestions })
  } catch (err) {
    console.error('AI suggest error:', err)
    return NextResponse.json({ error: 'AI 제안 생성 실패' }, { status: 500 })
  }
}

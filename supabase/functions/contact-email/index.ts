import { corsHeaders } from '../_shared/cors.ts'

interface ContactRequest {
  name: string
  email: string
  subject: string
  message: string
}

Deno.serve(async (req) => {
  console.log('📧 Contact function called:', req.method, req.url)

  // CORS 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 요청 본문 파싱
    const requestData: ContactRequest = await req.json()
    console.log('📧 Contact request data:', requestData)

    // 입력 유효성 검사
    if (!requestData.name || !requestData.email || !requestData.subject || !requestData.message) {
      console.log('❌ Validation failed: missing required fields')
      return new Response(
        JSON.stringify({ error: '모든 필드를 입력해주세요.' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    // 이메일 형식 검증
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(requestData.email)) {
      console.log('❌ Validation failed: invalid email format')
      return new Response(
        JSON.stringify({ error: '올바른 이메일 형식을 입력해주세요.' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    // 이메일 내용 생성
    const emailContent = `
새로운 연락 문의가 도착했습니다.

보낸 사람: ${requestData.name}
이메일: ${requestData.email}
제목: ${requestData.subject}

내용:
${requestData.message}

---
이 메시지는 블로그 연락 폼을 통해 전송되었습니다.
답변 시 발신자 이메일(${requestData.email})로 회신해 주세요.
    `.trim()

    // 개발 환경에서는 콘솔 로그로만 처리
    console.log('📧 새로운 연락 문의:')
    console.log('보낸사람:', requestData.name)
    console.log('이메일:', requestData.email)
    console.log('제목:', requestData.subject)
    console.log('시간:', new Date().toISOString())
    console.log('내용:', requestData.message)
    console.log('전체 이메일 내용:', emailContent)

    // 개발 환경에서 성공으로 처리
    console.log('✅ Contact form processed successfully')

    // 성공 응답
    return new Response(
      JSON.stringify({
        success: true,
        message: '메시지가 성공적으로 전송되었습니다.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('❌ 연락 폼 처리 오류:', error)

    return new Response(
      JSON.stringify({
        error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        details: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
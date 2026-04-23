// 파일 위치: app/api/extract/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const base64Image = body.image; 
    const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

    const prompt = `
      첨부된 영수증/구매내역 이미지를 분석해서 아래 정보를 추출해줘.
      반드시 JSON 형식으로만 대답하고, 다른 설명은 절대 하지 마.
      {
        "orderNumber": "주문번호",
        "recipient": "수취인 이름",
        "phone": "연락처",
        "address": "배송지 주소",
        "amount": "결제 금액",
        "orderDate": "주문 날짜",
        "productInfo": "상품 정보"
      }
    `;

    const apiKey = process.env.GEMINI_API_KEY;

    // 🚀 수정된 부분: 구글의 가장 최신 초고속 모델인 'gemini-2.5-flash-lite'로 이름을 변경했습니다!
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
    
    const requestBody = JSON.stringify({
      contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: "image/jpeg", data: base64Data } }] }]
    });

    let retries = 3;
    let response;
    let data;

    // 503(대기열) 에러가 혹시 나더라도 3번까지 알아서 다시 시도하는 똑똑한 기능
    while (retries > 0) {
      console.log(`==== 구글 서버 문 두드리는 중... (남은 재시도 횟수: ${retries}) ====`);
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody
      });

      data = await response.json();

      if (response.status === 503 || (data.error && data.error.code === 503)) {
        console.log("⚠️ 구글 서버가 바쁘다고 합니다. 1.5초 대기 후 다시 시도합니다...");
        retries--;
        if (retries === 0) break;
        await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        // 503 에러가 아니면 무사히 통과!
        break; 
      }
    }

    if (!response?.ok || data?.error) {
      console.error("🚨 구글 API 최종 에러:", data?.error || response?.status);
      return NextResponse.json({ error: "API 호출 오류: " + (data?.error?.message || "알 수 없는 에러") }, { status: 500 });
    }

    const aiTextResponse = data.candidates[0].content.parts[0].text;
    const cleanJson = aiTextResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);
    
    console.log("🎉 성공적으로 데이터를 추출했습니다!");
    return NextResponse.json({ extractedData: parsedData });

  } catch (error) {
    console.error("🚨🚨 서버 내부 에러 🚨🚨", error);
    return NextResponse.json({ error: "이미지 추출에 실패했습니다." }, { status: 500 });
  }
}
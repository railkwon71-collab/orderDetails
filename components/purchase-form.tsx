'use client'

import { useState } from 'react'
import { ImageUpload } from './image-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Loader2, Sparkles, Send, CheckCircle } from 'lucide-react'

interface ExtractedData {
  orderNumber: string | null
  recipient: string | null
  phone: string | null
  address: string | null
  amount: string | null
  orderDate: string | null
  productInfo: string | null
}

interface ManualData {
  userId: string
  account: string
  productName: string
  option: string
}

export function PurchaseForm() {
  const [image, setImage] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<string | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedData>({
    orderNumber: null,
    recipient: null,
    phone: null,
    address: null,
    amount: null,
    orderDate: null,
    productInfo: null,
  })
  const [manualData, setManualData] = useState<ManualData>({
    userId: '',
    account: '',
    productName: '',
    option: '',
  })

  const handleImageChange = (newImage: string | null, newMediaType: string | null) => {
    setImage(newImage)
    setMediaType(newMediaType)
    setIsSubmitted(false)
    if (!newImage) {
      setExtractedData({
        orderNumber: null,
        recipient: null,
        phone: null,
        address: null,
        amount: null,
        orderDate: null,
        productInfo: null,
      })
    }
  }

  const handleExtract = async () => {
    if (!image) return

    setIsExtracting(true)
    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, mediaType }),
      })

      if (!response.ok) {
        throw new Error('추출 실패')
      }

      const data = await response.json()
      setExtractedData(data.extractedData)
    } catch (error) {
      console.error('추출 오류:', error)
      alert('이미지에서 정보를 추출하는데 실패했습니다.')
    } finally {
      setIsExtracting(false)
    }
  }

  const handleExtractedDataChange = (field: keyof ExtractedData, value: string) => {
    setExtractedData((prev) => ({ ...prev, [field]: value || null }))
  }

  const handleManualDataChange = (field: keyof ManualData, value: string) => {
    setManualData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // 여기서 실제 제출 로직을 구현합니다
    // 현재는 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    console.log('제출된 데이터:', {
      extracted: extractedData,
      manual: manualData,
    })
    
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const hasExtractedData = Object.values(extractedData).some((v) => v !== null)

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground">제출 완료!</h2>
          <p className="text-muted-foreground text-center">
            구매내역이 성공적으로 제출되었습니다.
          </p>
          <Button 
            onClick={() => {
              setIsSubmitted(false)
              setImage(null)
              setMediaType(null)
              setExtractedData({
                orderNumber: null,
                recipient: null,
                phone: null,
                address: null,
                amount: null,
                orderDate: null,
                productInfo: null,
              })
              setManualData({
                userId: '',
                account: '',
                productName: '',
                option: '',
              })
            }}
            className="mt-4"
          >
            새로운 구매내역 제출하기
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 이미지 업로드 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>구매내역 이미지</CardTitle>
          <CardDescription>
            구매내역 캡쳐 이미지를 업로드하면 AI가 자동으로 정보를 추출합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUpload
            image={image}
            onImageChange={handleImageChange}
            isLoading={isExtracting}
          />
          {image && (
            <Button
              type="button"
              onClick={handleExtract}
              disabled={isExtracting}
              className="w-full"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  정보 추출 중...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI로 정보 추출하기
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 추출된 정보 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>추출된 정보</CardTitle>
          <CardDescription>
            이미지에서 추출된 정보입니다. 필요시 수정할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orderNumber">주문번호</Label>
              <Input
                id="orderNumber"
                value={extractedData.orderNumber || ''}
                onChange={(e) => handleExtractedDataChange('orderNumber', e.target.value)}
                placeholder="추출된 주문번호"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderDate">주문 날짜</Label>
              <Input
                id="orderDate"
                value={extractedData.orderDate || ''}
                onChange={(e) => handleExtractedDataChange('orderDate', e.target.value)}
                placeholder="추출된 주문 날짜"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipient">수취인</Label>
              <Input
                id="recipient"
                value={extractedData.recipient || ''}
                onChange={(e) => handleExtractedDataChange('recipient', e.target.value)}
                placeholder="추출된 수취인"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">연락처</Label>
              <Input
                id="phone"
                value={extractedData.phone || ''}
                onChange={(e) => handleExtractedDataChange('phone', e.target.value)}
                placeholder="추출된 연락처"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">주소</Label>
              <Input
                id="address"
                value={extractedData.address || ''}
                onChange={(e) => handleExtractedDataChange('address', e.target.value)}
                placeholder="추출된 주소"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">금액</Label>
              <Input
                id="amount"
                value={extractedData.amount || ''}
                onChange={(e) => handleExtractedDataChange('amount', e.target.value)}
                placeholder="추출된 금액"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productInfo">상품 정보</Label>
              <Input
                id="productInfo"
                value={extractedData.productInfo || ''}
                onChange={(e) => handleExtractedDataChange('productInfo', e.target.value)}
                placeholder="추출된 상품 정보"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* 추가 정보 입력 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>추가 정보 입력</CardTitle>
          <CardDescription>
            이미지에 없는 추가 정보를 직접 입력해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="userId">아이디</Label>
              <Input
                id="userId"
                value={manualData.userId}
                onChange={(e) => handleManualDataChange('userId', e.target.value)}
                placeholder="아이디를 입력하세요"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account">계좌</Label>
              <Input
                id="account"
                value={manualData.account}
                onChange={(e) => handleManualDataChange('account', e.target.value)}
                placeholder="계좌 정보를 입력하세요"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productName">제품명</Label>
              <Input
                id="productName"
                value={manualData.productName}
                onChange={(e) => handleManualDataChange('productName', e.target.value)}
                placeholder="제품명을 입력하세요"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="option">옵션</Label>
              <Input
                id="option"
                value={manualData.option}
                onChange={(e) => handleManualDataChange('option', e.target.value)}
                placeholder="옵션을 입력하세요"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 제출 버튼 */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting || !manualData.userId || !manualData.account || !manualData.productName}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            제출 중...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            구매내역 제출하기
          </>
        )}
      </Button>
    </form>
  )
}

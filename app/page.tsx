import { PurchaseForm } from '@/components/purchase-form'

export default function Home() {
  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            구매내역 정보 추출 및 제출
          </h1>
          <p className="text-muted-foreground">
            구매내역 캡쳐 이미지를 업로드하면 AI가 자동으로 정보를 추출합니다
          </p>
        </div>
        <PurchaseForm />
      </div>
    </main>
  )
}
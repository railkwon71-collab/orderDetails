'use client'

import { useCallback } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageUploadProps {
  image: string | null
  onImageChange: (image: string | null, mediaType: string | null) => void
  isLoading?: boolean
}

export function ImageUpload({ image, onImageChange, isLoading }: ImageUploadProps) {
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Extract base64 data without the prefix
        const base64 = result.split(',')[1]
        onImageChange(base64, file.type)
      }
      reader.readAsDataURL(file)
    },
    [onImageChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files?.[0]
      if (!file || !file.type.startsWith('image/')) return

      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        const base64 = result.split(',')[1]
        onImageChange(base64, file.type)
      }
      reader.readAsDataURL(file)
    },
    [onImageChange]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const handleRemove = useCallback(() => {
    onImageChange(null, null)
  }, [onImageChange])

  if (image) {
    return (
      <div className="relative rounded-lg border border-border overflow-hidden">
        <img
          src={`data:image/png;base64,${image}`}
          alt="업로드된 구매내역"
          className="w-full h-auto max-h-96 object-contain bg-muted"
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2"
          onClick={handleRemove}
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="relative flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-12 text-center transition-colors hover:border-muted-foreground/50 cursor-pointer"
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isLoading}
      />
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <ImageIcon className="h-8 w-8 text-primary" />
      </div>
      <div className="space-y-1">
        <p className="text-lg font-medium text-foreground">
          구매내역 이미지를 업로드하세요
        </p>
        <p className="text-sm text-muted-foreground">
          드래그 앤 드롭 또는 클릭하여 파일 선택
        </p>
      </div>
      <Button type="button" variant="secondary" disabled={isLoading}>
        <Upload className="mr-2 h-4 w-4" />
        파일 선택
      </Button>
    </div>
  )
}

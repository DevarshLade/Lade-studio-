"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react'
import { uploadReviewImages, compressImage } from '@/lib/imageUpload'
import { useUser } from '@clerk/nextjs'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

export interface ImageUploadProps {
  onImagesChange: (imageUrls: string[]) => void
  existingImages?: string[]
  maxImages?: number
  disabled?: boolean
}

export function ImageUpload({ 
  onImagesChange, 
  existingImages = [], 
  maxImages = 5,
  disabled = false 
}: ImageUploadProps): JSX.Element {
  const { isSignedIn: isAuthenticated, user } = useUser()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<string[]>(existingImages)
  const [uploading, setUploading] = useState(false)
  const [previewImages, setPreviewImages] = useState<{ file: File; preview: string }[]>([])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    if (files.length === 0) return

    // Check total image limit
    if (images.length + files.length > maxImages) {
      toast({
        title: "Too many images",
        description: `Maximum ${maxImages} images allowed. You can upload ${maxImages - images.length} more.`,
        variant: "destructive"
      })
      return
    }

    // Validate file types and sizes
    const validFiles: File[] = []
    const invalidFiles: string[] = []
    
    for (const file of files) {
      // Check file type
      if (!file.type.match('image.*')) {
        invalidFiles.push(`${file.name} (invalid file type)`)
        continue
      }
      
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        invalidFiles.push(`${file.name} (file too large - max 5MB)`)
        continue
      }
      
      validFiles.push(file)
    }
    
    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid files detected",
        description: `The following files were rejected: ${invalidFiles.join(', ')}`,
        variant: "destructive"
      })
      
      // If no valid files, return early
      if (validFiles.length === 0) {
        return
      }
    }

    // Create preview URLs
    const newPreviews = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))
    
    setPreviewImages(prev => [...prev, ...newPreviews])

    // Upload images
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload images",
        variant: "destructive"
      })
      return
    }

    setUploading(true)
    
    try {
      // Compress images before upload
      const compressedFiles = await Promise.all(
        validFiles.map(file => compressImage(file, 1200, 0.8))
      )

      // Upload to Supabase
      const { data: uploadedUrls, error } = await uploadReviewImages(
        compressedFiles, 
        user.id,
        { maxImages: maxImages - images.length }
      )

      if (error) {
        throw error
      }

      if (uploadedUrls) {
        const newImages = [...images, ...uploadedUrls]
        setImages(newImages)
        onImagesChange(newImages)
        
        toast({
          title: "Images uploaded successfully",
          description: `${uploadedUrls.length} image(s) uploaded`
        })
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload images",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
      setPreviewImages([])
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onImagesChange(newImages)
  }

  const removePreview = (index: number) => {
    const newPreviews = previewImages.filter((_, i) => i !== index)
    
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(previewImages[index].preview)
    
    setPreviewImages(newPreviews)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="review-images">Product Images (Optional)</Label>
        <div className="flex items-center gap-2">
          <Input
            ref={fileInputRef}
            id="review-images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={disabled || uploading || images.length >= maxImages}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading || images.length >= maxImages}
            className="shrink-0"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Upload images of the delivered product ({images.length}/{maxImages}). Max 5MB per image.
        </p>
      </div>

      {/* Preview uploading images */}
      {previewImages.length > 0 && (
        <div className="space-y-2">
          <Label>Uploading...</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {previewImages.map((preview, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <Image
                    src={preview.preview}
                    alt={`Preview ${index + 1}`}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removePreview(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded images */}
      {images.length > 0 && (
        <div className="space-y-2">
          <Label>Uploaded Images</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={`Review image ${index + 1}`}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
                {!disabled && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && previewImages.length === 0 && (
        <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-2">
            No images uploaded yet
          </p>
          <p className="text-xs text-muted-foreground">
            Click "Upload" to add product images
          </p>
        </div>
      )}
    </div>
  )
}
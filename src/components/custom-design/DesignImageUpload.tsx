'use client'

import React, { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Upload, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { uploadDesignReferenceImages, deleteDesignReferenceImage } from '@/lib/designImageUpload'
import type { DesignImageUploadResult } from '@/lib/designImageUpload'

interface DesignImageUploadProps {
  onImagesChange: (imageUrls: string[]) => void
  existingImages?: string[]
  maxImages?: number
  disabled?: boolean
  customerId: string
}

export function DesignImageUpload({
  onImagesChange,
  existingImages = [],
  maxImages = 10,
  disabled = false,
  customerId
}: DesignImageUploadProps) {
  const [images, setImages] = useState<string[]>(existingImages)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadResults, setUploadResults] = useState<DesignImageUploadResult[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateImages = useCallback((newImages: string[]) => {
    setImages(newImages)
    onImagesChange(newImages)
  }, [onImagesChange])

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || uploading || disabled) return

    const fileArray = Array.from(files)
    const remainingSlots = maxImages - images.length
    
    if (fileArray.length > remainingSlots) {
      alert(`You can only upload ${remainingSlots} more image(s)`)
      return
    }

    setUploading(true)
    setUploadResults([])

    try {
      const { data, error, results } = await uploadDesignReferenceImages(
        fileArray,
        customerId,
        { maxImages }
      )

      setUploadResults(results)

      if (data && data.length > 0) {
        const newImages = [...images, ...data]
        updateImages(newImages)
      }

      if (error) {
        console.error('Upload error:', error)
      }
    } catch (error) {
      console.error('Unexpected upload error:', error)
    } finally {
      setUploading(false)
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = async (index: number) => {
    if (disabled) return
    
    const imageUrl = images[index]
    
    try {
      // Delete from storage
      const { success, error } = await deleteDesignReferenceImage(imageUrl)
      
      if (success) {
        const newImages = images.filter((_, i) => i !== index)
        updateImages(newImages)
      } else {
        console.error('Failed to delete image:', error)
        alert('Failed to delete image. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Failed to delete image. Please try again.')
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (disabled || uploading) return
    
    const files = e.dataTransfer.files
    handleFiles(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const canUploadMore = images.length < maxImages

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {canUploadMore && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />
          
          <div className="flex flex-col items-center space-y-2">
            {uploading ? (
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-gray-400" />
            )}
            
            <div className="text-sm text-gray-600">
              {uploading ? (
                <span>Uploading design references...</span>
              ) : (
                <>
                  <span className="font-medium">Click to upload</span> or drag and drop
                  <br />
                  <span className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB ({images.length}/{maxImages} images)
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Results */}
      {uploadResults.length > 0 && (
        <div className="space-y-2">
          {uploadResults.map((result, index) => (
            <div
              key={index}
              className={`flex items-center space-x-2 p-2 rounded text-sm ${
                result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span>
                {result.fileName}: {result.success ? 'Uploaded successfully' : result.error}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={imageUrl}
                  alt={`Design reference ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                
                {!disabled && (
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Images Summary */}
      <div className="text-sm text-gray-500">
        {images.length === 0
          ? 'No design reference images uploaded yet'
          : `${images.length} design reference image${images.length === 1 ? '' : 's'} uploaded`
        }
        {images.length >= maxImages && (
          <span className="text-amber-600 ml-2">(Maximum reached)</span>
        )}
      </div>
    </div>
  )
}
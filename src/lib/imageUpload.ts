import { supabase } from '@/lib/supabase'

export interface ImageUploadResult {
  data: string | null
  error: Error | null
}

export interface ImageUploadOptions {
  maxSizeInMB?: number
  allowedTypes?: string[]
  maxImages?: number
}

const DEFAULT_OPTIONS: Required<ImageUploadOptions> = {
  maxSizeInMB: 5,
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxImages: 5
}

/**
 * Validate image file before upload
 */
function validateImageFile(file: File, options: Required<ImageUploadOptions>): string | null {
  // Check file type
  if (!options.allowedTypes.includes(file.type)) {
    return `Invalid file type. Allowed types: ${options.allowedTypes.join(', ')}`
  }

  // Check file size
  const maxSizeInBytes = options.maxSizeInMB * 1024 * 1024
  if (file.size > maxSizeInBytes) {
    return `File too large. Maximum size: ${options.maxSizeInMB}MB`
  }

  return null
}

/**
 * Generate unique filename for storage
 */
function generateFileName(originalName: string, userId: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()
  return `${userId}/${timestamp}-${randomString}.${extension}`
}

/**
 * Upload a single image to Supabase storage
 */
export async function uploadReviewImage(
  file: File, 
  userId: string,
  options: ImageUploadOptions = {}
): Promise<ImageUploadResult> {
  try {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options }
    
    // Validate file
    const validationError = validateImageFile(file, mergedOptions)
    if (validationError) {
      return { data: null, error: new Error(validationError) }
    }

    // Generate unique filename
    const fileName = generateFileName(file.name, userId)

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('review-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('review-images')
      .getPublicUrl(fileName)

    return { data: publicUrl, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Upload multiple images to Supabase storage
 */
export async function uploadReviewImages(
  files: File[],
  userId: string,
  options: ImageUploadOptions = {}
): Promise<{ data: string[] | null; error: Error | null; results: ImageUploadResult[] }> {
  try {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

    // Check max images limit
    if (files.length > mergedOptions.maxImages) {
      return {
        data: null,
        error: new Error(`Too many images. Maximum allowed: ${mergedOptions.maxImages}`),
        results: []
      }
    }

    // Upload all files in parallel
    const uploadPromises = files.map(file => uploadReviewImage(file, userId, options))
    const results = await Promise.all(uploadPromises)

    // Check for any errors
    const errors = results.filter(result => result.error)
    if (errors.length > 0) {
      return {
        data: null,
        error: new Error(`${errors.length} upload(s) failed: ${errors[0].error?.message}`),
        results
      }
    }

    // Return successful URLs
    const urls = results.map(result => result.data).filter(Boolean) as string[]
    return { data: urls, error: null, results }
  } catch (error) {
    return { data: null, error: error as Error, results: [] }
  }
}

/**
 * Delete image from Supabase storage
 */
export async function deleteReviewImage(imageUrl: string): Promise<{ error: Error | null }> {
  try {
    // Extract filename from URL
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/')
    const fileName = pathParts[pathParts.length - 1]
    
    // Find the full path by looking for the user folder structure
    const bucketIndex = pathParts.indexOf('review-images')
    if (bucketIndex === -1) {
      throw new Error('Invalid image URL')
    }
    
    const filePath = pathParts.slice(bucketIndex + 1).join('/')

    const { error } = await supabase.storage
      .from('review-images')
      .remove([filePath])

    if (error) {
      throw new Error(`Delete failed: ${error.message}`)
    }

    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

/**
 * Delete multiple images from Supabase storage
 */
export async function deleteReviewImages(imageUrls: string[]): Promise<{ error: Error | null }> {
  try {
    const deletePromises = imageUrls.map(url => deleteReviewImage(url))
    const results = await Promise.all(deletePromises)

    const errors = results.filter(result => result.error)
    if (errors.length > 0) {
      return { error: new Error(`${errors.length} deletion(s) failed`) }
    }

    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

/**
 * Compress image before upload (optional utility)
 */
export function compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            resolve(file) // Fallback to original file
          }
        },
        file.type,
        quality
      )
    }

    img.src = URL.createObjectURL(file)
  })
}
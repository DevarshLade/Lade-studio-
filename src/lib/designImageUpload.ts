import { supabase } from '@/lib/supabase'
import { compressImage } from '@/lib/imageUpload'

export interface DesignImageUploadOptions {
  maxImages?: number
  maxWidth?: number
  quality?: number
}

export interface DesignImageUploadResult {
  success: boolean
  url?: string
  fileName?: string
  error?: string
}

// Upload design reference images
export async function uploadDesignReferenceImages(
  files: File[],
  customerId: string,
  options: DesignImageUploadOptions = {}
): Promise<{ data: string[] | null; error: Error | null; results: DesignImageUploadResult[] }> {
  const {
    maxImages = 10,
    maxWidth = 1200,
    quality = 0.8
  } = options

  if (files.length === 0) {
    return { data: [], error: null, results: [] }
  }

  if (files.length > maxImages) {
    return {
      data: null,
      error: new Error(`Maximum ${maxImages} images allowed`),
      results: []
    }
  }

  const results: DesignImageUploadResult[] = []
  const uploadedUrls: string[] = []

  try {
    for (const file of files) {
      try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          results.push({
            success: false,
            fileName: file.name,
            error: 'File must be an image'
          })
          continue
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          results.push({
            success: false,
            fileName: file.name,
            error: 'File size must be less than 10MB'
          })
          continue
        }

        // Compress image
        const compressedFile = await compressImage(file, maxWidth, quality)

        // Generate unique file name
        const fileExt = file.name.split('.').pop()
        const fileName = `${customerId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('design-references')
          .upload(fileName, compressedFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          console.error('Error uploading design reference image:', error)
          results.push({
            success: false,
            fileName: file.name,
            error: error.message
          })
          continue
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('design-references')
          .getPublicUrl(fileName)

        if (publicUrlData?.publicUrl) {
          uploadedUrls.push(publicUrlData.publicUrl)
          results.push({
            success: true,
            url: publicUrlData.publicUrl,
            fileName: file.name
          })
        } else {
          results.push({
            success: false,
            fileName: file.name,
            error: 'Failed to get public URL'
          })
        }
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError)
        results.push({
          success: false,
          fileName: file.name,
          error: fileError instanceof Error ? fileError.message : 'Unknown error'
        })
      }
    }

    const successfulUploads = results.filter(r => r.success)
    if (successfulUploads.length === 0) {
      return {
        data: null,
        error: new Error('No images were uploaded successfully'),
        results
      }
    }

    return { data: uploadedUrls, error: null, results }
  } catch (error) {
    console.error('Unexpected error uploading design reference images:', error)
    return {
      data: null,
      error: error as Error,
      results
    }
  }
}

// Delete design reference image
export async function deleteDesignReferenceImage(
  imageUrl: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Extract file path from URL
    const url = new URL(imageUrl)
    const pathSegments = url.pathname.split('/')
    const fileName = pathSegments[pathSegments.length - 1]
    const folderPath = pathSegments[pathSegments.length - 2]
    const filePath = `${folderPath}/${fileName}`

    const { error } = await supabase.storage
      .from('design-references')
      .remove([filePath])

    if (error) {
      console.error('Error deleting design reference image:', error)
      return { success: false, error: new Error(error.message) }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error deleting design reference image:', error)
    return { success: false, error: error as Error }
  }
}

// Get signed URL for design reference image (for private access)
export async function getDesignReferenceImageSignedUrl(
  imagePath: string,
  expiresIn: number = 3600 // 1 hour by default
): Promise<{ data: string | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.storage
      .from('design-references')
      .createSignedUrl(imagePath, expiresIn)

    if (error) {
      console.error('Error creating signed URL for design reference image:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: data.signedUrl, error: null }
  } catch (error) {
    console.error('Unexpected error creating signed URL:', error)
    return { data: null, error: error as Error }
  }
}
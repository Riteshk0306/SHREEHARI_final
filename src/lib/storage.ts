import { supabase, isSupabaseConfigured } from './supabase';

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  format?: 'image/webp' | 'image/jpeg';
}

/**
 * Compresses and optimizes an image file before upload.
 * - Resizes large images (default max: 1200x1200px)
 * - Converts to high-efficiency WebP format
 * - Reduces file size by 70%-90% while maintaining crisp visual quality
 */
export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    format = 'image/webp'
  } = options;

  // If not an image or SVG/GIF, return original
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onerror = () => {
      console.warn('Image compression failed to read file. Using original.');
      resolve(file);
    };

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => {
        console.warn('Image compression failed to load element. Using original.');
        resolve(file);
      };

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        // Enable high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to compressed blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            // If compressed blob is somehow larger than original, keep original
            if (blob.size >= file.size && file.type === format) {
              resolve(file);
              return;
            }

            const extension = format === 'image/webp' ? 'webp' : 'jpg';
            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const cleanName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
            const compressedFile = new File([blob], `${cleanName}.${extension}`, {
              type: format,
              lastModified: Date.now(),
            });

            const originalKB = (file.size / 1024).toFixed(1);
            const compressedKB = (compressedFile.size / 1024).toFixed(1);
            const reduction = (((file.size - compressedFile.size) / file.size) * 100).toFixed(1);
            console.log(`[Image Optimization] ${file.name}: ${originalKB}KB -> ${compressedKB}KB (${reduction}% smaller)`);

            resolve(compressedFile);
          },
          format,
          quality
        );
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Automatically compresses a product image and uploads it to Supabase Storage 'product-images' bucket.
 * Returns the public CDN URL.
 */
export async function uploadProductImage(file: File): Promise<string> {
  // Step 1: Compress the image securely
  const compressedFile = await compressImage(file, {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.8,
    format: 'image/webp'
  });



  // Step 2: Upload compressed WebP to Supabase Storage
  const fileExt = compressedFile.name.split('.').pop() || 'webp';
  const fileName = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, compressedFile, {
      cacheControl: '31536000', // 1 year cache for static product images
      upsert: true,
      contentType: compressedFile.type || 'image/webp'
    });

  if (uploadError) {
    console.error('Failed to upload compressed image to Supabase Storage:', uploadError);
    throw uploadError;
  }

  // Step 3: Get and return Public CDN URL
  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * Automatically compresses and uploads a user profile avatar to Supabase Storage.
 */
export async function uploadProfileAvatar(file: File, userId: string): Promise<string> {
  const compressedFile = await compressImage(file, {
    maxWidth: 500,
    maxHeight: 500,
    quality: 0.85,
    format: 'image/webp'
  });



  const fileExt = compressedFile.name.split('.').pop() || 'webp';
  const filePath = `avatars/${userId}_${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('profile-avatars')
    .upload(filePath, compressedFile, {
      cacheControl: '31536000',
      upsert: true,
      contentType: compressedFile.type || 'image/webp'
    });

  if (uploadError) {
    console.error('Failed to upload avatar to Supabase Storage:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('profile-avatars')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * Uploads an invoice PDF Blob to Supabase Storage in the 'invoices' bucket
 * and returns the public CDN URL.
 */
export async function uploadInvoicePdf(pdfBlob: Blob, invoiceNumber: string): Promise<string> {
  const cleanNumber = (invoiceNumber || `INV_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_');
  const filePath = `invoices/Invoice_${cleanNumber}.pdf`;

  if (!isSupabaseConfigured()) {
    console.log('[Storage] Supabase not configured; returning local blob URL for invoice PDF.');
    return URL.createObjectURL(pdfBlob);
  }

  try {
    const { error: uploadError } = await supabase.storage
      .from('invoices')
      .upload(filePath, pdfBlob, {
        cacheControl: '31536000',
        upsert: true,
        contentType: 'application/pdf'
      });

    if (uploadError) {
      console.warn('Failed to upload invoice to Supabase Storage, using fallback:', uploadError);
      return URL.createObjectURL(pdfBlob);
    }

    const { data } = supabase.storage
      .from('invoices')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.error('Error uploading invoice PDF:', err);
    return URL.createObjectURL(pdfBlob);
  }
}


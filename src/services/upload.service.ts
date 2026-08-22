import { api, getErrorMessage } from './api';
import { API_CONFIG } from '../constants';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../types';

export interface ValidationError {
  valid: false;
  error: string;
}

export interface ValidationSuccess {
  valid: true;
}

export type ValidationResult = ValidationError | ValidationSuccess;

export interface UploadResponse {
  id: string;
  storageUrl: string;
  conversationId: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

/**
 * Validates a file before upload
 */
export function validateFile(file: File): ValidationResult {
  // Check file type
  const isAllowed = (ALLOWED_FILE_TYPES as readonly string[]).includes(file.type);
  if (!isAllowed) {
    return {
      valid: false,
      error: 'Invalid file type. Allowed: Images, PDF, DOCX',
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / 1024 / 1024;
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSizeMB}MB`,
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty',
    };
  }

  return { valid: true };
}

/**
 * Uploads a file to the server
 */
export async function uploadAttachment(
  file: File,
  conversationId: string,
  onProgress?: (progress: number) => void
): Promise<{ url: string; attachmentId: string }> {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('conversationId', conversationId);

  try {
    const response = await api.post<UploadResponse>(
      '/attachments/upload',
      formData,
      {
        headers: {
          'Content-Type': undefined,
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      }
    );

    if (!response.data?.storageUrl || !response.data?.id) {
      throw new Error('Invalid response from server: missing storageUrl or id');
    }

    const serverUrl = API_CONFIG.BASE_URL.replace(/\/api\/?$/, '');
    const fullUrl = response.data.storageUrl.startsWith('http')
      ? response.data.storageUrl
      : `${serverUrl}${response.data.storageUrl}`;

    return {
      url: fullUrl,
      attachmentId: response.data.id,
    };
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    throw new Error(`Upload failed: ${errorMessage}`);
  }
}

/**
 * Formats file size to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

import { api, getErrorMessage } from './api';
import { API_CONFIG } from '@/constants';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/types';

/**
 * Validation result types
 */
export interface ValidationError {
    valid: false;
    error: string;
}

export interface ValidationSuccess {
    valid: true;
}

export type ValidationResult = ValidationError | ValidationSuccess;

/**
 * Upload response from backend
 */
export interface UploadResponse {
    id: string;
    storageUrl: string;
    conversationId: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
}

/**
 * Validates a file (image or document) before upload
 * @param file - The file to validate
 * @returns Validation result with error message if invalid
 */
export function validateFile(file: File): ValidationResult {
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type as any)) {
        return {
            valid: false,
            error: `Invalid file type. Allowed: Images, PDF, DOCX`,
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
 * @param file - The file to upload
 * @param conversationId - The conversation ID for the upload 
 * @param onProgress - Optional callback for upload progress (0-100)
 * @returns Promise resolving to the uploaded file URL and attachment ID
 * @throws Error if upload fails
 */
export async function uploadAttachment(
    file: File,
    conversationId: string,
    onProgress?: (progress: number) => void
): Promise<{ url: string; attachmentId: string }> {
    // Validate first
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
                // Let browser set Content-Type with boundary
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

        // Backend returns Attachment entity with { id, storageUrl, ... }
        if (!response.data?.storageUrl || !response.data?.id) {
            throw new Error('Invalid response from server: missing storageUrl or id');
        }

        // Convert relative path to full URL
        // Remove '/api' suffix if present to get the root server URL
        // Example: http://localhost:3001/api -> http://localhost:3001
        const serverUrl = API_CONFIG.BASE_URL.replace(/\/api\/?$/, '');

        const fullUrl = response.data.storageUrl.startsWith('http')
            ? response.data.storageUrl
            : `${serverUrl}${response.data.storageUrl}`;

        return {
            url: fullUrl,
            attachmentId: response.data.id
        };
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(`Upload failed: ${errorMessage}`);
    }
}

/**
 * Formats file size to human-readable string
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
